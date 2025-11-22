import React, { useEffect, useRef } from "react";

const WEATHER_CLOUDS = new Set(["cloud", "day", "sunset", "night"]);

export const BACKGROUND_THEMES = [
  {
    id: "moonlit-night",
    label: "Moonlit Night",
    emoji: "🌙",
    accent: "#cfe4ff",
    gradientStops: [
      { offset: 0, color: "#010413" },
      { offset: 0.3, color: "#050d28" },
      { offset: 0.7, color: "#0b1b44" },
      { offset: 1, color: "#150f3a" },
    ],
    mistColor: "186, 210, 255",
    mistAlpha: 0.2,
    cloudBand: { count: 10, bandTop: 0.06, bandHeight: 0.32 },
    moon: true,
    symbols: { count: 8, palette: ["#cfe4ff", "#d7a8ff", "#85d5ff"] },
    sparkles: { count: 48, palette: ["#ffffff", "#bfe4ff"] },
  },
  {
    id: "aurora",
    label: "Aurora Dream",
    emoji: "🌌",
    accent: "#9ef3ff",
    gradientStops: [
      { offset: 0, color: "#03081c" },
      { offset: 0.35, color: "#0f2f62" },
      { offset: 0.65, color: "#231848" },
      { offset: 1, color: "#041223" },
    ],
    mistColor: "116, 190, 255",
    mistAlpha: 0.22,
    cloudBand: { count: 6, bandTop: 0.05, bandHeight: 0.36 },
    aurora: true,
    symbols: { count: 6, palette: ["#b2f4ff", "#ffd5ff", "#7ec7ff"] },
    sparkles: { count: 38, palette: ["#adf0ff", "#ffc5ff"] },
  },
  {
    id: "tarot-chamber",
    label: "Tarot Chamber",
    emoji: "🔮",
    accent: "#f6b8ff",
    gradientStops: [
      { offset: 0, color: "#020512" },
      { offset: 0.38, color: "#1c0a32" },
      { offset: 0.68, color: "#2e1145" },
      { offset: 1, color: "#080217" },
    ],
    mistColor: "205, 150, 255",
    mistAlpha: 0.25,
    cloudBand: { count: 8, bandTop: 0.04, bandHeight: 0.28 },
    symbols: { count: 10, palette: ["#ffd5ff", "#c4d5ff", "#d8ffef"] },
    sparkles: { count: 32, palette: ["#ffe7ff", "#ccdfff"] },
    magicCircle: { count: 2 },
  },
  {
    id: "crystal-garden",
    label: "Crystal Garden",
    emoji: "💠",
    accent: "#ffd4f3",
    gradientStops: [
      { offset: 0, color: "#fff6ff" },
      { offset: 0.3, color: "#fddcf5" },
      { offset: 0.65, color: "#e0c3ed" },
      { offset: 1, color: "#a467c3" },
    ],
    mistColor: "255, 225, 255",
    mistAlpha: 0.27,
    cloudBand: { count: 6, bandTop: 0.18, bandHeight: 0.25 },
    symbols: { count: 6, palette: ["#ffe4ff", "#fff0f8"] },
    sparkles: { count: 72, palette: ["#fff8ff", "#ffd7f5"] },
    glow: true,
  },
];

const DEFAULT_THEME = BACKGROUND_THEMES[0];
const THEME_MAP = BACKGROUND_THEMES.reduce((acc, theme) => {
  acc[theme.id] = theme;
  return acc;
}, {});
const DEFAULT_STOPS = [
  { offset: 0, color: "#050715" },
  { offset: 0.5, color: "#0c0f28" },
  { offset: 1, color: "#17163b" },
];

function paintGradient(ctx, w, h, config) {
  const stops = config.gradientStops || DEFAULT_STOPS;
  const gradient = ctx.createLinearGradient(0, 0, 0, h);
  stops.forEach(({ offset, color }) => gradient.addColorStop(offset, color));
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, w, h);

  const glowColor = config.horizonGlowColor || "255,255,255";
  const glowAlpha = config.horizonGlowAlpha ?? 0.15;
  const glow = ctx.createRadialGradient(
    w * 0.72,
    h * 0.75,
    h * 0.08,
    w * 0.72,
    h * 0.78,
    h * 0.65
  );
  glow.addColorStop(0, `rgba(${glowColor},${glowAlpha})`);
  glow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

function drawSoftGlow(ctx, w, h, config) {
  if (!config.glow) return;
  const glow = ctx.createRadialGradient(
    w * 0.7,
    h * 0.55,
    0,
    w * 0.7,
    h * 0.55,
    h * 0.4
  );
  glow.addColorStop(0, `rgba(${config.mistColor},0.3)`);
  glow.addColorStop(0.7, `rgba(${config.mistColor},0.02)`);
  glow.addColorStop(1, "rgba(255,255,255,0)");
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

function drawMist(ctx, w, h, config, time) {
  const hue = config.mistColor || "170, 190, 255";
  const baseAlpha = config.mistAlpha ?? 0.18;
  const layers = 3;
  for (let i = 0; i < layers; i += 1) {
    const y = h * (0.2 + i * 0.16) + Math.cos(time * 0.25 + i) * 8;
    const height = h * (0.05 + i * 0.04);
    const offset = Math.sin(time * (0.32 + i * 0.05)) * 60;
    const grad = ctx.createLinearGradient(0, y, w, y + height);
    grad.addColorStop(0, `rgba(${hue},0)`);
    grad.addColorStop(0.15, `rgba(${hue},${baseAlpha * 0.35})`);
    grad.addColorStop(0.5, `rgba(${hue},${baseAlpha})`);
    grad.addColorStop(0.85, `rgba(${hue},${baseAlpha * 0.4})`);
    grad.addColorStop(1, `rgba(${hue},0)`);
    ctx.fillStyle = grad;
    ctx.fillRect(-80 + offset, y, w + 160, height);
  }
}

function makeClouds(count, w, h, bandTop, bandHeight) {
  return Array.from({ length: count }, () => {
    const width = 60 + Math.random() * 90;
    const height = 16 + Math.random() * 12;
    const depth = 0.6 + Math.random() * 0.9;
    const y = bandTop * h + Math.random() * bandHeight * h;
    const speed = (10 + Math.random() * 22) * depth;
    return {
      x: Math.random() * (w + 160) - 80,
      y,
      width,
      height,
      speed,
      depth,
      shade: 0.68 + Math.random() * 0.18,
      phase: Math.random() * Math.PI * 2,
      floatAmp: 4 + Math.random() * 8,
    };
  });
}

function drawClouds(ctx, clouds, dt, w, time, config) {
  if (!clouds.length) return;
  ctx.save();
  const color = config.cloudColor || "rgba(238,240,252,0.95)";
  for (const c of clouds) {
    c.x += c.speed * dt;
    if (c.x > w + 120) c.x = -120;
    const x = Math.round(c.x);
    const floatY = Math.sin(time * 0.4 + c.phase) * c.floatAmp;
    const y = Math.round(c.y + floatY);
    const mainW = Math.round(c.width);
    const mainH = Math.round(c.height);
    ctx.globalAlpha = Math.max(0.15, c.shade * (0.85 * c.depth));
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(x, y, mainW * 0.55, mainH * 0.9, 0, 0, Math.PI * 2);
    ctx.ellipse(
      x + mainW * 0.35,
      y - mainH * 0.35,
      mainW * 0.55,
      mainH * 0.85,
      0,
      0,
      Math.PI * 2
    );
    ctx.ellipse(x + mainW * 0.7, y, mainW * 0.5, mainH * 0.8, 0, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

function makeRain(count, w, h) {
  return Array.from({ length: count }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    speed: 220 + Math.random() * 120,
    height: 10 + Math.random() * 8,
    sway: 25 + Math.random() * 28,
  }));
}

function drawRain(ctx, drops, dt, w, h) {
  if (!drops.length) return;
  ctx.save();
  ctx.strokeStyle = "rgba(190,205,255,0.55)";
  ctx.lineWidth = 1;
  ctx.lineCap = "round";
  const wind = 36;
  for (const r of drops) {
    r.y += r.speed * dt;
    r.x += wind * dt;
    if (r.y > h + 10) {
      r.y = -10;
      r.x = Math.random() * w;
    }
    const sx = r.x - r.sway * 0.04;
    const sy = r.y;
    const ex = r.x + r.sway * 0.04 + wind * 0.2;
    const ey = r.y + r.height;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(ex, ey);
    ctx.stroke();
  }
  ctx.restore();
}

function makeSnow(count, w, h) {
  return Array.from({ length: count }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    speed: 24 + Math.random() * 18,
    drift: (Math.random() - 0.5) * 18,
    swing: Math.random() * Math.PI * 2,
  }));
}

function drawSnow(ctx, flakes, dt, w, h) {
  if (!flakes.length) return;
  ctx.save();
  ctx.fillStyle = "rgba(240,245,255,0.9)";
  for (const f of flakes) {
    f.y += f.speed * dt;
    f.x += Math.sin(f.y * 0.02 + f.swing) * 8 * dt + f.drift * dt;
    f.swing += 0.28 * dt;
    if (f.y > h) f.y = -6;
    if (f.x > w) f.x = 0;
    if (f.x < 0) f.x = w;
    ctx.fillRect(Math.round(f.x), Math.round(f.y), 2, 2);
  }
  ctx.restore();
}

function makeSymbols(opts, w, h) {
  const count = opts.count || 6;
  return Array.from({ length: count }, () => ({
    x: Math.random() * w,
    y: Math.random() * h * 0.55,
    size: 12 + Math.random() * 24,
    phase: Math.random() * Math.PI * 2,
    rotation: Math.random() * Math.PI * 2,
    palette: opts.palette || ["#e8f0ff", "#ffcce5", "#bde8ff"],
  }));
}

function drawSymbols(ctx, symbols, time) {
  if (!symbols.length) return;
  ctx.save();
  ctx.lineWidth = 1.2;
  symbols.forEach((sym) => {
    const alpha = 0.3 + Math.sin(time * 0.6 + sym.phase) * 0.25;
    ctx.globalAlpha = Math.max(0.15, alpha);
    const palette = sym.palette;
    const paletteIdx =
      Math.abs(Math.floor(Math.sin(time * 0.3 + sym.phase) * palette.length)) % palette.length;
    ctx.strokeStyle = palette[paletteIdx];
    ctx.save();
    ctx.translate(sym.x, sym.y + Math.sin(time * sym.phase) * 8);
    ctx.rotate(sym.rotation + Math.sin(time * 0.2) * 0.4);
    ctx.beginPath();
    ctx.arc(0, 0, sym.size * 0.3, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, sym.size * 0.4);
    ctx.lineTo(0, sym.size * 0.85);
    ctx.moveTo(0, -sym.size * 0.4);
    ctx.lineTo(0, -sym.size * 0.85);
    ctx.moveTo(sym.size * 0.4, 0);
    ctx.lineTo(sym.size * 0.85, 0);
    ctx.moveTo(-sym.size * 0.4, 0);
    ctx.lineTo(-sym.size * 0.85, 0);
    ctx.stroke();
    ctx.restore();
  });
  ctx.restore();
}

function makeSparkles(opts, w, h) {
  const count = opts.count || 40;
  return Array.from({ length: count }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    size: 1 + Math.random() * 2.4,
    phase: Math.random() * Math.PI * 2,
    palette: opts.palette || ["#fff"],
  }));
}

function drawSparkles(ctx, sparkles, time) {
  if (!sparkles.length) return;
  ctx.save();
  sparkles.forEach((spark) => {
    const alpha = 0.35 + Math.sin(time * 0.7 + spark.phase) * 0.25;
    ctx.globalAlpha = Math.max(0.15, alpha);
    const palette = spark.palette;
    const paletteIdx =
      Math.abs(Math.floor(Math.sin(time * 0.4 + spark.phase) * palette.length)) % palette.length;
    ctx.fillStyle = palette[paletteIdx];
    const sway = Math.sin(time * 0.5 + spark.phase) * 8;
    ctx.beginPath();
    ctx.arc(spark.x + sway, spark.y, spark.size, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();
}

function makeMagicCircles(opts, w, h) {
  const count = opts.count || 1;
  return Array.from({ length: count }, (_, idx) => ({
    radius: h * 0.2 + idx * h * 0.04,
    phase: idx * 0.6,
  }));
}

function drawMagicCircles(ctx, circles, time, w, h) {
  if (!circles.length) return;
  ctx.save();
  ctx.translate(w * 0.5, h * 0.72);
  ctx.lineWidth = 1.2;
  ctx.strokeStyle = "rgba(255,255,255,0.2)";
  circles.forEach((circle) => {
    ctx.save();
    ctx.rotate(Math.sin(time * 0.4 + circle.phase) * 0.22);
    ctx.beginPath();
    ctx.arc(0, 0, circle.radius, 0, Math.PI * 1.4);
    ctx.stroke();
    ctx.restore();
  });
  ctx.restore();
}

function drawAurora(ctx, w, h, config, time) {
  if (!config.aurora) return;
  ctx.save();
  ctx.globalAlpha = 0.65;
  const grad = ctx.createLinearGradient(0, h * 0.2, w, h * 0.55);
  grad.addColorStop(0, "rgba(150,255,220,0.05)");
  grad.addColorStop(0.35, "rgba(70,220,255,0.32)");
  grad.addColorStop(0.65, "rgba(130,130,255,0.28)");
  grad.addColorStop(1, "rgba(30,10,40,0)");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(-w * 0.1, h * 0.3);
  ctx.bezierCurveTo(
    w * 0.15,
    h * 0.18 + Math.sin(time * 0.8) * 20,
    w * 0.35,
    h * 0.5 + Math.cos(time * 0.5) * 12,
    w * 0.6,
    h * 0.36
  );
  ctx.bezierCurveTo(
    w * 0.75,
    h * 0.25 + Math.sin(time * 0.4) * 14,
    w * 1.05,
    h * 0.44,
    w * 1.2,
    h * 0.32
  );
  ctx.lineTo(w * 1.2, h * 0.55);
  ctx.bezierCurveTo(
    w * 0.78,
    h * 0.6 + Math.sin(time * 0.3) * 18,
    w * 0.42,
    h * 0.6 + Math.cos(time * 0.6) * 15,
    -w * 0.1,
    h * 0.5
  );
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawMoonGlow(ctx, w, h, config, time) {
  if (!config.moon) return;
  ctx.save();
  const x = w * 0.78 + Math.sin(time * 0.22) * 12;
  const y = h * 0.2 + Math.cos(time * 0.2) * 8;
  const radius = h * 0.12;
  const halo = ctx.createRadialGradient(x, y, radius * 0.2, x, y, radius);
  halo.addColorStop(0, "rgba(255,255,224,0.45)");
  halo.addColorStop(1, "rgba(255,255,224,0)");
  ctx.fillStyle = halo;
  ctx.fillRect(0, 0, w, h);
  ctx.beginPath();
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.arc(x, y, radius * 0.65, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export default function Background({ weather, themeId }) {
  const canvasRef = useRef(null);
  const layersRef = useRef({
    clouds: [],
    rain: [],
    snow: [],
    symbols: [],
    sparkles: [],
    circles: [],
  });
  const sizeRef = useRef({ w: 0, h: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return () => {};
    const ctx = canvas.getContext("2d");

    function syncSize() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      if (w !== sizeRef.current.w || h !== sizeRef.current.h) {
        sizeRef.current = { w, h };
        canvas.width = w;
        canvas.height = h;
      }
    }

    function seedLayers() {
      const { w, h } = sizeRef.current;
      const config = THEME_MAP[themeId] || DEFAULT_THEME;
      const band = config.cloudBand || { count: 9, bandTop: 0.05, bandHeight: 0.3 };
      layersRef.current = {
        clouds: WEATHER_CLOUDS.has(weather)
          ? makeClouds(band.count, w, h, band.bandTop, band.bandHeight)
          : [],
        rain: weather === "rain" ? makeRain(160, w, h) : [],
        snow: weather === "snow" ? makeSnow(120, w, h) : [],
        symbols: config.symbols ? makeSymbols(config.symbols, w, h) : [],
        sparkles: config.sparkles ? makeSparkles(config.sparkles, w, h) : [],
        circles: config.magicCircle ? makeMagicCircles(config.magicCircle, w, h) : [],
      };
    }

    syncSize();
    seedLayers();
    const handleResize = () => {
      syncSize();
      seedLayers();
    };
    window.addEventListener("resize", handleResize);

    let frameId;
    let last = performance.now();

    function frame(now) {
      const dt = Math.min((now - last) / 1000, 0.08);
      const time = now * 0.001;
      last = now;
      const config = THEME_MAP[themeId] || DEFAULT_THEME;
      const { w, h } = sizeRef.current;
      paintGradient(ctx, w, h, config);
      drawAurora(ctx, w, h, config, time);
      drawMist(ctx, w, h, config, time);
      drawSoftGlow(ctx, w, h, config);
      const { clouds, rain, snow, symbols, sparkles, circles } = layersRef.current;
      if (clouds.length) drawClouds(ctx, clouds, dt, w, time, config);
      if (rain.length) drawRain(ctx, rain, dt, w, h);
      if (snow.length) drawSnow(ctx, snow, dt, w, h);
      if (config.moon) drawMoonGlow(ctx, w, h, config, time);
      if (symbols.length) drawSymbols(ctx, symbols, time);
      if (sparkles.length) drawSparkles(ctx, sparkles, time);
      if (circles.length) drawMagicCircles(ctx, circles, time, w, h);
      frameId = requestAnimationFrame(frame);
    }

    frameId = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);
    };
  }, [weather, themeId]);

  return <canvas ref={canvasRef} className="pixel-bg" />;
}
