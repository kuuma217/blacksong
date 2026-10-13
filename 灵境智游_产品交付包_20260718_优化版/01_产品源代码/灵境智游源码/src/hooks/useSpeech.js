import { useCallback, useEffect, useRef, useState } from "react";

const normalizeName = (value = "") => value.toLowerCase().replace(/[\s_-]/g, "");

const naturalVoiceHints = ["natural", "neural", "online"];

const prepareSpeechText = (text, guide) => {
  const normalized = text
    .replace(/\s+/g, " ")
    .replace(/([。！？!?；;])/g, "$1 ")
    .trim();

  if (guide.key === "dongling") return normalized.replace(/，/g, "， ");
  return normalized;
};

export function useSpeech() {
  const [voices, setVoices] = useState([]);
  const [speaking, setSpeaking] = useState(false);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);
  const speakingIdRef = useRef(0);
  const audioRef = useRef(null);
  const audioUrlRef = useRef(null);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!("speechSynthesis" in window)) return undefined;
    const refresh = () => setVoices(window.speechSynthesis.getVoices());
    refresh();
    window.speechSynthesis.addEventListener("voiceschanged", refresh);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", refresh);
  }, []);

  useEffect(() => () => {
    speakingIdRef.current += 1;
    stopAudio();
    window.speechSynthesis?.cancel?.();
  }, [stopAudio]);

  const selectVoice = useCallback((guide, language) => {
    const availableVoices = voices.length ? voices : window.speechSynthesis?.getVoices?.() || [];
    if (!availableVoices.length) {
      console.warn("没有可用的语音，请等待 voiceschanged 事件");
      return null;
    }
    const english = language.startsWith("en");
    const localized = availableVoices.filter((voice) =>
      english ? voice.lang.toLowerCase().startsWith("en") : voice.lang.toLowerCase().startsWith("zh")
    );
    const pool = localized.length ? localized : availableVoices;
    const hints = (english ? guide.voiceHintsEn : guide.voiceHintsZh).map(normalizeName);

    const ranked = pool.map((voice) => {
      const name = normalizeName(voice.name);
      const hintIndex = hints.findIndex((hint) => name.includes(hint));
      const naturalBonus = naturalVoiceHints.some((hint) => name.includes(hint)) ? 18 : 0;
      const localeBonus = voice.lang.toLowerCase() === language.toLowerCase() ? 12 : 0;
      const hintScore = hintIndex >= 0 ? 120 - hintIndex * 12 : 0;
      return { voice, score: hintScore + naturalBonus + localeBonus };
    }).sort((a, b) => b.score - a.score || a.voice.name.localeCompare(b.voice.name));

    return ranked[0]?.voice || null;
  }, [voices]);

  const speakWithBrowser = useCallback((text, guide, language, speakingId) => {
    if (!("speechSynthesis" in window)) {
      if (speakingIdRef.current === speakingId) setSpeaking(false);
      return null;
    }
    const utterance = new SpeechSynthesisUtterance(prepareSpeechText(text, guide));
    utterance.lang = language;
    utterance.rate = Math.min(1.08, Math.max(0.8, guide.rate));
    utterance.pitch = Math.min(1.18, Math.max(0.85, guide.pitch));
    utterance.volume = Math.min(1, Math.max(0.75, guide.volume ?? 0.95));
    const voice = selectVoice(guide, utterance.lang);
    if (voice) utterance.voice = voice;
    utterance.onstart = () => {
      if (speakingIdRef.current === speakingId) setSpeaking(true);
    };
    utterance.onend = () => {
      if (speakingIdRef.current === speakingId) setSpeaking(false);
    };
    utterance.onerror = () => {
      if (speakingIdRef.current === speakingId) setSpeaking(false);
    };
    window.speechSynthesis.speak(utterance);
    return voice?.name || guide.voiceLabel;
  }, [selectVoice]);

  const speak = useCallback((text, guide, forceEnglish = false) => {
    if (!text?.trim()) return null;
    const language = forceEnglish || /[a-z]{6,}/i.test(text) ? "en-US" : "zh-CN";
    const preparedText = prepareSpeechText(text, guide);
    const speakingId = speakingIdRef.current + 1;
    speakingIdRef.current = speakingId;
    window.speechSynthesis?.cancel?.();
    stopAudio();
    setSpeaking(true);

    // 直接使用浏览器语音合成（服务端 TTS 需要额外安装 espeak-ng）
    // 这样更可靠，避免服务端依赖
    const voiceName = speakWithBrowser(preparedText, guide, language, speakingId);

    return voiceName || `${guide.voiceLabel} · 浏览器语音`;
  }, [speakWithBrowser, stopAudio]);

  const startListening = useCallback((onResult, language = "zh-CN") => {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) return false;
    recognitionRef.current?.abort?.();
    const recognition = new Recognition();
    recognition.lang = language;
    recognition.continuous = false;
    recognition.interimResults = true;
    let finalText = "";
    recognition.onstart = () => setListening(true);
    recognition.onresult = (event) => {
      let interim = "";
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const text = event.results[index][0].transcript;
        if (event.results[index].isFinal) finalText += text;
        else interim += text;
      }
      onResult(finalText || interim, false);
    };
    recognition.onend = () => {
      setListening(false);
      if (finalText.trim()) onResult(finalText, true);
    };
    recognition.onerror = () => setListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    return true;
  }, []);

  return { speaking, listening, speak, startListening };
}
