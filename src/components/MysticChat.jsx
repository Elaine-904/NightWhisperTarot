import React, { useEffect, useMemo, useRef, useState } from "react";
import { CARDS } from "../data/cards";
import { askAI } from "../api/aiClient";
import { BUY_ME_COFFEE_URL } from "../support";

const CHAT_LIMIT = 5;

function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function drawCards() {
  const count = 1 + Math.floor(Math.random() * 3);
  return shuffle(CARDS).slice(0, count);
}

function paletteFromCards(cards) {
  const fallback = {
    gradient: "linear-gradient(160deg, #0e0f2c 0%, #1c1344 45%, #0b1f3a 100%)",
    accent: "#c3e8ff",
    glass: "rgba(12, 10, 30, 0.76)",
    border: "rgba(170, 180, 255, 0.65)",
    glow: "rgba(120, 160, 255, 0.36)",
  };

  if (!cards.length) return fallback;

  const first = cards[0];
  const map = {
    sun: {
      gradient: "linear-gradient(160deg, #2b0f15 0%, #7a2d1f 45%, #c0672a 100%)",
      accent: "#ffd27a",
      glass: "rgba(35, 18, 18, 0.78)",
      border: "rgba(255, 199, 133, 0.75)",
      glow: "rgba(255, 184, 120, 0.42)",
    },
    moon: {
      gradient: "linear-gradient(155deg, #0a1a33 0%, #0e1034 45%, #1f2f66 100%)",
      accent: "#9ad7ff",
      glass: "rgba(10, 14, 32, 0.78)",
      border: "rgba(144, 196, 255, 0.7)",
      glow: "rgba(110, 170, 255, 0.38)",
    },
    star: {
      gradient: "linear-gradient(170deg, #09172b 0%, #102440 48%, #184d6a 100%)",
      accent: "#bfe8ff",
      glass: "rgba(9, 16, 32, 0.82)",
      border: "rgba(150, 215, 255, 0.7)",
      glow: "rgba(140, 225, 255, 0.4)",
    },
    death: {
      gradient: "linear-gradient(165deg, #1a0b1c 0%, #2a0e2c 50%, #0f111f 100%)",
      accent: "#e4b5ff",
      glass: "rgba(18, 8, 24, 0.82)",
      border: "rgba(220, 170, 255, 0.65)",
      glow: "rgba(200, 140, 255, 0.36)",
    },
    tower: {
      gradient: "linear-gradient(160deg, #120b22 0%, #24114a 46%, #3a1c62 100%)",
      accent: "#ffc9ff",
      glass: "rgba(16, 10, 34, 0.82)",
      border: "rgba(220, 180, 255, 0.65)",
      glow: "rgba(200, 150, 255, 0.38)",
    },
    devil: {
      gradient: "linear-gradient(158deg, #1b0c14 0%, #2e0d1d 48%, #3e1b34 100%)",
      accent: "#ff9bad",
      glass: "rgba(20, 10, 20, 0.84)",
      border: "rgba(255, 160, 185, 0.62)",
      glow: "rgba(255, 140, 170, 0.35)",
    },
    lovers: {
      gradient: "linear-gradient(160deg, #1a0c22 0%, #341543 46%, #512859 100%)",
      accent: "#ffb8e2",
      glass: "rgba(18, 10, 28, 0.84)",
      border: "rgba(255, 170, 220, 0.7)",
      glow: "rgba(255, 150, 210, 0.42)",
    },
    chariot: {
      gradient: "linear-gradient(158deg, #0c1d24 0%, #0f2f42 45%, #0b5a6d 100%)",
      accent: "#9bf1ff",
      glass: "rgba(8, 16, 24, 0.84)",
      border: "rgba(130, 220, 255, 0.68)",
      glow: "rgba(120, 210, 255, 0.36)",
    },
    hermit: {
      gradient: "linear-gradient(166deg, #0d1324 0%, #1a2038 52%, #102b38 100%)",
      accent: "#cde0ff",
      glass: "rgba(8, 12, 26, 0.83)",
      border: "rgba(170, 200, 255, 0.66)",
      glow: "rgba(150, 190, 255, 0.34)",
    },
    sundefault: fallback,
  };

  return map[first.id] || map[first.name?.toLowerCase()] || map.sundefault;
}

function fallbackNightLine(card, salt = 0) {
  const keywords = card.keywords || [];
  const k0 = keywords[0] || "a night-wandering heart";
  const k1 = keywords[1] || "the silent wind";
  const k2 = keywords[2] || k0;
  const patterns = [
    `${card.enName || card.name} speaks of ${k0} in the misty blue night, like a hidden thread for yourself.`,
    `${card.enName || card.name} lights a spark of ${k1}, reminding you to gently slow down your breath.`,
    `${card.enName || card.name}'s shadow falls upon ${k2}, inviting you to hear the deep echoes within.`,
    `${card.enName || card.name} glows faintly, saving a quiet corner for ${k1}.`,
  ];
  return patterns[(salt + card.index) % patterns.length];
}

function fallbackStardust(cards) {
  if (!cards.length) return "Close your eyes, and promise yourself to do just one gentle little thing tonight.";
  const lead = cards[0]?.enName || cards[0]?.name || "The Night Card";
  return `Stardust advice from ${lead}: Write down one essential sentence, put it in your pocket, and read it again tomorrow morning.`;
}

function fallbackStarfall(cards) {
  const name = cards[0]?.enName || cards[0]?.name || "The Night";
  return `Starfall Event: A shard of light grazes by; ${name} hides the answer in the blink of an eye.`;
}

function buildPrompt(question, cards) {
  const cardList = cards
    .map((c) => `${c.name} (${c.enName || ""}; ${c.keywords.join(", ")})`)
    .join("\n");

  return `
You are the "Night Whisper" AI, a mysterious guide in the divination chatroom.
Language: English. Tone: Soft like the night, yet direct.

Given the user's question and the drawn Tarot cards, generate a JSON object:
{
  "cards": [
    { "name": "Card Name", "night_words": "Night whisper interpretation, 15-26 words, imagery + reminder" }
  ],
  "stardust": "Stardust advice, 16-30 words, specific small action or mindset",
  "starfall": "If you feel a shooting star, write a mysterious code of 12-22 words; otherwise, leave as an empty string"
}

Constraints:
- "night_words" and "stardust" must use the provided card names and cannot be fabricated.
- No lists or numbering in any lines; maintain a conversational flow.
- Varied sentence structures; avoid template-like traces.
- Avoid repetitive vocabulary.

User Question:
${question}

Cards Drawn:
${cardList}
`;
}

function parseAiResult(text, cards) {
  const base = { cards: [], stardust: "", starfall: "" };
  if (!text) return base;
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return base;
  try {
    const parsed = JSON.parse(match[0]);
    return {
      cards: Array.isArray(parsed.cards) ? parsed.cards : [],
      stardust: parsed.stardust || "",
      starfall: parsed.starfall || "",
    };
  } catch (err) {
    console.warn("Mystic chat: parse failed", err);
    return base;
  }
}

function cleanLine(str) {
  if (!str) return "";
  return String(str).replace(/^[\-\d\.\•\s]+/, "").trim();
}

export default function MysticChat({ onBack, t }) {
  const [messages, setMessages] = useState([
    {
      id: "hello",
      role: "oracle",
      intro: true,
      stardust: t("mystic.intro"),
    },
  ]);
  const [question, setQuestion] = useState("");
  const [busy, setBusy] = useState(false);
  const [activePalette, setActivePalette] = useState(paletteFromCards([]));
  const [starfall, setStarfall] = useState(null);
  const logRef = useRef(null);
  const [chatCount, setChatCount] = useState(0);
  const limitReached = chatCount >= CHAT_LIMIT;
  const remainingChats = Math.max(CHAT_LIMIT - chatCount, 0);
  const recordChatUse = () =>
    setChatCount((prev) => Math.min(CHAT_LIMIT, prev + 1));

  useEffect(() => {
    if (!logRef.current) return;
    logRef.current.scrollTo({
      top: logRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  useEffect(() => {
    setMessages((prev) => {
      if (!prev.length) return prev;
      const updated = [...prev];
      if (updated[0]?.intro) {
        updated[0] = { ...updated[0], stardust: t("mystic.intro") };
      }
      return updated;
    });
  }, [t]);

  useEffect(() => {
    if (!starfall) return;
    const timer = setTimeout(() => setStarfall(null), 5200);
    return () => clearTimeout(timer);
  }, [starfall]);

  const paletteStyle = useMemo(
    () => ({
      backgroundImage: activePalette.gradient,
      borderColor: activePalette.border,
      boxShadow: `0 16px 38px ${activePalette.glow}`,
      "--chat-accent": activePalette.accent,
      "--chat-glass": activePalette.glass,
    }),
    [activePalette]
  );

  async function handleSend() {
    const trimmed = question.replace(/\s+/g, " ").trim();
    if (!trimmed || busy) return;
    if (limitReached) return;

    const cards = drawCards();
    const palette = paletteFromCards(cards);
    setActivePalette(palette);

    setQuestion("");
    setMessages((prev) => [
      ...prev,
      { id: `u-${Date.now()}`, role: "user", text: trimmed },
    ]);
    setBusy(true);

    try {
      const prompt = buildPrompt(trimmed, cards);
      const aiText = await askAI(prompt);
      const parsed = parseAiResult(aiText, cards);

      const fullCards = cards.map((card, idx) => {
        const fromAi =
          parsed.cards?.find((c) => c?.name?.toLowerCase?.().includes(card.name.toLowerCase())) ||
          parsed.cards?.[idx];
        const nightWords = cleanLine(
          fromAi?.night_words || fromAi?.nightWords || fromAi?.night || ""
        );
        return {
          ...card,
          nightWords: nightWords || fallbackNightLine(card, idx),
        };
      });

      const stardust = cleanLine(parsed.stardust) || fallbackStardust(cards);
      const starfallHint =
        cleanLine(parsed.starfall) || (Math.random() < 0.24 ? fallbackStarfall(cards) : "");

      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          role: "oracle",
          cards: fullCards,
          stardust,
          starfall: starfallHint,
        },
      ]);

      if (starfallHint) {
        setStarfall({ text: starfallHint, accent: palette.accent });
      }

      recordChatUse();
    } catch (err) {
      console.error("Mystic chat failed:", err);
      const fallbackCards = cards.map((card, idx) => ({
        ...card,
        nightWords: fallbackNightLine(card, idx),
      }));
      const stardust = fallbackStardust(cards);
      const starfallHint = Math.random() < 0.28 ? fallbackStarfall(cards) : "";

      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          role: "oracle",
          cards: fallbackCards,
          stardust,
          starfall: starfallHint,
        },
      ]);

      if (starfallHint) {
        setStarfall({ text: starfallHint, accent: palette.accent });
      }

      recordChatUse();
    } finally {
      setBusy(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <section className="full-section mystic-section" style={paletteStyle}>
      <div className="mystic-halo" aria-hidden="true" />
      <header className="mystic-header">
        <div>
          <h2>{t("mystic.title")}</h2>
          <p className="tag">{t("mystic.tagline")}</p>
        </div>
        <button className="btn-secondary slim" onClick={onBack}>
          {t("mystic.back")}
        </button>
      </header>

      <div className="mystic-shell">
        {limitReached && (
          <div className="mystic-paywall" aria-live="polite">
            <div className="mystic-paywall-copy">
              <p className="mystic-paywall-title">{t("mystic.limitTitle")}</p>
              <p className="mystic-paywall-body">
                {t("mystic.limitHint", { limit: CHAT_LIMIT })}
              </p>
              <p className="mystic-paywall-detail">{t("mystic.limitSupport")}</p>
            </div>
            <div className="mystic-paywall-cta">
              <a
                href={BUY_ME_COFFEE_URL}
                target="_blank"
                rel="noreferrer"
                className="mystic-paywall-link"
                aria-label={`${t("mystic.limitButton")} · ${t("mystic.limitSupport")}`}
              >
                <span className="mystic-paywall-link-icon" aria-hidden="true">
                  ☕
                </span>
                <div className="mystic-paywall-link-copy">
                  <span className="mystic-paywall-link-text">
                    {t("mystic.limitButton")}
                  </span>
                  <span className="mystic-paywall-link-note">
                    {t("mystic.limitButtonNote")}
                  </span>
                </div>
              </a>
            </div>
          </div>
        )}
        <div className="chat-window" ref={logRef}>
        {messages.map((msg) => {
          if (msg.role === "user") {
            return (
              <div className="chat-row user" key={msg.id}>
                <div className="chat-bubble">{msg.text}</div>
              </div>
            );
          }

          return (
            <div className="chat-row oracle" key={msg.id}>
              <div className="chat-bubble glass">
                {msg.intro && <div className="chat-intro">{msg.stardust}</div>}

                {msg.cards && msg.cards.length > 0 && (
                  <>
                    <div className="card-strip">
                      {msg.cards.map((card) => (
                        <div className="card-pip" key={card.id}>
                          <div className="card-thumb">
                            <img src={card.image} alt={card.name} />
                          </div>
                          <div className="card-meta">
                            <div className="card-name">{card.enName || card.name}</div>
                            <div className="card-night">{card.nightWords}</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="stardust">
                      <span className="stardust-label">{t("mystic.stardustLabel")}</span>
                      <span className="stardust-text">{msg.stardust}</span>
                    </div>

                    {msg.starfall && (
                      <div className="starfall-line">
                        <span className="sparkle">✧</span>
                        {msg.starfall}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}

        {busy && (
          <div className="chat-row oracle">
            <div className="chat-bubble glass loading">
              {t("mystic.loading")}
            </div>
          </div>
        )}
        </div>

        <div className="chat-input-row">
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            limitReached
              ? t("mystic.limitHint", { limit: CHAT_LIMIT })
              : t("mystic.placeholder")
          }
          rows={3}
          disabled={limitReached}
        />
        <div className="chat-actions">
          <button
            className="btn-main"
            onClick={handleSend}
            disabled={busy || limitReached}
          >
            {busy ? t("mystic.button.sending") : t("mystic.button.send")}
          </button>
          <div className="hint">{t("mystic.hint")}</div>
        </div>
        <div className="chat-status-row">
          <span className="chat-status-pill">
            Whisper count: {Math.min(chatCount, CHAT_LIMIT)}/{CHAT_LIMIT}
          </span>
          {!limitReached && (
            <span className="chat-status-hint">
              {remainingChats} whisper
              {remainingChats === 1 ? "" : "s"} left before a tip request.
            </span>
          )}
        </div>
        </div>
      </div>

      {starfall && (
        <div className="starfall-overlay" aria-live="polite">
          <div className="shooting-star" />
          <div className="shooting-star delay" />
          <div className="shooting-star slow" />
          <div className="starfall-text" style={{ color: starfall.accent || "#dff4ff" }}>
            {starfall.text}
          </div>
        </div>
      )}
    </section>
  );
}
