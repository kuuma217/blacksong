export const routeCatalog = {
  photo: {
    title: "大学生拍照打卡路线",
    reason: "年轻人 · 摄影打卡 · 4小时 · 活力充沛",
    duration: "4小时",
    distance: "5.2km",
    comfort: 92,
    steps: [
      ["灵山照壁", "湖光与照壁同框，拍下入园第一张照片", "09:00"],
      ["九龙灌浴", "抓住水幕与光影，场次以当日公告为准", "09:30"],
      ["梵宫", "穹顶、琉璃与飞天艺术的室内机位", "10:30"],
      ["五印坛城", "建筑色彩层次丰富，适合广角构图", "12:00"],
      ["灵山大佛", "下午柔光更适合人物与大佛合影", "14:30"]
    ]
  },
  culture: {
    title: "青少年文化探索路线",
    reason: "青少年 · 历史文化 · 4小时 · 正常步行",
    duration: "4小时",
    distance: "4.6km",
    comfort: 90,
    steps: [
      ["灵山照壁", "从题字进入灵山文化序章", "09:00"],
      ["五明桥", "认识传统文化中的五种智慧", "09:20"],
      ["九龙灌浴", "理解“花开见佛”的文化故事", "10:00"],
      ["梵宫", "观察穹顶与琉璃艺术", "11:00"],
      ["灵山大佛", "完成文化知识挑战", "13:00"]
    ]
  },
  senior: {
    title: "中老年舒适慢游路线",
    reason: "银发游客 · 团队出游 · 轻松优先 · 减少台阶",
    duration: "5小时",
    distance: "3.1km",
    comfort: 97,
    steps: [
      ["灵山照壁", "入口集合，预留拍照与休息时间", "09:00"],
      ["观光车站", "乘车减少长距离步行", "09:25"],
      ["九龙灌浴", "在平坦观演区欣赏动态景观", "09:50"],
      ["梵宫", "室内休息并欣赏建筑艺术", "11:00"],
      ["大佛平台", "观光车接驳，量力选择登高", "13:30"]
    ]
  },
  family: {
    title: "亲子趣味研学路线",
    reason: "亲子家庭 · 趣味研学 · 儿童友好",
    duration: "4小时",
    distance: "4.0km",
    comfort: 94,
    steps: [
      ["灵山照壁", "领取小灵探险卡并认识今日任务", "09:00"],
      ["九龙灌浴", "用故事理解慈悲与祝福", "09:30"],
      ["百子戏弥勒", "观察不同儿童形态和快乐表情", "10:20"],
      ["梵宫", "寻找穹顶飞天与七彩琉璃", "11:00"],
      ["五印坛城", "体验多元文化互动任务", "12:30"]
    ]
  },
  international: {
    title: "International Culture Route",
    reason: "International visitor · bilingual stories · 4 hours",
    duration: "4 hours",
    distance: "4.5km",
    comfort: 91,
    steps: [
      ["Screen Wall", "A concise introduction to Lingshan culture", "09:00"],
      ["Nine Dragons", "The story explained in clear English", "09:40"],
      ["Brahma Palace", "Architecture, glass art and exchange", "10:40"],
      ["Five Mudra Mandala", "A respectful overview of its art", "12:00"],
      ["Grand Buddha", "Scale, craftsmanship and panoramic views", "14:00"]
    ]
  },
  accessible: {
    title: "无障碍友好路线",
    reason: "轮椅友好 · 减少台阶 · 观光车接驳",
    duration: "4.5小时",
    distance: "2.8km",
    comfort: 98,
    steps: [
      ["游客中心", "确认无障碍设施与观光车接驳", "09:00"],
      ["灵山照壁", "平坦区域完成首站讲解", "09:20"],
      ["九龙灌浴", "选择无台阶观演区", "10:00"],
      ["梵宫", "优先无障碍入口与室内休息", "11:00"],
      ["大佛远眺点", "不登台阶也能获得完整讲解", "13:20"]
    ]
  }
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

export function personalizeRoute(routeKey, profile) {
  const baseRoute = routeCatalog[routeKey] || routeCatalog.culture;
  if (!profile) return baseRoute;

  const hours = Number(profile.time) || 4;
  const duration = durationLabels[String(profile.time)] || `${hours}小时`;
  const reason = [
    ageLabels[profile.age] || profile.age,
    companionLabels[profile.companion] || profile.companion,
    ...(profile.interests || []).slice(0, 2),
    duration,
    profile.fitness,
    profile.access !== "暂无" ? profile.access : null
  ].filter(Boolean).join(" · ");

  const startMinutes = 9 * 60;
  const totalMinutes = hours * 60;
  const lastIndex = Math.max(baseRoute.steps.length - 1, 1);
  const steps = baseRoute.steps.map(([name, description], index) => [
    name,
    description,
    formatTime(startMinutes + Math.round((totalMinutes * index) / lastIndex))
  ]);

  return {
    ...baseRoute,
    reason,
    duration,
    steps
  };
}

export function chooseRoute(profile) {
  if (profile.access !== "暂无") return "accessible";
  if (profile.language !== "中文") return "international";
  if (["银发", "银发游客", "老年人", "中老年"].includes(profile.age) || profile.companion === "团队" || profile.fitness === "轻松优先") return "senior";
  if (profile.companion === "亲子" || profile.interests.includes("亲子研学")) return "family";
  if (profile.interests.includes("摄影打卡")) return "photo";
  return "culture";
}
