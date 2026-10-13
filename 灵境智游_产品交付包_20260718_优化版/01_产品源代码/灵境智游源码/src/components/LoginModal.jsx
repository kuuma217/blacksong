import { useEffect, useState } from "react";
import SpecularButton from "./SpecularButton.jsx";

export default function LoginModal({ open, onClose, onLogin, notify }) {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("lingjing2026");

  useEffect(() => {
    if (open) {
      setUsername("admin");
      setPassword("lingjing2026");
    }
  }, [open]);

  if (!open) return null;

  const submit = (event) => {
    event.preventDefault();
    if (username === "admin" && password === "lingjing2026") onLogin();
    else notify("账号或密码不正确，请使用演示账号登录", "warning");
  };

  return (
    <div className="modal-backdrop open" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <form className="modal login-modal" role="dialog" aria-modal="true" onSubmit={submit}>
        <button type="button" className="modal-close" onClick={onClose} aria-label="关闭">×</button>
        <span className="brand-mark login-mark">灵</span><p className="eyebrow">景区管理方入口</p><h2>登录灵境运营中心</h2><p>查看游客洞察、维护知识库与数字人形象。</p>
        <label>管理员账号<input value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" /></label>
        <label>密码<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" /></label>
        <div className="demo-account"><span>演示账号</span><code>admin / lingjing2026</code></div>
        <SpecularButton
          type="submit"
          className="primary-button specular-cta login-specular"
          radius={15}
          tint="#315f53"
          tintOpacity={0.96}
          textColor="#ffffff"
          lineColor="#fff4c7"
          baseColor="#183f36"
          intensity={1.35}
          shineSize={14}
          shineFade={36}
          thickness={1.2}
          proximity={280}
        >
          安全登录 <span>→</span>
        </SpecularButton>
        <small className="privacy-note">游客数据默认匿名化，敏感信息仅授权管理员可见。</small>
      </form>
    </div>
  );
}
