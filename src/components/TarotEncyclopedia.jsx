import React, { useMemo, useState } from "react";
import { CARDS } from "../data/cards";
import { MAJOR_ARCANA_MEANINGS } from "../data/majorArcanaMeanings";

function buildFallback(keywords = [], pose = "Upright") {
  const safe = keywords.filter(Boolean);
  if (safe.length === 0) return [`${pose} energy flows in quiet cycles.`];
  const [a = "insight", b = "action", c = "shift"] = safe;
  return [
    `${pose} recognizes ${a} rising within you.`,
    `${pose} asks for ${b} with care.`,
    `${pose} moves through ${c} when you stay present.`,
  ];
}

function useArcanaList() {
  return useMemo(() => {
    const sorted = [...CARDS].sort((a, b) => a.index - b.index);
    return sorted.map((card) => {
      const meanings = MAJOR_ARCANA_MEANINGS[card.id] || {};
      return {
        ...card,
        upright: meanings.upright || buildFallback(card.keywords, "Upright"),
        reversed: meanings.reversed || buildFallback(card.keywords, "Reversed"),
      };
    });
  }, []);
}

export default function TarotEncyclopedia({ onBack, t }) {
  const arcana = useArcanaList();
  const [activeId, setActiveId] = useState(() => arcana[0]?.id);
  const activeCard =
    arcana.find((card) => card.id === activeId) || arcana[0] || null;

  return (
    <section className="full-section encyclopedia-section">
      <div className="ency-header">
        <div>
          <div className="ency-title">{t("ency.title")}</div>
          <div className="ency-sub">{t("ency.subtitle")}</div>
        </div>
        <div className="ency-pill">{t("ency.pill")}</div>
      </div>

      <div className="ency-phase-label">Phase 1 · Choose your card</div>
      <div className="ency-grid-section">
        <div className="ency-grid">
          {arcana.map((card) => (
            <button
              key={card.id}
              className={`ency-card ${activeId === card.id ? "active" : ""}`}
              onClick={() => setActiveId(card.id)}
            >
              <div className="ency-thumb">
                <img src={card.image} alt={card.name} loading="lazy" />
              </div>
              <div className="ency-card-meta">
                <div className="ency-card-no">#{card.index}</div>
                <div className="ency-card-name">{card.name}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {activeCard && (
        <>
          <div className="ency-phase-label">Phase 2 · Card detail</div>
          <section className="ency-detail-section">
            <div className="ency-detail">
              <div className="ency-detail-header">
                <div>
                  <div className="detail-label">{t("ency.major")}</div>
                  <div className="detail-name">
                    #{activeCard.index} · {activeCard.name}
                  </div>
                  <div className="detail-keywords">
                    {activeCard.keywords.map((word) => (
                      <span className="keyword-chip" key={word}>
                        {word}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="detail-card-frame">
                  <img src={activeCard.image} alt={activeCard.name} />
                </div>
              </div>

              <div className="meaning-columns">
                <div className="meaning-block">
                  <div className="meaning-title">{t("ency.upright")}</div>
                  <ul>
                    {activeCard.upright.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                </div>
                <div className="meaning-block">
                  <div className="meaning-title">{t("ency.reversed")}</div>
                  <ul>
                    {activeCard.reversed.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="ency-footer">
                <div className="ency-pixel-note">
                  {t("ency.footer")}
                </div>
                <div className="action-row">
                  <button className="btn-secondary" onClick={onBack}>
                    {t("common.backHome")}
                  </button>
                </div>
              </div>
            </div>
          </section>
        </>
      )}
    </section>
  );
}
