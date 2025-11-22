// src/App.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import Background, { BACKGROUND_THEMES } from "./components/Background";
import PixelStars from "./components/PixelStars";
import TarotCard from "./components/TarotCard";
import DreamBottle from "./components/DreamBottle";
import TarotEncyclopedia from "./components/TarotEncyclopedia";
import MoonCycleEngine from "./components/MoonCycleEngine";
import MysticChat from "./components/MysticChat";
import LangSwitcher from "./components/LangSwitcher";
import { getBrowserLang, LANGS, useI18n } from "./i18n";
import { CARDS } from "./data/cards";
import {
  CRYSTAL_LIBRARY,
  CARD_CRYSTAL_MAP,
  makeCrystalSnapshot,
  recommendCrystal,
} from "./data/crystals";
import { askAI } from "./api/aiClient";
import { getMoonCycle } from "./moon";
import html2canvas from "html2canvas";

const SPREAD_POSITIONS = ["past", "present", "future"];
const SPREAD_FREE_LIMIT = 3;
const SPREAD_COUNT_KEY = "nightSpreadCount";
const LANG_STORAGE_KEY = "nightwhisper-lang";
const TAROT_STAGES = new Set([
  "tarot",
  "draw",
  "result",
  "three",
  "encyclopedia",
]);

const AMBIENT_TRACKS = [
  {
    id: "night-wind",
    label: "Night Chimes",      // 原文: 夜风风铃
    note: "Default Breeze",     // 原文: 默认夜风
    url: "/night-wind-chimes.wav",
    volume: 0.45,
    icon: "🌙",
  },
  {
    id: "cafe-hum",
    label: "Cafe",              // 原文: 咖啡厅
    note: "Soft Piano",         // 原文: 柔和钢琴
    url: "/cafe-chill.mp3",
    volume: 0.35,
    icon: "☕",
  },
  {
    id: "forest-soft",
    label: "Forest",            // 原文: 森林
    note: "Stream & Insects",   // 原文: 溪水虫鸣
    url: "/forest-nature.mp3",
    volume: 0.5,
    icon: "🌲",
  },
];

const CRYSTAL_COLLECTION_KEY = "nightCrystals";
const CRYSTAL_IDS = Object.keys(CRYSTAL_LIBRARY);

function readCrystalGarden() {
  if (typeof window === "undefined") return [];
  try {
    const stored = JSON.parse(localStorage.getItem(CRYSTAL_COLLECTION_KEY));
    if (Array.isArray(stored)) return stored;
  } catch (err) {
    console.warn("Failed to read crystals:", err);
  }
  return [];
}

function readSpreadCount() {
  if (typeof window === "undefined") return 0;
  try {
    const stored = parseInt(localStorage.getItem(SPREAD_COUNT_KEY) || "0", 10);
    if (Number.isNaN(stored)) return 0;
    return Math.max(0, stored);
  } catch (err) {
    console.warn("Failed to read spread usage:", err);
    return 0;
  }
}

const DAILY_CRYSTAL_LIMIT = 1;
const DAILY_CRYSTAL_TRACKER_KEY = "nightCrystalDailyTracker";

function readDailyCrystalRecord() {
  if (typeof window === "undefined") return { date: null, count: 0 };
  try {
    const raw = localStorage.getItem(DAILY_CRYSTAL_TRACKER_KEY);
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") {
      const date = typeof parsed.date === "string" ? parsed.date : null;
      const count = Number(parsed.count);
      return {
        date,
        count: Number.isNaN(count) ? 0 : count,
      };
    }
  } catch (err) {
    console.warn("Failed to read daily crystal record:", err);
  }
  return { date: null, count: 0 };
}

function getGuardianCrystalId(card) {
  if (!card) return null;
  const override = CARD_CRYSTAL_MAP[card.id];
  if (override) return override;
  if (!CRYSTAL_IDS.length) return null;
  const hash = card.id
    .split("")
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return CRYSTAL_IDS[hash % CRYSTAL_IDS.length];
}

const SECRET_SEED_KEY = "nightwhisper.secretSeed";
const PROPHECY_LINES = [
  "Moonlight tucks the answer around the corner, keeping a lamp on for the passing self.",
  "The night wind flips an old dream over, carrying a seed of glimmering light.",
  "Look up at the crack in the ceiling; it might open right into a sea of stars.",
  "Fold the unsent letter into a boat, floating in a glass waiting for a moon tide.",
  "Even a speck of dust knows the way home, as long as the light stays on.",
];

const SECRET_POOL = [
  { 
    id: "moon-fragment", 
    label: "Moon Fragment", 
    desc: "Cards glow with shattered moonlight borders, echoing softly in the night wind." 
  },
  { 
    id: "mystery-bottle", 
    label: "Mystery Bottle", 
    desc: "A hidden star-whisper is buried inside the Dream Bottle." 
  },
  { 
    id: "lost-star-stone", 
    label: "Lost Star Stone", 
    desc: "Pixel constellations twinkle twice as fast, glowing briefly when near the Star Stone." 
  },
  { 
    id: "prophecy-line", 
    label: "Prophecy Line", 
    desc: "A single line of prophecy appears on the homepage, meant only for tonight." 
  },
  { 
    id: "arcana-half", 
    label: "Hidden Card · 0.5", 
    desc: "Adds a Major Arcana 0.5: 'The Between'." 
  },
  { 
    id: "easter-aurora", 
    label: "Secret Aurora", 
    desc: "Background shifts to an aurora halo, glowing throughout the night." 
  },
];

const ARCANA_HALF_SVG = `
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 620'>
  <defs>
    <linearGradient id='g' x1='0' x2='0' y1='0' y2='1'>
      <stop offset='0%' stop-color='#0f1230'/>
      <stop offset='55%' stop-color='#26124d'/>
      <stop offset='100%' stop-color='#0a0c1e'/>
    </linearGradient>
  </defs>
  <rect width='400' height='620' fill='url(#g)'/>
  <circle cx='200' cy='120' r='70' fill='rgba(255,255,255,0.12)'/>
  <path d='M120 180 Q200 120 280 180 T200 320 T120 180' fill='rgba(195,170,255,0.24)'/>
  <text x='200' y='340' text-anchor='middle' fill='#e8e1ff' font-size='62' font-family='serif'>0.5</text>
  <text x='200' y='380' text-anchor='middle' fill='#cde9ff' font-size='16' font-family='serif'>The Between</text>
  <path d='M90 440 Q200 520 310 440' stroke='#b5f4ff' stroke-width='2' fill='none'/>
  <path d='M110 480 Q200 560 290 480' stroke='#ffd2ff' stroke-width='1.6' fill='none'/>
  <circle cx='140' cy='460' r='6' fill='#93e8ff'/>
  <circle cx='260' cy='460' r='6' fill='#f7d9ff'/>
</svg>
`;

const ARCANA_HALF_CARD = {
  id: "arcana-0-5",
  index: 0.5,
  name: "The Between",
  cnName: "0.5 The Between",
  image: `data:image/svg+xml,${encodeURIComponent(ARCANA_HALF_SVG)}`,
  keywords: ["threshold", "moonlit choice", "liminal promise"],
};

// Local fallback in case AI fails (keep English, soft tone)
function makeLocalLines(card, label = "", moonHint = "") {
  const name = card?.name || "a night card";
  const ks = card?.keywords?.filter(Boolean) || [];
  const k0 = ks[0] || "quiet change";
  const k1 = ks[1] || "inner voice";
  const k2 = ks[2] || k0;
  const seed = (label || name).length;
  const pick = (arr, salt = 0) => arr[(seed + salt) % arr.length];
  const lunar = moonHint ? ` · ${moonHint}` : "";

  const symb = pick(
    [
      `${name} sketches ${k0} in the dark${lunar}`,
      `${name} hums softly about ${k0}${lunar}`,
      `${name} casts a lilac light on ${k0}${lunar}`,
    ],
    1
  );

  const remind = pick(
    [
      `Slow down, let ${k1} rise on its own${lunar}`,
      `Notice a small glow around ${k1}${lunar}`,
      `Breathe softer, listen for ${k1}${lunar}`,
    ],
    2
  );

  const action = pick(
    [
      `Tonight, one tiny act toward ${k2}${lunar}`,
      `Save a quiet minute to honor ${k2}${lunar}`,
      `Write a short wish about ${k2}${lunar}`,
    ],
    3
  );

  const prefix = label ? `${label} ` : "";
  return [`${prefix}Symbolism: ${symb}`, `${prefix}Reminder: ${remind}`, `${prefix}Action: ${action}`];
}

function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function resolveTheme(hour, weathercode, isDay) {
  if ([51, 61, 63].includes(weathercode)) return "rain";
  if ([71, 73].includes(weathercode)) return "snow";
  if (weathercode === 3) return "cloud";
  if (hour >= 5 && hour < 17) return "day";
  if (hour >= 17 && hour < 19) return "sunset";
  return "night";
}

function pickOne(arr) {
  if (!Array.isArray(arr) || arr.length === 0) return null;
  return arr[Math.floor(Math.random() * arr.length)];
}

function rollSecretSeed() {
  const todayKey = new Date().toISOString().slice(0, 10);
  if (typeof window === "undefined") {
    return { date: todayKey, hit: false };
  }

  try {
    const cached = JSON.parse(localStorage.getItem(SECRET_SEED_KEY));
    if (cached?.date === todayKey) return cached;
  } catch (err) {
    // ignore parse errors
  }

  const roll = Math.random();
  let entry = { date: todayKey, hit: false };

  if (roll < 0.01) {
    const pick = pickOne(SECRET_POOL);
    entry = {
      date: todayKey,
      hit: true,
      id: pick?.id,
    };

    if (pick?.id === "prophecy-line") {
      entry.payload = { line: pickOne(PROPHECY_LINES) };
    }
  }

  try {
    localStorage.setItem(SECRET_SEED_KEY, JSON.stringify(entry));
  } catch (err) {
    // storage may fail in private mode; ignore
  }

  return entry;
}

const WEATHER_MOODS = {
  rain: { label: "Rain", mood: "introspection", boost: 2 },
  day: { label: "Sun", mood: "optimism", boost: 3 },
  night: { label: "Night", mood: "intuition", boost: 2 },
  sunset: { label: "Sunset", mood: "release", boost: 2 },
  cloud: { label: "Cloud", mood: "grounding", boost: 2 },
  snow: { label: "Snow", mood: "stillness", boost: 2 },
};

const CARD_MOOD_OVERRIDES = {
  hermit: "introspection",
  priestess: "intuition",
  moon: "intuition",
  star: "hope",
  sun: "optimism",
  lovers: "optimism",
  death: "rebirth",
  tower: "truth",
  wheeloffortune: "fate",
  temperance: "balance",
  devil: "shadow",
  judgement: "awakening",
};

function inferCardMood(card) {
  if (!card) return "intuition";
  const override = CARD_MOOD_OVERRIDES[card.id];
  if (override) return override;

  const text = (card.keywords || []).join(" ").toLowerCase();
  if (/(joy|warmth|clarity|growth|hope|connection|alignment)/.test(text)) {
    return "optimism";
  }
  if (/(intuition|dream|silence|reflection|solitude|inner)/.test(text)) {
    return "introspection";
  }
  if (/(change|transition|cycles|rebirth|chance)/.test(text)) {
    return "change";
  }
  if (/(responsibility|structure|truth|decision|fairness)/.test(text)) {
    return "clarity";
  }
  if (/(care|comfort|healing|patience|balance|mixing)/.test(text)) {
    return "soothing";
  }
  if (/(drive|determination|power|willpower)/.test(text)) {
    return "momentum";
  }
  return "mystery";
}

const AFFIRMATION_KEY = "nightAffirmations";

function readAffirmations() {
  try {
    const raw = localStorage.getItem(AFFIRMATION_KEY);
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
  } catch (err) {
    console.warn("Failed to read affirmations", err);
  }
  return [];
}

function affirmationFallback(card) {
  const key = card?.keywords?.find(Boolean) || "gentle becoming";
  return `Tonight I will gently walking into the journey of ${key}`;
}

function buildResonance(theme, card, t) {
  if (!card) return null;
  const weather = WEATHER_MOODS[theme] || WEATHER_MOODS.night;
  const cardMood = inferCardMood(card);
  const aligned = weather.mood === cardMood;
  const score = Math.min(3, Math.max(1, weather.boost + (aligned ? 1 : 0)));
  const descriptor = aligned ? cardMood : `${weather.mood} ↔ ${cardMood}`;
  const note = aligned
    ? t("resonance.noteMatched")
    : t("resonance.noteContrasting");

  return {
    line: `${weather.label} × ${card.name} → ${descriptor} +${score}`,
    note,
    score,
  };
}

const CRYSTAL_BY_MOOD = {
  intuition: { name: "Moonstone", note: "Soft intuition · soft dream guidance", emoji: "💎" },
  introspection: { name: "Celestite", note: "Cloudlight clarity · listen inward", emoji: "💎" },
  optimism: { name: "Sunstone", note: "Honey glow · warm bravery", emoji: "💎" },
  change: { name: "Labradorite", note: "Aurora shield · cross the threshold", emoji: "💎" },
  clarity: { name: "Clear Quartz", note: "Crystal focus · truth amplifier", emoji: "💎" },
  soothing: { name: "Aquamarine", note: "Tide-smooth calm · breath steadiness", emoji: "💎" },
  momentum: { name: "Carnelian", note: "Kindled drive · ember of action", emoji: "💎" },
  mystery: { name: "Obsidian", note: "Night mirror · gentle protection", emoji: "💎" },
};

const CARD_CRYSTAL_OVERRIDES = {
  sun: { name: "Sunstone", note: "Solar joy · playful confidence", emoji: "💎", mood: "optimism" },
  moon: { name: "Moonstone", note: "Silky intuition · dream tides", emoji: "💎", mood: "intuition" },
  star: { name: "Celestite", note: "Starlight hush · airy hope", emoji: "💎", mood: "introspection" },
  priestess: { name: "Moonstone", note: "Veiled wisdom · lunar whisper", emoji: "💎", mood: "intuition" },
  hermit: { name: "Amethyst", note: "Violet stillness · honest insight", emoji: "💎", mood: "introspection" },
};

function suggestCrystal(card) {
  const fallback = { name: "Moonstone", note: "Soft intuition · soft dream guidance", emoji: "💎" };
  if (!card) return fallback;

  const override = CARD_CRYSTAL_OVERRIDES[card.id];
  if (override) return override;

  const mood = inferCardMood(card);
  const pick = CRYSTAL_BY_MOOD[mood] || fallback;
  return { ...pick, mood };
}

function buildSpreadCrystalSet(cards = []) {
  const crystals = { past: null, present: null, future: null };
  SPREAD_POSITIONS.forEach((pos, idx) => {
    crystals[pos] = suggestCrystal(cards[idx]);
  });
  return crystals;
}

function parseCrystalBlock(block, fallback) {
  if (!block) return fallback;
  if (typeof block === "string") {
    const name = block.trim();
    if (!name) return fallback;
    return { ...(fallback || {}), name };
  }
  if (typeof block === "object") {
    const name = block.name || block.crystal || block.title || fallback?.name;
    const note = block.note || block.reason || block.vibe || block.line || fallback?.note;
    const emoji = block.emoji || fallback?.emoji;
    return {
      ...(fallback || {}),
      ...(name ? { name } : null),
      ...(note ? { note } : null),
      ...(emoji ? { emoji } : null),
    };
  }
  return fallback;
}

export default function App() {
  const [lang, setLang] = useState(() => {
    try {
      const stored = localStorage.getItem(LANG_STORAGE_KEY);
      if (stored && LANGS[stored]) return stored;
    } catch (err) {
      // ignore storage errors
    }
    return getBrowserLang();
  });
  const t = useI18n(lang);
  const [stage, setStage] = useState("home");
  const [deck, setDeck] = useState(() => shuffle(CARDS));
  const [currentCard, setCurrentCard] = useState(null);
  const [faceUp, setFaceUp] = useState(false);
  const [reading, setReading] = useState("");
  const [shareBusy, setShareBusy] = useState(false);
  const [shareHint, setShareHint] = useState(() => t("share.hintReady"));
  const [audioOn, setAudioOn] = useState(false);
  const [trackId, setTrackId] = useState(AMBIENT_TRACKS[0].id);
  const [musicPanelOpen, setMusicPanelOpen] = useState(false);
  const [themePanelOpen, setThemePanelOpen] = useState(false);
  const [catChatVisible, setCatChatVisible] = useState(false);
  const [secretSeed, setSecretSeed] = useState(null);
  const [prophecyLine, setProphecyLine] = useState("");

  const initialSpreadCount = useMemo(() => readSpreadCount(), []);
  const [spreadCount, setSpreadCount] = useState(initialSpreadCount);
  const [spreadBlocked, setSpreadBlocked] = useState(
    initialSpreadCount >= SPREAD_FREE_LIMIT
  );
  const [spreadCards, setSpreadCards] = useState([]);
  const [spreadFlips, setSpreadFlips] = useState([false, false, false]);
  const [spreadReading, setSpreadReading] = useState({
    past: "",
    present: "",
    future: "",
  });
  const [spreadLoading, setSpreadLoading] = useState(false);
  const [spreadCrystals, setSpreadCrystals] = useState(() => buildSpreadCrystalSet([]));

  const [weatherTheme, setWeatherTheme] = useState("night");
  const [backgroundThemeId, setBackgroundThemeId] = useState(
    BACKGROUND_THEMES[0].id
  );
  const [moon, setMoon] = useState(() => getMoonCycle());
  const [collectedCrystals, setCollectedCrystals] = useState(() => {
    if (typeof window === "undefined") return [];
    return readCrystalGarden();
  });
  const [dailyCrystalRecord, setDailyCrystalRecord] = useState(() => {
    if (typeof window === "undefined") return { date: null, count: 0 };
    return readDailyCrystalRecord();
  });
  const todayKey = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const dailyCrystalClaimed =
    dailyCrystalRecord.date === todayKey ? dailyCrystalRecord.count : 0;
  const dailyCrystalRemaining = Math.max(
    DAILY_CRYSTAL_LIMIT - dailyCrystalClaimed,
    0
  );
  const [lastGuardianCrystal, setLastGuardianCrystal] = useState(null);
  const ambientAudio = useRef(null);
  const shareRef = useRef(null);
  const [affirmation, setAffirmation] = useState("");
  const [affirmationMeta, setAffirmationMeta] = useState(null);
  const [affirmationLoading, setAffirmationLoading] = useState(false);
  const [savedAffirmations, setSavedAffirmations] = useState(() => {
    if (typeof window === "undefined") return [];
    return readAffirmations();
  });
  const moonTone = useMemo(
    () =>
      moon
        ? `Moon: ${moon.name} ${moon.emoji}. Mood tilt: ${moon.mood}. Action energy ${moon.actionScore}/100. Tone: ${moon.tone}.`
        : "",
    [moon]
  );
  const moonHint = moon ? moon.name.split("·")?.[0]?.trim() || moon.name : "";

  useEffect(() => {
    try {
      localStorage.setItem(LANG_STORAGE_KEY, lang);
    } catch (err) {
      // ignore storage errors
    }
  }, [lang]);

  useEffect(() => {
    setShareHint(t("share.hintReady"));
  }, [lang]);

  useEffect(() => {
    const id = setInterval(() => setMoon(getMoonCycle()), 60 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const seed = rollSecretSeed();
    setSecretSeed(seed);

    if (seed?.hit && seed.id === "prophecy-line") {
      const line = seed.payload?.line || pickOne(PROPHECY_LINES);
      setProphecyLine(line);
      if (!seed.payload?.line) {
        const updated = { ...seed, payload: { ...(seed.payload || {}), line } };
        try {
          localStorage.setItem(SECRET_SEED_KEY, JSON.stringify(updated));
        } catch (err) {
          // ignore storage issue
        }
      }
    }

    if (seed?.hit && seed.id === "easter-aurora") {
      setBackgroundThemeId("aurora");
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (secretSeed?.id === "easter-aurora") {
        return;
      }

      const now = new Date();
      const hour = now.getHours();

      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          if (cancelled || secretSeed?.id === "easter-aurora") return;
          const { latitude, longitude } = pos.coords;
          const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`;
          const res = await fetch(url);
          const data = await res.json();
          const w = data.current_weather;
          if (cancelled || secretSeed?.id === "easter-aurora") return;
          setWeatherTheme(resolveTheme(hour, w.weathercode, w.is_day));
        },
        () => {
          if (cancelled || secretSeed?.id === "easter-aurora") return;
          setWeatherTheme(resolveTheme(hour, 0, 1));
        }
      );
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [secretSeed]);

  useEffect(() => {
    // Build audio element for selected ambient track; keeps autoplay off until the user taps
    const picked =
      AMBIENT_TRACKS.find((t) => t.id === trackId) || AMBIENT_TRACKS[0];
    const audio = new Audio(picked.url);
    audio.loop = true;
    audio.preload = "auto";
    audio.volume = picked.volume ?? 0.45;
    ambientAudio.current = audio;

    return () => {
      audio.pause();
    };
  }, [trackId]);

  useEffect(() => {
    const audio = ambientAudio.current;
    if (!audio) return;

    if (audioOn) {
      audio.currentTime = 0;
      audio.play().catch(() => setAudioOn(false));
    } else {
      audio.pause();
    }
  }, [audioOn, trackId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(AFFIRMATION_KEY, JSON.stringify(savedAffirmations));
  }, [savedAffirmations]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(
        CRYSTAL_COLLECTION_KEY,
        JSON.stringify(collectedCrystals)
      );
    } catch (err) {
      console.warn("Failed to persist crystals:", err);
    }
  }, [collectedCrystals]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(
        DAILY_CRYSTAL_TRACKER_KEY,
        JSON.stringify(dailyCrystalRecord)
      );
    } catch (err) {
      console.warn("Failed to persist daily crystal record:", err);
    }
  }, [dailyCrystalRecord]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(SPREAD_COUNT_KEY, String(spreadCount));
    } catch (err) {
      console.warn("Failed to persist spread count:", err);
    }
  }, [spreadCount]);

  function addCrystalSnapshot(snapshot) {
    if (!snapshot) return null;
    setCollectedCrystals((prev) => {
      const filtered = prev.filter((c) => c.id !== snapshot.id);
      return [snapshot, ...filtered].slice(0, 24);
    });
    return snapshot;
  }

  function grantCrystal(id, context = {}) {
    if (!id || dailyCrystalRemaining <= 0) return null;
    const snapshot = makeCrystalSnapshot(id, context);
    if (!snapshot) return null;
    const added = addCrystalSnapshot(snapshot);
    if (!added) return null;
    setDailyCrystalRecord((prev) => {
      const prevCount = prev.date === todayKey ? prev.count : 0;
      return {
        date: todayKey,
        count: prevCount + 1,
      };
    });
    return added;
  }

  function grantCardGuardian(card) {
    if (!card) return null;
    const guardianId = getGuardianCrystalId(card);
    if (!guardianId) return null;
    return grantCrystal(guardianId, {
      source: "draw",
      cardId: card.id,
    });
  }

  useEffect(() => {
    if (!secretSeed?.hit || secretSeed.id !== "arcana-half") return;
    setDeck((prev) => {
      if (prev.find((c) => c.id === ARCANA_HALF_CARD.id)) return prev;
      return shuffle([...prev, ARCANA_HALF_CARD]);
    });
  }, [secretSeed]);

  function startDraw() {
    setStage("draw");
    setFaceUp(false);
    setReading("");
    setShareBusy(false);
    setShareHint(t("share.hintReady"));
    setAffirmation("");
    setAffirmationMeta(null);
    setAffirmationLoading(false);
  }

  function openDreamBottle() {
    setStage("dream");
  }

  function openMoonCycle() {
    setStage("moon");
  }

  function openMysticChat() {
    setCatChatVisible(true);
  }

  function closeMysticChat() {
    setCatChatVisible(false);
  }

  function openEncyclopedia() {
    setStage("encyclopedia");
  }

  function startSpread() {
    if (spreadCount >= SPREAD_FREE_LIMIT) {
      setSpreadBlocked(true);
      return;
    }

    setSpreadBlocked(false);
    const pool =
      secretSeed?.hit && secretSeed.id === "arcana-half"
        ? [...CARDS, ARCANA_HALF_CARD]
        : CARDS;
    const picks = shuffle(pool).slice(0, 3);
    setSpreadCards(picks);
    setSpreadCrystals(buildSpreadCrystalSet(picks));
    setSpreadFlips([false, false, false]);
    setSpreadReading({ past: "", present: "", future: "" });
    setSpreadLoading(true);
    setStage("three");
    loadSpreadReading(picks);
    setSpreadCount((prev) => Math.min(prev + 1, SPREAD_FREE_LIMIT));
  }

  async function loadAffirmation(card) {
    setAffirmationLoading(true);
    setAffirmationMeta({
      id: `affirm-${Date.now()}`,
      cardName: card?.name || "Night card",
      cardImage: card?.image,
      createdAt: Date.now(),
    });

    const prompt = `
You are NightWhisper — a twilight oracle.

Write ONE short night affirmation (8-18 words). Tone: soft, intimate, like whispering to yourself before sleep.
- Blend English + 中文 is welcome.
- Avoid imperatives; speak as "I".
- Keep it single-line, no quotes, no bullet numbers.
- Mood: pixel moonlight, tender hope.

Card: ${card?.name || "Unknown"}
Keywords: ${(card?.keywords || []).join(", ")}
`;

    const text = await askAI(prompt);
    const line =
      text
        ?.split(/\n+/)
        .map((l) => l.replace(/^[\d\.\-\•\s"]+/, "").replace(/"$/, "").trim())
        .filter(Boolean)?.[0] || affirmationFallback(card);

    setAffirmation(line);
    setAffirmationLoading(false);
  }

  function saveCurrentAffirmation({ toggleFavorite = false, markCover = false } = {}) {
    if (!affirmation) return;
    const id = affirmationMeta?.id || `affirm-${Date.now()}`;
    const base = affirmationMeta || {
      id,
      cardName: currentCard?.name || "Night card",
      cardImage: currentCard?.image,
      createdAt: Date.now(),
    };

    setAffirmationMeta((prev) => ({ ...(prev || base), id }));

    setSavedAffirmations((prev) => {
      const existing = prev.find((a) => a.id === id);
      let next = prev;

      if (existing) {
        const updated = {
          ...existing,
          text: affirmation,
        };
        if (toggleFavorite) updated.favorite = !existing.favorite;
        next = prev.map((a) => (a.id === id ? updated : a));
      } else {
        const newItem = {
          ...base,
          id,
          text: affirmation,
          favorite: toggleFavorite,
          cover: false,
        };
        next = [newItem, ...prev].slice(0, 40);
      }

      if (markCover) {
        next = next.map((a) => ({ ...a, cover: a.id === id }));
      }

      return next;
    });
  }

  async function loadSpreadReading(picks) {
    setSpreadLoading(true);
    const [pastCard, presentCard, futureCard] = picks;

    const prompt = `
You are NightWhisper — a soft, dreamlike tarot oracle.

${moonTone ? `Moon Cycle tone: ${moonTone}
- Infuse every line with this lunar mood; at most one moon nod.
` : ""}
Generate a Past / Present / Future interpretation for three tarot cards.

Return strictly a JSON object shaped like:
{
  "past": { "lines": ["Symbolism", "Gentle Reminder", "Small Action"], "crystal": "Aquamarine" },
  "present": { "lines": ["Symbolism", "Gentle Reminder", "Small Action"], "crystal": "Celestite" },
  "future": { "lines": ["Symbolism", "Gentle Reminder", "Small Action"], "crystal": "Sunstone" }
}

Rules:
- All 9 lines must be unique and card-specific.
- Each line 12-24 words, smooth and readable.
- Tone: warm, poetic, night-soft, but practical enough to act on.
- Use the card’s keywords naturally (no numbers, no extra markup).
- Vary diction; avoid repeating openings or objects.
- Each of the 9 lines must start with a different first word AND a different first two-word phrase.
- Do not reuse the same main verb or the same main noun across the 9 lines.
- Mix sentence shapes: at least one with a comma pause, one with “as …”, one with “while …”.
- Symbolism = imagery of the card; Gentle Reminder = what to hold in heart; Small Action = one concrete act.
- Include a “crystal” entry per card that fits its symbolic energy (short name or phrase).
- Output JSON only (no prose outside the JSON).

Cards:
Past: ${pastCard.name} (${pastCard.keywords.join(", ")})
Present: ${presentCard.name} (${presentCard.keywords.join(", ")})
Future: ${futureCard.name} (${futureCard.keywords.join(", ")})
`;

    const text = await askAI(prompt);

    let parsed = null;
    const jsonMatch = text?.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        parsed = JSON.parse(jsonMatch[0]);
      } catch (e) {
        parsed = null;
      }
    }

    const fallbackCrystals = buildSpreadCrystalSet(picks);

    const toText = (val, card, label) => {
      let arr = [];
      if (Array.isArray(val)) arr = val;
      else if (typeof val === "object" && val !== null) {
        if (Array.isArray(val.lines)) arr = val.lines;
        else if (Array.isArray(val.text)) arr = val.text;
        else if (typeof val.lines === "string") arr = val.lines.split(/\n+/);
        else if (typeof val.text === "string") arr = val.text.split(/\n+/);
      } else if (typeof val === "string") {
        arr = val.split(/\n+/);
      }

      const cleaned = [];
      for (const line of arr || []) {
        const t = String(line).trim();
        if (!t) continue;
        if (!cleaned.includes(t)) cleaned.push(t);
        if (cleaned.length >= 3) break;
      }

      const finalArr =
        cleaned.length >= 3
          ? cleaned
          : makeLocalLines(card, label, moonHint);

      return finalArr.slice(0, 3).join("\n");
    };

    const getCrystalBlock = (source) => {
      if (!source) return null;
      if (Array.isArray(source)) return null;
      if (typeof source === "object") {
        const name =
          source.crystal ??
          source.crystalName ??
          source.crystal_name ??
          source.name ??
          source.title;
        if (name) {
          return {
            name,
            note:
              source.crystalNote ||
              source.crystal_note ||
              source.note ||
              source.description,
            emoji: source.crystalEmoji || source.emoji,
          };
        }
        if (typeof source.crystal === "string" || typeof source.crystal === "object") {
          return source.crystal;
        }
      }
      if (typeof source === "string") {
        const match = source.match(/"crystal":\s*"([^"]+)"/i);
        if (match) return match[1];
        return source;
      }
      return null;
    };

    const safeReading = {
      past: toText(parsed?.past, pastCard, "Past"),
      present: toText(parsed?.present, presentCard, "Present"),
      future: toText(parsed?.future, futureCard, "Future"),
    };

    const crystals = {};
    SPREAD_POSITIONS.forEach((pos) => {
      const entry = parsed?.[pos];
      const fallback = fallbackCrystals[pos];
      const crystalSource =
        getCrystalBlock(entry) ?? getCrystalBlock(parsed?.crystals?.[pos]);
      crystals[pos] = parseCrystalBlock(crystalSource, fallback);
    });

    setSpreadReading(safeReading);
    setSpreadCrystals((prev) => ({ ...prev, ...crystals }));
    setSpreadLoading(false);
  }

  function flipSpreadCard(idx) {
    setSpreadFlips((prev) => {
      const next = [...prev];
      next[idx] = true;
      return next;
    });
  }

  async function handleSwipeUp() {
    const cardPool =
      secretSeed?.hit && secretSeed.id === "arcana-half"
        ? [...CARDS, ARCANA_HALF_CARD]
        : CARDS;
    const [top, ...rest] = deck.length ? deck : shuffle(cardPool);

    setDeck(rest);
    setCurrentCard(top);
    setFaceUp(true);
    setStage("result");
    setShareHint(t("share.hintReady"));
    setAffirmation("");
    setAffirmationMeta(null);
    const affPromise = loadAffirmation(top);
    const guardianCrystal = grantCardGuardian(top);
    if (guardianCrystal) {
      setLastGuardianCrystal(guardianCrystal);
    }
    const prompt = `
You are NightWhisper — a gentle night oracle.

${moonTone ? `Moon Cycle tone: ${moonTone}
- Let the lines glow with this lunar mood; one moon mention max.
` : ""}
Generate exactly 3 lines, each 12-22 words:
Symbolism — what the card evokes tonight.
Gentle Reminder — a feeling to hold gently.
Small Action — one doable act to try.

Rules:
- No repeated phrasing or filler.
- Each line must have a DIFFERENT verb.
- No “slow down”, “save a minute”, “let X rise”.
- No repeating rhythm.
- Max 40 characters.
- Tone: dreamy, soft, but human and encouraging.
- No bullet numbers or extra commentary.
- Vary sentence shapes to avoid template vibes.

Card: ${top.name}
Keywords: ${top.keywords.join(", ")}
`;

    const text = await askAI(prompt);
    const lines =
      text
        ?.split(/\n+/)
        .map((l) => l.replace(/^[\d\.\-\•\s]+/, "").trim())
        .filter(Boolean) || [];

    const fallback = makeLocalLines(top, "", moonHint);

    const picked = [];
    for (const line of lines) {
      if (picked.length >= 3) break;
      if (!picked.includes(line) && line) picked.push(line);
    }

    const filled = [...picked, ...fallback].slice(0, 3);
    setReading(filled.join("\n"));
    setShareBusy(false);
    setShareHint(t("share.hintReady"));
    await affPromise;
  }

  function drawAgain() {
    setStage("draw");
    setFaceUp(false);
    setReading("");
    setShareBusy(false);
    setShareHint(t("share.hintReady"));
  }

  const toggleMusicPanel = () => {
    setMusicPanelOpen((prev) => {
      const next = !prev;
      if (next) setThemePanelOpen(false);
      return next;
    });
  };

  const toggleThemePanel = () => {
    setThemePanelOpen((prev) => {
      const next = !prev;
      if (next) setMusicPanelOpen(false);
      return next;
    });
  };

  async function buildShareImage() {
    if (!currentCard || !shareRef.current || !reading) return;
    setShareBusy(true);
    setShareHint(t("share.hintBusy"));

    // Wait a frame so hidden canvas lays out before capture
    await new Promise((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(resolve))
    );

    try {
      const canvas = await html2canvas(shareRef.current, {
        backgroundColor: null,
        scale: 2,
        width: 1080,
        height: 1920,
      });
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      const slug = currentCard.name.replace(/\s+/g, "-").toLowerCase();
      link.download = `nightwhisper-${slug}.png`;
      link.href = dataUrl;
      link.click();
      setShareHint(t("share.hintDone"));
    } catch (err) {
      console.error("Share image failed:", err);
      setShareHint(t("share.hintFail"));
    } finally {
      setShareBusy(false);
    }
  }

  const readingLines = reading
    ? reading
        .split(/\n+/)
        .map((l) => l.trim())
        .filter(Boolean)
    : [];
  const resonance = useMemo(
    () => buildResonance(weatherTheme, currentCard, t),
    [weatherTheme, currentCard, t]
  );
  const currentCrystal = useMemo(() => suggestCrystal(currentCard), [currentCard]);
  const guardianCrystalDisplay = lastGuardianCrystal || currentCrystal;
  const dailyCrystal = useMemo(
    () =>
      recommendCrystal({
        weatherKey: weatherTheme,
        moonPhase: moon?.phaseKey,
        emotion: inferCardMood(currentCard),
      }),
    [weatherTheme, moon, currentCard]
  );
  const currentTrack =
    AMBIENT_TRACKS.find((t) => t.id === trackId) || AMBIENT_TRACKS[0];
  const activeSecret = useMemo(() => {
    if (!secretSeed?.hit) return null;
    const meta = SECRET_POOL.find((s) => s.id === secretSeed.id);
    if (!meta) return null;
    return { ...meta, payload: secretSeed.payload };
  }, [secretSeed]);
  const activeTheme =
    BACKGROUND_THEMES.find((theme) => theme.id === backgroundThemeId) ||
    BACKGROUND_THEMES[0];
  const starBoost = activeSecret?.id === "lost-star-stone";
  const moonFragmentOn = activeSecret?.id === "moon-fragment";
  const prophecyOn = activeSecret?.id === "prophecy-line";
  const spreadLabels = {
    past: t("spread.past"),
    present: t("spread.present"),
    future: t("spread.future"),
  };
  const coverAffirmation = savedAffirmations.find((a) => a.cover);
  const currentAffId = affirmationMeta?.id;
  const savedAff = currentAffId
    ? savedAffirmations.find((a) => a.id === currentAffId)
    : null;
  const shareAffirmation = coverAffirmation?.text || affirmation;

  const navFocus = useMemo(() => {
    if (stage === "home") return "home";
    if (stage === "moon") return "moon";
    if (stage === "dream") return "dream";
    if (TAROT_STAGES.has(stage)) return "tarot";
    return null;
  }, [stage]);

  const nightNavItems = [
    {
      id: "home",
      icon: "✨",
      label: "Home",
      action: () => setStage("home"),
    },
    {
      id: "tarot",
      icon: "🔮",
      label: "Tarot",
      action: () => setStage("tarot"),
    },
    {
      id: "moon",
      icon: "🌕",
      label: "Moon",
      action: openMoonCycle,
    },
  ];

  const isHomeStage = stage === "home";
  const showMoonFragmentVisual = isHomeStage && moonFragmentOn;
  const showStarStoneVisual = isHomeStage && starBoost;
  const showSecretChip = !isHomeStage && activeSecret;
  const pixelBoost = isHomeStage && starBoost;
  const pixelAccent = showMoonFragmentVisual ? "#cfe4ff" : activeTheme.accent;

  return (
    <div
      className={`nw-root ${showMoonFragmentVisual ? "moon-fragment-on" : ""} ${
        showStarStoneVisual ? "star-stone-on" : ""
      } ${activeSecret?.id === "easter-aurora" ? "aurora-on" : ""}`}
    >
      <Background weather={weatherTheme} themeId={activeTheme.id} />
      <PixelStars
        theme={activeTheme.id}
        boost={pixelBoost}
        accent={pixelAccent}
      />

      <div className="nw-content">
        <header className="nw-header">
        <div className="header-top">
          <div className="logo">🌙 NightWhisper Tarot</div>
        </div>
      </header>

        {showSecretChip && (
          <div className="secret-chip">
            <div className="secret-chip-title">
              {t("secretChip.title")} · {activeSecret.label}
            </div>
            <div className="secret-chip-desc">{activeSecret.desc}</div>
            {prophecyOn && prophecyLine && (
              <div className="secret-prophecy">“{prophecyLine}”</div>
            )}
          </div>
        )}

        <main className="nw-main">
        {spreadBlocked && (
          <div className="limit-box spread-limit" aria-live="polite" aria-atomic="true">
            <div className="limit-panel">
              <div className="limit-icon" aria-hidden="true">
                ✦
              </div>
              <div className="limit-body">
                <div className="limit-pill">
                  <span className="limit-pill-number">{SPREAD_FREE_LIMIT}</span>
                  <span className="limit-pill-label">{t("spread.limitBadge")}</span>
                </div>
                <p className="limit-text">
                  {t("spread.limitHint", { limit: SPREAD_FREE_LIMIT })}
                </p>
                <p className="limit-note">{t("spread.limitNote")}</p>
              </div>
            </div>
          </div>
        )}
        {stage === "home" && (
          <section className="panel panel-static home-stage">
            <div className="home-hero">
              <div className="home-hero-copy">
                <TarotIntro
                  title={t("home.title")}
                  tag={t("home.tag")}
                  tagClass="home-hero-lede focus-copy"
                />
                <div className="home-hero-meta">
                  {moon && (
                    <span className="home-hero-pill">
                      {moon.name} · {moon.mood}
                    </span>
                  )}
                  {dailyCrystal && (
                    <span className="home-hero-pill">
                      {t("result.dailyCrystalTitle")} · {dailyCrystal.name}
                    </span>
                  )}
                </div>
                <TarotActions
                  wrapperClassName="home-hero-actions"
                  actions={[
                    {
                      key: "single",
                      label: t("home.single"),
                      onClick: startDraw,
                      className: "btn-main",
                    },
                    {
                      key: "dream",
                      label: t("home.dreamBottle"),
                      onClick: openDreamBottle,
                      className: "btn-secondary",
                    },
                  ]}
                />
              </div>
              <div className="home-hero-visual">
                <div className="home-hero-orb">
                  <span className="home-hero-orb-emoji">{moon?.emoji || "🌙"}</span>
                  <span className="home-hero-orb-text">
                    {moonHint || t("home.title")}
                  </span>
                </div>
                <p className="home-hero-tones">
                  {moonTone || t("home.tag")}
                </p>
                {prophecyLine && (
                  <p className="home-hero-prophecy">“{prophecyLine}”</p>
                )}
              </div>
            </div>
          </section>
        )}

        {stage === "tarot" && (
          <div className="panel panel-static tarot-panel">
            <div className="tarot-panel-header">
              <TarotIntro title={t("home.title")} tag={t("home.tag")} tagClass="tag" />
            </div>
            <TarotActions
              wrapperClassName="tarot-cta"
              actions={[
                {
                  key: "single",
                  label: t("home.single"),
                  onClick: startDraw,
                  className: "btn-main",
                },
                {
                  key: "spread",
                  label: t("home.spread"),
                  onClick: startSpread,
                  className: "btn-main",
                },
                {
                  key: "encyclopedia",
                  label: t("home.encyclopedia"),
                  onClick: openEncyclopedia,
                  className: "btn-main",
                },
              ]}
            />
          </div>
        )}

        {stage === "moon" && (
          <MoonCycleEngine moon={moon} onOpenDreamBottle={openDreamBottle} t={t} />
        )}

        {stage === "draw" && (
          <div className="panel">
            <h2>{t("draw.title")}</h2>
            <p className="tag focus-copy">{t("draw.subtitle")}</p>

            <TarotCard
              card={null}
              faceUp={false}
              mode="draw"
              onSwipeUp={handleSwipeUp}
            />

            <button className="btn-secondary" onClick={() => setStage("home")}>
              {t("common.back")}
            </button>
          </div>
        )}

        {stage === "result" && currentCard && (
          <div className="panel">
            <h2>{t("result.title")}</h2>

            <TarotCard card={currentCard} faceUp={faceUp} mode="result" />
            <div className="crystal-box">
              <div className="crystal-label">{t("result.crystalLabel")}</div>
              <div className="crystal-body">
                <span className="crystal-emoji">{guardianCrystalDisplay?.emoji || "💎"}</span>
                <div>
                  <div className="crystal-name">
                    {guardianCrystalDisplay?.name ||
                      currentCrystal?.name ||
                      "Crystal"}
                  </div>
                  <div className="crystal-note">
                    {guardianCrystalDisplay?.guardianNote ||
                      guardianCrystalDisplay?.note ||
                      guardianCrystalDisplay?.nightly ||
                      currentCrystal?.note ||
                      t("result.crystalNoteFallback")}
                  </div>
                  {guardianCrystalDisplay?.energy && (
                    <div className="crystal-energy">
                      {t("result.crystalEnergy")} {guardianCrystalDisplay.energy}
                    </div>
                  )}
                  {guardianCrystalDisplay?.use && (
                    <div className="crystal-use">
                      {guardianCrystalDisplay.use}
                    </div>
                  )}
                  {guardianCrystalDisplay?.nightly && (
                    <div className="crystal-nightly">
                      {guardianCrystalDisplay.nightly}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <p className="tag" style={{ marginTop: 8 }}>{currentCard.name}</p>
            {resonance && (
              <div className="resonance-box">
                <div className="resonance-title">{t("resonance.title")}</div>
                <div className="resonance-line">{resonance.line}</div>
                <div className="resonance-note">{resonance.note}</div>
              </div>
            )}
            <p className="reading">{reading}</p>
            {dailyCrystal && (
              <div className="daily-crystal">
                <div className="daily-crystal-title">
                  {t("result.dailyCrystalTitle")} · {dailyCrystal.name}
                  {dailyCrystal ? ` · ${dailyCrystal.name}` : ""}
                </div>
                <p className="daily-crystal-reason">{dailyCrystal.reason}</p>
                <p className="daily-crystal-focus">
                  {dailyCrystal.focus}
                </p>
              </div>
            )}

            <div className="affirmation-block">
              <div className="affirmation-visual" aria-hidden="true">
                <div className="moon-halo" />
                <div className="pixel-moon" />
                <div className="pixel-moon-inner" />
                <div className="drift-lights">
                  <span className="drift-light drift-1" />
                  <span className="drift-light drift-2" />
                  <span className="drift-light drift-3" />
                </div>
              </div>

              <div className="affirmation-copy">
                <div className="affirmation-label">{t("affirmation.label")}</div>
                <div className="affirmation-text">
                  {affirmationLoading
                    ? t("affirmation.loading")
                    : affirmation || t("affirmation.default")}
                </div>
                <div className="affirmation-actions">
                  <button
                    className={`chip-btn ${savedAff ? "active" : ""}`}
                    onClick={() => saveCurrentAffirmation()}
                    disabled={!affirmation || affirmationLoading}
                  >
                    {savedAff ? t("affirmation.saved") : t("affirmation.save")}
                  </button>
                  <button
                    className={`chip-btn ${savedAff?.favorite ? "active" : ""}`}
                    onClick={() => saveCurrentAffirmation({ toggleFavorite: true })}
                    disabled={!affirmation || affirmationLoading}
                  >
                    {savedAff?.favorite ? t("affirmation.favoriteActive") : t("affirmation.favorite")}
                  </button>
                  <button
                    className={`chip-btn ${savedAff?.cover ? "active" : ""}`}
                    onClick={() => saveCurrentAffirmation({ markCover: true })}
                    disabled={!affirmation || affirmationLoading}
                  >
                    {savedAff?.cover ? t("affirmation.coverActive") : t("affirmation.cover")}
                  </button>
                </div>
                {coverAffirmation && (
                  <div className="affirmation-hint">
                    {t("affirmation.coverHint", { line: coverAffirmation.text })}
                  </div>
                )}
              </div>
            </div>

            <div className="action-row">
              <button className="btn-main" onClick={drawAgain}>
                {t("common.drawAgain")}
              </button>
              <button className="btn-secondary" onClick={() => setStage("home")}>
                {t("common.home")}
              </button>
            </div>

            <div className="share-row">
              <button
                className="btn-main"
                onClick={buildShareImage}
                disabled={shareBusy || !reading}
              >
                {shareBusy ? t("share.rendering") : t("share.button")}
              </button>
              <div className="share-hint focus-copy">{shareHint}</div>
            </div>
          </div>
        )}

        {stage === "three" && spreadCards.length === 3 && (
          <div className="panel spread-panel">
            <h2>{t("spread.title")}</h2>
            <p className="tag focus-copy">{t("spread.subtitle")}</p>

            <div className="spread-body">
              <div className="spread-grid">
                {SPREAD_POSITIONS.map((pos, idx) => {
                  const card = spreadCards[idx];
                  return (
                    <div className="spread-slot" key={pos}>
                      <div className="spread-label">{spreadLabels[pos]}</div>
                      <TarotCard
                        card={card}
                        faceUp={spreadFlips[idx]}
                        mode="spread"
                        onTap={() => flipSpreadCard(idx)}
                      />
                      <div className="spread-reading">
                        {spreadFlips[idx]
                          ? spreadReading[pos] ||
                            (spreadLoading
                              ? t("spread.loading")
                              : t("spread.empty"))
                          : t("spread.tap")}
                      </div>
                    </div>
                  );
                })}
              </div>
              <aside className="spread-crystal-sidebar">
                <div className="spread-crystal-header">
                  {t("spread.collectTitle")}
                </div>
                {SPREAD_POSITIONS.map((pos, idx) => {
                  const crystal = spreadCrystals[pos] || {};
                  const label = spreadLabels[pos];
                  const card = spreadCards[idx];
                  return (
                    <div className="spread-crystal-item" key={pos}>
                      <div className="spread-crystal-position">{label}</div>
                      <div className="spread-crystal-name-row">
                        <span className="spread-crystal-emoji">
                          {crystal.emoji || "💎"}
                        </span>
                        <div className="spread-crystal-name">{crystal.name}</div>
                      </div>
                      <div className="spread-crystal-note">{crystal.note}</div>
                      <div className="spread-crystal-card">
                        {card?.name || ""}
                      </div>
                    </div>
                  );
                })}
              </aside>
            </div>

            <div className="action-row">
              <button className="btn-main" onClick={startSpread}>
                {t("spread.new")}
              </button>
              <button className="btn-secondary" onClick={() => setStage("home")}>
                {t("common.backHome")}
              </button>
            </div>
          </div>
        )}

        {stage === "dream" && (
          <DreamBottle
            onBack={() => setStage("home")}
            t={t}
            lang={lang}
            secretSeed={activeSecret}
            moon={moon}
            crystals={collectedCrystals}
            dailyCrystal={dailyCrystal}
            dailyCrystalLimit={DAILY_CRYSTAL_LIMIT}
            dailyCrystalClaimed={dailyCrystalClaimed}
            dailyCrystalRemaining={dailyCrystalRemaining}
            onGrantCrystal={grantCrystal}
          />
        )}

        {stage === "encyclopedia" && (
          <TarotEncyclopedia onBack={() => setStage("home")} t={t} />
        )}
        </main>
      </div>

      {showMoonFragmentVisual && (
        <div className="moon-fragments" aria-hidden="true">
          {[...Array(6)].map((_, idx) => (
            <span key={idx} className={`fragment piece-${idx}`} />
          ))}
        </div>
      )}

      {showStarStoneVisual && (
        <div className="star-stone" aria-hidden="true">
          <div className="stone-core" />
          <div className="stone-ring" />
        </div>
      )}

      {currentCard && readingLines.length >= 1 && (
        <div className="share-stage" aria-hidden="true">
          <div className="share-canvas" ref={shareRef}>
            <div className="share-bg-grid" />
            <div className="share-glow" />

            <div className="share-header">
              <div className="share-brand">{t("share.brand")}</div>
              <div className="share-sub">{t("share.sub")}</div>
            </div>

            <div className="share-body">
              <div className="share-card-frame">
                <img src={currentCard.image} alt={currentCard.name} />
              </div>
              <div className="share-title">{currentCard.name}</div>

              {shareAffirmation && (
                <div className="share-affirmation">
                  <div className="share-moon" />
                  <div className="share-affirm-label">{t("share.affirmLabel")}</div>
                  <div className="share-affirm-text">{shareAffirmation}</div>
                </div>
              )}

              <div className="share-block">
                <div className="share-block-title">{t("share.blockTitle")}</div>
                <div className="share-lines">
                  {["symbolism", "reminder", "action"].map((key, idx) => (
                    <div className="share-line" key={key}>
                      <span className="share-label">{t(`share.labels.${key}`)}</span>
                      <span className="share-text">
                        {readingLines[idx] || ""}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="share-crystal">
                <div className="share-crystal-label">{t("result.crystalLabel")}</div>
                <div className="share-crystal-body">
                  <span className="share-crystal-emoji">
                    {guardianCrystalDisplay?.emoji || "💎"}
                  </span>
                  <div>
                    <div className="share-crystal-name">
                      {guardianCrystalDisplay?.name || currentCrystal?.name}
                    </div>
                    <div className="share-crystal-note">
                      {guardianCrystalDisplay?.guardianNote ||
                        guardianCrystalDisplay?.note ||
                        guardianCrystalDisplay?.nightly ||
                        currentCrystal?.note ||
                        t("result.crystalNoteFallback")}
                    </div>
                    {guardianCrystalDisplay?.energy && (
                      <div className="share-crystal-energy">
                        {t("result.crystalEnergy")}{" "}
                        {guardianCrystalDisplay.energy}
                      </div>
                    )}
                    {guardianCrystalDisplay?.use && (
                      <div className="share-crystal-use">
                        {guardianCrystalDisplay.use}
                      </div>
                    )}
                    {guardianCrystalDisplay?.nightly && (
                      <div className="share-crystal-nightly">
                        {guardianCrystalDisplay.nightly}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="share-footer">
              <div className="share-footer-line">{t("share.footerLine")}</div>
              <div className="share-footer-sub">{t("share.footerSub")}</div>
            </div>
          </div>
        </div>
      )}

      <div className="floating-controls">
        <div className="floating-panels header-panels">
          {musicPanelOpen && (
            <div
              className="header-panel header-panel--music"
              id="music-panel"
              aria-label={t("header.ambientLabel")}
            >
              <div className="panel-title">{t("header.ambientLabel")}</div>
              <div className="sound-palette" aria-live="polite">
                {AMBIENT_TRACKS.map((track) => {
                  const active = track.id === trackId;
                  return (
                    <button
                      key={track.id}
                      className={`sound-chip ${active ? "active" : ""}`}
                      onClick={() => setTrackId(track.id)}
                      aria-pressed={active}
                      title={`${t("header.switchTo")} ${track.label}`}
                    >
                      <span className="sound-chip-icon" aria-hidden="true">
                        {track.icon}
                      </span>
                      <span className="sr-only">{track.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          {themePanelOpen && (
            <div
              className="header-panel header-panel--theme"
              id="theme-panel"
              aria-label={t("header.themeLabel")}
            >
              <div className="panel-title">{t("header.themeLabel")}</div>
              <div className="panel-lang">
                <LangSwitcher lang={lang} setLang={setLang} />
              </div>
              <div className="theme-chip-grid">
                {BACKGROUND_THEMES.map((theme) => {
                  const active = theme.id === backgroundThemeId;
                  return (
                    <button
                      key={theme.id}
                      type="button"
                      className={`theme-chip ${active ? "active" : ""}`}
                      onClick={() => setBackgroundThemeId(theme.id)}
                      aria-pressed={active}
                      aria-label={theme.label}
                      title={theme.label}
                    >
                      <span className="theme-chip-emoji">{theme.emoji}</span>
                      <span className="sr-only">{theme.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        <div className="floating-buttons">
          <button
            className={`panel-toggle ${themePanelOpen ? "active" : ""}`}
            type="button"
            aria-label={t("header.themeLabel")}
            aria-expanded={themePanelOpen}
            aria-controls="theme-panel"
            onClick={toggleThemePanel}
          >
            🎨
          </button>
          <button
            className={`panel-toggle ${musicPanelOpen ? "active" : ""}`}
            type="button"
            aria-label={t("header.ambientLabel")}
            aria-expanded={musicPanelOpen}
            aria-controls="music-panel"
            onClick={toggleMusicPanel}
          >
            🎧
          </button>
          <button
            className={`sound-btn ${audioOn ? "active" : ""}`}
            onClick={() => setAudioOn((v) => !v)}
            aria-pressed={audioOn}
            title={
              audioOn
                ? `${t("header.pauseTrack")} ${currentTrack.label}`
                : `${t("header.playTrack")} ${currentTrack.label}`
            }
          >
            ♫
          </button>
          <button
            className="panel-toggle dream-toggle"
            type="button"
            aria-label={t("home.dreamBottle")}
            title={t("dream.tag")}
            onClick={openDreamBottle}
          >
            🫙
          </button>
          <button
            className={`cat-chat-trigger ${catChatVisible ? "active" : ""}`}
            type="button"
            aria-label={t("mystic.title")}
            onClick={() => setCatChatVisible((visible) => !visible)}
          >
            <span className="cat-chat-icon" aria-hidden="true">
              😺
            </span>
          </button>
        </div>
      </div>

      {catChatVisible && (
        <div className="cat-chat-overlay" role="presentation">
          <div
            className="cat-chat-outlet"
            role="dialog"
            aria-label={t("mystic.title")}
          >
            <button
              className="cat-chat-paw"
              type="button"
              onClick={closeMysticChat}
              aria-label={t("mystic.closeLabel")}
            >
              😺
            </button>
            <MysticChat
              onBack={closeMysticChat}
              t={t}
              floating
              showBackButton={false}
            />
          </div>
        </div>
      )}

      <nav className="night-nav" aria-label="夜空导航">
        {nightNavItems.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`night-nav-button${navFocus === item.id ? " active" : ""}`}
            onClick={item.action}
            aria-pressed={navFocus === item.id}
          >
            <span className="night-nav-icon">{item.icon}</span>
            <span className="night-nav-label">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

function TarotIntro({ title, tag, tagClass = "tag" }) {
  return (
    <>
      <h1>{title}</h1>
      <p className={tagClass}>{tag}</p>
    </>
  );
}

function TarotActions({ wrapperClassName, actions = [] }) {
  if (!actions.length) return null;

  return (
    <div className={wrapperClassName}>
      {actions.map(({ key, label, className = "btn-main", type = "button", ...rest }) => (
        <button
          key={key}
          type={type}
          className={className}
          {...rest}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
