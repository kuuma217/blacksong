// 景区导览：景点分类与结构化景点数据
// 分类与首页左侧「景点分类」一致，供设计页热区筛选与真实景点面板共用
// image：景点实景图（源自 pictures 文件夹，已转 webp 存放于 public/assets/spots/）

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
    image: `${import.meta.env.BASE_URL}assets/spots/buddha.webp`,
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
    image: `${import.meta.env.BASE_URL}assets/spots/palace.webp`,
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
    image: `${import.meta.env.BASE_URL}assets/spots/dragons.webp`,
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
    image: `${import.meta.env.BASE_URL}assets/spots/mandala.webp`,
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
    image: `${import.meta.env.BASE_URL}assets/spots/screenwall.webp`,
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
    image: `${import.meta.env.BASE_URL}assets/spots/xiangfu.webp`,
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
    image: `${import.meta.env.BASE_URL}assets/spots/perfume.webp`,
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
    image: `${import.meta.env.BASE_URL}assets/spots/maitreya.webp`,
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
    image: `${import.meta.env.BASE_URL}assets/spots/vegetarian.webp`,
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

// 景点详情弹窗用的详细介绍（与景点主数据分开维护，不改动原有字段）
// 每项为 2 段：第一段讲由来与形制，第二段讲看点、体验与动线
export const spotDetails = {
  buddha: [
    "灵山大佛于 1997 年落成开光，坐落于无锡马山秦履峰南麓，由 1560 块青铜壁板拼装而成，总用铜量约 700 余吨。佛像面朝太湖，右手施「无畏印」，左手施「与愿印」，取「祛除众生苦难、满足众生心愿」之意。",
    "拜谒路线自入口沿 216 级「登云道」上行，两侧分列香炉、经幢与浮雕群雕，行至佛脚平台可俯瞰整个景区与远处湖山。平台下设有佛教文化陈列，可了解大佛的铸造与安装过程。"
  ],
  palace: [
    "梵宫总建筑面积约 7.2 万平方米，以「东方艺术殿堂」为立意，内部汇集东阳木雕、敦煌壁画、扬州漆器与景泰蓝等非遗工艺。外立面以石材与琉璃构成塔状轮廓，与山势相呼应。",
    "入内依次为门厅、廊厅与主厅：中央穹顶由上千盏光源组成，可随音乐变换色彩，是《灵山吉祥颂》演出与实景讲经的主要场所。两侧廊厅的木雕与壁画适合放慢脚步逐一细看。"
  ],
  dragons: [
    "九龙灌浴取材于佛经中太子诞生时「九龙吐水、沐浴金身」的典故，是国内少见的大型音乐动态景观。主体为一朵可开合的巨型莲花，四周环列九条腾龙。",
    "演出开始时，莲花花瓣缓缓张开，高约 7.2 米的金身太子像随之升起，九龙口吐清泉为其沐浴，水幕、音乐与灯光协同，全程约 15 分钟。莲花合拢时，水雾会在阳光下形成彩虹。"
  ],
  mandala: [
    "五印坛城仿藏传佛教坛城形制而建，因释迦牟尼「五印」之说得名，是景区内藏式建筑的代表。外观为方形台基叠加圆形金顶，象征「天圆地方」。",
    "内部金顶之下设有转经廊与无量光佛殿，内壁以唐卡、堆绣与彩绘装饰，工艺精细。环绕金顶的回廊是最佳取景点，请按顺时针方向通行。"
  ],
  screenwall: [
    "灵山照壁长 39.8 米、高 7.8 米，为江南地区体量较大的照壁之一，位于景区入口右侧。正面以「灵山胜会」为主题，浮雕表现诸佛菩萨、飞天伎乐与祥云瑞兽。",
    "背面镌刻「灵山胜境」题字，是入园的第一处标志景观，也是许多游客取景留念的起点。照壁前留有开阔广场，团队集合与拍照都很方便。"
  ],
  xiangfu: [
    "祥符禅寺始建于唐贞观年间，因宋真宗大中祥符年间赐额而得名，千余年间几经兴废，现存建筑为 1990 年代于旧址旁重建，保留了传统寺院的中轴对称格局。",
    "寺内古井、银杏与大雄宝殿相依而立，庭院清幽、古木参天。由于位置相对安静，适合在登山拜佛前后稍作停留，也是避开人流高峰的好去处。"
  ],
  perfume: [
    "香水海取自佛经中「香水海中有七宝山」的意象，水域开阔、岸线舒缓，是景区内主要的水景空间。湖面倒映着周围的塔刹与山影，四季景致各不相同。",
    "环湖设有平坦的木栈道与亲水平台，串联观景亭与草坪，推车与轮椅均可通行。清晨薄雾未散、傍晚光线转暖时最宜漫步，也是游览途中休整的好地方。"
  ],
  maitreya: [
    "百子戏弥勒为大型青铜群雕，主体是高约 3 米的笑口弥勒，周身环绕百尊形态各异的稚童塑像：或攀肩、或挠耳、或嬉闹，姿态诙谐生动。",
    "这里是最受亲子家庭欢迎的互动点位，常设「找表情、数小童」的小任务，孩子很容易投入。塑像允许合影留念，但请勿攀爬，以免损坏文物。"
  ],
  vegetarian: [
    "灵山蔬食馆以寺院素斋为底，主打清鲜本味的江南素馔：罗汉斋、素什锦、寺院面点与时令山蔬，均按份现烹，口味清淡、摆盘素净。",
    "餐厅临窗可望园景，位置靠近梵宫与五印坛城，是游览中段最合适的休憩补给点。午间为用餐高峰，建议 11:30 前或 13:30 后前往，餐后步行即可继续行程。"
  ]
};

// 景点详情弹窗用的游览贴士（与景点主数据分开维护，不改动原有字段）
export const spotTips = {
  buddha: ["登云道 216 级台阶较陡，上行途中建议在平台休息", "上午顺光，与大佛合影效果最好"],
  palace: ["穹顶灯光秀有固定场次，入场前先看当日公告", "内部为恒温展厅，夏季建议带一件薄外套"],
  dragons: ["演出前 10 分钟到正面台阶，视野最佳", "前排会被水雾溅到，相机注意防水"],
  mandala: ["金顶逆光，绕到侧前方拍摄更通透", "转经廊请顺时针通行，注意礼仪"],
  screenwall: ["照壁在入口右侧，进园第一时间顺路", "浮雕细节多，拍照建议走近或用长焦"],
  xiangfu: ["寺院为清修区域，请轻声慢行", "午后游客最少，适合安静停留"],
  perfume: ["环湖步道平坦，推车与轮椅均可通行", "傍晚 17:00 后光线最柔和"],
  maitreya: ["可以让孩子找最像自己的小童塑像", "塑像可合影，但请勿攀爬"],
  vegetarian: ["11:30 前或 13:30 后错峰，避免等座", "素斋按份供应，高峰时出餐略慢"]
};

export const spotCategoryLabel = (key) =>
  spotCategories.find((item) => item.key === key)?.label || "全部景点";

export const filterSpots = (category) =>
  category === "all" ? spots : spots.filter((spot) => spot.categories.includes(category));
