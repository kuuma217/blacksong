import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from "react";
import Header from "./components/Header.jsx";
import AssistantPanel from "./components/AssistantPanel.jsx";
import HomeAmbience from "./components/HomeAmbience.jsx";
import ToastHost from "./components/ToastHost.jsx";
import { guides } from "./data/guides.js";
import { chooseRoute, personalizeRoute } from "./data/routes.js";
import { filterSpots, spotCategories, spotCategoryLabel, spots as allSpots } from "./data/spots.js";

const RoutePanel = lazy(() => import("./components/RoutePanel.jsx"));
const MissionPanel = lazy(() => import("./components/MissionPanel.jsx"));
const ScenicPanel = lazy(() => import("./components/ScenicPanel.jsx"));
const ProfileModal = lazy(() => import("./components/ProfileModal.jsx"));
const LoginModal = lazy(() => import("./components/LoginModal.jsx"));
const AdminDashboard = lazy(() => import("./components/AdminDashboard.jsx"));

const PanelLoading = () => <div className="panel-loading" role="status">正在加载体验…</div>;

// 通用设计稿整页：1:1 呈现 + 透明热区交互（C 责任页面共用）
// active 为 true 的热区会显示金色高亮，用于反馈「已选中」状态
// markers：可见的地图景点标注（底图未绘制的景点由 DOM 标注补齐）
// chips：覆盖在底图上的分类胶囊（重绘底图里画死的分类样式，悬停变绿）
// cover：整列不透明底色，先把底图画死的分类彻底挡住，胶囊再画在这层之上
function DesignPage({ src, ratio, alt, hotspots, markers, chips, cover }) {
  return (
    <div className="hero-canvas" style={{ aspectRatio: ratio }}>
      <img className="hero-photo" src={src} alt={alt} />
      {cover && (
        <div
          className="design-cover"
          style={{ left: `${cover[0]}%`, top: `${cover[1]}%`, width: `${cover[2]}%`, height: `${cover[3]}%` }}
        />
      )}
      {(chips || []).map((chip) => (
        <button
          key={chip.key}
          className={`design-chip${chip.active ? " is-active" : ""}`}
          style={{ left: `${chip.box[0]}%`, top: `${chip.box[1]}%`, width: `${chip.box[2]}%`, height: `${chip.box[3]}%` }}
          aria-pressed={chip.active ? true : undefined}
          aria-label={chip.label}
          onClick={chip.onClick}
        >
          <span className="design-chip-dot">{chip.icon}</span>
          <span className="design-chip-label">{chip.label}</span>
        </button>
      ))}
      {(markers || []).map((marker) => (
        <button
          key={marker.key}
          className={`map-marker${marker.active ? " is-active" : ""}`}
          style={{ left: `${marker.point[0]}%`, top: `${marker.point[1]}%` }}
          aria-label={marker.label}
          onClick={marker.onClick}
        >
          <span className="map-marker-dot">{marker.icon}</span>
          <span className="map-marker-label">{marker.label}</span>
        </button>
      ))}
      {hotspots.map((spot) => (
        <button
          key={spot.label}
          className={`hero-hotspot${spot.active ? " is-active" : ""}`}
          style={{
            left: `${spot.box[0]}%`,
            top: `${spot.box[1]}%`,
            width: `${spot.box[2]}%`,
            height: `${spot.box[3]}%`,
          }}
          aria-label={spot.label}
          aria-pressed={spot.active ? true : undefined}
          onClick={spot.onClick}
        />
      ))}
    </div>
  );
}

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
  // 游客端整页落地页：home 首页 / scenic 景区导览 / route 个性路线 / center 个人中心 / stamp 打卡集章 / wardrobe 我的衣橱 / assistant AI 数字人
  const [landing, setLanding] = useState("home");
  // AI 数字人页：点击立绘后弹出真实对话面板
  const [assistantLive, setAssistantLive] = useState(false);
  // 景区导览：当前景点分类与选中景点（设计页热区与真实面板双向联动）
  const [spotCategory, setSpotCategory] = useState("all");
  const [activeSpotKey, setActiveSpotKey] = useState("buddha");
  // 从景点卡片带去数字人对话的问题（seq 用于重复提问也能触发）
  const [presetQuestion, setPresetQuestion] = useState(null);
  // 景区导览：景点详情与打卡改为弹窗呈现，不再滚动到设计页下方
  const [spotModal, setSpotModal] = useState(false);
  const [missionModal, setMissionModal] = useState(false);

  const notify = useCallback((message, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts((current) => [...current, { id, message, type }]);
    window.setTimeout(() => setToasts((current) => current.filter((toast) => toast.id !== id)), 3200);
  }, []);

  useEffect(() => window.localStorage.setItem("lingjing-guide", guideKey), [guideKey]);
  useEffect(() => window.localStorage.setItem("lingjing-route", routeKey), [routeKey]);

  // 响应顶部导航的分区跳转（Header 通过内部事件通知，不改冻结 props）
  useEffect(() => {
    const onNavigate = (event) => {
      const { panel } = event.detail || {};
      if (panel === "scenic" || panel === "route" || panel === "center" || panel === "stamp" || panel === "wardrobe" || panel === "home") {
        setSpotModal(false);
        setMissionModal(false);
        setLanding(panel);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      if (panel === "assistant") {
        setSpotModal(false);
        setMissionModal(false);
        setLanding("assistant");
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      if (panel === "mission") {
        setSpotModal(false);
        setLanding("stamp");
        setActivePanel("mission");
        setTimeout(() => document.getElementById("panelSection")?.scrollIntoView({ behavior: "smooth" }), 120);
      }
    };
    window.addEventListener("lingjing:navigate", onNavigate);
    return () => window.removeEventListener("lingjing:navigate", onNavigate);
  }, []);
  useEffect(() => {
    if (routeProfile) window.localStorage.setItem("lingjing-route-profile", JSON.stringify(routeProfile));
  }, [routeProfile]);

  // 弹窗打开时锁定背景滚动，并支持 Esc / 点击遮罩关闭
  useEffect(() => {
    if (!spotModal && !missionModal) return;
    const closeAll = () => { setSpotModal(false); setMissionModal(false); };
    const onKeyDown = (event) => { if (event.key === "Escape") closeAll(); };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [spotModal, missionModal]);

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

  // 热区共用：数字人进独立页；路线/打卡面板挂在其设计页下方按需展开
  const gotoPanel = useCallback((panel) => {
    if (panel === "assistant") {
      setSpotModal(false);
      setMissionModal(false);
      setLanding("assistant");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setSpotModal(false);
    setLanding(panel === "mission" ? "stamp" : "route");
    setActivePanel(panel);
    setTimeout(() => document.getElementById("panelSection")?.scrollIntoView({ behavior: "smooth" }), 120);
  }, []);

  // 整页落地页跳转
  const goLanding = useCallback((page) => {
    setSpotModal(false);
    setMissionModal(false);
    setLanding(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const scrollToPanel = () => {
    setTimeout(() => document.getElementById("panelSection")?.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
  };

  // 景区导览：切换景点分类（真实筛选，面板与地图同步）
  const pickSpotCategory = useCallback((key) => {
    setSpotCategory(key);
    const list = filterSpots(key);
    setActiveSpotKey(list[0]?.key || "buddha");
    notify(key === "all" ? `已展示全部 ${list.length} 个景点` : `已按「${spotCategoryLabel(key)}」筛选：${list.length} 个景点`, "info");
    setSpotModal(true);
  }, [notify]);

  // 景区导览：选中某个景点（地图定位点 / 列表项共用）
  const focusSpot = useCallback((key) => {
    const spot = allSpots.find((item) => item.key === key);
    if (!spot) return;
    // 定位到不在当前分类的景点时，切到该景点所属分类，而不是回到「全部景点」
    if (spotCategory !== "all" && !spot.categories.includes(spotCategory)) {
      setSpotCategory(spot.categories[0] || "all");
    }
    setActiveSpotKey(key);
    setSpotModal(true);
    notify(`已定位：${spot.name} · ${spot.badge}`, "info");
  }, [notify, spotCategory]);

  // 带着景点问题去问数字人
  const askGuide = useCallback((spot) => {
    setPresetQuestion({ text: spot.question, seq: Date.now() });
    setSpotModal(false);
    setAssistantLive(true);
    notify(`已向数字人提问：${spot.question}`, "success");
  }, [notify]);

  // 把景点带进路线规划
  const planSpot = useCallback((spot) => {
    setSpotModal(false);
    setProfileOpen(true);
    notify(spot ? `正在为你规划包含「${spot.name}」的路线` : "正在为你规划专属路线", "info");
  }, [notify]);

  // 去打卡集章：同样以弹窗呈现，不跳转页面
  const checkinSpot = useCallback((spot) => {
    setSpotModal(false);
    setMissionModal(true);
    notify(spot ? `已打开打卡面板，可上传「${spot.name}」的打卡照` : "已打开打卡面板", "info");
  }, [notify]);

  const visibleSpots = useMemo(() => filterSpots(spotCategory), [spotCategory]);

  // 设计稿页热区（坐标为设计稿百分比）
  const box = (l, t, w, h) => [l, t, w, h];
  const buildNavSpots = () => [
    { label: "首页", box: box(27.5, 2.2, 4.2, 5.6), onClick: () => goLanding("home") },
    { label: "景区导览", box: box(33, 2.2, 6.2, 5.6), onClick: () => goLanding("scenic") },
    { label: "AI 数字人问答", box: box(40.3, 2.2, 6.4, 5.6), onClick: () => gotoPanel("assistant") },
    { label: "个性路线", box: box(47.3, 2.2, 6.4, 5.6), onClick: () => goLanding("route") },
    { label: "打卡集章", box: box(54.3, 2.2, 6.4, 5.6), onClick: () => goLanding("stamp") },
    { label: "更多服务", box: box(61.3, 2.2, 5.8, 5.6), onClick: () => notify("更多服务敬请期待", "info") },
    { label: "打卡拍照", box: box(84.5, 2.2, 3.4, 5.6), onClick: () => goLanding("stamp") },
    { label: language === "zh" ? "切换到 English" : "切换到中文", box: box(89, 2.2, 4.6, 5.6), onClick: () => setLanguage((current) => (current === "zh" ? "en" : "zh")) },
    { label: "个人中心", box: box(94.2, 2.2, 3.8, 5.6), onClick: () => goLanding("center") },
  ];

  // 景区导览页：导航与功能按钮坐标均按设计稿像素实测标定，点击后驱动真实面板
  const scenicSpots = [
    { label: "首页", box: box(28.3, 2.5, 4.39, 4.3), onClick: () => goLanding("home") },
    { label: "景区导览", box: box(33.96, 2.5, 7.19, 4.3), onClick: () => goLanding("scenic") },
    { label: "AI 数字人问答", box: box(41.92, 2.5, 6.78, 4.3), onClick: () => gotoPanel("assistant") },
    { label: "个性路线", box: box(49.62, 2.5, 6.68, 4.3), onClick: () => goLanding("route") },
    { label: "打卡集章", box: box(57.11, 2.5, 6.78, 4.3), onClick: () => goLanding("stamp") },
    { label: "更多服务", box: box(64.81, 2.5, 4.44, 4.3), onClick: () => notify("更多服务敬请期待", "info") },
    { label: "打卡拍照", box: box(85.52, 2.5, 3.67, 4.3), onClick: () => goLanding("stamp") },
    { label: language === "zh" ? "切换到 English" : "切换到中文", box: box(89.04, 2.5, 4.39, 4.3), onClick: () => setLanguage((current) => (current === "zh" ? "en" : "zh")) },
    { label: "个人中心", box: box(94.14, 2.5, 3.93, 4.3), onClick: () => goLanding("center") },
    { label: "返回全景", box: box(62.8, 33.9, 7.4, 4), onClick: () => goLanding("home") },
    { label: "地图定位：灵山大佛", box: box(44.6, 39.6, 8.4, 4.8), active: activeSpotKey === "buddha", onClick: () => focusSpot("buddha") },
    { label: "地图定位：梵宫", box: box(35.4, 49, 6.4, 4.6), active: activeSpotKey === "palace", onClick: () => focusSpot("palace") },
    { label: "地图定位：五印坛城", box: box(55.6, 60.8, 9, 4.8), active: activeSpotKey === "mandala", onClick: () => focusSpot("mandala") },
    { label: "地图定位：九龙灌浴", box: box(30.6, 65.2, 8.8, 4.6), active: activeSpotKey === "dragons", onClick: () => focusSpot("dragons") },
    { label: "查看当前景点详情", box: box(74, 83.9, 10.6, 5.2), onClick: () => focusSpot(activeSpotKey) },
    { label: "规划路线", box: box(85.88, 83.68, 10.71, 5.41), onClick: () => planSpot(visibleSpots.find((item) => item.key === activeSpotKey)) },
  ];

  // 地图标注：底图只绘制了四个景点钉，其余景点用 DOM 标注补齐（坐标为设计稿百分比）
  const scenicMarkers = [
    { key: "xiangfu", label: "祥符禅寺", icon: "禅", point: [50, 50.5], active: activeSpotKey === "xiangfu", onClick: () => focusSpot("xiangfu") },
    { key: "maitreya", label: "百子戏弥勒", icon: "趣", point: [47.5, 66], active: activeSpotKey === "maitreya", onClick: () => focusSpot("maitreya") },
    { key: "perfume", label: "香水海", icon: "水", point: [32, 76.5], active: activeSpotKey === "perfume", onClick: () => focusSpot("perfume") },
    { key: "screenwall", label: "灵山照壁", icon: "照", point: [45.5, 81], active: activeSpotKey === "screenwall", onClick: () => focusSpot("screenwall") },
    { key: "vegetarian", label: "灵山蔬食馆", icon: "斋", point: [56, 79.5], active: activeSpotKey === "vegetarian", onClick: () => focusSpot("vegetarian") },
  ];

  // 整列底色遮挡层：先把底图画死的分类（含墨绿徽章）整块盖住，胶囊再叠上去
  const scenicCover = [2.3, 38.4, 14.9, 39];

  // 景点分类胶囊：画在遮挡层之上，默认浅色、悬停变绿；已按你说的把「全部景点」整档上调
  const scenicCategoryChips = [
    { key: "all", label: "全部景点", icon: "全", box: box(2.6, 39.6, 14.6, 6.4), active: spotCategory === "all", onClick: () => pickSpotCategory("all") },
    { key: "buddhist", label: "佛教文化", icon: "佛", box: box(2.6, 48, 14.6, 5.8), active: spotCategory === "buddhist", onClick: () => pickSpotCategory("buddhist") },
    { key: "nature", label: "自然景观", icon: "山", box: box(2.6, 55.6, 14.6, 5.8), active: spotCategory === "nature", onClick: () => pickSpotCategory("nature") },
    { key: "architecture", label: "主题建筑", icon: "殿", box: box(2.6, 63.3, 14.6, 5.8), active: spotCategory === "architecture", onClick: () => pickSpotCategory("architecture") },
    { key: "leisure", label: "休闲体验", icon: "憩", box: box(2.6, 71.1, 14.6, 5.8), active: spotCategory === "leisure", onClick: () => pickSpotCategory("leisure") },
  ];

  const routeSpots = [
    ...buildNavSpots(),
    { label: "筛选：游玩时长", box: box(9, 48.6, 19.5, 5.4), onClick: () => setProfileOpen(true) },
    { label: "筛选：兴趣偏好", box: box(9, 56, 21, 5.4), onClick: () => setProfileOpen(true) },
    { label: "筛选：预算范围", box: box(9, 63.4, 19.5, 5.4), onClick: () => setProfileOpen(true) },
    { label: "筛选：游览节奏", box: box(9, 70.8, 19.5, 5.4), onClick: () => setProfileOpen(true) },
    { label: "为我推荐路线", box: box(6.9, 80.8, 23, 8.6), onClick: () => setProfileOpen(true) },
    { label: "查看路线：灵山大佛·祈福之旅", box: box(34.3, 49, 29.7, 20.5), onClick: () => gotoPanel("route") },
    { label: "查看路线：梵宫·艺术之旅", box: box(64.6, 49, 29.7, 20.5), onClick: () => gotoPanel("route") },
    { label: "查看路线：九龙灌浴·禅意之旅", box: box(34.3, 71.5, 29.7, 20.5), onClick: () => gotoPanel("route") },
    { label: "查看路线：五印坛城·文化之旅", box: box(64.6, 71.5, 29.7, 20.5), onClick: () => gotoPanel("route") },
  ];

  const centerSpots = [
    ...buildNavSpots(),
    { label: "个人中心", box: box(3, 55, 16.4, 4.4), onClick: () => goLanding("center") },
    { label: "我的行程", box: box(3, 59.8, 16.4, 4.4), onClick: () => gotoPanel("route") },
    { label: "我的收藏", box: box(3, 64.5, 16.4, 4.4), onClick: () => gotoPanel("route") },
    { label: "我的装扮", box: box(3, 69, 16.4, 4.4), onClick: () => goLanding("wardrobe") },
    { label: "系统设置", box: box(3, 73.7, 16.4, 4.4), onClick: () => changeView("admin") },
    { label: "打卡日历：查看全部", box: box(89.5, 45.8, 7, 4), onClick: () => goLanding("stamp") },
    { label: "已去过的景点：查看更多", box: box(44.6, 53.2, 4.2, 3.2), onClick: () => goLanding("scenic") },
    { label: "我的收藏路线：查看更多", box: box(68.8, 53.2, 4.6, 3.2), onClick: () => gotoPanel("route") },
    { label: "我的装扮奖励：查看更多", box: box(93.2, 53.2, 4.8, 3.2), onClick: () => goLanding("wardrobe") },
    { label: "装扮奖励详情", box: box(74.8, 57.4, 23, 14.5), onClick: () => goLanding("wardrobe") },
    { label: "最喜欢的景点", box: box(57, 78.5, 41, 16.5), onClick: () => goLanding("scenic") },
  ];

  // 打卡集章设计页（该页导航横向位置与其他页略有差异，单独标定）
  const stampSpots = [
    { label: "首页", box: box(24.6, 2.4, 4.6, 5.4), onClick: () => goLanding("home") },
    { label: "景区导览", box: box(30.2, 2.4, 6, 5.4), onClick: () => goLanding("scenic") },
    { label: "AI 数字人问答", box: box(37, 2.4, 6, 5.4), onClick: () => gotoPanel("assistant") },
    { label: "个性路线", box: box(44.2, 2.4, 6, 5.4), onClick: () => goLanding("route") },
    { label: "打卡集章", box: box(52, 2.4, 6, 5.4), onClick: () => goLanding("stamp") },
    { label: "更多服务", box: box(59.6, 2.4, 5, 5.4), onClick: () => notify("更多服务敬请期待", "info") },
    { label: "打卡拍照", box: box(85.6, 2.4, 3.2, 5.4), onClick: () => goLanding("stamp") },
    { label: language === "zh" ? "切换到 English" : "切换到中文", box: box(89.2, 2.4, 4.8, 5.4), onClick: () => setLanguage((current) => (current === "zh" ? "en" : "zh")) },
    { label: "个人中心", box: box(96, 2.4, 3.4, 5.4), onClick: () => goLanding("center") },
    { label: "集章进度：灵山大佛 已打卡", box: box(9.5, 42.6, 11.5, 3.4), onClick: () => notify("灵山大佛：已打卡", "info") },
    { label: "集章进度：梵宫 已打卡", box: box(9.5, 45.8, 11.5, 3.4), onClick: () => notify("梵宫：已打卡", "info") },
    { label: "集章进度：九龙灌浴 进行中", box: box(9.5, 48.7, 11.5, 3.4), onClick: () => notify("九龙灌浴：打卡进行中", "info") },
    { label: "集章进度：五印坛城 未解锁", box: box(9.5, 51.7, 11.5, 3.4), onClick: () => notify("五印坛城：暂未解锁", "info") },
    { label: "探索更多景点，解锁更多奖励", box: box(3.8, 55.5, 16.8, 4), onClick: () => goLanding("scenic") },
    { label: "地图打卡点：灵山大佛 已打卡", box: box(47.4, 13.4, 9.8, 8), onClick: () => notify("灵山大佛：已打卡", "info") },
    { label: "地图打卡点：梵宫 已打卡", box: box(37.4, 31.8, 7, 7.4), onClick: () => notify("梵宫：已打卡", "info") },
    { label: "地图打卡点：九龙灌浴 进行中", box: box(61.8, 27.4, 8, 6.8), onClick: () => notify("九龙灌浴：打卡进行中", "info") },
    { label: "地图打卡点：五印坛城 未解锁", box: box(70, 40, 7.4, 6.8), onClick: () => notify("五印坛城：暂未解锁", "info") },
    { label: "奖励收集：限定装扮与专属称号", box: box(2.8, 68.6, 64.5, 23), onClick: () => notify("完成指定景点打卡即可领取限定装扮", "info") },
    { label: "查看装扮", box: box(70.2, 86.4, 10.4, 6.2), onClick: () => goLanding("wardrobe") },
  ];

  // 我的衣橱设计页
  const wardrobeSpots = [
    { label: "首页", box: box(31.3, 2.4, 4.8, 5.4), onClick: () => goLanding("home") },
    { label: "景区导览", box: box(36.6, 2.4, 6.2, 5.4), onClick: () => goLanding("scenic") },
    { label: "AI 数字人问答", box: box(43.8, 2.4, 6, 5.4), onClick: () => gotoPanel("assistant") },
    { label: "个性路线", box: box(51, 2.4, 6, 5.4), onClick: () => goLanding("route") },
    { label: "打卡集章", box: box(58.6, 2.4, 6, 5.4), onClick: () => goLanding("stamp") },
    { label: "更多服务", box: box(65.8, 2.4, 5, 5.4), onClick: () => notify("更多服务敬请期待", "info") },
    { label: "打卡拍照", box: box(85.2, 2.4, 3.2, 5.4), onClick: () => goLanding("stamp") },
    { label: language === "zh" ? "切换到 English" : "切换到中文", box: box(88.8, 2.4, 4.8, 5.4), onClick: () => setLanguage((current) => (current === "zh" ? "en" : "zh")) },
    { label: "个人中心", box: box(96, 2.4, 3.4, 5.4), onClick: () => goLanding("center") },
    { label: "装扮分类：发型", box: box(2, 30.4, 9, 5.8), onClick: () => notify("当前分类：发型", "info") },
    { label: "装扮分类：配饰", box: box(2, 37.6, 9, 5.8), onClick: () => notify("配饰分类即将上线", "info") },
    { label: "装扮分类：衣袍", box: box(2, 44.8, 9, 5.8), onClick: () => notify("衣袍分类即将上线", "info") },
    { label: "装扮分类：特效", box: box(2, 52, 9, 5.8), onClick: () => notify("特效分类即将上线", "info") },
    { label: "打卡奖励：梵宫·云裳羽衣 已领取", box: box(11.3, 37, 12.2, 31), onClick: () => notify("梵宫·云裳羽衣：完成梵宫景点打卡后获得，已领取", "info") },
    { label: "旋转模型", box: box(12.2, 85.6, 3.6, 6), onClick: () => notify("已旋转数字人模型", "info") },
    { label: "放大模型", box: box(17.4, 85.6, 3.6, 6), onClick: () => notify("已放大数字人模型", "info") },
    { label: "装扮页签：发型", box: box(56, 28.6, 5.4, 4.2), onClick: () => notify("当前页签：发型", "info") },
    { label: "装扮页签：配饰", box: box(63.4, 28.6, 4.6, 4.2), onClick: () => notify("配饰页签即将上线", "info") },
    { label: "装扮页签：衣袍", box: box(69.8, 28.6, 4.6, 4.2), onClick: () => notify("衣袍页签即将上线", "info") },
    { label: "装扮页签：特效", box: box(76.4, 28.6, 4.2, 4.2), onClick: () => notify("特效页签即将上线", "info") },
    { label: "云水髻 · 当前使用", box: box(55.4, 34.3, 7.6, 17.5), onClick: () => notify("云水髻：当前使用中", "info") },
    { label: "青鸾髻 · 稀有", box: box(63.1, 34.3, 7.6, 17.5), onClick: () => notify("青鸾髻：稀有装扮", "info") },
    { label: "飞天髻 · 史诗", box: box(70.7, 34.3, 7.4, 17.5), onClick: () => notify("飞天髻：史诗装扮", "info") },
    { label: "素雅髻 · 普通", box: box(78.3, 34.3, 7.8, 17.5), onClick: () => notify("素雅髻：普通装扮", "info") },
    { label: "灵山花髻 · 通关灵山大佛解锁", box: box(55.4, 53.7, 7.6, 17.5), onClick: () => notify("灵山花髻：通关灵山大佛解锁", "info") },
    { label: "梵宫流苏髻 · 通关梵宫解锁", box: box(63.1, 53.7, 7.6, 17.5), onClick: () => notify("梵宫流苏髻：通关梵宫解锁", "info") },
    { label: "九龙散发 · 通关九龙灌浴解锁", box: box(70.7, 53.7, 7.4, 17.5), onClick: () => notify("九龙散发：通关九龙灌浴解锁", "info") },
    { label: "月华髻 · 活动限定", box: box(78.3, 53.7, 7.8, 17.5), onClick: () => notify("月华髻：活动限定获取", "info") },
    { label: "云水髻装扮详情", box: box(86.4, 34.3, 12.6, 37), onClick: () => notify("云水髻：以山水为灵感，魅力值 +10、探索收益 +5%", "info") },
    { label: "景点奖励：梵宫·云裳羽衣 查看详情", box: box(65.6, 82.8, 6, 5), onClick: () => notify("梵宫·云裳羽衣：融合梵宫建筑与佛教文化元素的限定装扮", "info") },
    { label: "保存装扮", box: box(88.6, 74.2, 10, 6.2), onClick: () => notify("装扮已保存", "success") },
  ];

  // AI 数字人独立页（设计稿为底 + 真实对话面板叠放）
  const assistantSpots = [
    { label: "首页", box: box(30.4, 3, 4.4, 5.5), onClick: () => goLanding("home") },
    { label: "景区导览", box: box(36.3, 3, 5.4, 5.5), onClick: () => goLanding("scenic") },
    { label: "AI 数字人问答", box: box(44.5, 3, 5.8, 5.5), onClick: () => goLanding("assistant") },
    { label: "个性路线", box: box(53.5, 3, 5.6, 5.5), onClick: () => goLanding("route") },
    { label: "打卡集章", box: box(61.1, 3, 5.6, 5.5), onClick: () => goLanding("stamp") },
    { label: "更多服务", box: box(69.6, 3, 4.4, 5.5), onClick: () => notify("更多服务敬请期待", "info") },
    { label: "打卡拍照", box: box(85.9, 3, 2.6, 5.5), onClick: () => goLanding("stamp") },
    { label: language === "zh" ? "切换到 English" : "切换到中文", box: box(89.6, 3, 4.2, 5.5), onClick: () => setLanguage((current) => (current === "zh" ? "en" : "zh")) },
    { label: "个人中心", box: box(96.4, 3, 3.4, 5.5), onClick: () => goLanding("center") },
    // 左下灵山数字人·云澈立绘，点击进入真实对话
    { label: "灵山数字人·云澈：进入对话", box: box(0, 18, 33, 70), onClick: () => setAssistantLive(true) },
    // 右下底部"一念一境·皆是灵山"标题区域也可触发
    { label: "开始与云澈对话", box: box(0, 88, 33, 12), onClick: () => setAssistantLive(true) },
    { label: "热门问题：灵山大佛的门票价格是多少？", box: box(80.6, 31.2, 18.8, 5), onClick: () => notify("热门问题：灵山大佛的门票价格是多少？——可直接向数字人提问", "info") },
    { label: "热门问题：梵宫有哪些必看展品？", box: box(80.6, 36.6, 18.8, 5), onClick: () => notify("热门问题：梵宫有哪些必看展品？——可直接向数字人提问", "info") },
    { label: "热门问题：九龙灌浴的开放时间是几点？", box: box(80.6, 42, 18.8, 5), onClick: () => notify("热门问题：九龙灌浴的开放时间是几点？——可直接向数字人提问", "info") },
    { label: "热门问题：如何前往灵山胜境？", box: box(80.6, 47.4, 18.8, 5), onClick: () => notify("热门问题：如何前往灵山胜境？——可直接向数字人提问", "info") },
    { label: "热门问题：景区内有哪些餐饮推荐？", box: box(80.6, 52.8, 18.8, 5), onClick: () => notify("热门问题：景区内有哪些餐饮推荐？——可直接向数字人提问", "info") },
    { label: "热门问题：有哪些适合拍照的打卡点？", box: box(80.6, 58.2, 18.8, 5), onClick: () => notify("热门问题：有哪些适合拍照的打卡点？——可直接向数字人提问", "info") },
    { label: "热门问题：游览需要多长时间？", box: box(80.6, 63.6, 18.8, 5), onClick: () => notify("热门问题：游览需要多长时间？——可直接向数字人提问", "info") },
    { label: "热门问题：下雨天适合去吗？", box: box(80.6, 69, 18.8, 5), onClick: () => notify("热门问题：下雨天适合去吗？——可直接向数字人提问", "info") },
  ];

  const generateRoute = useCallback((profile) => {
    const nextRoute = chooseRoute(profile);
    setRouteKey(nextRoute);
    setRouteProfile({ ...profile, interests: [...profile.interests] });
    setLanguage(profile.language === "English" ? "en" : "zh");
    if (nextRoute === "senior") setGuideKey("dongling");
    else if (nextRoute === "family") setGuideKey("xiaoling");
    else if (nextRoute === "international") setGuideKey("wailing");
    setProfileOpen(false);
    setLanding("route");
    setActivePanel("route");
    setTimeout(() => document.getElementById("panelSection")?.scrollIntoView({ behavior: "smooth" }), 160);
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
        <section className="view active" id="visitorView">
          {landing === "home" && (
            <>
              {/* 首屏设计稿画布：整图 1:1 呈现 + 缓动视差，透明热区承载交互（坐标为设计稿百分比） */}
              <div className="hero-canvas hero-dynamic">
                <div className="hero-photo-wrap">
                  <img className="hero-photo" src="/assets/hero-home.webp" alt="灵境智游首页：灵山胜境，一场心灵的旅程——一念一境，皆是灵山" />
                  {/* 透明热区层：与照片同层同步缩放，坐标为设计稿像素百分比 */}
                  <div className="hero-hotspot-layer">
                    <button className="hero-hotspot" style={{ left: "1.5%", top: "2.6%", width: "18.7%", height: "7%" }} aria-label="灵境智游，返回首页" onClick={() => goLanding("home")} />
                    <button className="hero-hotspot" style={{ left: "27.02%", top: "3.4%", width: "4.94%", height: "3.8%" }} aria-label="首页" onClick={() => goLanding("home")} />
                    <button className="hero-hotspot" style={{ left: "32.01%", top: "3.4%", width: "7.14%", height: "3.8%" }} aria-label="景区导览" onClick={() => goLanding("scenic")} />
                    <button className="hero-hotspot" style={{ left: "39.2%", top: "3.4%", width: "6.83%", height: "3.8%" }} aria-label="AI 数字人问答" onClick={() => gotoPanel("assistant")} />
                    <button className="hero-hotspot" style={{ left: "46.08%", top: "3.4%", width: "6.78%", height: "3.8%" }} aria-label="个性路线" onClick={() => goLanding("route")} />
                    <button className="hero-hotspot" style={{ left: "52.9%", top: "3.4%", width: "7.03%", height: "3.8%" }} aria-label="打卡集章" onClick={() => goLanding("stamp")} />
                    <button className="hero-hotspot" style={{ left: "59.99%", top: "3.4%", width: "6.52%", height: "3.8%" }} aria-label="更多服务" onClick={() => notify("更多服务敬请期待", "info")} />
                    <button className="hero-hotspot" style={{ left: "83.33%", top: "3.4%", width: "3.31%", height: "3.8%" }} aria-label="打卡拍照" onClick={() => goLanding("stamp")} />
                    <button className="hero-hotspot" style={{ left: "86.9%", top: "3.4%", width: "5.4%", height: "3.8%" }} aria-label={language === "zh" ? "切换到 English" : "切换到中文"} onClick={() => setLanguage((current) => (current === "zh" ? "en" : "zh"))} />
                    <button className="hero-hotspot" style={{ left: "93.63%", top: "3.4%", width: "3.52%", height: "3.8%" }} aria-label="个人中心" onClick={() => goLanding("center")} />
                    <button className="hero-hotspot" style={{ left: "15.6%", top: "49.68%", width: "11.67%", height: "5.94%" }} aria-label="开启旅程——生成我的专属路线" onClick={() => setProfileOpen(true)} />
                    <button className="hero-hotspot" style={{ left: "78.2%", top: "25.92%", width: "21.2%", height: "9.36%" }} aria-label="灵山大佛——灵山文化名片" onClick={() => gotoPanel("assistant")} />
                    <button className="hero-hotspot" style={{ left: "78.2%", top: "35.55%", width: "21.2%", height: "8.28%" }} aria-label="灵山梵宫——东方艺术殿堂" onClick={() => gotoPanel("assistant")} />
                    <button className="hero-hotspot" style={{ left: "78.2%", top: "45%", width: "21.2%", height: "8.28%" }} aria-label="九龙灌浴——佛教圣景" onClick={() => gotoPanel("mission")} />
                    <button className="hero-hotspot" style={{ left: "78.2%", top: "54.19%", width: "21.2%", height: "8.28%" }} aria-label="五印坛城——佛教艺术宝库" onClick={() => gotoPanel("route")} />
                    <button className="hero-hotspot" style={{ left: "82.57%", top: "68.41%", width: "16.82%", height: "6.48%" }} aria-label="灵山小灵数字人——开始对话" onClick={() => { gotoPanel("assistant"); notify("灵山小灵已就位，有什么想问的尽管开口"); }} />
                  </div>
                </div>
                {/* 动态氛围层：光束、流雾与上浮金尘 */}
                <HomeAmbience />
              </div>
            </>
          )}

          {/* 景区导览：地图定位点 / 景点分类 / 查看详情均唤起弹窗，不再滚动到页面下方 */}
          {landing === "scenic" && (
            <DesignPage src="/assets/scenic-guide.webp" ratio="1961 / 1109" alt="景区导览——步一景 · 探寻灵山之美" hotspots={scenicSpots} markers={scenicMarkers} chips={scenicCategoryChips} cover={scenicCover} />
          )}
          {landing === "route" && (
            <>
              <DesignPage src="/assets/route-plan.webp" ratio="1959 / 1109" alt="个性路线——循心而行，定制你的灵山之旅" hotspots={routeSpots} />
              {/* 真实路线面板：点「查看路线」或生成路线后展示在设计页下方 */}
              {activePanel === "route" && (
                <div className="page-panel" id="panelSection">
                  <Suspense fallback={<PanelLoading />}>
                    <RoutePanel route={activeRoute} onEditProfile={() => setProfileOpen(true)} notify={notify} />
                  </Suspense>
                </div>
              )}
            </>
          )}
          {landing === "assistant" && (
            <DesignPage src="/assets/assistant-page.webp" ratio="1891 / 1080" alt="AI数字人·智慧导览——有问题，问云澈，让旅程更简单" hotspots={assistantSpots} />
          )}
          {landing === "center" && (
            <DesignPage src="/assets/profile-center.webp" ratio="1962 / 1109" alt="个人中心——行走灵山 · 收藏美好" hotspots={centerSpots} />
          )}
          {landing === "stamp" && (
            <>
              <DesignPage src="/assets/stamp-panel.webp" ratio="1960 / 1109" alt="打卡集章——探寻灵山胜境 · 收集专属奖励" hotspots={stampSpots} />
              {/* 真实打卡面板：需要上传照片等操作时展示在设计页下方 */}
              {activePanel === "mission" && (
                <div className="page-panel" id="panelSection">
                  <Suspense fallback={<PanelLoading />}>
                    <MissionPanel guide={guides[guideKey]} missions={missions} setMissions={setMissions} notify={notify} />
                  </Suspense>
                </div>
              )}
            </>
          )}
          {landing === "wardrobe" && (
            <DesignPage src="/assets/wardrobe-panel.webp" ratio="1960 / 1109" alt="我的衣橱——收集灵山风华，装扮独一无二的你" hotspots={wardrobeSpots} />
          )}
        </section>
      </main>

      {profileOpen && <Suspense fallback={null}><ProfileModal open onClose={() => setProfileOpen(false)} onGenerate={generateRoute} initialProfile={routeProfile} /></Suspense>}
      {/* AI 数字人真实对话浮层（点击设计页立绘或底部标题区域触发） */}
      {assistantLive && (
        <div className="assistant-overlay" role="dialog" aria-modal="true" aria-label="灵山数字人云澈对话">
          <button className="assistant-overlay-back" onClick={() => setAssistantLive(false)} aria-label="返回数字人介绍页">← 返回介绍</button>
          <div className="assistant-overlay-card">
            <AssistantPanel guideKey={guideKey} onGuideChange={setGuideKey} route={activeRoute} language={language} notify={notify} presetQuestion={presetQuestion} />
          </div>
        </div>
      )}
      {loginOpen && <Suspense fallback={null}><LoginModal open onClose={() => setLoginOpen(false)} notify={notify} onLogin={() => { setAdminLogged(true); setLoginOpen(false); setView("admin"); notify("欢迎进入灵山运营中心", "success"); }} /></Suspense>}
      {/* 景区导览弹窗：地图定位点 / 景点分类 / 查看详情点击后直接弹出，不再跳转下方版块 */}
      {spotModal && (
        <div
          className="scenic-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label="景区导览 · 景点详情"
          onClick={(event) => { if (event.target === event.currentTarget) setSpotModal(false); }}
        >
          <div className="scenic-modal">
            <button type="button" className="scenic-modal-close" onClick={() => setSpotModal(false)} aria-label="关闭景点详情">×</button>
            <Suspense fallback={<PanelLoading />}>
              <ScenicPanel
                categories={spotCategories}
                category={spotCategory}
                onCategoryChange={pickSpotCategory}
                spots={visibleSpots}
                activeKey={activeSpotKey}
                onSelect={focusSpot}
                onAsk={askGuide}
                onPlan={() => planSpot(visibleSpots.find((item) => item.key === activeSpotKey))}
                onCheckin={checkinSpot}
                scoped={spotCategory !== "all"}
              />
            </Suspense>
          </div>
        </div>
      )}
      {/* 打卡弹窗：从景点详情「去这里打卡」唤起 */}
      {missionModal && (
        <div
          className="scenic-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label="打卡集章"
          onClick={(event) => { if (event.target === event.currentTarget) setMissionModal(false); }}
        >
          <div className="scenic-modal">
            <button type="button" className="scenic-modal-close" onClick={() => setMissionModal(false)} aria-label="关闭打卡面板">×</button>
            <Suspense fallback={<PanelLoading />}>
              <MissionPanel guide={guides[guideKey]} missions={missions} setMissions={setMissions} notify={notify} />
            </Suspense>
          </div>
        </div>
      )}
      <ToastHost toasts={toasts} />
    </>
  );
}
