import { useRef, useState } from "react";
import { guideList } from "../data/guides.js";
import SpecularButton from "./SpecularButton.jsx";
import MagicBento from "./MagicBento.jsx";
import ChromaGrid from "./ChromaGrid.jsx";

const navItems = [
  ["overview", "▦", "数据总览"],
  ["insights", "◉", "游客洞察"],
  ["knowledge", "▤", "知识库管理"],
  ["avatars", "♙", "数字人管理"],
  ["settings", "⚙", "模型与系统"]
];

function Overview({ setTab, notify }) {
  const questions = [["灵山大佛有多高？", 426, 100], ["九龙灌浴几点开始？", 368, 86], ["适合老人的路线怎么走？", 311, 73], ["梵宫内可以拍照吗？", 274, 64], ["亲子游需要多长时间？", 239, 56]];
  return (
    <section className="admin-panel active">
      <div className="data-notice"><span>数据口径</span>实时指标为比赛演示数据；游客画像来自资料包中 522 条灵山相关历史样本，均已匿名化。</div>
      <MagicBento className="kpi-grid" glowColor="45, 118, 100" spotlightRadius={370} particleCount={12} enableTilt enableMagnetism clickEffect>
        <article><span className="kpi-icon green">人</span><div><small>今日服务人次</small><strong>1,286</strong><em>↑ 18.6%</em></div></article>
        <article><span className="kpi-icon gold">问</span><div><small>智能问答次数</small><strong>3,642</strong><em>↑ 24.2%</em></div></article>
        <article><span className="kpi-icon blue">秒</span><div><small>平均响应延迟</small><strong>1.84s</strong><em className="good">目标 &lt; 5s</em></div></article>
        <article><span className="kpi-icon rose">心</span><div><small>实时满意度</small><strong>91.6%</strong><em>↑ 3.8%</em></div></article>
      </MagicBento>
      <div className="dashboard-grid">
        <article className="chart-card service-chart-card">
          <div className="card-heading"><div><span className="tiny-label">服务趋势</span><h3>本周数字人服务人次</h3></div><span className="legend"><i />服务人次</span></div>
          <svg className="line-chart" viewBox="0 0 760 270" role="img" aria-label="本周服务人次折线图">
            <defs><linearGradient id="areaFillReact" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2d7664" stopOpacity=".28" /><stop offset="1" stopColor="#2d7664" stopOpacity="0" /></linearGradient></defs>
            <g className="grid-lines"><line x1="55" y1="30" x2="730" y2="30" /><line x1="55" y1="90" x2="730" y2="90" /><line x1="55" y1="150" x2="730" y2="150" /><line x1="55" y1="210" x2="730" y2="210" /></g>
            <path d="M55 193L165 170L275 180L385 123L495 142L605 74L715 48L715 225L55 225Z" fill="url(#areaFillReact)" />
            <path d="M55 193L165 170L275 180L385 123L495 142L605 74L715 48" fill="none" stroke="#2d7664" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            <g className="chart-dots">{[[55,193],[165,170],[275,180],[385,123],[495,142],[605,74],[715,48]].map(([x,y]) => <circle key={x} cx={x} cy={y} r={x === 715 ? 7 : 5} />)}</g>
            <g className="axis-labels">{["周一","周二","周三","周四","周五","周六","周日"].map((day,index) => <text key={day} x={55 + index * 110} y="252">{day}</text>)}</g>
          </svg>
        </article>
        <article className="chart-card sentiment-card">
          <div className="card-heading"><div><span className="tiny-label">情感分析</span><h3>游客感受度</h3></div><span className="period-chip">今日</span></div>
          <div className="sentiment-donut" aria-label="正向情感82.4%"><div><strong>82.4%</strong><small>正向情感</small></div></div>
          <div className="sentiment-legend"><span><i className="positive" />正向 82.4%</span><span><i className="neutral" />中性 13.8%</span><span><i className="negative" />负向 3.8%</span></div>
        </article>
        <article className="chart-card hot-questions">
          <div className="card-heading"><div><span className="tiny-label">知识需求</span><h3>热门问答 TOP 5</h3></div><button onClick={() => setTab("knowledge")}>查看知识库</button></div>
          <ol>{questions.map(([question, count, width], index) => <li key={question}><span>{index + 1}</span><p>{question}</p><strong>{count}</strong><i style={{ width: `${width}%` }} /></li>)}</ol>
        </article>
        <article className="chart-card action-card">
          <div className="card-heading"><div><span className="tiny-label">AI运营建议</span><h3>今日值得关注</h3></div><span className="ai-badge">AI</span></div>
          <div className="action-item warning"><span>!</span><div><strong>演出时间咨询上升 31%</strong><p>建议在九龙灌浴附近增加动态场次提醒。</p></div></div>
          <div className="action-item"><span>↗</span><div><strong>中老年游客停留时长偏长</strong><p>建议在梵宫至大佛沿线增加 2 处休息提示。</p></div></div>
          <div className="action-item"><span>☺</span><div><strong>外语问答满意度提升</strong><p>英文文化词条补充后，正向反馈提升 8.2%。</p></div></div>
          <button className="secondary-button admin-suggestion-button" onClick={() => notify("运营建议报告已生成（演示）", "success")}>生成完整报告</button>
        </article>
      </div>
    </section>
  );
}

function Insights() {
  return (
    <section className="admin-panel active">
      <MagicBento className="insight-summary" glowColor="45, 118, 100" spotlightRadius={370} particleCount={12} enableTilt enableMagnetism clickEffect>
        <div><span>历史样本</span><strong>522</strong><small>灵山相关匿名记录</small></div><div><span>平均停留</span><strong>4.02h</strong><small>行为数据均值</small></div><div><span>平均同行</span><strong>2.62人</strong><small>适合小团体服务</small></div><div><span>历史评分</span><strong>3.08/5</strong><small>存在体验提升空间</small></div>
      </MagicBento>
      <div className="insight-grid">
        <article className="chart-card age-profile"><div className="card-heading"><div><span className="tiny-label">资料包历史样本</span><h3>灵山游客年龄结构</h3></div></div><div className="bar-list">
          {[['18–29岁','29.3%',153],['30–44岁','42.3%',221],['45–59岁','20.9%',109],['60岁以上','7.5%',39]].map(([label,width,count]) => <div key={label}><span>{label}</span><i><b style={{width}} /></i><strong>{count}</strong></div>)}
        </div><p className="analysis-note">30–44岁是样本主体；产品仍应针对学生、亲子、银发团队与外籍游客分别优化讲解节奏。</p></article>
        <article className="chart-card interest-cloud"><div className="card-heading"><div><span className="tiny-label">交互语义聚类</span><h3>游客关注主题</h3></div></div><div className="word-cloud"><span className="xl">灵山大佛</span><span className="lg">演出时间</span><span>拍照机位</span><span className="md">亲子研学</span><span>无障碍</span><span className="lg">佛教文化</span><span>素斋</span><span className="md">九龙灌浴</span><span>天气</span><span className="md">梵宫艺术</span></div></article>
        <article className="chart-card feedback-list"><div className="card-heading"><div><span className="tiny-label">文本 + 表情情感分析</span><h3>近期反馈摘要</h3></div><span className="period-chip">已脱敏</span></div>
          <div className="feedback"><span className="face happy">☺</span><div><strong>“数字人讲得很清楚，孩子愿意听。”</strong><small>亲子家庭 · 正向 · 2分钟前</small></div><em>0.94</em></div>
          <div className="feedback"><span className="face neutral">—</span><div><strong>“大佛附近定位有一点漂移。”</strong><small>大学生 · 中性 · 18分钟前</small></div><em>0.71</em></div>
          <div className="feedback"><span className="face happy">☺</span><div><strong>“English explanation was warm and clear.”</strong><small>外籍游客 · 正向 · 34分钟前</small></div><em>0.91</em></div>
        </article>
      </div>
    </section>
  );
}

function Knowledge({ notify }) {
  const fileRef = useRef(null);
  const [documents, setDocuments] = useState([
    ["W", "doc", "灵山胜境 景点结构化数据集.docx", "186", "今天 13:49", "可用"],
    ["W", "doc", "历史文化与个性化游览指南.docx", "274", "今天 13:49", "可用"],
    ["X", "xls", "景点景区旅游数据行为分析数据.xlsx", "140,447条", "今天 13:49", "画像数据"]
  ]);

  const upload = (files) => {
    const file = files?.[0];
    if (!file) return;
    setDocuments((current) => [[file.name.endsWith("xlsx") ? "X" : "W", file.name.endsWith("xlsx") ? "xls" : "doc", file.name, "处理中", "刚刚", "向量化中"], ...current]);
    notify(`${file.name} 已上传，正在切分并写入本地知识库`, "success");
  };

  return (
    <section className="admin-panel active"><div className="knowledge-layout"><div className="knowledge-main">
      <div className="section-heading"><div><p className="eyebrow">本地景区 RAG 知识库</p><h2>知识文档</h2></div><button className="primary-button compact" onClick={() => fileRef.current?.click()}>＋ 上传文档</button></div>
      <input ref={fileRef} type="file" accept=".doc,.docx,.pdf,.txt,.xlsx" hidden onChange={(event) => upload(event.target.files)} />
      <div className="drop-zone cursor-target" role="button" tabIndex={0} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") fileRef.current?.click(); }} onClick={() => fileRef.current?.click()} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); upload(event.dataTransfer.files); }}><span>⇧</span><div><strong>拖入文档即可更新知识库</strong><small>支持 DOCX、PDF、TXT、XLSX；上传后自动切分、向量化与质量检查</small></div></div>
      <div className="document-table"><div className="doc-row header"><span>文档</span><span>知识片段</span><span>更新时间</span><span>状态</span><span /></div>{documents.map(([icon,type,name,parts,time,status]) => <div className="doc-row" key={name}><span><i className={`file-icon ${type}`}>{icon}</i><b>{name}</b></span><span>{parts}</span><span>{time}</span><span className={`status ${status === "画像数据" ? "profile" : "ready"}`}>{status}</span><button onClick={() => notify(`${name}：版本、权限与召回质量均可在正式版编辑`)}>•••</button></div>)}</div>
    </div><aside className="knowledge-health"><span className="tiny-label">知识库健康度</span><div className="health-score"><strong>93</strong><span>/100</span></div><ul><li><span>事实问题覆盖</span><strong>96%</strong></li><li><span>来源可追溯率</span><strong>100%</strong></li><li><span>问答自测命中</span><strong>94.2%</strong></li><li><span>待复核冲突</span><strong className="warn">2处</strong></li></ul><p>演出时间存在资料版本差异，回答时统一提示“以当日公告为准”。</p></aside></div></section>
  );
}

function Avatars({ notify }) {
  const [enabled, setEnabled] = useState(() => Object.fromEntries(guideList.map((guide) => [guide.key, true])));
  const items = guideList.map((guide, index) => ({
    key: guide.key,
    image: guide.image,
    title: guide.name,
    subtitle: guide.trait,
    handle: guide.voiceLabel,
    meta: `语速 ${guide.rate.toFixed(2)} · 音调 ${guide.pitch.toFixed(2)}`,
    status: enabled[guide.key] ? "启用中" : "已停用",
    action: enabled[guide.key] ? "停用" : "启用",
    borderColor: ["#4f9b87", "#c79a4b", "#527f74", "#8da59d", "#4d8b99"][index],
    gradient: `linear-gradient(155deg, ${["#dcece6", "#f1e7cf", "#d9e7df", "#e7e7dc", "#dce9ec"][index]}, #173f36)`
  }));
  const toggleGuide = (item) => {
    setEnabled((current) => ({ ...current, [item.key]: !current[item.key] }));
    notify(`${item.title}已${enabled[item.key] ? "停用" : "启用"}`);
  };
  return (
    <section className="admin-panel active"><div className="section-heading"><div><p className="eyebrow">文化形象资产</p><h2>数字人形象与声音</h2></div><button className="primary-button compact" onClick={() => notify("可在正式版上传 GLB/VRM 模型、服装贴图和专属音色")}>＋ 新增形象</button></div>
      <ChromaGrid items={items} className="avatar-admin-grid" radius={240} columns={3} damping={0.35} fadeOut={0.5} onAction={toggleGuide} />
    </section>
  );
}

function Settings({ notify }) {
  const [rag, setRag] = useState(true);
  const [speech, setSpeech] = useState(true);
  return <section className="admin-panel active"><div className="settings-grid">
    <article className="setting-card featured"><div className="setting-icon">AI</div><div><span className="tiny-label">核心多模态模型</span><h3>智谱 GLM 多模态大模型</h3><p>负责图像理解、拍照打卡识别、跨模态语义与情感线索融合。演示版运行本地知识模式，配置 API 后可切换在线推理。</p><div className="setting-tags"><span>视觉理解</span><span>中文优化</span><span>免费额度</span></div></div><button onClick={() => notify("请在 .env.local 中填写模型地址和密钥；演示版不会上传密钥")}>配置连接</button></article>
    <article className="setting-card"><div className="setting-icon">RAG</div><div><span className="tiny-label">知识增强</span><h3>本地向量知识库</h3><p>文档切分、关键词召回与来源约束，降低景区事实问题幻觉。</p></div><button className={`toggle ${rag ? "on" : ""}`} onClick={() => setRag(!rag)} aria-label="切换知识库"><i /></button></article>
    <article className="setting-card"><div className="setting-icon">ASR</div><div><span className="tiny-label">语音交互</span><h3>浏览器语音识别与合成</h3><p>免费优先方案，按人物切换童声、女声、男声、长者声与英文男声。</p></div><button className={`toggle ${speech ? "on" : ""}`} onClick={() => setSpeech(!speech)} aria-label="切换语音"><i /></button></article>
    <article className="setting-card"><div className="setting-icon">SLA</div><div><span className="tiny-label">性能监控</span><h3>响应延迟与稳定性</h3><p>最近24小时可用率 99.96%，P95 问答延迟 3.42 秒。</p></div><span className="status ready">正常</span></article>
  </div></section>;
}

export default function AdminDashboard({ onLogout, notify }) {
  const [tab, setTab] = useState("overview");
  const currentLabel = navItems.find(([key]) => key === tab)?.[2];
  return (
    <section className="view admin-shell active">
      <aside className="admin-sidebar"><div className="admin-title"><span className="brand-mark small">灵</span><div><strong>灵境智游</strong><small>景区运营中心</small></div></div>
        <nav>{navItems.map(([key, icon, label]) => {
          const active = tab === key;
          return <SpecularButton
            key={key}
            size="sm"
            radius={12}
            tint={active ? "#285f51" : "#fdfcf7"}
            tintOpacity={active ? 1 : 0.12}
            textColor={active ? "#ffffff" : "#677a73"}
            lineColor={active ? "#fff4c7" : "#ffffff"}
            baseColor={active ? "#163d34" : "#b9c9c3"}
            intensity={active ? 1.35 : 0.9}
            shineSize={16}
            shineFade={42}
            thickness={1}
            proximity={190}
            className={`admin-nav-specular${active ? " active" : ""}`}
            onClick={() => setTab(key)}
          ><span className="admin-nav-icon">{icon}</span>{label}</SpecularButton>;
        })}</nav>
        <div className="admin-user"><span>管</span><div><strong>演示管理员</strong><small>超级管理员</small></div><button onClick={onLogout}>退出</button></div>
      </aside>
      <div className="admin-main"><header className="admin-header"><div><p>灵山胜境 · 运营工作台</p><h1>{currentLabel}</h1></div><div className="admin-actions"><span className="system-status"><i />系统运行正常</span><button onClick={() => notify("运营数据已刷新", "success")}>刷新数据</button></div></header>
        {tab === "overview" && <Overview setTab={setTab} notify={notify} />}
        {tab === "insights" && <Insights />}
        {tab === "knowledge" && <Knowledge notify={notify} />}
        {tab === "avatars" && <Avatars notify={notify} />}
        {tab === "settings" && <Settings notify={notify} />}
      </div>
    </section>
  );
}
