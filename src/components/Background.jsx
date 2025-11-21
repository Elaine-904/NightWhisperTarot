import React, { useEffect, useRef } from "react";

const CLOUD_THEMES = new Set(["day", "sunset", "cloud"]);

function paintGradient(ctx, w, h, theme) {
  const g = ctx.createLinearGradient(0, 0, 0, h);

  if (theme === "day") {
    g.addColorStop(0, "#7aa8ff");
    g.addColorStop(0.38, "#8fc2ff");
    g.addColorStop(1, "#c5e6ff");
  } else if (theme === "aurora") {
    g.addColorStop(0, "#0c1a2e");
    g.addColorStop(0.36, "#1b3255");
    g.addColorStop(0.7, "#1a2c48");
    g.addColorStop(1, "#0a0d1e");
  } else if (theme === "sunset") {
    g.addColorStop(0, "#ffcab1");
    g.addColorStop(0.42, "#f284ff");
    g.addColorStop(1, "#2b0f45");
  } else if (theme === "rain") {
    g.addColorStop(0, "#1d2536");
    g.addColorStop(0.6, "#101525");
    g.addColorStop(1, "#070c19");
  } else if (theme === "snow") {
    g.addColorStop(0, "#0f1328");
    g.addColorStop(0.65, "#0a0d1d");
    g.addColorStop(1, "#070914");
  } else if (theme === "cloud") {
    g.addColorStop(0, "#5f6f8d");
    g.addColorStop(0.58, "#43506a");
    g.addColorStop(1, "#2a3246");
  } else {
    g.addColorStop(0, "#050715");
    g.addColorStop(0.5, "#0c0f28");
    g.addColorStop(1, "#17163b");
  }

  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  // Soft horizon bloom for depth
  const bloom = ctx.createRadialGradient(w * 0.5, h * 0.78, h * 0.05, w * 0.5, h * 0.8, h * 0.55);
  if (theme === "sunset") {
    bloom.addColorStop(0, "rgba(255,170,140,0.42)");
  } else if (theme === "day") {
    bloom.addColorStop(0, "rgba(255,255,255,0.33)");
  } else if (theme === "rain") {
    bloom.addColorStop(0, "rgba(160,190,220,0.16)");
  } else if (theme === "snow") {
    bloom.addColorStop(0, "rgba(180,210,255,0.22)");
  } else {
    bloom.addColorStop(0, "rgba(140,170,255,0.15)");
  }
  bloom.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = bloom;
  ctx.fillRect(0, 0, w, h);
}

function makeClouds(count, w, h, bandTop, bandHeight) {
  return Array.from({ length: count }, () => {
    const width = 60 + Math.random() * 90;
    const height = 16 + Math.random() * 12;
    const depth = 0.6 + Math.random() * 0.9; // depth affects speed and alpha
    const y = bandTop * h + Math.random() * bandHeight * h;
    const speed = (10 + Math.random() * 22) * depth; // px per second, very slow drift
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

function makeRain(count, w, h) {
  return Array.from({ length: count }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    speed: 220 + Math.random() * 120,
    height: 10 + Math.random() * 8,
    sway: 25 + Math.random() * 28,
  }));
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

function drawClouds(ctx, clouds, dt, w, time) {
  for (const c of clouds) {
    c.x += c.speed * dt;
    if (c.x > w + 120) c.x = -120;

    const x = Math.round(c.x);
    const floatY = Math.sin(time * 0.4 + c.phase) * c.floatAmp;
    const y = Math.round(c.y + floatY);
    const mainW = Math.round(c.width);
    const mainH = Math.round(c.height);

    ctx.globalAlpha = c.shade * (0.85 * c.depth);
    ctx.fillStyle = "rgba(236,240,252,0.95)";

    // Smooth pillow cloud made from overlapping ellipses
    ctx.beginPath();
    ctx.ellipse(x, y, mainW * 0.55, mainH * 0.9, 0, 0, Math.PI * 2);
    ctx.ellipse(x + mainW * 0.35, y - mainH * 0.35, mainW * 0.55, mainH * 0.85, 0, 0, Math.PI * 2);
    ctx.ellipse(x + mainW * 0.7, y, mainW * 0.5, mainH * 0.8, 0, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();

    ctx.globalAlpha = 1;
  }
}

function drawRain(ctx, drops, dt, w, h) {
  const wind = 36;
  ctx.strokeStyle = "rgba(190,205,255,0.55)";
  ctx.lineWidth = 1;
  ctx.lineCap = "round";

  for (const r of drops) {
    r.y += r.speed * dt;
    r.x += wind * dt;
    const sx = r.x - r.sway * 0.04;
    const sy = r.y;
    const ex = r.x + r.sway * 0.04 + wind * 0.2;
    const ey = r.y + r.height;

    if (r.y > h + 10) {
      r.y = -10;
      r.x = Math.random() * w;
    }

    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(ex, ey);
    ctx.stroke();
  }
}

function drawSnow(ctx, flakes, dt, w, h) {
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
}

function drawMist(ctx, w, h, theme, time) {
  const baseAlpha =
    theme === "day"
      ? 0.1
      : theme === "sunset"
        ? 0.16
        : theme === "rain"
          ? 0.24
          : theme === "snow"
            ? 0.18
            : theme === "aurora"
              ? 0.2
              : 0.14;
  if (baseAlpha <= 0) return;

  const layers = 3;
  for (let i = 0; i < layers; i++) {
    const y = h * (0.2 + i * 0.16) + Math.cos(time * 0.25 + i) * 8;
    const height = h * (0.05 + i * 0.04);
    const offset = Math.sin(time * (0.32 + i * 0.05)) * 60;
    const g = ctx.createLinearGradient(0, y, w, y + height);
    const hue =
      theme === "sunset"
        ? "255,180,210"
        : theme === "day"
          ? "255,255,255"
          : theme === "rain"
            ? "170,195,230"
            : theme === "snow"
              ? "200,215,255"
              : theme === "aurora"
                ? "160,255,210"
                : "170,200,255";
    g.addColorStop(0, `rgba(${hue},0)`);
    g.addColorStop(0.15, `rgba(${hue},${baseAlpha * 0.35})`);
    g.addColorStop(0.5, `rgba(${hue},${baseAlpha})`);
    g.addColorStop(0.85, `rgba(${hue},${baseAlpha * 0.4})`);
    g.addColorStop(1, `rgba(${hue},0)`);

    ctx.fillStyle = g;
    ctx.fillRect(-80 + offset, y, w + 160, height);
  }
}

export default function Background({ theme }) {
  const canvasRef = useRef(null);
  const layersRef = useRef({ clouds: [], rain: [], snow: [] });
  const sizeRef = useRef({ w: 0, h: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
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
      if (CLOUD_THEMES.has(theme)) {
        const bandTop = theme === "sunset" ? 0.12 : 0.05;
        const bandHeight = theme === "cloud" ? 0.36 : 0.3;
        layersRef.current = {
          clouds: makeClouds(theme === "cloud" ? 12 : 9, w, h, bandTop, bandHeight),
          rain: [],
          snow: [],
        };
      } else if (theme === "rain") {
        layersRef.current = { clouds: [], rain: makeRain(160, w, h), snow: [] };
      } else if (theme === "snow") {
        layersRef.current = { clouds: [], rain: [], snow: makeSnow(120, w, h) };
      } else {
        layersRef.current = { clouds: [], rain: [], snow: [] };
      }
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

      const { w, h } = sizeRef.current;
      paintGradient(ctx, w, h, theme);
      drawMist(ctx, w, h, theme, time);

      const { clouds, rain, snow } = layersRef.current;
      if (clouds.length) drawClouds(ctx, clouds, dt, w, time);
      if (rain.length) drawRain(ctx, rain, dt, w, h);
      if (snow.length) drawSnow(ctx, snow, dt, w, h);

      frameId = requestAnimationFrame(frame);
    }

    frameId = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);
    };
  }, [theme]);

  return <canvas ref={canvasRef} className="pixel-bg" />;
}
