import React, { useState } from "react";
import { MOON_MARKERS } from "../moon";
import "./moon-cycle.css";

const DETAILS_ID = "moon-engine-details";

export default function MoonCycleEngine({ moon, onOpenDreamBottle, t }) {
  const [blessingFlash, setBlessingFlash] = useState(false);
  const [expanded, setExpanded] = useState(false);
  if (!moon) return null;

  const isFull = moon.phaseKey === "full";
  const isNew = moon.phaseKey === "new";

  function handleBlessing() {
    if (!isFull) return;
    setBlessingFlash(true);
    setTimeout(() => setBlessingFlash(false), 1800);
  }

  const quickFacts = [
    { label: t("moon.metric.action"), text: `${moon.actionScore}/100` },
    { label: t("moon.metric.tone"), text: moon.tone },
    {
      label: t("moon.illumination", { pct: moon.illuminationPct }),
      text: t("moon.age", {
        day: moon.ageDays,
        cycle: moon.cycleLength.toFixed(1),
      }),
    },
  ];

  const progressLabel = t("moon.progressLabel", {
    progress: moon.progressPct,
  });
  const progressMeta = t("moon.progressMeta", {
    toFull: moon.daysToFull,
    toNew: moon.daysToNew,
  });

  return (
    <section className="moon-section">
      <div className="moon-engine">
        <div className="moon-summary-card">
          <div className="moon-summary-top">
            <div className="moon-summary-phase">
              <div className="moon-pill">{t("moon.pill")}</div>
              <div className="moon-summary-title">
                <span>{moon.name}</span>
                <span className="moon-summary-emoji" aria-hidden="true">
                  {moon.emoji}
                </span>
              </div>
              <p className="moon-sub">
                {t("moon.description", {
                  mood: moon.mood,
                  actionScore: moon.actionScore,
                  tone: moon.tone,
                })}
              </p>
            </div>
            <div className="moon-summary-chips">
              {quickFacts.map((fact) => (
                <div key={fact.label} className="moon-summary-chip">
                  <span>{fact.label}</span>
                  <strong>{fact.text}</strong>
                </div>
              ))}
            </div>
          </div>

          <div className="moon-summary-actions">
            <button
              type="button"
              className={`moon-toggle-btn ${expanded ? "moon-toggle-active" : ""}`}
              onClick={() => setExpanded((prev) => !prev)}
              aria-expanded={expanded}
              aria-controls={DETAILS_ID}
            >
              {expanded ? "Hide details" : "Show details"}
            </button>
            <div className="moon-summary-meta">{progressMeta}</div>
          </div>
        </div>

        <div
          id={DETAILS_ID}
          className={`moon-details ${expanded ? "moon-details-active" : "moon-details-hidden"}`}
          aria-hidden={!expanded}
        >
          <div className="moon-progress-block">
            <div className="moon-progress-top">
              <div className="moon-progress-label">{progressLabel}</div>
              <div className="moon-progress-meta">{progressMeta}</div>
            </div>

            <div className="moon-progress-track">
              <div
                className="moon-progress-fill"
                style={{
                  width: `${moon.progressPct}%`,
                  background: `linear-gradient(90deg, ${moon.accent}, rgba(255, 255, 255, 0.7))`,
                }}
              />
              <div
                className="moon-progress-dot"
                style={{ left: `${moon.progressPct}%`, borderColor: moon.accent }}
              />
              {MOON_MARKERS.map((marker) => (
                <div
                  key={marker.label}
                  className="moon-marker"
                  style={{ left: `${marker.position}%` }}
                >
                  <span className="moon-marker-icon">{marker.icon}</span>
                  <span className="moon-marker-label">{marker.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="moon-rituals">
            <div className={`moon-ritual-card ${isFull ? "moon-card-active" : "moon-card-locked"}`}>
              <div className="moon-ritual-title">{t("moon.rituals.full.title")}</div>
              <div className="moon-ritual-desc">{t("moon.rituals.full.desc")}</div>
              <button
                className="btn-main"
                type="button"
                disabled={!isFull}
                onClick={handleBlessing}
              >
                {isFull
                  ? t("moon.rituals.full.buttonActive")
                  : t("moon.rituals.full.buttonLocked")}
              </button>
              <div className="moon-ritual-footer">
                {isFull ? (
                  <span className={blessingFlash ? "moon-burst" : ""}>
                    {t("moon.rituals.full.footerActive")}
                  </span>
                ) : (
                  <span>
                    {t("moon.rituals.full.footerLocked", { toFull: moon.daysToFull })}
                  </span>
                )}
              </div>
            </div>

            <div className={`moon-ritual-card ${isNew ? "moon-card-active" : "moon-card-locked"}`}>
              <div className="moon-ritual-title">{t("moon.rituals.new.title")}</div>
              <div className="moon-ritual-desc">{t("moon.rituals.new.desc")}</div>
              <button
                className="btn-secondary"
                type="button"
                disabled={!isNew}
                onClick={onOpenDreamBottle}
              >
                {isNew
                  ? t("moon.rituals.new.buttonActive")
                  : t("moon.rituals.new.buttonLocked")}
              </button>
              <div className="moon-ritual-footer">
                {isNew ? (
                  <span>{t("moon.rituals.new.footerActive")}</span>
                ) : (
                  <span>
                    {t("moon.rituals.new.footerLocked", { toNew: moon.daysToNew })}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="moon-tone-hint">
            {t("moon.toneHint", { toneTag: moon.toneTag })}
          </div>
        </div>
      </div>
    </section>
  );
}
