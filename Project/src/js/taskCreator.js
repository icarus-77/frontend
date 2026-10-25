/**
 * taskCreator.js — Task Creation Modal with 5 Templates
 * Pure Vanilla JS modal with two-step flow: choose template → customise → add to Seeds.
 */

import { store } from './store.js';
import { TASK_TEMPLATES, VIRTUES, VIRTUE_META, DIFFICULTY, DIFFICULTY_META } from './virtues.js';

let modalEl = null;
let currentTemplate = null;
let isOpen = false;

export function initTaskCreator() {
  modalEl = document.getElementById('task-creator-modal');
  if (!modalEl) return;

  // Inject the ADD TASK button into the board header
  injectAddTaskButton();

  // Global keyboard handler
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) closeModal();
  });
}

function injectAddTaskButton() {
  const boardHeader = document.querySelector('#board .board-container .reveal');
  if (!boardHeader) return;

  const flexRow = boardHeader.querySelector('div[style*="display: flex"]');
  if (!flexRow) return;

  const btn = document.createElement('button');
  btn.id = 'add-task-btn';
  btn.className = 'btn-editorial btn-yellow';
  btn.innerHTML = `
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" aria-hidden="true">
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
    ADD TASK
  `;
  btn.addEventListener('click', openModal);
  flexRow.appendChild(btn);
}

function openModal() {
  if (!modalEl) return;
  isOpen = true;
  currentTemplate = null;
  renderStep1();
  modalEl.classList.add('active');
  document.body.style.overflow = 'hidden';

  // Focus trap setup
  requestAnimationFrame(() => {
    const firstFocusable = modalEl.querySelector('button, [tabindex="0"]');
    if (firstFocusable) firstFocusable.focus();
  });
}

function closeModal() {
  if (!modalEl) return;
  isOpen = false;
  currentTemplate = null;
  modalEl.classList.remove('active');
  modalEl.innerHTML = '';
  document.body.style.overflow = '';
}

function renderStep1() {
  modalEl.innerHTML = `
    <div class="tc-backdrop"></div>
    <div class="tc-dialog" role="dialog" aria-modal="true" aria-labelledby="tc-title">
      <div class="tc-header">
        <div>
          <p class="section-tag" style="color: var(--electric-blue); font-size: 9px; margin: 0 0 4px;">NEW TASK</p>
          <h2 id="tc-title" class="tc-title">CHOOSE A TASK TYPE</h2>
        </div>
        <button class="tc-close-btn" aria-label="Close" tabindex="0">✕</button>
      </div>

      <div class="tc-body">
        <div class="tc-template-grid">
          ${TASK_TEMPLATES.map((tpl, idx) => `
            <button
              class="tc-template-card"
              data-template-idx="${idx}"
              tabindex="0"
              aria-label="Template: ${tpl.name}"
            >
              <div class="tc-tpl-icon">${tpl.icon}</div>
              <div class="tc-tpl-name">${tpl.name}</div>
              <div class="tc-tpl-desc">${tpl.description}</div>
              <div class="tc-tpl-meta">
                <span class="tc-tpl-xp">+${tpl.defaultXP} XP</span>
                <span class="tc-tpl-diff">${DIFFICULTY_META[tpl.defaultDifficulty]?.label ?? 'Easy'}</span>
              </div>
            </button>
          `).join('')}
        </div>
      </div>
    </div>
  `;

  attachStep1Events();
}

function attachStep1Events() {
  modalEl.querySelector('.tc-close-btn')?.addEventListener('click', closeModal);
  modalEl.querySelector('.tc-backdrop')?.addEventListener('click', closeModal);

  modalEl.querySelectorAll('.tc-template-card').forEach((card) => {
    card.addEventListener('click', () => {
      const idx = parseInt(card.dataset.templateIdx, 10);
      currentTemplate = { ...TASK_TEMPLATES[idx] };
      renderStep2();
    });

    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.click();
      }
    });
  });
}

function renderStep2() {
  const tpl = currentTemplate;
  if (!tpl) return;

  modalEl.innerHTML = `
    <div class="tc-backdrop"></div>
    <div class="tc-dialog tc-dialog-step2" role="dialog" aria-modal="true" aria-labelledby="tc-title-2">
      <div class="tc-header">
        <div>
          <p class="section-tag" style="color: var(--vivid-orange); font-size: 9px; margin: 0 0 4px;">TEMPLATE: ${tpl.name.toUpperCase()}</p>
          <h2 id="tc-title-2" class="tc-title">CUSTOMISE TASK</h2>
        </div>
        <button class="tc-close-btn" aria-label="Close" tabindex="0">✕</button>
      </div>

      <div class="tc-body tc-form-body">
        <div class="tc-field">
          <label for="tc-input-title" class="tc-label">TASK TITLE</label>
          <input
            id="tc-input-title"
            type="text"
            class="tc-input"
            value="${tpl.defaultTitle ?? tpl.name}"
            maxlength="80"
            tabindex="0"
          />
        </div>

        <div class="tc-field">
          <label for="tc-input-desc" class="tc-label">SHORT DESCRIPTION</label>
          <textarea
            id="tc-input-desc"
            class="tc-textarea"
            rows="2"
            maxlength="200"
            tabindex="0"
          >${tpl.description}</textarea>
        </div>

        <div class="tc-field-row">
          <div class="tc-field" style="flex: 1;">
            <label for="tc-input-xp" class="tc-label">XP VALUE</label>
            <input
              id="tc-input-xp"
              type="number"
              class="tc-input"
              min="1"
              max="200"
              value="${tpl.defaultXP}"
              tabindex="0"
            />
          </div>

          <div class="tc-field" style="flex: 1;">
            <label for="tc-input-minutes" class="tc-label">EST. MINUTES</label>
            <input
              id="tc-input-minutes"
              type="number"
              class="tc-input"
              min="1"
              max="480"
              value="${tpl.defaultMinutes ?? 30}"
              tabindex="0"
            />
          </div>
        </div>

        <div class="tc-field">
          <label class="tc-label">DIFFICULTY</label>
          <div class="tc-diff-selector">
            ${Object.entries(DIFFICULTY_META).map(([key, meta]) => `
              <button
                class="tc-diff-btn ${key === tpl.defaultDifficulty ? 'active' : ''}"
                data-diff="${key}"
                tabindex="0"
                type="button"
              >
                <span>${meta.icon}</span>
                <span>${meta.label} (${meta.multiplier}x)</span>
              </button>
            `).join('')}
          </div>
        </div>

        <div class="tc-field">
          <label class="tc-label">VIRTUE</label>
          <div class="tc-virtue-selector">
            ${VIRTUES.map((v) => {
              const meta = VIRTUE_META[v];
              const isDefault = tpl.defaultVirtue === v;
              return `
                <button
                  class="tc-virtue-btn ${isDefault ? 'active' : ''}"
                  data-virtue="${v}"
                  tabindex="0"
                  type="button"
                  style="--virtue-color: ${meta.color};"
                >
                  <span>${meta.icon}</span>
                  <span>${v}</span>
                </button>
              `;
            }).join('')}
          </div>
        </div>

        <div class="tc-actions">
          <button class="tc-cancel-btn" type="button" tabindex="0">CANCEL</button>
          <button class="tc-submit-btn" type="button" tabindex="0">
            ADD TO SEEDS
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  `;

  attachStep2Events();
}

function attachStep2Events() {
  modalEl.querySelector('.tc-close-btn')?.addEventListener('click', closeModal);
  modalEl.querySelector('.tc-backdrop')?.addEventListener('click', closeModal);
  modalEl.querySelector('.tc-cancel-btn')?.addEventListener('click', () => {
    currentTemplate = null;
    renderStep1();
  });

  // Difficulty selector
  let selectedDiff = currentTemplate.defaultDifficulty;
  modalEl.querySelectorAll('.tc-diff-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      modalEl.querySelectorAll('.tc-diff-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      selectedDiff = btn.dataset.diff;
    });
  });

  // Virtue selector
  let selectedVirtue = currentTemplate.defaultVirtue;
  modalEl.querySelectorAll('.tc-virtue-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      modalEl.querySelectorAll('.tc-virtue-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      selectedVirtue = btn.dataset.virtue;
    });
  });

  // Submit
  modalEl.querySelector('.tc-submit-btn')?.addEventListener('click', () => {
    const titleInput = document.getElementById('tc-input-title');
    const descInput = document.getElementById('tc-input-desc');
    const xpInput = document.getElementById('tc-input-xp');
    const minutesInput = document.getElementById('tc-input-minutes');

    const title = (titleInput?.value || '').trim();
    if (!title) {
      titleInput?.focus();
      titleInput?.classList.add('tc-input-error');
      setTimeout(() => titleInput?.classList.remove('tc-input-error'), 600);
      return;
    }

    const xp = Math.max(1, Math.min(200, parseInt(xpInput?.value, 10) || currentTemplate.defaultXP));
    const minutes = Math.max(1, Math.min(480, parseInt(minutesInput?.value, 10) || 30));

    // Build virtue weights — primary virtue gets 60%, rest distributed
    const virtueWeights = {};
    VIRTUES.forEach((v) => {
      virtueWeights[v] = v === selectedVirtue ? 60 : 10;
    });

    const taskData = {
      title,
      description: (descInput?.value || '').trim(),
      priority: getPriorityFromDifficulty(selectedDiff),
      tags: currentTemplate.tags ? [...currentTemplate.tags] : [],
      difficulty: selectedDiff,
      virtueWeights,
      xp,
      estimatedMinutes: minutes,
      templateType: currentTemplate.name,
    };

    store.addTask(taskData);
    closeModal();
  });
}

function getPriorityFromDifficulty(diff) {
  if (diff === DIFFICULTY.HEAVY) return 'high';
  if (diff === DIFFICULTY.MEDIUM) return 'medium';
  return 'low';
}
