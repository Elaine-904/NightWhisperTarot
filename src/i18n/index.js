import en from "./en.json";
import zh from "./zh.json";
import ja from "./ja.json";
import ko from "./ko.json";
import fr from "./fr.json";
import hi from "./hi.json";

// 多语言包
export const LANGS = {
  en: { flag: "🇺🇸", name: "English", pack: en },
  zh: { flag: "🇨🇳", name: "中文", pack: zh },
  ja: { flag: "🇯🇵", name: "日本語", pack: ja },
  ko: { flag: "🇰🇷", name: "한국어", pack: ko },
  fr: { flag: "🇫🇷", name: "Français", pack: fr },
  hi: { flag: "🇮🇳", name: "हिंदी", pack: hi },
};

// 默认语言
export function getBrowserLang() {
  const nav = navigator.language.slice(0, 2).toLowerCase();
  return LANGS[nav] ? nav : "en";
}

// 翻译 Hook
export function useI18n(lang) {
  return (key) => {
    const pack = LANGS[lang]?.pack || LANGS.en.pack;
    const fallbackPack = LANGS.en.pack;

    // 先支持平铺写法（如 "home.title"），兼容已存在的翻译文件
    if (Object.prototype.hasOwnProperty.call(pack, key)) {
      return pack[key];
    }

    if (Object.prototype.hasOwnProperty.call(fallbackPack, key)) {
      return fallbackPack[key];
    }

    // 支持多层 key，如 "home.title"
    const levels = key.split(".");

    const pickValue = (target) => {
      let value = target;
      for (const lv of levels) {
        if (value == null) return null;
        value = value[lv];
      }
      return typeof value === "string" ? value : null;
    };

    const picked = pickValue(pack) ?? pickValue(fallbackPack);
    return picked || key; // fallback 显示 key
  };
}
