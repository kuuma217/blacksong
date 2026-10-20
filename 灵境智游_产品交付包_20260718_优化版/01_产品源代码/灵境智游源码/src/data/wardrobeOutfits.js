import { getRewardOutfits } from "./rewardOutfits.js";

/** 衣橱套装介绍；人物和卡片图片由当前数字人统一派生。 */
export const WARDROBE_OUTFITS = [
  {
    key: "cloud-breeze",
    label: "云山清风",
    intro: "以灵山云水为灵感，青碧与月白相叠，衣袂如云，清风拂面，尽显灵动与优雅。",
    features: ["灵山主题限定装扮", "流光云袖 · 莲纹金饰", "探索魅力 +10"],
    series: "灵山主题限定",
  },
  {
    key: "fan-palace",
    label: "梵宫华彩",
    intro: "取梵宫金顶与穹顶华彩，绛红织金、金冠流苏，华贵之中自有庄严气度。",
    features: ["梵宫打卡奖励装扮", "织金华服 · 金冠流苏", "探索魅力 +10"],
    series: "梵宫典藏",
  },
  {
    key: "nine-dragons",
    label: "九龙仙韵",
    intro: "九龙灌浴的水韵与龙纹化入衣间，蓝金相映，行事之间仙气自生。",
    features: ["九龙灌浴限定装扮", "云水龙纹 · 鎏金披帛", "探索魅力 +12"],
    series: "九龙灌浴",
  },
  {
    key: "five-seals",
    label: "五印禅心",
    intro: "五印坛城的坛城纹样与暖金禅意相融，端庄静雅，一步一境。",
    features: ["五印坛城限定装扮", "坛城纹饰 · 禅意暖金", "探索魅力 +12"],
    series: "五印坛城",
  },
  {
    key: "cloud-water",
    label: "云水行者",
    intro: "云水行者的轻蓝纱衣，行旅披风随风而起，行云流水，自在从容。",
    features: ["云水行者限定装扮", "水色轻纱 · 行旅披风", "探索魅力 +14"],
    series: "云水行旅",
  },
  {
    key: "ink-breeze",
    label: "清风墨影",
    intro: "水墨墨影与银羽相生，清冷飒爽，风过无痕而衣袂有声。",
    features: ["清风墨影限定装扮", "墨羽银饰 · 水墨流纹", "探索魅力 +14"],
    series: "墨影清风",
  },
  {
    key: "lotus-heart",
    label: "莲心佛语",
    intro: "莲心佛语的霞粉莲纹缀于裙裾，柔美静谧，如莲初绽。",
    features: ["莲心佛语限定装扮", "莲纹霞粉 · 佛语璎珞", "探索魅力 +16"],
    series: "莲心佛语",
  },
];

export function getWardrobeOutfits(guideKey = "lingruo") {
  const rewards = getRewardOutfits(guideKey);
  return WARDROBE_OUTFITS.map((outfit, index) => ({
    ...outfit,
    ...rewards[index],
    card: rewards[index].image,
  }));
}
