import { useEffect, useMemo, useRef, useState } from "react";
import { guideList, guides } from "../data/guides.js";
import { resolveAnswer } from "../data/knowledge.js";
import { callAgent, isAgentAvailable, agentConfig } from "../data/agentConfig.js";
import { useSpeech } from "../hooks/useSpeech.js";
import SpecularButton from "./SpecularButton.jsx";

const initialMessage = {
  id: 1,
  role: "guide",
  text: guides.lingruo.welcome,
  source: "欢迎语",
  emotion: "😊"
};

export default function AssistantPanel({ guideKey, onGuideChange, route, language, notify, presetQuestion }) {
  const guide = guides[guideKey];
  const [messages, setMessages] = useState([initialMessage]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [latency, setLatency] = useState("预计响应 1.8秒");
  const [agentMode, setAgentMode] = useState(isAgentAvailable());
  const streamRef = useRef(null);
  const { speaking, listening, speak, startListening } = useSpeech();

  useEffect(() => {
    streamRef.current?.scrollTo({ top: streamRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, thinking]);

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
          notify("智能体未配置，已切换到本地知识库模式", "info");
          setAgentMode(false);
          result = resolveAnswer(question, route, language);
        } else {
          result = {
            answer: agentResult.content,
            source: agentResult.source || "Qwen 智能体",
            emotion: agentResult.emotion || guide.emotion
          };
        }
      } else {
        // 本地知识库模式（原有逻辑）
        // 模拟思考延迟
        await new Promise(resolve => setTimeout(resolve, 650 + Math.random() * 450));
        result = resolveAnswer(question, route, language);
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
        text: language === "en"
          ? "Sorry, I encountered a temporary issue. Please try again."
          : "抱歉，遇到了临时问题，请稍后再试。",
        source: "系统提示",
        emotion: "😅"
      }]);
    }
  };

  const listen = () => {
    const supported = startListening((text, done) => {
      setInput(text);
      if (done) ask(text);
    }, language === "en" ? "en-US" : "zh-CN");
    if (!supported) notify("当前浏览器不支持语音识别，建议使用最新版 Edge 或 Chrome。", "warning");
  };

  // 从景区导览等页面带过来的预设问题：seq 变化即代为提问
  const presetSeq = presetQuestion?.seq;
  useEffect(() => {
    if (!presetQuestion?.text) return;
    ask(presetQuestion.text);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [presetSeq]);

  const quickPrompts = useMemo(() => language === "en"
    ? ["How tall is the Grand Buddha?", "Recommend a photo route", "What is Nine Dragons Bathing?", "What is the weather?"]
    : ["灵山大佛有多高？", "推荐一条拍照路线", "九龙灌浴讲什么故事？", "今天天气怎么样？"], [language]);

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
              notify(`正在试听${guide.name}：${voiceName || guide.voiceLabel}`);
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

        <section className="chat-card">
          <header className="chat-header">
            <div><span className="tiny-label">灵山问答</span><h2>{language === "en" ? "What would you like to know?" : "想了解什么？尽管问我"}</h2></div>
            <div className="context-chips">
              <button className="weather-chip" onClick={() => ask("今天天气怎么样？")}><span>☀</span><strong>29°C</strong><small>无锡</small></button>
              <span className={`model-chip ${agentMode ? "agent-mode" : ""}`}>
                {agentMode ? "🤖 Qwen 智能体" : "📚 本地知识库"}
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
          <div className="quick-prompts">{quickPrompts.map((prompt) => <button key={prompt} onClick={() => ask(prompt)}>{prompt}</button>)}</div>
          <div className="chat-composer">
            <button className={`mic-button ${listening ? "listening" : ""}`} onClick={listen} aria-label="语音输入">
              <svg viewBox="0 0 24 24"><path d="M12 15a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v6a3 3 0 0 0 3 3Z" /><path d="M19 11a7 7 0 0 1-14 0M12 18v3M9 21h6" /></svg>
            </button>
            <textarea value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); ask(); } }} placeholder={listening ? "正在聆听…" : "输入问题，或点击麦克风和我说话…"} />
            <button className="send-button" onClick={() => ask()}>发送 <span>↑</span></button>
          </div>
          <div className="latency-line"><span><i /> {listening ? "正在识别语音" : "语音识别就绪"}</span><span>{latency}</span></div>
        </section>
      </div>
      <div className="capability-strip">
        <article><span>01</span><div><strong>多模态对话</strong><small>语音 · 文本 · 表情 · 口型反馈</small></div></article>
        <article><span>02</span><div><strong>{agentMode ? "智能体 RAG" : "可信知识库"}</strong><small>{agentMode ? "大模型 + 知识库 + 工具调用" : "仅基于灵山资料回答并标注来源"}</small></div></article>
        <article><span>03</span><div><strong>个性化陪伴</strong><small>按年龄、兴趣与体力调整讲解</small></div></article>
      </div>
    </section>
  );
}
