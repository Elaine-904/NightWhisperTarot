import React, { useState } from "react";
import { MOON_MARKERS } from "../moon";

export default function MoonCycleEngine({ moon, onOpenDreamBottle, t }) {
  const [blessingFlash, setBlessingFlash] = useState(false);
  if (!moon) return null;

  const isFull = moon.phaseKey === "full";
  const isNew = moon.phaseKey === "new";

  function handleBlessing() {
    if (!isFull) return;
    setBlessingFlash(true);
    setTimeout(() => setBlessingFlash(false), 1800);
  }

  return (
    <div className="moon-engine">
      <div className="moon-engine-head">
        <div className="moon-pill">{t("moon.pill")}</div>
        <div className="moon-headline">
          {t("moon.phaseLabel")} · {moon.name} {moon.emoji}
        </div>
        <p className="moon-sub">
          {t("moon.description", {
            mood: moon.mood,
            actionScore: moon.actionScore,
            tone: moon.tone,
          })}
        </p>
      </div>

      <div className="moon-top">
        <div className="moon-orb" style={{ boxShadow: `0 0 28px ${moon.accent}33` }}>
          <div className="moon-orb-emoji">{moon.emoji}</div>
          <div className="moon-orb-illum">
            {t("moon.illumination", { pct: moon.illuminationPct })}
          </div>
          <div className="moon-orb-age">
            {t("moon.age", {
              day: moon.ageDays,
              cycle: moon.cycleLength.toFixed(1),
            })}
          </div>
        </div>

        <div className="moon-metrics">
          <div className="moon-row">
            <div className="moon-label">{t("moon.metric.action")}</div>
            <div className="moon-bar">
              <span
                className="moon-bar-fill"
                style={{ width: `${moon.actionScore}%`, background: moon.accent }}
              />
            </div>
            <div className="moon-value">{moon.actionScore}/100</div>
          </div>

          <div className="moon-row">
            <div className="moon-label">{t("moon.metric.tone")}</div>
            <div className="moon-tone">{moon.tone}</div>
          </div>

          <div className="moon-row">
            <div className="moon-label">{t("moon.metric.tip")}</div>
            <div className="moon-note">{moon.ritual}</div>
          </div>
        </div>
      </div>

      <div className="moon-progress-block">
        <div className="moon-progress-top">
          <div className="moon-progress-label">
            {t("moon.progressLabel", { progress: moon.progressPct })}
          </div>
          <div className="moon-progress-meta">
            {t("moon.progressMeta", {
              toFull: moon.daysToFull,
              toNew: moon.daysToNew,
            })}
          </div>
        </div>

        <div className="moon-progress-track">
          <div
            className="moon-progress-fill"
            style={{
              width: `${moon.progressPct}%`,
              background: `linear-gradient(90deg, ${moon.accent}, rgba(255,255,255,0.7))`,
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
          <button className="btn-main" disabled={!isFull} onClick={handleBlessing}>
            {isFull ? t("moon.rituals.full.buttonActive") : t("moon.rituals.full.buttonLocked")}
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
          <button className="btn-secondary" disabled={!isNew} onClick={onOpenDreamBottle}>
            {isNew ? t("moon.rituals.new.buttonActive") : t("moon.rituals.new.buttonLocked")}
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
  );
}
