import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { platform } from "node:process";
import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { readFile, unlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const isWindows = platform === "win32";
const speechScript = fileURLToPath(new URL(
  isWindows ? "./scripts/synthesize-voice.ps1" : "./scripts/synthesize-voice.sh",
  import.meta.url
));

const voiceProfiles = {
  xiaoling: {
    zh: { voice: "Microsoft Yaoyao", rate: 1.1, pitch: 1.08, volume: 0.96 },
    en: { voice: "Microsoft Zira", rate: 1.06, pitch: 1.06, volume: 0.96 }
  },
  lingruo: {
    zh: { voice: "Microsoft Huihui", rate: 0.93, pitch: 1.01, volume: 0.94 },
    en: { voice: "Microsoft Zira", rate: 0.92, pitch: 1.0, volume: 0.94 }
  },
  xingyuan: {
    zh: { voice: "Microsoft Kangkang", rate: 0.9, pitch: 0.94, volume: 0.96 },
    en: { voice: "Microsoft David", rate: 0.9, pitch: 0.94, volume: 0.96 }
  },
  dongling: {
    zh: { voice: "Microsoft Kangkang", rate: 0.76, pitch: 0.8, volume: 0.92 },
    en: { voice: "Microsoft David", rate: 0.78, pitch: 0.84, volume: 0.92 }
  },
  wailing: {
    zh: { voice: "Microsoft Kangkang", rate: 0.98, pitch: 1.0, volume: 0.96 },
    en: { voice: "Microsoft Mark", rate: 0.96, pitch: 0.98, volume: 0.96 }
  }
};

const readRequestBody = (request) => new Promise((resolve, reject) => {
  const chunks = [];
  let size = 0;
  request.on("data", (chunk) => {
    size += chunk.length;
    if (size > 16 * 1024) {
      reject(new Error("Speech request is too large."));
      request.destroy();
      return;
    }
    chunks.push(chunk);
  });
  request.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
  request.on("error", reject);
});

const synthesizeWindows = ({ text, profile }) => new Promise((resolve, reject) => {
  const output = join(tmpdir(), `lingjing-voice-${randomUUID()}.wav`);
  const encodedText = Buffer.from(text, "utf8").toString("base64");
  const args = [
    "-NoLogo",
    "-NoProfile",
    "-NonInteractive",
    "-ExecutionPolicy", "Bypass",
    "-File", speechScript,
    "-Voice", profile.voice,
    "-Rate", String(profile.rate),
    "-Pitch", String(profile.pitch),
    "-Volume", String(profile.volume),
    "-TextBase64", encodedText,
    "-Output", output
  ];
  const child = spawn("powershell.exe", args, {
    windowsHide: true,
    stdio: ["ignore", "ignore", "pipe"]
  });
  let errorOutput = "";
  child.stderr.on("data", (chunk) => {
    if (errorOutput.length < 4000) errorOutput += chunk.toString();
  });
  const timeout = setTimeout(() => child.kill(), 20000);

  child.on("error", reject);
  child.on("close", async (code) => {
    clearTimeout(timeout);
    try {
      if (code !== 0) throw new Error(errorOutput.trim() || `Speech process exited with code ${code}.`);
      const audio = await readFile(output);
      if (audio.length <= 46) throw new Error("Speech engine returned empty audio.");
      resolve(audio);
    } catch (error) {
      reject(error);
    } finally {
      await unlink(output).catch(() => {});
    }
  });
});


const synthesizeLinux = ({ text, profile }) => new Promise((resolve, reject) => {
  const output = join(tmpdir(), `lingjing-voice-${randomUUID()}.wav`);
  const encodedText = Buffer.from(text, "utf8").toString("base64");
  const voice = profile.voice || "default";
  const args = [
    "--voice", voice,
    "--rate", String(profile.rate),
    "--pitch", String(profile.pitch),
    "--volume", String(profile.volume),
    "--text-b64", encodedText,
    "--output", output
  ];
  const child = spawn("bash", args, {
    windowsHide: false,
    stdio: ["ignore", "ignore", "pipe"]
  });
  let errorOutput = "";
  child.stderr.on("data", (chunk) => {
    if (errorOutput.length < 4000) errorOutput += chunk.toString();
  });
  const timeout = setTimeout(() => child.kill(), 20000);

  child.on("error", reject);
  child.on("close", async (code) => {
    clearTimeout(timeout);
    try {
      if (code !== 0) throw new Error(errorOutput.trim() || `Speech process exited with code ${code}.`);
      const audio = await readFile(output);
      if (audio.length <= 46) throw new Error("Speech engine returned empty audio.");
      resolve(audio);
    } catch (error) {
      reject(error);
    } finally {
      await unlink(output).catch(() => {});
    }
  });
});

const synthesize = isWindows ? synthesizeWindows : synthesizeLinux;

const speechPlugin = () => {
  const cache = new Map();
  const middleware = async (request, response) => {
    if (request.method !== "POST") {
      response.statusCode = 405;
      response.end("Method Not Allowed");
      return;
    }

    try {
      const body = JSON.parse(await readRequestBody(request));
      const text = String(body.text || "").trim().slice(0, 900);
      const guideKey = String(body.guideKey || "");
      const languageKey = body.language === "en-US" ? "en" : "zh";
      const profile = voiceProfiles[guideKey]?.[languageKey];
      if (!text || !profile) throw new Error("Invalid speech request.");

      const cacheKey = `${guideKey}:${languageKey}:${text}`;
      let audio = cache.get(cacheKey);
      if (!audio) {
        audio = await synthesize({ text, profile });
        cache.set(cacheKey, audio);
        if (cache.size > 60) cache.delete(cache.keys().next().value);
      }

      response.statusCode = 200;
      response.setHeader("Content-Type", "audio/wav");
      response.setHeader("Content-Length", audio.length);
      response.setHeader("Cache-Control", "private, max-age=3600");
      response.end(audio);
    } catch (error) {
      response.statusCode = 503;
      response.setHeader("Content-Type", "application/json; charset=utf-8");
      response.end(JSON.stringify({ error: error.message }));
    }
  };

  return {
    name: "lingjing-speech",
    configureServer(server) {
      server.middlewares.use("/api/tts", middleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use("/api/tts", middleware);
    }
  };
};

export default defineConfig({
  plugins: [react(), speechPlugin()],
  server: {
    host: "127.0.0.1",
    port: 5173,
    open: true
  },
  preview: {
    host: "127.0.0.1",
    port: 4173
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("react-dom") || id.includes("react/")) return "vendor-react";
            if (id.includes("ogl")) return "vendor-ogl";
            if (id.includes("gsap")) return "vendor-gsap";
          }
        }
      }
    },
    chunkSizeWarningLimit: 500
  }
});
