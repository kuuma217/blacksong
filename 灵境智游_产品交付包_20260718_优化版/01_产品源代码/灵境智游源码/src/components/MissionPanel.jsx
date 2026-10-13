import { useMemo, useRef, useState } from "react";
import { getBackgroundByIndex, checkinBackgrounds } from "../data/checkinBackgrounds.js";
import { synthesizeCheckinPhoto } from "../utils/photoSynthesizer.js";
import CheckinPreviewModal from "./CheckinPreviewModal.jsx";

const missionItems = [
  ["灵山照壁 · 初见灵山", "与「华夏第一壁」合影，开启今天的旅程。"],
  ["九龙灌浴 · 花开见佛", "上传现场照片，AI 自动合成专属打卡照。"],
  ["梵宫 · 穹顶寻光", "找到穹顶中的飞天元素，听完一段艺术讲解。"],
  ["灵山大佛 · 拥抱远方", "抵达大佛平台并完成今日路线。"]
];

const outfitAssetMap = {
  xiaoling: {
    lotus: "/assets/xiaoling-lotus.webp",
    sunset: "/assets/xiaoling-sunset.webp",
    night: "/assets/xiaoling-night.webp"
  },
  lingruo: {
    lotus: "/assets/lingruo-lotus.webp",
    sunset: "/assets/lingruo-sunset.webp",
    night: "/assets/lingruo-night.webp"
  },
  xingyuan: {
    lotus: "/assets/xingyuan-lotus.webp",
    sunset: "/assets/xingyuan-sunset.webp",
    night: "/assets/xingyuan-night.webp"
  },
  dongling: {
    lotus: "/assets/dongling-lotus.webp",
    sunset: "/assets/dongling-sunset.webp",
    night: "/assets/dongling-night.webp"
  },
  wailing: {
    lotus: "/assets/wailing-lotus.webp",
    sunset: "/assets/wailing-sunset.webp",
    night: "/assets/wailing-night.webp"
  }
};

export default function MissionPanel({ guide, missions, setMissions, notify }) {
  const fileRef = useRef(null);
  const [pendingMission, setPendingMission] = useState(null);
  const [outfit, setOutfit] = useState("default");
  const [synthesizing, setSynthesizing] = useState(false);
  const [checkinPreview, setCheckinPreview] = useState({ open: false, imageUrl: "", title: "" });
  const completeCount = missions.filter(Boolean).length;
  const outfitImages = useMemo(() => ({
    default: guide.image,
    ...(outfitAssetMap[guide.key] || {})
  }), [guide.key, guide.image]);
  const outfitImage = outfitImages[outfit] || guide.image;

  const beginCheckin = (index) => {
    setPendingMission(index);
    fileRef.current?.click();
  };

  const finishCheckin = async (event) => {
    const file = event.target.files?.[0];
    if (!file || pendingMission === null) return;

    // 获取当前打卡点的背景配置
    const background = getBackgroundByIndex(pendingMission);
    const title = checkinBackgrounds[pendingMission]?.title || "灵山打卡";

    setSynthesizing(true);
    notify("AI 正在合成你的专属打卡照片…", "info");

    try {
      // 合成打卡照片
      const synthesizedImage = await synthesizeCheckinPhoto({
        userImage: file,
        background,
        width: 800,
        height: 1000
      });

      // 更新打卡状态
      setMissions((current) =>
        current.map((value, index) => index === pendingMission ? true : value)
      );

      // 显示合成结果
      setCheckinPreview({
        open: true,
        imageUrl: synthesizedImage,
        title: title
      });

      notify("打卡成功！专属照片已生成，可保存到相册。", "success");
    } catch (error) {
      console.error("照片合成失败:", error);
      // 合成失败时仍然标记打卡完成
      setMissions((current) =>
        current.map((value, index) => index === pendingMission ? true : value)
      );
      notify("照片合成出现问题，但打卡已完成。", "warning");
    } finally {
      setSynthesizing(false);
      setPendingMission(null);
      event.target.value = "";
    }
  };

  const chooseOutfit = (key, required) => {
    if (completeCount < required) {
      notify(`还需完成 ${required - completeCount} 个打卡点才能解锁`, "warning");
      return;
    }
    setOutfit(key);
    notify("装扮已切换，数字人会在下一次对话中同步展示", "success");
  };

  return (
    <section className="visitor-panel active">
      <div className="mission-hero">
        <div>
          <p className="eyebrow">边走边玩 · 解锁灵山限定装扮</p>
          <h2>今日探索进度 <em>{completeCount} / 4</em></h2>
          <div className="progress-track"><span style={{ width: `${completeCount * 25}%` }} /></div>
        </div>
        <div className="reward-preview">
          <span>下一件奖励</span><strong>{completeCount < 2 ? "莲华云肩" : completeCount < 4 ? "佛光锦衣" : "全套奖励已解锁"}</strong>
          <small>{completeCount < 4 ? `再完成 ${completeCount < 2 ? 2 - completeCount : 4 - completeCount} 个打卡点` : "感谢完成灵山探索"}</small>
        </div>
      </div>

      <div className="mission-layout">
        <div className="mission-list">
          {missionItems.map(([title, description], index) => {
            const complete = missions[index];
            const bg = checkinBackgrounds[index];
            return (
              <article className={`mission-card ${complete ? "complete" : ""}`} key={title}>
                <span className="mission-index">{complete ? "✓" : String(index + 1).padStart(2, "0")}</span>
                <div>
                  <small>{complete ? "已完成" : index === 3 ? "终点任务" : "等待探索"}</small>
                  <strong>{title}</strong>
                  <p>{description}</p>
                  {bg && (
                    <div className="mission-bg-preview" style={{ background: bg.gradient }}>
                      <span className="mission-bg-icon">{bg.icon}</span>
                      <span className="mission-bg-text">{bg.overlayText}</span>
                    </div>
                  )}
                </div>
                <button disabled={complete || synthesizing} onClick={() => beginCheckin(index)}>
                  {synthesizing && pendingMission === index ? "合成中…" : complete ? "已打卡" : "拍照打卡"}
                </button>
              </article>
            );
          })}
        </div>

        <aside className="wardrobe-card">
          <div className="wardrobe-head"><div><span className="tiny-label">我的衣橱</span><h3>{guide.name}的装扮</h3></div><span>{completeCount * 25}%</span></div>
          <div className={`wardrobe-avatar outfit-${outfit}`}><img key={outfitImage} src={outfitImage} alt={`${guide.name}穿着${outfit === "default" ? "青玉常服" : outfit === "lotus" ? "莲华云肩" : outfit === "sunset" ? "佛光锦衣" : "夜游华服"}`} loading="lazy" decoding="async" /><span className="outfit-glow" /></div>
          <div className="outfit-grid">
            <button className={`outfit-item ${outfit === "default" ? "active" : ""}`} onClick={() => chooseOutfit("default", 0)}><i className="outfit-swatch jade" /><span>青玉常服<small>{outfit === "default" ? "已装备" : "点击装备"}</small></span></button>
            <button className={`outfit-item ${completeCount < 2 ? "locked" : ""} ${outfit === "lotus" ? "active" : ""}`} onClick={() => chooseOutfit("lotus", 2)}><i className="outfit-swatch lotus" /><span>莲华云肩<small>{completeCount < 2 ? "完成2站解锁" : "已解锁"}</small></span></button>
            <button className={`outfit-item ${completeCount < 4 ? "locked" : ""} ${outfit === "sunset" ? "active" : ""}`} onClick={() => chooseOutfit("sunset", 4)}><i className="outfit-swatch sunset" /><span>佛光锦衣<small>{completeCount < 4 ? "完成全程解锁" : "已解锁"}</small></span></button>
            <button className={`outfit-item ${completeCount < 4 ? "locked" : ""} ${outfit === "night" ? "active" : ""}`} onClick={() => chooseOutfit("night", 4)}><i className="outfit-swatch night" /><span>夜游华服<small>{completeCount < 4 ? "完成全程解锁" : "隐藏成就已解锁"}</small></span></button>
          </div>
        </aside>
      </div>

      <input ref={fileRef} type="file" accept="image/*" onChange={finishCheckin} hidden />

      <CheckinPreviewModal
        open={checkinPreview.open}
        imageUrl={checkinPreview.imageUrl}
        title={checkinPreview.title}
        onClose={() => setCheckinPreview({ open: false, imageUrl: "", title: "" })}
      />
    </section>
  );
}
