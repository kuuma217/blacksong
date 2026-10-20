import { useMemo } from "react";
import { spots as allSpots } from "../data/spots.js";

// 景区导览真实交互面板：分类筛选 + 景点列表 + 详情 + 行动按钮
// 与设计稿整页（scenic-guide.webp）的透明热区联动：热区改状态，这里即时呈现结果
export default function ScenicPanel({
  categories,
  category,
  onCategoryChange,
  spots: visibleSpots,
  activeKey,
  onSelect,
  onAsk,
  onPlan,
  onCheckin,
  // scoped：按分类进入时不展示全部分类切换，只呈现当前分类的内容
  scoped = false
}) {
  const active = useMemo(
    () => visibleSpots.find((spot) => spot.key === activeKey) || visibleSpots[0] || null,
    [visibleSpots, activeKey]
  );

  const categoryLabel = categories.find((item) => item.key === category)?.label || "全部景点";

  // 分类计数基于全量景点，避免筛选后其它分类显示为 0
  const countOf = (key) =>
    key === "all" ? allSpots.length : allSpots.filter((spot) => spot.categories.includes(key)).length;

  return (
    <section className="visitor-panel active">
      <div className="route-toolbar">
        <div>
          <p className="eyebrow">景区导览{scoped && category !== "all" ? ` · ${categoryLabel}` : ""}</p>
          <h2>{scoped && category !== "all" ? categoryLabel : "灵山胜境 · 景点一览"}</h2>
          <p>
            当前分类：{categoryLabel} · 共 {visibleSpots.length} 个景点
            {scoped && category !== "all" ? "（仅展示该分类的景点）" : ""}
          </p>
        </div>
        <button className="secondary-button" onClick={onPlan}>规划我的路线</button>
      </div>

      {!scoped && (
        <div className="scenic-filters">
          {categories.map((item) => (
            <button
              key={item.key}
              className={`filter-chip${item.key === category ? " active" : ""}`}
              aria-pressed={item.key === category}
              onClick={() => onCategoryChange(item.key)}
            >
              {item.label}
              <span>{countOf(item.key)}</span>
            </button>
          ))}
        </div>
      )}

      {visibleSpots.length === 0 ? (
        <div className="scenic-empty">该分类暂无景点，换个分类看看吧</div>
      ) : (
        <div className="scenic-layout">
          <div className="scenic-list">
            {visibleSpots.map((spot, index) => (
              <article
                key={spot.key}
                className={`scenic-item${spot.key === active?.key ? " current" : ""}`}
              >
                <button onClick={() => onSelect(spot.key)} aria-label={`查看${spot.name}详情`}>
                  {/* 景点实景缩略图：图片来自 pictures 文件夹，已转 webp */}
                  {spot.image && (
                    <span className="scenic-item-thumb">
                      <img src={spot.image} alt="" decoding="async" />
                    </span>
                  )}
                  <span className="scenic-item-index">{String(index + 1).padStart(2, "0")}</span>
                  <span className="scenic-item-main">
                    <strong>
                      {spot.name}
                      <em>{spot.badge}</em>
                    </strong>
                    <small>{spot.highlight}</small>
                    <span className="scenic-tags">
                      {spot.tags.map((tag) => (
                        <i key={tag}>{tag}</i>
                      ))}
                    </span>
                  </span>
                </button>
              </article>
            ))}
          </div>

          {active && (
            <aside className="scenic-detail">
              <p className="eyebrow">{active.badge}</p>
              <h3>{active.name}</h3>
              <p className="scenic-detail-intro">{active.intro}</p>

              <div className="scenic-meta">
                <div><span>开放时间</span><strong>{active.hours}</strong></div>
                <div><span>票务</span><strong>{active.ticket}</strong></div>
                <div><span>建议时长</span><strong>{active.duration}</strong></div>
              </div>

              <p className="scenic-highlight">✨ {active.highlight}</p>

              <div className="scenic-actions">
                <button onClick={() => onAsk(active)}>向数字人提问</button>
                <button onClick={onPlan}>AI规划路线</button>
                <button onClick={() => onCheckin(active)}>去这里打卡</button>
              </div>

              <p className="scenic-hint">
                {scoped && category !== "all"
                  ? `当前只展示「${categoryLabel}」的景点，关闭弹窗可在导览页选择其它分类。`
                  : "分类与地图定位会同步联动：点击地图上的定位点，这里会自动切换。"}
              </p>
            </aside>
          )}
        </div>
      )}
    </section>
  );
}
