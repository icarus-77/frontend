/**
 * store.js — Lightweight Reactive State Store (Vanilla JS)
 * Simple pub/sub pattern with localStorage persistence for lifetime stats.
 */

import {
  VIRTUES,
  DIFFICULTY,
  computeSessionVirtues,
  computeHeavyGains,
  getRankTitle,
} from './virtues.js';

export const COLUMNS = {
  RAW: 'raw',
  RIPENING: 'ripening',
  HARVESTED: 'harvested',
};

export const DIFFICULTY_MULTIPLIER = {
  [DIFFICULTY.EASY]:   1.0,
  [DIFFICULTY.MEDIUM]: 1.25,
  [DIFFICULTY.HARD]:   1.5,
  [DIFFICULTY.LIGHT]:  1.0,
  [DIFFICULTY.HEAVY]:  1.5,
};

export const SEED_TASKS = [
  {
    id: 'task-1',
    title: 'Design the harvest dashboard',
    description: 'Wireframe and prototype the main board UI with mango theme',
    priority: 'high',
    tags: ['Design', 'UI'],
    difficulty: DIFFICULTY.HARD,
    virtueWeights: { Intellect: 60, Harmony: 40 },
    xp: 50,
    templateType: 'Deep Work',
    estimatedMinutes: 60,
    createdAt: Date.now(),
    completedAt: null,
  },
  {
    id: 'task-2',
    title: 'Set up drag-and-drop engine',
    description: 'Integrate accessible drag and drop system',
    priority: 'high',
    tags: ['Engineering', 'Core'],
    difficulty: DIFFICULTY.HARD,
    virtueWeights: { Discipline: 50, Resilience: 50 },
    xp: 50,
    templateType: 'Deep Work',
    estimatedMinutes: 90,
    createdAt: Date.now(),
    completedAt: null,
  },
  {
    id: 'task-3',
    title: 'Craft the blender animation',
    description: 'Build the celebration sequence portal',
    priority: 'medium',
    tags: ['Animation', 'UX'],
    difficulty: DIFFICULTY.MEDIUM,
    virtueWeights: { Intellect: 40, Harmony: 40, Resilience: 20 },
    xp: 35,
    templateType: 'Creative Sprint',
    estimatedMinutes: 45,
    createdAt: Date.now(),
    completedAt: null,
  },
  {
    id: 'task-4',
    title: 'Write ripening metaphor copy',
    description: 'Polish all microcopy to match the mango harvest narrative',
    priority: 'low',
    tags: ['Content', 'Copy'],
    difficulty: DIFFICULTY.EASY,
    virtueWeights: { Harmony: 70, Intellect: 30 },
    xp: 15,
    templateType: 'Quick Win',
    estimatedMinutes: 20,
    createdAt: Date.now(),
    completedAt: null,
  },
];

const emptyVirtues = () => Object.fromEntries(VIRTUES.map((v) => [v, 0]));

const STORAGE_KEY = 'mango_harvest_profile';

function loadSavedProfile() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        lifetimeStats: { ...emptyVirtues(), ...parsed.lifetimeStats },
        totalShakes: parsed.totalShakes ?? 0,
        totalXP: parsed.totalXP ?? 0,
        totalTasksHarvested: parsed.totalTasksHarvested ?? 0,
        rank: getRankTitle(parsed.totalShakes ?? 0),
      };
    }
  } catch (e) {
    console.warn('Could not load saved profile:', e);
  }
  return {
    lifetimeStats: emptyVirtues(),
    totalShakes: 0,
    totalXP: 0,
    totalTasksHarvested: 0,
    rank: getRankTitle(0),
  };
}

let taskIdCounter = Date.now();

class Store {
  constructor() {
    this.state = {
      columns: {
        [COLUMNS.RAW]: ['task-1', 'task-2'],
        [COLUMNS.RIPENING]: ['task-3'],
        [COLUMNS.HARVESTED]: ['task-4'],
      },
      tasks: Object.fromEntries(SEED_TASKS.map((t) => [t.id, { ...t }])),
      sessionVirtues: emptyVirtues(),
      sessionHeavyUpgrades: [],
      sessionXP: 0,
      profile: loadSavedProfile(),
    };
    this.listeners = new Set();
  }

  getState() {
    return this.state;
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }

  saveProfile() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state.profile));
    } catch (e) {
      console.warn('Could not save profile:', e);
    }
  }

  addTask(taskData) {
    taskIdCounter += 1;
    const id = `task-${taskIdCounter}`;
    const task = {
      id,
      title: taskData.title || 'Untitled Task',
      description: taskData.description || '',
      priority: taskData.priority || 'medium',
      tags: taskData.tags || [],
      difficulty: taskData.difficulty || DIFFICULTY.MEDIUM,
      virtueWeights: taskData.virtueWeights || {},
      xp: taskData.xp ?? 50,
      templateType: taskData.templateType || 'Custom',
      estimatedMinutes: taskData.estimatedMinutes ?? 30,
      createdAt: Date.now(),
      completedAt: null,
    };

    this.state.tasks[id] = task;
    this.state.columns[COLUMNS.RAW] = [...this.state.columns[COLUMNS.RAW], id];
    this.notify();
    return task;
  }

  moveTask(taskId, fromColumn, toColumn) {
    if (fromColumn === toColumn) return;

    const task = this.state.tasks[taskId];
    const newFrom = this.state.columns[fromColumn].filter((id) => id !== taskId);
    const newTo = [...this.state.columns[toColumn], taskId];

    this.state.columns = {
      ...this.state.columns,
      [fromColumn]: newFrom,
      [toColumn]: newTo,
    };

    // On harvest: stamp completedAt, apply XP & virtue progression
    if (toColumn === COLUMNS.HARVESTED && task) {
      task.completedAt = Date.now();

      // Apply XP with difficulty multiplier
      const multiplier = DIFFICULTY_MULTIPLIER[task.difficulty] ?? 1.0;
      const xpGained = Math.round((task.xp ?? 0) * multiplier);
      this.state.sessionXP = (this.state.sessionXP || 0) + xpGained;

      // Update lifetime totals
      this.state.profile.totalXP = (this.state.profile.totalXP || 0) + xpGained;
      this.state.profile.totalTasksHarvested = (this.state.profile.totalTasksHarvested || 0) + 1;

      // Apply virtue stat gains based on task virtue weights
      if (task.virtueWeights) {
        const newStats = { ...this.state.profile.lifetimeStats };
        for (const [virtue, weight] of Object.entries(task.virtueWeights)) {
          if (newStats[virtue] !== undefined) {
            newStats[virtue] = (newStats[virtue] || 0) + Math.round((weight / 100) * xpGained * 0.1);
          }
        }
        this.state.profile.lifetimeStats = newStats;
      }

      if (task.difficulty === DIFFICULTY.HEAVY) {
        this.applyHeavyProgression(task);
      }

      this.saveProfile();

      // Emit harvest event for toast
      this._lastHarvestReward = {
        taskTitle: task.title,
        xp: xpGained,
        topVirtue: this._getTopVirtueFromWeights(task.virtueWeights),
        virtueGain: Math.round(xpGained * 0.06),
      };
    }

    this.notify();
  }

  _getTopVirtueFromWeights(weights = {}) {
    let top = null;
    let maxW = 0;
    for (const [v, w] of Object.entries(weights)) {
      if (w > maxW) { maxW = w; top = v; }
    }
    return top;
  }

  applyHeavyProgression(task) {
    const gains = computeHeavyGains(task.virtueWeights);
    const newStats = { ...this.state.profile.lifetimeStats };
    for (const { virtue, delta } of gains) {
      newStats[virtue] = (newStats[virtue] ?? 0) + delta;
    }

    this.state.profile = {
      ...this.state.profile,
      lifetimeStats: newStats,
    };
    this.state.sessionHeavyUpgrades = [...this.state.sessionHeavyUpgrades, ...gains];
    this.saveProfile();
  }

  completeSession() {
    const harvestedTasks = this.state.columns[COLUMNS.HARVESTED].map(
      (id) => this.state.tasks[id]
    ).filter(Boolean);

    const sessionVirtues = computeSessionVirtues(harvestedTasks);
    const newShakes = this.state.profile.totalShakes + 1;
    const rank = getRankTitle(newShakes);

    this.state.sessionVirtues = sessionVirtues;
    this.state.profile = {
      ...this.state.profile,
      totalShakes: newShakes,
      rank,
    };
    this.saveProfile();
    this.notify();
  }

  resetBoard() {
    this.state.columns = {
      [COLUMNS.RAW]: ['task-1', 'task-2'],
      [COLUMNS.RIPENING]: ['task-3'],
      [COLUMNS.HARVESTED]: ['task-4'],
    };
    this.state.tasks = Object.fromEntries(SEED_TASKS.map((t) => [t.id, { ...t }]));
    this.state.sessionVirtues = emptyVirtues();
    this.state.sessionHeavyUpgrades = [];
    this.state.sessionXP = 0;
    this._lastHarvestReward = null;
    this.notify();
  }
}

export const store = new Store();
