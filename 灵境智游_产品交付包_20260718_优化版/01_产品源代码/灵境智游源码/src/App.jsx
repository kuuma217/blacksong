import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from "react";
import Header from "./components/Header.jsx";
import AssistantPanel from "./components/AssistantPanel.jsx";
import HomeAmbience from "./components/HomeAmbience.jsx";
import RouteConfigurator from "./components/RouteConfigurator.jsx";
import RouteRecommender from "./components/RouteRecommender.jsx";
import ToastHost from "./components/ToastHost.jsx";
import { MISSION_STORAGE_KEY, writeMissions } from "./utils/userProgress.js";
import StampStatusOverlay from "./components/StampStatusOverlay.jsx";
import StampRewardOverlay from "./components/StampRewardOverlay.jsx";
import WardrobePage from "./components/WardrobePage.jsx";
import CenterPanoCard from "./components/CenterPanoCard.jsx";
import CenterOutfitReward from "./components/CenterOutfitReward.jsx";
import CenterVisitedSpots from "./components/CenterVisitedSpots.jsx";
import CenterTravelStats from "./components/CenterTravelStats.jsx";
import CenterProfileStats from "./components/CenterProfileStats.jsx";
import CenterCalendar from "./components/CenterCalendar.jsx";
import { guides } from "./data/guides.js";
import { DEFAULT_LANGUAGE, normalizeLanguage } from "./data/languages.js";
import { planRoute } from "./data/routePlanner.js";
import { buildRouteSelection, defaultConstraints, personalizeRoute } from "./data/routes.js";
import { filterSpots, spotCategories, spotCategoryLabel, spots as allSpots } from "./data/spots.js";

const RoutePanel = lazy(() => import("./components/RoutePanel.jsx"));
const MissionPanel = lazy(() => import("./components/MissionPanel.jsx"));
const ScenicPanel = lazy(() => import("./components/ScenicPanel.jsx"));
const SpotDetailModal = lazy(() => import("./components/SpotDetailModal.jsx"));
const ScenicPano = lazy(() => import("./components/ScenicPano.jsx"));
const ScenicScene = lazy(() => import("./components/ScenicScene.jsx"));
const ProfileModal = lazy(() => import("./components/ProfileModal.jsx"));
const LoginModal = lazy(() => import("./components/LoginModal.jsx"));
const AdminDashboard = lazy(() => import("./components/AdminDashboard.jsx"));

const PanelLoading = () => <div className="panel-loading" role="status">正在加载体验…</div>;

// 莲花图标路径：设计稿里「热门问题」标题与条目左侧的装饰图形
const LOTUS_PATH =
  "M12 3.2c1.9 2.3 2.8 4.3 2.8 6 0 1-.3 1.9-.9 2.7 1.5-.6 3-.5 4.4.3 1.2.7 1.9 1.8 2.2 3.1-1.9.9-3.7 1.1-5.4.7-1.1-.3-2.1-.9-2.9-1.7.5 1.8.3 3.5-.6 5.1-.2.4-.4.7-.6.9h-1.1c-.2-.2-.4-.5-.6-.9-.9-1.6-1.1-3.3-.6-5.1-.8.8-1.8 1.4-2.9 1.7-1.7.4-3.5.2-5.4-.7.3-1.3 1-2.4 2.2-3.1 1.4-.8 2.9-.9 4.4-.3-.6-.8-.9-1.7-.9-2.7 0-1.7.9-3.7 2.8-6Z";

// 景区导览的景点 key -> 打卡背景 id 的映射。
// checkinBackgrounds 用的是 wuyin / jiulong / fangong / dafou，
// 而 spots.js 的 spot.key 是 mandala / dragons / palace / buddha 这类英文别名，两者不同名，
// 靠这张表对应，使「去这里打卡」能直接定位到该景点并唤起它的上传打卡弹窗。
const CHECKIN_SPOT_MAP = {
  mandala: "wuyin",
  dragons: "jiulong",
  palace: "fangong",
  buddha: "dafou"
};

// 切换落地页时回到页面顶部。
// 全局样式里有 html{scroll-behavior:smooth}，会把置顶变成一段动画：
// 从页面下方点「查看装扮」这类入口时，新页面已经渲染完但页面还在往上滚，
// 那一瞬间会像是新页面接在上一页的下面。这里用 auto 立即到位，
// 并兜底直接重置文档滚动位置（个别环境下 window.scrollTo 不驱动窗口滚动）。
const scrollPageToTop = () => {
  window.scrollTo({ top: 0, behavior: "auto" });
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
};

// 通用设计稿整页：1:1 呈现 + 透明热区交互（C 责任页面共用）
// active 为 true 的热区会显示金色高亮，用于反馈「已选中」状态
// markers：可见的地图景点标注（底图未绘制的景点由 DOM 标注补齐）
// chips：覆盖在底图上的分类胶囊（重绘底图里画死的分类样式，悬停变绿）
// cover：整列不透明底色，先把底图画死的分类彻底挡住，胶囊再画在这层之上
// rail：右侧随景点联动的实景侧栏卡片（跟随当前点选的景点切换图片与信息）
// children：叠在设计稿上的真实组件层（个性路线页的筛选面板/推荐卡片、AI 数字人页的对话与热门问题）
function DesignPage({ src, ratio, alt, hotspots, markers, chips, cover, rail, railBox, children }) {
  return (
    <div className="hero-canvas" style={{ aspectRatio: ratio }}>
      <img className="hero-photo" src={src} alt={alt} decoding="async" fetchPriority="high" />
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
      {rail && railBox && (
        <div
          className="design-rail"
          style={{ left: `${railBox[0]}%`, top: `${railBox[1]}%`, width: `${railBox[2]}%`, height: `${railBox[3]}%` }}
        >
          {rail}
        </div>
      )}
      {hotspots.map((spot) => (
        <button
          key={spot.label}
          className={`hero-hotspot${spot.variant === "ask" ? " hero-hotspot-ask" : ""}${spot.active ? " is-active" : ""}`}
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
      {children}
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

// 个性路线页「定制你的专属路线」面板的选择（时长 / 兴趣 / 预算 / 节奏）
const loadStoredConstraints = () => {
  try {
    const stored = JSON.parse(window.localStorage.getItem("lingjing-route-constraints"));
    return stored
      ? {
          ...defaultConstraints,
          ...stored,
          // 兴趣偏好四选一：旧缓存里可能存了多项，只保留第一项
          interests: stored.interests && stored.interests.length ? [stored.interests[0]] : []
        }
      : defaultConstraints;
  } catch {
    return defaultConstraints;
  }
};

export default function App() {
  const [view, setView] = useState("visitor");
  const [activePanel, setActivePanel] = useState("assistant");
  const [guideKey, setGuideKey] = useState(() => {
    const saved = window.localStorage.getItem("lingjing-guide");
    return Object.hasOwn(guides, saved) ? saved : "lingruo";
  });
  const [routeKey, setRouteKey] = useState(() => window.localStorage.getItem("lingjing-route") || "photo");
  const [routeProfile, setRouteProfile] = useState(loadStoredProfile);
  // 界面语言：由右上角下拉选择，结果记在本地，刷新后仍保持上次的选择
  const [language, setLanguage] = useState(() =>
    normalizeLanguage(window.localStorage.getItem("lingjing-language") || DEFAULT_LANGUAGE)
  );
  const [profileOpen, setProfileOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [adminLogged, setAdminLogged] = useState(false);
  // 打卡集章进度：首次进入沿用演示态（灵山大佛已打卡），之后以本机存储中的真实进度为准
  const [missions, setMissions] = useState(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem(MISSION_STORAGE_KEY) || "null");
      if (Array.isArray(saved) && saved.length === 4 && saved.every((value) => typeof value === "boolean")) return saved;
    } catch (error) {
      console.warn("打卡进度读取失败，按首次进入处理", error);
    }
    return [true, false, false, false];
  });
  // 打卡集章：设计图热区 / 景区导览指定的待打卡景点 ID（null 表示无指定；由 MissionPanel 消费后清空）
  const [pendingSpotId, setPendingSpotId] = useState(null);

  // MissionPanel 只更新内存里的 missions，这里同步落盘，保证刷新后集章进度不丢
  useEffect(() => {
    writeMissions(missions);
  }, [missions]);
  // 个性路线页：配方面板的选择、是否正在规划、智能体生成结果、正在规划的目标卡片
  const [routeConstraints, setRouteConstraints] = useState(loadStoredConstraints);
  const [planning, setPlanning] = useState(false);
  const [generatedRoute, setGeneratedRoute] = useState(null);
  const [planningKey, setPlanningKey] = useState("");
  // 「为我推荐路线」/「查看路线」的结果改为弹窗呈现，不再下滑到页面下方的面板
  const [routeModalOpen, setRouteModalOpen] = useState(false);
  // 待投递给数字人的指令（来自热区 / 热门问题）：{ question, focus }，面板挂载后消费
  const [pendingAsk, setPendingAsk] = useState(null);

  const [toasts, setToasts] = useState([]);
  // 游客端整页落地页：home 首页 / scenic 景区导览 / route 个性路线 / center 个人中心 / stamp 打卡集章 / wardrobe 我的衣橱 / assistant AI 数字人
  const [landing, setLanding] = useState("home");
  // AI 数字人页：点击立绘后弹出真实对话面板
  const [assistantLive, setAssistantLive] = useState(false);
  // 景区导览：当前景点分类与选中景点（设计页热区与真实面板双向联动）
  const [spotCategory, setSpotCategory] = useState("all");
  const [activeSpotKey, setActiveSpotKey] = useState("buddha");
  // 提问已改由 lingjing:ask 事件投递（见 askGuide / askAssistant），无需再暂存预设问题
  // 景区导览：景点详情与打卡改为弹窗呈现，不再滚动到设计页下方
  const [spotModal, setSpotModal] = useState(false);
  const [missionModal, setMissionModal] = useState(false);
  // 景点详情弹窗：由侧栏「查看详情」唤起（spotKey 为 null 时关闭）
  const [spotDetailKey, setSpotDetailKey] = useState(null);
  // 景区导览的三种视图：map 大地图 / scene 单个景点场景 / pano 景区全景长卷
  const [scenicView, setScenicView] = useState("map");
  // 进入场景时的缩放原点（点击位置在底图上的百分比坐标）
  const [sceneOrigin, setSceneOrigin] = useState({ x: 50, y: 50 });
  // 返回大地图时先播放缩回动画，动画结束再卸载场景
  const [sceneClosing, setSceneClosing] = useState(false);

  const notify = useCallback((message, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts((current) => [...current, { id, message, type }]);
    window.setTimeout(() => setToasts((current) => current.filter((toast) => toast.id !== id)), 3200);
  }, []);

  useEffect(() => window.localStorage.setItem("lingjing-guide", guideKey), [guideKey]);
  useEffect(() => window.localStorage.setItem("lingjing-route", routeKey), [routeKey]);
  useEffect(() => window.localStorage.setItem("lingjing-language", language), [language]);


  // 响应顶部导航的分区跳转（Header 通过内部事件通知，不改冻结 props）
  useEffect(() => {
    const onNavigate = (event) => {
      const { panel } = event.detail || {};
      if (panel === "scenic" || panel === "route" || panel === "center" || panel === "stamp" || panel === "wardrobe" || panel === "home") {
        setSpotModal(false);
        setMissionModal(false);
        setLanding(panel);
        // 切页时立即置顶：全局 html{scroll-behavior:smooth} 会把置顶变成一段动画，
        // 从页面下方点入口时会先看到新页面的下半截，像是新页面接在上一页下面
        scrollPageToTop();
        return;
      }
      if (panel === "assistant") {
        setSpotModal(false);
        setMissionModal(false);
        setLanding("assistant");
        scrollPageToTop();
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
  useEffect(() => {
    window.localStorage.setItem("lingjing-route-constraints", JSON.stringify(routeConstraints));
  }, [routeConstraints]);

  // 指令投递给页面内的数字人：子组件 effect 先于父组件 effect 执行，
  // 因此派发时 AssistantPanel 的监听一定已注册，事件不会丢
  useEffect(() => {
    if (landing !== "assistant" || !pendingAsk) return;
    window.dispatchEvent(new CustomEvent("lingjing:ask", { detail: pendingAsk }));
    setPendingAsk(null);
  }, [landing, pendingAsk]);


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

  // 智能体生成的路线优先展示；没有时按当前画像用本地规则推导
  const activeRoute = useMemo(
    () => generatedRoute || personalizeRoute(routeKey, routeProfile),
    [generatedRoute, routeKey, routeProfile]
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
      scrollPageToTop();
      return;
    }
    setSpotModal(false);
    setLanding(panel === "mission" ? "stamp" : "route");
    setActivePanel(panel);
    setTimeout(() => document.getElementById("panelSection")?.scrollIntoView({ behavior: "smooth" }), 120);
  }, []);

  // 整页落地页跳转（离开导览时回到默认的地图视图）
  const goLanding = useCallback((page) => {
    setSpotModal(false);
    setMissionModal(false);
    setScenicView("map");
    setLanding(page);
    // 切换落地页时立即置顶（不用 smooth）：从页面下方点击「查看装扮」这类入口时，
    // 平滑滚动还没走完新页面就已经渲染完，会让人误以为新页面接在上一页的下面。
    scrollPageToTop();
  }, []);

  // 点击「热门问题」：切到 AI 数字人页，并把问题直接投递给页面内的数字人作答
  const askAssistant = useCallback((question) => {
    setLanding("assistant");
    setPendingAsk({ question });
  }, []);

  // 点击设计稿里的输入框 / 数字人立绘：切到 AI 数字人页并把光标聚焦到真实输入框，可直接打字
  const focusAssistantInput = useCallback(() => {
    setLanding("assistant");
    setPendingAsk({ question: "", focus: true });
  }, []);

  // 进入景区全景漫游：不再跳回首页，而是切到全景长卷视角
  const showPano = useCallback(() => {
    setSpotModal(false);
    setScenicView("pano");
    notify("已进入景区全景，按住画面左右拖动即可环视", "info");
  }, [notify]);

  // 回到全景：清除景点筛选，展示全部景点的大地图
  const backToOverview = useCallback(() => {
    setSpotCategory("all");
    setScenicView("map");
    setSceneClosing(false);
    notify("已回到全景地图 · 全部 9 个景点", "info");
  }, [notify]);

  // 进入景点场景：以点击位置为原点，从地图放大推入该景点
  const enterScene = useCallback((key, origin) => {
    const target = allSpots.find((item) => item.key === key);
    if (!target) return;
    setSpotModal(false);
    // 定位到不在当前分类的景点时，切到该景点所属分类，而不是回到「全部景点」
    if (spotCategory !== "all" && !target.categories.includes(spotCategory)) {
      setSpotCategory(target.categories[0] || "all");
    }
    setActiveSpotKey(key);
    setSceneOrigin(origin && Number.isFinite(origin.x) ? origin : { x: 50, y: 50 });
    setSceneClosing(false);
    setScenicView("scene");
    notify(`已进入：${target.name} · ${target.badge}`, "info");
  }, [notify, spotCategory]);

  // 场景内直接切换到另一个景点（不再重播缩放进入动画）
  const selectScene = useCallback((key) => {
    const target = allSpots.find((item) => item.key === key);
    if (!target) return;
    if (spotCategory !== "all" && !target.categories.includes(spotCategory)) {
      setSpotCategory(target.categories[0] || "all");
    }
    setActiveSpotKey(key);
  }, [spotCategory]);

  // 返回全景（大地图）：先播放缩回动画，结束再卸载场景
  const backToMap = useCallback(() => {
    if (scenicView === "scene") {
      setSceneClosing(true);
      setTimeout(() => {
        setScenicView("map");
        setSceneClosing(false);
      }, 520);
    } else {
      setScenicView("map");
    }
    notify("已返回全景地图", "info");
  }, [notify, scenicView]);

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
  // 只切换侧栏内容，不再自动弹出弹窗
  const focusSpot = useCallback((key) => {
    const spot = allSpots.find((item) => item.key === key);
    if (!spot) return;
    // 定位到不在当前分类的景点时，切到该景点所属分类，而不是回到「全部景点」
    if (spotCategory !== "all" && !spot.categories.includes(spotCategory)) {
      setSpotCategory(spot.categories[0] || "all");
    }
    setActiveSpotKey(key);
    notify(`已定位：${spot.name} · ${spot.badge}`, "info");
  }, [notify, spotCategory]);

  // 打开景点详情弹窗（信息比侧栏更全面）
  const openSpotDetail = useCallback((key) => {
    setSpotModal(false);
    setSpotDetailKey(key);
  }, []);

  const closeSpotDetail = useCallback(() => setSpotDetailKey(null), []);

  // 带着景点问题去问数字人：kuma 版 AssistantPanel 通过 lingjing:ask 事件接收提问，
  // 浮层挂载后延迟一拍再派发，确保监听已注册
  const askGuide = useCallback((spot) => {
    setSpotModal(false);
    setAssistantLive(true);
    window.setTimeout(() => {
      window.dispatchEvent(new CustomEvent("lingjing:ask", { detail: { question: spot.question } }));
    }, 80);
    notify(`已向数字人提问：${spot.question}`, "success");
  }, [notify]);

  // 把景点带进路线规划
  const planSpot = useCallback((spot) => {
    setSpotModal(false);
    setProfileOpen(true);
    notify(spot ? `正在为你规划包含「${spot.name}」的路线` : "正在为你规划专属路线", "info");
  }, [notify]);

  // 去打卡集章：以弹窗呈现，不跳转页面。
  // 仅对在 checkinBackgrounds 中有对应站点的景点（五印坛城 / 九龙灌浴 / 梵宫 / 灵山大佛）弹窗，
  // MissionPanel 会自动打开该站点的上传打卡弹窗；
  // 其余景点不在打卡系统内，直接提示，避免弹出空白或超长面板。
  const checkinSpot = useCallback((spot) => {
    setSpotModal(false);
    const target = CHECKIN_SPOT_MAP[spot?.key];
    if (!target) {
      notify(spot ? `「${spot.name}」暂未开放照片打卡，可先完成四大站点的集章` : "该景点暂未开放照片打卡", "info");
      return;
    }
    setPendingSpotId(target);
    setMissionModal(true);
    notify(`已打开打卡面板，可上传「${spot.name}」的打卡照`, "info");
  }, [notify]);

  const visibleSpots = useMemo(() => filterSpots(spotCategory), [spotCategory]);

  // 设计稿页热区（坐标为设计稿百分比）
  const box = (l, t, w, h) => [l, t, w, h];
  // 取热区中心，作为进入场景时的缩放原点
  const centerOf = (b) => ({ x: b[0] + b[2] / 2, y: b[1] + b[3] / 2 });
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
    { label: "个人中心", box: box(94.14, 2.5, 3.93, 4.3), onClick: () => goLanding("center") },
    { label: "返回全景", box: box(62.8, 33.9, 7.4, 4), onClick: backToOverview },
    // 地图上的景点钉：以钉子所在位置为原点，放大推入该景点场景
    { label: "地图定位：灵山大佛", box: box(44.6, 39.6, 8.4, 4.8), active: activeSpotKey === "buddha", onClick: () => enterScene("buddha", centerOf([44.6, 39.6, 8.4, 4.8])) },
    { label: "地图定位：梵宫", box: box(35.4, 49, 6.4, 4.6), active: activeSpotKey === "palace", onClick: () => enterScene("palace", centerOf([35.4, 49, 6.4, 4.6])) },
    { label: "地图定位：五印坛城", box: box(55.6, 60.8, 9, 4.8), active: activeSpotKey === "mandala", onClick: () => enterScene("mandala", centerOf([55.6, 60.8, 9, 4.8])) },
    { label: "地图定位：九龙灌浴", box: box(30.6, 65.2, 8.8, 4.6), active: activeSpotKey === "dragons", onClick: () => enterScene("dragons", centerOf([30.6, 65.2, 8.8, 4.6])) },
    { label: "查看当前景点详情", box: box(74, 83.9, 10.6, 5.2), onClick: () => openSpotDetail(activeSpotKey) },
    { label: "规划路线", box: box(85.88, 83.68, 10.71, 5.41), onClick: () => planSpot(visibleSpots.find((item) => item.key === activeSpotKey)) },
  ];

  // 地图标注：底图只绘制了四个景点钉，其余景点用 DOM 标注补齐（坐标为设计稿百分比）
  const scenicMarkers = [
    { key: "xiangfu", label: "祥符禅寺", icon: "禅", point: [50, 50.5], active: activeSpotKey === "xiangfu", onClick: () => enterScene("xiangfu", { x: 50, y: 49 }) },
    { key: "maitreya", label: "百子戏弥勒", icon: "趣", point: [47.5, 66], active: activeSpotKey === "maitreya", onClick: () => enterScene("maitreya", { x: 47.5, y: 64.5 }) },
    { key: "perfume", label: "香水海", icon: "水", point: [32, 76.5], active: activeSpotKey === "perfume", onClick: () => enterScene("perfume", { x: 32, y: 75 }) },
    { key: "screenwall", label: "灵山照壁", icon: "照", point: [45.5, 81], active: activeSpotKey === "screenwall", onClick: () => enterScene("screenwall", { x: 45.5, y: 79.5 }) },
    { key: "vegetarian", label: "灵山蔬食馆", icon: "斋", point: [56, 79.5], active: activeSpotKey === "vegetarian", onClick: () => enterScene("vegetarian", { x: 56, y: 78 }) },
  ];

  // 整列底色遮挡层：盖住左侧分类项区域（x 2%-17.6% / y 39%-88%），胶囊再叠上去。
  // 顶边从 31.5% 下移到 39%：底图上绘制的「景点分类」标题在 31.3%-37.6%，
  // 之前整块盖住把标题也吞了，现在把它露出来，胶囊从标题下方开始。
  const scenicCover = [2, 39, 15.6, 49];

  // 景点分类胶囊：画在遮挡层之上，默认浅色、悬停变绿；已按你说的把「全部景点」整档上调
  const scenicCategoryChips = [
    { key: "all", label: "全部景点", icon: "全", box: box(2.6, 39.6, 14.6, 6.4), active: spotCategory === "all", onClick: () => pickSpotCategory("all") },
    { key: "buddhist", label: "佛教文化", icon: "佛", box: box(2.6, 48, 14.6, 5.8), active: spotCategory === "buddhist", onClick: () => pickSpotCategory("buddhist") },
    { key: "nature", label: "自然景观", icon: "山", box: box(2.6, 55.6, 14.6, 5.8), active: spotCategory === "nature", onClick: () => pickSpotCategory("nature") },
    { key: "architecture", label: "主题建筑", icon: "殿", box: box(2.6, 63.3, 14.6, 5.8), active: spotCategory === "architecture", onClick: () => pickSpotCategory("architecture") },
    { key: "leisure", label: "休闲体验", icon: "憩", box: box(2.6, 71.1, 14.6, 5.8), active: spotCategory === "leisure", onClick: () => pickSpotCategory("leisure") },
  ];

  // 右侧侧栏位置：与底图上绘制的卡片框架对齐（x 71.7%-98.1% / y 30.8%-93.3%）。
  // 底图卡片实测四边为 左 71.9% / 右 97.9% / 上 31.0% / 下 93.1%，
  // 侧栏四边各外扩约 0.2%，刚好盖住边缝又不越过卡片外框。
  // 顶部导航与底部按钮的功能已由卡片内的按钮承接
  const scenicRailBox = [71.7, 30.8, 26.4, 62.5];
  // 全景视图的侧栏位置（全景画布为 16:7，比地图矮，卡片相应加深）
  const scenicPanoRailBox = [73, 10, 25, 80];

  // 全景长卷上的 9 个景点标注（pos 为在长卷上的百分比位置，由全景图合成时算出）
  const scenicPanoMarkers = [
    { key: "screenwall", label: "灵山照壁", icon: "照", pos: 6.85, active: activeSpotKey === "screenwall", onClick: () => enterScene("screenwall", { x: 12, y: 28 }) },
    { key: "dragons", label: "九龙灌浴", icon: "龙", pos: 17.65, active: activeSpotKey === "dragons", onClick: () => enterScene("dragons", { x: 20, y: 28 }) },
    { key: "xiangfu", label: "祥符禅寺", icon: "禅", pos: 28.46, active: activeSpotKey === "xiangfu", onClick: () => enterScene("xiangfu", { x: 28, y: 28 }) },
    { key: "buddha", label: "灵山大佛", icon: "佛", pos: 39.19, active: activeSpotKey === "buddha", onClick: () => enterScene("buddha", { x: 38, y: 28 }) },
    { key: "palace", label: "灵山梵宫", icon: "宫", pos: 50.02, active: activeSpotKey === "palace", onClick: () => enterScene("palace", { x: 49, y: 28 }) },
    { key: "mandala", label: "五印坛城", icon: "坛", pos: 60.84, active: activeSpotKey === "mandala", onClick: () => enterScene("mandala", { x: 60, y: 28 }) },
    { key: "maitreya", label: "百子戏弥勒", icon: "趣", pos: 71.58, active: activeSpotKey === "maitreya", onClick: () => enterScene("maitreya", { x: 70, y: 28 }) },
    { key: "perfume", label: "香水海", icon: "水", pos: 82.36, active: activeSpotKey === "perfume", onClick: () => enterScene("perfume", { x: 80, y: 28 }) },
    { key: "vegetarian", label: "灵山蔬食馆", icon: "斋", pos: 93.15, active: activeSpotKey === "vegetarian", onClick: () => enterScene("vegetarian", { x: 90, y: 28 }) },
  ];

  // 全景视图的页面导航（全景没有设计稿底图，单独给一组页面入口）
  const panoNav = [
    { label: "首页", onClick: () => goLanding("home") },
    { label: "个性路线", onClick: () => goLanding("route") },
    { label: "打卡集章", onClick: () => goLanding("stamp") },
    { label: "我的衣橱", onClick: () => goLanding("wardrobe") },
    { label: "个人中心", onClick: () => goLanding("center") },
  ];

  // 右侧侧栏：跟随当前点选景点，切换实景图与信息
  const activeSpot = allSpots.find((item) => item.key === activeSpotKey) || allSpots[0];
  const scenicRail = (
    <aside className="scenic-rail" key={activeSpot.key}>
      <div className="scenic-rail-head">
        <span className="scenic-rail-eyebrow">当前景点 · {spotCategoryLabel(activeSpot.categories[0] || "all")}</span>
        <h4>
          {activeSpot.name}
          <em>{activeSpot.badge}</em>
        </h4>
      </div>
      {activeSpot.image && (
        <img className="scenic-rail-photo" src={activeSpot.image} alt={`${activeSpot.name}实景`} />
      )}
      <p className="scenic-rail-intro">{activeSpot.intro}</p>
      <p className="scenic-rail-highlight">✨ {activeSpot.highlight}</p>
      <div className="scenic-rail-meta">
        <span>开放 {activeSpot.hours}</span>
        <span>{activeSpot.duration}</span>
        <span>票务 {activeSpot.ticket}</span>
      </div>
      <div className="scenic-rail-actions">
        <button type="button" className="scenic-rail-btn" onClick={() => openSpotDetail(activeSpot.key)}>
          查看详情
        </button>
        <button type="button" className="scenic-rail-btn ghost" onClick={() => planSpot(activeSpot)}>
          AI规划路线
        </button>
      </div>
    </aside>
  );

  // 个性路线页：左下「定制你的专属路线」与右侧「推荐路线」卡片区，
  // 前者由 RouteConfigurator、后者由 RouteRecommender 以真实控件就地叠放，
  // 这些位置的热区会拦截真实控件点击，因此这里只保留顶部导航。
  const routeSpots = [
    ...buildNavSpots(),
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
    // 「我的收藏路线」整块卡片（含「查看更多」与四条路线小卡）：点击直接进入个性路线页，不再下滑到路线面板
    { label: "我的收藏路线：查看更多", box: box(49.0, 51.2, 26.0, 25.0), onClick: () => goLanding("route") },
    { label: "我的装扮奖励：查看更多", box: box(93.2, 53.2, 4.8, 3.2), onClick: () => goLanding("wardrobe") },
    // 「装扮奖励详情」热区已由 CenterOutfitReward 覆盖（四张服装卡各自可点：已解锁去衣橱 / 未解锁去打卡）
    // 「最喜欢的景点」热区已由 CenterPanoCard 整块覆盖（点击卡片同样跳转景区导览），不再单独标定
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
    { label: "集章进度：九龙灌浴 进行中", box: box(9.5, 48.7, 11.5, 3.4), onClick: () => setPendingSpotId("jiulong") },
    { label: "集章进度：五印坛城 未解锁", box: box(9.5, 51.7, 11.5, 3.4), onClick: () => notify("五印坛城：暂未解锁", "info") },
    { label: "探索更多景点，解锁更多奖励", box: box(3.8, 55.5, 16.8, 4), onClick: () => goLanding("scenic") },
    { label: "地图打卡点：灵山大佛 已打卡", box: box(47.4, 13.4, 9.8, 8), onClick: () => notify("灵山大佛：已打卡", "info") },
    { label: "地图打卡点：梵宫 已打卡", box: box(37.4, 31.8, 7, 7.4), onClick: () => notify("梵宫：已打卡", "info") },
    { label: "地图打卡点：九龙灌浴 进行中", box: box(61.8, 27.4, 8, 6.8), onClick: () => setPendingSpotId("jiulong") },
    { label: "地图打卡点：五印坛城 未解锁", box: box(70, 40, 7.4, 6.8), onClick: () => notify("五印坛城：暂未解锁", "info") },
    { label: "奖励收集：限定装扮与专属称号", box: box(2.8, 68.6, 64.5, 23), onClick: () => notify("完成指定景点打卡即可领取限定装扮", "info") },
    { label: "查看装扮", box: box(70.2, 86.4, 10.4, 6.2), onClick: () => goLanding("wardrobe") },
  ];

  // 我的衣橱：页面主体已由 WardrobePage 真实实现（套装切换 / 详情 / 保存），
  // 这里只保留顶部公共导航热区。
  // 原先按静态底图标定的 22 个内容热区（装扮分类、页签、八种发型卡、旋转/放大模型、
  // 「保存装扮」假按钮等）已全部移除：它们在旧图上只是 notify 假提示，
  // 且新页面布局完全不同，留着会悬浮遮挡 WardrobePage 的真实套装卡片。
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
  ];

  // AI 数字人独立页（设计稿为底 + 真实对话面板叠放）
  // 右侧「热门问题」列表（真实列表渲染，hover 显示选中态，点击直接向数字人提问）
  const hotQuestions = [
    "灵山大佛的门票价格是多少？",
    "梵宫有哪些必看展品？",
    "九龙灌浴的开放时间是几点？",
    "如何前往灵山胜境？",
    "景区内有哪些餐饮推荐？",
    "有哪些适合拍照的打卡点？",
    "游览需要多长时间？",
    "下雨天适合去吗？"
  ];

  // AI 数字人页：顶部导航改由 DOM 重建（design-nav，与其他页面设计稿导航同一视觉风格），
  // 因此不再需要导航热区；只保留会打开对话的立绘 / 标题热区
  const assistantSpots = [
    { label: "灵山数字人立绘：开始对话", box: box(0, 18, 32, 70), onClick: focusAssistantInput },
    { label: "一念一境 · 皆是灵山：开始对话", box: box(0, 88, 32, 12), onClick: focusAssistantInput },
  ];

  // 生成结果落地：写回路线键与档案，再展开下方的真实路线面板
  const applyRoute = useCallback((nextRouteKey, nextProfile, message) => {
    // 手动选约束重新生成时，丢弃上一次智能体结果，保证面板与左侧选择一致
    setGeneratedRoute(null);
    setRouteKey(nextRouteKey);
    setRouteProfile(nextProfile);
    if (nextProfile.language) setLanguage(nextProfile.language === "English" ? "en" : "zh");
    if (nextRouteKey === "senior") setGuideKey("dongling");
    else if (nextRouteKey === "family") setGuideKey("xiaoling");
    else if (nextRouteKey === "international") setGuideKey("wailing");
    setProfileOpen(false);
    setPlanning(false);
    setLanding("route");
    // 结果直接以弹窗呈现：不展开页面下方面板，也不滚动页面
    setRouteModalOpen(true);
    notify(message, "success");
  }, [notify]);

  // 主界面「为我推荐路线」：先在设计稿面板上选好约束，点按钮后才展示结果
  const generateFromConstraints = useCallback((constraints) => {
    setRouteConstraints(constraints);
    setPlanning(true);
    window.setTimeout(() => {
      const { routeKey: nextRouteKey, profile } = buildRouteSelection(constraints);
      applyRoute(nextRouteKey, profile, "已根据游玩时长、兴趣偏好、预算与节奏生成专属路线");
    }, 460);
  }, [applyRoute]);

  // 三步问卷（首页「开启旅程」入口）仍复用同一套生成逻辑
  const generateRoute = useCallback((profile) => {
    const { routeKey: nextRouteKey, profile: nextProfile } = buildRouteSelection(profile);
    applyRoute(nextRouteKey, nextProfile, "专属路线已生成，数字人性格和声线也已为你匹配");
  }, [applyRoute]);

  // ── 「推荐路线」板块：四张卡片的「查看路线」──
  // 先用预设的四项约束算出本地路线，再交给智能体改写；智能体不可用时自动沿用本地结果，
  // 因此没有 API Key 的演示环境里按钮同样有响应，只是 Toast 会注明来源。
  const runRoutePlan = useCallback(async ({ card }) => {
    const constraints = {
      duration: card.duration,
      interests: [...card.interests],
      budget: card.budget,
      pace: card.pace
    };
    setPlanningKey(`card:${card.key}`);
    try {
      const { route, source, note } = await planRoute({
        guideKey,
        themeLabel: card.title,
        routeKey: card.routeKey,
        constraints,
        focus: card.focus,
        title: card.title
      });
      setGeneratedRoute(route);
      setRouteKey(card.routeKey);
      setRouteProfile(constraints);
      setLanding("route");
      // 结果直接以弹窗呈现：不展开页面下方面板，也不滚动页面
      setRouteModalOpen(true);
      notify(`${note}：${route.title}`, source === "ai" ? "success" : "info");
    } finally {
      setPlanningKey("");
    }
  }, [guideKey, notify]);

  const openRouteCard = useCallback((card) => {
    runRoutePlan({ card });
  }, [runRoutePlan]);

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
      {/* onLanguageChange 收到的是下拉里选中的具体语种，不再是「来回切」 */}
      <Header view={view} onViewChange={changeView} language={language} onLanguageChange={(key) => setLanguage(normalizeLanguage(key))} />
      <main>
        <section className="view active" id="visitorView">
          {landing === "home" && (
            <>
              {/* 首屏设计稿画布：整图 1:1 静止呈现，透明热区承载交互（坐标为设计稿百分比）。
                  画面刻意不做任何漂移/缩放动画：一旦画面在动，照片与热区就会错开，导航栏会点不准 */}
              <div className="hero-canvas hero-dynamic">
                <div className="hero-photo-wrap">
                  <img className="hero-photo" src={`${import.meta.env.BASE_URL}assets/hero-home.webp?v=clear20261020`} alt="灵境智游首页：灵山胜境，一场心灵的旅程——一念一境，皆是灵山" />
                  <img className="home-guide-avatar" src={guides.lingruo.thumbnail} alt="灵若导游头像" decoding="async" />
                  {/* 透明热区层：与照片同层同步缩放，坐标为设计稿像素百分比 */}
                  <div className="hero-hotspot-layer">
                    <button className="hero-hotspot" style={{ left: "1.5%", top: "2.6%", width: "18.7%", height: "7%" }} aria-label="灵境智游，返回首页" onClick={() => goLanding("home")} />
                    <button className="hero-hotspot" style={{ left: "27.02%", top: "3.4%", width: "4.94%", height: "3.8%" }} aria-label="首页" onClick={() => goLanding("home")} />
                    <button className="hero-hotspot" style={{ left: "32.01%", top: "3.4%", width: "7.14%", height: "3.8%" }} aria-label="景区导览" onClick={() => goLanding("scenic")} />
                    <button className="hero-hotspot" style={{ left: "39.2%", top: "3.4%", width: "6.83%", height: "3.8%" }} aria-label="AI 数字人问答" onClick={() => gotoPanel("assistant")} />
                    <button className="hero-hotspot" style={{ left: "46.08%", top: "3.4%", width: "6.78%", height: "3.8%" }} aria-label="个性路线" onClick={() => goLanding("route")} />
                    <button className="hero-hotspot" style={{ left: "52.9%", top: "3.4%", width: "7.03%", height: "3.8%" }} aria-label="打卡集章" onClick={() => goLanding("stamp")} />
                    <button className="hero-hotspot" style={{ left: "83.33%", top: "3.4%", width: "3.31%", height: "3.8%" }} aria-label="打卡拍照" onClick={() => goLanding("stamp")} />
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

          {landing === "scenic" && scenicView === "pano" && (
            <Suspense fallback={<PanelLoading />}>
              <ScenicPano
                alt="景区全景——灵山胜境长卷"
                markers={scenicPanoMarkers}
                rail={scenicRail}
                railBox={scenicPanoRailBox}
                nav={panoNav}
                onBack={backToMap}
              />
            </Suspense>
          )}
          {/* 景区导览：地图上点任一景点即放大进入该景点场景，场景内「返回全景」缩回大地图 */}
          {landing === "scenic" && scenicView !== "pano" && (
            <div className="scenic-viewport">
              <div className={`scenic-stage${scenicView === "scene" ? " is-pushed" : ""}`}>
                <DesignPage src={`${import.meta.env.BASE_URL}assets/scenic-guide.webp?v=clear20261020`} ratio="1961 / 1109" alt="景区导览——步一景 · 探寻灵山之美" hotspots={scenicSpots} markers={scenicMarkers} chips={scenicCategoryChips} cover={scenicCover} rail={scenicRail} railBox={scenicRailBox} />
              </div>
              {scenicView === "scene" && (
                <Suspense fallback={null}>
                  <ScenicScene
                    spotKey={activeSpotKey}
                    origin={sceneOrigin}
                    closing={sceneClosing}
                    onBack={backToMap}
                    onSelect={selectScene}
                    onDetail={(spot) => openSpotDetail(spot.key)}
                    onAsk={(spot) => askGuide(spot)}
                    onPlan={(spot) => planSpot(spot)}
                    onCheckin={(spot) => checkinSpot(spot)}
                    onPano={showPano}
                  />
                </Suspense>
              )}
            </div>
          )}
          {landing === "route" && (
            <>
              <DesignPage src={`${import.meta.env.BASE_URL}assets/route-plan.webp?v=clear20261020`} ratio="1959 / 1109" alt="个性路线——循心而行，定制你的灵山之旅" hotspots={routeSpots}>
                <img className="route-guide-figure" src={guides.lingruo.image} alt="灵若 · 云山清风" decoding="async" fetchPriority="high" />
                {/* 真实可交互的「定制你的专属路线」面板：就地覆盖设计稿上的静态筛选项 */}
                <RouteConfigurator
                  value={routeConstraints}
                  onChange={setRouteConstraints}
                  onGenerate={generateFromConstraints}
                  planning={planning}
                />
                {/* 真实可交互的「推荐路线」板块：四张路线卡（卡片为 DOM 重绘，主题标签已下线） */}
                <RouteRecommender planningKey={planningKey} onOpenCard={openRouteCard} />
              </DesignPage>
              {/* 真实路线面板：仅在点「查看路线」或「为我推荐路线」后展示在设计页下方 */}
              {activePanel === "route" && (
                <div className="page-panel" id="panelSection">
                  <Suspense fallback={<PanelLoading />}>
                    <RoutePanel
                      route={activeRoute}
                      onEditProfile={() => {
                        window.scrollTo({ top: 0, behavior: "smooth" });
                        notify("可在页面上方重新选择时长、兴趣、预算与节奏", "info");
                      }}
                      notify={notify}
                    />
                  </Suspense>
                </div>
              )}
            </>
          )}
          {landing === "assistant" && (
            <DesignPage src={`${import.meta.env.BASE_URL}assets/assistant-page.webp?v=clear20261020`} ratio="1891 / 1080" alt={`AI数字人·智慧导览——有问题，问${guides[guideKey].name}，让旅程更简单`} hotspots={assistantSpots}>
              {/* 顶部导航由 DOM 重建：底图上画死的深绿导航条已修复为天空，
                  这里按其他页面导航的同一视觉风格（透明融合 + 金色高亮）重建，且菜单真实可点 */}
              <nav className="design-nav" aria-label="站点导航">
                <div className="design-nav-brand">
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d={LOTUS_PATH} /></svg>
                  <div className="design-nav-brand-text">
                    <strong>灵境智游</strong>
                    <span>无锡灵山胜境数字文化旅游平台</span>
                  </div>
                </div>
                <div className="design-nav-menu">
                  <button type="button" onClick={() => goLanding("home")}>首页</button>
                  <button type="button" onClick={() => goLanding("scenic")}>景区导览</button>
                  <button type="button" className="active" onClick={() => goLanding("assistant")}>AI数字人</button>
                  <button type="button" onClick={() => goLanding("route")}>个性路线</button>
                  <button type="button" onClick={() => goLanding("stamp")}>打卡集章</button>
                  <button type="button" onClick={() => notify("更多服务敬请期待", "info")}>更多 <i aria-hidden="true">∨</i></button>
                </div>
                <div className="design-nav-actions">
                  <button type="button" aria-label="打卡拍照" onClick={() => goLanding("stamp")}>
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9.4 4 8 6H4.5A1.5 1.5 0 0 0 3 7.5v11A1.5 1.5 0 0 0 4.5 20h15a1.5 1.5 0 0 0 1.5-1.5v-11A1.5 1.5 0 0 0 19.5 6H16l-1.4-2H9.4Zm2.6 4.4a4.6 4.6 0 1 1 0 9.2 4.6 4.6 0 0 1 0-9.2Zm0 1.8a2.8 2.8 0 1 0 0 5.6 2.8 2.8 0 0 0 0-5.6Z" /></svg>
                  </button>
                  <button type="button" onClick={() => setLanguage((current) => (current === "zh" ? "en" : "zh"))}>
                    {language === "zh" ? "中文" : "English"} <i aria-hidden="true">∨</i>
                  </button>
                  <button type="button" aria-label="个人中心" onClick={() => goLanding("center")}>
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 12.2a4.1 4.1 0 1 0-4.1-4.1 4.1 4.1 0 0 0 4.1 4.1Zm0 2.1c-3.4 0-8.1 1.8-8.1 5.2V22h16.2v-2.5c0-3.4-4.7-5.2-8.1-5.2Z" /></svg>
                  </button>
                </div>
              </nav>
              {/* 使用 PNG 自带透明通道，完整显示衣袖和衣摆。 */}
              <img className="assistant-selected-figure" src={guides[guideKey].image} alt={`数字人导游${guides[guideKey].name}`} />
              <span className="assistant-selected-name">{guides[guideKey].name}</span>
              {/* 真实对话卡片与热门问题列表：按设计稿实测坐标就地叠放，本页即可输入与提问，不再弹浮层 */}
              <div className="assistant-live">
                <div className="assistant-live-chat">
                  <AssistantPanel
                    variant="embed"
                    guideKey={guideKey}
                    onGuideChange={setGuideKey}
                    route={activeRoute}
                    language={language}
                    notify={notify}
                  />
                </div>
                <aside className="hot-questions-card" aria-label="热门问题">
                  <h3>
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d={LOTUS_PATH} /></svg>
                    热门问题
                  </h3>
                  <ul>
                    {hotQuestions.map((question) => (
                      <li key={question}>
                        <button type="button" onClick={() => askAssistant(question)}>
                          <svg className="hot-questions-icon" viewBox="0 0 24 24" aria-hidden="true"><path d={LOTUS_PATH} /></svg>
                          <span>{question}</span>
                          <i aria-hidden="true">›</i>
                        </button>
                      </li>
                    ))}
                  </ul>
                </aside>
              </div>
            </DesignPage>
          )}
          {landing === "center" && (
            <DesignPage src={`${import.meta.env.BASE_URL}assets/profile-center.webp?v=clear20261020`} ratio="1962 / 1109" alt="个人中心——行走灵山 · 收藏美好" hotspots={centerSpots}>
              {/* 底部「最近活动 + 最喜欢的景点」两卡位置合并为「我最喜欢的景点」照片墙，
                  长卷上的每个景点各占一个照片框，悬停/点击只作用于当前框 */}
              <CenterPanoCard spots={scenicPanoMarkers} />
              {/* 左侧人物卡统计条：已打卡景点 / 已解锁装扮 与打卡集章、我的装扮奖励同步，「收藏路线」已下线 */}
              <CenterProfileStats
                missions={missions}
                onGoStamp={() => goLanding("stamp")}
                onGoWardrobe={() => goLanding("wardrobe")}
              />
              {/* 中部「我的装扮奖励」四张服装卡：图片 / 名称 / 状态 / 条件按钮均为真实组件 */}
              <CenterOutfitReward
                guideKey={guideKey}
                missions={missions}
                onGoWardrobe={() => goLanding("wardrobe")}
                onGoStamp={() => goLanding("stamp")}
              />
              {/* 顶部「我的旅行数据」：出行天数已下线，打卡景点 / 解锁装扮 / 累计里程 与各自页面实时同步 */}
              <CenterTravelStats
                missions={missions}
                routeDistance={activeRoute.distance}
                onGoStamp={() => goLanding("stamp")}
                onGoWardrobe={() => goLanding("wardrobe")}
                onGoRoute={() => goLanding("route")}
              />
              {/* 右上「打卡日历」：与系统日期同步的真实日历（月份可翻、日期可点） */}
              <CenterCalendar />
              {/* 中部「已去过的景点」四张照片卡：图片 / 名称 / 打卡状态为真实组件，与打卡集章同步 */}
              <CenterVisitedSpots missions={missions} onGoScenic={() => goLanding("scenic")} onGoStamp={() => goLanding("stamp")} />
            </DesignPage>
          )}
          {landing === "stamp" && (
            <>
              <DesignPage src={`${import.meta.env.BASE_URL}assets/stamp-panel.webp?v=clear20261020`} ratio="1960 / 1109" alt="打卡集章——探寻灵山胜境 · 收集专属奖励" hotspots={stampSpots}>
                {/* 动态状态覆盖层：用真实 missions 覆盖底图里印死的进度文字与地图打卡点 */}
                <StampStatusOverlay missions={missions} onSelectSpot={(spotId) => setPendingSpotId(spotId)} />
                {/* 动态奖励收集区：覆盖图片下方固定的七套服装展示，按真实集章进度解锁 */}
                <StampRewardOverlay missions={missions} guideKey={guideKey} />
              </DesignPage>
              {/* 打卡集章页只保留上方完整设计图；MissionPanel 仅作为上传打卡弹窗的宿主，
                  不再展示面板主体（boardVisible=false），避免设计图下方多出额外区块 */}
              <Suspense fallback={null}>
                <MissionPanel
                  guide={guides[guideKey]}
                  missions={missions}
                  setMissions={setMissions}
                  notify={notify}
                  spotId={pendingSpotId}
                  onSpotConsumed={() => setPendingSpotId(null)}
                  boardVisible={false}
                />
              </Suspense>
            </>
          )}
          {/* 我的衣橱：改用真实实现的 WardrobePage（套装切换 / 解锁校验 / 保存装扮），
              不再只是一张静态底图；顶部公共导航热区仍由 wardrobeSpots 传入，与其它设计页一致 */}
          {landing === "wardrobe" && (
            <WardrobePage guideKey={guideKey} missions={missions} notify={notify} hotspots={wardrobeSpots} />
          )}
        </section>
      </main>

      {profileOpen && <Suspense fallback={null}><ProfileModal open onClose={() => setProfileOpen(false)} onGenerate={generateRoute} initialProfile={routeProfile} /></Suspense>}
      {/* AI 数字人真实对话浮层（点击设计页立绘或底部标题区域触发） */}
      {assistantLive && (
        <div className="assistant-overlay" role="dialog" aria-modal="true" aria-label="灵山数字人云澈对话">
          <button className="assistant-overlay-back" onClick={() => setAssistantLive(false)} aria-label="返回数字人介绍页">← 返回介绍</button>
          <div className="assistant-overlay-card">
            <AssistantPanel guideKey={guideKey} onGuideChange={setGuideKey} route={activeRoute} language={language} notify={notify} />
          </div>
        </div>
      )}
      {loginOpen && <Suspense fallback={null}><LoginModal open onClose={() => setLoginOpen(false)} notify={notify} onLogin={() => { setAdminLogged(true); setLoginOpen(false); setView("admin"); notify("欢迎进入灵山运营中心", "success"); }} /></Suspense>}
      {/* 路线结果弹窗：点「为我推荐路线」/「查看路线」直接弹出，不再下滑到页面下方的面板 */}
      {routeModalOpen && (
        <div
          className="route-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label="专属路线"
          onClick={(event) => { if (event.target === event.currentTarget) setRouteModalOpen(false); }}
        >
          <div className="route-modal">
            <button
              type="button"
              className="route-modal-close"
              onClick={() => setRouteModalOpen(false)}
              aria-label="关闭路线弹窗"
            >
              ×
            </button>
            <Suspense fallback={<PanelLoading />}>
              <RoutePanel
                route={activeRoute}
                onEditProfile={() => {
                  setRouteModalOpen(false);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                  notify("可在页面上方重新选择时长、兴趣、预算与节奏", "info");
                }}
                notify={notify}
              />
            </Suspense>
          </div>
        </div>
      )}
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
      {/* 景点详情弹窗：由右侧侧栏「查看详情」唤起，信息比侧栏更全面 */}
      {spotDetailKey && (
        <Suspense fallback={null}>
          <SpotDetailModal
            spotKey={spotDetailKey}
            onClose={closeSpotDetail}
            onSelect={(key) => { focusSpot(key); setSpotDetailKey(key); }}
            onAsk={(spot) => { closeSpotDetail(); askGuide(spot); }}
            onPlan={(spot) => { closeSpotDetail(); planSpot(spot); }}
            onCheckin={(spot) => { closeSpotDetail(); checkinSpot(spot); }}
          />
        </Suspense>
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
              {/* 打卡弹窗只承载「上传打卡照片」这一件事（boardVisible=false）：
                  MissionPanel 的完整面板高达 8000px，是给打卡集章页整页设计的，
                  塞进弹窗容器会溢出；无对应站点的景点已在 checkinSpot 中拦截提示 */}
              <MissionPanel
                guide={guides[guideKey]}
                missions={missions}
                setMissions={setMissions}
                notify={notify}
                spotId={pendingSpotId}
                onSpotConsumed={() => setPendingSpotId(null)}
                boardVisible={false}
              />
            </Suspense>
          </div>
        </div>
      )}
      <ToastHost toasts={toasts} />
    </>
  );
}
