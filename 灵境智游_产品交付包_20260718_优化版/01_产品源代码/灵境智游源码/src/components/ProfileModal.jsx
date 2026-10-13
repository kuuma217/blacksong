import { useEffect, useState } from "react";

const defaults = {
  companion: "朋友",
  age: "大学生",
  interests: ["历史文化"],
  time: "4",
  fitness: "正常步行",
  language: "中文",
  access: "暂无"
};

const companions = [["独自", "◌", "独自漫游"], ["朋友", "♢", "朋友同行"], ["亲子", "☺", "亲子家庭"], ["团队", "♧", "团队出游"]];
const ages = [["青少年", "青少年"], ["大学生", "大学生/年轻人"], ["中年", "中年"], ["银发", "银发游客"]];
const interests = [
  ["历史文化", "古", "历史文化", "典故、建筑与文化脉络"],
  ["摄影打卡", "景", "摄影打卡", "机位、光线与出片建议"],
  ["自然风光", "山", "自然风光", "湖光、园林与安静步道"],
  ["亲子研学", "学", "亲子研学", "趣味故事与互动任务"]
];

export default function ProfileModal({ open, onClose, onGenerate, initialProfile }) {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState(defaults);

  useEffect(() => {
    if (open) {
      setStep(1);
      if (initialProfile) {
        setProfile({ ...defaults, ...initialProfile, interests: [...initialProfile.interests] });
      }
    }
  }, [open, initialProfile]);

  if (!open) return null;

  const update = (field, value) => setProfile((current) => ({ ...current, [field]: value }));
  const toggleInterest = (interest) => setProfile((current) => {
    const selected = current.interests.includes(interest);
    const next = selected ? current.interests.filter((item) => item !== interest) : [...current.interests, interest];
    return { ...current, interests: next.length ? next : [interest] };
  });

  return (
    <div className="modal-backdrop open" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="modal profile-modal" role="dialog" aria-modal="true" aria-labelledby="profile-title">
        <button className="modal-close" onClick={onClose} aria-label="关闭">×</button>

        <div className={`modal-step ${step === 1 ? "active" : ""}`}>
          <span className="step-count">01 / 03</span><p className="eyebrow">让我先认识你</p><h2 id="profile-title">今天和谁一起探索灵山？</h2>
          <div className="choice-grid companion-grid">
            {companions.map(([value, icon, label]) => <button className={profile.companion === value ? "active" : ""} onClick={() => update("companion", value)} key={value}><span>{icon}</span>{label}</button>)}
          </div>
          <label className="field-label">你的年龄阶段</label>
          <div className="pill-options">{ages.map(([value, label]) => <button className={profile.age === value ? "active" : ""} onClick={() => update("age", value)} key={value}>{label}</button>)}</div>
          <button className="primary-button modal-next" onClick={() => setStep(2)}>下一步 <span>→</span></button>
        </div>

        <div className={`modal-step ${step === 2 ? "active" : ""}`}>
          <span className="step-count">02 / 03</span><p className="eyebrow">选择感兴趣的内容</p><h2>今天最想收获什么？</h2>
          <div className="interest-grid">
            {interests.map(([value, icon, label, detail]) => <button className={profile.interests.includes(value) ? "active" : ""} onClick={() => toggleInterest(value)} key={value}><span>{icon}</span><strong>{label}</strong><small>{detail}</small></button>)}
          </div>
          <div className="modal-actions"><button className="text-button" onClick={() => setStep(1)}>← 返回</button><button className="primary-button" onClick={() => setStep(3)}>下一步 <span>→</span></button></div>
        </div>

        <div className={`modal-step ${step === 3 ? "active" : ""}`}>
          <span className="step-count">03 / 03</span><p className="eyebrow">路线节奏</p><h2>把行程调到刚刚好</h2>
          <div className="form-grid">
            <label>可用时间<select value={profile.time} onChange={(e) => update("time", e.target.value)}><option value="2">2小时轻松游</option><option value="4">4小时经典游</option><option value="6">6小时深度游</option><option value="8">一日慢游</option></select></label>
            <label>体力状态<select value={profile.fitness} onChange={(e) => update("fitness", e.target.value)}><option>轻松优先</option><option>正常步行</option><option>活力充沛</option></select></label>
            <label>导览语言<select value={profile.language} onChange={(e) => update("language", e.target.value)}><option>中文</option><option>English</option><option>中英双语</option></select></label>
            <label>无障碍需求<select value={profile.access} onChange={(e) => update("access", e.target.value)}><option>暂无</option><option>轮椅友好</option><option>减少台阶</option><option>视听辅助</option></select></label>
          </div>
          <div className="weather-reminder"><span>☀</span><div><strong>今日29°C，晴到多云（演示）</strong><small>建议携带饮用水，优先安排室外景点后进入梵宫休息。</small></div></div>
          <div className="modal-actions"><button className="text-button" onClick={() => setStep(2)}>← 返回</button><button className="primary-button" onClick={() => onGenerate(profile)}>生成专属路线 <span>✦</span></button></div>
        </div>
      </section>
    </div>
  );
}
