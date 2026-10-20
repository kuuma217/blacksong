import { useEffect, useMemo, useState } from "react";
import { spotCategoryLabel, spotTips, spots as allSpots } from "../data/spots.js";

// 景点场景视图：从地图上点选的位置放大推入该景点的实景场景
export default function ScenicScene({
  spotKey, origin, closing, onBack, onSelect, onDetail, onAsk, onPlan, onCheckin, onPano
}) {
  const spot = useMemo(
    () => allSpots.find((item) => item.key === spotKey) || allSpots[0],
    [spotKey]
  );
  const index = allSpots.findIndex((item) => item.key === spot.key);
  const tips = spotTips[spot.key] || [];
  const categories = spot.categories.map((key) => spotCategoryLabel(key)).join(" · ");
  const [parallax, setParallax] = useState({ x: 0, y: 0 });

  // 键盘操作：左右切换景点，Esc / 退格 返回全景
  useEffect(() => {
    const onKey = (event) => {
      if (event.key === "ArrowLeft") {
        onSelect(allSpots[(index - 1 + allSpots.length) % allSpots.length].key);
      } else if (event.key === "ArrowRight") {
        onSelect(allSpots[(index + 1) % allSpots.length].key);
      } else if (event.key === "Escape") {
        onBack();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, onSelect, onBack]);

  const handleMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    setParallax({ x: -x * 26, y: -y * 18 });
  };

  return (
    <div
      className={`scene-view${closing ? " is-closing" : ""}`}
      style={{ transformOrigin: `${origin?.x ?? 50}% ${origin?.y ?? 50}%` }}
    >
      <div className="scene-photo-wrap" onMouseMove={handleMove}>
        <div className="scene-photo-parallax" style={{ transform: `translate3d(${parallax.x}px, ${parallax.y}px, 0)` }}>
          <img key={spot.key} className="scene-photo" src={spot.image} alt={`${spot.name}实景`} />
        </div>
        <div className="scene-scrim" />
      </div>

      <div className="scene-top">
        <div className="scene-top-left">
          <button type="button" className="scene-back" onClick={onBack}>
            <span>←</span> 返回全景
          </button>
          <span className="scene-crumb">景区导览 / {categories} / {spot.name}</span>
        </div>
        <div className="scene-top-right">
          <button type="button" onClick={() => onSelect(allSpots[(index - 1 + allSpots.length) % allSpots.length].key)}>‹ 上一景</button>
          <button type="button" onClick={() => onSelect(allSpots[(index + 1) % allSpots.length].key)}>下一景 ›</button>
          <button type="button" onClick={onPano}>全景长卷</button>
        </div>
      </div>

      <div className="scene-body">
        <div className="scene-main">
          <span className="scene-eyebrow">{categories}</span>
          <h3>
            {spot.name}
            <em>{spot.badge}</em>
          </h3>
          <p className="scene-highlight">✨ {spot.highlight}</p>
          <p className="scene-intro">{spot.intro}</p>
        </div>
        <div className="scene-side">
          <div className="scene-facts">
            <div><span>开放时间</span><strong>{spot.hours}</strong></div>
            <div><span>票务</span><strong>{spot.ticket}</strong></div>
            <div><span>建议时长</span><strong>{spot.duration}</strong></div>
          </div>
          <ul className="scene-tips">
            {tips.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="scene-actions">
        <button type="button" className="scene-action-main" onClick={() => onDetail(spot)}>查看详情</button>
        <button type="button" onClick={() => onAsk(spot)}>向数字人提问</button>
        <button type="button" onClick={() => onPlan(spot)}>AI规划路线</button>
        <button type="button" onClick={() => onCheckin(spot)}>去这里打卡</button>
      </div>

      <div className="scene-strip">
        {allSpots.map((item, itemIndex) => (
          <button
            key={item.key}
            type="button"
            className={`scene-chip${item.key === spot.key ? " is-active" : ""}`}
            onClick={() => onSelect(item.key)}
            aria-label={item.name}
          >
            <span className="scene-chip-no">{String(itemIndex + 1).padStart(2, "0")}</span>
            <img src={item.image} alt="" />
            <span className="scene-chip-name">{item.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
