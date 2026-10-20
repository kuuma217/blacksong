import { guides, getGuideOutfitImages } from "./guides.js";

/** 七套主题共用同一角色素材映射；打卡、个人中心和衣橱保持一致。 */

export const REWARD_OUTFITS = [
  { key: "cloud-breeze", label: "云山清风" },
  { key: "fan-palace", label: "梵宫华彩" },
  { key: "nine-dragons", label: "九龙仙韵" },
  { key: "five-seals", label: "五印禅心" },
  { key: "cloud-water", label: "云水行者" },
  { key: "ink-breeze", label: "清风墨影" },
  { key: "lotus-heart", label: "莲心佛语" }
];

/** 五位角色各七套独立透明服装，与衣橱、奖励区共用同一映射。 */
export function getRewardOutfits(guideKey = "lingruo") {
  const guide = guides[guideKey] || guides.lingruo;
  const images = getGuideOutfitImages(guide.key);
  return REWARD_OUTFITS.map((outfit, index) => ({
    ...outfit,
    guideKey: guide.key,
    guideName: guide.name,
    image: images[index],
  }));
}

/**
 * 累计可使用服装总数（含第 1 套默认服装），下标 = 已完成打卡景点数。
 * 0 个 → 1 套；1 个 → 2 套；2 个 → 4 套；3 个 → 6 套；4 个 → 7 套。
 */
export const UNLOCK_TABLE = [1, 2, 4, 6, 7];

/**
 * 根据已完成景点数计算当前可使用服装的总套数
 * @param {number} completedCount - missions.filter(Boolean).length
 * @returns {number} 可使用的服装套数
 */
export const resolveUnlockedTotal = (completedCount) => {
  const index = Math.min(Math.max(completedCount || 0, 0), UNLOCK_TABLE.length - 1);
  return UNLOCK_TABLE[index];
};
