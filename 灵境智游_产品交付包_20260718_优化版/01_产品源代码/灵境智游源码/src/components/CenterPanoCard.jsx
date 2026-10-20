// 个人中心底部卡片：「我最喜欢的景点」照片墙
// 底图上的「最近活动 + 最喜欢的景点」两卡位置合并为一张卡片：
// 顶部留出标题空间写「我最喜欢的景点」，下方放缩小的全景长卷；
// 长卷按景点位置切成一个个独立照片框，光标移到哪个框就只高亮那一个（不再整条一起框住）。
const DEFAULT_BOX = [21.4, 75.2, 77.2, 21.1];
const PANO_RATIO = 8225 / 820; // 长卷宽高比（与 public/assets/scenic-pano.webp 一致）
const FRAME_HALF = 4.75; // 单个照片框半宽（占长卷宽度的百分比）

export default function CenterPanoCard({ spots = [], box = DEFAULT_BOX, onOpen }) {
  return (
    <div
      className="design-rail center-pano-rail"
      style={{ left: `${box[0]}%`, top: `${box[1]}%`, width: `${box[2]}%`, height: `${box[3]}%` }}
    >
      <section className="center-pano-card">
        <header className="center-pano-head">
          <h4>我最喜欢的景点</h4>
          <span className="center-pano-count">共 {spots.length} 处</span>
        </header>

        <div className="center-pano-strip" style={{ aspectRatio: PANO_RATIO }}>
          <img src="/assets/scenic-pano.webp" alt="灵山胜境全景长卷" draggable="false" />
          {spots.map((spot) => (
            <button
              key={spot.key}
              type="button"
              className="center-pano-frame"
              style={{
                left: `${Math.max(0, Math.min(100 - FRAME_HALF * 2, spot.pos - FRAME_HALF))}%`,
                width: `${FRAME_HALF * 2}%`
              }}
              aria-label={spot.label}
              onClick={() => onOpen && onOpen(spot)}
            >
              <span className="center-pano-frame-label">{spot.label}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
