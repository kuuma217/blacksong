import { checkinBackgrounds } from "../data/checkinBackgrounds.js";
import { REWARD_OUTFITS, resolveUnlockedTotal } from "../data/rewardOutfits.js";

/**
 * 个人中心 · 左侧人物卡下方的三项统计替换为真实组件
 *
 * 底图 profile-center.webp（1962×1109）上印死了「12 已打卡景点 / 5 已解锁装扮 / 3 收藏路线」，
 * 这里用同位置的深青绿色玻璃条覆盖，只保留两项真实数据：
 *   已打卡景点 = 打卡集章 missions 的完成数（景点共 4）
 *   已解锁装扮 = 我的装扮奖励同一套解锁规则（装扮共 7）
 * 「收藏路线」连同数字 3 整项下线，两格在整条内均分。
 */
const BOX = [1.55, 46.1, 19.1, 7.6];

export default function CenterProfileStats({ missions = [], onGoStamp, onGoWardrobe }) {
  const totalSpots = checkinBackgrounds.length;
  const completedCount = missions.filter(Boolean).length;
  const totalOutfits = REWARD_OUTFITS.length;
  const unlockedOutfits = resolveUnlockedTotal(completedCount);

  const stats = [
    {
      key: "spots",
      label: "已打卡景点",
      value: completedCount,
      hint: `已打卡景点 ${completedCount} / ${totalSpots}，点击去打卡集章`,
      onClick: onGoStamp
    },
    {
      key: "outfits",
      label: "已解锁装扮",
      value: unlockedOutfits,
      hint: `已解锁装扮 ${unlockedOutfits} / ${totalOutfits}，点击去我的装扮`,
      onClick: onGoWardrobe
    }
  ];

  return (
    <section
      className="design-rail cps-box"
      style={{ left: `${BOX[0]}%`, top: `${BOX[1]}%`, width: `${BOX[2]}%`, height: `${BOX[3]}%` }}
      aria-label="我的统计：已打卡景点、已解锁装扮"
    >
      <div className="cps-panel">
        {stats.map((stat) => (
          <button
            key={stat.key}
            type="button"
            className="cps-cell"
            title={stat.hint}
            aria-label={stat.hint}
            onClick={stat.onClick}
          >
            <strong className="cps-value">{stat.value}</strong>
            <span className="cps-label">{stat.label}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
