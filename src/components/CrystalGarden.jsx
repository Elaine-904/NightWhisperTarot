import React, { useEffect, useMemo, useState } from "react";

const BONUS_TASKS = [
  {
    id: "daily-login",
    crystalId: "moonstone",
    labelKey: "dream.taskLoginLabel",
    descKey: "dream.taskLoginDesc",
    icon: "🌙",
  },
  {
    id: "dream-note",
    crystalId: "rosequartz",
    labelKey: "dream.taskWishLabel",
    descKey: "dream.taskWishDesc",
    icon: "🌸",
  },
  {
    id: "mini-ritual",
    crystalId: "citrine",
    labelKey: "dream.taskRitualLabel",
    descKey: "dream.taskRitualDesc",
    icon: "✨",
  },
];

function buildTileGradient(crystal) {
  if (!crystal?.palette?.length) {
    return "linear-gradient(180deg, rgba(255,255,255,0.1), rgba(50,20,80,0.85))";
  }
  const [start, end] = crystal.palette;
  return `linear-gradient(180deg, ${start}, ${end})`;
}

function buildDetailGradient(crystal) {
  if (!crystal?.palette?.length) return buildTileGradient(crystal);
  const [start, end] = crystal.palette;
  return `radial-gradient(circle at 30% 20%, ${start} 0%, ${end} 85%)`;
}

export default function CrystalGarden({
  crystals = [],
  dailyCrystal,
  onGrantCrystal,
  t,
  dailyCrystalLimit = 1,
  dailyCrystalClaimed = 0,
  dailyCrystalRemaining = 1,
}) {
  const defaultId = useMemo(
    () => crystals[0]?.id || dailyCrystal?.id || null,
    [crystals, dailyCrystal]
  );
  const [activeId, setActiveId] = useState(defaultId);
  const [strengthenedId, setStrengthenedId] = useState(null);

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

  useEffect(() => {
    if (!activeCrystal) {
      setStrengthenedId(null);
      return;
    }
    if (strengthenedId && activeCrystal.id !== strengthenedId) {
      setStrengthenedId(null);
    }
  }, [activeCrystal, strengthenedId]);

  const isStrengthened = Boolean(
    activeCrystal && strengthenedId === activeCrystal.id
  );
  const detailGradient = buildDetailGradient(activeCrystal);
  const detailAccent = activeCrystal?.palette?.[0] || "#fff";
  const tasksDisabled = dailyCrystalRemaining <= 0;
  const limitLine = t("dream.collectibleLimit", {
    claimed: dailyCrystalClaimed,
    limit: dailyCrystalLimit,
  });
  const limitNote = tasksDisabled
    ? t("dream.collectibleLocked")
    : t("dream.collectibleReady");

  const handleStrengthen = (crystalId) => {
    setStrengthenedId((prev) => (prev === crystalId ? null : crystalId));
  };

  const handleTaskClaim = (crystalId) => {
    if (tasksDisabled) return;
    onGrantCrystal?.(crystalId, { source: "task" });
  };

  return (
    <section className="crystal-garden">
      <div className="garden-header">
        <div>
          <div className="garden-title">{t("dream.crystalGardenTitle")}</div>
          <div className="garden-sub">{t("dream.crystalGardenHint")}</div>
        </div>
        <div className="garden-limit">
          <span className="limit-pill">{limitLine}</span>
          <span className="limit-note">{limitNote}</span>
        </div>
        {dailyCrystal && (
          <div className="garden-daily-card">
            <div
              className="garden-daily-symbol"
              style={{ background: buildDetailGradient(dailyCrystal) }}
            >
              <span className="garden-daily-emoji">
                {dailyCrystal.emoji || "💠"}
              </span>
            </div>
            <div className="garden-daily-meta">
              <div className="garden-daily-label">
                {t("dream.dailyCrystalLabel")}
              </div>
              <div className="garden-daily-name">{dailyCrystal.name}</div>
              <div className="garden-daily-reason">{dailyCrystal.reason}</div>
            </div>
          </div>
        )}
      </div>

      <div className="garden-body">
        <div className="garden-grid">
          {crystals.length === 0 ? (
            <div className="garden-empty">{t("dream.crystalEmpty")}</div>
          ) : (
            crystals.map((crystal) => (
              <button
                key={crystal.id}
                type="button"
                className={`crystal-tile ${
                  crystal.id === activeId ? "active" : ""
                }`}
                onClick={() => setActiveId(crystal.id)}
                style={{ background: buildTileGradient(crystal) }}
              >
                <div className="crystal-icon">
                  <span>{crystal.emoji || "💎"}</span>
                </div>
                <div className="tile-name">
                  {crystal.name}
                </div>
                <div className="tile-energy">
                  <span className="tile-energy-label">
                    {t("dream.crystalEnergyLevel")}
                  </span>
                  <span className="tile-energy-value">{crystal.energy}</span>
                </div>
              </button>
            ))
          )}
        </div>

        <div className="garden-detail-panel">
          <div
            className="crystal-detail-visual"
            style={{
              background: detailGradient,
              borderColor: detailAccent,
            }}
          >
            <span className="detail-emoji">
              {activeCrystal?.emoji || "💎"}
            </span>
            <span className="detail-energy">
              {t("dream.crystalEnergyLevel")}{" "}
              {activeCrystal?.energy != null ? activeCrystal.energy : "--"}
            </span>
          </div>

          <div className="crystal-detail">
            {activeCrystal ? (
              <>
                <div className="detail-name">
                  {activeCrystal.name}
                </div>
                {activeCrystal.guardianNote && (
                  <div className="detail-guardian">
                    {activeCrystal.guardianNote}
                  </div>
                )}
                <div className="detail-use">{activeCrystal.use}</div>
                <div className="detail-nightly">{activeCrystal.nightly}</div>
                <div className="detail-meta">
                  {t("dream.crystalCollected")} {activeCrystal.date}
                </div>
                <div
                  className={`detail-strengthen${
                    isStrengthened ? " active" : ""
                  }`}
                >
                  <button
                    type="button"
                    className="chip-btn"
                    onClick={() => handleStrengthen(activeCrystal.id)}
                  >
                    {t("dream.crystalStrengthen")}
                  </button>
                  <span className="detail-strength-hint">
                    {isStrengthened
                      ? t("dream.crystalStrengthened")
                      : t("dream.crystalStrengthenHint")}
                  </span>
                </div>
              </>
            ) : (
              <div className="detail-empty">
                {t("dream.crystalSelectHint")}
              </div>
            )}
          </div>

          <div className="garden-tasks">
            <div className="garden-task-label">{t("dream.crystalTasks")}</div>
            <div className="garden-task-hint">
              {tasksDisabled ? t("dream.collectibleLocked") : t("dream.taskHint")}
            </div>
            <div className="garden-task-list">
              {BONUS_TASKS.map((task) => (
                <button
                  key={task.id}
                  type="button"
                  className={`task-chip${tasksDisabled ? " disabled" : ""}`}
                  disabled={tasksDisabled}
                  aria-disabled={tasksDisabled}
                  onClick={() => handleTaskClaim(task.crystalId)}
                >
                  <span className="task-chip-icon" aria-hidden="true">
                    {task.icon}
                  </span>
                  <span className="task-chip-title">
                    {t(task.labelKey)}
                  </span>
                  <span className="sr-only">{t(task.descKey)}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
