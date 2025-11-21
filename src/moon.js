const PHASE_DETAILS = {
  new: {
    name: "New Moon",
    emoji: "🌑",
    mood: "Quiet your mind, set an intention, and let your heart slowly wake up.",
    actionScore: 32,
    tone: "whispered, seed-planting, hopeful but gentle",
    ritual: "I plant this seed of intention. May it rest safely in this bottle and grow into the reality I dream of.",
    accent: "#9be4ff",
  },
  first: {
    name: "First Quarter",
    emoji: "🌓",
    mood: "Curiosity. Initiation. Experimentation.",
    actionScore: 68,
    tone: "curious, forward-leaning, lightly electric",
    ritual: "Take the smallest step and affirm. This is enough",
    accent: "#b6ffb3",
  },
  full: {
    name: "Full Moon",
    emoji: "🌕",
    mood: "Release, celebrate, and let the light shine upon the results and the truth.",
    actionScore: 90,
    tone: "luminous, celebratory, honest, heart-open",
    ritual: "Write a Full Moon blessing to read to a friend or yourself.",
    accent: "#ffd38f",
  },
  last: {
    name: "Last Quarter",
    emoji: "🌗",
    mood: "Practice subtraction, wrap things up, and leave space for your energy to return.",
    actionScore: 54,
    tone: "clearing, reflective, softly decisive",
    ritual: "Remove one burden and leave yourself a little breathing room.",
    accent: "#b8b0ff",
  },
};

export const MOON_MARKERS = [
  { label: "New Moon", icon: "🌑", position: 0 },
  { label: "First Quarter", icon: "🌓", position: 25 },
  { label: "Full Moon", icon: "🌕", position: 50 },
  { label: "Last Quarter", icon: "🌗", position: 75 },
];

function getPhaseKey(progress) {
  if (progress >= 0.875 || progress < 0.125) return "new";
  if (progress < 0.375) return "first";
  if (progress < 0.625) return "full";
  return "last";
}

function deltaToTarget(progress, target, length) {
  let delta = target - progress;
  if (delta < 0) delta += 1;
  return Math.round(delta * length * 10) / 10;
}

export function getMoonCycle(date = new Date()) {
  const REF_NEW_MOON = Date.UTC(2001, 0, 6, 18, 14); // known new moon reference
  const SYNODIC_DAYS = 29.530588853;

  const daysSince = (date.getTime() - REF_NEW_MOON) / 86400000;
  const age = ((daysSince % SYNODIC_DAYS) + SYNODIC_DAYS) % SYNODIC_DAYS; // 0..29.53
  const progress = age / SYNODIC_DAYS; // 0..1
  const illuminationPct = Math.round((1 - Math.cos(2 * Math.PI * progress)) * 50); // 0..100
  const phaseKey = getPhaseKey(progress);
  const detail = PHASE_DETAILS[phaseKey];

  const progressPct = Math.round(progress * 100);
  const daysToFull = deltaToTarget(progress, 0.5, SYNODIC_DAYS);
  const daysToNew = deltaToTarget(progress, 0, SYNODIC_DAYS);

  return {
    ...detail,
    phaseKey,
    progress,
    progressPct,
    illuminationPct,
    ageDays: Math.round(age * 10) / 10,
    daysToFull,
    daysToNew,
    cycleLength: SYNODIC_DAYS,
    toneTag: `${detail.name} ${detail.emoji}: ${detail.tone}; Actions:  ${detail.actionScore}/100，Mood:  ${detail.mood}`,
  };
}
