import { useEffect, useMemo, useRef } from "react";
import "./TargetCursor.css";

// 国风莲花指针：隐藏系统光标，用一朵「莲纹铜钱」代替
// 行为保持不变：移到可交互元素上时吸附到元素中心、外框描边高亮、按下时收缩
export default function TargetCursor({
  targetSelector = ".cursor-target",
  spinDuration = 14,
  hideDefaultCursor = true,
  hoverDuration = 0.2,
  parallaxOn = true,
  cursorColor = "#c29245",
  cursorColorOnTarget
}) {
  const cursorRef = useRef(null);
  const lotusRef = useRef(null);
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

    // 吸附：光标落到目标元素中心（不再拉伸自身，莲花保持固定大小）
    const syncTarget = () => {
      if (!state.active?.isConnected) return;
      const rect = state.active.getBoundingClientRect();
      state.targetX = rect.left + rect.width / 2;
      state.targetY = rect.top + rect.height / 2;
      schedule();
    };

    const reset = () => {
      state.active?.classList.remove("target-cursor-hovered");
      state.active = null;
      state.targetX = state.lastX ?? state.targetX;
      state.targetY = state.lastY ?? state.targetY;
      cursor.classList.remove("is-target");
      lotusRef.current?.style.removeProperty("transform");
      if (lotusRef.current) lotusRef.current.style.color = cursorColor;
      schedule();
    };

    const move = (event) => {
      state.lastX = event.clientX;
      state.lastY = event.clientY;
      if (!state.active) {
        state.targetX = event.clientX;
        state.targetY = event.clientY;
      } else if (parallaxOn && lotusRef.current) {
        const rect = state.active.getBoundingClientRect();
        const x = (event.clientX - rect.left - rect.width / 2) * 0.06;
        const y = (event.clientY - rect.top - rect.height / 2) * 0.06;
        lotusRef.current.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
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
      if (lotusRef.current) lotusRef.current.style.color = cursorColorOnTarget || cursorColor;
      syncTarget();
    };

    const out = (event) => {
      if (!state.active || state.active.contains(event.relatedTarget)) return;
      if (event.target === state.active || state.active.contains(event.target)) reset();
    };

    const down = () => {
      state.scale = 0.88;
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
      <span className="target-cursor-halo" />
      <div ref={lotusRef} className="target-cursor-lotus" style={{ color: cursorColor }}>
        <span className="target-cursor-lotus-spin">
          <svg className="target-cursor-lotus-art" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
            {/* 外圈：铜钱的形制 */}
            <circle className="lotus-ring" cx="24" cy="24" r="21" />
            {/* 八瓣莲花 */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
              <path
                key={deg}
                className="lotus-petal"
                d="M24 6.5 C28.4 14.5 28.4 20.2 24 24 C19.6 20.2 19.6 14.5 24 6.5 Z"
                transform={`rotate(${deg} 24 24)`}
                opacity={deg % 90 === 0 ? 0.95 : 0.6}
              />
            ))}
            {/* 莲心 */}
            <circle className="lotus-core" cx="24" cy="24" r="3.4" />
          </svg>
        </span>
      </div>
    </div>
  );
}
