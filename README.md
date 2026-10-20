# 灵境智游 · 灵山胜境 AI 数字人导览

基于 React + Vite 的 PC 端演示项目（含平板 / 手机响应式适配），主版心约 1700px。

## 一、打开网页演示

| 方式 | 操作 |
| --- | --- |
| **在线（GitHub Pages）** | 仓库 Settings → Pages → Source 选择 `main` 分支 / `docs` 目录 → 访问 `https://<用户名>.github.io/<仓库名>/` |
| **仓库启动页** | 直接访问仓库根 `index.html`（会自动跳转到 `docs/index.html`） |
| **本地一键启动** | 双击仓库根目录的 `启动本地网页.bat`（需安装 Node.js），浏览器打开 `http://127.0.0.1:5173` |

> 说明：构建产物使用**相对路径**（`vite.config.js` 中 `base: "./"`），因此放在任意子目录或子路径下都能正常加载。

## 二、目录结构

```text
index.html            仓库启动页（自动跳转演示页）
启动本地网页.bat        本地一键启动脚本（Windows）
serve.js              本地静态服务（Node，无需额外依赖）
docs/                 网页构建产物（GitHub Pages 托管目录）
灵境智游_产品交付包_20260718_优化版/
  ├─ 01_产品源代码/灵境智游源码/   源码（npm install && npm run dev）
  ├─ 02_Windows可执行程序/         Windows 便携版（双击 灵境智游.exe）
  ├─ 03_产品文档/                 总体设计 / 部署使用手册
  └─ 04_交付清单.txt
```

## 三、重新构建网页

```bash
cd 灵境智游_产品交付包_20260718_优化版/01_产品源代码/灵境智游源码
npm install
npm run build
# 将 dist 内容覆盖到仓库 docs/ 目录与 02_Windows可执行程序/www
```

## 四、功能与演示要点

- 五位 3D 国风数字人、文字问答、语音识别与合成（Web Speech API）
- 智能体对话：配置大模型 Key 后启用，未配置自动回退本地知识库
- AI 打卡照片合成：浏览器端 Canvas 本地处理
- 个性路线推荐、复杂定位演示、拍照打卡与装扮解锁、管理后台
- 管理后台演示账号：`admin` / `lingjing2026`

模型 Key 为可选项：复制 `.env.example` 为 `.env.local` 填写即可（`.env.local` 已加入 `.gitignore`，不会上传）。
