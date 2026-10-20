import { useMemo } from "react";
import { spotCategoryLabel, spotDetails, spotTips, spots as allSpots } from "../data/spots.js";

// 景点详情弹窗：比侧栏更全面的单个景点信息（大图 + 档案 + 贴士 + 同类推荐）
export default function SpotDetailModal({ spotKey, onClose, onSelect, onAsk, onPlan, onCheckin }) {
  const spot = useMemo(
    () => allSpots.find((item) => item.key === spotKey) || allSpots[0],
    [spotKey]
  );

  // 同类推荐：同分类的其它景点，最多 3 个
  const related = useMemo(
    () =>
      allSpots
        .filter((item) => item.key !== spot.key && item.categories.some((c) => spot.categories.includes(c)))
        .slice(0, 3),
    [spot]
  );

  const tips = spotTips[spot.key] || [];
  const details = spotDetails[spot.key] || [];
  const categories = spot.categories.map((key) => spotCategoryLabel(key)).join(" · ");

  return (
    <div
      className="scenic-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label={`${spot.name} · 景点详情`}
      onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
    >
      <div className="scenic-modal spot-detail">
        <button type="button" className="scenic-modal-close" onClick={onClose} aria-label="关闭景点详情">×</button>

        <div className="spot-detail-hero">
          <img src={spot.image} alt={`${spot.name}实景`} />
          <div className="spot-detail-hero-mask">
            <p className="spot-detail-eyebrow">{categories}</p>
            <h2>{spot.name}</h2>
            <span className="spot-detail-badge">{spot.badge}</span>
          </div>
        </div>

        <p className="spot-detail-highlight">✨ {spot.highlight}</p>

        <div className="spot-detail-section">
          <h3>概览</h3>
          <p className="spot-detail-intro">{spot.intro}</p>
        </div>

        {details.length > 0 && (
          <div className="spot-detail-section">
            <h3>详细介绍</h3>
            {details.map((paragraph) => (
              <p key={paragraph} className="spot-detail-story">{paragraph}</p>
            ))}
          </div>
        )}

        <div className="spot-detail-grid">
          <div><span>开放时间</span><strong>{spot.hours}</strong></div>
          <div><span>票务</span><strong>{spot.ticket}</strong></div>
          <div><span>建议时长</span><strong>{spot.duration}</strong></div>
          <div><span>所属分类</span><strong>{categories}</strong></div>
        </div>

        <div className="spot-detail-section">
          <h3>游览贴士</h3>
          <ul className="spot-detail-tips">
            {tips.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        </div>

        <div className="spot-detail-section">
          <h3>标签</h3>
          <div className="spot-detail-tags">
            {spot.tags.map((tag) => (
              <i key={tag}>{tag}</i>
            ))}
          </div>
        </div>

        {related.length > 0 && (
          <div className="spot-detail-section">
            <h3>同类推荐</h3>
            <div className="spot-detail-related">
              {related.map((item) => (
                <button key={item.key} type="button" onClick={() => onSelect(item.key)}>
                  <img src={item.image} alt="" />
                  <strong>{item.name}</strong>
                  <small>{item.badge}</small>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="spot-detail-actions">
          <button type="button" onClick={() => onAsk(spot)}>向数字人提问</button>
          <button type="button" onClick={() => onPlan(spot)}>AI规划路线</button>
          <button type="button" onClick={() => onCheckin(spot)}>去这里打卡</button>
        </div>
      </div>
    </div>
  );
}
