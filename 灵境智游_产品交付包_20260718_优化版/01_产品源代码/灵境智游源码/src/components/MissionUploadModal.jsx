import { useRef, useState } from "react";
import MissionSpotIcon from "./MissionSpotIcon.jsx";

/** 允许选择的图片类型（与 utils/checkinVerifier.js 保持一致） */
const ACCEPT = "image/jpeg,image/jpg,image/png,image/webp";

/**
 * 打卡照片上传弹窗
 *
 * 职责：选择 / 拖拽照片 → 本地预览 → 提交打卡。
 * 本组件**不判断照片是否属于该景点**，也不展示任何"识别通过"的假象；
 * 校验结论由父组件（MissionPanel）计算后通过 status / message 传回展示。
 * 取消或关闭弹窗只会清理预览，不会完成打卡。
 */
export default function MissionUploadModal({
  open,
  spot,
  status = "idle",
  message = "",
  hint = "",
  previewUrl = "",
  notice = "",
  onClose,
  onSelectFile,
  onSubmit
}) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  if (!open || !spot) return null;

  // 处理中（校验 / 合成）时禁用所有按钮，防止重复提交
  const busy = status === "verifying" || status === "synthesizing";
  const rejected = status === "rejected";

  const statusText = {
    idle: "请先选择一张照片",
    ready: "照片已就绪，确认后即可完成本次打卡",
    verifying: "正在检查照片…",
    synthesizing: "正在生成专属打卡照…",
    rejected: message
  }[status];

  return (
    <div className="modal-backdrop mp-upload-backdrop open" onClick={() => !busy && onClose()}>
      <div className="mp-upload-modal" onClick={(event) => event.stopPropagation()}>
        <button className="modal-close" onClick={onClose} disabled={busy} aria-label="关闭">✕</button>

        <header className="mp-upload-head">
          <span className="mp-upload-icon" aria-hidden="true">
            <MissionSpotIcon spotId={spot.id} size={30} title={spot.title} />
          </span>
          <div>
            <p className="tiny-label">上传打卡照片</p>
            <h3>{spot.title}</h3>
            <small>{spot.description}</small>
          </div>
        </header>

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          hidden
          onChange={(event) => onSelectFile(event)}
        />

        <div
          className={`mp-upload-drop ${dragging ? "dragging" : ""} ${rejected ? "rejected" : ""}`}
          onClick={() => !busy && inputRef.current?.click()}
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            if (busy) return;
            const files = event.dataTransfer?.files;
            if (files && files.length) {
              onSelectFile({ target: { files } });
            }
          }}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") inputRef.current?.click();
          }}
        >
          {previewUrl ? (
            <img className="mp-upload-preview" src={previewUrl} alt="待上传的打卡照片" />
          ) : (
            <>
              <span className="mp-upload-plus" aria-hidden="true">＋</span>
              <strong>点击选择照片，或拖拽到此处</strong>
              <small>支持 JPG / JPEG / PNG / WEBP，单张不超过 15MB</small>
            </>
          )}
        </div>

        {statusText && (
          <p className={`mp-upload-status ${rejected ? "rejected" : ""} ${busy ? "busy" : ""}`}>
            {busy && <i className="mp-upload-spinner" aria-hidden="true" />}
            {statusText}
          </p>
        )}

        {rejected && hint && <p className="mp-upload-hint">{hint}</p>}

        {notice && (
          <p className="mp-upload-notice">
            <span aria-hidden="true">ⓘ</span>
            {notice}
          </p>
        )}

        <footer className="mp-upload-actions">
          <button className="mp-upload-btn ghost" onClick={onClose} disabled={busy}>取消</button>
          <button
            className="mp-upload-btn primary"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
          >
            {previewUrl ? "重选照片" : "选择照片"}
          </button>
          <button
            className="mp-upload-btn gold"
            onClick={onSubmit}
            disabled={!previewUrl || busy}
            title={previewUrl ? "" : "请先选择一张照片"}
          >
            {status === "synthesizing" ? "生成中…" : "确认打卡"}
          </button>
        </footer>
      </div>
    </div>
  );
}
