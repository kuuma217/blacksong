import { useCallback, useMemo, useState } from "react";
import "./wardrobe.css";
import { getWardrobeOutfits } from "../data/wardrobeOutfits.js";
import { UNLOCK_TABLE, resolveUnlockedTotal } from "../data/rewardOutfits.js";
import { DEFAULT_OUTFIT_KEY, readSavedOutfitKey, writeSavedOutfitKey } from "../utils/userProgress.js";

/**
 * 已保存装扮的读写统一走 src/utils/userProgress.js
 * （存储键仍是 lingjing-wardrobe-outfit，与打卡进度 lingjing-missions 相互独立）；
 * 「已选中」与「已保存」是两个独立状态：点击卡片只改选中，点保存才写入。
 */

/** 详情栏「套装特色」三条前面的金色图标（莲纹 / 花钿 / 星芒），与设计图一致 */
const FEATURE_MARKS = ["❋", "✿", "✦"];

/** 某套服装需要累计打卡多少个景点才解锁（用于未解锁提示文案） */
const requiredCheckins = (index) => {
  const step = UNLOCK_TABLE.findIndex((total) => total > index);
  return step < 0 ? UNLOCK_TABLE.length - 1 : step;
};

const LockIcon = () => (
  <svg viewBox="0 0 10 12" aria-hidden="true" fill="currentColor">
    <path d="M5 0a3 3 0 0 0-3 3v1h-.5A1.5 1.5 0 0 0 0 5.5v5A1.5 1.5 0 0 0 1.5 12h7A1.5 1.5 0 0 0 10 10.5v-5A1.5 1.5 0 0 0 8.5 4H8V3a3 3 0 0 0-3-3Zm0 1.2A1.8 1.8 0 0 1 6.8 3v1H3.2V3A1.8 1.8 0 0 1 5 1.2Z" />
  </svg>
);

/**
 * 我的衣橱 · 整套装扮选择
 *
 * 页面结构（严格单屏，不产生纵向长页）：
 *   顶部：设计图原导航条（与其它设计页一致，热区由 App.jsx 传入）
 *   左侧：标题「我的衣橱」+ 中央人物透明立绘（随选中套装切换）
 *   右侧：米白鎏金套装面板，七张套装卡片（4 + 3）+ 套装详情栏
 *
 * 解锁沿用 missions 与 resolveUnlockedTotal：
 *   0 个 → 1 套 / 1 个 → 2 套 / 2 个 → 4 套 / 3 个 → 6 套 / 4 个 → 7 套
 *
 * @param {Object} props
 * @param {boolean[]} props.missions - 真实打卡状态（App.jsx 唯一数据源）
 * @param {(msg:string, type?:string)=>void} [props.notify] - 全局轻提示
 * @param {{label:string,box:number[],onClick:Function}[]} [props.hotspots] - 顶部导航热区
 */
export default function WardrobePage({ missions, guideKey, notify, hotspots = [] }) {
  const outfits = useMemo(() => getWardrobeOutfits(guideKey), [guideKey]);
  const completedCount = missions.filter(Boolean).length;
  const unlockedTotal = resolveUnlockedTotal(completedCount);

  const [savedKey, setSavedKey] = useState(readSavedOutfitKey);
  const [selectedKey, setSelectedKey] = useState(() => {
    const saved = readSavedOutfitKey();
    const index = outfits.findIndex((outfit) => outfit.key === saved);
    return index >= 0 && index < resolveUnlockedTotal(completedCount) ? saved : DEFAULT_OUTFIT_KEY;
  });

  /** 真正「当前使用」的套装：已保存且仍处于解锁范围内，否则回落到第一套 */
  const activeIndex = useMemo(() => {
    const index = outfits.findIndex((outfit) => outfit.key === savedKey);
    return index >= 0 && index < unlockedTotal ? index : 0;
  }, [savedKey, unlockedTotal, outfits]);

  const selectedIndex = useMemo(() => {
    const index = outfits.findIndex((outfit) => outfit.key === selectedKey);
    return index >= 0 && index < unlockedTotal ? index : 0;
  }, [selectedKey, unlockedTotal, outfits]);

  const selected = outfits[selectedIndex];

  const handleSelect = useCallback(
    (outfit, index, unlocked) => {
      if (!unlocked) {
        notify?.(`「${outfit.label}」尚未解锁：累计完成 ${requiredCheckins(index)} 个景点打卡后可用`, "info");
        return;
      }
      setSelectedKey(outfit.key);
    },
    [notify]
  );

  const handleSave = useCallback(() => {
    const outfit = outfits[selectedIndex];
    // 不允许绕过打卡解锁条件：只有已解锁范围内的套装才能写入保存
    if (selectedIndex >= unlockedTotal) {
      notify?.(`「${outfit.label}」尚未解锁，无法保存为当前装扮`, "info");
      return;
    }
    if (!writeSavedOutfitKey(outfit.key)) {
      notify?.("本机未能保存装扮，请检查浏览器存储权限", "error");
      return;
    }
    setSavedKey(outfit.key);
    notify?.(`装扮已保存：${outfit.label}`, "success");
  }, [notify, selectedIndex, unlockedTotal, outfits]);

  return (
    <section className="wb-page" aria-label="我的衣橱">
      {/* 顶部原导航条：保持与其它设计页完全一致的公共导航视觉 */}
      <img className="wb-nav-art" src="/assets/wardrobe-panel.webp?v=clear20261020" alt="" aria-hidden="true" />
      {hotspots.map((spot) => (
        <button
          key={spot.label}
          className="hero-hotspot wb-nav-hotspot"
          style={{
            left: `${spot.box[0]}%`,
            top: `${spot.box[1]}%`,
            width: `${spot.box[2]}%`,
            height: `${spot.box[3]}%`,
          }}
          aria-label={spot.label}
          onClick={spot.onClick}
        />
      ))}

      {/* 山水氛围底：旧设计图整体虚化为背景氛围，不再出现旧卡片/旧分项菜单 */}
      <div className="wb-bg" aria-hidden="true" />
      <div className="wb-veil" aria-hidden="true" />

      <div className="wb-left">
        <header className="wb-title">
          <span className="wb-title-mark" aria-hidden="true">❁</span>
          <h1>我的衣橱</h1>
          <p>收集灵山风华，装扮独一无二的你</p>
        </header>

        <div className="wb-platform" aria-hidden="true" />
        <img
          key={selected.image}
          className="wb-figure"
          src={selected.image}
          alt={`${selected.guideName} · ${selected.label}套装人物立绘`}
          decoding="async"
        />
      </div>

      <aside className="wb-panel" aria-label="整套装扮选择">
        <header className="wb-panel-head">
          <h2>
            <span className="wb-panel-mark" aria-hidden="true">❁</span>
            整套装扮选择
          </h2>
          <p>选择套装主题装扮，人物形象将同步切换</p>
        </header>

        <div className="wb-panel-body">
          <div className="wb-cards-wrap">
            <ul className="wb-cards">
              {outfits.map((outfit, index) => {
                const unlocked = index < unlockedTotal;
                const isActive = index === activeIndex;
                const isSelected = index === selectedIndex;
                const stateText = isActive ? "当前使用" : unlocked ? "已解锁" : "未解锁";
                return (
                  <li key={outfit.key}>
                    <button
                      type="button"
                      className={`wb-card ${unlocked ? "unlocked" : "locked"} ${isSelected ? "selected" : ""}`}
                      onClick={() => handleSelect(outfit, index, unlocked)}
                      aria-pressed={isSelected}
                      aria-label={`${outfit.label} · ${stateText}`}
                      title={`${outfit.label} · ${stateText}`}
                    >
                      <span className="wb-thumb">
                        <img src={outfit.card} alt={`${outfit.guideName} · ${outfit.label}`} loading="lazy" decoding="async" />
                        {!unlocked && (
                          <span className="wb-lock" aria-hidden="true">
                            <LockIcon />
                          </span>
                        )}
                      </span>
                      <span className="wb-card-name">{outfit.label}</span>
                      <span className={`wb-badge ${isActive ? "current" : unlocked ? "open" : "locked"}`}>
                        {stateText}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
            <p className="wb-hint">
              已解锁 {unlockedTotal} / {outfits.length} 套 · 点击任意套装，中央人物与右侧介绍同步更新
            </p>
          </div>

          <div className="wb-detail">
            <div className="wb-detail-preview">
              <img key={selected.card} src={selected.card} alt={`${selected.guideName} · ${selected.label}套装预览`} loading="lazy" decoding="async" />
            </div>

            <h3>{selected.label}</h3>
            <p className="wb-desc">{selected.intro}</p>
            <ul className="wb-features">
              {selected.features.map((feature, index) => (
                <li key={feature}>
                  <span className="wb-feat-icon" aria-hidden="true">
                    {FEATURE_MARKS[index] || "✦"}
                  </span>
                  {feature}
                </li>
              ))}
            </ul>

            <button type="button" className="wb-save" onClick={handleSave}>
              保存装扮
            </button>
          </div>
        </div>
      </aside>
    </section>
  );
}
