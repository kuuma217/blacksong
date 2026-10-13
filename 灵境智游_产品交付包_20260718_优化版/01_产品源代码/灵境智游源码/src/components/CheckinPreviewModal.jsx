import { useEffect, useRef, useState } from "react";

/**
 * 打卡照片预览弹窗
 * 展示合成后的打卡照片，支持下载和关闭
 */
export default function CheckinPreviewModal({ open, imageUrl, onClose, title }) {
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    if (open) setLoaded(false);
  }, [open, imageUrl]);

  const handleDownload = () => {
    if (!imageUrl) return;
    const link = document.createElement("a");
    link.download = `灵山打卡_${title || "照片"}_${Date.now()}.jpg`;
    link.href = imageUrl;
    link.click();
  };

  if (!open) return null;

  return (
    <div className="modal-backdrop checkin-preview-backdrop" onClick={onClose}>
      <div className="checkin-preview-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="关闭">✕</button>

        <div className="checkin-preview-header">
          <span className="checkin-success-icon">✓</span>
          <div>
            <h2>打卡成功！</h2>
            <p>你的专属打卡照片已生成</p>
          </div>
        </div>

        <div className="checkin-preview-image">
          {!loaded && <div className="checkin-loading"><span>正在合成照片…</span></div>}
          <img
            ref={imgRef}
            src={imageUrl}
            alt={`打卡照片 - ${title}`}
            onLoad={() => setLoaded(true)}
            style={{ opacity: loaded ? 1 : 0, transition: "opacity 0.3s" }}
          />
        </div>

        <div className="checkin-preview-actions">
          <button className="download-button" onClick={handleDownload} disabled={!loaded}>
            <span>↓</span> 保存照片
          </button>
          <button className="share-button" onClick={onClose}>
            继续探索
          </button>
        </div>

        <p className="checkin-preview-hint">
          照片由灵境智游 AI 自动生成 · 融合你的现场照片与灵山主题背景
        </p>
      </div>
    </div>
  );
}
