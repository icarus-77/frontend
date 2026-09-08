import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import {
  VIRTUES,
  DIFFICULTY,
  computeSessionVirtues,
  computeHeavyGains,
  getRankTitle,
} from '../virtues';

// ─── Column Meta (re-exported for consumers) ──────────────────────────────────
export const COLUMNS = {
  RAW: 'raw',
  RIPENING: 'ripening',
  HARVESTED: 'harvested',
};

export const COLUMN_META = {
  [COLUMNS.RAW]: {
    id: COLUMNS.RAW,
    title: 'Backlog',
    subtitle: 'Seeds awaiting their season',
    emoji: '🌱',
    bgColor: '#F3F8F2',
    headerColor: '#2D6A2D',
    borderColor: '#A8C8A0',
    cardBg: '#E7F0E4',
    cardBorder: '#B8D4B0',
    tagColor: '#4A7C4A',
    borderStyle: 'dashed',
    accentGlow: 'rgba(100, 180, 100, 0.15)',
  },
  [COLUMNS.RIPENING]: {
    id: COLUMNS.RIPENING,
    title: 'In Progress',
    subtitle: 'Soaking in the tropical sun',
    emoji: '🌤️',
    bgColor: '#FFFDF0',
    headerColor: '#92660A',
    borderColor: '#F5D878',
    cardBg: '#FFF8D6',
    cardBorder: '#F0D060',
    tagColor: '#B5800A',
    borderStyle: 'solid',
    accentGlow: 'rgba(245, 190, 60, 0.15)',
  },
  [COLUMNS.HARVESTED]: {
    id: COLUMNS.HARVESTED,
    title: 'Done',
    subtitle: 'Ripe, golden & ready to blend',
    emoji: '🥭',
    bgColor: '#FFF5E6',
    headerColor: '#C2540A',
    borderColor: '#FFBA72',
    cardBg: '#FFE5D0',
    cardBorder: '#FFB06A',
    tagColor: '#C2540A',
    borderStyle: 'solid',
    accentGlow: 'rgba(255, 150, 60, 0.2)',
  },
};

// ─── Seed Tasks (with virtue system) ─────────────────────────────────────────
const SEED_TASKS = [
  {
    id: 'task-1',
    title: 'Design the harvest dashboard',
    description: 'Wireframe and prototype the main board UI with mango theme',
    priority: 'high',
    emoji: '🎨',
    tags: ['Design', 'UI'],
    difficulty: DIFFICULTY.HEAVY,
    virtueWeights: { Intellect: 60, Harmony: 40 },
  },
  {
    id: 'task-2',
    title: 'Set up drag-and-drop engine',
    description: 'Integrate @dnd-kit with accessible keyboard support',
    priority: 'high',
    emoji: '⚙️',
    tags: ['Engineering', 'Core'],
    difficulty: DIFFICULTY.HEAVY,
    virtueWeights: { Discipline: 50, Resilience: 50 },
  },
  {
    id: 'task-3',
    title: 'Craft the blender animation',
    description: 'Build the Framer Motion celebration sequence portal',
    priority: 'medium',
    emoji: '🎬',
    tags: ['Animation', 'UX'],
    difficulty: DIFFICULTY.MEDIUM,
    virtueWeights: { Intellect: 40, Harmony: 40, Resilience: 20 },
  },
  {
    id: 'task-4',
    title: 'Write ripening metaphor copy',
    description: 'Polish all microcopy to match the mango harvest narrative',
    priority: 'low',
    emoji: '✍️',
    tags: ['Content', 'Copy'],
    difficulty: DIFFICULTY.LIGHT,
    virtueWeights: { Harmony: 70, Intellect: 30 },
  },
];

// ─── Default State Slices ─────────────────────────────────────────────────────
const emptyVirtues = () => Object.fromEntries(VIRTUES.map((v) => [v, 0]));

const initialRank = getRankTitle(0);

const initialBoardState = {
  columns: {
    [COLUMNS.RAW]: ['task-1', 'task-2'],
    [COLUMNS.RIPENING]: ['task-3'],
    [COLUMNS.HARVESTED]: ['task-4'],
  },
  tasks: Object.fromEntries(SEED_TASKS.map((t) => [t.id, t])),
};

// ─── Zustand Store ─────────────────────────────────────────────────────────────
export const useStore = create(
  subscribeWithSelector((set, get) => ({
    // ── Board ────────────────────────────────────────────────────────────────
    ...initialBoardState,

    // ── Session ──────────────────────────────────────────────────────────────
    // Accumulated virtue weights for the current blend session
    sessionVirtues: emptyVirtues(),
    // Permanent stat upgrades earned from HEAVY tasks this session
    sessionHeavyUpgrades: [],

    // ── Lifetime Profile ─────────────────────────────────────────────────────
    profile: {
      lifetimeStats: emptyVirtues(),
      totalShakes: 0,
      rank: initialRank,
    },

    // ─── Actions ──────────────────────────────────────────────────────────────

    /**
     * moveTask — pure immutable column move.
     * Side-effect: if task moves into 'harvested' AND difficulty is HEAVY,
     * immediately applies permanent stat progression.
     */
    moveTask(taskId, fromColumn, toColumn) {
      if (fromColumn === toColumn) return;

      const state = get();
      const task = state.tasks[taskId];

      // Pure immutable column update
      const newFrom = state.columns[fromColumn].filter((id) => id !== taskId);
      const newTo = [...state.columns[toColumn], taskId];

      set((s) => ({
        columns: {
          ...s.columns,
          [fromColumn]: newFrom,
          [toColumn]: newTo,
        },
      }));

      // Trigger heavy progression if landing in harvested
      if (toColumn === COLUMNS.HARVESTED && task?.difficulty === DIFFICULTY.HEAVY) {
        get().applyHeavyProgression(task);
      }
    },

    /**
     * applyHeavyProgression — permanently increments lifetimeStats for top
     * virtue weights of a HEAVY task (+3 top, +1 second).
     * Appends to sessionHeavyUpgrades so CartonLabel can highlight them.
     */
    applyHeavyProgression(task) {
      const gains = computeHeavyGains(task.virtueWeights);
      set((s) => {
        const newStats = { ...s.profile.lifetimeStats };
        for (const { virtue, delta } of gains) {
          newStats[virtue] = (newStats[virtue] ?? 0) + delta;
        }
        return {
          profile: { ...s.profile, lifetimeStats: newStats },
          sessionHeavyUpgrades: [...s.sessionHeavyUpgrades, ...gains],
        };
      });
    },

    /**
     * completeSession — called when all tasks land in 'harvested'.
     * Aggregates sessionVirtues from harvested tasks, increments totalShakes,
     * recalculates rank title.
     */
    completeSession() {
      const state = get();
      const harvestedTasks = state.columns[COLUMNS.HARVESTED].map(
        (id) => state.tasks[id]
      );
      const sessionVirtues = computeSessionVirtues(harvestedTasks);
      const newShakes = state.profile.totalShakes + 1;
      const rank = getRankTitle(newShakes);

      set({
        sessionVirtues,
        profile: {
          ...state.profile,
          totalShakes: newShakes,
          rank,
        },
      });
    },

    /**
     * resetBoard — resets board columns + tasks + session virtues.
     * Intentionally PRESERVES lifetime profile (stats, shakes, rank).
     */
    resetBoard() {
      set((s) => ({
        ...initialBoardState,
        sessionVirtues: emptyVirtues(),
        sessionHeavyUpgrades: [],
        // profile intentionally untouched
        profile: s.profile,
      }));
    },
  }))
);

// ─── Selector Helpers ─────────────────────────────────────────────────────────
// IMPORTANT: selectors must return stable (referentially equal) values between
// renders when state hasn't changed. Never call .map()/.filter() inside a
// selector — React 18's useSyncExternalStore will infinite-loop on new refs.

export const selectColumns = (s) => s.columns;
export const selectTasks = (s) => s.tasks;
export const selectProfile = (s) => s.profile;
export const selectSessionVirtues = (s) => s.sessionVirtues;
export const selectSessionHeavyUpgrades = (s) => s.sessionHeavyUpgrades;
// Returns the raw ID array — derive task objects in the component with useMemo
export const selectHarvestedIds = (s) => s.columns[COLUMNS.HARVESTED];

// Action selectors — Zustand stores actions as stable references so these are safe
export const selectMoveTask        = (s) => s.moveTask;
export const selectCompleteSession = (s) => s.completeSession;
export const selectResetBoard      = (s) => s.resetBoard;
