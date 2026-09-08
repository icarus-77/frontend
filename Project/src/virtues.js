// ─── The 5 Virtues ────────────────────────────────────────────────────────────
// Each virtue has a name, color, icon emoji, and description.
// virtueWeights on a task must sum to 100 across whichever virtues are present.

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
  LIGHT: 'LIGHT',
  MEDIUM: 'MEDIUM',
  HEAVY: 'HEAVY',
};

export const DIFFICULTY_META = {
  LIGHT:  { label: 'Light',  color: '#6EE7B7', bg: 'rgba(110,231,183,0.14)', icon: '🌿', statGain: 0 },
  MEDIUM: { label: 'Medium', color: '#FCD34D', bg: 'rgba(252,211,77,0.14)',  icon: '🌤️', statGain: 0 },
  HEAVY:  { label: 'Heavy',  color: '#FB923C', bg: 'rgba(251,146,60,0.14)',  icon: '🏋️', statGain: 3 }, // permanent +3 to top virtue, +1 to second
};

// ─── Rank Titles (by total shakes completed) ───────────────────────────────────
const RANKS = [
  { min: 0,   title: 'Seedling',       icon: '🌱' },
  { min: 1,   title: 'Harvest Hand',   icon: '🌾' },
  { min: 3,   title: 'Sun Tender',     icon: '🌤️' },
  { min: 6,   title: 'Ripe Picker',    icon: '🥭' },
  { min: 10,  title: 'Master Blender', icon: '🍹' },
  { min: 20,  title: 'Mango Sage',     icon: '✨' },
];

export function getRankTitle(totalShakes) {
  let rank = RANKS[0];
  for (const r of RANKS) {
    if (totalShakes >= r.min) rank = r;
  }
  return rank;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Returns the top N virtues sorted by weight descending.
 * @param {Object} virtueWeights  e.g. { Intellect: 70, Resilience: 30 }
 * @param {number} n
 * @returns {{ virtue: string, weight: number }[]}
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
 *
 * @param {Object[]} tasks  — array of task objects with virtueWeights
 * @returns {{ Intellect, Resilience, Discipline, Harmony, Vitality }}  0-100 each
 */
export function computeSessionVirtues(tasks) {
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
 * Computes permanent stat increments for a HEAVY task.
 * Top virtue gets +3, second virtue gets +1.
 *
 * @param {Object} virtueWeights
 * @returns {{ virtue: string, delta: number }[]}
 */
export function computeHeavyGains(virtueWeights = {}) {
  const top = getTopVirtues(virtueWeights, 2);
  const gains = [];
  if (top[0]) gains.push({ virtue: top[0].virtue, delta: 3 });
  if (top[1]) gains.push({ virtue: top[1].virtue, delta: 1 });
  return gains;
}
