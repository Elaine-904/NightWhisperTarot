import React, { useState } from "react";
import { MOON_MARKERS } from "../moon";

export default function MoonCycleEngine({ moon, onOpenDreamBottle }) {
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
        <div className="moon-pill">Moon Cycle Engine</div>
        <div className="moon-headline">
          今日月相 · {moon.name} {moon.emoji}
        </div>
        <p className="moon-sub">
          让抽卡语气随月亮而变。情绪：{moon.mood} · 行动力 {moon.actionScore}/100
        </p>
      </div>

      <div className="moon-top">
        <div className="moon-orb" style={{ boxShadow: `0 0 28px ${moon.accent}33` }}>
          <div className="moon-orb-emoji">{moon.emoji}</div>
          <div className="moon-orb-illum">
            {moon.illuminationPct}% lit
          </div>
          <div className="moon-orb-age">Day {moon.ageDays} / {moon.cycleLength.toFixed(1)}</div>
        </div>

        <div className="moon-metrics">
          <div className="moon-row">
            <div className="moon-label">行动力</div>
            <div className="moon-bar">
              <span
                className="moon-bar-fill"
                style={{ width: `${moon.actionScore}%`, background: moon.accent }}
              />
            </div>
            <div className="moon-value">{moon.actionScore}/100</div>
          </div>

          <div className="moon-row">
            <div className="moon-label">心灵色调</div>
            <div className="moon-tone">{moon.tone}</div>
          </div>

          <div className="moon-row">
            <div className="moon-label">提示</div>
            <div className="moon-note">{moon.ritual}</div>
          </div>
        </div>
      </div>

      <div className="moon-progress-block">
        <div className="moon-progress-top">
          <div className="moon-progress-label">月亮进度 {moon.progressPct}%</div>
          <div className="moon-progress-meta">
            距离满月 {moon.daysToFull} 天 · 距离新月 {moon.daysToNew} 天
          </div>
        </div>

        <div className="moon-progress-track">
          <div
            className="moon-progress-fill"
            style={{ width: `${moon.progressPct}%`, background: `linear-gradient(90deg, ${moon.accent}, rgba(255,255,255,0.7))` }}
          />
          <div className="moon-progress-dot" style={{ left: `${moon.progressPct}%`, borderColor: moon.accent }} />

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
          <div className="moon-ritual-title">满月祝福</div>
          <div className="moon-ritual-desc">
            满月带来高频行动力与诚实光束。写一句祝福，读给自己或朋友。
          </div>
          <button className="btn-main" disabled={!isFull} onClick={handleBlessing}>
            {isFull ? "领取祝福" : "待满月解锁"}
          </button>
          <div className="moon-ritual-footer">
            {isFull ? (
              <span className={blessingFlash ? "moon-burst" : ""}>光落下来了 ✦</span>
            ) : (
              <span>距离满月 {moon.daysToFull} 天</span>
            )}
          </div>
        </div>

        <div className={`moon-ritual-card ${isNew ? "moon-card-active" : "moon-card-locked"}`}>
          <div className="moon-ritual-title">新月愿望</div>
          <div className="moon-ritual-desc">
            新月是埋种子的夜晚。将愿望写进 Dream Bottle，等待液体发光。
          </div>
          <button
            className="btn-secondary"
            disabled={!isNew}
            onClick={onOpenDreamBottle}
          >
            {isNew ? "写入 Dream Bottle" : "待新月解锁"}
          </button>
          <div className="moon-ritual-footer">
            {isNew ? <span>瓶口已开启</span> : <span>距离新月 {moon.daysToNew} 天</span>}
          </div>
        </div>
      </div>

      <div className="moon-tone-hint">
        抽卡语气将遵循：{moon.toneTag}
      </div>
    </div>
  );
}
