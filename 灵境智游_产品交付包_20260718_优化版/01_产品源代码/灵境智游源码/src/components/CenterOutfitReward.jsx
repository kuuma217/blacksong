import { getRewardOutfits, resolveUnlockedTotal } from "../data/rewardOutfits.js";
import { readSavedOutfitKey } from "../utils/userProgress.js";

// 个人中心 · 我的装扮奖励：底图印死的四张服装卡替换为真实组件
// 坐标由 profile-center.webp 逐像素测量（页面百分比）：
//   四卡一行：卡 1 左缘 x≈76.5%，列间距 ≈5.6%，单卡图宽 ≈4.45%，卡顶 y≈57.3%
//   每列自上而下：图片 y 57.3%~67.0%、名称、状态、条件按钮（到 y≈72.8%）
// 图片下沿到底部的区域用与卡片底色一致的米色遮片盖住底图印死的「已解锁 / 未解锁」等字样，
// 再在其上显示真实文案；未解锁的服装图做黑白处理，解锁后才恢复彩色。
// 解锁规则沿用打卡集章奖励区（累计可穿套数：0→1 / 1→2 / 2→4 / 3→6 / 4→7）
const BOX = [76.4, 57.3, 21.4, 15.5];

/** 锁形图标（未解锁状态展示，与打卡集章奖励区保持一致） */
const LockIcon = () => (
  <svg viewBox="0 0 10 12" aria-hidden="true" fill="currentColor">
    <path d="M5 0a3 3 0 0 0-3 3v1h-.5A1.5 1.5 0 0 0 0 5.5v5A1.5 1.5 0 0 0 1.5 12h7A1.5 1.5 0 0 0 10 10.5v-5A1.5 1.5 0 0 0 8.5 4H8V3a3 3 0 0 0-3-3Zm0 1.2A1.8 1.8 0 0 1 6.8 3v1H3.2V3A1.8 1.8 0 0 1 5 1.2Z" />
  </svg>
);

/** 第 index 套服装可用，至少需要完成几处打卡 */
const neededCheckins = (index) => {
  for (let count = 0; count <= 4; count += 1) {
    if (resolveUnlockedTotal(count) > index) return count;
  }
  return 4;
};

export default function CenterOutfitReward({ missions = [], guideKey, box = BOX, onGoWardrobe, onGoStamp }) {
  const allOutfits = getRewardOutfits(guideKey);
  const outfits = allOutfits.slice(0, 4);
  const completedCount = missions.filter(Boolean).length;
  const unlockedTotal = resolveUnlockedTotal(completedCount);
  // 「当前使用」与我的衣橱同一数据源：已保存且仍在解锁范围内才算，否则回落第 1 套
  const savedKey = readSavedOutfitKey();
  const savedIndex = allOutfits.findIndex((outfit) => outfit.key === savedKey);
  const currentKey = savedIndex >= 0 && savedIndex < unlockedTotal ? savedKey : allOutfits[0].key;

  return (
    <section
      className="design-rail center-outfit-reward"
      style={{ left: `${box[0]}%`, top: `${box[1]}%`, width: `${box[2]}%`, height: `${box[3]}%` }}
      aria-label={`我的装扮奖励：已解锁 ${Math.min(unlockedTotal, outfits.length)} / ${outfits.length} 套`}
    >
      {/* 与卡片底色一致的遮片：盖住底图印死的名称 / 状态 / 条件文字 */}
      <span className="cor-cover" aria-hidden="true" />
      <ul className="cor-grid">
        {outfits.map((outfit, index) => {
          const unlocked = index < unlockedTotal;
          const isCurrent = unlocked && outfit.key === currentKey;
          const remain = Math.max(0, neededCheckins(index) - completedCount);
          return (
            <li key={outfit.key} className={`cor-card${unlocked ? " is-unlocked" : " is-locked"}`}>
              <span className="cor-figure">
                <img src={outfit.image} alt={`${outfit.guideName} · ${outfit.label}`} loading="lazy" decoding="async" />
                {!unlocked && (
                  <span className="cor-lock" aria-hidden="true">
                    <LockIcon />
                  </span>
                )}
              </span>
              <span className="cor-name">{outfit.label}</span>
              <span className={`cor-state${unlocked ? " is-unlocked" : ""}`}>
                {unlocked ? (isCurrent ? "当前使用" : "已解锁") : "未解锁"}
              </span>
              <button
                type="button"
                className="cor-btn"
                onClick={() => (unlocked ? onGoWardrobe && onGoWardrobe(outfit) : onGoStamp && onGoStamp(outfit))}
              >
                {unlocked ? "去衣橱试穿" : `再打卡 ${remain} 处解锁`}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
