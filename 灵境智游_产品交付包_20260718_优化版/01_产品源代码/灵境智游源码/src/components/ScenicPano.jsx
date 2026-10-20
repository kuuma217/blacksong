import { useEffect, useRef, useState } from "react";

// 景区全景漫游：横向长卷，可拖动环视 / 自动漫游，长卷上的景点标注可点选
const PANO_RATIO = 10.03; // 全景图宽高比
const VIEW_RATIO = 16 / 7; // 视口宽高比
const TRACK_RATIO = PANO_RATIO / VIEW_RATIO; // 长卷相对视口的宽度倍数
const MAX_SHIFT = 100 * (1 - 1 / TRACK_RATIO); // 进度 0→1 对应的位移百分比
const AUTO_SPEED = 0.05; // 自动漫游速度（每秒进度）
const IDLE_MS = 2600; // 手动操作后暂停自动漫游的时长
const INITIAL = 0.5; // 初始视点（长卷中部）

export default function ScenicPano({ alt, markers, rail, railBox, nav, onBack }) {
  const viewRef = useRef(null);
  const trackRef = useRef(null);
  const barRef = useRef(null);
  const [auto, setAuto] = useState(true);
  const [dragging, setDragging] = useState(false);
  const live = useRef({
    progress: INITIAL, dir: 1, auto: true, active: false,
    startX: 0, startProgress: 0, moved: 0, idleUntil: 0
  });

  const windowWidth = 100 / TRACK_RATIO;

  // 进度 → DOM：直接写 transform / left，不走 React 状态。
  // 自动漫游每帧都会变化，若用 setState 会让整棵子树（长卷图 + 9 个标注）每帧重渲染，
  // 与图片解码叠加就会出现「图片在闪」的现象。
  const applyProgress = (value) => {
    const next = Math.min(1, Math.max(0, value));
    live.current.progress = next;
    if (trackRef.current) {
      trackRef.current.style.transform = `translateX(${-(next * MAX_SHIFT)}%)`;
    }
    if (barRef.current) {
      barRef.current.style.left = `${next * (100 - windowWidth)}%`;
    }
  };

  // 自动漫游：左右往复，手动操作期间暂停
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const tick = (now) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const s = live.current;
      if (s.auto && now > s.idleUntil) {
        let next = s.progress + s.dir * AUTO_SPEED * dt;
        if (next >= 1) { next = 1; s.dir = -1; }
        if (next <= 0) { next = 0; s.dir = 1; }
        applyProgress(next);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => { live.current.auto = auto; }, [auto]);

  const pauseAuto = (ms = IDLE_MS) => { live.current.idleUntil = performance.now() + ms; };

  const handleDown = (event) => {
    const s = live.current;
    s.active = true;
    s.startX = event.clientX;
    s.startProgress = s.progress;
    s.moved = 0;
    setDragging(true);
    pauseAuto(Number.MAX_SAFE_INTEGER);
    try { event.currentTarget.setPointerCapture(event.pointerId); } catch { /* 部分浏览器不支持 */ }
  };

  const handleMove = (event) => {
    const s = live.current;
    if (!s.active || !viewRef.current) return;
    const dx = event.clientX - s.startX;
    s.moved = Math.max(s.moved, Math.abs(dx));
    const span = Math.max(viewRef.current.clientWidth * (TRACK_RATIO - 1), 1);
    applyProgress(s.startProgress - dx / span);
  };

  const handleUp = () => {
    const s = live.current;
    if (!s.active) return;
    s.active = false;
    setDragging(false);
    pauseAuto();
  };

  const nudge = (delta) => {
    applyProgress(live.current.progress + delta);
    pauseAuto();
  };

  // 把视野移到某个位置并居中（pos 为景点在长卷上的百分比位置）
  const centerOn = (pos) =>
    Math.min(1, Math.max(0, (pos / 100 * TRACK_RATIO - 0.5) / (TRACK_RATIO - 1)));

  // 点长卷上的景点：先把视野移过去，再定位该景点（侧栏随之切换）
  const pick = (marker) => {
    if (live.current.moved > 6) return; // 拖动结束不算点击
    applyProgress(centerOn(marker.pos));
    pauseAuto(1600);
    if (marker.onClick) marker.onClick();
  };

  return (
    <div
      className={`pano-view${dragging ? " is-dragging" : ""}`}
      ref={viewRef}
      onPointerDown={handleDown}
      onPointerMove={handleMove}
      onPointerUp={handleUp}
      onPointerLeave={handleUp}
      onPointerCancel={handleUp}
    >
      <div
        className="pano-track"
        ref={trackRef}
        style={{ width: `${TRACK_RATIO * 100}%`, transform: `translateX(${-(INITIAL * MAX_SHIFT)}%)` }}
      >
        <img src={`${import.meta.env.BASE_URL}assets/scenic-pano.webp`} alt={alt} draggable="false" />
        {(markers || []).map((marker) => (
          <button
            key={marker.key}
            type="button"
            className={`pano-marker${marker.active ? " is-active" : ""}`}
            style={{ left: `${marker.pos}%` }}
            aria-label={marker.label}
            onClick={() => pick(marker)}
          >
            <span className="pano-marker-dot">{marker.icon}</span>
            <span className="pano-marker-label">{marker.label}</span>
          </button>
        ))}
      </div>

      {nav && (
        <div className="pano-nav">
          <button type="button" className="pano-back" onClick={onBack}>← 返回全景</button>
          <div className="pano-nav-links">
            {nav.map((item) => (
              <button key={item.label} type="button" onClick={item.onClick}>{item.label}</button>
            ))}
          </div>
        </div>
      )}

      <div className="pano-controls">
        <button type="button" onClick={() => nudge(-0.12)} aria-label="向左环视">‹</button>
        <button
          type="button"
          className={`pano-auto${auto ? " is-on" : ""}`}
          onClick={() => { setAuto((v) => !v); pauseAuto(0); }}
        >
          {auto ? "暂停漫游" : "自动漫游"}
        </button>
        <button type="button" onClick={() => nudge(0.12)} aria-label="向右环视">›</button>
      </div>

      <div className="pano-progress" aria-hidden="true">
        <span ref={barRef} style={{ left: `${INITIAL * (100 - windowWidth)}%`, width: `${windowWidth}%` }} />
      </div>

      {rail && railBox && (
        <div
          className="design-rail"
          style={{ left: `${railBox[0]}%`, top: `${railBox[1]}%`, width: `${railBox[2]}%`, height: `${railBox[3]}%` }}
        >
          {rail}
        </div>
      )}
    </div>
  );
}
