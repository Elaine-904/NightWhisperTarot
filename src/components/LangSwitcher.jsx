import React from "react";
import { LANGS } from "../i18n";

const FLAGS = {
  en: "🇺🇸",
  fr: "🇫🇷",
  ja: "🇯🇵",
  ko: "🇰🇷",
  hi: "🇮🇳",
  zh: "🇨🇳",
};

export default function LangSwitcher({ lang, setLang }) {
  return (
    <select
      className="lang-select"
      value={lang}
      onChange={(e) => setLang(e.target.value)}
    >
      {Object.keys(LANGS).map((code) => (
        <option key={code} value={code}>
          {FLAGS[code]} {code.toUpperCase()}
        </option>
      ))}
    </select>
  );
}
