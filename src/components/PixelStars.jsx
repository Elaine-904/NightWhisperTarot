import React, { useMemo } from "react";

// Lightweight pixel star overlay to keep the dreamy, retro vibe
export default function PixelStars({ theme, boost = false, accent }) {
  const stars = useMemo(() => {
    const count = boost ? 220 : 140;
    return Array.from({ length: count }, () => {
      const size = Math.random() > 0.82 ? 2 : 1;
      const tint =
        accent && Math.random() > 0.35 ? accent : boost && Math.random() > 0.6 ? "#b6e7ff" : "#fdfbff";
      return {
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        size,
        alpha: 0.35 + Math.random() * 0.55,
        tint,
      };
    });
  }, [boost, accent]);

  return (
    <div className={`pix-star-layer pix-${theme}`}>
      {stars.map((star, idx) => (
        <span
          key={idx}
          className="pix-star"
          style={{
            left: star.left,
            top: star.top,
            width: star.size,
            height: star.size,
            opacity: star.alpha,
            background: star.tint,
            boxShadow: accent
              ? `0 0 ${star.size > 1 ? 9 : 6}px ${accent}`
              : boost
                ? `0 0 ${star.size > 1 ? 8 : 5}px rgba(180,224,255,0.6)`
                : undefined,
          }}
        />
      ))}
    </div>
  );
}
