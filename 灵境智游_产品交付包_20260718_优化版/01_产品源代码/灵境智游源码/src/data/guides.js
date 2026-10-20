export const guides = {
  xiaoling: {
    key: "xiaoling",
    name: "小灵",
    englishName: "Xiaoling",
    image: "/assets/xiaoling.webp?v=png20261020",
    thumbnail: "/assets/xiaoling-thumb.webp?v=png20261020",
    trait: "古灵精怪 · 儿童陪伴",
    voiceLabel: "清亮活泼童声",
    emotion: "😄",
    rate: 1.04,
    pitch: 1.14,
    volume: 0.96,
    voiceHintsZh: ["xiaomeng", "xiaoshuang", "xiaoyi", "yaoyao", "huihui", "tingting"],
    voiceHintsEn: ["jenny", "aria", "zira", "samantha"],
    preview: "嗨，我是小灵！我们一起去发现灵山里最有趣的故事吧！",
    welcome: "嗨！我是小灵。要不要和我一起找一找灵山里最有趣的故事？完成任务还能解锁新衣服哦！"
  },
  lingruo: {
    key: "lingruo",
    name: "灵若",
    englishName: "Lingruo",
    image: "/assets/lingruo.webp?v=png20261020",
    thumbnail: "/assets/lingruo-thumb.webp?v=png20261020",
    trait: "温柔亲切 · 人文讲解",
    voiceLabel: "温润叙事女声",
    emotion: "😊",
    rate: 0.92,
    pitch: 1.01,
    volume: 0.94,
    voiceHintsZh: ["xiaoxiao", "xiaohan", "xiaorui", "xiaozhen", "tingting", "meijia", "huihui"],
    voiceHintsEn: ["aria", "susan", "samantha", "jenny"],
    preview: "你好呀，我是灵若。愿我温柔的讲解，让今天的灵山之旅更加从容。",
    welcome: "你好呀，我是灵若。今天想听灵山的故事，还是让我按你的兴趣安排一条轻松好玩的路线？"
  },
  xingyuan: {
    key: "xingyuan",
    name: "行远",
    englishName: "Xingyuan",
    image: "/assets/xingyuan.webp?v=png20261020",
    thumbnail: "/assets/xingyuan-thumb.webp?v=png20261020",
    trait: "沉稳可靠 · 深度文化",
    voiceLabel: "清晰沉稳男声",
    emotion: "🙂",
    rate: 0.9,
    pitch: 0.94,
    volume: 0.96,
    voiceHintsZh: ["yunxi", "yunfeng", "yunjian", "yunyang", "kangkang"],
    voiceHintsEn: ["guy", "christopher", "ryan", "david"],
    preview: "你好，我是行远。接下来，我会陪你慢慢读懂灵山的文化脉络。",
    welcome: "你好，我是行远。我会陪你慢慢读懂灵山的历史、建筑与文化脉络，也会随时照顾你的游览节奏。"
  },
  dongling: {
    key: "dongling",
    name: "冬灵",
    englishName: "Dongling",
    image: "/assets/dongling.webp?v=png20261020",
    thumbnail: "/assets/dongling-thumb.webp?v=png20261020",
    trait: "和蔼慈祥 · 银发关怀",
    voiceLabel: "慈和舒缓长者声",
    emotion: "🤗",
    rate: 0.82,
    pitch: 0.88,
    volume: 0.93,
    voiceHintsZh: ["yunyang", "yunjian", "yunze", "kangkang", "yunxi"],
    voiceHintsEn: ["david", "mark", "george", "guy"],
    preview: "您好，我是冬灵。咱们不着急，舒舒服服地走，我会一直陪着您。",
    welcome: "您好，我是冬灵。咱们不用赶时间，我会为您留意休息点、少台阶路线和观光车信息。"
  },
  wailing: {
    key: "wailing",
    name: "外灵",
    englishName: "Wailing",
    image: "/assets/wailing.webp?v=png20261020",
    thumbnail: "/assets/wailing-thumb.webp?v=png20261020",
    trait: "开朗友好 · 中英双语",
    voiceLabel: "自然双语男声",
    emotion: "👋",
    rate: 0.96,
    pitch: 0.97,
    volume: 0.96,
    voiceHintsZh: ["yunxi", "yunfeng", "yunyang", "kangkang"],
    voiceHintsEn: ["ryan", "christopher", "guy", "eric", "david"],
    preview: "Hello! I’m Wailing, your bilingual guide. Welcome to Lingshan!",
    welcome: "你好，Hello！我是外灵。我可以用中英文陪你探索灵山，也会把文化概念讲得自然、易懂。"
  }
};

export const guideList = Object.values(guides);

// 七套服装各使用一张对应 PNG；复用已有素材文件位置。
const guideOutfitImages = {
  xiaoling: [
    "/assets/xiaoling.webp?v=png20261020",
    "/assets/xiaoling-sunset.webp?v=png20261020",
    "/assets/xiaoling-lotus.webp?v=png20261020",
    new URL("../../source-assets/wardrobe-png-originals/xiaoling-sunset.png", import.meta.url).href,
    new URL("../../source-assets/wardrobe-png-originals/xiaoling-night.png", import.meta.url).href,
    "/assets/xiaoling-night.webp?v=png20261020",
    new URL("../../source-assets/wardrobe-png-originals/xiaoling-lotus.png", import.meta.url).href,
  ],
  lingruo: [
    "/assets/lingruo.webp?v=png20261020",
    "/assets/lingruo-sunset.webp?v=png20261020",
    "/assets/lingruo-lotus.webp?v=png20261020",
    new URL("../../source-assets/wardrobe-png-originals/lingruo-sunset.png", import.meta.url).href,
    new URL("../../source-assets/wardrobe-png-originals/lingruo-night.png", import.meta.url).href,
    "/assets/lingruo-night.webp?v=png20261020",
    new URL("../../source-assets/wardrobe-png-originals/lingruo-lotus.png", import.meta.url).href,
  ],
  xingyuan: [
    "/assets/xingyuan.webp?v=png20261020",
    "/assets/xingyuan-sunset.webp?v=png20261020",
    "/assets/xingyuan-lotus.webp?v=png20261020",
    new URL("../../source-assets/wardrobe-png-originals/xingyuan-sunset.png", import.meta.url).href,
    new URL("../../source-assets/wardrobe-png-originals/xingyuan-night.png", import.meta.url).href,
    "/assets/xingyuan-night.webp?v=png20261020",
    new URL("../../source-assets/wardrobe-png-originals/xingyuan-lotus.png", import.meta.url).href,
  ],
  dongling: [
    "/assets/dongling.webp?v=png20261020",
    "/assets/dongling-sunset.webp?v=png20261020",
    "/assets/dongling-lotus.webp?v=png20261020",
    new URL("../../source-assets/wardrobe-png-originals/dongling-sunset.png", import.meta.url).href,
    new URL("../../source-assets/wardrobe-png-originals/dongling-night.png", import.meta.url).href,
    "/assets/dongling-night.webp?v=png20261020",
    new URL("../../source-assets/wardrobe-png-originals/dongling-lotus.png", import.meta.url).href,
  ],
  wailing: [
    "/assets/wailing.webp?v=png20261020",
    "/assets/wailing-sunset.webp?v=png20261020",
    "/assets/wailing-lotus.webp?v=png20261020",
    new URL("../../source-assets/wardrobe-png-originals/wailing-sunset.png", import.meta.url).href,
    new URL("../../source-assets/wardrobe-png-originals/wailing-night.png", import.meta.url).href,
    "/assets/wailing-night.webp?v=png20261020",
    new URL("../../source-assets/wardrobe-png-originals/wailing-lotus.png", import.meta.url).href,
  ],
};

export function getGuideOutfitImages(guideKey = "lingruo") {
  return guideOutfitImages[guideKey] || guideOutfitImages.lingruo;
}
