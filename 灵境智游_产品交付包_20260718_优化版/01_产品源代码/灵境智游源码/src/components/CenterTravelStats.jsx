import { checkinBackgrounds } from "../data/checkinBackgrounds.js";
import { REWARD_OUTFITS, resolveUnlockedTotal } from "../data/rewardOutfits.js";

/**
 * 个人中心 · 我的旅行数据：底图印死的四个统计块替换为真实组件
 *
 * 坐标由 profile-center.webp（1962×1109）逐像素测量：
 *   白色统计面板 x 439~1078、y 351~540；行内四格均分。
 *
 * 2026-10-20 调整：
 *   1. 「累计出行天数」整块下线（画面里没有可统计的真实数据）；
 *   2. 「打卡景点」与打卡集章共用同一份 missions：已打卡数 / 景点总数（4）；
 *   3. 「解锁装扮」沿用我的装扮奖励同一套解锁规则（resolveUnlockedTotal），分母为七套装扮；
 *   4. 「累计里程」直接取个性路线页当前路线的里程（activeRoute.distance），随路线生成实时同步；
 *   5. 三格均为真实按钮，分别跳转打卡集章 / 我的装扮 / 个性路线。
 */
const BOX = [22.3, 31.55, 32.76, 17.3];

const SpotIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 20.6s6.3-5.3 6.3-10A6.3 6.3 0 0 0 5.7 10.6c0 4.7 6.3 10 6.3 10Z" />
    <path d="m9.3 10.4 2 2 3.5-3.6" />
  </svg>
);

const OutfitIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 4.4a1.7 1.7 0 1 1 1.7 1.7c-.9 0-1.7.6-1.7 1.6v1.1" />
    <path d="M12 8.8 3.9 13.9c-.8.5-.4 1.8.6 1.8h15c1 0 1.4-1.3.6-1.8L12 8.8Z" />
  </svg>
);

const RouteIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6 20.4V5.6" />
    <path d="M6 5.6h9.6l-1.7 3.1 1.7 3.1H6" />
    <path d="M15.6 20.4h-4" strokeDasharray="1 2.6" />
  </svg>
);

export default function CenterTravelStats({
  missions = [],
  routeDistance = "",
  onGoStamp,
  onGoWardrobe,
  onGoRoute
}) {
  const totalSpots = checkinBackgrounds.length;
  const completedCount = missions.filter(Boolean).length;
  const totalOutfits = REWARD_OUTFITS.length;
  const unlockedOutfits = resolveUnlockedTotal(completedCount);
  // 里程文案直接沿用个性路线页的路线里程（形如 "5.2km" / "约 5.2 km"），只拆成数字与单位排版
  const kmMatch = String(routeDistance || "").match(/[\d.]+/);
  const km = kmMatch ? kmMatch[0] : null;

  const stats = [
    {
      key: "spots",
      label: "打卡景点",
      icon: <SpotIcon />,
      value: (
        <>
          <strong>{completedCount}</strong>
          <em>/ {totalSpots}</em>
        </>
      ),
      hint: `打卡景点 ${completedCount} / ${totalSpots}，点击去打卡集章`,
      onClick: onGoStamp
    },
    {
      key: "outfits",
      label: "解锁装扮",
      icon: <OutfitIcon />,
      value: (
        <>
          <strong>{unlockedOutfits}</strong>
          <em>/ {totalOutfits}</em>
        </>
      ),
      hint: `解锁装扮 ${unlockedOutfits} / ${totalOutfits}，点击去我的装扮`,
      onClick: onGoWardrobe
    },
    {
      key: "distance",
      label: "累计里程",
      icon: <RouteIcon />,
      value: km ? (
        <>
          <em>约</em>
          <strong>{km}</strong>
          <em>km</em>
        </>
      ) : (
        <em>暂无路线</em>
      ),
      hint: km ? `累计里程 约 ${km} km，点击去个性路线` : "暂无路线，点击去个性路线",
      onClick: onGoRoute
    }
  ];

  return (
    <section
      className="design-rail cts-box"
      style={{ left: `${BOX[0]}%`, top: `${BOX[1]}%`, width: `${BOX[2]}%`, height: `${BOX[3]}%` }}
      aria-label="我的旅行数据"
    >
      <div className="cts-panel">
        {stats.map((stat) => (
          <button
            key={stat.key}
            type="button"
            className="cts-cell"
            title={stat.hint}
            aria-label={stat.hint}
            onClick={stat.onClick}
          >
            <span className="cts-icon" aria-hidden="true">{stat.icon}</span>
            <span className="cts-label">{stat.label}</span>
            <span className="cts-value">{stat.value}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
