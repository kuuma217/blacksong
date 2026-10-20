// 首页氛围层：静态斜射光束 + 底部流雾。
// 原先这里还有随鼠标反向漂移的视差、以及 28 颗上浮金尘，均已移除——
// 画面持续漂移会让照片与热区层错开，导航栏就会时好时坏地点不准。
// 现在整块首屏保持完全静止，热区的百分比坐标即设计稿坐标。
export default function HomeAmbience() {
  return (
    <div className="hero-ambience" aria-hidden>
      <i className="hero-beam hero-beam-one" />
      <i className="hero-beam hero-beam-two" />
      <i className="hero-mist" />
    </div>
  );
}
