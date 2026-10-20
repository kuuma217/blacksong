import { recommendedCards } from "../data/routePresets.js";

/**
 * 「推荐路线」板块：真实 DOM 重绘层
 *
 * 设计稿 route-plan.webp 是整页位图，为控制体积压到了 248KB，
 * 结果卡片里的配图和楷体小字全是压缩蚊噪，1:1 显示时明显发虚。这里把这一块整个换成真实控件：
 *
 * - 配图：按实测像素从原图抠成 route-photo-1..4.webp（Lanczos 2 倍放大 + 反锐化，
 *   独立文件走高质量 webp，不再和整页共享一次重量级压缩）；
 * - 文字：编号、标题、描述、时长、步行距离、按钮字样全部由 DOM 用楷体渲染，任何分辨率都是矢量清晰；
 * - 卡片外框：用与设计稿同色系的不透明底盖住原来的位图卡片，顺带把位图上的糊字挡掉；
 * - 「换一批」已下线：route-shuffle-blank.webp 是同一处纸面的补丁，用来盖掉设计稿上残留的字形。
 *
 * 2026-10-19 二次调整：顶部四个主题标签（经典一日游 / 深度文化游 / 亲子家庭游 / 祈福之旅）
 * 及其点击生成路线的交互已整体下线，只留下 route-tabs-strip.webp 这块无字纸面补丁，
 * 用来盖住设计稿上残留的标签字形与选中胶囊。
 *
 * 所有坐标均为 route-plan.webp（1959×1109）的实测像素换算成百分比，
 * 因此底图缩放后依然严丝合缝。
 */

// 标签行抠图条（实测裁剪框 x 1046..1566、y 452..518）：现仅用于遮盖底图上的原标签
const STRIP = { left: 53.394, top: 40.757, width: 26.544, height: 5.951 };
// 原「换一批」位置（x1806..1912、y456..512），现用于贴纸面补丁
const SHUFFLE_PATCH = { left: 92.19, top: 41.118, width: 5.411, height: 5.05 };

// 四张卡片外框（x572..1232 / x1245..1905，y517..739 / y757..979）
const CARD_W = 33.691;
const CARD_H = 20.018;
const CARD_POS = [
  { left: 29.198, top: 46.619 },
  { left: 63.553, top: 46.619 },
  { left: 29.198, top: 68.26 },
  { left: 63.553, top: 68.26 }
];

const ClockIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="12" r="8.4" fill="none" stroke="currentColor" strokeWidth="1.7" />
    <path d="M12 7.6V12l3.1 1.9" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
  </svg>
);

const WalkIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12.6" cy="4.5" r="1.9" fill="currentColor" />
    <path
      d="M11.4 8.2 9.6 13l2 1.5-.9 4.2M11.4 8.2l3.1-.9 1.7 3.1 2.2.6M13.9 9.6l-1.6 4.3"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function RouteRecommender({ planningKey = "", onOpenCard }) {
  const cardPlanning = planningKey.startsWith("card:");

  return (
    <div className="route-rec-live">
      {/* 盖掉底图上原有的四个主题标签与选中胶囊（标签功能已下线） */}
      <img
        className="route-rec-strip"
        src="/assets/route-tabs-strip.webp"
        alt=""
        style={{
          left: `${STRIP.left}%`,
          top: `${STRIP.top}%`,
          width: `${STRIP.width}%`,
          height: `${STRIP.height}%`
        }}
      />

      {/* 盖掉设计稿上原有的「换一批」字形（该功能已下线） */}
      <img
        className="route-rec-strip"
        src="/assets/route-shuffle-blank.webp"
        alt=""
        style={{
          left: `${SHUFFLE_PATCH.left}%`,
          top: `${SHUFFLE_PATCH.top}%`,
          width: `${SHUFFLE_PATCH.width}%`,
          height: `${SHUFFLE_PATCH.height}%`
        }}
      />

      {recommendedCards.map((card, index) => {
        const spot = CARD_POS[index];
        if (!spot) return null;
        const busy = planningKey === `card:${card.key}`;
        return (
          <article
            key={card.key}
            className={`route-card${busy ? " busy" : ""}`}
            style={{
              left: `${spot.left}%`,
              top: `${spot.top}%`,
              width: `${CARD_W}%`,
              height: `${CARD_H}%`
            }}
            aria-label={`${card.no} ${card.title}`}
          >
            <img className="route-card-photo" src={card.photo} alt={card.title} />
            <img className="route-card-seal" src="/assets/route-card-seal.webp" alt="" />

            <div className="route-card-body">
              <h3 className="route-card-title">
                <span className="route-card-no">{card.no}</span>
                <span className="route-card-name">{card.title}</span>
              </h3>
              <p className="route-card-desc">
                {card.desc.map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </p>
              <span className="route-card-rule" aria-hidden="true" />
              <p className="route-card-meta">
                <span className="route-card-meta-item">
                  <ClockIcon />
                  约 {card.hours}
                </span>
                <span className="route-card-meta-item">
                  <WalkIcon />
                  步行约 {card.distance}
                </span>
              </p>
            </div>

            <button
              type="button"
              className={`route-card-open${busy ? " busy" : ""}`}
              onClick={() => onOpenCard(card)}
              disabled={cardPlanning}
            >
              {busy ? (
                <>
                  <span>正在规划…</span>
                  <i className="route-rec-spin route-rec-spin-light" aria-hidden="true" />
                </>
              ) : (
                <>
                  <span>查看路线</span>
                  <i aria-hidden="true">→</i>
                </>
              )}
            </button>
          </article>
        );
      })}
    </div>
  );
}
