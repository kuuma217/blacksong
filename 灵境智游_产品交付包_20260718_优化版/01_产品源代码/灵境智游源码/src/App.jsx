import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from "react";
import Header from "./components/Header.jsx";
import AssistantPanel from "./components/AssistantPanel.jsx";
import ToastHost from "./components/ToastHost.jsx";
import SpecularButton from "./components/SpecularButton.jsx";
import { guides } from "./data/guides.js";
import { chooseRoute, personalizeRoute } from "./data/routes.js";

const RoutePanel = lazy(() => import("./components/RoutePanel.jsx"));
const MissionPanel = lazy(() => import("./components/MissionPanel.jsx"));
const ProfileModal = lazy(() => import("./components/ProfileModal.jsx"));
const LoginModal = lazy(() => import("./components/LoginModal.jsx"));
const AdminDashboard = lazy(() => import("./components/AdminDashboard.jsx"));

const PanelLoading = () => <div className="panel-loading" role="status">正在加载体验…</div>;

const loadStoredProfile = () => {
  try {
    return JSON.parse(window.localStorage.getItem("lingjing-route-profile")) || null;
  } catch {
    return null;
  }
};

export default function App() {
  const [view, setView] = useState("visitor");
  const [activePanel, setActivePanel] = useState("assistant");
  const [guideKey, setGuideKey] = useState(() => window.localStorage.getItem("lingjing-guide") || "lingruo");
  const [routeKey, setRouteKey] = useState(() => window.localStorage.getItem("lingjing-route") || "photo");
  const [routeProfile, setRouteProfile] = useState(loadStoredProfile);
  const [language, setLanguage] = useState("zh");
  const [profileOpen, setProfileOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [adminLogged, setAdminLogged] = useState(false);
  const [missions, setMissions] = useState([true, false, false, false]);
  const [toasts, setToasts] = useState([]);

  const notify = useCallback((message, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts((current) => [...current, { id, message, type }]);
    window.setTimeout(() => setToasts((current) => current.filter((toast) => toast.id !== id)), 3200);
  }, []);

  useEffect(() => window.localStorage.setItem("lingjing-guide", guideKey), [guideKey]);
  useEffect(() => window.localStorage.setItem("lingjing-route", routeKey), [routeKey]);
  useEffect(() => {
    if (routeProfile) window.localStorage.setItem("lingjing-route-profile", JSON.stringify(routeProfile));
  }, [routeProfile]);

  const activeRoute = useMemo(
    () => personalizeRoute(routeKey, routeProfile),
    [routeKey, routeProfile]
  );

  const changeView = useCallback((target) => {
    if (target === "admin" && !adminLogged) {
      setLoginOpen(true);
      return;
    }
    setView(target);
  }, [adminLogged]);

  const generateRoute = useCallback((profile) => {
    const nextRoute = chooseRoute(profile);
    setRouteKey(nextRoute);
    setRouteProfile({ ...profile, interests: [...profile.interests] });
    setLanguage(profile.language === "English" ? "en" : "zh");
    if (nextRoute === "senior") setGuideKey("dongling");
    else if (nextRoute === "family") setGuideKey("xiaoling");
    else if (nextRoute === "international") setGuideKey("wailing");
    setProfileOpen(false);
    setActivePanel("route");
    notify("专属路线已生成，数字人性格和声线也已为你匹配", "success");
  }, [notify]);

  if (view === "admin") {
    return (
      <>
        <Suspense fallback={<PanelLoading />}>
          <AdminDashboard onLogout={() => { setAdminLogged(false); setView("visitor"); notify("已安全退出管理后台"); }} notify={notify} />
        </Suspense>
        <ToastHost toasts={toasts} />
      </>
    );
  }

  return (
    <>
      <div className="ambient ambient-one" /><div className="ambient ambient-two" />
      <Header view={view} onViewChange={changeView} language={language} onLanguageChange={() => setLanguage((current) => current === "zh" ? "en" : "zh")} />
      <main>
        <section className="view active pc-container" id="visitorView">
          <div className="hero-intro">
            <div>
              <p className="eyebrow">LINGSHAN · 7×24H AI COMPANION</p>
              <h1>每一次相遇，都有一位<em>懂你的导游</em></h1>
              <p className="hero-copy">面向学生、亲子、银发团队与外籍游客的灵山胜境 AI 数字人导览。语音、文本、表情和个性路线自然融合，让文化讲解更亲切、更沉浸。</p>
            </div>
            <div className="intro-actions">
              <SpecularButton className="primary-button specular-cta" radius={15} tint="#315f53" tintOpacity={0.95} textColor="#ffffff" lineColor="#fff4c7" baseColor="#183f36" intensity={1.35} shineSize={14} shineFade={36} thickness={1.2} proximity={280} onClick={() => setProfileOpen(true)}>生成我的专属路线 <span>✦</span></SpecularButton>
              <SpecularButton className="secondary-button specular-cta" size="md" radius={15} tint="#e7f0ec" tintOpacity={0.96} textColor="#285f51" lineColor="#ffffff" baseColor="#8eb4a8" intensity={1.15} shineSize={16} shineFade={42} thickness={1} proximity={240} onClick={() => { setActivePanel("assistant"); notify("请选择一位喜欢的数字人，可试听对应声线"); }}>先认识数字人</SpecularButton>
              <span className="micro-proof"><i /> 本地景区知识库 · 目标事实准确率 ≥ 90%</span>
            </div>
          </div>

          <nav className="visitor-tabs" aria-label="游客服务功能">
            <button className={`visitor-tab ${activePanel === "assistant" ? "active" : ""}`} onClick={() => setActivePanel("assistant")}><span>◉</span>AI 数字人问答</button>
            <button className={`visitor-tab ${activePanel === "route" ? "active" : ""}`} onClick={() => setActivePanel("route")}><span>⌁</span>个性路线</button>
            <button className={`visitor-tab ${activePanel === "mission" ? "active" : ""}`} onClick={() => setActivePanel("mission")}><span>✦</span>打卡与装扮</button>
          </nav>

          {activePanel === "assistant" && <AssistantPanel guideKey={guideKey} onGuideChange={setGuideKey} route={activeRoute} language={language} notify={notify} />}
          <Suspense fallback={<PanelLoading />}>
            {activePanel === "route" && <RoutePanel route={activeRoute} onEditProfile={() => setProfileOpen(true)} notify={notify} />}
            {activePanel === "mission" && <MissionPanel guide={guides[guideKey]} missions={missions} setMissions={setMissions} notify={notify} />}
          </Suspense>
        </section>
      </main>

      {profileOpen && <Suspense fallback={null}><ProfileModal open onClose={() => setProfileOpen(false)} onGenerate={generateRoute} initialProfile={routeProfile} /></Suspense>}
      {loginOpen && <Suspense fallback={null}><LoginModal open onClose={() => setLoginOpen(false)} notify={notify} onLogin={() => { setAdminLogged(true); setLoginOpen(false); setView("admin"); notify("欢迎进入灵山运营中心", "success"); }} /></Suspense>}
      <ToastHost toasts={toasts} />
    </>
  );
}
