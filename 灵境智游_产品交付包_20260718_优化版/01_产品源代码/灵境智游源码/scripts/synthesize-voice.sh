#!/usr/bin/env bash
# Linux/macOS 语音合成脚本 — 使用 espeak-ng
# 参数与 synthesize-voice.ps1 对齐，供 vite.config.js /api/tts 调用

set -euo pipefail

# ---- 参数解析 ----
RATE="1.0"
PITCH="1.0"
VOLUME="0.95"
TEXT_BASE64=""
OUTPUT=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --voice)    shift ;;  # Linux 根据语言选择声线，忽略 Windows 声线名
    --rate)     RATE="$2";     shift 2 ;;
    --pitch)    PITCH="$2";    shift 2 ;;
    --volume)   VOLUME="$2";   shift 2 ;;
    --text-b64) TEXT_BASE64="$2"; shift 2 ;;
    --output)   OUTPUT="$2";   shift 2 ;;
    *)          shift ;;
  esac
done

if [[ -z "${TEXT_BASE64}" || -z "${OUTPUT}" ]]; then
  echo "Missing required arguments: --text-b64 and --output" >&2
  exit 1
fi

if ! command -v espeak-ng &> /dev/null; then
  echo "espeak-ng is not installed." >&2
  echo "Install with: sudo apt install espeak-ng  (Debian/Ubuntu)" >&2
  echo "              sudo dnf install espeak-ng  (Fedora/RHEL)" >&2
  echo "              brew install espeak-ng      (macOS)" >&2
  exit 1
fi

# ---- 解码文本 ----
TEXT="$(printf '%s' "${TEXT_BASE64}" | base64 -d 2>/dev/null || printf '%s' "${TEXT_BASE64}" | base64 --decode)"
TEXT="$(printf '%s' "${TEXT}" | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')"

if [[ -z "${TEXT}" ]]; then
  echo "Speech text is empty." >&2
  exit 1
fi

# ---- 参数映射 ----
# OneCore rate ≈ 0.76-1.1  →  espeak-ng words-per-minute
#   中文基准 ≈ 155 wpm，英文基准 ≈ 175 wpm
# OneCore pitch 0.8-1.14 → espeak-ng 0-99（50 = 正常）
# OneCore volume 0-1      → espeak-ng 0-100

WPM=$(awk -v r="${RATE}" 'BEGIN { v = int(155 * r + 0.5); if (v < 80) v = 80; if (v > 400) v = 400; print v }')
PITCH_VAL=$(awk -v p="${PITCH}" 'BEGIN { v = int(p * 50 + 0.5); if (v < 1) v = 1; if (v > 99) v = 99; print v }')
AMP=$(awk -v v="${VOLUME}" 'BEGIN { a = int(v * 100 + 0.5); if (a < 10) a = 10; if (a > 100) a = 100; print a }')

# 自动识别语言（检测是否包含中文字符）
if printf '%s' "${TEXT}" | grep -qP '[\p{Han}]' 2>/dev/null; then
  LANG_CODE="zh"
else
  LANG_CODE="en"
fi

# ---- 合成 ----
espeak-ng -v "${LANG_CODE}" -s "${WPM}" -p "${PITCH_VAL}" -a "${AMP}" -w "${OUTPUT}" "${TEXT}"
