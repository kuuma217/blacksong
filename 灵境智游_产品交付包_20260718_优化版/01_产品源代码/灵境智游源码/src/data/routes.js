import { canonicalSpotName, findSpot } from "./scenicSpots.js";

// 站点名统一走 scenicSpots 归一化：图上九个景点是唯一事实来源，
// 基础路线、备选站点、智能体返回的站名都会被校正到同一套名称，地图才能精确定位。
// 英文路线保留英文站名（地图通过 en 别名匹配），只把中文别名校正为标准写法。
const step = (name, description) => [
  /[A-Za-z]/.test(name) ? name : (canonicalSpotName(name) || name),
  description
];

export const routeCatalog = {
  photo: {
    title: "大学生拍照打卡路线",
    reason: "年轻人 · 摄影打卡 · 4小时 · 活力充沛",
    duration: "4小时",
    distance: "5.2km",
    comfort: 92,
    steps: [
      step("灵山照壁", "入园第一景，湖光与照壁同框"),
      step("九龙灌浴", "水幕与光影，抓拍莲花绽放瞬间"),
      step("梵宫", "穹顶、琉璃与飞天的室内机位"),
      step("灵山大佛", "午后柔光下的人物与大佛合影"),
      step("五印坛城", "金顶彩绘层次丰富，适合广角收尾")
    ]
  },
  culture: {
    title: "青少年文化探索路线",
    reason: "青少年 · 历史文化 · 4小时 · 正常步行",
    duration: "4小时",
    distance: "4.6km",
    comfort: 90,
    steps: [
      step("灵山照壁", "从题字进入灵山的文化序章"),
      step("九龙灌浴", "读懂“花开见佛”的动态叙事"),
      step("梵宫", "在穹顶与琉璃艺术中读懂佛教中国化"),
      step("祥符禅寺", "千年古刹的沿革与晨钟暮鼓"),
      step("灵山大佛", "登云道而上，完成文化知识挑战")
    ]
  },
  nature: {
    title: "灵山山水自然路线",
    reason: "自然风光 · 湖光山色 · 舒缓步行",
    duration: "4小时",
    distance: "4.8km",
    comfort: 93,
    steps: [
      step("灵山照壁", "入口集合，先把步伐放慢"),
      step("香水海", "环湖步道，看山影与湖光"),
      step("九龙灌浴", "水幕与光影是灵山最生动的自然场景"),
      step("祥符禅寺", "古刹庭院里的古树与石阶"),
      step("灵山大佛", "登高收尾，俯瞰太湖与群山")
    ]
  },
  senior: {
    title: "中老年舒适慢游路线",
    reason: "银发游客 · 团队出游 · 轻松优先 · 减少台阶",
    duration: "5小时",
    distance: "3.1km",
    comfort: 97,
    steps: [
      step("灵山照壁", "入口集合，预留拍照与休息时间"),
      step("九龙灌浴", "在平坦观演区欣赏动态景观"),
      step("梵宫", "室内休息并欣赏建筑艺术"),
      step("灵山大佛", "观光车至大佛平台，量力登高"),
      step("灵山蔬食馆", "素斋午餐，室内座位充足")
    ]
  },
  family: {
    title: "亲子趣味研学路线",
    reason: "亲子家庭 · 趣味研学 · 儿童友好",
    duration: "4小时",
    distance: "4.0km",
    comfort: 94,
    steps: [
      step("灵山照壁", "领取小灵探险卡并认识今日任务"),
      step("九龙灌浴", "用故事理解慈悲与祝福"),
      step("梵宫", "寻找穹顶飞天与七彩琉璃"),
      step("百子戏弥勒", "数一数一百个孩子的快乐表情"),
      step("灵山蔬食馆", "亲子素斋，补充体力再出发")
    ]
  },
  international: {
    title: "International Culture Route",
    reason: "International visitor · bilingual stories · 4 hours",
    duration: "4 hours",
    distance: "4.5km",
    comfort: 91,
    steps: [
      step("Screen Wall", "A concise introduction to Lingshan culture"),
      step("Nine Dragons", "The story explained in clear English"),
      step("Brahma Palace", "Architecture, glass art and cultural exchange"),
      step("Xiangfu Temple", "A Tang-dynasty monastery with old trees"),
      step("Grand Buddha", "Scale, craftsmanship and panoramic views")
    ]
  },
  accessible: {
    title: "无障碍友好路线",
    reason: "轮椅友好 · 减少台阶 · 观光车接驳",
    duration: "4.5小时",
    distance: "2.8km",
    comfort: 98,
    steps: [
      step("灵山照壁", "平坦区域完成首站讲解"),
      step("香水海", "环湖无障碍步道，观光车可停靠"),
      step("九龙灌浴", "选择无台阶观演区"),
      step("梵宫", "优先无障碍入口与室内休息"),
      step("灵山大佛", "观光车至大佛平台，不登台阶也能远眺")
    ]
  }
};

// 设计稿「定制你的专属路线」面板的可选项：时长 / 兴趣 / 预算 / 节奏
// 这些值同时是 personalizeRoute 与 chooseRoute 的输入
export const itineraryOptions = {
  duration: [
    { value: "half", label: "半日游", hours: 4 },
    { value: "1d", label: "1日游", hours: 8 },
    { value: "2d", label: "2日游", hours: 16 },
    { value: "3d", label: "3日游", hours: 24 }
  ],
  interests: [
    { value: "文化祈福", label: "文化祈福" },
    { value: "自然风光", label: "自然风光" },
    { value: "亲子游", label: "亲子游" },
    { value: "摄影打卡", label: "摄影打卡" }
  ],
  budget: [
    { value: "under100", label: "¥100以下", perks: ["步行为主，自带饮水", "免费讲解点优先"] },
    { value: "100-300", label: "¥100-300", perks: ["观光车单程接驳", "景区简餐"] },
    { value: "300-500", label: "¥300-500", perks: ["观光车全程", "素斋体验", "语音讲解器"] },
    { value: "above500", label: "¥500以上", perks: ["专属讲解", "观光车全程", "素斋与茶歇"] }
  ],
  pace: [
    { value: "relaxed", label: "轻松休闲", stops: 4, minutesPerStop: 150 },
    { value: "moderate", label: "适中游览", stops: 5, minutesPerStop: 105 },
    { value: "deep", label: "深度体验", stops: 6, minutesPerStop: 80 }
  ]
};

// 主界面配置面板的初始状态：与设计稿展示的默认选项一致
export const defaultConstraints = {
  duration: "1d",
  interests: [],
  budget: "100-300",
  pace: "moderate"
};

// 每条基础路线之外的备选站点：节奏越深，追加越多；多日行程用于补足站点
const routeExtras = {
  photo: [
    step("香水海", "湖面倒影与山峦层次，适合长焦"),
    step("祥符禅寺", "古刹檐角与香火光影"),
    step("百子戏弥勒", "铜雕细节与人物互动瞬间"),
    step("灵山蔬食馆", "用餐休整，顺便整理今日机位")
  ],
  nature: [
    step("百子戏弥勒", "开阔草坡，适合停下来休息"),
    step("五印坛城", "登高回望湖面与山峦层次"),
    step("灵山蔬食馆", "素斋午餐，补水降温"),
    step("梵宫", "室内穹顶与光影的对比")
  ],
  culture: [
    step("五印坛城", "读懂坛城布局中的文化符号"),
    step("百子戏弥勒", "从民俗造像看弥勒信仰的另一种表达"),
    step("灵山蔬食馆", "素斋体验也是灵山文化的一部分"),
    step("香水海", "在湖光里回望今日走过的中轴")
  ],
  senior: [
    step("祥符禅寺", "在平坦广场听古刹故事"),
    step("香水海", "缓坡步道，观光车可停靠"),
    step("百子戏弥勒", "轻松观赏，无需登高"),
    step("五印坛城", "殿内可休息，量力参观")
  ],
  family: [
    step("祥符禅寺", "用小故事认识古刹里的动物装饰"),
    step("香水海", "数一数湖里的小鱼与水鸟"),
    step("五印坛城", "转动经筒，完成互动任务"),
    step("灵山大佛", "在登云道前合影，量力攀登")
  ],
  international: [
    step("Xiangfu Temple", "The old monastery and its local legends"),
    step("Five Mudra Mandala", "Tibetan-style art and prayer wheels"),
    step("Hundred Children Maitreya", "A joyful bronze beloved by families"),
    step("Lingshan Vegetarian Restaurant", "A vegetarian lunch break")
  ],
  accessible: [
    step("五印坛城", "平坦入口与室内休息区"),
    step("百子戏弥勒", "开阔平台，轮椅通行无压力"),
    step("灵山蔬食馆", "无障碍卫生间与室内就餐"),
    step("祥符禅寺", "平坦路面可直达的祈福点")
  ]
};

const durationLabels = {
  "2": "2小时轻松游",
  "4": "4小时经典游",
  "6": "6小时深度游",
  "8": "一日慢游（8小时）"
};

const ageLabels = {
  青少年: "青少年",
  大学生: "大学生/年轻人",
  中年: "中年游客",
  银发: "银发游客",
  银发游客: "银发游客",
  老年人: "银发游客",
  中老年: "银发游客"
};

const companionLabels = {
  独自: "独自漫游",
  朋友: "朋友同行",
  亲子: "亲子家庭",
  团队: "团队出游"
};

const formatTime = (minutes) => {
  const hour = Math.floor(minutes / 60) % 24;
  const minute = minutes % 60;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
};

const paceFactors = { relaxed: 0.92, moderate: 1, deep: 1.16 };

// 面板上的「兴趣偏好」四选一 -> 基础路线（生成的第一依据）
const interestRoutes = {
  "文化祈福": "culture",
  "自然风光": "nature",
  "亲子游": "family",
  "摄影打卡": "photo"
};

// 路线标题：优先用兴趣偏好命名，未选兴趣时用节奏兜底，避免出现与条件无关的固定文案
const interestTitles = {
  "文化祈福": "灵山文化祈福路线",
  "自然风光": "灵山山水自然路线",
  "亲子游": "亲子趣味研学路线",
  "摄影打卡": "灵山光影摄影路线"
};

const paceTitles = {
  relaxed: "灵山轻松慢游路线",
  moderate: "灵山经典游览路线",
  deep: "灵山深度探索路线"
};

// 预算决定交通方式：低价位纯步行，价位越高观光车接驳越多，实际步行距离与体力消耗随之变化
const budgetWalkFactors = { under100: 1.16, "100-300": 1, "300-500": 0.9, above500: 0.84 };
const budgetComfortBias = { under100: -2, "100-300": 0, "300-500": 1, above500: 2 };

// 时长：优先读新的 duration 值，兼容旧 ProfileModal 的 time（小时）
const resolveDuration = (profile) => {
  const matched = itineraryOptions.duration.find((item) => item.value === profile.duration);
  if (matched) return matched;
  const hours = Number(profile.time) || 4;
  return itineraryOptions.duration.find((item) => item.hours === hours)
    || { value: `custom-${hours}`, label: durationLabels[String(profile.time)] || `${hours}小时`, hours };
};

const resolvePace = (profile) => itineraryOptions.pace.find((item) => item.value === profile.pace)
  || itineraryOptions.pace[1];

const resolveBudget = (profile) => itineraryOptions.budget.find((item) => item.value === profile.budget) || null;

const resolveDays = (hours) => (hours <= 8 ? 1 : hours <= 16 ? 2 : 3);

// 九大景点在地图上的顺路环线序号（scenicSpots.order 是唯一依据）
// 排序后无论补齐到几站，路线在地图上都是一条不回头的环线，不会来回折返
const loopOrderOf = (name) => {
  const spot = findSpot(name);
  return spot ? spot.order : 99;
};

// 取节奏决定的站点数：少于基础站点时保留首尾，多于时从备选站点补足，最后统一按环线排序
const buildStops = (routeKey, baseRoute, desired) => {
  const base = baseRoute.steps.map(([name, description]) => [name, description]);
  const picked = base.length >= desired
    ? (base.length === desired ? base : [...base.slice(0, desired - 1), base[base.length - 1]])
    : [...base, ...(routeExtras[routeKey] || []).slice(0, desired - base.length)];
  return picked.slice().sort((a, b) => loopOrderOf(a[0]) - loopOrderOf(b[0]));
};

// 按天切分站点：每天 09:00 开始，按当日可用时长均分间隔
// （节奏体现在站点数量上：站越少，间隔越长、越轻松）
const buildItinerary = (stops, days, hoursPerDay) => {
  const perDay = Math.ceil(stops.length / days);
  const spanMinutes = hoursPerDay * 60;
  const steps = [];
  for (let day = 1; day <= days; day += 1) {
    const chunk = stops.slice((day - 1) * perDay, day * perDay);
    if (!chunk.length) break;
    const gap = chunk.length > 1 ? spanMinutes / chunk.length : 0;
    chunk.forEach(([name, description], index) => {
      steps.push([name, description, formatTime(9 * 60 + Math.round(gap * index)), day]);
    });
  }
  return steps;
};

export function personalizeRoute(routeKey, profile) {
  const baseRoute = routeCatalog[routeKey] || routeCatalog.culture;
  if (!profile) {
    return {
      ...baseRoute,
      days: 1,
      steps: baseRoute.steps.map(([name, description, time]) => [name, description, time, 1])
    };
  }

  const duration = resolveDuration(profile);
  const pace = resolvePace(profile);
  const budget = resolveBudget(profile);
  const interest = (profile.interests || [])[0];
  const days = resolveDays(duration.hours);
  const hoursPerDay = duration.hours / days;
  // 多日行程保证每天至少 3 站，避免出现「上午就逛完」的空行程
  const stops = buildStops(routeKey, baseRoute, Math.max(pace.stops, days * 3));
  const steps = buildItinerary(stops, days, hoursPerDay);

  const reason = [
    profile.age ? ageLabels[profile.age] || profile.age : null,
    profile.companion ? companionLabels[profile.companion] || profile.companion : null,
    ...(profile.interests || []).slice(0, 2),
    duration.label,
    pace.label,
    budget ? budget.label : null,
    profile.fitness,
    profile.access && profile.access !== "暂无" ? profile.access : null
  ].filter(Boolean).join(" · ");

  const factor = paceFactors[pace.value] || 1;
  const walkFactor = (budget && budgetWalkFactors[budget.value]) || 1;
  const baseKm = Number.parseFloat(baseRoute.distance) || 4;
  const distance = `${(baseKm * factor * walkFactor * (1 + (days - 1) * 0.45)).toFixed(1)}km`;
  const comfortOffset = (pace.value === "relaxed" ? 3 : pace.value === "deep" ? -5 : 0)
    + ((budget && budgetComfortBias[budget.value]) || 0);
  const comfort = Math.max(82, Math.min(99, baseRoute.comfort + comfortOffset));

  return {
    ...baseRoute,
    // 标题、距离、舒适度都由当前条件推导，不再沿用基础路线的固定文案
    title: interestTitles[interest] || paceTitles[pace.value] || baseRoute.title,
    reason,
    duration: duration.label,
    pace: pace.label,
    budget: budget ? budget.label : null,
    perks: budget ? budget.perks : [],
    days,
    distance,
    comfort,
    steps
  };
}

export function chooseRoute(profile = {}) {
  const interests = profile.interests || [];
  if (profile.access && profile.access !== "暂无") return "accessible";
  if (profile.language && profile.language !== "中文") return "international";
  // 面板上的「兴趣偏好」是首选依据：四选一，命中即决定基础路线
  const byInterest = interests.map((value) => interestRoutes[value]).find(Boolean);
  if (byInterest) return byInterest;
  // 兼容首页三步问卷（年龄段 / 同行人 / 体力）的旧画像
  if (["银发", "银发游客", "老年人", "中老年"].includes(profile.age) || profile.companion === "团队" || profile.fitness === "轻松优先") return "senior";
  if (profile.companion === "亲子" || interests.includes("亲子研学")) return "family";
  return "culture";
}

// 主界面「为我推荐路线」：把面板上的四组约束转成路线键与个性化档案
export function buildRouteSelection(constraints = {}) {
  const normalized = {
    ...constraints,
    interests: [...(constraints.interests || [])]
  };
  return { routeKey: chooseRoute(normalized), profile: normalized };
}
