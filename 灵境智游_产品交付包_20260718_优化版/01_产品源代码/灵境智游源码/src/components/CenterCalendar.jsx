import { useMemo, useState } from "react";
import { checkinBackgrounds } from "../data/checkinBackgrounds.js";
import { readCheckinRecords } from "../utils/userProgress.js";

// 个人中心 · 打卡日历：底图印死的「2025年5月」静态日历替换为与系统日期同步的真实日历
// 坐标由 profile-center.webp 逐像素测量（页面百分比）：
//   网格区 x 70.2~88.2 / y 31.4~50.0（7 列中心 ≈72.0+2.4i，左右内边距 0.6% 后列距恰为 2.4%），
//   月份栏 x 81.2~88.0 / y 28.0~31.0，右侧「本月已打卡」数字 x 90.4~97.4 / y 34.9~38.4，
//   「查看全部」按钮保留底图原样，由既有热区（89.5,45.8,7,4）跳转打卡集章。
// 规则：周一起始；有打卡记录的日期显示金色圆徽；系统当天深绿实心；前后月补位灰显；
//       「本月已打卡」= 当月有打卡记录的景点数 / 景点总数（真实数据，不伪造）。
const GRID_BOX = [70.2, 31.4, 18.0, 18.6];
const MONTH_BOX = [81.2, 28.0, 6.8, 3.0];
const COUNT_BOX = [90.4, 34.9, 7.0, 3.5];
const WEEK_LABELS = ["一", "二", "三", "四", "五", "六", "日"];
const HEADER_RATIO = 11.8; // 表头行占网格容器高度的百分比
const TOTAL_SPOTS = checkinBackgrounds.length;

const dayKey = (date) => `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

export default function CenterCalendar() {
  const now = new Date();
  const [view, setView] = useState({ year: now.getFullYear(), month: now.getMonth() });
  const [picked, setPicked] = useState(null); // 点选的日期（用于弹出当日打卡明细）

  // 打卡记录：{ 景点id: 首次打卡时间 } → 带景点标题的明细列表
  const entries = useMemo(
    () =>
      Object.entries(readCheckinRecords())
        .map(([spotId, iso]) => {
          const spot = checkinBackgrounds.find((item) => item.id === spotId);
          const at = new Date(iso);
          return Number.isNaN(at.getTime()) ? null : { spotId, title: spot ? spot.title : spotId, at };
        })
        .filter(Boolean),
    []
  );

  const monthEntries = entries.filter(
    (item) => item.at.getFullYear() === view.year && item.at.getMonth() === view.month
  );
  const checkedDays = new Set(monthEntries.map((item) => item.at.getDate()));
  const monthSpotCount = new Set(monthEntries.map((item) => item.spotId)).size;

  // 周一起始的月历格子（前后月补位灰显）
  const cells = useMemo(() => {
    const lead = (new Date(view.year, view.month, 1).getDay() + 6) % 7;
    const total = new Date(view.year, view.month + 1, 0).getDate();
    const list = [];
    for (let i = lead; i > 0; i -= 1) list.push({ date: new Date(view.year, view.month, 1 - i), outside: true });
    for (let d = 1; d <= total; d += 1) list.push({ date: new Date(view.year, view.month, d), outside: false });
    let trail = 1;
    while (list.length % 7 !== 0) {
      list.push({ date: new Date(view.year, view.month + 1, trail), outside: true });
      trail += 1;
    }
    return list;
  }, [view]);
  const rows = cells.length / 7;

  const shiftMonth = (delta) =>
    setView(({ year, month }) => {
      const next = new Date(year, month + delta, 1);
      return { year: next.getFullYear(), month: next.getMonth() };
    });

  const pick = (cell, index) => {
    const key = dayKey(cell.date);
    setPicked((cur) => {
      if (cur && cur.key === key) return null;
      const items = entries
        .filter((item) => dayKey(item.at) === key)
        .map((item) => ({ title: item.title, time: item.at.toTimeString().slice(0, 5) }));
      return {
        key,
        col: index % 7,
        row: Math.floor(index / 7),
        label: `${cell.date.getFullYear()}年${cell.date.getMonth() + 1}月${cell.date.getDate()}日`,
        items
      };
    });
  };

  const boxStyle = (box) => ({
    left: `${box[0]}%`,
    top: `${box[1]}%`,
    width: `${box[2]}%`,
    height: `${box[3]}%`
  });

  return (
    <>
      {/* 月份栏：替换底图印死的「2025年5月 >」，可前后翻月查看历史打卡 */}
      <div className="design-rail cal-month" style={boxStyle(MONTH_BOX)}>
        <button type="button" className="cal-month-nav" onClick={() => shiftMonth(-1)} aria-label="上一个月">
          ‹
        </button>
        <span className="cal-month-label">
          {view.year}年{view.month + 1}月
        </span>
        <button type="button" className="cal-month-nav" onClick={() => shiftMonth(1)} aria-label="下一个月">
          ›
        </button>
      </div>

      {/* 本月已打卡：真实数据（当月有记录的景点数 / 景点总数） */}
      <div className="design-rail cal-count" style={boxStyle(COUNT_BOX)}>
        <span className="cal-count-num">{monthSpotCount}</span>
        <span className="cal-count-total">/ {TOTAL_SPOTS}</span>
      </div>

      {/* 日期网格：底图印刷日历的同位覆盖，日期与系统时间同步 */}
      <div className="design-rail cal-grid" style={boxStyle(GRID_BOX)}>
        <div className="cal-week" aria-hidden="true">
          {WEEK_LABELS.map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>
        <div className="cal-dates" style={{ gridTemplateRows: `repeat(${rows}, 1fr)` }}>
          {cells.map((cell, index) => {
            const key = dayKey(cell.date);
            const checked = !cell.outside && checkedDays.has(cell.date.getDate());
            const isToday = !cell.outside && dayKey(cell.date) === dayKey(now);
            return (
              <button
                key={key}
                type="button"
                className={[
                  "cal-day",
                  cell.outside ? "is-outside" : "",
                  checked ? "is-checked" : "",
                  isToday ? "is-today" : "",
                  picked && picked.key === key ? "is-picked" : ""
                ]
                  .filter(Boolean)
                  .join(" ")}
                aria-label={`${cell.date.getFullYear()}年${cell.date.getMonth() + 1}月${cell.date.getDate()}日${checked ? "，已打卡" : ""}`}
                onClick={() => pick(cell, index)}
              >
                <span>{cell.date.getDate()}</span>
              </button>
            );
          })}
        </div>

        {picked && (
          <div
            className="cal-pop"
            style={{
              left: `${((picked.col + 0.5) / 7) * 100}%`,
              top: `${HEADER_RATIO + ((picked.row + (picked.row >= rows - 1 ? -0.15 : 0.9)) / rows) * (100 - HEADER_RATIO)}%`,
              transform: `translateX(-50%) translateY(${picked.row >= rows - 1 ? "-104%" : "0"})`
            }}
          >
            <strong>{picked.label}</strong>
            {picked.items.length ? (
              <ul>
                {picked.items.map((item) => (
                  <li key={item.title}>
                    <span>{item.title}</span>
                    <i>{item.time}</i>
                  </li>
                ))}
              </ul>
            ) : (
              <p>当天暂无打卡记录</p>
            )}
          </div>
        )}
      </div>
    </>
  );
}
