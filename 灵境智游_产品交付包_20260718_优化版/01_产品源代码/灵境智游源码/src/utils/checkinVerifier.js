/**
 * 打卡照片 · 文件可用性校验（本地演示版）
 *
 * 重要说明（请勿误解本文件的能力）：
 * 1. 本文件**不做景点真实性识别**。当前为比赛演示版，只要用户选择的文件
 *    是「受支持的图片类型、大小合理、且能被浏览器正常解码」，即允许完成打卡。
 * 2. 因此「上传成功」**不等于**"该照片经过 AI 核验确属该景点"，
 *    界面与文案中不得宣称已完成景点识别。
 * 3. 未来若接入真实视觉识别（如视觉大模型），请在下方 requestVisionCheck()
 *    中实现，其余调用方无需改动。
 */

/** 允许的图片 MIME 类型 */
const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

/** 允许的文件扩展名（用于部分系统 MIME 为空时的兜底判断） */
const ACCEPTED_EXTENSION = /\.(jpe?g|png|webp)$/i;

/** 单张照片大小上限：15MB */
const MAX_FILE_SIZE = 15 * 1024 * 1024;

/**
 * 预留：调用真实视觉识别服务判断照片是否属于指定景点。
 * 当前版本未接入任何识别服务，固定返回 null，由本地文件校验兜底。
 * @returns {Promise<null>} 恒为 null
 */
async function requestVisionCheck() {
  // 接入方式示例（需后端代理，禁止在浏览器端暴露密钥）：
  // const form = new FormData();
  // form.append("file", file);
  // form.append("spotId", background.id);
  // const res = await fetch(`${import.meta.env.VITE_CHECKIN_API_URL}/verify`, { method: "POST", body: form });
  // return await res.json(); // { passed, confidence, reason }
  return null;
}

/**
 * 校验图片文件能否被浏览器正常解码（防止损坏/伪装成图片的文件）
 * @param {File} file - 待校验的图片文件
 * @returns {Promise<boolean>} 能否正常读取
 */
function canDecodeImage(file) {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img.width > 0 && img.height > 0);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(false);
    };
    img.src = url;
  });
}

/**
 * 校验打卡照片文件的可用性（不校验景点真实性）
 * @param {Object} options
 * @param {File} options.file - 用户选择的图片文件
 * @param {Object} options.background - checkinBackgrounds 中的景点配置
 * @returns {Promise<{ok:boolean, reason:string, hint:string, notice:string}>}
 *          ok 是否可用；reason 结论说明；hint 修正建议；notice 演示版声明
 */
export async function validateCheckinFile({ file, background }) {
  // 演示版声明：始终返回，供界面展示，避免被误认为已做 AI 识别
  const notice = "当前为本地演示打卡，尚未接入景点 AI 识别";

  if (!file) {
    return { ok: false, reason: "没有读取到图片文件", hint: "请重新选择一张照片", notice };
  }

  if (!background) {
    return { ok: false, reason: "景点配置缺失", hint: "请刷新页面后重试", notice };
  }

  const typeOk = ACCEPTED_TYPES.includes(String(file.type).toLowerCase())
    || ACCEPTED_EXTENSION.test(file.name || "");
  if (!typeOk) {
    return {
      ok: false,
      reason: "不支持的文件格式",
      hint: "请选择 JPG / JPEG / PNG / WEBP 格式的照片",
      notice
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      ok: false,
      reason: "照片体积过大",
      hint: `请选择小于 ${MAX_FILE_SIZE / 1024 / 1024}MB 的照片`,
      notice
    };
  }

  if (file.size === 0) {
    return { ok: false, reason: "文件内容为空", hint: "该文件可能已损坏，请换一张照片", notice };
  }

  // 先尝试真实识别（未接入时为 null）；识别结果若明确不通过，则以识别结果为准
  const vision = await requestVisionCheck();
  if (vision && vision.passed === false) {
    return {
      ok: false,
      reason: vision.reason || "照片未通过景点识别",
      hint: vision.hint || "请拍摄包含该景点主体的照片后重试",
      notice
    };
  }

  const readable = await canDecodeImage(file);
  if (!readable) {
    return {
      ok: false,
      reason: "图片无法正常读取",
      hint: "该文件可能已损坏或不是真正的图片，请换一张照片重试",
      notice
    };
  }

  return {
    ok: true,
    reason: "照片可正常读取，可以完成本次打卡",
    hint: "",
    notice
  };
}
