/**
 * sprinkler.js — Custom Sprinkler Cursor & Water Spray for Entire Webpage
 * Follows mouse/touch pointer across the entire document flawlessly with pointer-events: none.
 * Sprays tactile water droplets on double-click or double-tap anywhere on the page.
 */

const SPRAY_COUNT = 14;
const SPRAY_DURATION = 700;
const DROPLET_COLORS = ['#2563EB', '#38BDF8', '#60A5FA', '#93C5FD', '#22C55E', '#FACC15'];

let sprinklerEl = null;
let isActive = true;
let isDragging = false;
let prefersReducedMotion = false;

export function initSprinkler() {
  prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  sprinklerEl = document.getElementById('sprinkler-cursor');
  if (!sprinklerEl) return;

  sprinklerEl.innerHTML = renderSprinklerSVG();

  // Pointer tracking across the entire window
  window.addEventListener('pointermove', onPointerMove, { passive: true });
  window.addEventListener('pointerdown', onPointerDown, { passive: true });
  window.addEventListener('pointerleave', onPointerLeave);
  window.addEventListener('dblclick', onDblClick);

  // Suppress sprinkler during HTML5 drag-and-drop
  document.addEventListener('dragstart', () => {
    isDragging = true;
    hideSprinkler();
  });
  document.addEventListener('dragend', () => {
    isDragging = false;
    showSprinkler();
  });

  // Make sure sprinkler starts visible
  showSprinkler();
}

function renderSprinklerSVG() {
  return `
    <svg width="34" height="34" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <!-- Water Droplets flying out from spout -->
      <circle cx="33" cy="7" r="2" fill="#38BDF8" />
      <circle cx="35" cy="11" r="1.5" fill="#60A5FA" />
      <circle cx="30" cy="5" r="1.5" fill="#22C55E" />

      <!-- Sprinkler Can Body (Electric Blue with Navy Outline) -->
      <rect x="6" y="15" width="18" height="15" rx="3" fill="#2563EB" stroke="#172554" stroke-width="2.5" />
      <rect x="9" y="18" width="12" height="3" rx="1.5" fill="#60A5FA" />

      <!-- Brass Sprinkler Nozzle Spout -->
      <path d="M24 17 L33 10 L34 14 L24 22 Z" fill="#FACC15" stroke="#172554" stroke-width="2" stroke-linejoin="round" />
      <circle cx="33.5" cy="12" r="2.5" fill="#FB923C" stroke="#172554" stroke-width="1.5" />

      <!-- Can Handle (Vivid Orange) -->
      <path d="M6 18 C-2 18 -2 27 6 27" stroke="#FB923C" stroke-width="4" stroke-linecap="round" fill="none" />
      <path d="M6 18 C-2 18 -2 27 6 27" stroke="#172554" stroke-width="1.5" stroke-linecap="round" fill="none" opacity="0.4" />

      <!-- Top Fill Opening -->
      <rect x="11" y="12" width="8" height="3" rx="1" fill="#FACC15" stroke="#172554" stroke-width="1.5" />
    </svg>
  `;
}

function onPointerMove(e) {
  if (isDragging) return;
  if (!isActive) showSprinkler();

  // Position nozzle tip right at cursor pointer
  sprinklerEl.style.transform = `translate3d(${e.clientX - 26}px, ${e.clientY - 6}px, 0)`;
}

function onPointerDown() {
  if (isDragging || !sprinklerEl) return;
  sprinklerEl.classList.add('sprinkler-click');
  setTimeout(() => sprinklerEl.classList.remove('sprinkler-click'), 150);
}

function onPointerLeave() {
  isActive = false;
  hideSprinkler();
}

function showSprinkler() {
  if (!sprinklerEl) return;
  isActive = true;
  sprinklerEl.classList.add('active');
}

function hideSprinkler() {
  if (!sprinklerEl) return;
  isActive = false;
  sprinklerEl.classList.remove('active');
}

function onDblClick(e) {
  if (isDragging) return;

  if (prefersReducedMotion) {
    spawnPulseRing(e.clientX, e.clientY);
  } else {
    spawnWaterSpray(e.clientX, e.clientY);
  }

  highlightNearestCard(e.target);
}

function spawnWaterSpray(cx, cy) {
  const container = document.createElement('div');
  container.className = 'water-spray-container';
  container.style.left = `${cx}px`;
  container.style.top = `${cy}px`;
  document.body.appendChild(container);

  for (let i = 0; i < SPRAY_COUNT; i++) {
    const drop = document.createElement('div');
    drop.className = 'water-droplet';

    const angle = Math.random() * Math.PI * 2;
    const dist = 35 + Math.random() * 55;
    const dx = Math.cos(angle) * dist;
    const dy = Math.sin(angle) * dist;
    const size = 5 + Math.random() * 6;
    const color = DROPLET_COLORS[Math.floor(Math.random() * DROPLET_COLORS.length)];
    const delay = Math.random() * 90;

    drop.style.setProperty('--dx', `${dx}px`);
    drop.style.setProperty('--dy', `${dy}px`);
    drop.style.width = `${size}px`;
    drop.style.height = `${size}px`;
    drop.style.background = color;
    drop.style.animationDelay = `${delay}ms`;

    container.appendChild(drop);
  }

  setTimeout(() => {
    container.remove();
  }, SPRAY_DURATION + 200);
}

function spawnPulseRing(cx, cy) {
  const ring = document.createElement('div');
  ring.className = 'water-pulse-ring';
  ring.style.left = `${cx}px`;
  ring.style.top = `${cy}px`;
  document.body.appendChild(ring);

  setTimeout(() => {
    ring.remove();
  }, 600);
}

function highlightNearestCard(target) {
  if (!target || typeof target.closest !== 'function') return;
  const card = target.closest('.task-card');
  if (!card) return;

  card.classList.add('sprinkler-highlight');
  setTimeout(() => {
    card.classList.remove('sprinkler-highlight');
  }, 400);
}
