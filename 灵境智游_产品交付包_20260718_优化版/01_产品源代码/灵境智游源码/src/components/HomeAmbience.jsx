import { useEffect, useMemo, useRef } from "react";

// 首页动态氛围层：斜射光束 + 底部流雾 + 上浮金尘，并驱动画布的鼠标视差（--hero-px / --hero-py）
export default function HomeAmbience() {
  const layerRef = useRef(null);

  const motes = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: 24 + Math.random() * 70,
        size: 2 + Math.random() * 3.5,
        delay: -Math.random() * 16,
        duration: 10 + Math.random() * 10,
        drift: Math.random() * 70 - 35,
        gold: Math.random() > 0.35,
      })),
    []
  );

  useEffect(() => {
    const layer = layerRef.current;
    const host = layer?.parentElement;
    if (!host || window.matchMedia("(pointer: coarse)").matches) return undefined;

    let raf = 0;
    const apply = (event) => {
      raf = 0;
      const rect = host.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const px = (event.clientX - rect.left) / rect.width - 0.5;
      const py = (event.clientY - rect.top) / rect.height - 0.5;
      host.style.setProperty("--hero-px", px.toFixed(4));
      host.style.setProperty("--hero-py", py.toFixed(4));
    };
    const onMove = (event) => {
      if (!raf) raf = requestAnimationFrame(() => apply(event));
    };
    const onLeave = () => {
      host.style.setProperty("--hero-px", "0");
      host.style.setProperty("--hero-py", "0");
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    host.addEventListener("pointerleave", onLeave);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
      host.style.removeProperty("--hero-px");
      host.style.removeProperty("--hero-py");
    };
  }, []);

  return (
    <div className="hero-ambience" ref={layerRef} aria-hidden>
      <i className="hero-beam hero-beam-one" />
      <i className="hero-beam hero-beam-two" />
      <i className="hero-mist" />
      {motes.map((mote) => (
        <i
          key={mote.id}
          className={mote.gold ? "hero-mote gold" : "hero-mote"}
          style={{
            left: `${mote.left}%`,
            top: `${mote.top}%`,
            width: `${mote.size}px`,
            height: `${mote.size}px`,
            animationDelay: `${mote.delay.toFixed(2)}s`,
            animationDuration: `${mote.duration.toFixed(2)}s`,
            "--drift": `${mote.drift.toFixed(1)}px`,
          }}
        />
      ))}
    </div>
  );
}
