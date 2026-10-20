/**
 * 路线规划器：优先交给大模型（OpenAI 兼容接口，默认智谱 GLM）生成，失败或未配置 Key 时退回本地规则
 *
 * 设计目标：
 * - 界面只认一个结果对象（契约 3.2 的 route），不关心来自 AI 还是本地规则；
 * - AI 返回的任何字段都先校验，缺的用本地结果补齐，因此 RoutePanel 永远不会拿到半成品；
 * - 没有 API Key（演示/离线）时不会报错，静默降级到 personalizeRoute，功能照常可用。
 */

import { callAgent, isAgentAvailable } from "./agentConfig.js";
import { buildRouteSelection, itineraryOptions, personalizeRoute } from "./routes.js";
import { findSpot, spotBriefLines } from "./scenicSpots.js";

// 智能体可编排的景点池来自新版全域地图的九大景点，
// 与 routes.js 的站点、RoutePanel 的地图锚点是同一份数据，保证「说过的地方图上都有」
const SPOT_BRIEF = spotBriefLines.join("\n");
// 图上九个景点的顺路环线（入口照壁 → 西侧湖景 → 中轴梵宫 → 东侧寺院 → 大佛 → 坛城 → 餐饮）
const LOOP_HINT = "灵山照壁 → 香水海 → 九龙灌浴 → 梵宫 → 祥符禅寺 → 灵山大佛 → 五印坛城 → 百子戏弥勒 → 灵山蔬食馆";

// 免费模型（GLM-4-Flash 等）首字偶有 10s+ 的冷启动，留足余量再降级
const AI_TIMEOUT = 20000;

const labelOf = (group, value) => {
  const matched = itineraryOptions[group].find((item) => item.value === value);
  return matched ? matched.label : "";
};

const withTimeout = (promise, ms) => Promise.race([
  promise,
  new Promise((_, reject) => {
    window.setTimeout(() => reject(new Error("智能体响应超时")), ms);
  })
]);

/**
 * 本地规则生成：chooseRoute 定路线键，personalizeRoute 按四项约束算站点与时刻
 * @param {Object} input - { routeKey, constraints, title }
 * @returns {Object} route 对象（契约 3.2）
 */
export function localPlan({ routeKey, constraints, title }) {
  const key = routeKey || buildRouteSelection(constraints).routeKey;
  const route = personalizeRoute(key, constraints);
  return title ? { ...route, title } : route;
}

const buildPrompt = ({ themeLabel, constraints, focus }) => {
  const interests = (constraints.interests || []).join("、") || "不限定";
  return [
    "你是灵山胜境的路线规划助手，请按下面的约束编排一条可执行的游览路线。",
    `主题：${themeLabel || "自定义"}`,
    `游玩时长：${labelOf("duration", constraints.duration) || "1日游"}`,
    `兴趣偏好：${interests}`,
    `人均预算：${labelOf("budget", constraints.budget) || "不限"}`,
    `游览节奏：${labelOf("pace", constraints.pace) || "适中"}`,
    focus ? `必须包含并重点安排：${focus}` : "",
    "可编排景点（仅限以下九个，名称必须原样使用）：",
    SPOT_BRIEF,
    `顺路参考环线：${LOOP_HINT}。请按环线就近串联，避免来回折返。`,
    "编排规则：",
    "1. 单日 4–6 站，多日行程每天 3–4 站，同一天内不要重复景点；",
    "2. 若行程跨过午饭时间，把「灵山蔬食馆」安排在 11:30–13:00，并减少其后一站；",
    "3. 每站说明要写具体看点（不超过 24 字），不要写“自由活动”这类空话；",
    "4. 时间从 09:00 起递增，同日不超过 17:30；多日行程在 steps 第 4 项标注天数（1 起）。",
    "只输出 JSON，不要解释、不要代码块标记，格式如下：",
    '{"title":"不超过14字","reason":"一句话推荐理由","days":1,"distance":"5.2km","comfort":92,',
    '"steps":[["景点名","一句话说明","09:00",1],["景点名","一句话说明","10:20",1]]}'
  ].filter(Boolean).join("\n");
};

const parseJson = (text) => {
  if (typeof text !== "string" || !text.trim()) return null;
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    return JSON.parse(text.slice(start, end + 1));
  } catch {
    return null;
  }
};

const TIME_PATTERN = /^([01]?\d|2[0-3])[:：]([0-5]\d)$/;

// 把智能体返回的站点数组规整成契约要求的四元组 [名称, 描述, "HH:mm", 第几天]
// 站名一律映射回 scenicSpots 的九个标准名称：
// - 模型写「大佛」「灵山大佛景区」也能落到图上同一个锚点；
// - 编造的景点（图上没有）直接丢弃，避免时间轴出现定位不到的空节点；
// - 同一景点重复出现时只保留第一次，防止路线在地图上折返打结。
const normalizeSteps = (raw) => {
  if (!Array.isArray(raw)) return [];
  const steps = [];
  const seen = new Set();
  raw.forEach((item) => {
    if (!Array.isArray(item)) return;
    const rawName = typeof item[0] === "string" ? item[0].trim() : "";
    if (!rawName) return;
    const spot = findSpot(rawName);
    if (!spot || seen.has(spot.id)) return;
    seen.add(spot.id);
    const description = typeof item[1] === "string" ? item[1].trim() : spot.tagline;
    const timeMatch = TIME_PATTERN.exec(String(item[2] || ""));
    const time = timeMatch ? `${timeMatch[1].padStart(2, "0")}:${timeMatch[2]}` : "";
    const day = Number(item[3]) >= 1 ? Math.round(Number(item[3])) : 1;
    steps.push([spot.name, description, time || "09:00", day]);
  });
  return steps;
};

// 智能体结果与本地结果合并：字段级校验，任何不合格项都退回本地值
const mergeAiRoute = (base, ai) => {
  const steps = normalizeSteps(ai.steps);
  if (steps.length < 3) return null;
  const days = Math.max(base.days || 1, ...steps.map((step) => step[3]));
  const comfort = Number(ai.comfort);
  return {
    ...base,
    title: typeof ai.title === "string" && ai.title.trim() ? ai.title.trim().slice(0, 24) : base.title,
    reason: typeof ai.reason === "string" && ai.reason.trim() ? ai.reason.trim().slice(0, 120) : base.reason,
    days,
    distance: typeof ai.distance === "string" && /km/i.test(ai.distance) ? ai.distance.trim() : base.distance,
    comfort: Number.isFinite(comfort) ? Math.min(99, Math.max(80, Math.round(comfort))) : base.comfort,
    steps
  };
};

/**
 * 生成一条路线
 *
 * @param {Object} input
 * @param {string} [input.guideKey]  当前数字人（决定智能体人设）
 * @param {string} [input.themeLabel] 主题名（写进提示词）
 * @param {string} [input.routeKey]  基础路线键；缺省时由 constraints 推导
 * @param {Object} input.constraints duration / interests / budget / pace
 * @param {string} [input.focus]     重点景点
 * @param {string} [input.title]     强制标题（如卡片上印的「灵山大佛 · 祈福之旅」）
 * @returns {Promise<{route: Object, source: "ai"|"local", note: string}>}
 */
export async function planRoute({
  guideKey = "xiaoling",
  themeLabel = "",
  routeKey,
  constraints = {},
  focus = "",
  title = ""
} = {}) {
  const base = localPlan({ routeKey, constraints, title });

  if (!isAgentAvailable()) {
    return { route: base, source: "local", note: "未配置智能体 Key，已按本地规则生成" };
  }

  try {
    // tools: false —— 这里只要一段 JSON，不挂工具调用，避免模型返回 tool_calls 而拿不到正文
    const reply = await withTimeout(
      callAgent(guideKey, buildPrompt({ themeLabel, constraints, focus }), [], { tools: false }),
      AI_TIMEOUT
    );
    if (!reply || reply.fallback) {
      return { route: base, source: "local", note: reply?.message || "智能体暂不可用，已按本地规则生成" };
    }
    const parsed = parseJson(reply.content);
    const merged = parsed ? mergeAiRoute(base, parsed) : null;
    if (!merged) {
      return { route: base, source: "local", note: "智能体返回格式不完整，已按本地规则生成" };
    }
    return { route: merged, source: "ai", note: "已由 AI 智能体生成" };
  } catch (error) {
    return { route: base, source: "local", note: `智能体调用失败（${error.message}），已按本地规则生成` };
  }
}
