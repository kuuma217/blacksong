/**
 * 灵山胜境九大景点数据源（2026-10-19 依据园区新版全域地图整理）
 *
 * 用途：
 * 1. 路线编排：routes.js 的基础路线、routePlanner.js 的智能体提示词都从这里取景点，
 *    保证「图上有的点」「时间轴上的站」「智能体能选的站」三者完全一致；
 * 2. 地图可视化：RoutePanel 用 x / y 百分比把站点、路线、当前位置钉在新版地图上；
 * 3. 行程信息：stay（建议停留）与 note（现场提示）直接展示在时间轴与数字人建议里。
 *
 * 坐标说明：
 * - 底图为 public/assets/scenic-map.webp（原图裁掉四周 UI 残留后 987×552）；
 * - x / y 均为相对该底图的百分比（左上角 0,0），因此换尺寸 / 换屏都不需要重新量；
 * - 锚点取各景点主体建筑中心，而非图上标签胶囊，避免编号与标签重叠。
 *
 * order 是推荐环线顺序（入口照壁 → 西侧湖景 → 中轴梵宫 → 东侧寺院 → 大佛 → 坛城 → 餐饮），
 * 供智能体排序时参考，不强制覆盖用户的主题路线。
 */

export const MAP_WIDTH = 987;
export const MAP_HEIGHT = 552;

export const scenicSpots = [
  {
    id: "zhaobi",
    name: "灵山照壁",
    en: "Screen Wall",
    order: 1,
    category: "佛教文化",
    x: 57.55,
    y: 94.2,
    stay: 15,
    tagline: "入园第一景",
    intro: "入口处的巨型照壁，正面题写「灵山胜境」，是入园合影、确认当日演出时刻的第一站。",
    highlights: ["入园合影", "题字照壁", "当日公告"],
    bestFor: ["文化祈福", "摄影打卡"],
    note: "此处人流集中，建议先在此确认当日演出时刻表，再决定后续顺序。",
    aliases: ["照壁", "灵山照壁", "Screen Wall"]
  },
  {
    id: "xiangshui",
    name: "香水海",
    en: "Xiangshui Lake",
    order: 2,
    category: "自然景观",
    x: 31.91,
    y: 84.42,
    stay: 25,
    tagline: "环湖步道，山影入水",
    intro: "景区中心湖面，晴天可拍到梵宫、五印坛城与山峦的完整倒影，环湖步道平缓好走。",
    highlights: ["湖面倒影", "环湖步道", "远眺山峦"],
    bestFor: ["自然风光", "摄影打卡"],
    note: "湖边风大，秋冬建议加一件外套；日落前 1 小时光线最好。",
    aliases: ["香水海", "湖面", "Xiangshui Lake", "Xiangshui Sea"]
  },
  {
    id: "jiulong",
    name: "九龙灌浴",
    en: "Nine Dragons Bathing",
    order: 3,
    category: "佛教文化",
    x: 34.65,
    y: 77.9,
    stay: 30,
    tagline: "花开见佛，九龙喷泉",
    intro: "大型音乐动态群雕，莲花绽放、九龙喷水沐浴太子像，是灵山最生动的动态景观。",
    highlights: ["莲花绽放", "九龙喷水", "音乐喷泉"],
    bestFor: ["文化祈福", "亲子游", "摄影打卡"],
    note: "演出有固定场次（以景区当日公告为准），前排观演区容易被水雾打湿。",
    aliases: ["九龙", "九龙灌浴", "Nine Dragons", "Nine Dragons Bathing"]
  },
  {
    id: "fangong",
    name: "梵宫",
    en: "Brahma Palace",
    order: 4,
    category: "主题建筑",
    x: 48.13,
    y: 44.93,
    stay: 60,
    tagline: "东方佛教艺术殿堂",
    intro: "穹顶、琉璃、东阳木雕与飞天壁画汇聚一堂，是灵山最具震撼力的室内艺术空间。",
    highlights: ["穹顶飞天", "琉璃巨制", "《灵山吉祥颂》"],
    bestFor: ["文化祈福", "摄影打卡", "亲子游"],
    note: "演出场次以景区当日公告为准，建议提前 15 分钟入场；殿内请保持安静。",
    aliases: ["梵宫", "灵山梵宫", "Brahma Palace"]
  },
  {
    id: "xiangfu",
    name: "祥符禅寺",
    en: "Xiangfu Temple",
    order: 5,
    category: "佛教文化",
    x: 77.51,
    y: 32.25,
    stay: 45,
    tagline: "千年古刹，晨钟暮鼓",
    intro: "始于唐代的古刹，玄奘法师曾赐名小灵山，寺院中轴、古树与石阶保存完整。",
    highlights: ["古刹中轴", "千年银杏", "钟鼓楼"],
    bestFor: ["文化祈福"],
    note: "殿内请保持安静，着装避免过于暴露；香烛请在指定区域燃放。",
    aliases: ["祥符寺", "祥符禅寺", "Xiangfu Temple"]
  },
  {
    id: "dafo",
    name: "灵山大佛",
    en: "Lingshan Grand Buddha",
    order: 6,
    category: "佛教文化",
    x: 78.01,
    y: 13.59,
    stay: 60,
    tagline: "88 米青铜立佛，灵山地标",
    intro: "沿 218 级登云道而上，在 88 米青铜立佛前抱佛脚、俯瞰太湖与群山，是灵山最庄重的一站。",
    highlights: ["抱佛脚", "登云道", "太湖远眺"],
    bestFor: ["文化祈福", "摄影打卡"],
    note: "台阶较多，体力有限可乘观光车至大佛平台，再步行最后一段。",
    aliases: ["大佛", "灵山大佛", "Grand Buddha", "Lingshan Grand Buddha"]
  },
  {
    id: "wuyin",
    name: "五印坛城",
    en: "Five Mudra Mandala",
    order: 7,
    category: "主题建筑",
    x: 86.12,
    y: 72.46,
    stay: 45,
    tagline: "藏式坛城，转经祈福",
    intro: "藏式风格建筑群，金顶、彩绘与转经廊展现藏传佛教艺术，可顺时针转经祈福。",
    highlights: ["金顶", "转经廊", "唐卡彩绘"],
    bestFor: ["文化祈福", "摄影打卡"],
    note: "转经请顺时针行走；殿内部分区域禁止拍照。",
    aliases: ["坛城", "五印坛城", "Five Mudra Mandala", "Mandala"]
  },
  {
    id: "baizi",
    name: "百子戏弥勒",
    en: "Hundred Children Maitreya",
    order: 8,
    category: "休闲体验",
    x: 60.99,
    y: 63.04,
    stay: 20,
    tagline: "百子环绕的欢喜弥勒",
    intro: "大型铜雕，弥勒含笑而坐，一百个孩童攀爬嬉戏，是亲子游客最爱的合影点。",
    highlights: ["百子铜雕", "亲子合影", "吉祥寓意"],
    bestFor: ["亲子游"],
    note: "铜像表面光滑，儿童攀爬时请看护好，避免滑倒。",
    aliases: ["弥勒", "百子弥勒", "百子戏弥勒", "Hundred Children Maitreya"]
  },
  {
    id: "shushi",
    name: "灵山蔬食馆",
    en: "Lingshan Vegetarian Restaurant",
    order: 9,
    category: "餐饮服务",
    x: 85.61,
    y: 94.57,
    stay: 60,
    tagline: "灵山素斋体验",
    intro: "景区内的素食餐厅，以时令蔬食与豆制品为主，适合安排为正午用餐与中途休息。",
    highlights: ["素斋套餐", "室内休息", "团队餐位"],
    bestFor: ["亲子游", "文化祈福"],
    note: "11:30–13:00 为用餐高峰，团队游客建议提前预约餐位。",
    aliases: ["蔬食馆", "素斋", "灵山蔬食馆", "Vegetarian", "Vegetarian Restaurant"]
  }
];

export const scenicSpotNames = scenicSpots.map((spot) => spot.name);

const normalize = (value) => String(value || "")
  .toLowerCase()
  .replace(/[\s·・—–_\-（）()「」【】\[\]]/g, "")
  .replace(/景区|广场|景点/g, "");

const aliasIndex = new Map();
scenicSpots.forEach((spot) => {
  [spot.name, spot.en, ...spot.aliases].forEach((alias) => {
    const key = normalize(alias);
    if (key && !aliasIndex.has(key)) aliasIndex.set(key, spot);
  });
});

/**
 * 按名称 / 英文名 / 别名查景点，供时间轴与地图对齐
 * 智能体偶尔会补「景区」「广场」等后缀，这里做一次包含匹配兜底
 */
export function findSpot(name) {
  const key = normalize(name);
  if (!key) return null;
  const exact = aliasIndex.get(key);
  if (exact) return exact;
  if (key.length < 2) return null;
  for (const [alias, spot] of aliasIndex) {
    if (alias.length >= 2 && (key.includes(alias) || alias.includes(key))) return spot;
  }
  return null;
}

export const canonicalSpotName = (name) => {
  const spot = findSpot(name);
  return spot ? spot.name : "";
};

// 智能体提示词里的景点清单：类别 + 建议停留 + 一句话看点，避免模型凭空编景点
export const spotBriefLines = scenicSpots
  .slice()
  .sort((a, b) => a.order - b.order)
  .map((spot) => `${spot.order}. ${spot.name}（${spot.category} · 建议停留 ${spot.stay} 分钟 · ${spot.tagline}）`);
