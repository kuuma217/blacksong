import { useEffect, useRef } from "react";
import "./SpecularButton.css";

const PAD = 20;
const VERT = `#version 300 es
in vec2 position;
void main() { gl_Position = vec4(position, 0.0, 1.0); }`;
const FRAG = `#version 300 es
precision highp float;
uniform vec2 uCenter; uniform vec2 uHalfSize; uniform float uRadius;
uniform float uAngle; uniform float uPx; uniform vec3 uLineColor;
uniform vec3 uBaseColor; uniform float uIntensity; uniform float uShineSize;
uniform float uShineFade; uniform float uThickness; uniform float uBaseWidth;
out vec4 fragColor;
float sdRoundedRect(vec2 p, vec2 b, float r) { vec2 q = abs(p) - b + r; return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r; }
void main() {
  vec2 p = gl_FragCoord.xy - uCenter;
  float d = sdRoundedRect(p, uHalfSize, uRadius);
  vec2 L = vec2(cos(uAngle), sin(uAngle));
  float base = (1.0 - smoothstep(0.0, uBaseWidth, abs(d))) * 0.45;
  vec2 nEll = normalize(p / (uHalfSize * uHalfSize) + 1e-6);
  float phi = acos(clamp(abs(dot(nEll, L)), 0.0, 1.0));
  float rim = 1.0 - smoothstep(uShineSize - uShineFade, uShineSize + uShineFade + 1e-4, phi);
  float x = d / (uThickness + 1e-6);
  float line = exp(-mix(1.0, 1.6, smoothstep(0.0, 1.5, x)) * x * x);
  float edgeClamp = 1.0 - smoothstep(0.5 * uPx, 3.0 * uPx, abs(d));
  float hi = line * rim * edgeClamp * uIntensity;
  fragColor = vec4(uBaseColor * base + uLineColor * hi, clamp(base + hi, 0.0, 1.0));
}`;

export default function SpecularButton({ children = "Get Started", size = "lg", radius = 18, tint = "#ffffff", tintOpacity = 0, blur = 0, textColor = "#f5f5f5", lineColor = "#ffffff", baseColor = "#525252", intensity = 1, shineSize = 10, shineFade = 40, thickness = 1, speed = 0.35, followMouse = true, proximity = 250, autoAnimate = false, disabled = false, onClick, className = "", type = "button" }) {
  const btnRef = useRef(null);
  const fxRef = useRef(null);
  const propsRef = useRef({});
  propsRef.current = { radius, lineColor, baseColor, intensity, shineSize, shineFade, thickness, speed, followMouse, proximity, autoAnimate };

  useEffect(() => {
    const btn = btnRef.current;
    const fx = fxRef.current;
    if (!btn || !fx) return undefined;

    let cancelled = false;
    let loading = false;
    let disposeFx = () => {};

    const activate = async () => {
      if (loading || cancelled || btn.disabled) return;
      loading = true;
      try {
        const { Renderer, Program, Mesh, Triangle, Color } = await import("ogl");
        if (cancelled) return;

        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const renderer = new Renderer({ alpha: true, premultipliedAlpha: true, antialias: true, dpr });
        const gl = renderer.gl;
        gl.clearColor(0, 0, 0, 0);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        const geometry = new Triangle(gl);
        if (geometry.attributes.uv) delete geometry.attributes.uv;
        const program = new Program(gl, {
          vertex: VERT,
          fragment: FRAG,
          uniforms: {
            uCenter: { value: [0, 0] }, uHalfSize: { value: [1, 1] }, uRadius: { value: 0 }, uAngle: { value: 2.4 }, uPx: { value: dpr },
            uLineColor: { value: [1, 1, 1] }, uBaseColor: { value: [0.32, 0.32, 0.32] }, uIntensity: { value: 0 },
            uShineSize: { value: 0.17 }, uShineFade: { value: 0.7 }, uThickness: { value: 1 }, uBaseWidth: { value: dpr }
          }
        });
        const mesh = new Mesh(gl, { geometry, program });
        fx.appendChild(gl.canvas);

        const sizeRef = { w: 1, h: 1 };
        let pointerAngle = null;
        let proximityT = 0;
        let angle = 2.4;
        let idleAngle = 2.4;
        let bright = 0;
        let last = performance.now();
        let raf = 0;
        let visible = true;
        const lineC = new Color();
        const baseC = new Color();

        const requestRender = () => {
          if (!raf && visible && document.visibilityState === "visible") raf = requestAnimationFrame(update);
        };

        const resize = () => {
          const rect = btn.getBoundingClientRect();
          sizeRef.w = rect.width;
          sizeRef.h = rect.height;
          renderer.setSize(rect.width + PAD * 2, rect.height + PAD * 2);
          program.uniforms.uCenter.value = [(PAD + rect.width / 2) * dpr, (PAD + rect.height / 2) * dpr];
          program.uniforms.uHalfSize.value = [(rect.width / 2) * dpr, (rect.height / 2) * dpr];
          requestRender();
        };

        const onPointerMove = (event) => {
          const rect = btn.getBoundingClientRect();
          const cx = rect.left + rect.width / 2;
          const cy = rect.top + rect.height / 2;
          const dx = Math.max(rect.left - event.clientX, 0, event.clientX - rect.right);
          const dy = Math.max(rect.top - event.clientY, 0, event.clientY - rect.bottom);
          const dist = Math.hypot(dx, dy);
          pointerAngle = dist === 0
            ? Math.atan2(2 / rect.height, -2 / rect.width) + ((event.clientX - cx) / (rect.width / 2)) * 0.3 + ((cy - event.clientY) / (rect.height / 2)) * 0.15
            : Math.atan2(cy - event.clientY, event.clientX - cx);
          const t = Math.max(0, 1 - dist / Math.max(propsRef.current.proximity, 1));
          proximityT = t * t * (3 - 2 * t);
          requestRender();
        };

        function update(now) {
          raf = 0;
          const dt = Math.min((now - last) / 1000, 0.05);
          last = now;
          const p = propsRef.current;
          idleAngle += p.speed * dt;
          const target = p.followMouse && pointerAngle != null && (!p.autoAnimate || proximityT > 0) ? pointerAngle : idleAngle;
          const diff = ((target - angle + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
          const brightTarget = p.autoAnimate ? 1 : proximityT;
          angle += diff * (1 - Math.exp(-dt * 7));
          bright += (brightTarget - bright) * (1 - Math.exp(-dt * 8));
          lineC.set(p.lineColor);
          baseC.set(p.baseColor);
          program.uniforms.uAngle.value = angle;
          program.uniforms.uRadius.value = Math.min(p.radius, Math.min(sizeRef.w, sizeRef.h) / 2) * dpr;
          program.uniforms.uLineColor.value = [lineC.r, lineC.g, lineC.b];
          program.uniforms.uBaseColor.value = [baseC.r, baseC.g, baseC.b];
          program.uniforms.uIntensity.value = p.intensity * bright;
          program.uniforms.uShineSize.value = p.shineSize * Math.PI / 180;
          program.uniforms.uShineFade.value = p.shineFade * Math.PI / 180;
          program.uniforms.uThickness.value = p.thickness * dpr;
          renderer.render({ scene: mesh });
          if (p.autoAnimate || Math.abs(diff) > 0.002 || Math.abs(brightTarget - bright) > 0.002) requestRender();
        }

        const resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(btn);
        const intersectionObserver = new IntersectionObserver(([entry]) => {
          visible = entry.isIntersecting;
          if (!visible) {
            cancelAnimationFrame(raf);
            raf = 0;
          } else {
            last = performance.now();
            requestRender();
          }
        }, { rootMargin: "120px" });
        intersectionObserver.observe(btn);
        const onVisibility = () => {
          if (document.visibilityState === "hidden") {
            cancelAnimationFrame(raf);
            raf = 0;
          } else {
            last = performance.now();
            requestRender();
          }
        };

        window.addEventListener("pointermove", onPointerMove, { passive: true });
        document.addEventListener("visibilitychange", onVisibility);
        resize();
        requestRender();

        disposeFx = () => {
          cancelAnimationFrame(raf);
          resizeObserver.disconnect();
          intersectionObserver.disconnect();
          window.removeEventListener("pointermove", onPointerMove);
          document.removeEventListener("visibilitychange", onVisibility);
          if (gl.canvas.parentNode === fx) fx.removeChild(gl.canvas);
          gl.getExtension("WEBGL_lose_context")?.loseContext();
        };
      } catch {
        btn.classList.add("specular-button--fallback");
      }
    };

    btn.addEventListener("pointerenter", activate, { once: true, passive: true });
    btn.addEventListener("focusin", activate, { once: true, passive: true });
    if (propsRef.current.autoAnimate) activate();

    return () => {
      cancelled = true;
      btn.removeEventListener("pointerenter", activate);
      btn.removeEventListener("focusin", activate);
      disposeFx();
    };
  }, []);

  return <button ref={btnRef} type={type} disabled={disabled} onClick={onClick} className={`specular-button specular-button--${size}${className ? ` ${className}` : ""}`} style={{ "--sb-radius": `${radius}px`, "--sb-tint": tint, "--sb-tint-opacity": tintOpacity, "--sb-blur": `${blur}px`, "--sb-text-color": textColor }}><span ref={fxRef} className="specular-button__fx" aria-hidden="true" /><span className="specular-button__label">{children}</span></button>;
}
