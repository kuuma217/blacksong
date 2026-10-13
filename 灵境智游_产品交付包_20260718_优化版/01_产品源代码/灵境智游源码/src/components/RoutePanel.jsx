import { useEffect, useMemo, useState } from "react";

const mapPoints = [
  [70, 450], [205, 335], [356, 262], [514, 190], [722, 69]
];

export default function RoutePanel({ route, onEditProfile, notify }) {
  const [navigationIndex, setNavigationIndex] = useState(0);
  const [navigating, setNavigating] = useState(false);

  useEffect(() => {
    if (!navigating) return undefined;
    const timer = window.setInterval(() => {
      setNavigationIndex((current) => {
        if (current >= mapPoints.length - 1) {
          setNavigating(false);
          notify("已抵达路线终点，今天的灵山探索完成啦！", "success");
          return current;
        }
        return current + 1;
      });
    }, 1200);
    return () => window.clearInterval(timer);
  }, [navigating, notify]);

  const currentPoint = mapPoints[navigationIndex];
  const currentStep = route.steps[Math.min(navigationIndex, route.steps.length - 1)];
  const nextStep = route.steps[Math.min(navigationIndex + 1, route.steps.length - 1)];
  const progressOpacity = useMemo(() => 0.35 + (navigationIndex / (mapPoints.length - 1)) * 0.65, [navigationIndex]);

  const startNavigation = () => {
    if (navigationIndex >= mapPoints.length - 1) setNavigationIndex(0);
    setNavigating(true);
    notify("模拟导航已启动：弱 GPS 环境将融合景点二维码与蓝牙信标定位");
  };

  return (
    <section className="visitor-panel active">
      <div className="route-toolbar">
        <div>
          <p className="eyebrow">你的灵山一日</p>
          <h2>{route.title}</h2>
          <p>根据“{route.reason}”为你生成</p>
        </div>
        <button className="secondary-button" onClick={onEditProfile}>调整偏好</button>
      </div>

      <div className="route-layout">
        <article className="map-card">
          <div className="map-head">
            <div><span className="tiny-label">风格化导览图</span><strong>灵山胜境 · 当前定位</strong></div>
            <span className="gps-pill"><i /> GPS 较弱 · 融合定位</span>
          </div>
          <div className="scenic-map">
            <svg viewBox="0 0 800 500" role="img" aria-label="灵山胜境风格化路线地图">
              <defs>
                <linearGradient id="mapBgReact" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#edf2e9" /><stop offset="1" stopColor="#dbe7df" />
                </linearGradient>
              </defs>
              <rect width="800" height="500" rx="34" fill="url(#mapBgReact)" />
              <path d="M0 355C130 305 230 370 350 327s241-38 450-120v293H0Z" fill="#d1dfd4" />
              <path d="M0 402c132-53 254-14 352-38 134-33 223-96 448-111" fill="none" stroke="#aac7bb" strokeWidth="34" opacity=".55" />
              <path d="M70 450C112 394 160 390 205 335S310 282 356 262s117-14 158-72 91-88 208-121" className="route-path" />
              <path d="M70 450C112 394 160 390 205 335S310 282 356 262s117-14 158-72 91-88 208-121" className="route-progress" style={{ opacity: progressOpacity }} />
              {mapPoints.map(([x, y], index) => (
                <g className={`map-node ${index === navigationIndex ? "current" : ""} ${index === 4 ? "destination" : ""}`} transform={`translate(${x} ${y})`} key={`${x}-${y}`}>
                  <circle r={index === 0 || index === 4 ? 21 : 18} /><text y="6">{index === 0 ? "起" : index === 4 ? "终" : index}</text>
                </g>
              ))}
              <g className="map-label" transform="translate(42 408)"><rect width="98" height="34" rx="17" /><text x="49" y="22">灵山照壁</text></g>
              <g className="map-label" transform="translate(148 285)"><rect width="114" height="34" rx="17" /><text x="57" y="22">九龙灌浴</text></g>
              <g className="map-label" transform="translate(314 212)"><rect width="84" height="34" rx="17" /><text x="42" y="22">梵宫</text></g>
              <g className="map-label" transform="translate(466 140)"><rect width="106" height="34" rx="17" /><text x="53" y="22">五印坛城</text></g>
              <g className="map-label" transform="translate(669 18)"><rect width="106" height="34" rx="17" /><text x="53" y="22">灵山大佛</text></g>
              <g className="location-dot" transform={`translate(${currentPoint[0]} ${currentPoint[1]})`}><circle r="11" /><circle r="22" /></g>
              <path d="M35 120c58-79 110-41 147-90 23 59 90 44 119 111-92-22-165-7-266-21Z" fill="#c1d5c9" opacity=".8" />
              <path d="M548 455c38-79 91-73 127-140 34 65 77 72 125 140Z" fill="#bdd2c5" opacity=".85" />
            </svg>
            <div className="map-tip">
              <span>📍</span><div><strong>你在{currentStep[0]}附近</strong><small>{navigationIndex === 4 ? "已抵达终点" : `下一站 ${nextStep[0]} · 导航进行中`}</small></div>
            </div>
          </div>
          <div className="map-actions">
            <button onClick={startNavigation}>{navigating ? "导航进行中…" : "开始模拟导航"}</button>
            <button onClick={() => notify("离线地图包已加入下载队列（演示）", "success")}>下载离线地图</button>
            <button onClick={() => { setNavigationIndex(0); setNavigating(false); notify("已回到初始定位点"); }}>回到当前位置</button>
          </div>
        </article>

        <aside className="route-timeline">
          <div className="route-summary">
            <div><span>预计用时</span><strong>{route.duration}</strong></div>
            <div><span>步行距离</span><strong>{route.distance}</strong></div>
            <div><span>舒适指数</span><strong>{route.comfort}</strong></div>
          </div>
          <div className="timeline-list">
            {route.steps.map(([name, description, time], index) => (
              <article className={`timeline-item ${index < navigationIndex ? "complete" : ""} ${index === navigationIndex ? "current" : ""}`} key={`${name}-${time}`}>
                <span className="timeline-dot">{index < navigationIndex ? "✓" : String(index + 1).padStart(2, "0")}</span>
                <div><small>{time}</small><strong>{name}</strong><p>{description}</p></div>
              </article>
            ))}
          </div>
          <div className="route-advice"><span>数字人建议</span><p>演出时间以景区当日公告为准；系统会结合天气、体力和拥挤度动态调整顺序。</p></div>
        </aside>
      </div>
    </section>
  );
}
