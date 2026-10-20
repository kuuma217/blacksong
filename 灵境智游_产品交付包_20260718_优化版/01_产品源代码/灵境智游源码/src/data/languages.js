// 界面语言清单：右上角语言选择器的唯一数据源。
// 目前「中文 / English」具备完整界面文案；后续要加语种，
// 只需在这里补一项并为该语种补齐界面文案，选择器本身无需改动。
export const languages = [
  { key: "zh", label: "中文" },
  { key: "en", label: "English" }
];

export const DEFAULT_LANGUAGE = "zh";

export const languageLabel = (key) =>
  languages.find((item) => item.key === key)?.label || languages[0].label;

// 规整外部传入的语种：只接受清单内的 key，其余回退默认语种
export const normalizeLanguage = (key) =>
  languages.some((item) => item.key === key) ? key : DEFAULT_LANGUAGE;
