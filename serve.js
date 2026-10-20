// 灵境智游 · 本地静态服务
// 用法：node serve.js  （或直接双击「启动本地网页.bat」）
// 作用：以 http 方式打开仓库内的网页（docs/ 为构建产物），避免 file:// 协议下 ES Module 被浏览器拦截。

const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const { URL } = require("node:url");

const ROOT = __dirname;
const START_PORT = Number(process.env.PORT || 5173);

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".wav": "audio/wav",
  ".mp3": "audio/mpeg",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
  ".md": "text/markdown; charset=utf-8"
};

function resolveFile(pathname) {
  const decoded = decodeURIComponent(pathname);
  const target = path.normalize(path.join(ROOT, decoded));
  if (!target.startsWith(ROOT)) return null; // 防目录穿越
  if (fs.existsSync(target) && fs.statSync(target).isDirectory()) {
    const index = path.join(target, "index.html");
    return fs.existsSync(index) ? index : null;
  }
  return fs.existsSync(target) ? target : null;
}

const server = http.createServer((req, res) => {
  const { pathname } = new URL(req.url, `http://${req.headers.host}`);
  let file = resolveFile(pathname === "/" ? "/index.html" : pathname);

  // 根路径未命中时回退到 docs 下的构建产物
  if (!file && pathname !== "/") file = resolveFile(path.join("/docs", pathname));

  if (!file) {
    res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
    res.end("<meta charset='utf-8'><h2>404 未找到</h2><p><a href='/docs/index.html'>进入演示页面</a></p>");
    return;
  }

  const ext = path.extname(file).toLowerCase();
  res.writeHead(200, {
    "Content-Type": MIME[ext] || "application/octet-stream",
    "Cache-Control": "no-cache"
  });
  fs.createReadStream(file).pipe(res);
});

function listen(port) {
  server.once("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.log(`端口 ${port} 被占用，尝试 ${port + 1} …`);
      listen(port + 1);
    } else {
      console.error(err);
      process.exit(1);
    }
  });
  server.listen(port, "127.0.0.1", () => {
    console.log("灵境智游本地服务已启动：");
    console.log(`  启动页  http://127.0.0.1:${port}/`);
    console.log(`  演示页  http://127.0.0.1:${port}/docs/index.html`);
    console.log("关闭窗口或按 Ctrl+C 停止服务。");
  });
}

listen(START_PORT);
