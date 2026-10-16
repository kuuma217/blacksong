// 景区导览：景点分类与结构化景点数据
// 分类与首页左侧「景点分类」一致，供设计页热区筛选与真实景点面板共用

export const spotCategories = [
  { key: "all", label: "全部景点" },
  { key: "buddhist", label: "佛教文化" },
  { key: "nature", label: "自然景观" },
  { key: "architecture", label: "主题建筑" },
  { key: "leisure", label: "休闲体验" }
];

export const spots = [
  {
    key: "buddha",
    name: "灵山大佛",
    badge: "世界文化遗产",
    categories: ["buddhist", "architecture"],
    hours: "7:00 - 17:30",
    ticket: "成人票 210 元 · 优待票 105 元",
    duration: "建议游览 60-90 分钟",
    highlight: "通高 88 米，其中佛体 79 米、莲花瓣 9 米",
    intro: "灵山大佛是灵山胜境最具代表性的文化地标。可沿 216 级「登云道」拾级而上，在佛脚平台俯瞰整个景区，也是祈福与合影的首选。",
    question: "灵山大佛有多高？",
    tags: ["祈福", "必打卡", "地标"]
  },
  {
    key: "palace",
    name: "灵山梵宫",
    badge: "东方艺术殿堂",
    categories: ["buddhist", "architecture"],
    hours: "8:30 - 17:00",
    ticket: "含在景区联票内",
    duration: "建议游览 60 分钟",
    highlight: "建筑面积约 7.2 万平方米，穹顶天象、琉璃艺术与东阳木雕极具代表性",
    intro: "梵宫融合传统建筑、石窟艺术与现代技术，内部空间恢弘。建议放慢节奏，重点看穹顶、廊厅木雕与琉璃壁画。",
    question: "梵宫有哪些必看展品？",
    tags: ["建筑艺术", "室内参观"]
  },
  {
    key: "dragons",
    name: "九龙灌浴",
    badge: "佛教圣景",
    categories: ["buddhist", "leisure"],
    hours: "演出时间以景区当日公告为准",
    ticket: "含在景区联票内",
    duration: "建议停留 30 分钟",
    highlight: "莲花开启、太子佛升起、九龙喷水，共同呈现「花开见佛」",
    intro: "九龙灌浴是大型音乐动态景观，建议提前 10 分钟到场，正面台阶视野最佳，适合亲子家庭一起观看。",
    question: "九龙灌浴的开放时间是几点？",
    tags: ["演出", "亲子"]
  },
  {
    key: "mandala",
    name: "五印坛城",
    badge: "佛教艺术宝库",
    categories: ["buddhist", "architecture"],
    hours: "8:30 - 17:00",
    ticket: "含在景区联票内",
    duration: "建议游览 45 分钟",
    highlight: "藏传佛教风格坛城建筑，金顶与转经廊最适合拍照",
    intro: "五印坛城以藏式坛城为原型，内外陈设展示了丰富的佛教艺术与仪式文化，是继梵宫之后的又一艺术空间。",
    question: "五印坛城有什么看点？",
    tags: ["藏式建筑", "拍照点"]
  },
  {
    key: "screenwall",
    name: "灵山照壁",
    badge: "景区序章",
    categories: ["buddhist", "architecture"],
    hours: "7:00 - 17:30",
    ticket: "含在景区联票内",
    duration: "建议停留 15 分钟",
    highlight: "入口照壁浮雕，讲述灵山的历史与传说",
    intro: "灵山照壁是进入景区的第一站，浮雕把灵山的来历与主要景点串联起来，拍照路线的起点也常设在这里。",
    question: "灵山照壁讲的是什么故事？",
    tags: ["序章", "拍照点"]
  },
  {
    key: "xiangfu",
    name: "祥符禅寺",
    badge: "千年古刹",
    categories: ["buddhist", "nature"],
    hours: "7:00 - 17:00",
    ticket: "含在景区联票内",
    duration: "建议停留 40 分钟",
    highlight: "依山而建的古寺，庭院幽静、古木参天",
    intro: "祥符禅寺保留了传统寺院格局，适合在游览大佛前后安静地走一走，也是避开人流高峰的好去处。",
    question: "祥符禅寺有什么历史？",
    tags: ["古刹", "清静"]
  },
  {
    key: "perfume",
    name: "香水海",
    badge: "自然静水",
    categories: ["nature"],
    hours: "全天开放",
    ticket: "含在景区联票内",
    duration: "建议停留 25 分钟",
    highlight: "开阔水面与环湖步道，傍晚光线最柔和",
    intro: "香水海是景区里最适合放慢脚步的自然景观，环湖步道平坦，适合长辈与亲子家庭中途休息。",
    question: "香水海适合什么时间去？",
    tags: ["自然景观", "休息点"]
  },
  {
    key: "maitreya",
    name: "百子戏弥勒",
    badge: "亲子互动",
    categories: ["leisure", "buddhist"],
    hours: "8:00 - 17:00",
    ticket: "含在景区联票内",
    duration: "建议停留 20 分钟",
    highlight: "数百个嬉闹小童塑像围着弥勒，趣味十足",
    intro: "百子戏弥勒是亲子路线的高互动点位，讲解会加入「找表情、数小童」的小任务，孩子很容易投入。",
    question: "百子戏弥勒适合带孩子去吗？",
    tags: ["亲子", "互动"]
  },
  {
    key: "vegetarian",
    name: "灵山蔬食馆",
    badge: "素斋体验",
    categories: ["leisure"],
    hours: "10:30 - 14:30",
    ticket: "单点收费",
    duration: "建议停留 50 分钟",
    highlight: "以时令蔬食为主，午间高峰建议错峰",
    intro: "灵山蔬食馆是景区内主要的用餐点，建议 11:30 前或 13:30 后前往，避开团队用餐高峰。",
    question: "景区内有哪些餐饮推荐？",
    tags: ["餐饮", "休息点"]
  }
];

export const spotCategoryLabel = (key) =>
  spotCategories.find((item) => item.key === key)?.label || "全部景点";

export const filterSpots = (category) =>
  category === "all" ? spots : spots.filter((spot) => spot.categories.includes(category));
