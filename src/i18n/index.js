import { useMemo } from "react";
import en from "./en.json";
import zh from "./zh.json";
import ja from "./ja.json";
import ko from "./ko.json";
import hi from "./hi.json";

// 多语言包
export const LANGS = {
  en: { flag: "🇺🇸", name: "English", pack: en },
  zh: { flag: "🇨🇳", name: "中文", pack: zh },
  ja: { flag: "🇯🇵", name: "日本語", pack: ja },
  ko: { flag: "🇰🇷", name: "한국어", pack: ko },
  hi: { flag: "🇮🇳", name: "हिंदी", pack: hi },
};

function formatTemplate(value, vars = {}) {
  if (typeof value !== "string" || !vars) return value;
  return value.replace(/\{(\w+)\}/g, (_, key) => {
    const replacement = vars[key];
    if (replacement === null || replacement === undefined) return "";
    return String(replacement);
  });
}

// 默认语言
export function getBrowserLang() {
  const nav = navigator.language.slice(0, 2).toLowerCase();
  return LANGS[nav] ? nav : "en";
}

// 翻译 Hook
export function useI18n(lang) {
  return useMemo(() => {
    return (key, vars) => {
      const pack = LANGS[lang]?.pack || LANGS.en.pack;
      const fallbackPack = LANGS.en.pack;

      if (Object.prototype.hasOwnProperty.call(pack, key)) {
        return formatTemplate(pack[key], vars);
      }

      if (Object.prototype.hasOwnProperty.call(fallbackPack, key)) {
        return formatTemplate(fallbackPack[key], vars);
      }

      const levels = key.split(".");

      const pickValue = (target) => {
        let value = target;
        for (const lv of levels) {
          if (value == null) return null;
          value = value[lv];
        }
        if (typeof value === "string") {
          return formatTemplate(value, vars);
        }
        return value;
      };

      const picked = pickValue(pack) ?? pickValue(fallbackPack);
      if (picked === null || picked === undefined) return key;
      return typeof picked === "string" ? picked : picked;
    };
  }, [lang]);
}
