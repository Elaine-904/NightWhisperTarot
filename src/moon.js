const PHASE_DETAILS = {
  new: {
    name: "新月 · New Moon",
    emoji: "🌑",
    mood: "静下来、设定意图、让内心慢慢苏醒",
    actionScore: 32,
    tone: "whispered, seed-planting, hopeful but gentle",
    ritual: "写 1-2 句新月愿望，藏进 Dream Bottle",
    accent: "#9be4ff",
  },
  first: {
    name: "上弦月 · First Quarter",
    emoji: "🌓",
    mood: "好奇、开始行动、测试雏形",
    actionScore: 68,
    tone: "curious, forward-leaning, lightly electric",
    ritual: "完成一个最小行动，告诉自己“足够了”",
    accent: "#b6ffb3",
  },
  full: {
    name: "满月 · Full Moon",
    emoji: "🌕",
    mood: "释放、庆祝、让光照亮成果与真相",
    actionScore: 90,
    tone: "luminous, celebratory, honest, heart-open",
    ritual: "写一段满月祝福，对朋友或自己朗读",
    accent: "#ffd38f",
  },
  last: {
    name: "下弦月 · Last Quarter",
    emoji: "🌗",
    mood: "减法、收尾、留出空间让能量回笼",
    actionScore: 54,
    tone: "clearing, reflective, softly decisive",
    ritual: "删掉一个负担，给自己留一点空白",
    accent: "#b8b0ff",
  },
};

export const MOON_MARKERS = [
  { label: "新月", icon: "🌑", position: 0 },
  { label: "上弦", icon: "🌓", position: 25 },
  { label: "满月", icon: "🌕", position: 50 },
  { label: "下弦", icon: "🌗", position: 75 },
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
    toneTag: `${detail.name} ${detail.emoji}: ${detail.tone}; 行动力 ${detail.actionScore}/100，情绪倾向 ${detail.mood}`,
  };
}
