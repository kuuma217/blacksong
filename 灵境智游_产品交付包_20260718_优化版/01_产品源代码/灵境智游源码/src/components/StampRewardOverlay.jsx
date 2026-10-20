import "./stamp-reward.css";
import { getRewardOutfits, resolveUnlockedTotal } from "../data/rewardOutfits.js";
import { readSavedOutfitKey } from "../utils/userProgress.js";

/**
 * 打卡集章 · 奖励收集区动态覆盖组件
 *
 * 只覆盖 stamp-panel.webp（1960×1109）下方印刷的七张服装卡片所在内容区，
 * 坐标从原图逐像素测量换算（百分比 = 像素 / 1960 或 / 1109）：
 *   七卡一行：卡 1 左缘 x≈62 → 卡 7 右缘 x≈1290，卡顶 y≈772、卡底 y≈1030
 * 容器完全透明、无边框阴影；不透明感只存在于七张卡片本身，
 * 用于盖住原图印刷的旧卡片（图片 + 名称 + 状态标签）。
 * 原图的「奖励收集」标题、副标题与右侧「打卡成功」宣传卡均保留原样、不覆盖。
 *
 * 解锁规则（累计可使用总数，含第 1 套默认服装）：
 *   完成 0 个 → 1 套；1 个 → 2 套；2 个 → 4 套；3 个 → 6 套；4 个 → 7 套
 *
 * @param {Object} props
 * @param {boolean[]} props.missions - 真实打卡状态（App.jsx 唯一数据源）
 */

/** 七张卡片整体覆盖范围（原图 x 58~1294、y 768~1036 像素，含少量外扩余量） */
const BOX = { left: 2.8, top: 69.0, width: 63.2, height: 24.8 };

/** 锁形图标（未解锁状态展示） */
const LockIcon = () => (
  <svg viewBox="0 0 10 12" aria-hidden="true" fill="currentColor">
    <path d="M5 0a3 3 0 0 0-3 3v1h-.5A1.5 1.5 0 0 0 0 5.5v5A1.5 1.5 0 0 0 1.5 12h7A1.5 1.5 0 0 0 10 10.5v-5A1.5 1.5 0 0 0 8.5 4H8V3a3 3 0 0 0-3-3Zm0 1.2A1.8 1.8 0 0 1 6.8 3v1H3.2V3A1.8 1.8 0 0 1 5 1.2Z" />
  </svg>
);

export default function StampRewardOverlay({ missions, guideKey }) {
  const outfits = getRewardOutfits(guideKey);
  const completedCount = missions.filter(Boolean).length;
  const unlockedTotal = resolveUnlockedTotal(completedCount);
  // 「当前使用」与我的衣橱保持同一数据源：已保存且仍在解锁范围内才算当前使用，
  // 否则与衣橱一致回落到第 1 套（避免保存值越权显示为已装备）
  const savedOutfitKey = readSavedOutfitKey();
  const savedIndex = outfits.findIndex((outfit) => outfit.key === savedOutfitKey);
  const currentKey =
    savedIndex >= 0 && savedIndex < unlockedTotal ? savedOutfitKey : outfits[0].key;

  return (
    <section
      className="srp"
      style={{
        left: `${BOX.left}%`,
        top: `${BOX.top}%`,
        width: `${BOX.width}%`,
        height: `${BOX.height}%`
      }}
      aria-label={`奖励收集：已解锁 ${unlockedTotal} / ${outfits.length} 套服装`}
    >
      <ul className="srp-grid">
        {outfits.map((outfit, index) => {
          const unlocked = index < unlockedTotal;
          const isCurrent = unlocked && outfit.key === currentKey;
          const stateText = unlocked ? (isCurrent ? "当前使用" : "已解锁") : "未解锁";
          return (
            <li
              key={outfit.key}
              className={`srp-card ${unlocked ? "unlocked" : "locked"}`}
              title={`${outfit.label} · ${stateText}`}
            >
              <span className="srp-figure">
                <img src={outfit.image} alt={`${outfit.guideName} · ${outfit.label}`} loading="lazy" decoding="async" />
                {!unlocked && (
                  <span className="srp-lock" aria-hidden="true">
                    <LockIcon />
                  </span>
                )}
              </span>
              <span className="srp-name">{outfit.label}</span>
              <span className="srp-state">
                {!unlocked && <LockIcon />}
                {stateText}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
