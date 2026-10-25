/**
 * board.js — Pure Vanilla Drag-and-Drop Kanban Board
 * With XP badges, task descriptions, and harvest reward toasts.
 */

import { store, COLUMNS, DIFFICULTY_MULTIPLIER } from './store.js';
import { VIRTUE_META, DIFFICULTY_META, getTopVirtues } from './virtues.js';
import { triggerCelebration } from './celebration.js';

const C = {
  navy:   '#172554',
  blue:   '#2563EB',
  yellow: '#FACC15',
  orange: '#FB923C',
  green:  '#22C55E',
  white:  '#FFFFFF',
};

const PRIORITY_DOT = {
  high:   { color: C.orange,  label: 'High' },
  medium: { color: C.yellow,  label: 'Medium' },
  low:    { color: C.green,   label: 'Low' },
};

let draggedTaskId = null;
let draggedFromColumn = null;
let hasTriggeredCelebrationForCurrentSession = false;

export function initBoard() {
  renderBoard();
  store.subscribe(onStateChange);
}

function onStateChange(state) {
  renderBoard();
  showHarvestToast();
  checkBoardCompletion(state);
}

function checkBoardCompletion(state) {
  const totalTasks = Object.keys(state.tasks).length;
  const harvestedCount = state.columns[COLUMNS.HARVESTED]?.length ?? 0;

  if (totalTasks > 0 && harvestedCount === totalTasks) {
    if (!hasTriggeredCelebrationForCurrentSession) {
      hasTriggeredCelebrationForCurrentSession = true;
      setTimeout(() => {
        store.completeSession();
        triggerCelebration();
      }, 500);
    }
  } else {
    hasTriggeredCelebrationForCurrentSession = false;
  }
}

function showHarvestToast() {
  const reward = store._lastHarvestReward;
  if (!reward) return;
  store._lastHarvestReward = null;

  const toast = document.createElement('div');
  toast.className = 'harvest-toast';

  const virtueName = reward.topVirtue
    ? `${reward.topVirtue.toUpperCase()} +${reward.virtueGain}`
    : '';

  toast.innerHTML = `
    <span class="harvest-toast-icon">🥭</span>
    <span class="harvest-toast-text">
      <strong>HARVESTED</strong> · +${reward.xp} XP${virtueName ? ` · ${virtueName}` : ''}
    </span>
  `;

  document.body.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => {
    toast.classList.add('visible');
  });

  setTimeout(() => {
    toast.classList.remove('visible');
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

export function renderBoard() {
  const state = store.getState();
  const columnDefs = [
    { id: COLUMNS.RAW,       label: '01', name: 'SEEDS',     className: 'col-seeds',     accent: C.blue,   emptyText: 'Nothing planted yet.' },
    { id: COLUMNS.RIPENING,  label: '02', name: 'RIPENING',  className: 'col-ripening',  accent: C.orange, emptyText: 'Still waiting for the sun.' },
    { id: COLUMNS.HARVESTED, label: '03', name: 'HARVESTED', className: 'col-harvested', accent: C.green,  emptyText: 'Nothing ripe yet.' },
  ];

  const boardEl = document.getElementById('kanban-board-grid');
  if (!boardEl) return;

  boardEl.innerHTML = columnDefs.map((col) => {
    const taskIds = state.columns[col.id] || [];
    const tasks = taskIds.map((id) => state.tasks[id]).filter(Boolean);

    return `
      <div class="kanban-column ${col.className}" data-column-id="${col.id}">
        <!-- Header -->
        <div class="column-header">
          <div style="display: flex; align-items: baseline; gap: 8px;">
            <span style="font-family: var(--font-body); font-weight: 600; font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase; opacity: 0.85;">
              ${col.label}
            </span>
            <h2 class="column-title">${col.name}</h2>
          </div>
          <span class="column-count-badge" aria-label="${tasks.length} tasks">${tasks.length}</span>
        </div>

        <!-- Body -->
        <div class="column-body" data-column-id="${col.id}">
          <div class="column-dropzone" style="border-color: ${col.accent}; color: ${col.accent};">
            DROP HERE
          </div>

          ${tasks.length === 0 ? `<p class="column-empty-state">${col.emptyText}</p>` : ''}

          ${tasks.map((task) => renderTaskCard(task, col.id, col.accent)).join('')}
        </div>
      </div>
    `;
  }).join('');

  attachDragEvents();
}

function renderTaskCard(task, columnId, accentColor) {
  const priority = PRIORITY_DOT[task.priority] ?? PRIORITY_DOT.medium;
  const isHarvested = columnId === COLUMNS.HARVESTED;
  const topVirtues = getTopVirtues(task.virtueWeights ?? {}, 1);
  const topVirtue = topVirtues[0];

  // Calculate displayed XP
  const multiplier = DIFFICULTY_MULTIPLIER[task.difficulty] ?? 1.0;
  const displayXP = Math.round((task.xp ?? 0) * multiplier);
  const diffMeta = DIFFICULTY_META[task.difficulty];

  return `
    <div
      class="task-card ${isHarvested ? 'harvested-card' : ''}"
      draggable="true"
      data-task-id="${task.id}"
      data-column-id="${columnId}"
      style="border-left: 3px solid ${accentColor};"
    >
      <!-- Row 1: Title + priority dot -->
      <div style="display: flex; align-items: flex-start; gap: 10px; margin-bottom: 4px;">
        <div
          class="priority-dot"
          title="Priority: ${priority.label}"
          style="background: ${priority.color};"
        ></div>
        <h3 class="card-title" style="flex: 1;">${task.title}</h3>
      </div>

      <!-- Row 2: Description snippet -->
      ${task.description ? `
        <p class="card-description">${task.description}</p>
      ` : ''}

      <!-- Row 3: Tags + virtue + difficulty + XP -->
      <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-top: 6px;">
        <div style="display: flex; flex-wrap: wrap; gap: 4px;">
          ${(task.tags || []).slice(0, 2).map((tag) => `
            <span class="card-tag">${tag}</span>
          `).join('')}
        </div>

        <div style="display: flex; align-items: center; gap: 6px; flex-shrink: 0;">
          ${topVirtue ? `
            <span
              title="${topVirtue.virtue}: ${topVirtue.weight}%"
              class="card-virtue-label"
              style="color: ${VIRTUE_META[topVirtue.virtue]?.color ?? C.blue};"
            >
              ${topVirtue.virtue.slice(0, 3)}
            </span>
          ` : ''}

          ${diffMeta ? `
            <span class="card-difficulty-label">
              ${diffMeta.label.slice(0, 3)}
            </span>
          ` : ''}

          <span class="card-xp-badge" title="+${displayXP} XP on harvest">
            +${displayXP}
          </span>
        </div>
      </div>

      ${isHarvested ? `
        <div class="card-harvested-check" aria-label="Harvested">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${C.green}" stroke-width="3" stroke-linecap="round">
            <path d="M5 13l4 4L19 7" />
          </svg>
        </div>
      ` : ''}
    </div>
  `;
}

function attachDragEvents() {
  const cards = document.querySelectorAll('.task-card');
  const columns = document.querySelectorAll('.kanban-column');

  cards.forEach((card) => {
    card.addEventListener('dragstart', (e) => {
      draggedTaskId = card.dataset.taskId;
      draggedFromColumn = card.dataset.columnId;
      card.classList.add('is-dragging');
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', draggedTaskId);
    });

    card.addEventListener('dragend', () => {
      card.classList.remove('is-dragging');
      draggedTaskId = null;
      draggedFromColumn = null;
      columns.forEach((col) => col.classList.remove('is-over'));
    });
  });

  columns.forEach((column) => {
    const colId = column.dataset.columnId;

    column.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      column.classList.add('is-over');
    });

    column.addEventListener('dragleave', (e) => {
      if (!column.contains(e.relatedTarget)) {
        column.classList.remove('is-over');
      }
    });

    column.addEventListener('drop', (e) => {
      e.preventDefault();
      column.classList.remove('is-over');

      if (draggedTaskId && draggedFromColumn && draggedFromColumn !== colId) {
        store.moveTask(draggedTaskId, draggedFromColumn, colId);
      }
    });
  });
}
