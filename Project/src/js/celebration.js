/**
 * celebration.js — 6-Stage Pure Vanilla JS Celebration Portal
 * Gather ➔ Fly ➔ Shake ➔ Wave Reveal ➔ Success ➔ 3-Column Carton & Nutrition Facts
 */

import { store, COLUMNS } from './store.js';
import { VIRTUES, VIRTUE_META } from './virtues.js';
import { renderBlender, renderTetrapack, renderStarburst } from './svgs.js';

const C = {
  navy:   '#172554',
  blue:   '#2563EB',
  yellow: '#FACC15',
  orange: '#FB923C',
  green:  '#22C55E',
  white:  '#FFFFFF',
};

let celebrationTimer = null;

export function triggerCelebration() {
  const overlay = document.getElementById('celebration-overlay');
  if (!overlay) return;

  const state = store.getState();
  const tasks = state.columns[COLUMNS.HARVESTED].map((id) => state.tasks[id]).filter(Boolean);
  const sessionVirtues = state.sessionVirtues;
  const heavyUpgrades = state.sessionHeavyUpgrades;

  overlay.classList.add('active');
  overlay.innerHTML = '';

  // ── Stage 1: GATHER ──────────────────────────────────────────────────────────
  renderGatherStage(overlay, tasks);

  // ── Stage 2: FLY (after 1200ms) ──────────────────────────────────────────────
  celebrationTimer = setTimeout(() => {
    renderFlyStage(overlay, tasks);

    // ── Stage 3: SHAKE (after 1600ms) ──────────────────────────────────────────
    celebrationTimer = setTimeout(() => {
      renderShakeStage(overlay);

      // ── Stage 4: WAVE (after 1000ms) ─────────────────────────────────────────
      celebrationTimer = setTimeout(() => {
        renderWaveStage(overlay);

        // ── Stage 5: SUCCESS (after 900ms) ─────────────────────────────────────
        celebrationTimer = setTimeout(() => {
          renderSuccessStage();

          // ── Stage 6: CARTON (after 2000ms) ───────────────────────────────────
          celebrationTimer = setTimeout(() => {
            renderCartonStage(overlay, tasks, sessionVirtues, heavyUpgrades);
          }, 2000);

        }, 900);

      }, 1000);

    }, 1600);

  }, 1200);
}

function renderGatherStage(overlay, tasks) {
  overlay.innerHTML = `
    <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 100%; height: 100%;">
      <!-- Center Blender -->
      <div id="gather-blender" style="position: relative; z-index: 10; animation: scale-in 0.4s var(--ease-smooth);">
        ${renderBlender({ isShaking: false, fillLevel: 0 })}
      </div>

      <!-- Orbiting Task Cards -->
      <div id="orbiting-cards-container">
        ${tasks.map((task, i) => {
          const angle = (i / tasks.length) * Math.PI - Math.PI / 2;
          const x = Math.cos(angle) * 220;
          const y = Math.sin(angle) * 200 - 70;
          return `
            <div
              class="orbit-card"
              id="orbit-card-${task.id}"
              style="left: calc(50% + ${x}px - 55px); top: calc(50% + ${y}px - 30px); opacity: 1; transform: scale(1);"
            >
              <div style="overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">
                ${task.title}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

function renderFlyStage(overlay, tasks) {
  tasks.forEach((task, idx) => {
    setTimeout(() => {
      const card = document.getElementById(`orbit-card-${task.id}`);
      if (card) {
        card.style.left = 'calc(50% - 55px)';
        card.style.top = 'calc(50% - 30px)';
        card.style.opacity = '0';
        card.style.transform = 'scale(0.2)';
      }
    }, idx * 160);
  });
}

function renderShakeStage(overlay) {
  overlay.innerHTML = `
    <div style="position: relative; display: flex; align-items: center; justify-content: center;">
      <div class="celebration-blender-shake">
        ${renderBlender({ isShaking: true, fillLevel: 0.75 })}
      </div>
    </div>
  `;
}

function renderWaveStage(overlay) {
  overlay.innerHTML = `
    <div class="wave-screen active">
      <div style="position: absolute; top: 0; left: 0; right: 0; height: 6px; background: ${C.blue};"></div>
      <div style="position: absolute; bottom: 0; left: 0; right: 0; height: 6px; background: ${C.orange};"></div>

      <!-- Corner Starbursts -->
      <div style="position: absolute; left: 8%; top: 14%; opacity: 0.7;">${renderStarburst({ color: C.yellow, size: 44 })}</div>
      <div style="position: absolute; right: 8%; top: 12%; opacity: 0.7;">${renderStarburst({ color: C.orange, size: 36 })}</div>
      <div style="position: absolute; left: 6%; bottom: 18%; opacity: 0.7;">${renderStarburst({ color: C.green, size: 38 })}</div>
      <div style="position: absolute; right: 6%; bottom: 16%; opacity: 0.7;">${renderStarburst({ color: C.blue, size: 40 })}</div>

      <div id="wave-inner-content" style="text-align: center; z-index: 2;"></div>
    </div>
  `;
}

function renderSuccessStage() {
  const container = document.getElementById('wave-inner-content');
  if (!container) return;

  container.innerHTML = `
    <div style="animation: scale-in 0.4s var(--ease-smooth); margin-bottom: 24px;">
      ${renderBlender({ isShaking: false, fillLevel: 0.8 })}
    </div>
    <h2 style="font-family: var(--font-display); font-size: clamp(3.5rem, 10vw, 7.5rem); color: ${C.navy}; letter-spacing: 0.02em; line-height: 0.9; margin: 0 0 8px;">
      HARVESTED.
    </h2>
    <p style="font-family: var(--font-body); font-size: 16px; color: rgba(23,37,84,0.7); margin: 0;">
      Checking the blend…
    </p>
  `;
}

function renderCartonStage(overlay, tasks, sessionVirtues, heavyUpgrades) {
  const container = document.getElementById('wave-inner-content');
  if (!container) return;

  const upgradeMap = {};
  for (const { virtue, delta } of heavyUpgrades) {
    upgradeMap[virtue] = (upgradeMap[virtue] ?? 0) + delta;
  }
  const hasUpgrades = Object.keys(upgradeMap).length > 0;

  container.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: center; gap: 48px; padding: 20px 40px; max-width: 980px; width: 100%; flex-wrap: wrap; animation: scale-in 0.4s var(--ease-smooth);">
      <!-- Left: Result & Reset Button -->
      <div style="text-align: center; flex-shrink: 0;">
        <div style="margin-bottom: 16px;">
          ${renderBlender({ isShaking: false, fillLevel: 0.85 })}
        </div>
        <h2 style="font-family: var(--font-display); font-size: 32px; color: ${C.navy}; letter-spacing: 0.04em; margin: 0 0 4px;">
          BLENDED.
        </h2>
        <p style="font-family: var(--font-body); font-size: 13px; color: rgba(23,37,84,0.7); margin: 0 0 24px;">
          Session complete.
        </p>

        <button id="blend-again-btn" class="btn-editorial btn-yellow" style="border: 2px solid ${C.navy};">
          BLEND AGAIN →
        </button>
      </div>

      <!-- Center: 3D Tetrapack -->
      <div style="flex-shrink: 0;">
        ${renderTetrapack({ size: 'lg', animate: true })}
      </div>

      <!-- Right: Nutrition Facts Carton Label -->
      <div style="flex: 0 1 330px; min-width: 260px; text-align: left;">
        <div style="background: #FFFFF8; border: 3px solid ${C.navy}; box-shadow: 5px 5px 0 ${C.yellow}; font-family: var(--font-mono); color: ${C.navy}; overflow: hidden;">
          <!-- Header Band -->
          <div style="background: ${C.yellow}; padding: 10px 16px; border-bottom: 3px solid ${C.navy}; display: flex; align-items: center; gap: 10px;">
            ${renderStarburst({ color: C.orange, size: 26 })}
            <div>
              <div style="font-family: var(--font-heading); font-size: 18px; font-weight: 900; color: ${C.navy}; letter-spacing: -0.01em;">
                CHANGO MANGO
              </div>
              <div style="font-size: 8px; color: rgba(23,37,84,0.7); letter-spacing: 0.1em; font-weight: 700;">
                SESSION BLEND REPORT
              </div>
            </div>
          </div>

          <div style="padding: 12px 16px;">
            <div style="border-bottom: 8px solid ${C.navy}; padding-bottom: 4px; margin-bottom: 3px;">
              <div style="font-family: var(--font-heading); font-size: 22px; font-weight: 900; letter-spacing: -0.02em; line-height: 1;">
                Nutrition Facts
              </div>
            </div>

            <div style="border-bottom: 1px solid rgba(23,37,84,0.4); padding: 4px 0; font-size: 11px;">
              ${tasks.length} serving${tasks.length !== 1 ? 's' : ''} per session
            </div>
            <div style="border-bottom: 4px solid ${C.navy}; padding: 4px 0; display: flex; justify-content: space-between; font-size: 11px;">
              <span>Blend Size</span>
              <span style="font-weight: 700;">${tasks.length} task${tasks.length !== 1 ? 's' : ''}</span>
            </div>

            <div style="border-bottom: 1px solid rgba(23,37,84,0.3); padding: 3px 0; text-align: right; font-size: 9px; letter-spacing: 0.04em;">
              % Daily Virtue Value *
            </div>

            <!-- Virtue Rows -->
            ${VIRTUES.map((virtue) => {
              const pct = sessionVirtues[virtue] ?? 0;
              const meta = VIRTUE_META[virtue];
              const isUpgraded = !!upgradeMap[virtue];

              return `
                <div style="border-bottom: 1px solid rgba(23,37,84,0.2); padding: 6px 0;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                    <div style="display: flex; align-items: center; gap: 6px;">
                      <span style="font-size: 13px;">${meta.icon}</span>
                      <span style="font-size: 12px; font-weight: 700;">${virtue}</span>
                      ${isUpgraded ? `
                        <span style="font-family: var(--font-heading); font-size: 8px; font-weight: 900; background: ${C.yellow}; color: ${C.navy}; padding: 1px 5px; border: 1px solid ${C.navy};">
                          +${upgradeMap[virtue]} PERM
                        </span>
                      ` : ''}
                    </div>
                    <span style="font-size: 12px; font-weight: 700;">${pct}%</span>
                  </div>

                  <div style="height: 8px; background: rgba(23,37,84,0.12); overflow: hidden;">
                    <div style="height: 100%; width: ${pct}%; background: ${meta.color}; transition: width 0.8s var(--ease-smooth);"></div>
                  </div>
                </div>
              `;
            }).join('')}

            <div style="border-bottom: 4px solid ${C.navy}; margin: 6px 0;"></div>

            ${hasUpgrades ? `
              <div style="background: rgba(250,204,21,0.2); border: 1.5px solid ${C.yellow}; padding: 8px 10px; margin-bottom: 10px;">
                <div style="font-family: var(--font-heading); font-size: 9px; font-weight: 900; letter-spacing: 0.08em; margin-bottom: 6px; color: ${C.navy};">
                  HEAVY TASK STAT UPGRADES
                </div>
                <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                  ${Object.entries(upgradeMap).map(([virtue, delta]) => {
                    const meta = VIRTUE_META[virtue];
                    return `
                      <span style="font-family: var(--font-heading); font-size: 11px; font-weight: 700; color: ${meta.color}; background: ${meta.color}18; border: 1.5px solid ${meta.color}55; padding: 2px 8px;">
                        ${meta.icon} +${delta} ${virtue}
                      </span>
                    `;
                  }).join('')}
                </div>
              </div>
            ` : ''}

            <div style="font-size: 8px; color: rgba(23,37,84,0.7); line-height: 1.5;">
              * % Daily Values based on 100-point session blend.
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Attach reset button event
  const resetBtn = document.getElementById('blend-again-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (celebrationTimer) clearTimeout(celebrationTimer);
      overlay.classList.remove('active');
      overlay.innerHTML = '';
      store.resetBoard();
    });
  }
}
