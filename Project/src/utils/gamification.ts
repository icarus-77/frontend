import { Virtue, GamificationProfile } from '../types/garden';

/**
 * Life Gamification RPG Level Formula:
 * Level = Math.max(1, Math.floor(0.1 * Math.sqrt(totalXp)))
 */
export function calculateOverallLevel(totalXp: number): number {
  if (totalXp <= 0) return 1;
  return Math.max(1, Math.floor(0.1 * Math.sqrt(totalXp)));
}

/**
 * Domain-specific Virtue Level:
 * Virtue Level = Math.max(1, Math.floor(0.15 * Math.sqrt(virtueXp)))
 */
export function calculateVirtueLevel(virtueXp: number): number {
  if (virtueXp <= 0) return 1;
  return Math.max(1, Math.floor(0.15 * Math.sqrt(virtueXp)));
}

/**
 * XP thresholds for current level floor and next level ceiling
 * Given Level L:
 * L = 0.1 * sqrt(XP) => 10 * L = sqrt(XP) => XP = (10 * L)^2 = 100 * L^2
 */
export function getLevelXpThresholds(level: number) {
  const currentLevelFloorXp = level <= 1 ? 0 : 100 * Math.pow(level, 2);
  const nextLevelCeilingXp = 100 * Math.pow(level + 1, 2);
  return { currentLevelFloorXp, nextLevelCeilingXp };
}

/**
 * Calculate percentage progress towards next level
 */
export function calculateLevelProgress(totalXp: number): {
  level: number;
  currentFloor: number;
  nextCeiling: number;
  progressPercent: number;
} {
  const level = calculateOverallLevel(totalXp);
  const { currentLevelFloorXp, nextLevelCeilingXp } = getLevelXpThresholds(level);

  const range = nextLevelCeilingXp - currentLevelFloorXp;
  const currentInTier = Math.max(0, totalXp - currentLevelFloorXp);
  const progressPercent = Math.min(100, Math.max(0, Math.round((currentInTier / range) * 100)));

  return {
    level,
    currentFloor: currentLevelFloorXp,
    nextCeiling: nextLevelCeilingXp,
    progressPercent,
  };
}

/**
 * Real-world Designation Matrix
 * Maps Level bracket & dominant Virtue to professional RPG designations
 */
export const DESIGNATION_MATRIX: Record<
  'novice' | 'artisan' | 'architect' | 'director' | 'sage',
  Record<Virtue, string>
> = {
  novice: {
    Intellect: 'Novice Thinker',
    Discipline: 'Apprentice Builder',
    Resilience: 'Persistent Starter',
    Harmony: 'Team Seedling',
    Vitality: 'Energized Scout',
  },
  artisan: {
    Intellect: 'Code Artisan',
    Discipline: 'Sprint Specialist',
    Resilience: 'Grit Engineer',
    Harmony: 'Culture Catalyst',
    Vitality: 'High-Performance Producer',
  },
  architect: {
    Intellect: 'Systems Architect',
    Discipline: 'Principal Executioner',
    Resilience: 'Crisis Strategist',
    Harmony: 'Harmonic Director',
    Vitality: 'Endurance Pioneer',
  },
  director: {
    Intellect: 'Distinguished Fellow',
    Discipline: 'Master of Operations',
    Resilience: 'Ironclad Anchor',
    Harmony: 'Chief Alignment Officer',
    Vitality: 'Zen Vanguard',
  },
  sage: {
    Intellect: 'Grand Polymath / Mango Sage',
    Discipline: 'Sovereign Executive',
    Resilience: 'Unshakable Titan',
    Harmony: 'Master of Ecosystems',
    Vitality: 'Immortal Luminary',
  },
};

/**
 * Resolves the active real-world Designation Title
 */
export function getDesignationTitle(level: number, dominantVirtue: Virtue): string {
  if (level >= 20) return DESIGNATION_MATRIX.sage[dominantVirtue];
  if (level >= 15) return DESIGNATION_MATRIX.director[dominantVirtue];
  if (level >= 10) return DESIGNATION_MATRIX.architect[dominantVirtue];
  if (level >= 5) return DESIGNATION_MATRIX.artisan[dominantVirtue];
  return DESIGNATION_MATRIX.novice[dominantVirtue];
}

/**
 * Unlocked Badge Definitions
 */
export const BADGE_DEFINITIONS = [
  {
    id: 'badge-first-harvest',
    name: 'First Harvest',
    description: 'Completed your very first task on the board',
    icon: '🌱',
    isUnlocked: (stats: { totalTasksHarvested: number; totalXp: number; totalShakes: number }) =>
      stats.totalTasksHarvested >= 1,
  },
  {
    id: 'badge-sprint-finisher',
    name: 'Sprint Finisher',
    description: 'Completed 10 tasks across active workspaces',
    icon: '⚡',
    isUnlocked: (stats: { totalTasksHarvested: number; totalXp: number; totalShakes: number }) =>
      stats.totalTasksHarvested >= 10,
  },
  {
    id: 'badge-master-delegator',
    name: 'Master Delegator',
    description: 'Reassigned tasks with the +25% team bonus multiplier',
    icon: '🤝',
    isUnlocked: (stats: { totalTasksHarvested: number; totalXp: number; totalShakes: number }) =>
      stats.totalXp >= 300,
  },
  {
    id: 'badge-virtue-harmonizer',
    name: 'Virtue Harmonizer',
    description: 'Earned at least 100 XP in each of the 5 Virtues',
    icon: '☀️',
    isUnlocked: (stats: { totalTasksHarvested: number; totalXp: number; totalShakes: number }) =>
      stats.totalXp >= 500,
  },
  {
    id: 'badge-centurion',
    name: 'Centurion',
    description: 'Reaped 100 lifetime tasks for the orchard',
    icon: '🏆',
    isUnlocked: (stats: { totalTasksHarvested: number; totalXp: number; totalShakes: number }) =>
      stats.totalTasksHarvested >= 100,
  },
  {
    id: 'badge-level-10',
    name: 'Systems Architect',
    description: 'Ascended to Level 10 mastery',
    icon: '👑',
    isUnlocked: (stats: { totalTasksHarvested: number; totalXp: number; totalShakes: number }) =>
      calculateOverallLevel(stats.totalXp) >= 10,
  },
];

/**
 * Computes full Life Gamification Character Profile
 */
export function buildGamificationProfile(
  totalXp: number,
  virtues: Record<Virtue, number>,
  tasksHarvested: number,
  shakes: number
): GamificationProfile {
  const { level, currentFloor, nextCeiling, progressPercent } = calculateLevelProgress(totalXp);

  // Dominant virtue
  const dominantVirtue =
    (Object.entries(virtues).sort((a, b) => b[1] - a[1])[0]?.[0] as Virtue) || 'Intellect';

  const designationTitle = getDesignationTitle(level, dominantVirtue);

  const virtueLevels: Record<Virtue, { level: number; xp: number; title: string }> = {
    Intellect: {
      level: calculateVirtueLevel(virtues.Intellect || 0),
      xp: virtues.Intellect || 0,
      title: getDesignationTitle(calculateVirtueLevel(virtues.Intellect || 0), 'Intellect'),
    },
    Discipline: {
      level: calculateVirtueLevel(virtues.Discipline || 0),
      xp: virtues.Discipline || 0,
      title: getDesignationTitle(calculateVirtueLevel(virtues.Discipline || 0), 'Discipline'),
    },
    Resilience: {
      level: calculateVirtueLevel(virtues.Resilience || 0),
      xp: virtues.Resilience || 0,
      title: getDesignationTitle(calculateVirtueLevel(virtues.Resilience || 0), 'Resilience'),
    },
    Harmony: {
      level: calculateVirtueLevel(virtues.Harmony || 0),
      xp: virtues.Harmony || 0,
      title: getDesignationTitle(calculateVirtueLevel(virtues.Harmony || 0), 'Harmony'),
    },
    Vitality: {
      level: calculateVirtueLevel(virtues.Vitality || 0),
      xp: virtues.Vitality || 0,
      title: getDesignationTitle(calculateVirtueLevel(virtues.Vitality || 0), 'Vitality'),
    },
  };

  const unlockedBadges = BADGE_DEFINITIONS.map((b) => ({
    id: b.id,
    name: b.name,
    description: b.description,
    icon: b.icon,
    unlocked: b.isUnlocked({
      totalTasksHarvested: tasksHarvested,
      totalXp,
      totalShakes: shakes,
    }),
  }));

  return {
    level,
    currentLevelXp: totalXp,
    nextLevelXp: nextCeiling,
    progressPercent,
    designationTitle,
    dominantVirtue,
    virtueLevels,
    unlockedBadges,
  };
}
