import { useEffect, useMemo, useRef, useState } from "react";
import { guideList, guides } from "../data/guides.js";
import { resolveAnswer } from "../data/knowledge.js";
import { callAgent, isAgentAvailable, agentConfig, agentLabel } from "../data/agentConfig.js";
import { useSpeech } from "../hooks/useSpeech.js";
import SpecularButton from "./SpecularButton.jsx";

// 莲花图标路径：与 App.jsx 中「热门问题」卡片保持一致（内嵌模式下用于对话卡片标题）
const LOTUS_PATH =
  "M12 3.2c1.9 2.3 2.8 4.3 2.8 6 0 1-.3 1.9-.9 2.7 1.5-.6 3-.5 4.4.3 1.2.7 1.9 1.8 2.2 3.1-1.9.9-3.7 1.1-5.4.7-1.1-.3-2.1-.9-2.9-1.7.5 1.8.3 3.5-.6 5.1-.2.4-.4.7-.6.9h-1.1c-.2-.2-.4-.5-.6-.9-.9-1.6-1.1-3.3-.6-5.1-.8.8-1.8 1.4-2.9 1.7-1.7.4-3.5.2-5.4-.7.3-1.3 1-2.4 2.2-3.1 1.4-.8 2.9-.9 4.4-.3-.6-.8-.9-1.7-.9-2.7 0-1.7.9-3.7 2.8-6Z";

// variant: "default" 独立整页（左立绘 + 对话卡片 + 能力条）
//          "embed"   只渲染对话卡片，供 AI 数字人设计页就地叠放（页面内直接对话，不弹浮层）
export default function AssistantPanel({ guideKey, onGuideChange, route, language, notify, variant = "default" }) {
  const guide = guides[guideKey] || guides.lingruo;
  // 防御性兜底：父组件忘传 notify 时不崩溃（契约 2.3 要求 props 含 notify，但保险起见加一道）
  const safeNotify = typeof notify === "function" ? notify : () => {};
  const [messages, setMessages] = useState(() => [{ id: 1, role: "guide", text: guide.welcome, source: "欢迎语", emotion: guide.emotion }]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [latency, setLatency] = useState("预计响应 1.8秒");
  const [agentMode, setAgentMode] = useState(isAgentAvailable());
  const streamRef = useRef(null);
  const inputRef = useRef(null);
  // 保存最新的 ask，供外部事件回调调用，避免闭包拿到过期的状态
  const askRef = useRef(null);
  const { speaking, listening, speak, startListening } = useSpeech();

  useEffect(() => {
    streamRef.current?.scrollTo({ top: streamRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, thinking]);

  // 接收设计页热区投递的指令（App → 本面板，不改动 2.3 冻结的 props 契约）
  // detail: { question } 直接提问；detail: { focus: true } 只把光标聚焦到输入框
  useEffect(() => {
    const handleExternalAsk = (event) => {
      const { question, focus } = event.detail || {};
      if (question) askRef.current?.(question);
      if (focus) requestAnimationFrame(() => inputRef.current?.focus());
    };
    window.addEventListener("lingjing:ask", handleExternalAsk);
    return () => window.removeEventListener("lingjing:ask", handleExternalAsk);
  }, []);


  const switchGuide = (key) => {
    const nextGuide = guides[key];
    onGuideChange(key);
    setMessages((current) => [...current, {
      id: Date.now(), role: "guide", text: nextGuide.welcome, source: "角色问候", emotion: nextGuide.emotion
    }]);
    speak(nextGuide.welcome, nextGuide, language === "en");
  };

  const ask = async (raw) => {
    const question = (raw ?? input).trim();
    if (!question || thinking) return;
    setInput("");
    setMessages((current) => [...current, { id: Date.now(), role: "user", text: question }]);
    setThinking(true);
    const startedAt = performance.now();

    try {
      let result;

      if (agentMode) {
        // 使用智能体模式：调用大模型 API
        const conversationHistory = messages
          .filter(msg => msg.role !== "system")
          .slice(-10)
          .map(msg => ({
            role: msg.role === "user" ? "user" : "assistant",
            content: msg.text
          }));

        const agentResult = await callAgent(guideKey, question, conversationHistory);

        if (agentResult.fallback) {
          // 智能体不可用，回退到本地知识库
          safeNotify("智能体未配置，已切换到本地知识库模式", "info");
          setAgentMode(false);
          result = resolveAnswer(question, route);
        } else if (agentResult.needToolExecution) {
          // 智能体请求工具调用：当前前端未挂载工具执行器，
          // 退化到本地知识库并提示，避免对用户呈现原始 JSON
          safeNotify("该问题需要调用景区工具，正在用本地资料回答", "info");
          result = resolveAnswer(question, route);
        } else {
          result = {
            answer: agentResult.content,
            source: agentResult.source || "智谱 GLM 智能体",
            emotion: agentResult.emotion || guide.emotion
          };
        }
      } else {
        // 本地知识库模式（原有逻辑）
        // 模拟思考延迟
        await new Promise(resolve => setTimeout(resolve, 650 + Math.random() * 450));
        result = resolveAnswer(question, route);
      }

      setMessages((current) => [...current, {
        id: Date.now() + 1,
        role: "guide",
        text: result.answer,
        source: result.source,
        emotion: result.emotion
      }]);
      setThinking(false);
      setLatency(`本次响应 ${((performance.now() - startedAt) / 1000).toFixed(2)}秒`);
      speak(result.answer, guide, language === "en");

    } catch (error) {
      console.error("问答处理失败:", error);
      setThinking(false);
      setMessages((current) => [...current, {
        id: Date.now() + 1,
        role: "guide",
        text: "抱歉，遇到了临时问题，请稍后再试。",
        source: "系统提示",
        emotion: "😅"
      }]);
    }
  };
  askRef.current = ask;

  const listen = () => {
    const supported = startListening((text, done) => {
      setInput(text);
      if (done) ask(text);
    }, language === "en" ? "en-US" : "zh-CN");
    if (!supported) safeNotify("当前浏览器不支持语音识别，建议使用最新版 Edge 或 Chrome。", "warning");
  };

  // AI 问答界面统一中文：不再跟随语言切换返回英文提示词
  const quickPrompts = useMemo(
    () => ["灵山大佛有多高？", "推荐一条拍照路线", "九龙灌浴讲什么故事？", "今天天气怎么样？"],
    []
  );

  const embedded = variant === "embed";

  // 对话卡片本体：内嵌模式（AI 数字人页就地对话）与独立整页模式共用同一套逻辑与状态
  const chatCard = (
    <section className={`chat-card${embedded ? " chat-card-embed" : ""}`}>
      <header className="chat-header">
        {embedded ? (
          <div className="chat-title">
            <svg className="chat-title-lotus" viewBox="0 0 24 24" aria-hidden="true"><path d={LOTUS_PATH} /></svg>
            <div>
              <h2>AI数字人 · 智慧导览</h2>
              <p className="chat-subtitle">有问题，问{guide.name}，让旅途更简单</p>
            </div>
          </div>
        ) : (
          <div><span className="tiny-label">灵山问答</span><h2>想了解什么？尽管问我</h2></div>
        )}
        <div className="context-chips">
          {embedded && (
            <div className="embed-guide-picker" aria-label="切换数字人">
              {guideList.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  className={item.key === guideKey ? "active" : ""}
                  title={item.name}
                  aria-label={`切换数字人：${item.name}`}
                  onClick={() => switchGuide(item.key)}
                >
                  <img src={item.thumbnail || item.image} alt="" />
                </button>
              ))}
            </div>
          )}
          <button className="weather-chip" onClick={() => ask("今天天气怎么样？")}><span>☀</span><strong>29°C</strong><small>无锡</small></button>
          <span className={`model-chip ${agentMode ? "agent-mode" : ""}`}>
            {agentMode ? `🤖 ${agentLabel()}` : "📚 本地知识库"}
          </span>
        </div>
      </header>
      <div className="chat-stream" ref={streamRef} aria-live="polite">
        {messages.map((message) => (
          <div className={`message ${message.role === "user" ? "user-message" : "guide-message"}`} key={message.id}>
            <span className="message-avatar">{message.role === "user" ? "我" : guide.name.slice(0, 1)}</span>
            <div><p>{message.text}</p><div className="message-meta"><span>刚刚</span>{message.emotion && <span>{message.emotion} 情感同步</span>}{message.source && <span>来源：{message.source}</span>}</div></div>
          </div>
        ))}
        {thinking && <div className="message guide-message typing"><span className="message-avatar">{guide.name.slice(0, 1)}</span><div><p><i /><i /><i /></p></div></div>}
      </div>
      <div className="quick-prompts">
        {quickPrompts.map((prompt) => (
          <button key={prompt} onClick={() => ask(prompt)}>
            {embedded && <svg className="prompt-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4l1.6 4.4L18 10l-4.4 1.6L12 16l-1.6-4.4L6 10l4.4-1.6L12 4Z" /></svg>}
            {prompt}
          </button>
        ))}
      </div>
      <div className="chat-composer">
        <button className={`mic-button ${listening ? "listening" : ""}`} onClick={listen} aria-label="语音输入">
          <svg viewBox="0 0 24 24"><path d="M12 15a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v6a3 3 0 0 0 3 3Z" /><path d="M19 11a7 7 0 0 1-14 0M12 18v3M9 21h6" /></svg>
        </button>
        <textarea ref={inputRef} value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); ask(); } }} placeholder={listening ? "正在聆听…" : "输入问题，或点击麦克风和我说话…"} />
        <button className="send-button" onClick={() => ask()}>发送 <span>↑</span></button>
      </div>
      <div className="latency-line"><span><i /> {listening ? "正在识别语音" : "语音识别就绪"}</span><span>{latency}</span></div>
    </section>
  );

  // 内嵌模式：只交出对话卡片，由 AI 数字人设计页就地叠放
  if (embedded) return chatCard;

  return (
    <section className="visitor-panel active">
      <div className="guide-console wide-console">
        <aside className="avatar-stage">
          <div className="stage-topline">
            <span className="live-pill"><i /> 在线陪伴</span>
            <span className="soft-icon-button">
              {agentMode ? "🤖 智能体模式" : "React 数字人"}
            </span>
          </div>
          <div className={`avatar-orbit ${speaking ? "speaking" : ""}`}>
            <span className="orbit-line orbit-a" /><span className="orbit-line orbit-b" />
            <div className="emotion-bubble">{guide.emotion}</div>
            <img src={guide.image} alt={`数字人导游${guide.name}`} decoding="async" fetchPriority="high" />
            <div className="speech-wave"><i /><i /><i /><i /><i /></div>
          </div>
          <div className="guide-identity">
            <div><p>当前向导</p><h2>{guide.name}</h2><span>{guide.trait}</span></div>
            <button className="voice-preview" onClick={() => {
              const voiceName = speak(guide.preview, guide, guideKey === "wailing");
              safeNotify(`正在试听${guide.name}：${voiceName || guide.voiceLabel}`);
            }}>▶</button>
          </div>
          <div className="avatar-picker">
            {guideList.map((item) => (
              <SpecularButton key={item.key} size="sm" radius={12} tint={item.key === guideKey ? "#ffffff" : "#f7f5ee"} tintOpacity={item.key === guideKey ? 0.94 : 0.12} textColor={item.key === guideKey ? "#285f51" : "#6f817a"} lineColor="#ffffff" baseColor={item.key === guideKey ? "#8eb4a8" : "#c7d4cf"} intensity={1.1} shineSize={18} shineFade={46} thickness={0.9} proximity={150} className={`avatar-specular${item.key === guideKey ? " active" : ""}`} onClick={() => switchGuide(item.key)}>
                <img src={item.thumbnail || item.image} alt={item.name} loading="lazy" decoding="async" /><span>{item.name}</span>
              </SpecularButton>
            ))}
          </div>
        </aside>

        {chatCard}
      </div>
      <div className="capability-strip">
        <article><span>01</span><div><strong>多模态对话</strong><small>语音 · 文本 · 表情 · 口型反馈</small></div></article>
        <article><span>02</span><div><strong>{agentMode ? "智能体 RAG" : "可信知识库"}</strong><small>{agentMode ? "大模型 + 知识库 + 工具调用" : "仅基于灵山资料回答并标注来源"}</small></div></article>
        <article><span>03</span><div><strong>个性化陪伴</strong><small>按年龄、兴趣与体力调整讲解</small></div></article>
      </div>
    </section>
  );
}
