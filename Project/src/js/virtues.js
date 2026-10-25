// ─── The 5 Virtues ────────────────────────────────────────────────────────────
// Pure Vanilla JavaScript Virtues & Gamification Engine

export const VIRTUES = ['Intellect', 'Resilience', 'Discipline', 'Harmony', 'Vitality'];

export const VIRTUE_META = {
  Intellect: {
    color: '#818CF8',       // indigo
    glow: 'rgba(129, 140, 248, 0.35)',
    bg: 'rgba(129, 140, 248, 0.12)',
    icon: '🧠',
    label: 'Intellect',
    description: 'Sharpens focus, strategy & creative thought',
  },
  Resilience: {
    color: '#F87171',       // rose-red
    glow: 'rgba(248, 113, 113, 0.35)',
    bg: 'rgba(248, 113, 113, 0.12)',
    icon: '🔥',
    label: 'Resilience',
    description: 'Builds grit, recovery & mental toughness',
  },
  Discipline: {
    color: '#34D399',       // emerald
    glow: 'rgba(52, 211, 153, 0.35)',
    bg: 'rgba(52, 211, 153, 0.12)',
    icon: '⚡',
    label: 'Discipline',
    description: 'Forges consistency, structure & willpower',
  },
  Harmony: {
    color: '#FBBF24',       // amber/gold
    glow: 'rgba(251, 191, 36, 0.35)',
    bg: 'rgba(251, 191, 36, 0.12)',
    icon: '☀️',
    label: 'Harmony',
    description: 'Cultivates balance, empathy & connection',
  },
  Vitality: {
    color: '#38BDF8',       // sky
    glow: 'rgba(56, 189, 248, 0.35)',
    bg: 'rgba(56, 189, 248, 0.12)',
    icon: '💧',
    label: 'Vitality',
    description: 'Energises body, health & sustained energy',
  },
};

// ─── Difficulty Config ─────────────────────────────────────────────────────────
export const DIFFICULTY = {
  EASY: 'EASY',
  MEDIUM: 'MEDIUM',
  HARD: 'HARD',
  // Backward compatibility aliases
  LIGHT: 'EASY',
  HEAVY: 'HARD',
};

export const DIFFICULTY_META = {
  EASY:   { label: 'Easy',   color: '#6EE7B7', bg: 'rgba(110,231,183,0.14)', icon: '🌿', multiplier: 1.0 },
  MEDIUM: { label: 'Medium', color: '#FCD34D', bg: 'rgba(252,211,77,0.14)',  icon: '🌤️', multiplier: 1.25 },
  HARD:   { label: 'Hard',   color: '#FB923C', bg: 'rgba(251,146,60,0.14)',  icon: '🏋️', multiplier: 1.5 },
};

// ─── Rank Titles (by total shakes completed) ───────────────────────────────────
export const RANKS = [
  { min: 0,   title: 'Seedling',       icon: '🌱' },
  { min: 1,   title: 'Harvest Hand',   icon: '🌾' },
  { min: 3,   title: 'Sun Tender',     icon: '🌤️' },
  { min: 6,   title: 'Ripe Picker',    icon: '🥭' },
  { min: 10,  title: 'Master Blender', icon: '🍹' },
  { min: 20,  title: 'Mango Sage',     icon: '✨' },
];

export function getRankTitle(totalShakes = 0) {
  let rank = RANKS[0];
  for (const r of RANKS) {
    if (totalShakes >= r.min) rank = r;
  }
  return rank;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Returns the top N virtues sorted by weight descending.
 */
export function getTopVirtues(virtueWeights = {}, n = 2) {
  return Object.entries(virtueWeights)
    .filter(([, w]) => w > 0)
    .sort(([, a], [, b]) => b - a)
    .slice(0, n)
    .map(([virtue, weight]) => ({ virtue, weight }));
}

/**
 * Aggregates virtue weights from an array of harvested tasks into session totals.
 * Normalises so the output sums to 100 across the 5 virtues.
 */
export function computeSessionVirtues(tasks = []) {
  const raw = Object.fromEntries(VIRTUES.map((v) => [v, 0]));

  for (const task of tasks) {
    if (!task?.virtueWeights) continue;
    for (const [virtue, weight] of Object.entries(task.virtueWeights)) {
      if (raw[virtue] !== undefined) raw[virtue] += weight;
    }
  }

  // Normalise to 0-100 scale
  const total = Object.values(raw).reduce((a, b) => a + b, 0);
  if (total === 0) return raw;
  return Object.fromEntries(
    Object.entries(raw).map(([v, w]) => [v, Math.round((w / total) * 100)])
  );
}

/**
 * Computes permanent stat increments for a HARD task.
 * Top virtue gets +3, second virtue gets +1.
 */
export function computeHeavyGains(virtueWeights = {}) {
  const top = getTopVirtues(virtueWeights, 2);
  const gains = [];
  if (top[0]) gains.push({ virtue: top[0].virtue, delta: 3 });
  if (top[1]) gains.push({ virtue: top[1].virtue, delta: 1 });
  return gains;
}

// ─── Task Templates ────────────────────────────────────────────────────────────
export const TASK_TEMPLATES = [
  {
    name: 'Deep Work',
    icon: '🧠',
    description: 'Dive deep into complex focus work',
    defaultTitle: 'Deep Work',
    defaultXP: 50,
    defaultDifficulty: DIFFICULTY.HARD,
    defaultVirtue: 'Intellect',
    defaultMinutes: 60,
    tags: ['Focus', 'Core'],
  },
  {
    name: 'Quick Win',
    icon: '⚡',
    description: 'Small satisfying win to build momentum',
    defaultTitle: 'Quick Win',
    defaultXP: 15,
    defaultDifficulty: DIFFICULTY.EASY,
    defaultVirtue: 'Discipline',
    defaultMinutes: 15,
    tags: ['Quick', 'Momentum'],
  },
  {
    name: 'Creative Sprint',
    icon: '🎨',
    description: 'High energy creative exploration',
    defaultTitle: 'Creative Sprint',
    defaultXP: 35,
    defaultDifficulty: DIFFICULTY.MEDIUM,
    defaultVirtue: 'Resilience',
    defaultMinutes: 45,
    tags: ['Creative', 'Sprint'],
  },
  {
    name: 'Team Sync',
    icon: '🤝',
    description: 'Collaborate, align or review with team',
    defaultTitle: 'Team Sync',
    defaultXP: 25,
    defaultDifficulty: DIFFICULTY.EASY,
    defaultVirtue: 'Harmony',
    defaultMinutes: 30,
    tags: ['Team', 'Sync'],
  },
  {
    name: 'Personal Reset',
    icon: '🌿',
    description: 'Recharge, stretch, or organise space',
    defaultTitle: 'Personal Reset',
    defaultXP: 20,
    defaultDifficulty: DIFFICULTY.EASY,
    defaultVirtue: 'Resilience',
    defaultMinutes: 20,
    tags: ['Reset', 'Health'],
  },
];
