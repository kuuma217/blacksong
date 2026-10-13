import { useEffect, useMemo, useRef } from "react";
import "./TargetCursor.css";

export default function TargetCursor({
  targetSelector = ".cursor-target",
  spinDuration = 2,
  hideDefaultCursor = true,
  hoverDuration = 0.2,
  parallaxOn = true,
  cursorColor = "#fff",
  cursorColorOnTarget
}) {
  const cursorRef = useRef(null);
  const dotRef = useRef(null);
  const frameRef = useRef(null);
  const mobile = useMemo(
    () => matchMedia("(pointer: coarse)").matches || innerWidth <= 768,
    []
  );

  useEffect(() => {
    const cursor = cursorRef.current;
    if (mobile || !cursor) return undefined;

    const state = {
      x: innerWidth / 2,
      y: innerHeight / 2,
      targetX: innerWidth / 2,
      targetY: innerHeight / 2,
      active: null,
      raf: 0,
      scale: 1
    };

    cursor.style.setProperty("--cursor-transition", `${hoverDuration}s`);
    cursor.style.setProperty("--spin-duration", `${spinDuration}s`);
    if (hideDefaultCursor) document.body.classList.add("target-cursor-active");

    const render = () => {
      state.raf = 0;
      const easing = state.active ? 0.34 : 0.28;
      state.x += (state.targetX - state.x) * easing;
      state.y += (state.targetY - state.y) * easing;
      cursor.style.transform = `translate3d(${state.x}px, ${state.y}px, 0) translate(-50%, -50%) scale(${state.scale})`;
      if (Math.abs(state.targetX - state.x) > 0.15 || Math.abs(state.targetY - state.y) > 0.15) {
        state.raf = requestAnimationFrame(render);
      }
    };

    const schedule = () => {
      if (!state.raf && document.visibilityState === "visible") {
        state.raf = requestAnimationFrame(render);
      }
    };

    const syncTarget = () => {
      if (!state.active?.isConnected) return;
      const rect = state.active.getBoundingClientRect();
      state.targetX = rect.left + rect.width / 2;
      state.targetY = rect.top + rect.height / 2;
      cursor.style.width = `${rect.width + 10}px`;
      cursor.style.height = `${rect.height + 10}px`;
      schedule();
    };

    const reset = () => {
      state.active?.classList.remove("target-cursor-hovered");
      state.active = null;
      state.targetX = state.lastX ?? state.targetX;
      state.targetY = state.lastY ?? state.targetY;
      cursor.style.width = "28px";
      cursor.style.height = "28px";
      cursor.classList.remove("is-target");
      dotRef.current?.style.removeProperty("transform");
      const color = cursorColor;
      if (dotRef.current) dotRef.current.style.backgroundColor = color;
      if (frameRef.current) frameRef.current.style.color = color;
      schedule();
    };

    const move = (event) => {
      state.lastX = event.clientX;
      state.lastY = event.clientY;
      if (!state.active) {
        state.targetX = event.clientX;
        state.targetY = event.clientY;
      } else if (parallaxOn && dotRef.current) {
        const rect = state.active.getBoundingClientRect();
        const x = (event.clientX - rect.left - rect.width / 2) * 0.06;
        const y = (event.clientY - rect.top - rect.height / 2) * 0.06;
        dotRef.current.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
      }
      schedule();
    };

    const over = (event) => {
      const target = event.target.closest?.(targetSelector);
      if (!target || target === state.active) return;
      state.active?.classList.remove("target-cursor-hovered");
      state.active = target;
      target.classList.add("target-cursor-hovered");
      cursor.classList.add("is-target");
      const color = cursorColorOnTarget || cursorColor;
      if (dotRef.current) dotRef.current.style.backgroundColor = color;
      if (frameRef.current) frameRef.current.style.color = color;
      syncTarget();
    };

    const out = (event) => {
      if (!state.active || state.active.contains(event.relatedTarget)) return;
      if (event.target === state.active || state.active.contains(event.target)) reset();
    };

    const down = () => {
      state.scale = 0.9;
      schedule();
    };
    const up = () => {
      state.scale = 1;
      schedule();
    };

    addEventListener("pointermove", move, { passive: true });
    addEventListener("pointerover", over, { passive: true });
    addEventListener("pointerout", out, { passive: true });
    addEventListener("pointerdown", down, { passive: true });
    addEventListener("pointerup", up, { passive: true });
    addEventListener("scroll", syncTarget, { passive: true });
    addEventListener("resize", syncTarget, { passive: true });
    schedule();

    return () => {
      state.active?.classList.remove("target-cursor-hovered");
      cancelAnimationFrame(state.raf);
      removeEventListener("pointermove", move);
      removeEventListener("pointerover", over);
      removeEventListener("pointerout", out);
      removeEventListener("pointerdown", down);
      removeEventListener("pointerup", up);
      removeEventListener("scroll", syncTarget);
      removeEventListener("resize", syncTarget);
      document.body.classList.remove("target-cursor-active");
    };
  }, [cursorColor, cursorColorOnTarget, hideDefaultCursor, hoverDuration, mobile, parallaxOn, spinDuration, targetSelector]);

  if (mobile) return null;
  return (
    <div ref={cursorRef} className="target-cursor-wrapper">
      <div ref={dotRef} className="target-cursor-dot" style={{ backgroundColor: cursorColor }} />
      <div ref={frameRef} className="target-cursor-frame" style={{ color: cursorColor }}>
        {[
          "tl",
          "tr",
          "br",
          "bl"
        ].map((name) => <div key={name} className={`target-cursor-corner corner-${name}`} />)}
      </div>
    </div>
  );
}
