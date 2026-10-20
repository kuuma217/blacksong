import { useEffect, useMemo, useState } from "react";
import { MAP_HEIGHT, MAP_WIDTH, findSpot } from "../data/scenicSpots.js";

/**
 * 路线结果面板
 *
 * 2026-10-19：左侧导览图不再用 SVG 手绘示意地形，改为真实的全域景点地图
 * （public/assets/scenic-map.webp，九个景点含图上标签），并在其上叠一层矢量路线：
 * - 站名 → scenicSpots 锚点（百分比坐标）→ viewBox 像素，因此地图任意缩放都对得准；
 * - 路线用 Catmull-Rom 转贝塞尔，顺着园区走向画弧线，不是生硬折线；
 * - 已走过的路段单独用实线覆盖，当前位置是脉冲点，编号节点随导航推进变勾；
 * - 站名的「建议停留 / 类别」直接来自景点数据，时间轴与地图共用同一份信息。
 */

const TENSION = 0.18;

const toPoint = (name) => {
  const spot = findSpot(name);
  if (!spot) return null;
  return {
    x: Number(((spot.x / 100) * MAP_WIDTH).toFixed(1)),
    y: Number(((spot.y / 100) * MAP_HEIGHT).toFixed(1)),
    spot
  };
};

// 连续重复的站点会产生零长度线段，先压掉
const compact = (points) => points.filter((point, index) => index === 0
  || point.x !== points[index - 1].x
  || point.y !== points[index - 1].y);

const smoothPath = (points) => {
  if (points.length < 2) return "";
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[i - 1] || points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;
    const c1x = p1.x + (p2.x - p0.x) * TENSION;
    const c1y = p1.y + (p2.y - p0.y) * TENSION;
    const c2x = p2.x - (p3.x - p1.x) * TENSION;
    const c2y = p2.y - (p3.y - p1.y) * TENSION;
    d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${p2.x} ${p2.y}`;
  }
  return d;
};

export default function RoutePanel({ route, onEditProfile, notify }) {
  const [navigationIndex, setNavigationIndex] = useState(0);
  const [navigating, setNavigating] = useState(false);

  const total = route.steps.length;
  const safeIndex = Math.min(navigationIndex, total - 1);

  // 换一条路线时回到起点，避免沿用上一条路线的导航进度
  useEffect(() => {
    setNavigationIndex(0);
    setNavigating(false);
  }, [route]);

  useEffect(() => {
    if (!navigating) return undefined;
    const timer = window.setInterval(() => {
      setNavigationIndex((current) => {
        if (current >= total - 1) {
          setNavigating(false);
          notify("已抵达路线终点，今天的灵山探索完成啦！", "success");
          return current;
        }
        return current + 1;
      });
    }, 1200);
    return () => window.clearInterval(timer);
  }, [navigating, notify, total]);

  const stepPoints = useMemo(() => route.steps.map(([name]) => toPoint(name)), [route.steps]);
  const routePoints = useMemo(() => compact(stepPoints.filter(Boolean)), [stepPoints]);
  const routePath = useMemo(() => smoothPath(routePoints), [routePoints]);
  const donePath = useMemo(() => {
    const done = compact(stepPoints.slice(0, safeIndex + 1).filter(Boolean));
    return done.length > 1 ? smoothPath(done) : "";
  }, [stepPoints, safeIndex]);

  const currentStep = route.steps[safeIndex] || route.steps[0];
  const nextStep = route.steps[Math.min(safeIndex + 1, total - 1)] || currentStep;
  const currentSpot = findSpot(currentStep?.[0]);
  const nextSpot = findSpot(nextStep?.[0]);
  const currentPoint = stepPoints[safeIndex] || routePoints[routePoints.length - 1] || null;
  const atEnd = safeIndex >= total - 1;

  // 多日行程按天分组；单日行程不显示天标题
  const timelineGroups = useMemo(() => {
    const groups = [];
    route.steps.forEach((item, index) => {
      const dayNo = item[3] || 1;
      let group = groups.find((entry) => entry.day === dayNo);
      if (!group) {
        group = { day: dayNo, items: [] };
        groups.push(group);
      }
      group.items.push({ step: item, index });
    });
    return groups;
  }, [route.steps]);
  const multiDay = timelineGroups.length > 1;

  const startNavigation = () => {
    if (atEnd) setNavigationIndex(0);
    setNavigating(true);
    notify("模拟导航已启动：弱 GPS 环境将融合景点二维码与蓝牙信标定位");
  };

  return (
    <section className="visitor-panel active">
      <div className="route-toolbar">
        <div>
          <p className="eyebrow">你的灵山{route.days > 1 ? `${route.days}日` : "一日"}</p>
          <h2>{route.title}</h2>
          <p>根据“{route.reason}”为你生成</p>
        </div>
        <button className="secondary-button" onClick={onEditProfile}>调整偏好</button>
      </div>

      <div className="route-layout">
        <article className="map-card">
          <div className="map-head">
            <div><span className="tiny-label">全域导览图 · 九大景点</span><strong>灵山胜境 · 九景环线</strong></div>
            <span className="gps-pill"><i /> GPS 较弱 · 融合定位</span>
          </div>

          <div className="scenic-map">
            <img
              className="scenic-map-bg"
              src={`${import.meta.env.BASE_URL}assets/scenic-map.webp`}
              alt="灵山胜境全域景点地图：灵山大佛、梵宫、祥符禅寺、五印坛城、百子戏弥勒、九龙灌浴、香水海、灵山照壁、灵山蔬食馆"
            />
            <span className="scenic-map-veil" aria-hidden="true" />

            <svg
              className="scenic-map-overlay"
              viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
              role="img"
              aria-label={`路线地图，共 ${total} 站，当前位于${currentStep?.[0] || "起点"}`}
            >
              {routePath && <path className="scenic-route-halo" d={routePath} />}
              {routePath && <path className="scenic-route-line" d={routePath} />}
              {donePath && <path className="scenic-route-done" d={donePath} />}

              {/* 当前位置的脉冲环画在节点下方，编号仍然清晰可读 */}
              {currentPoint && (
                <g className="scenic-live" transform={`translate(${currentPoint.x} ${currentPoint.y})`}>
                  <circle className="scenic-live-ring" r="24" />
                  <circle className="scenic-live-core" r="7" />
                </g>
              )}

              {stepPoints.map((point, index) => {
                if (!point) return null;
                const status = [
                  index === 0 ? "is-start" : "",
                  index === total - 1 ? "is-end" : "",
                  index < safeIndex ? "is-passed" : "",
                  index === safeIndex ? "is-current" : ""
                ].filter(Boolean).join(" ");
                const label = index < safeIndex
                  ? "✓"
                  : index === 0
                    ? "起"
                    : index === total - 1
                      ? "终"
                      : String(index + 1);
                return (
                  <g
                    className={`scenic-node ${status}`}
                    transform={`translate(${point.x} ${point.y})`}
                    key={`${point.spot.id}-${index}`}
                  >
                    <circle className="scenic-node-halo" r="19" />
                    <circle className="scenic-node-core" r="14" />
                    <text>{label}</text>
                  </g>
                );
              })}
            </svg>

            <div className="scenic-legend" aria-hidden="true">
              <span><i className="is-start" />起点</span>
              <span><i className="is-mid" />途经</span>
              <span><i className="is-live" />当前位置</span>
            </div>
          </div>

          <div className="map-status">
            <span className="map-status-pin" aria-hidden="true">📍</span>
            <div>
              <strong>{atEnd && !navigating ? `已抵达${currentStep?.[0] || "终点"}` : `你在${currentStep?.[0] || "起点"}附近`}</strong>
              <small>
                {atEnd
                  ? `路线终点 · 建议停留 ${currentSpot?.stay || 20} 分钟`
                  : `下一站 ${nextStep?.[0] || "终点"} · ${currentSpot ? `本站建议停留 ${currentSpot.stay} 分钟` : "导航进行中"}`}
              </small>
            </div>
            <span className="map-status-step">第 {safeIndex + 1} / {total} 站</span>
          </div>

          <div className="map-actions">
            <button onClick={startNavigation}>{navigating ? "导航进行中…" : "开始模拟导航"}</button>
            <button onClick={() => notify("离线地图包已加入下载队列（演示）", "success")}>下载离线地图</button>
            <button onClick={() => { setNavigationIndex(0); setNavigating(false); notify("已回到初始定位点"); }}>回到当前位置</button>
          </div>

          {/* 当前站点档案：类别 / 看点 / 建议停留全部来自 scenicSpots，和地图编号一一对应 */}
          {currentSpot && (
            <div className="spot-profile">
              <div className="spot-profile-head">
                <span className="spot-profile-tag">{currentSpot.category}</span>
                <strong>{currentSpot.name}</strong>
                <em>{currentSpot.tagline}</em>
              </div>
              <p>{currentSpot.intro}</p>
              <div className="spot-profile-chips">
                {currentSpot.highlights.map((item) => <span key={item}>{item}</span>)}
                <span className="is-stay">建议停留 {currentSpot.stay} 分钟</span>
              </div>
            </div>
          )}

          {/* 当前景点的数字人提示，跟着档案卡一起放在地图下方 */}
          <div className="route-advice">
            <span>数字人建议{currentSpot ? ` · ${currentSpot.name}` : ""}</span>
            <p>{currentSpot?.note || "演出时间以景区当日公告为准；系统会结合天气、体力和拥挤度动态调整顺序。"}</p>
          </div>
        </article>

        <aside className="route-timeline">
          <div className="route-summary">
            <div><span>预计用时</span><strong>{route.duration}</strong></div>
            <div><span>步行距离</span><strong>{route.distance}</strong></div>
            <div><span>舒适指数</span><strong>{route.comfort}</strong></div>
            {route.budget && <div><span>人均预算</span><strong>{route.budget}</strong></div>}
          </div>
          <div className="timeline-list">
            {timelineGroups.map((group) => (
              <div className="timeline-day" key={group.day}>
                {multiDay && <p className="timeline-day-label">第 {group.day} 天 · {group.items.length} 站</p>}
                {group.items.map(({ step: [name, description, time], index }) => {
                  const spot = findSpot(name);
                  return (
                    <article className={`timeline-item ${index < safeIndex ? "complete" : ""} ${index === safeIndex ? "current" : ""}`} key={`${name}-${time}-${index}`}>
                      <span className="timeline-dot">{index < safeIndex ? "✓" : String(index + 1).padStart(2, "0")}</span>
                      <div>
                        <small>{time}</small>
                        <strong>{name}</strong>
                        <p>{description}</p>
                        {spot && <span className="timeline-stay">建议停留 {spot.stay} 分钟 · {spot.category}</span>}
                      </div>
                    </article>
                  );
                })}
              </div>
            ))}
          </div>
          {route.perks?.length > 0 && (
            <div className="route-perks">
              <span>预算内含</span>
              <div>{route.perks.map((perk) => <em key={perk}>{perk}</em>)}</div>
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}
