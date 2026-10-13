/**
 * 打卡照片合成工具
 * 使用 HTML5 Canvas 将用户上传的照片与预设背景合成
 *
 * 合成效果：
 * - 背景层：渐变色 + 装饰文字/图标
 * - 用户照片层：居中展示，带圆角和阴影
 * - 前景层：标题、地点名、时间戳、印章
 * - 边框层：装饰性边框
 */

import { getCheckinTimestamp } from "../data/checkinBackgrounds.js";

/**
 * 合成打卡照片
 * @param {Object} options
 * @param {File} options.userImage - 用户上传的图片文件
 * @param {Object} options.background - 背景配置对象
 * @param {number} options.width - 输出图片宽度（默认 800）
 * @param {number} options.height - 输出图片高度（默认 1000）
 * @returns {Promise<string>} - 合成后图片的 Data URL
 */
export async function synthesizeCheckinPhoto({
  userImage,
  background,
  width = 800,
  height = 1000
}) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  // 1. 绘制背景渐变
  drawGradientBackground(ctx, width, height, background.gradient);

  // 2. 绘制装饰性背景元素
  drawBackgroundDecorations(ctx, width, height, background);

  // 3. 绘制用户照片（居中，带圆角和阴影）
  const userImg = await loadImage(userImage);
  drawUserPhoto(ctx, userImg, width, height);

  // 4. 绘制前景文字和信息
  drawForegroundElements(ctx, width, height, background);

  // 5. 绘制装饰边框
  drawDecorativeBorder(ctx, width, height);

  return canvas.toDataURL("image/jpeg", 0.92);
}

/**
 * 绘制渐变背景
 */
function drawGradientBackground(ctx, width, height, gradientStr) {
  // 解析渐变字符串或使用默认渐变
  const gradient = ctx.createLinearGradient(0, 0, width * 0.5, height);
  gradient.addColorStop(0, "#1a4a3a");
  gradient.addColorStop(0.4, "#2d7a5f");
  gradient.addColorStop(0.7, "#4a9a7a");
  gradient.addColorStop(1, "#8bc4a8");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // 添加纹理噪点效果
  ctx.globalAlpha = 0.03;
  for (let i = 0; i < 2000; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    ctx.fillStyle = Math.random() > 0.5 ? "#ffffff" : "#000000";
    ctx.fillRect(x, y, 1, 1);
  }
  ctx.globalAlpha = 1;
}

/**
 * 绘制背景装饰元素
 */
function drawBackgroundDecorations(ctx, width, height, background) {
  // 绘制大尺寸装饰图标（半透明）
  ctx.save();
  ctx.globalAlpha = 0.08;
  ctx.font = `${Math.min(width, height) * 0.5}px serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(background.icon || "🏯", width * 0.5, height * 0.45);
  ctx.restore();

  // 绘制装饰性几何图案
  ctx.save();
  ctx.globalAlpha = 0.06;
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 1;

  // 顶部装饰线
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo(0, 30 + i * 8);
    ctx.lineTo(width, 30 + i * 8);
    ctx.stroke();
  }

  // 底部装饰线
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo(0, height - 30 - i * 8);
    ctx.lineTo(width, height - 30 - i * 8);
    ctx.stroke();
  }
  ctx.restore();
}

/**
 * 绘制用户照片
 */
function drawUserPhoto(ctx, img, width, height) {
  const padding = 60;
  const photoWidth = width - padding * 2;
  const photoHeight = height * 0.52;
  const photoX = padding;
  const photoY = height * 0.22;
  const radius = 20;

  // 绘制阴影
  ctx.save();
  ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
  ctx.shadowBlur = 30;
  ctx.shadowOffsetY = 10;
  drawRoundedRect(ctx, photoX, photoY, photoWidth, photoHeight, radius);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.restore();

  // 裁剪并绘制照片
  ctx.save();
  drawRoundedRect(ctx, photoX, photoY, photoWidth, photoHeight, radius);
  ctx.clip();

  // 计算图片缩放（cover模式）
  const imgRatio = img.width / img.height;
  const targetRatio = photoWidth / photoHeight;
  let drawW, drawH, drawX, drawY;

  if (imgRatio > targetRatio) {
    drawH = photoHeight;
    drawW = photoHeight * imgRatio;
    drawX = photoX - (drawW - photoWidth) / 2;
    drawY = photoY;
  } else {
    drawW = photoWidth;
    drawH = photoWidth / imgRatio;
    drawX = photoX;
    drawY = photoY - (drawH - photoHeight) / 2;
  }

  ctx.drawImage(img, drawX, drawY, drawW, drawH);
  ctx.restore();

  // 绘制照片边框
  ctx.save();
  drawRoundedRect(ctx, photoX, photoY, photoWidth, photoHeight, radius);
  ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.restore();
}

/**
 * 绘制前景元素
 */
function drawForegroundElements(ctx, width, height, background) {
  // 顶部标题区域
  ctx.save();
  ctx.textAlign = "center";

  // 图标
  ctx.font = "48px serif";
  ctx.textBaseline = "middle";
  ctx.fillText(background.icon || "🏯", width / 2, 80);

  // 主标题
  ctx.font = "bold 42px 'Noto Serif SC', 'Source Han Serif SC', serif";
  ctx.fillStyle = "#ffffff";
  ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
  ctx.shadowBlur = 10;
  ctx.fillText(background.overlayText || "灵山打卡", width / 2, 140);

  // 副标题
  ctx.font = "20px 'Noto Sans SC', 'Source Han Sans SC', sans-serif";
  ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
  ctx.shadowBlur = 5;
  ctx.fillText(background.overlaySubtext || "", width / 2, 178);

  ctx.restore();

  // 底部信息区域
  ctx.save();
  const timestamp = getCheckinTimestamp();

  // 时间戳
  ctx.textAlign = "left";
  ctx.font = "16px 'Noto Sans SC', 'Source Han Sans SC', sans-serif";
  ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
  ctx.fillText(`📍 ${timestamp}`, 60, height - 70);

  // 打卡成功标识
  ctx.textAlign = "right";
  ctx.font = "bold 18px 'Noto Sans SC', 'Source Han Sans SC', sans-serif";
  ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
  ctx.fillText("✓ 打卡成功", width - 60, height - 70);

  // 底部品牌标识
  ctx.textAlign = "center";
  ctx.font = "14px 'Noto Sans SC', 'Source Han Sans SC', sans-serif";
  ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
  ctx.fillText("灵境智游 · 灵山胜境 AI 数字人导览", width / 2, height - 35);

  ctx.restore();
}

/**
 * 绘制装饰性边框
 */
function drawDecorativeBorder(ctx, width, height) {
  ctx.save();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
  ctx.lineWidth = 2;

  // 外边框
  const margin = 20;
  drawRoundedRect(ctx, margin, margin, width - margin * 2, height - margin * 2, 16);
  ctx.stroke();

  // 角落装饰
  const cornerSize = 30;
  const cornerOffset = 35;
  ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
  ctx.lineWidth = 2;

  // 左上角
  drawCorner(ctx, cornerOffset, cornerOffset, cornerSize, "top-left");
  // 右上角
  drawCorner(ctx, width - cornerOffset, cornerOffset, cornerSize, "top-right");
  // 左下角
  drawCorner(ctx, cornerOffset, height - cornerOffset, cornerSize, "bottom-left");
  // 右下角
  drawCorner(ctx, width - cornerOffset, height - cornerOffset, cornerSize, "bottom-right");

  ctx.restore();
}

/**
 * 绘制圆角矩形路径
 */
function drawRoundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

/**
 * 绘制角落装饰
 */
function drawCorner(ctx, x, y, size, position) {
  ctx.beginPath();
  const directions = {
    "top-left": { dx: 1, dy: 1 },
    "top-right": { dx: -1, dy: 1 },
    "bottom-left": { dx: 1, dy: -1 },
    "bottom-right": { dx: -1, dy: -1 }
  };
  const dir = directions[position];
  ctx.moveTo(x, y + size * dir.dy);
  ctx.lineTo(x, y);
  ctx.lineTo(x + size * dir.dx, y);
  ctx.stroke();
}

/**
 * 加载图片
 */
function loadImage(source) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("图片加载失败"));
    if (source instanceof File || source instanceof Blob) {
      img.src = URL.createObjectURL(source);
    } else {
      img.src = source;
    }
  });
}
