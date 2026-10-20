import { useMemo } from "react";
import { checkinBackgrounds } from "../data/checkinBackgrounds.js";
import { readCheckinRecords } from "../utils/userProgress.js";

// 个人中心 · 已去过的景点：底图印死的四张照片卡替换为真实组件
// 坐标由 profile-center.webp 逐像素测量（页面百分比）：
//   照片行 y 57.3~66.8；四列 x 22.7 / 28.9 / 35.2 / 41.5 起，宽 5.5~5.8，列距 ~0.7
//   名称行 y≈68.3、状态标签 y≈70.4；容器取 x 22.5~47.5 / y 56.9~71.2（同色米底遮片）
// 状态与打卡集章同步：以打卡集章页同一份 missions 进度（唯一数据源）为准，
// 打卡集章的四个站点是 五印坛城 / 九龙灌浴 / 梵宫 / 灵山大佛，四张卡与之逐一对应（keys 同名），
// missions 缺失时才回落到本机打卡时间记录；四张卡点击统一跳转打卡集章页面。
const BOX = [22.5, 56.9, 25.0, 14.3];

const VISITED_SPOTS = [
  { key: "dafou", name: "灵山大佛", image: "/assets/visited-dafou.jpg" },
  { key: "fangong", name: "梵宫", image: "/assets/visited-fangong.jpg" },
  { key: "jiulong", name: "九龙灌浴", image: "/assets/visited-jiulong.jpg" },
  { key: "wuyin", name: "五印坛城", image: "/assets/visited-wuyin.jpg" }
];

/** 站点 id → missions 下标（顺序与 checkinBackgrounds 一致） */
const MISSION_INDEX = Object.fromEntries(checkinBackgrounds.map((spot, index) => [spot.id, index]));

export default function CenterVisitedSpots({ missions, onGoScenic, onGoStamp }) {
  const records = useMemo(() => readCheckinRecords(), []);

  return (
    <section className="design-rail cvs-box" style={{ left: `${BOX[0]}%`, top: `${BOX[1]}%`, width: `${BOX[2]}%`, height: `${BOX[3]}%` }} aria-label="已去过的景点">
      <ul className="cvs-grid">
        {VISITED_SPOTS.map((spot) => {
          // 与打卡集章页共用同一份 missions 进度：station 已打卡 → 卡片已打卡；
          // missions 未传入时（独立渲染）才回落到该站点的打卡时间记录
          const index = MISSION_INDEX[spot.key];
          const checkedBool = index != null ? Boolean(missions?.[index]) : false;
          const hasRecord = Object.prototype.hasOwnProperty.call(records, spot.key);
          const checked = missions ? checkedBool || hasRecord : hasRecord;
          const goStamp = () => onGoStamp && onGoStamp();
          const hint = checked ? "已打卡 · 点击去打卡集章" : "未打卡 · 点击去打卡集章";
          return (
            <li key={spot.key} className={`cvs-card${checked ? "" : " is-unchecked"}`}>
              <button type="button" className="cvs-figure" onClick={goStamp} title={hint} aria-label={`${spot.name}：${hint}`}>
                <img src={spot.image} alt={spot.name} loading="lazy" decoding="async" />
              </button>
              <span className="cvs-name">{spot.name}</span>
              <button type="button" className={`cvs-tag${checked ? " is-checked" : ""}`} onClick={goStamp} title={hint}>
                {checked ? "已打卡" : "未打卡"}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
