import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import "./ChromaGrid.css";

export default function ChromaGrid({ items = [], className = "", radius = 300, columns = 3, damping = 0.45, fadeOut = 0.6, ease = "power3.out", onAction }) {
  const rootRef = useRef(null);
  const fadeRef = useRef(null);
  const setters = useRef({ x: null, y: null });
  const pos = useRef({ x: 0, y: 0 });
  const moveFrame = useRef(0);
  const pendingPointer = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    setters.current.x = gsap.quickSetter(root, "--x", "px");
    setters.current.y = gsap.quickSetter(root, "--y", "px");
    const { width, height } = root.getBoundingClientRect();
    pos.current = { x: width / 2, y: height / 2 };
    setters.current.x(pos.current.x);
    setters.current.y(pos.current.y);
    return () => {
      cancelAnimationFrame(moveFrame.current);
      gsap.killTweensOf(pos.current);
      gsap.killTweensOf(fadeRef.current);
    };
  }, []);

  const move = (event) => {
    const rect = rootRef.current.getBoundingClientRect();
    pendingPointer.current = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    if (moveFrame.current) return;
    moveFrame.current = requestAnimationFrame(() => {
      moveFrame.current = 0;
      gsap.to(pos.current, { ...pendingPointer.current, duration: damping, ease, overwrite: true, onUpdate: () => { setters.current.x?.(pos.current.x); setters.current.y?.(pos.current.y); } });
      gsap.to(fadeRef.current, { opacity: 0, duration: 0.2, overwrite: true });
    });
  };
  const leave = () => gsap.to(fadeRef.current, { opacity: 1, duration: fadeOut, overwrite: true });
  const cardMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--mouse-x", `${event.clientX - rect.left}px`);
    event.currentTarget.style.setProperty("--mouse-y", `${event.clientY - rect.top}px`);
  };

  return <div ref={rootRef} className={`chroma-grid ${className}`} style={{ "--r": `${radius}px`, "--cols": columns }} onPointerMove={move} onPointerLeave={leave}>
    {items.map((item) => <article key={item.key || item.title} className="chroma-card" onMouseMove={cardMove} style={{ "--card-border": item.borderColor, "--card-gradient": item.gradient }}>
      <div className="chroma-img-wrapper"><img src={item.image} alt={item.title} loading="lazy" decoding="async" /></div>
      <footer className="chroma-info">
        <span className={`status ${item.status === "启用中" ? "ready" : "profile"}`}>{item.status}</span>
        <h3>{item.title}</h3>
        <p>{item.subtitle}</p>
        <small>{item.handle} · {item.meta}</small>
        <button type="button" onClick={() => onAction?.(item)}>{item.action}</button>
      </footer>
    </article>)}
    <div className="chroma-overlay" /><div ref={fadeRef} className="chroma-fade" />
  </div>;
}
