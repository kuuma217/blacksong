import { Fragment } from "react";
import { defaultConstraints, itineraryOptions } from "../data/routes.js";

// 坐标说明：对设计稿 route-plan.webp（1959×1109）做像素测量后，
// 把左侧「定制你的专属路线」卡片抠成 route-config-card.webp（539×549），
// 并把原图上 4 行胶囊、大标题、副标题、分组标签、按钮文字整体擦除
// （只保留纸纹与分组图标），胶囊与这些文字都改由 CSS / 真实字体重绘：
// 胶囊选中与未选中共用同一个盒子，因此永远完全重合；
// 文字不再受位图分辨率限制，任意缩放与高清屏都保持锐利。
// 下面所有百分比均相对该卡片，随画布 cqw 等比缩放。

// 四组筛选项的纵向位置（实测胶囊上沿 133 / 221 / 309 / 397）与行高（28px）
const ROW_TOP = {
  duration: 24.23,
  interests: 40.26,
  budget: 56.28,
  pace: 72.31
};
const ROW_HEIGHT = 5.1;

// 「为我推荐路线」按钮（实测 x 103..389，y 463..515）
const SUBMIT = { left: 19.11, top: 84.34, w: 53.06, h: 9.47 };

// 分组标签文字：底图上的光栅标签已擦除，改由真实字体重绘
// （实测墨迹 x 80..145，四行 y 104 / 190 / 279 / 368，卡片 539x549 局部坐标）
const LABEL_TEXT = {
  duration: "游玩时长",
  interests: "兴趣偏好",
  budget: "预算范围",
  pace: "游览节奏"
};
const LABEL_TOP = {
  duration: 18.74,
  interests: 34.4,
  budget: 50.64,
  pace: 66.87
};

const GROUPS = [
  { row: "duration", key: "duration", options: itineraryOptions.duration },
  { row: "interests", key: "interests", options: itineraryOptions.interests },
  { row: "budget", key: "budget", options: itineraryOptions.budget },
  { row: "pace", key: "pace", options: itineraryOptions.pace }
];

export default function RouteConfigurator({ value, onChange, onGenerate, planning = false }) {
  const constraints = { ...defaultConstraints, ...value };
  // 兴趣偏好是四选一：数组里最多一个值，其他三组仍是单选值
  const interest = (constraints.interests || [])[0];
  const set = (field, next) => onChange({ ...constraints, [field]: next });
  // 再次点击已选项 = 取消选择（回到「未表达偏好」）
  const pickInterest = (value) => set("interests", interest === value ? [] : [value]);

  const isActive = (key, option) => (key === "interests"
    ? interest === option.value
    : constraints[key] === option.value);

  const pick = (key, option) => (key === "interests"
    ? pickInterest(option.value)
    : set(key, option.value));

  return (
    <div className="route-config-live">
      <section className="route-config-card" aria-label="定制你的专属路线">
        {/* 设计稿原件抠图：分组图标、纸纹保持原样，胶囊与文字位置已清空 */}
        <img className="route-config-card-bg" src="/assets/route-config-card.webp" alt="" />

        {/* 底图上的标题 / 副标题 / 分组标签已擦除，这里用真实字体重绘，
            不再受位图分辨率限制，任意缩放与高清屏都保持锐利 */}
        <h2 className="route-config-title">定制你的专属路线</h2>
        <p className="route-config-subtitle">根据你的偏好，智能推荐最适合的游览路线</p>

        {GROUPS.map((group) => (
          <Fragment key={group.key}>
            <span
              className="route-config-label"
              style={{ top: `${LABEL_TOP[group.row]}%` }}
            >
              {LABEL_TEXT[group.key]}
            </span>
            <div
              className="route-config-row"
              style={{ top: `${ROW_TOP[group.row]}%`, height: `${ROW_HEIGHT}%` }}
            >
              {group.options.map((option) => (
                <button
                  type="button"
                  key={option.value}
                  className={`route-config-pill${isActive(group.key, option) ? " active" : ""}`}
                  aria-pressed={isActive(group.key, option)}
                  onClick={() => pick(group.key, option)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </Fragment>
        ))}

        <button
          type="button"
          className={`route-config-submit${planning ? " planning" : ""}`}
          style={{ left: `${SUBMIT.left}%`, top: `${SUBMIT.top}%`, width: `${SUBMIT.w}%`, height: `${SUBMIT.h}%` }}
          aria-label="为我推荐路线"
          onClick={() => onGenerate(constraints)}
          disabled={planning}
        >
          <span>{planning ? "正在为你规划…" : "为我推荐路线"}</span>
        </button>
      </section>
    </div>
  );
}
