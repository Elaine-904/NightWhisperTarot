import React from "react";

export default function CrystalGarden({
  crystals = [],
  dailyCrystal,
  t,
  dailyCrystalLimit = 1,
  dailyCrystalClaimed = 0,
  dailyCrystalRemaining = 1,
}) {
  const heroCrystal =
    dailyCrystal ||
    crystals[0] || {
      emoji: "💠",
      name: t("dream.crystalGardenTitle"),
      note: t("dream.crystalGardenHint"),
    };
  const limitLine = t("dream.collectibleLimit", {
    claimed: dailyCrystalClaimed,
    limit: dailyCrystalLimit,
  });
  const limitNote =
    dailyCrystalRemaining > 0
      ? t("dream.collectibleReady")
      : t("dream.collectibleLocked");

  const heroNote =
    dailyCrystal?.reason ||
    heroCrystal.note ||
    heroCrystal.guardianNote ||
    t("dream.crystalGardenHint");
  const detailNote =
    dailyCrystal?.note ||
    heroCrystal.use ||
    heroCrystal.nightly ||
    t("dream.crystalGardenHint");

  return (
    <section className="crystal-garden crystal-garden--simple">
      <div className="garden-header">
        <div>
          <div className="garden-title">{t("dream.crystalGardenTitle")}</div>
          <div className="garden-sub">{t("dream.crystalGardenHint")}</div>
        </div>
        <div className="garden-limit garden-limit--simple">
          <span className="limit-pill">{limitLine}</span>
          <span className="limit-note">{limitNote}</span>
        </div>
      </div>

      <div className="garden-hero">
        <div
          className="floating-crystal"
          style={
            heroCrystal.palette?.[0]
              ? { boxShadow: `0 0 40px ${heroCrystal.palette[0]}40` }
              : undefined
          }
        >
          <div className="floating-crystal-core">
            <span aria-hidden="true">{heroCrystal.emoji || "💠"}</span>
          </div>
          <span className="floating-crystal-ring" />
          <span className="floating-crystal-ring floating-crystal-ring--alt" />
        </div>

        <div className="hero-copy">
          <div className="hero-name">{heroCrystal.name}</div>
          <p className="hero-note">{heroNote}</p>
        </div>
      </div>

      <div className="garden-summary">
        <div className="summary-card">
          <span className="summary-label">{t("dream.crystalCollected")}</span>
          <strong className="summary-value">{crystals.length}</strong>
        </div>
        <div className="summary-card">
          <span className="summary-label">{t("dream.dailyCrystalLabel")}</span>
          <strong className="summary-value">
            {dailyCrystal?.name || t("dream.crystalGardenHint")}
          </strong>
        </div>
      </div>

      <p className="garden-note">{detailNote}</p>
    </section>
  );
}
