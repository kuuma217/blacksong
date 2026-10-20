/**
 * 打卡背景照片数据
 * 每个打卡点关联一张或多张背景照片，用于与用户上传的照片合成
 */

export const checkinBackgrounds = [
  {
    // 第 4 个打卡站为「五印坛城」：与打卡集章设计图、个人中心「已去过的景点」保持一致
    id: "wuyin",
    title: "五印坛城 · 坛城寻境",
    description: "在藏式坛城的金顶与彩绘前留影，读懂「五印」的象征。",
    // 使用渐变色 + 文字作为简易背景（无需额外图片资源）
    gradient: "linear-gradient(135deg, #3a2a1a 0%, #7a4a1f 30%, #b07a2a 55%, #d8a84a 75%, #f0d28a 100%)",
    overlayText: "五印坛城",
    overlaySubtext: "坛城寻境 · 藏式坛城",
    icon: "🛕",
    // 预设的装饰元素位置（CSS定位信息）
    decorations: [
      { type: "stamp", text: "灵山胜境", position: "top-right" },
      { type: "date", position: "bottom-left" }
    ]
  },
  {
    id: "jiulong",
    title: "九龙灌浴 · 花开见佛",
    description: "上传现场照片，记录水幕与光影交织的瞬间。",
    gradient: "linear-gradient(135deg, #1a3a5a 0%, #2a5a8a 30%, #4a8aba 60%, #7ab4da 85%, #aad4f0 100%)",
    overlayText: "九龙灌浴",
    overlaySubtext: "花开见佛 · 水幕光影",
    icon: "💧",
    decorations: [
      { type: "stamp", text: "灵山胜境", position: "top-right" },
      { type: "watermark", text: "✦ 九龙灌浴 ✦", position: "bottom-center" }
    ]
  },
  {
    id: "fangong",
    title: "梵宫 · 穹顶寻光",
    description: "找到穹顶中的飞天元素，听完一段艺术讲解。",
    gradient: "linear-gradient(135deg, #3a2a1a 0%, #6a4a2a 30%, #8a6a3a 50%, #ba9a5a 75%, #dac47a 100%)",
    overlayText: "灵山梵宫",
    overlaySubtext: "穹顶寻光 · 飞天之美",
    icon: "🏛️",
    decorations: [
      { type: "stamp", text: "灵山胜境", position: "top-right" },
      { type: "pattern", position: "bottom-center" }
    ]
  },
  {
    id: "dafou",
    title: "灵山大佛 · 拥抱远方",
    description: "抵达大佛平台并完成今日路线。",
    gradient: "linear-gradient(135deg, #2a1a3a 0%, #4a3a6a 25%, #6a5a8a 50%, #8a7aaa 70%, #baaaca 90%, #dacaea 100%)",
    overlayText: "灵山大佛",
    overlaySubtext: "拥抱远方 · 圆满之旅",
    icon: "🙏",
    decorations: [
      { type: "stamp", text: "灵山胜境", position: "top-right" },
      { type: "completion", position: "bottom-center" }
    ]
  }
];

/**
 * 根据打卡索引获取对应的背景配置
 * 简化版：随机选择该地点的一张照片
 * 完整版：可根据GPS定位、时间等因素选择最佳照片
 */
export function getBackgroundByIndex(index) {
  const bg = checkinBackgrounds[index];
  if (!bg) return checkinBackgrounds[0];

  // 扩展版：可以在此处根据时间、天气、季节等因素选择不同的背景图
  // 例如：const season = getSeason(); const timeOfDay = getTimeOfDay();
  // return bg.variants.find(v => v.season === season && v.time === timeOfDay);

  return bg;
}

/**
 * 生成打卡照片的时间戳
 */
export function getCheckinTimestamp() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return `${year}.${month}.${day} ${hours}:${minutes}`;
}
