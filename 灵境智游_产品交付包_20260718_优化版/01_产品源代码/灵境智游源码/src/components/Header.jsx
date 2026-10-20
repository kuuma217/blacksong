import { useEffect, useRef, useState } from "react";
import { languages, languageLabel } from "../data/languages.js";

// 面板跳转通过内部事件通知 App.jsx，避免改动冻结的 Header props 契约
const emitNavigate = (panel) => {
  window.dispatchEvent(new CustomEvent("lingjing:navigate", { detail: { panel } }));
};

export default function Header({ view, onViewChange, language, onLanguageChange }) {
  const [moreOpen, setMoreOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef(null);
  const activeKey = view === "visitor" ? "home" : "";

  // 点空白处或按 Esc 收起语言菜单
  useEffect(() => {
    if (!langOpen) return;
    const onDocDown = (event) => {
      if (!langRef.current?.contains(event.target)) setLangOpen(false);
    };
    const onEsc = (event) => {
      if (event.key === "Escape") setLangOpen(false);
    };
    document.addEventListener("pointerdown", onDocDown);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("pointerdown", onDocDown);
      document.removeEventListener("keydown", onEsc);
    };
  }, [langOpen]);

  const goHome = () => {
    onViewChange("visitor");
    emitNavigate("home");
  };

  const pickLanguage = (key) => {
    setLangOpen(false);
    if (key !== language) onLanguageChange(key);
  };

  return (
    <header className="site-header">
      <button className="brand brand-button" onClick={goHome} aria-label="返回首页">
        <span className="brand-mark" aria-hidden="true">
          <svg viewBox="0 0 64 64">
            <path d="M32 7C19 18 14 29 17 40c3 10 13 17 15 17s12-7 15-17C50 29 45 18 32 7Z" />
            <path d="M20 38c7-2 12-7 12-15 0 8 5 13 12 15" />
          </svg>
        </span>
        <span><strong>灵境智游</strong><small>灵山胜境 AI 智能导览平台</small></span>
      </button>

      <nav className="top-nav" aria-label="主导航">
        <button className={`top-link ${activeKey === "home" ? "active" : ""}`} onClick={goHome}>首页</button>
        <button className="top-link" onClick={() => emitNavigate("scenic")}>景区导览</button>
        <button className="top-link" onClick={() => emitNavigate("assistant")}>AI数字人</button>
        <button className="top-link" onClick={() => emitNavigate("route")}>个性路线</button>
        <button className="top-link" onClick={() => emitNavigate("stamp")}>打卡集章</button>

        <div className="more-wrap">
          <button className="top-link" onClick={() => setMoreOpen((open) => !open)} aria-expanded={moreOpen}>更多 <span aria-hidden="true">∨</span></button>
          {moreOpen && (
            <div className="more-menu" role="menu">
              <button role="menuitem" onClick={() => { setMoreOpen(false); onViewChange("admin"); }}>运营管理后台</button>
              <button role="menuitem" onClick={() => { setMoreOpen(false); emitNavigate("assistant"); }}>数字人试听</button>
              <button role="menuitem" onClick={() => { setMoreOpen(false); emitNavigate("route"); }}>专属路线生成</button>
            </div>
          )}
        </div>
      </nav>

      <div className="header-tools">
        <span className="tool-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24"><path d="M4 8h3l2-3h6l2 3h3v11H4z" /><circle cx="12" cy="13" r="3.4" /></svg>
        </span>

        {/* 语言选择：点开下拉，列出可选语种，当前语种打勾 */}
        <div className="lang-wrap" ref={langRef}>
          <button
            className="language-switch"
            onClick={() => setLangOpen((open) => !open)}
            aria-expanded={langOpen}
            aria-haspopup="menu"
            aria-label="选择界面语言"
          >
            <span className="lang-globe" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="8.6" />
                <path d="M3.4 12h17.2M12 3.4c2.4 2.4 3.6 5.4 3.6 8.6s-1.2 6.2-3.6 8.6c-2.4-2.4-3.6-5.4-3.6-8.6S9.6 5.8 12 3.4Z" />
              </svg>
            </span>
            <span className="lang-current">{languageLabel(language)}</span>
            <span className={`lang-caret${langOpen ? " is-open" : ""}`} aria-hidden="true">∨</span>
          </button>

          {langOpen && (
            <div className="lang-menu" role="menu" aria-label="界面语言">
              {languages.map((item) => (
                <button
                  key={item.key}
                  role="menuitem"
                  className={item.key === language ? "is-active" : ""}
                  onClick={() => pickLanguage(item.key)}
                >
                  <span>{item.label}</span>
                  {item.key === language && <span className="lang-check" aria-hidden="true">✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        <button className="tool-icon tool-user" onClick={() => emitNavigate("center")} aria-label="进入个人中心">
          <svg viewBox="0 0 24 24"><circle cx="12" cy="8.6" r="3.6" /><path d="M5 20c1.2-3.8 3.9-5.6 7-5.6s5.8 1.8 7 5.6" /></svg>
        </button>
      </div>
    </header>
  );
}
