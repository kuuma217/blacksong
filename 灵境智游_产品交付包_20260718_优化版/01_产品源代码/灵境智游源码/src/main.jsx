import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import TargetCursor from "./components/TargetCursor.jsx";
import "./styles.css";

// 公共资源基址：开发环境为 "/"，构建产物为 "./"，保证部署在任意子路径（如 GitHub Pages /仓库名/）下图片可用
const withBase = (path) => `${import.meta.env.BASE_URL}${path}`.replace(/\/{2,}/g, "/");

// 供 CSS 使用的背景图变量（wardrobe.css / styles.css 中通过 var() 引用）
const rootStyle = document.documentElement.style;
rootStyle.setProperty("--img-wardrobe-bg", `url("${withBase("assets/background.webp")}")`);
rootStyle.setProperty("--img-chat-paper", `url("${withBase("assets/assistant-chat-paper.webp")}")`);
rootStyle.setProperty("--img-hot-paper", `url("${withBase("assets/assistant-hot-paper.webp")}")`);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <>
      <TargetCursor
        targetSelector={'button:not(:disabled), a[href], input:not([type="hidden"]), select, textarea, label[for], summary, [role="button"], [tabindex]:not([tabindex="-1"]), .drop-zone, .cursor-target'}
        spinDuration={2.4}
        hideDefaultCursor
        parallaxOn
        cursorColor="#d3ab6b"
        cursorColorOnTarget="#ecd9ae"
      />
      <App />
    </>
  </StrictMode>
);
