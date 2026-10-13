import { Children, cloneElement, useCallback, useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import "./MagicBento.css";

const MOBILE_BREAKPOINT = 768;

function useMobileDetection() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const query = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`);
    const check = (event) => setMobile(event.matches);
    setMobile(query.matches);
    query.addEventListener("change", check);
    return () => query.removeEventListener("change", check);
  }, []);
  return mobile;
}

function BentoCard({ children, glowColor, particleCount, disabled, enableTilt, enableMagnetism, clickEffect }) {
  const cardRef = useRef(null);
  const particlesRef = useRef([]);
  const clearParticles = useCallback(() => {
    particlesRef.current.forEach((particle) => gsap.to(particle, { scale: 0, opacity: 0, duration: 0.25, onComplete: () => particle.remove() }));
    particlesRef.current = [];
  }, []);

  useEffect(() => {
    const card = cardRef.current;
    if (!card || disabled) return undefined;
    const enter = () => {
      for (let i = 0; i < particleCount; i += 1) {
        const dot = document.createElement("i");
        dot.className = "magic-particle";
        dot.style.left = `${8 + Math.random() * 84}%`;
        dot.style.top = `${8 + Math.random() * 84}%`;
        dot.style.setProperty("--particle-color", glowColor);
        card.appendChild(dot);
        particlesRef.current.push(dot);
        gsap.fromTo(dot, { scale: 0, opacity: 0 }, { scale: 1, opacity: 0.85, delay: i * 0.035, duration: 0.25 });
        gsap.to(dot, { x: (Math.random() - 0.5) * 70, y: (Math.random() - 0.5) * 55, opacity: 0.25, repeat: -1, yoyo: true, duration: 1.4 + Math.random() * 1.8, ease: "sine.inOut" });
      }
    };
    const leave = () => {
      clearParticles();
      gsap.to(card, { rotateX: 0, rotateY: 0, x: 0, y: 0, duration: 0.3, ease: "power2.out" });
    };
    const move = (event) => {
      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      if (enableTilt) gsap.to(card, { rotateX: ((y / rect.height) - 0.5) * -8, rotateY: ((x / rect.width) - 0.5) * 8, transformPerspective: 1000, duration: 0.15 });
      if (enableMagnetism) gsap.to(card, { x: (x - rect.width / 2) * 0.025, y: (y - rect.height / 2) * 0.025, duration: 0.25 });
    };
    const click = (event) => {
      if (!clickEffect) return;
      const rect = card.getBoundingClientRect();
      const ripple = document.createElement("b");
      ripple.className = "magic-ripple";
      ripple.style.left = `${event.clientX - rect.left}px`;
      ripple.style.top = `${event.clientY - rect.top}px`;
      ripple.style.setProperty("--particle-color", glowColor);
      card.appendChild(ripple);
      gsap.fromTo(ripple, { scale: 0, opacity: 0.55 }, { scale: 10, opacity: 0, duration: 0.7, onComplete: () => ripple.remove() });
    };
    card.addEventListener("mouseenter", enter);
    card.addEventListener("mouseleave", leave);
    card.addEventListener("mousemove", move);
    card.addEventListener("click", click);
    return () => { card.removeEventListener("mouseenter", enter); card.removeEventListener("mouseleave", leave); card.removeEventListener("mousemove", move); card.removeEventListener("click", click); gsap.killTweensOf(card); clearParticles(); };
  }, [clearParticles, clickEffect, disabled, enableMagnetism, enableTilt, glowColor, particleCount]);

  return cloneElement(children, { ref: cardRef, className: `${children.props.className || ""} magic-bento-card`.trim(), style: { ...children.props.style, "--glow-color": glowColor } });
}

export default function MagicBento({ children, className = "", enableStars = true, enableSpotlight = true, enableBorderGlow = true, disableAnimations = false, spotlightRadius = 300, particleCount = 12, enableTilt = false, glowColor = "132, 0, 255", clickEffect = true, enableMagnetism = true }) {
  const gridRef = useRef(null);
  const mobile = useMobileDetection();
  const disabled = disableAnimations || mobile;

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid || disabled || !enableSpotlight) return undefined;
    const cards = [...grid.querySelectorAll(".magic-bento-card")];
    let lastEvent = null;
    let raf = 0;
    const update = () => {
      raf = 0;
      const event = lastEvent;
      if (!event) return;
      cards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const distance = Math.hypot(Math.max(rect.left - event.clientX, 0, event.clientX - rect.right), Math.max(rect.top - event.clientY, 0, event.clientY - rect.bottom));
        card.style.setProperty("--glow-x", `${x}px`);
        card.style.setProperty("--glow-y", `${y}px`);
        card.style.setProperty("--glow-radius", `${spotlightRadius}px`);
        card.style.setProperty("--glow-intensity", `${Math.max(0, 1 - distance / spotlightRadius)}`);
      });
    };
    const move = (event) => {
      lastEvent = event;
      if (!raf) raf = requestAnimationFrame(update);
    };
    const leave = () => cards.forEach((card) => card.style.setProperty("--glow-intensity", "0"));
    grid.addEventListener("pointermove", move, { passive: true });
    grid.addEventListener("pointerleave", leave, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      grid.removeEventListener("pointermove", move);
      grid.removeEventListener("pointerleave", leave);
    };
  }, [disabled, enableSpotlight, spotlightRadius]);

  return <div ref={gridRef} className={`${className} magic-bento-grid ${enableBorderGlow ? "magic-bento-grid--glow" : ""}`.trim()}>{Children.map(children, (child) => <BentoCard glowColor={glowColor} particleCount={enableStars ? particleCount : 0} disabled={disabled} enableTilt={enableTilt} enableMagnetism={enableMagnetism} clickEffect={clickEffect}>{child}</BentoCard>)}</div>;
}
