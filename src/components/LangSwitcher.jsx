import React from "react";
import { LANGS } from "../i18n";

export default function LangSwitcher({ lang, setLang }) {
  return (
    <select
      className="lang-select"
      value={lang}
      onChange={(e) => setLang(e.target.value)}
    >
      {Object.entries(LANGS).map(([code, meta]) => (
        <option key={code} value={code}>
          {meta.flag} {meta.name}
        </option>
      ))}
    </select>
  );
}
