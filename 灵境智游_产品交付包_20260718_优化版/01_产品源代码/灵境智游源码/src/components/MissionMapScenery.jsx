/**
 * 灵山景区矢量全景插画（高清背景）
 * 说明：当前项目没有灵山实景航拍素材，这里用矢量绘制替代位图，
 *       保证任意分辨率／缩放都不失真（真正的高清），
 *       后续拿到 public/assets/checkin/checkin-map.webp 后可整块替换。
 */
export default function MissionMapScenery() {
  return (
    <svg
      className="mp-scenery"
      viewBox="0 0 1600 700"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#cfe0d6" />
          <stop offset="42%" stopColor="#9dbdab" />
          <stop offset="72%" stopColor="#6a9784" />
          <stop offset="100%" stopColor="#3b6b57" />
        </linearGradient>
        <linearGradient id="farHill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8fb0a1" />
          <stop offset="100%" stopColor="#6d9280" />
        </linearGradient>
        <linearGradient id="midHill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4f7c68" />
          <stop offset="100%" stopColor="#35604e" />
        </linearGradient>
        <linearGradient id="nearHill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2c5646" />
          <stop offset="100%" stopColor="#1b3d31" />
        </linearGradient>
        <linearGradient id="buddhaGold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f4e3bd" />
          <stop offset="55%" stopColor="#d9bd82" />
          <stop offset="100%" stopColor="#a98a52" />
        </linearGradient>
        <linearGradient id="palaceIvory" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f6efdd" />
          <stop offset="100%" stopColor="#cdbf9d" />
        </linearGradient>
        <radialGradient id="halo" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(255,244,199,.85)" />
          <stop offset="100%" stopColor="rgba(255,244,199,0)" />
        </radialGradient>
        <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(255,246,214,.55)" />
          <stop offset="100%" stopColor="rgba(255,246,214,0)" />
        </radialGradient>
      </defs>

      {/* 天空与日光 */}
      <rect width="1600" height="700" fill="url(#sky)" />
      <circle cx="1180" cy="120" r="230" fill="url(#sunGlow)" />
      <circle cx="1180" cy="120" r="42" fill="#fff3d0" opacity=".85" />

      {/* 远山 */}
      <path d="M0 300 L180 210 L340 290 L520 200 L700 290 L880 215 L1060 295 L1260 205 L1450 285 L1600 230 L1600 700 L0 700 Z" fill="url(#farHill)" opacity=".85" />

      {/* 云海 */}
      <ellipse cx="300" cy="330" rx="260" ry="34" fill="rgba(255,255,255,.34)" />
      <ellipse cx="900" cy="300" rx="320" ry="30" fill="rgba(255,255,255,.28)" />
      <ellipse cx="1400" cy="345" rx="240" ry="28" fill="rgba(255,255,255,.3)" />

      {/* 中景山 */}
      <path d="M0 400 L200 320 L420 410 L640 330 L880 420 L1120 340 L1360 425 L1600 350 L1600 700 L0 700 Z" fill="url(#midHill)" />

      {/* —— 梵宫（左侧穹顶建筑）—— */}
      <g transform="translate(300 318)">
        <circle cx="0" cy="60" r="120" fill="url(#halo)" opacity=".5" />
        <path d="M-92 128 a92 92 0 0 1 184 0 z" fill="url(#palaceIvory)" />
        <path d="M0 -14 L0 18" stroke="#bd9657" strokeWidth="7" strokeLinecap="round" />
        <circle cx="0" cy="-18" r="12" fill="#e5cf95" />
        <rect x="-96" y="128" width="192" height="86" fill="#f2ead6" />
        <g stroke="#b7a57e" strokeWidth="5">
          <path d="M-62 140 v74 M-24 140 v74 M14 140 v74 M52 140 v74" />
        </g>
        <rect x="-104" y="210" width="208" height="16" fill="#d8c79f" />
        <path d="M-120 226 h240" stroke="#a89671" strokeWidth="6" strokeLinecap="round" />
      </g>

      {/* —— 九龙灌浴（中部莲花水景）—— */}
      <g transform="translate(820 430)">
        <ellipse cx="0" cy="66" rx="150" ry="34" fill="#4a7f6c" />
        <ellipse cx="0" cy="60" rx="128" ry="28" fill="#5f9a83" />
        {/* 莲花瓣 */}
        <g fill="#f0dcd4">
          {[-96, -64, -32, 0, 32, 64, 96].map((x, i) => (
            <path key={i} d={`M${x} 58 q0 -34 ${0 } -46 q0 12 0 46`} transform={`rotate(${x * 0.16})`} opacity=".9" />
          ))}
        </g>
        {/* 中央太子像 + 水柱 */}
        <rect x="-14" y="4" width="28" height="54" rx="12" fill="url(#buddhaGold)" />
        <circle cx="0" cy="-4" r="14" fill="url(#buddhaGold)" />
        <circle cx="0" cy="-26" r="34" fill="url(#halo)" opacity=".7" />
        <g stroke="#cfe6dc" strokeWidth="5" strokeLinecap="round" opacity=".8">
          <path d="M-70 30 q-26 -22 -34 -54" />
          <path d="M-40 22 q-20 -30 -22 -62" />
          <path d="M40 22 q20 -30 22 -62" />
          <path d="M70 30 q26 -22 34 -54" />
        </g>
        {/* 九龙（简化龙形水线） */}
        <g stroke="#bcdcd0" strokeWidth="4" fill="none" strokeLinecap="round" opacity=".75">
          <path d="M-130 74 q-24 -30 6 -46 q30 -16 14 -34" />
          <path d="M130 74 q24 -30 -6 -46 q-30 -16 -14 -34" />
        </g>
      </g>

      {/* —— 灵山大佛（右侧主峰）—— */}
      <g transform="translate(1210 250)">
        <circle cx="0" cy="70" r="180" fill="url(#halo)" opacity=".45" />
        {/* 山体 */}
        <path d="M-190 300 q90 -210 190 -240 q100 30 190 240 z" fill="url(#midHill)" />
        {/* 佛身 */}
        <path d="M-56 250 q0 -110 56 -110 q56 0 56 110 z" fill="url(#buddhaGold)" />
        {/* 佛首 */}
        <circle cx="0" cy="82" r="46" fill="url(#buddhaGold)" />
        <path d="M-30 74 q30 -20 60 0" stroke="#8a6a3a" strokeWidth="5" fill="none" strokeLinecap="round" />
        <path d="M-16 96 q16 12 32 0" stroke="#8a6a3a" strokeWidth="4" fill="none" strokeLinecap="round" />
        <circle cx="-16" cy="76" r="4" fill="#7d6134" />
        <circle cx="16" cy="76" r="4" fill="#7d6134" />
        {/* 衣纹 */}
        <g stroke="#a98a52" strokeWidth="4" fill="none" opacity=".8">
          <path d="M-30 178 q30 14 60 0" />
          <path d="M-34 204 q34 14 68 0" />
          <path d="M-38 230 q38 14 76 0" />
        </g>
        {/* 莲座 */}
        <path d="M-72 250 q72 26 144 0 q-40 34 -72 34 q-32 0 -72 -34" fill="#e6d3a6" />
        <path d="M-96 286 h192" stroke="#a89671" strokeWidth="7" strokeLinecap="round" />
      </g>

      {/* —— 灵山照壁（左前景）—— */}
      <g transform="translate(140 520)">
        <path d="M-96 40 q96 -34 192 0" fill="#e9dcc0" />
        <rect x="-88" y="40" width="176" height="86" fill="#f4ecd8" />
        <rect x="-96" y="34" width="192" height="10" rx="4" fill="#c9a86f" />
        <g stroke="#c0ac84" strokeWidth="4">
          <path d="M-60 62 h120 M-60 82 h120 M-60 102 h80" />
        </g>
        <path d="M-104 126 h208" stroke="#8d7c58" strokeWidth="7" strokeLinecap="round" />
      </g>

      {/* 前景近山与松树剪影 */}
      <path d="M0 560 L240 500 L520 580 L820 505 L1120 585 L1420 510 L1600 570 L1600 700 L0 700 Z" fill="url(#nearHill)" />
      <g fill="#204a3c">
        <path d="M120 610 l26 -66 l26 66 z" />
        <path d="M132 556 l14 -34 l14 34 z" opacity=".85" />
        <path d="M470 636 l22 -56 l22 56 z" />
        <path d="M1020 620 l24 -60 l24 60 z" />
        <path d="M1032 566 l12 -30 l12 30 z" opacity=".85" />
        <path d="M1440 640 l20 -52 l20 52 z" />
      </g>

      {/* 底部暗角，保证前景卡片可读 */}
      <rect y="470" width="1600" height="230" fill="rgba(15,35,28,.28)" />
    </svg>
  );
}
