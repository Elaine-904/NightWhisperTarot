// Shared crystal library for the NightWhisper experience.
const pick = (arr) =>
  Array.isArray(arr) ? arr[Math.floor(Math.random() * arr.length)] : null;

export const CRYSTAL_LIBRARY = {
  celestite: {
    id: "celestite",
    name: "Celestite",
    alias: "天青石",
    emoji: "✨",
    guardianFor: "The Star",
    palette: ["#d0e4ff", "#8aadff"],
    energyRange: [82, 96],
    uses: [
      "Clarity for long-range wishes",
      "Guides optimism back to the body",
      "Keeps signals soft but precise",
    ],
    nightly: [
      "Star-breath settles the nervous system",
      "Hope hum wraps around the heart",
    ],
  },
  amethyst: {
    id: "amethyst",
    name: "Amethyst",
    alias: "紫水晶",
    emoji: "💜",
    guardianFor: "The Hermit",
    palette: ["#d4b8ff", "#8663ff"],
    energyRange: [74, 92],
    uses: [
      "Candlelight calm for solitude",
      "Helps you hear your own pace",
      "Filters noise so inner voice gets louder",
    ],
    nightly: [
      "Lantern glow for introspection",
      "Keeps overthinking from spiraling",
    ],
  },
  citrine: {
    id: "citrine",
    name: "Citrine",
    alias: "黄水晶",
    emoji: "☀️",
    guardianFor: "The Sun",
    palette: ["#ffd27a", "#ffb347"],
    energyRange: [80, 95],
    uses: [
      "Solar confidence boost",
      "Warms up creative flow",
      "Makes small wins feel celebratory",
    ],
    nightly: [
      "Sun-shard keeps the room bright",
      "Recharges optimism without burning out",
    ],
  },
  moonstone: {
    id: "moonstone",
    name: "Moonstone",
    alias: "月光石",
    emoji: "🌙",
    palette: ["#d6e6ff", "#a9c8ff"],
    energyRange: [76, 90],
    uses: [
      "Intuition blooms quietly",
      "Smooths dream recall",
      "Softens emotional tides",
    ],
    nightly: [
      "Tonight's tides feel safer",
      "Dream clarity without harsh edges",
    ],
  },
  fluorite: {
    id: "fluorite",
    name: "Fluorite",
    alias: "萤石",
    emoji: "🌀",
    palette: ["#a3ffef", "#6bd4ff"],
    energyRange: [70, 88],
    uses: [
      "Organizes scattered thoughts",
      "Keeps focus gentle",
      "Good for writing clean wishes",
    ],
    nightly: [
      "Tidies the mind before sleep",
      "Lights up tiny next steps",
    ],
  },
  rosequartz: {
    id: "rosequartz",
    name: "Rose Quartz",
    alias: "粉晶",
    emoji: "🌸",
    palette: ["#ffc1d9", "#ff9bb7"],
    energyRange: [68, 86],
    uses: [
      "Heart-soft reminder",
      "Invites self-compassion",
      "Good for bedtime affirmations",
    ],
    nightly: [
      "Keeps the heart volume low and warm",
      "Catches harsh self-talk mid-air",
    ],
  },
  labradorite: {
    id: "labradorite",
    name: "Labradorite",
    alias: "拉长石",
    emoji: "🌌",
    palette: ["#9bc8ff", "#6ba7e6"],
    energyRange: [72, 90],
    uses: [
      "Weather shield + intuition boost",
      "Great for cloudy moods",
      "Helps reframe uncertainty",
    ],
    nightly: [
      "Aurora flicker strengthens boundaries",
      "For stormy nights + creative pivots",
    ],
  },
  obsidian: {
    id: "obsidian",
    name: "Obsidian",
    alias: "黑曜石",
    emoji: "🖤",
    palette: ["#2c2f3a", "#4c4f5f"],
    energyRange: [70, 88],
    uses: [
      "Grounding through release",
      "Cuts cords to stale habits",
      "Great for new moon resets",
    ],
    nightly: [
      "Shadow work with safety rails",
      "Holds space for honest pauses",
    ],
  },
  sunstone: {
    id: "sunstone",
    name: "Sunstone",
    alias: "日光石",
    emoji: "🌅",
    palette: ["#ffb38a", "#ff8c5a"],
    energyRange: [78, 94],
    uses: [
      "Momentum + joy bundle",
      "Warms up action-taking",
      "Pairs with creative sprints",
    ],
    nightly: [
      "Helps optimism survive the dusk",
      "Stores sunlight for tomorrow",
    ],
  },
};

export const CARD_CRYSTAL_MAP = {
  star: "celestite",
  hermit: "amethyst",
  sun: "citrine",
};

function rangeValue([min, max]) {
  return Math.round(min + Math.random() * (max - min));
}

export function makeCrystalSnapshot(id, context = {}) {
  const def = CRYSTAL_LIBRARY[id];
  if (!def) return null;
  const today = new Date().toISOString().slice(0, 10);

  return {
    id,
    name: def.name,
    alias: def.alias,
    emoji: def.emoji || "💎",
    energy: rangeValue(def.energyRange || [68, 92]),
    use: pick(def.uses),
    nightly: pick(def.nightly),
    palette: def.palette,
    date: today,
    source: context.source || "mystery",
    guardianNote: context.guardianNote || def.guardianFor,
    cardId: context.cardId,
  };
}

export function recommendCrystal({ weatherKey, moonPhase, emotion }) {
  const weatherVotes = {
    rain: "amethyst",
    snow: "celestite",
    day: "citrine",
    sun: "citrine",
    night: "moonstone",
    sunset: "rosequartz",
    cloud: "labradorite",
    aurora: "labradorite",
  };

  const moonVotes = {
    new: "obsidian",
    first: "fluorite",
    full: "moonstone",
    last: "labradorite",
  };

  const emotionVotes = {
    introspection: "amethyst",
    intuition: "moonstone",
    hope: "celestite",
    optimism: "citrine",
    change: "fluorite",
    clarity: "labradorite",
    soothing: "rosequartz",
    momentum: "sunstone",
    rebirth: "obsidian",
    truth: "sunstone",
    balance: "fluorite",
  };

  const votes = [
    weatherVotes[weatherKey],
    moonVotes[moonPhase],
    emotionVotes[emotion],
  ].filter(Boolean);

  const winner =
    votes.sort(
      (a, b) =>
        votes.filter((x) => x === b).length - votes.filter((x) => x === a).length
    )[0] || "moonstone";

  const def = CRYSTAL_LIBRARY[winner];
  if (!def) return null;

  const lines = [
    `Weather mood: ${weatherKey || "night"} · Moon: ${moonPhase || "cycle"} · Emotion: ${
      emotion || "soft"
    }`,
    pick(def.nightly) || pick(def.uses) || "Glows quietly for tonight.",
  ].filter(Boolean);

  return {
    id: def.id,
    name: def.name,
    alias: def.alias,
    reason: lines[0],
    focus: lines[1],
    palette: def.palette,
  };
}
