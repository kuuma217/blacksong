export default function Header({ view, onViewChange, language, onLanguageChange }) {
  return (
    <header className="site-header pc-container">
      <button className="brand brand-button" onClick={() => onViewChange("visitor")} aria-label="返回游客端首页">
        <span className="brand-mark" aria-hidden="true">
          <svg viewBox="0 0 64 64">
            <path d="M32 7C19 18 14 29 17 40c3 10 13 17 15 17s12-7 15-17C50 29 45 18 32 7Z" />
            <path d="M20 38c7-2 12-7 12-15 0 8 5 13 12 15" />
          </svg>
        </span>
        <span><strong>灵境智游</strong><small>LINGJING AI GUIDE</small></span>
      </button>
      <nav className="top-nav" aria-label="主导航">
        <button className={`top-link ${view === "visitor" ? "active" : ""}`} onClick={() => onViewChange("visitor")}>游客服务</button>
        <button className={`top-link ${view === "admin" ? "active" : ""}`} onClick={() => onViewChange("admin")}>管理后台</button>
        <button className="language-switch" onClick={onLanguageChange} aria-label="切换语言">
          <span className={language === "zh" ? "active" : ""}>中</span>
          <span className={language === "en" ? "active" : ""}>EN</span>
        </button>
      </nav>
    </header>
  );
}
