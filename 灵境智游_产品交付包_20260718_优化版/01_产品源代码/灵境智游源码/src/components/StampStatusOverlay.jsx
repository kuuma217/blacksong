import "./stamp-overlay.css";

/**
 * 打卡集章设计图 · 动态状态覆盖层
 *
 * 背景图 stamp-panel.webp（1960×1109）上印刷了固定的状态文字与「2/4」进度。
 * 本组件用真实 React 元素覆盖：
 *   1. 地图上四个景点的状态胶囊 —— 复刻原图样式（深青绿 / 米金胶囊、全圆角、
 *      无描边阴影），坐标从原图逐像素测量换算；
 *   2. 左侧「我的集章进度」卡片 —— 整卡重建，内部为小字号状态文字（不叠加按钮），
 *      进度环 / 完成数字 / 列表状态全部由同一份 missions 计算。
 *
 * 景点状态只有两种：已打卡（true）/ 未打卡（false）。
 * 不存在「进行中」「未解锁」，四个景点从一开始即可打卡。
 *
 * 坐标系：以背景图左上角为原点，百分比 = 像素 / 1960（X）或 / 1109（Y）。
 * 定位容器为 .hero-canvas（与背景图同比例、不裁切），随容器等比缩放。
 */

/**
 * 景点 → 打卡数据索引（唯一映射）
 *
 * missions 长度 4，与 src/data/checkinBackgrounds.js 顺序一致：
 *   [0] wuyin 五印坛城 / [1] jiulong 九龙灌浴 / [2] fangong 梵宫 / [3] dafou 灵山大佛
 *
 * id      —— 设计图上的景点标识
 * checkinId —— 传给 MissionPanel 用于定位 missions 索引的打卡数据 key
 * missionIndex —— 该景点在 missions 中对应的下标
 */
const SPOTS = [
  // 原图印刷条实测 x 993~1102, y 203~234；左移并加宽余量以保证完全覆盖
  { id: "dafou", checkinId: "dafou", name: "灵山大佛", missionIndex: 3, map: { left: 49.0, top: 18.0, width: 7.4, height: 3.1 } },
  // 梵宫 x 772~855, y 401~432
  { id: "fangong", checkinId: "fangong", name: "梵宫", missionIndex: 2, map: { left: 39.2, top: 35.9, width: 4.4, height: 2.9 } },
  // 九龙灌浴 x 1247~1358, y 348~380
  { id: "jiulong", checkinId: "jiulong", name: "九龙灌浴", missionIndex: 1, map: { left: 63.4, top: 31.2, width: 5.8, height: 3.0 } },
  // 底图（地图与进度卡）这一格印的就是「五印坛城」，对应 checkinBackgrounds[0] = wuyin 五印坛城。
  // 进度卡列表行与地图上五印坛城位置的胶囊共用同一个 missions 槽位，进度天然一致。
  { id: "wuyin", checkinId: "wuyin", name: "五印坛城", missionIndex: 0, map: { left: 70.0, top: 43.7, width: 5.7, height: 2.9 } }
];

/** 左侧「我的集章进度」卡片的覆盖范围（原图卡片区 x 38~455，y 395~668） */
const CARD_BOX = { left: 1.7, top: 35.1, width: 21.6, height: 25.3 };

const toStyle = (box) => ({
  left: `${box.left}%`,
  top: `${box.top}%`,
  width: `${box.width}%`,
  height: `${box.height}%`
});

const RING_RADIUS = 30;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

/**
 * @param {Object} props
 * @param {boolean[]} props.missions - 真实打卡状态（来自 App.jsx，唯一数据源）
 * @param {(spotId:string)=>void} props.onSelectSpot - 点击「未打卡」景点时唤起上传打卡弹窗
 */
export default function StampStatusOverlay({ missions, onSelectSpot }) {
  const total = missions.length;
  const completeCount = missions.filter(Boolean).length;
  const ratio = total ? completeCount / total : 0;

  /** 状态规则：仅两种
   * - true  → 「✓ 已打卡」深青绿胶囊
   * - false → 「未打卡」米金胶囊（四个景点始终可打卡，无前置解锁条件） */
  const stateOf = (spot) =>
    missions[spot.missionIndex]
      ? { cls: "done", label: "已打卡", icon: "check" }
      : { cls: "todo", label: "未打卡", icon: "none" };

  const renderIcon = (icon) =>
    icon === "check" ? <span className="stamp-tick" aria-hidden="true">✓</span> : null;

  return (
    <div className="stamp-overlay">
      {/* ===== 左侧进度卡：整卡重建，进度环 / 数字 / 列表共用同一 missions ===== */}
      <section className="stamp-card" style={toStyle(CARD_BOX)} aria-label="我的集章进度">
        <header className="stamp-card-head">
          <i className="stamp-card-gem" aria-hidden="true" />
          <h3>我的集章进度</h3>
        </header>

        <div className="stamp-card-body">
          <div className="stamp-ring" role="img" aria-label={`集章进度 ${completeCount} / ${total}`}>
            <svg viewBox="0 0 72 72" aria-hidden="true">
              <circle cx="36" cy="36" r={RING_RADIUS} fill="none" stroke="rgba(23,79,67,0.18)" strokeWidth="6" />
              <circle
                cx="36"
                cy="36"
                r={RING_RADIUS}
                fill="none"
                stroke="#174f43"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={RING_CIRCUMFERENCE}
                strokeDashoffset={RING_CIRCUMFERENCE * (1 - ratio)}
                style={{ transition: "stroke-dashoffset 0.5s ease" }}
              />
            </svg>
            <div className="stamp-ring-num">
              <strong>{completeCount}/{total}</strong>
              <span>已完成</span>
            </div>
          </div>

          <ul className="stamp-list">
            {SPOTS.map((spot) => {
              const state = stateOf(spot);
              const clickable = state.cls === "todo";
              return (
                <li
                  key={spot.id}
                  className={state.cls}
                  onClick={() => clickable && onSelectSpot?.(spot.checkinId)}
                  title={clickable ? `点击上传照片打卡：${spot.name}` : `${spot.name}：${state.label}`}
                >
                  <i className="dot" aria-hidden="true" />
                  <span className="name">{spot.name}</span>
                  <em className="state">
                    {renderIcon(state.icon)}
                    {state.label}
                  </em>
                </li>
              );
            })}
          </ul>
        </div>

        <button
          type="button"
          className="stamp-card-btn"
          onClick={() => window.scrollBy({ top: window.innerHeight * 0.55, behavior: "smooth" })}
        >
          探索更多景点，解锁更多奖励 →
        </button>
      </section>

      {/* ===== 地图状态胶囊：复刻原图样式，精确覆盖印刷文字 ===== */}
      {SPOTS.map((spot) => {
        const state = stateOf(spot);
        const clickable = state.cls === "todo";
        return (
          <button
            key={spot.id}
            type="button"
            className={`stamp-tag ${state.cls}`}
            style={toStyle(spot.map)}
            onClick={() => clickable && onSelectSpot?.(spot.checkinId)}
            disabled={!clickable}
            aria-label={`${spot.name} · ${state.label}`}
            title={clickable ? `点击上传照片打卡：${spot.name}` : `${spot.name}：${state.label}`}
          >
            {renderIcon(state.icon)}
            {state.label}
          </button>
        );
      })}
    </div>
  );
}
