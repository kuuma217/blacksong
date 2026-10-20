import { useEffect, useMemo, useRef, useState } from "react";
import { getBackgroundByIndex, checkinBackgrounds } from "../data/checkinBackgrounds.js";
import { synthesizeCheckinPhoto } from "../utils/photoSynthesizer.js";
import { validateCheckinFile } from "../utils/checkinVerifier.js";
import { recordCheckin } from "../utils/userProgress.js";
import CheckinPreviewModal from "./CheckinPreviewModal.jsx";
import MissionUploadModal from "./MissionUploadModal.jsx";
import MissionMapScenery from "./MissionMapScenery.jsx";
import MissionSpotIcon from "./MissionSpotIcon.jsx";
import "./mission-panel.css";

const missionItems = [
  ["灵山照壁 · 初见灵山", "与「华夏第一壁」合影，开启今天的旅程。"],
  ["九龙灌浴 · 花开见佛", "上传现场照片，AI 自动合成专属打卡照。"],
  ["梵宫 · 穹顶寻光", "找到穹顶中的飞天元素，听完一段艺术讲解。"],
  ["灵山大佛 · 拥抱远方", "抵达大佛平台并完成今日路线。"]
];

const outfitAssetMap = {
  xiaoling: {
    lotus: `${import.meta.env.BASE_URL}assets/xiaoling-lotus.webp`,
    sunset: `${import.meta.env.BASE_URL}assets/xiaoling-sunset.webp`,
    night: `${import.meta.env.BASE_URL}assets/xiaoling-night.webp`
  },
  lingruo: {
    lotus: `${import.meta.env.BASE_URL}assets/lingruo-lotus.webp`,
    sunset: `${import.meta.env.BASE_URL}assets/lingruo-sunset.webp`,
    night: `${import.meta.env.BASE_URL}assets/lingruo-night.webp`
  },
  xingyuan: {
    lotus: `${import.meta.env.BASE_URL}assets/xingyuan-lotus.webp`,
    sunset: `${import.meta.env.BASE_URL}assets/xingyuan-sunset.webp`,
    night: `${import.meta.env.BASE_URL}assets/xingyuan-night.webp`
  },
  dongling: {
    lotus: `${import.meta.env.BASE_URL}assets/dongling-lotus.webp`,
    sunset: `${import.meta.env.BASE_URL}assets/dongling-sunset.webp`,
    night: `${import.meta.env.BASE_URL}assets/dongling-night.webp`
  },
  wailing: {
    lotus: `${import.meta.env.BASE_URL}assets/wailing-lotus.webp`,
    sunset: `${import.meta.env.BASE_URL}assets/wailing-sunset.webp`,
    night: `${import.meta.env.BASE_URL}assets/wailing-night.webp`
  }
};

// 奖励收集：四件数字人装扮，解锁条件全部按真实 missions 状态计算
const rewardCatalog = [
  { key: "default", label: "青玉常服", subtitle: "灵山清风 · 数智文旅装扮", required: 0 },
  { key: "lotus",   label: "莲华云肩", subtitle: "霓裳华彩 · 数智文旅装扮", required: 2 },
  { key: "sunset",  label: "佛光锦衣", subtitle: "九龙云韵 · 数智文旅装扮", required: 4 },
  { key: "night",   label: "夜游华服", subtitle: "莲心悟语 · 隐藏成就装扮", required: 4 }
];

// 地图标记坐标（百分比定位），对应矢量插画中的景点位置
const mapMarkers = [
  { index: 3, top: "30%", left: "76%" },
  { index: 1, top: "62%", left: "51%" },
  { index: 2, top: "48%", left: "19%" },
  { index: 0, top: "76%", left: "9%" }
];

// 隐藏景点：不绑定 missions（数组长度冻结为 4），仅作视觉预告
const hiddenMarker = { name: "五印坛城", icon: "wuting", top: "70%", left: "88%" };

// 演示版声明：当前未接入景点 AI 识别，界面需如实告知用户
const DEMO_NOTICE = "当前为本地演示打卡，尚未接入景点 AI 识别";

const emptyUpload = {
  open: false,
  index: null,
  status: "idle",
  message: "",
  hint: "",
  notice: DEMO_NOTICE,
  previewUrl: "",
  file: null
};

export default function MissionPanel({ guide, missions, setMissions, notify, spotId = null, onSpotConsumed = null, boardVisible = true }) {
  const rewardsRef = useRef(null);
  const [outfit, setOutfit] = useState("default");
  const [synthesizing, setSynthesizing] = useState(false);
  const [checkinPreview, setCheckinPreview] = useState({ open: false, imageUrl: "", title: "" });
  const [upload, setUpload] = useState(emptyUpload);
  // 由设计图热区唤起时：只渲染弹窗，不渲染面板主体，避免撑高页面/改变当前视口位置
  const [hotspotOnly, setHotspotOnly] = useState(false);
  // 弹窗打开前的滚动位置，关闭后用于还原
  const scrollLockRef = useRef(0);

  const completeCount = missions.filter(Boolean).length;
  const totalMissions = missions.length;
  const ringRatio = totalMissions ? completeCount / totalMissions : 0;
  const ringCircumference = 2 * Math.PI * 36;

  const outfitImages = useMemo(() => ({
    default: guide.image,
    ...(outfitAssetMap[guide.key] || {})
  }), [guide.key, guide.image]);

  const outfitImage = outfitImages[outfit] || guide.image;

  /**
   * 释放当前预览图的 ObjectURL，避免内存泄漏
   */
  const releasePreview = (state) => {
    if (state.previewUrl) URL.revokeObjectURL(state.previewUrl);
  };

  /**
   * 冻结页面滚动：弹窗打开时保持背景（设计图）位置绝对不动。
   * 原因：切换 activePanel 会卸载上一个面板使文档变短，浏览器会夹紧 scrollTop 导致画面上滑。
   * @returns {void}
   */
  const lockBodyScroll = () => {
    const y = window.scrollY;
    scrollLockRef.current = y;
    const body = document.body;
    body.style.position = "fixed";
    body.style.top = `-${y}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    body.style.overflowY = "scroll"; // 保留滚动条槽位，避免横向跳动
  };

  /**
   * 解除冻结并还原到打开弹窗前的滚动位置
   * @returns {void}
   */
  const unlockBodyScroll = () => {
    const body = document.body;
    body.style.position = "";
    body.style.top = "";
    body.style.left = "";
    body.style.right = "";
    body.style.width = "";
    body.style.overflowY = "";
    window.scrollTo(0, scrollLockRef.current);
  };

  /**
   * 点击地图景点：打开上传弹窗
   * @param {number} index - 打卡点下标
   */
  const openUpload = (index) => {
    if (missions[index]) {
      notify("该景点已经打过卡啦，可以去探索其他站点", "info");
      return;
    }
    releasePreview(upload);
    setUpload({ ...emptyUpload, open: true, index });
  };

  /**
   * 关闭上传弹窗并清理预览资源
   */
  const closeUpload = () => {
    setUpload((current) => {
      releasePreview(current);
      return emptyUpload;
    });
    // 热区模式：解除滚动冻结并还原滚动位置。
    // 保持 hotspotOnly——打卡集章页只保留设计图一屏，不在下方渲染面板主体
    if (hotspotOnly) unlockBodyScroll();
  };

  // 设计图热区指定的待打卡景点：spotId 变化时自动打开对应景点的上传弹窗
  // 说明：此处不触发任何页面滚动，弹窗以 fixed 定位覆盖在当前视口上。
  // （spotId / onSpotConsumed 为可选 props，未传入时本 effect 不产生任何行为）
  useEffect(() => {
    if (!spotId) return;
    onSpotConsumed?.();                    // 先置空，保证同一景点可再次唤起
    const index = checkinBackgrounds.findIndex((bg) => bg.id === spotId);
    if (index < 0) return;
    if (missions[index]) {                 // 已打卡：仅提示，不进入弹窗模式
      notify("该景点已经打过卡啦，可以去探索其他站点", "info");
      return;
    }
    setHotspotOnly(true);
    lockBodyScroll(); // 冻结背景，弹窗弹出时画面不滑动
    releasePreview(upload);
    setUpload({ ...emptyUpload, open: true, index });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spotId]);

  /**
   * 用户在弹窗中选择了照片（点击选择或拖拽）
   * @param {{target:{files:FileList}}} event - 类 input change 事件
   */
  const selectFile = async (event) => {
    const file = event.target.files?.[0];
    // 清空 input 值，允许用户重复选择同一个文件
    if (event.target && "value" in event.target) event.target.value = "";
    if (!file || upload.index === null) return;

    setUpload((current) => ({ ...current, status: "verifying", message: "", hint: "" }));

    // 仅校验文件是否可用（类型 / 大小 / 能否解码），不判断景点真实性
    const result = await validateCheckinFile({
      file,
      background: checkinBackgrounds[upload.index]
    });

    if (!result.ok) {
      setUpload((current) => {
        releasePreview(current);
        return {
          ...current,
          file: null,
          previewUrl: "",
          status: "rejected",
          message: result.reason,
          hint: result.hint,
          notice: result.notice
        };
      });
      notify(result.reason, "warning");
      return;
    }

    setUpload((current) => {
      releasePreview(current);
      return {
        ...current,
        file,
        previewUrl: URL.createObjectURL(file),
        status: "ready",
        message: "",
        hint: "",
        notice: result.notice
      };
    });
  };

  /**
   * 标记某景点完成打卡
   * missions 仍由 App.jsx 统一保存（唯一数据源，格式不变）；
   * 此处额外写入一次真实打卡时间，供个人中心将来的「打卡记录」读取。
   * @param {number} index - 打卡点下标
   */
  const completeMission = (index) => {
    if (missions[index]) return; // 已打卡：不重复计入进度，也不覆盖首次打卡时间
    setMissions((current) => current.map((value, i) => (i === index ? true : value)));
    recordCheckin(checkinBackgrounds[index]?.id);
  };

  /**
   * 合成打卡照片（校验通过后调用）
   * @param {File} file - 用户上传的照片
   * @param {number} index - 打卡点下标
   */
  const runSynthesis = async (file, index) => {
    const background = getBackgroundByIndex(index);
    const title = checkinBackgrounds[index]?.title || "灵山打卡";

    setSynthesizing(true);
    setUpload((current) => ({ ...current, status: "synthesizing" }));
    notify("AI 正在合成你的专属打卡照片…", "info");

    try {
      const synthesizedImage = await synthesizeCheckinPhoto({
        userImage: file,
        background,
        width: 800,
        height: 1000
      });

      completeMission(index);

      setCheckinPreview({ open: true, imageUrl: synthesizedImage, title });
      notify("打卡成功！专属照片已生成，可保存到相册。", "success");
      closeUpload();
    } catch (error) {
      console.error("照片合成失败:", error);
      // 合成失败时仍然标记打卡完成
      completeMission(index);
      notify("照片合成出现问题，但打卡已完成。", "warning");
      closeUpload();
    } finally {
      setSynthesizing(false);
    }
  };

  /**
   * 提交上传：先校验照片是否属于该景点，通过后再合成
   */
  const submitUpload = async () => {
    const { file, index } = upload;
    if (!file || index === null) return;

    // 防重复打卡：提交前再次确认该景点尚未完成，避免进度重复增加
    if (missions[index]) {
      notify("该景点已经打过卡了，不会重复计入进度", "info");
      closeUpload();
      return;
    }

    setUpload((current) => ({ ...current, status: "verifying", message: "", hint: "" }));

    const result = await validateCheckinFile({
      file,
      background: checkinBackgrounds[index]
    });

    if (!result.ok) {
      setUpload((current) => ({
        ...current,
        status: "rejected",
        message: result.reason,
        hint: result.hint
      }));
      notify(result.reason, "warning");
      return;
    }

    // 注意：此处仅表示"文件有效可读"，不代表照片经过景点 AI 识别
    await runSynthesis(file, index);
  };

  const chooseOutfit = (key, required) => {
    if (completeCount < required) {
      const gap = required - completeCount;
      notify(gap === 0 ? "该装扮暂未解锁" : `还需完成 ${gap} 个打卡点才能解锁`, "warning");
      return;
    }
    setOutfit(key);
    notify("装扮已切换，数字人会在下一次对话中同步展示", "success");
  };

  const rewardState = (required) => {
    if (completeCount >= required) return { cls: "unlocked", text: "已解锁" };
    if (required - completeCount === 1) return { cls: "ongoing", text: "进行中" };
    return { cls: "locked", text: "未解锁" };
  };

  /** 站点状态：仅「已打卡 / 未打卡」两种，无进行中、无前置解锁条件 */
  const stationState = (index) => {
    if (missions[index]) return { cls: "done", text: "已打卡" };
    return { cls: "todo", text: "未打卡" };
  };

  const scrollToRewards = () => {
    rewardsRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const shortName = (title) => title.split(" · ")[0];

  // 仅作为弹窗宿主的两种情形（均不渲染面板主体，避免页面下方多出额外区块）：
  // 1. hotspotOnly —— 由设计图热区唤起，保持用户在设计图上的视口
  // 2. !boardVisible —— 页面只需要上传打卡弹窗，不需要展示完整面板
  if (hotspotOnly || !boardVisible) {
    return (
      <>
        <MissionUploadModal
          open={upload.open}
          spot={upload.index === null ? null : checkinBackgrounds[upload.index]}
          status={upload.status}
          message={upload.message}
          hint={upload.hint}
          notice={upload.notice}
          previewUrl={upload.previewUrl}
          onClose={closeUpload}
          onSelectFile={selectFile}
          onSubmit={submitUpload}
        />
        <CheckinPreviewModal
          open={checkinPreview.open}
          imageUrl={checkinPreview.imageUrl}
          title={checkinPreview.title}
          onClose={() => setCheckinPreview({ open: false, imageUrl: "", title: "" })}
        />
      </>
    );
  }

  return (
    <section className="visitor-panel active mission-board">
      {/* 1. 地图主视觉区（矢量高清插画背景） */}
      <div className="mp-map-stage">
        <MissionMapScenery />
        <div className="mp-map-haze" aria-hidden="true" />

        {mapMarkers.map(({ index, top, left }) => {
          const bg = checkinBackgrounds[index];
          const state = stationState(index);
          return (
            <button
              key={bg.id}
              className={`mp-marker ${state.cls}`}
              style={{ top, left }}
              onClick={() => openUpload(index)}
              disabled={Boolean(missions[index]) || synthesizing}
              aria-label={`${shortName(bg.title)} · ${state.text}`}
            >
              <span className="mp-marker-icon" aria-hidden="true">
                <MissionSpotIcon spotId={bg.id} size={24} title={shortName(bg.title)} />
              </span>
              <span className="mp-marker-card">
                <strong>{shortName(bg.title)}</strong>
                <em>{state.cls === "done" ? "✓ 已打卡" : state.text}</em>
              </span>
            </button>
          );
        })}

        {/* 隐藏景点预告：不绑定 missions，仅提示 */}
        <button
          className="mp-marker locked"
          style={{ top: hiddenMarker.top, left: hiddenMarker.left }}
          onClick={() => notify("完成全程打卡后解锁隐藏景点", "info")}
          aria-label={`${hiddenMarker.name} · 未解锁`}
        >
          <span className="mp-marker-icon" aria-hidden="true">
            <MissionSpotIcon spotId="fangong" size={24} title={hiddenMarker.name} />
          </span>
          <span className="mp-marker-card">
            <strong>{hiddenMarker.name}</strong>
            <em>未解锁</em>
          </span>
        </button>

        <span className="mp-map-vertical" aria-hidden="true">灵山胜境</span>
        <span className="mp-map-compass" aria-hidden="true">✦</span>

        {/* 集章进度卡 */}
        <aside className="mp-progress-card" aria-label="我的集章进度">
          <div className="mp-progress-head">
            <span className="lotus" aria-hidden="true">✦</span>我的集章进度
          </div>
          <div className="mp-progress-body">
            <div className="mp-ring-wrap">
              <svg viewBox="0 0 86 86" role="img" aria-label={`集章进度 ${completeCount} / ${totalMissions}`}>
                <defs>
                  <linearGradient id="mpRingGold" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#d8b36f" />
                    <stop offset="100%" stopColor="#bd9657" />
                  </linearGradient>
                </defs>
                <circle className="ring-track" cx="43" cy="43" r="36" />
                <circle
                  className="ring-fill"
                  cx="43" cy="43" r="36"
                  strokeDasharray={`${ringRatio * ringCircumference} ${ringCircumference}`}
                />
              </svg>
              <div className="mp-ring-center">
                <div>
                  <strong>{completeCount}/{totalMissions}</strong>
                  <small>已完成</small>
                </div>
              </div>
            </div>

            <ul className="mp-station-list">
              {checkinBackgrounds.map((bg, index) => {
                const state = stationState(index);
                return (
                  <li key={bg.id} className={state.cls}>
                    <i aria-hidden="true">
                      {missions[index] ? "✓" : <MissionSpotIcon spotId={bg.id} size={13} />}
                    </i>
                    <span>{shortName(bg.title)}</span>
                    <em>{state.text}</em>
                  </li>
                );
              })}
            </ul>
          </div>

          <button className="mp-explore-btn" onClick={scrollToRewards}>
            探索更多景点，解锁更多奖励 <span aria-hidden="true">→</span>
          </button>
        </aside>

        {synthesizing && !upload.open && <div className="mp-synthesis-veil">正在合成打卡照片…</div>}
      </div>

      {/* 2. 奖励收集 + 解锁横幅 */}
      <section className="mp-bottom">
        <article className="mp-rewards" ref={rewardsRef} aria-label="奖励收集">
          <header className="mp-rewards-head">
            <h3><span className="lotus" aria-hidden="true">✦</span>奖励收集</h3>
            <small>完成景点打卡，依据进度解锁与专属称号</small>
          </header>

          <div className="mp-reward-grid">
            {rewardCatalog.map((item) => {
              const state = rewardState(item.required);
              const locked = state.cls === "locked";
              const active = outfit === item.key;
              const figure = outfitImages[item.key] || guide.image;
              return (
                <button
                  key={item.key}
                  className={`mp-reward-card ${locked ? "locked" : ""} ${active ? "active" : ""}`}
                  onClick={() => chooseOutfit(item.key, item.required)}
                  aria-pressed={active}
                >
                  <span className="mp-reward-figure">
                    <img src={figure} alt={`${guide.name}${item.label}立绘`} loading="lazy" decoding="async" />
                    {!locked && <span className={`mp-reward-state ${state.cls === "ongoing" ? "ongoing" : ""}`}>{state.text}</span>}
                    {locked && (
                      <span className="mp-reward-lock" aria-hidden="true"><i>🔒</i></span>
                    )}
                  </span>
                  <span className="mp-reward-info">
                    <strong>{item.label}</strong>
                    <small>
                      {locked
                        ? `完成 ${item.required} / ${totalMissions} 站解锁`
                        : active ? "当前已装备 · 点击查看效果" : "已解锁 · 点击装备"}
                    </small>
                  </span>
                </button>
              );
            })}
          </div>
        </article>

        <aside className="mp-unlock-banner" aria-label="装扮解锁提示">
          <div className="mp-unlock-copy">
            <h3>打卡成功，<br />解锁专属装扮</h3>
            <p>完成指定景点打卡，即可领取限定 3D 服饰，为你的数字人换上新装。</p>
            <button onClick={scrollToRewards}>查看装扮 →</button>
          </div>
          <img
            className="mp-unlock-figure"
            src={guide.image}
            alt={`${guide.name}数字人立绘`}
            loading="lazy"
            decoding="async"
          />
        </aside>
      </section>

      <MissionUploadModal
        open={upload.open}
        spot={upload.index === null ? null : checkinBackgrounds[upload.index]}
        status={upload.status}
        message={upload.message}
        hint={upload.hint}
        notice={upload.notice}
        previewUrl={upload.previewUrl}
        onClose={closeUpload}
        onSelectFile={selectFile}
        onSubmit={submitUpload}
      />

      <CheckinPreviewModal
        open={checkinPreview.open}
        imageUrl={checkinPreview.imageUrl}
        title={checkinPreview.title}
        onClose={() => setCheckinPreview({ open: false, imageUrl: "", title: "" })}
      />
    </section>
  );
}
