/**
 * 用户进度读写 · 打卡集章 / 我的衣橱 共用的唯一数据出口
 *
 * 设计原则（为避免出现第二套互相独立的状态）：
 * 1. 完全复用项目现有的存储键与存储格式：
 *    - lingjing-missions         打卡进度 [boolean × 4]（内存数据源仍在 App.jsx）
 *    - lingjing-wardrobe-outfit  已保存装扮的套装 key（字符串）
 * 2. 「每站的打卡时间」是原项目唯一缺失的信息（合成照片里的时间只画进图片、不落库），
 *    因此新增一个键，且只写入真实发生的打卡：
 *    - lingjing-checkin-records  { [景点 id]: "2026-10-19T08:30:00.000Z" }
 *    历史已打卡但无记录的景点一律返回 null，**不伪造任何历史日期**，
 *    也不把「景点数量」冒充成日历数据。
 * 3. 本文件只做读写与派生计算，不持有全局状态、不引入状态管理库，
 *    个人中心将来直接调用 readUserProgress() 即可，无需再改这两个模块。
 */

import { checkinBackgrounds } from "../data/checkinBackgrounds.js";
import { REWARD_OUTFITS, resolveUnlockedTotal } from "../data/rewardOutfits.js";
import { WARDROBE_OUTFITS, getWardrobeOutfits } from "../data/wardrobeOutfits.js";

/** 打卡进度存储键（App.jsx 已在使用，格式不变） */
export const MISSION_STORAGE_KEY = "lingjing-missions";
/** 已保存装扮存储键（我的衣橱已在使用，格式不变） */
export const OUTFIT_STORAGE_KEY = "lingjing-wardrobe-outfit";
/** 新增：每站真实打卡时间记录（只为个人中心将来的「打卡记录」预留） */
export const CHECKIN_RECORD_KEY = "lingjing-checkin-records";

/** 默认（未打卡）进度：长度与景点配置一致，不写死 4 */
export const EMPTY_MISSIONS = () => checkinBackgrounds.map(() => false);

/** 默认装扮：始终为第 1 套（与衣橱 DEFAULT_KEY 一致） */
export const DEFAULT_OUTFIT_KEY = WARDROBE_OUTFITS[0]?.key ?? "";

/**
 * 读取本机打卡进度；数据异常时回落到「全部未打卡」
 * @returns {boolean[]}
 */
export function readMissions() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(MISSION_STORAGE_KEY) || "null");
    if (
      Array.isArray(saved) &&
      saved.length === checkinBackgrounds.length &&
      saved.every((value) => typeof value === "boolean")
    ) {
      return saved;
    }
  } catch (error) {
    console.warn("打卡进度读取失败，按首次进入处理", error);
  }
  return EMPTY_MISSIONS();
}

/**
 * 写入打卡进度（格式与 App.jsx 完全一致：[boolean × 景点数]）
 * @param {boolean[]} missions
 */
export function writeMissions(missions) {
  try {
    window.localStorage.setItem(MISSION_STORAGE_KEY, JSON.stringify(missions));
  } catch (error) {
    console.warn("打卡进度保存失败", error);
  }
  return missions;
}

/**
 * 读取每站的打卡时间记录
 * @returns {Object<string, string>} { 景点id: ISO 时间字符串 }，无记录则为空对象
 */
export function readCheckinRecords() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(CHECKIN_RECORD_KEY) || "{}");
    if (!saved || typeof saved !== "object" || Array.isArray(saved)) return {};
    return Object.fromEntries(
      Object.entries(saved).filter(([key, value]) => typeof key === "string" && typeof value === "string" && value)
    );
  } catch (error) {
    console.warn("打卡记录读取失败，按无记录处理", error);
  }
  return {};
}

/**
 * 记录一次真实打卡（同一景点只保留首次时间，重复打卡不覆盖）
 * @param {string} spotId - checkinBackgrounds 中的景点 id
 * @param {Date} [at=new Date()] - 打卡发生时刻
 * @returns {boolean} 是否写入成功
 */
export function recordCheckin(spotId, at = new Date()) {
  if (!spotId) return false;
  const records = readCheckinRecords();
  if (records[spotId]) return false; // 已有记录：不覆盖首次打卡时间
  records[spotId] = (at instanceof Date ? at : new Date(at)).toISOString();
  try {
    window.localStorage.setItem(CHECKIN_RECORD_KEY, JSON.stringify(records));
    return true;
  } catch (error) {
    console.warn("打卡记录保存失败", error);
    return false;
  }
}

/**
 * 读取已保存的装扮 key（未保存过则回落第 1 套）
 * @returns {string}
 */
export function readSavedOutfitKey() {
  try {
    const saved = window.localStorage.getItem(OUTFIT_STORAGE_KEY);
    if (saved && WARDROBE_OUTFITS.some((outfit) => outfit.key === saved)) return saved;
  } catch (error) {
    console.warn("已保存装扮读取失败，按默认装扮处理", error);
  }
  return DEFAULT_OUTFIT_KEY;
}

/**
 * 写入已保存的装扮 key
 * @param {string} key
 * @returns {boolean} 是否写入成功
 */
export function writeSavedOutfitKey(key) {
  try {
    window.localStorage.setItem(OUTFIT_STORAGE_KEY, key);
    return true;
  } catch (error) {
    console.warn("装扮保存失败", error);
    return false;
  }
}

/**
 * 汇总用户进度（个人中心后续联动的推荐读取入口）
 *
 * @param {boolean[]} [missions] - 传入 App.jsx 的内存状态；不传则从本机存储读取
 * @returns {{
 *   missions: boolean[],
 *   totalSpots: number,
 *   completedCount: number,
 *   completedSpots: Array<{id:string,title:string,checkedAt:string|null}>,
 *   unlockedTotal: number,
 *   unlockedOutfits: Array<Object>,
 *   savedOutfitKey: string,
 *   savedOutfit: Object,
 *   savedOutfitUnlocked: boolean,
 *   checkinRecords: Object<string,string>
 * }}
 */
export function readUserProgress(missions, guideKey) {
  const outfits = getWardrobeOutfits(guideKey ?? window.localStorage.getItem("lingjing-guide"));
  const list =
    Array.isArray(missions) && missions.length === checkinBackgrounds.length ? missions : readMissions();
  const completedCount = list.filter(Boolean).length;
  const unlockedTotal = resolveUnlockedTotal(completedCount);
  const records = readCheckinRecords();

  // 已完成景点及其打卡时间：无记录的景点 checkedAt 为 null（不伪造历史日期）
  const completedSpots = checkinBackgrounds
    .map((spot, index) => ({
      id: spot.id,
      title: spot.title,
      completed: Boolean(list[index]),
      checkedAt: list[index] ? records[spot.id] ?? null : null,
    }))
    .filter((spot) => spot.completed)
    .map(({ id, title, checkedAt }) => ({ id, title, checkedAt }));

  const savedOutfitKey = readSavedOutfitKey();
  const savedOutfit = outfits.find((outfit) => outfit.key === savedOutfitKey) || outfits[0];
  const savedIndex = WARDROBE_OUTFITS.findIndex((outfit) => outfit.key === savedOutfitKey);

  return {
    missions: list,
    totalSpots: checkinBackgrounds.length,
    completedCount,
    completedSpots,
    unlockedTotal,
    unlockedOutfits: outfits.slice(0, unlockedTotal),
    savedOutfitKey,
    savedOutfit,
    savedOutfitUnlocked: savedIndex >= 0 && savedIndex < unlockedTotal,
    checkinRecords: records,
  };
}

/** 奖励区（打卡集章页底部七张卡片）使用的服装清单，供页面复用同一份配置 */
export { REWARD_OUTFITS, resolveUnlockedTotal };
