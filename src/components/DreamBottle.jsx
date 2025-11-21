import React, { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "dreamBottleWishes";

function readStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
  } catch (err) {
    console.warn("Failed to read wishes:", err);
  }
  return [];
}

function formatDateLabel(dateStr, todayKey, locale, todayLabel) {
  if (dateStr === todayKey) return todayLabel;
  const date = new Date(`${dateStr}T00:00:00`);
  if (!Number.isNaN(date.getTime())) {
    return date.toLocaleDateString(locale, { month: "short", day: "numeric" });
  }
  return dateStr;
}

export default function DreamBottle({ onBack, t, lang, secretSeed }) {
  const dateLocale =
    {
      zh: "zh-CN",
      ja: "ja-JP",
      ko: "ko-KR",
      fr: "fr-FR",
      hi: "hi-IN",
      en: "en-US",
    }[lang] || "en-US";
  const todayKey = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const initialWishes = useMemo(() => readStored(), []);
  const [wishes, setWishes] = useState(initialWishes);
  const [wishText, setWishText] = useState(() => {
    const today = initialWishes.find((w) => w.date === todayKey);
    return today?.text || "";
  });
  const [showHistory, setShowHistory] = useState(false);
  const [savedPing, setSavedPing] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(wishes));
  }, [wishes]);

  useEffect(() => {
    const trimmed = wishText.trim();
    setSavedPing(true);
    setWishes((prev) => {
      const existing = prev.filter((w) => w.date !== todayKey);
      if (!trimmed) return existing;
      const entry = { date: todayKey, text: trimmed, time: Date.now() };
      return [entry, ...existing].slice(0, 40);
    });

    const timer = setTimeout(() => setSavedPing(false), 1200);
    return () => clearTimeout(timer);
  }, [wishText, todayKey]);

  const secretBottle = secretSeed?.id === "mystery-bottle";
  const bottleLine = useMemo(() => {
    if (!secretBottle) return "";
    const lines = [
      "瓶塞下面藏着一行隐语：把愿望写得越短，月光回信越快。",
      "神秘瓶子在轻响，似乎藏着未完成的咒语。",
      "今晚的瓶子会捕捉流星，你的字会被照亮。",
      "别急着关瓶口，让句子先吸一口星辉空气。",
    ];
    const seedNum = Number(todayKey.replace(/-/g, "")) || Date.now();
    return lines[seedNum % lines.length];
  }, [secretBottle, todayKey]);

  return (
    <div className="panel dream-panel">
      <h2>{t("dream.title")}</h2>
      <p className="tag">{t("dream.tag")}</p>
      {secretBottle && bottleLine && (
        <div className="secret-bottle-line">{bottleLine}</div>
      )}

      <div className="dream-bottle-wrap">
        <div className="aura-flow" aria-hidden="true">
          <span className="aura-band aura-band-1" />
          <span className="aura-band aura-band-2" />
          <span className="aura-band aura-band-3" />
        </div>
        <div
          className={`pixel-bottle ${showHistory ? "pixel-bottle-open" : ""}`}
          onClick={() => setShowHistory((v) => !v)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setShowHistory((v) => !v);
            }
          }}
        >
          <div className="bottle-glow" />
          <div className="bottle-liquid" />
          <div className="bottle-sparkle sparkle-1" />
          <div className="bottle-sparkle sparkle-2" />
          <div className="bottle-sparkle sparkle-3" />
        </div>
        <div className="bottle-hint">{t("dream.hint")}</div>
      </div>

      <label className="dream-label" htmlFor="wish-input">
        {t("dream.label")}
      </label>
      <textarea
        id="wish-input"
        className="wish-input"
        placeholder={t("dream.placeholder")}
        value={wishText}
        onChange={(e) => setWishText(e.target.value)}
        rows={3}
      />
      <div className="save-status">
        <span className={savedPing ? "pulse" : ""}>{t("dream.saved")}</span>
      </div>

      {showHistory && (
        <div className="dream-history">
          {wishes.length === 0 ? (
            <div className="empty-history">{t("dream.empty")}</div>
          ) : (
            wishes.map((wish) => (
              <div className="history-item" key={wish.date}>
                <div className="history-meta">
                  <span className="history-date">
                    {formatDateLabel(wish.date, todayKey, dateLocale, t("dream.today"))}
                  </span>
                  {wish.date === todayKey && <span className="history-tag">{t("dream.today")}</span>}
                </div>
                <div className="history-text">{wish.text}</div>
              </div>
            ))
          )}
        </div>
      )}
      <div className="action-row">
        <button className="btn-secondary" onClick={onBack}>
          {t("common.backHome")}
        </button>
      </div>
    </div>
  );
}
