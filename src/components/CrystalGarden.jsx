import React, { useEffect, useMemo, useState } from "react";

const BONUS_TASKS = [
  {
    id: "daily-login",
    crystalId: "moonstone",
    labelKey: "dream.taskLoginLabel",
    descKey: "dream.taskLoginDesc",
  },
  {
    id: "dream-note",
    crystalId: "rosequartz",
    labelKey: "dream.taskWishLabel",
    descKey: "dream.taskWishDesc",
  },
  {
    id: "mini-ritual",
    crystalId: "citrine",
    labelKey: "dream.taskRitualLabel",
    descKey: "dream.taskRitualDesc",
  },
];

function buildTileGradient(crystal) {
  if (!crystal?.palette?.length) {
    return "linear-gradient(180deg, rgba(255,255,255,0.1), rgba(50,20,80,0.85))";
  }
  const [start, end] = crystal.palette;
  return `linear-gradient(180deg, ${start}, ${end})`;
}

export default function CrystalGarden({
  crystals = [],
  dailyCrystal,
  onGrantCrystal,
  t,
}) {
  const defaultId = useMemo(
    () => crystals[0]?.id || dailyCrystal?.id || null,
    [crystals, dailyCrystal]
  );
  const [activeId, setActiveId] = useState(defaultId);

  useEffect(() => {
    if (!defaultId) return;
    setActiveId((prev) =>
      prev && crystals.some((c) => c.id === prev) ? prev : defaultId
    );
  }, [crystals, defaultId]);

  const activeCrystal = useMemo(() => {
    if (!activeId && !dailyCrystal) return null;
    const owned = crystals.find((c) => c.id === activeId);
    if (owned) return owned;
    if (dailyCrystal?.id === activeId) return dailyCrystal;
    return crystals[0] || dailyCrystal || null;
  }, [activeId, crystals, dailyCrystal]);

  const handleTaskClaim = (crystalId) => {
    onGrantCrystal?.(crystalId, { source: "task" });
  };

  return (
    <section className="crystal-garden">
      <div className="garden-header">
        <div>
          <div className="garden-title">{t("dream.crystalGardenTitle")}</div>
          <div className="garden-sub">{t("dream.crystalGardenHint")}</div>
        </div>

        {dailyCrystal && (
          <div className="garden-daily-card">
            <div className="garden-daily-label">
              {t("dream.dailyCrystalLabel")}
            </div>
            <div className="garden-daily-name">
              {dailyCrystal.name}
              {dailyCrystal.alias ? ` · ${dailyCrystal.alias}` : ""}
            </div>
            <div className="garden-daily-reason">{dailyCrystal.reason}</div>
            <div className="garden-daily-focus">{dailyCrystal.focus}</div>
          </div>
        )}
      </div>

      <div className="garden-grid">
        {crystals.length === 0 ? (
          <div className="garden-empty">{t("dream.crystalEmpty")}</div>
        ) : (
          crystals.map((crystal) => (
            <button
              key={crystal.id}
              type="button"
              className={`crystal-tile ${crystal.id === activeId ? "active" : ""}`}
              onClick={() => setActiveId(crystal.id)}
              style={{ background: buildTileGradient(crystal) }}
            >
              <span className="tile-sparkle" aria-hidden="true" />
              <span className="tile-name">
                {crystal.name}
                {crystal.alias ? ` · ${crystal.alias}` : ""}
              </span>
              <span className="tile-energy">
                {t("dream.crystalEnergyLevel")} {crystal.energy}
              </span>
            </button>
          ))
        )}
      </div>

      <div className="crystal-detail">
        {activeCrystal ? (
          <>
            <div className="detail-name">
              {activeCrystal.alias
                ? `${activeCrystal.name} · ${activeCrystal.alias}`
                : activeCrystal.name}
            </div>
            <div className="detail-guardian">
              {activeCrystal.guardianNote}
            </div>
            <div className="detail-use">{activeCrystal.use}</div>
            <div className="detail-nightly">{activeCrystal.nightly}</div>
            <div className="detail-meta">
              {t("dream.crystalCollected")} {activeCrystal.date}
            </div>
          </>
        ) : (
          <div className="detail-empty">{t("dream.crystalSelectHint")}</div>
        )}
      </div>

      <div className="garden-tasks">
        <div className="garden-task-label">{t("dream.crystalTasks")}</div>
        <div className="garden-task-list">
          {BONUS_TASKS.map((task) => (
            <button
              key={task.id}
              type="button"
              className="task-chip"
              onClick={() => handleTaskClaim(task.crystalId)}
            >
              <div className="task-title">{t(task.labelKey)}</div>
              <div className="task-desc">{t(task.descKey)}</div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
