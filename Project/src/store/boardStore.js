// ─── Board State Schema ────────────────────────────────────────────────────────
// Normalized structure:
//   columns: { [columnId]: taskId[] }  — ordered list of task IDs per column
//   tasks:   { [taskId]: Task }        — single source of truth for task data
//
// This avoids duplicating task data across columns and makes MOVE_TASK O(n)
// with pure immutable array operations.

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

// ─── Initial Seed Data ─────────────────────────────────────────────────────────
const SEED_TASKS = [
  {
    id: 'task-1',
    title: 'Design the harvest dashboard',
    description: 'Wireframe and prototype the main board UI with mango theme',
    priority: 'high',
    emoji: '🎨',
    tags: ['Design', 'UI'],
  },
  {
    id: 'task-2',
    title: 'Set up drag-and-drop engine',
    description: 'Integrate @dnd-kit with accessible keyboard support',
    priority: 'high',
    emoji: '⚙️',
    tags: ['Engineering', 'Core'],
  },
  {
    id: 'task-3',
    title: 'Craft the blender animation',
    description: 'Build the Framer Motion celebration sequence portal',
    priority: 'medium',
    emoji: '🎬',
    tags: ['Animation', 'UX'],
  },
  {
    id: 'task-4',
    title: 'Write ripening metaphor copy',
    description: 'Polish all microcopy to match the mango harvest narrative',
    priority: 'low',
    emoji: '✍️',
    tags: ['Content', 'Copy'],
  },
];

export const initialState = {
  columns: {
    [COLUMNS.RAW]: ['task-1', 'task-2'],
    [COLUMNS.RIPENING]: ['task-3'],
    [COLUMNS.HARVESTED]: ['task-4'],
  },
  tasks: Object.fromEntries(SEED_TASKS.map((t) => [t.id, t])),
};

// ─── Reducer ──────────────────────────────────────────────────────────────────
export function boardReducer(state, action) {
  switch (action.type) {
    case 'MOVE_TASK': {
      const { taskId, fromColumn, toColumn, toIndex } = action.payload;

      if (fromColumn === toColumn) return state;

      // Pure immutable removal from source column
      const newFrom = state.columns[fromColumn].filter((id) => id !== taskId);

      // Pure immutable insertion at target index in destination column
      const newTo = [...state.columns[toColumn]];
      const insertAt = toIndex !== undefined ? toIndex : newTo.length;
      newTo.splice(insertAt, 0, taskId);

      return {
        ...state,
        columns: {
          ...state.columns,
          [fromColumn]: newFrom,
          [toColumn]: newTo,
        },
      };
    }

    case 'RESET_BOARD': {
      return initialState;
    }

    default:
      return state;
  }
}
