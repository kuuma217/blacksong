/**
 * 景点卡通简笔画图标
 * 用矢量线条替代 emoji，保证高分辨率下清晰，且风格统一（卡通动漫简笔）。
 * spotId 与 data/checkinBackgrounds.js 的 id 一一对应。
 */
export default function MissionSpotIcon({ spotId, size = 26, title }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 48 48",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2.4,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    xmlns: "http://www.w3.org/2000/svg"
  };

  const art = {
    // 灵山照壁：一面带屋檐的照壁 + 壁面纹样
    zhaobi: (
      <g>
        <path d="M8 14 L24 8 L40 14" />
        <path d="M11 14 h26 v22 h-26 z" />
        <path d="M16 20 h16 M16 26 h16 M16 32 h10" strokeWidth="1.8" />
        <path d="M6 38 h36" strokeWidth="2.6" />
      </g>
    ),
    // 九龙灌浴：莲花底座 + 中心水柱 + 九条水线
    jiulong: (
      <g>
        <path d="M24 12 v10" />
        <circle cx="24" cy="10" r="3.6" />
        <path d="M16 30 q8 6 16 0" />
        <path d="M10 34 q14 8 28 0" />
        <path d="M14 24 q-4 6 -1 11" strokeWidth="1.8" />
        <path d="M34 24 q4 6 1 11" strokeWidth="1.8" />
        <path d="M6 40 h36" strokeWidth="2.6" />
      </g>
    ),
    // 灵山梵宫：穹顶 + 塔尖 + 柱廊
    fangong: (
      <g>
        <path d="M24 6 L24 12" />
        <path d="M12 26 a12 12 0 0 1 24 0 z" />
        <path d="M10 26 h28 v12 h-28 z" />
        <path d="M16 30 v8 M24 30 v8 M32 30 v8" strokeWidth="1.8" />
        <path d="M6 40 h36" strokeWidth="2.6" />
      </g>
    ),
    // 灵山大佛：佛首 + 光背 + 莲花座
    dafou: (
      <g>
        <circle cx="24" cy="16" r="8" />
        <path d="M20 15 h.01 M28 15 h.01" strokeWidth="3" />
        <path d="M21 20 q3 2.5 6 0" />
        <path d="M14 34 q10 -8 20 0" />
        <path d="M10 38 q14 6 28 0" />
        <path d="M6 41 h36" strokeWidth="2.6" />
      </g>
    )
  };

  return (
    <svg {...common} role="img" aria-label={title || spotId} style={{ display: "block" }}>
      {art[spotId] || art.dafou}
    </svg>
  );
}
