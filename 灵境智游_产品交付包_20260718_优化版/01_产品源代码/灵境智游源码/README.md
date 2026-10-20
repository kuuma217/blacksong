# 灵境智游 · 灵山胜境 AI 数字人导览

基于 React + Vite 的 PC 端比赛演示项目，主版心约 1700px，同时保留平板和手机响应式适配。

## 功能清单

- 游客端：五位 3D 国风数字人、文字问答、浏览器语音识别与合成、人物专属声色与语速
- **🤖 智能体对话**：支持通义千问智能体（Agent），具备语义理解、多轮对话、工具调用能力，自动回退到本地知识库模式
- **📸 AI 打卡照片合成**：用户上传现场照片，自动与灵山主题背景合成专属打卡照片（Canvas 本地处理）
- 本地知识问答：灵山历史文化、景点特色、路线、拍照建议、日常寒暄与中英文问答
- 个性路线：按年龄、同行人、兴趣、可用时间、体力、语言和无障碍需求推荐
- 复杂定位：提供 GPS 弱信号时的二维码、蓝牙信标和路线融合定位演示
- 游戏化体验：拍照打卡、AI 照片合成、任务进度、数字人服饰解锁
- 管理后台：运营大屏、游客画像、情感趋势、热门问题、知识库上传、数字人及声线管理、模型设置

## 新增功能说明

### 1. 智能体对话（Agent Mode）

数字人对话从传统的关键词匹配升级为**智能体驱动的智能对话**。

**工作原理：**
- 配置通义千问 API Key 后自动启用智能体模式
- 每位数字人拥有独立的人设提示词（System Prompt）
- 支持多轮对话上下文记忆
- 支持工具调用（天气查询、路线推荐、知识检索等）
- 未配置 API Key 时自动回退到本地知识库模式

**相关文件：**
- `src/data/agentConfig.js` — 智能体配置（API、人设、工具定义）
- `src/components/AssistantPanel.jsx` — 对话面板（集成智能体调用）

**构建智能体的详细步骤：** 参见 [智能体构建指南](./智能体构建指南.md)

### 2. AI 打卡照片合成

打卡时用户上传图片，系统自动合成带有灵山主题的专属打卡照片。

**技术特点：**
- 完全在浏览器端通过 HTML5 Canvas 处理，无需后端服务
- 每个打卡点拥有独立的渐变背景和主题元素
- 合成效果包括：渐变背景 → 装饰图标 → 用户照片（圆角+阴影）→ 前景文字 → 装饰边框
- 支持下载保存合成照片

**相关文件：**
- `src/utils/photoSynthesizer.js` — Canvas 照片合成工具
- `src/data/checkinBackgrounds.js` — 打卡点背景配置
- `src/components/CheckinPreviewModal.jsx` — 合成结果预览弹窗
- `src/components/MissionPanel.jsx` — 打卡面板（集成合成功能）

## 在 VS Code 运行

请先安装 Node.js 20.19 或更高版本，然后在 VS Code 中打开本项目文件夹。

```bash
npm install
npm run dev
```

浏览器打开：`http://127.0.0.1:5173`

也可在 VS Code 的"运行和调试"面板选择"启动 React + Vite"。

### Linux / macOS

运行步骤与 Windows 相同。服务端语音合成需要额外安装 `espeak-ng`：

```bash
# Debian / Ubuntu
sudo apt install espeak-ng

# Fedora / RHEL
sudo dnf install espeak-ng

# macOS (Homebrew)
brew install espeak-ng
```

若未安装 `espeak-ng`，语音合成会自动回退到浏览器内置 Web Speech API，功能不受影响。

## 管理后台演示账号

- 账号：`admin`
- 密码：`lingjing2026`

## 生产构建

```bash
npm run build
npm run preview
```

构建结果输出到 `dist/`。

## 可选模型 API

只需要一组变量，四家厂商都是 OpenAI 兼容接口，换厂商不用改代码。

复制 `.env.example` 为 `.env.local`，按需填写（**改完必须重启 dev server**）：

```env
# 方案 A：智谱 GLM Flash（推荐，长期免费）
VITE_QWEN_API_URL=https://open.bigmodel.cn/api/paas/v4
VITE_QWEN_MODEL=glm-4-flash
VITE_QWEN_API_KEY=你的Key
```

其余三家（任选其一，注释掉另外三家即可）：

| 方案 | 免费额度类型 | `VITE_QWEN_API_URL` | `VITE_QWEN_MODEL` | 获取 Key |
|---|---|---|---|---|
| 智谱 GLM（推荐） | **长期免费**，无每日配额 | `https://open.bigmodel.cn/api/paas/v4` | `glm-4.7-flash`（备选 `glm-4-flash`） | [open.bigmodel.cn](https://open.bigmodel.cn/) |
| 阿里云百炼千问 | 新人**一次性**额度，用完转按量付费 | `https://dashscope.aliyuncs.com/compatible-mode/v1` | `qwen-flash` | [bailian.console.aliyun.com](https://bailian.console.aliyun.com/) |
| 硅基流动 | 注册赠送 + 部分模型长期免费 | `https://api.siliconflow.cn/v1` | `Qwen/Qwen2.5-7B-Instruct` | [siliconflow.cn](https://siliconflow.cn/) |
| DeepSeek | 无免费额度（价格极低） | `https://api.deepseek.com/v1` | `deepseek-chat` | [platform.deepseek.com](https://platform.deepseek.com/) |

> 需要「额度长期/周期性可用」的场景选智谱。千问的免费额度是新人一次性赠送（约 100 万 token、有效期数月），**不会每天刷新**；已实名账号用完后会自动转为按量付费，建议开启「免费额度用完即停」。

**智能体模式：** 配置 `VITE_QWEN_API_KEY` 后，数字人对话自动切换到智能体模式，右上角标识会显示实际厂商（如"🤖 智谱 GLM"）。未配置时使用本地知识库模式，不影响基本功能。

**推荐路线：** 同样使用这个 Key。有 Key 时 Toast 显示「已由 AI 智能体生成」；无 Key、超时（12s）或返回格式不合格时显示「已按本地规则生成」，页面不会报错。

**打卡照片合成：** 在浏览器端本地处理，无需配置任何 API。

当前代码默认使用免费、可离线演示的浏览器能力和前端本地知识库，因此不配置密钥也能完整演示。正式部署时应将大模型密钥放在服务端，不能直接暴露在浏览器中。

## 目录结构

```text
src/
  components/       游客端、管理后台、弹窗与提示组件
    ├── AssistantPanel.jsx    AI 数字人问答面板（支持智能体模式）
    ├── MissionPanel.jsx      打卡与装扮面板（集成照片合成）
    ├── CheckinPreviewModal.jsx 打卡照片预览弹窗（新增）
    ├── AdminDashboard.jsx    管理后台
    └── ...                   其他组件
  data/
    ├── agentConfig.js        智能体配置（API、人设、工具）（新增）
    ├── checkinBackgrounds.js 打卡点背景配置（新增）
    ├── guides.js             数字人数据
    ├── knowledge.js          本地知识库
    └── routes.js             路线数据
  hooks/
    └── useSpeech.js          语音识别与合成
  utils/
    └── photoSynthesizer.js   打卡照片合成工具（新增）
  App.jsx                     页面状态与功能编排
  styles.css                  1700px PC 大屏与响应式设计
public/assets/                五位数字人形象资源
knowledge-source/             景区知识源文档

03_产品文档/
  ├── 灵境智游_产品部署和使用手册_V1.0.docx
  ├── 灵境智游_产品总体设计文档_V1.0.docx
  └── 灵境智游_智能体构建指南_V2.0.docx  （新增）
```

## Windows 可执行版

项目提供 Windows 便携版，双击 `灵境智游.exe` 即可在浏览器中使用全部功能：

- **AI 智能体对话**：配置 API Key 后启用（详见下方"可选模型 API"）
- **拍照打卡**：开箱即用，Canvas 本地合成照片
- **语音功能**：使用浏览器 Web Speech API

Windows 版详细说明请参阅：
- `02_Windows可执行程序/启动说明.txt`
- `02_Windows可执行程序/Windows版智能体与拍照打卡功能说明.md`

### Windows 版重新构建

```powershell
# 在源码目录构建
npm run build

# 更新 Windows 可执行程序的 www 目录
Remove-Item -Recurse -Force "..\02_Windows可执行程序\www"
Copy-Item -Recurse dist "..\02_Windows可执行程序\www"
```

## 演示说明

- 语音识别依赖浏览器 Web Speech API，推荐最新版 Edge 或 Chrome，并允许麦克风权限。
- 系统会根据人物自动选择浏览器中最接近的声线；不同电脑可用的系统语音可能不同。
- Linux 服务端语音使用 `espeak-ng`，音质与 Windows OneCore 有差异；浏览器 Web Speech API 作为通用备选。
- 天气、运营指标属于比赛演示数据/流程。
- **智能体对话**：配置 API Key 后可体验真实的 AI 对话能力；未配置时使用本地知识库模式。Windows 版同样支持。
- **打卡照片合成**：上传任意照片即可体验 AI 合成效果，完全本地处理，无需网络。Windows 版开箱即用。
- 景区演出时间可能临时调整，数字人统一提示以当日官方公告为准。

## 技术亮点

1. **智能体架构**：数字人对话从关键词匹配升级为智能体（Agent），支持语义理解、多轮对话、工具调用
2. **AI 照片合成**：Canvas 实现的打卡照片合成，融合用户照片与景区主题背景
3. **优雅降级**：智能体模式未配置时自动回退到本地知识库，保证演示流畅
4. **纯前端处理**：照片合成完全在浏览器端完成，无需后端服务，保护用户隐私
5. **可扩展设计**：智能体配置与 UI 解耦，可轻松接入不同的 LLM 平台
