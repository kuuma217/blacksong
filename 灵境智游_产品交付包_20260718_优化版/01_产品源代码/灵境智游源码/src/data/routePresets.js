/**
 * 个性路线页「推荐路线」板块的主题与卡片预设
 *
 * 设计稿 route-plan.webp 里的四张路线卡是位图，本身不可交互，这里把文案抽成数据，
 * 由 RouteRecommender 渲染成真实卡片：
 * - recommendedCards：四张卡片，右下角「查看路线」各自生成一条主题路线
 *
 * 2026-10-19：顶部四个主题标签（经典一日游 / 深度文化游 / 亲子家庭游 / 祈福之旅）
 * 及其生成交互已整体下线，routeThemes / findTheme 一并移除。
 *
 * 字段取值与 routes.js 的 itineraryOptions 保持一致，可直接喂给 chooseRoute / personalizeRoute；
 * 同时也是 agentTools.recommend_route 的入参枚举。
 */

/**
 * 四张卡片：文案与设计稿逐字一致。
 *
 * 2026-10-19 起卡片不再是位图——位图整页被压到 248KB，楷体小字全是蚊噪，
 * 因此把配图单独抠成 route-photo-1..4.webp，文字全部改由 DOM 渲染。
 * photo / no / desc / hours / distance 五项只供 RouteRecommender 展示使用，
 * 不参与路线计算；focus 用于提示智能体重点编排的景点。
 */
export const recommendedCards = [
  {
    key: "dafo",
    no: "01",
    title: "灵山大佛 · 祈福之旅",
    photo: `${import.meta.env.BASE_URL}assets/route-photo-1.webp`,
    desc: ["感受世界佛教文化的庄严与慈悲，", "在灵山大佛前许下美好心愿。"],
    hours: "4.5 小时",
    distance: "2.5 公里",
    focus: "灵山大佛",
    routeKey: "culture",
    duration: "1d",
    pace: "relaxed",
    interests: ["文化祈福"],
    budget: "100-300"
  },
  {
    key: "fangong",
    no: "02",
    title: "梵宫 · 艺术之旅",
    photo: `${import.meta.env.BASE_URL}assets/route-photo-2.webp`,
    desc: ["领略佛教艺术的瑰丽与智慧，", "感受古今交融的文化魅力。"],
    hours: "3.5 小时",
    distance: "2 公里",
    focus: "梵宫",
    routeKey: "photo",
    duration: "half",
    pace: "moderate",
    interests: ["摄影打卡"],
    budget: "300-500"
  },
  {
    key: "jiulong",
    no: "03",
    title: "九龙灌浴 · 禅意之旅",
    photo: `${import.meta.env.BASE_URL}assets/route-photo-3.webp`,
    desc: ["在灵动的水景与庄严的仪式中，", "感受佛法的清净与祥和。"],
    hours: "2.5 小时",
    distance: "1.5 公里",
    focus: "九龙灌浴",
    routeKey: "nature",
    duration: "half",
    pace: "relaxed",
    interests: ["自然风光"],
    budget: "100-300"
  },
  {
    key: "wuyin",
    no: "04",
    title: "五印坛城 · 文化之旅",
    photo: `${import.meta.env.BASE_URL}assets/route-photo-4.webp`,
    desc: ["走进神秘的坛城世界，", "探索多元文化的交融与智慧。"],
    hours: "3 小时",
    distance: "1.8 公里",
    focus: "五印坛城",
    routeKey: "culture",
    duration: "1d",
    pace: "deep",
    interests: ["文化祈福"],
    budget: "above500"
  }
];

