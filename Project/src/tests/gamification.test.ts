import { describe, it, expect } from 'vitest';
import {
  calculateOverallLevel,
  calculateVirtueLevel,
  calculateLevelProgress,
  getDesignationTitle,
  buildGamificationProfile,
} from '../utils/gamification';
import { useStore } from '../store/useStore';
import { INITIAL_USERS } from '../constants/gardenConstants';

describe('Life Gamification RPG Engine Math', () => {
  it('calculates overall level based on Level = Math.max(1, Math.floor(0.1 * sqrt(XP)))', () => {
    expect(calculateOverallLevel(0)).toBe(1);
    expect(calculateOverallLevel(99)).toBe(1); // 0.1 * 9.94 = 0.99 -> max(1, 0) = 1
    expect(calculateOverallLevel(100)).toBe(1); // 0.1 * 10 = 1
    expect(calculateOverallLevel(400)).toBe(2); // 0.1 * 20 = 2
    expect(calculateOverallLevel(2500)).toBe(5); // 0.1 * 50 = 5
    expect(calculateOverallLevel(10000)).toBe(10); // 0.1 * 100 = 10
    expect(calculateOverallLevel(40000)).toBe(20); // 0.1 * 200 = 20
  });

  it('calculates domain-specific virtue level using 0.15 * sqrt(virtueXP)', () => {
    expect(calculateVirtueLevel(0)).toBe(1);
    expect(calculateVirtueLevel(100)).toBe(1); // 0.15 * 10 = 1.5 -> 1
    expect(calculateVirtueLevel(400)).toBe(3); // 0.15 * 20 = 3
    expect(calculateVirtueLevel(2500)).toBe(7); // 0.15 * 50 = 7
  });

  it('maps levels and dominant virtues to real-world designation matrix', () => {
    expect(getDesignationTitle(1, 'Intellect')).toBe('Novice Thinker');
    expect(getDesignationTitle(5, 'Intellect')).toBe('Code Artisan');
    expect(getDesignationTitle(10, 'Intellect')).toBe('Systems Architect');
    expect(getDesignationTitle(15, 'Discipline')).toBe('Master of Operations');
    expect(getDesignationTitle(20, 'Intellect')).toBe('Grand Polymath / Mango Sage');
    expect(getDesignationTitle(22, 'Harmony')).toBe('Master of Ecosystems');
  });

  it('calculates level progress percentage to next ceiling', () => {
    const progress = calculateLevelProgress(250);
    expect(progress.level).toBe(1);
    expect(progress.currentFloor).toBe(0);
    expect(progress.nextCeiling).toBe(400);
    expect(progress.progressPercent).toBe(63); // (250 / 400) * 100
  });

  it('builds a full gamification profile with virtue cards and badges', () => {
    const profile = buildGamificationProfile(
      1500,
      { Intellect: 500, Discipline: 400, Resilience: 300, Harmony: 200, Vitality: 100 },
      15,
      3
    );
    expect(profile.level).toBe(3);
    expect(profile.dominantVirtue).toBe('Intellect');
    expect(profile.virtueLevels.Intellect.level).toBeGreaterThanOrEqual(3);
    expect(profile.unlockedBadges.length).toBeGreaterThan(0);
    expect(profile.unlockedBadges.find((b) => b.id === 'badge-first-harvest')?.unlocked).toBe(true);
  });
});

describe('Workspace Isolation & Store Multiplier', () => {
  it('strictly isolates personal workspace tasks to currentUser.id', () => {
    const store = useStore.getState();
    store.setWorkspace('personal');
    store.setCurrentUser(INITIAL_USERS[0]); // user-aman

    const personalTasks = store.getWorkspaceTasks();
    expect(personalTasks.every((t) => t.workspaceId === 'personal')).toBe(true);
    expect(personalTasks.every((t) => t.assigneeId === 'user-aman')).toBe(true);
  });

  it('returns all tasks for team workspaces', () => {
    const store = useStore.getState();
    store.setWorkspace('alpha-product');

    const alphaTasks = store.getWorkspaceTasks();
    expect(alphaTasks.length).toBeGreaterThan(0);
    expect(alphaTasks.every((t) => t.workspaceId === 'alpha-product')).toBe(true);
  });
});
