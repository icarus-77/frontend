/**
 * profile.js — Profile Drawer with Pure Vector SVG Radar Chart
 * 5-Virtue polygon radar visualization without any external chart libraries.
 */

import { store } from './store.js';
import { VIRTUES, VIRTUE_META } from './virtues.js';

const C = {
  navy:   '#172554',
  blue:   '#2563EB',
  yellow: '#FACC15',
  orange: '#FB923C',
  green:  '#22C55E',
  white:  '#FFFFFF',
};

export function initProfile() {
  const openButtons = document.querySelectorAll('#profile-open-btn, .open-profile-btn');
  const closeButton = document.getElementById('profile-close-btn');
  const backdrop = document.getElementById('profile-backdrop');

  openButtons.forEach((btn) => btn.addEventListener('click', openProfileDrawer));
  if (closeButton) closeButton.addEventListener('click', closeProfileDrawer);
  if (backdrop) backdrop.addEventListener('click', closeProfileDrawer);

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeProfileDrawer();
  });

  store.subscribe(updateProfileUI);
  updateProfileUI(store.getState());
}

export function openProfileDrawer() {
  const drawer = document.getElementById('profile-drawer');
  const backdrop = document.getElementById('profile-backdrop');
  if (drawer) drawer.classList.add('active');
  if (backdrop) backdrop.classList.add('active');
  document.body.style.overflow = 'hidden';
  updateProfileUI(store.getState());
}

export function closeProfileDrawer() {
  const drawer = document.getElementById('profile-drawer');
  const backdrop = document.getElementById('profile-backdrop');
  if (drawer) drawer.classList.remove('active');
  if (backdrop) backdrop.classList.remove('active');
  document.body.style.overflow = '';
}

function updateProfileUI(state) {
  const profile = state.profile;
  const lifetimeStats = profile.lifetimeStats;
  const totalPoints = VIRTUES.reduce((sum, v) => sum + (lifetimeStats[v] ?? 0), 0);
  const totalXP = profile.totalXP ?? 0;

  // Update Rank Card
  const rankIconEl = document.getElementById('profile-rank-icon');
  const rankTitleEl = document.getElementById('profile-rank-title');
  const rankSubtitleEl = document.getElementById('profile-rank-subtitle');

  if (rankIconEl) rankIconEl.textContent = profile.rank.icon;
  if (rankTitleEl) rankTitleEl.textContent = profile.rank.title;
  if (rankSubtitleEl) {
    rankSubtitleEl.textContent = `${profile.totalShakes} session${profile.totalShakes !== 1 ? 's' : ''} · ${totalXP} XP · ${totalPoints} pts`;
  }

  // Render SVG Radar Chart
  const radarContainer = document.getElementById('profile-radar-chart');
  if (radarContainer) {
    radarContainer.innerHTML = renderRadarChart(lifetimeStats);
  }

  // Render Lifetime Stat Bars
  const statsListEl = document.getElementById('profile-stats-list');
  if (statsListEl) {
    statsListEl.innerHTML = VIRTUES.map((virtue) => {
      const val = lifetimeStats[virtue] ?? 0;
      const meta = VIRTUE_META[virtue];
      const barPct = Math.min((val / 50) * 100, 100);

      return `
        <div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 7px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="fontSize: 14px;">${meta.icon}</span>
              <span style="font-family: var(--font-heading); font-weight: 700; font-size: 12px; color: ${C.navy}; letter-spacing: 0.01em;">
                ${virtue}
              </span>
            </div>
            <span style="font-family: var(--font-display); font-size: 16px; color: ${meta.color}; letter-spacing: 0.04em;">
              ${val} pts
            </span>
          </div>
          <div style="height: 6px; background: rgba(23,37,84,0.1); overflow: hidden;">
            <div style="height: 100%; width: ${barPct}%; background: ${meta.color}; transition: width 0.8s var(--ease-smooth);"></div>
          </div>
        </div>
      `;
    }).join('');
  }
}

/**
 * Pure Trigonometric Vector SVG Radar Chart
 */
function renderRadarChart(stats) {
  const size = 260;
  const center = size / 2;
  const radius = 80;
  const maxVal = 50;
  const numVirtues = VIRTUES.length;
  const angleStep = (Math.PI * 2) / numVirtues;

  // Concentric polygon grid levels
  const levels = [0.25, 0.5, 0.75, 1.0];
  const gridPolygons = levels.map((lvl) => {
    const points = VIRTUES.map((_, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const r = radius * lvl;
      return `${center + Math.cos(angle) * r},${center + Math.sin(angle) * r}`;
    }).join(' ');
    return `<polygon points="${points}" fill="none" stroke="rgba(23,37,84,0.1)" stroke-width="1" />`;
  }).join('');

  // Axis lines
  const axisLines = VIRTUES.map((_, i) => {
    const angle = i * angleStep - Math.PI / 2;
    const x = center + Math.cos(angle) * radius;
    const y = center + Math.sin(angle) * radius;
    return `<line x1="${center}" y1="${center}" x2="${x}" y2="${y}" stroke="rgba(23,37,84,0.1)" stroke-width="1" />`;
  }).join('');

  // Check if all values are zero
  const allZero = VIRTUES.every((v) => (stats[v] ?? 0) === 0);

  // Data polygon points & dots
  const dataPointsArray = VIRTUES.map((v, i) => {
    const angle = i * angleStep - Math.PI / 2;
    const val = stats[v] ?? 0;
    const norm = allZero ? 0.08 : Math.min(Math.max(val / maxVal, 0.08), 1.0);
    const r = radius * norm;
    return {
      x: center + Math.cos(angle) * r,
      y: center + Math.sin(angle) * r,
      virtue: v,
      val,
    };
  });

  const dataPolygonPoints = dataPointsArray.map((p) => `${p.x},${p.y}`).join(' ');

  // Labels around radar
  const labels = VIRTUES.map((v, i) => {
    const angle = i * angleStep - Math.PI / 2;
    const labelRadius = radius + 28;
    const x = center + Math.cos(angle) * labelRadius;
    const y = center + Math.sin(angle) * labelRadius;
    const meta = VIRTUE_META[v];

    return `
      <text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle" pointer-events="none">
        <tspan font-size="13" dy="-8">${meta.icon}</tspan>
        <tspan x="${x}" dy="14" font-size="8.5" fill="rgba(23,37,84,0.7)" font-weight="700" font-family="'Space Grotesk', sans-serif" letter-spacing="0.06em">
          ${v.slice(0, 4).toUpperCase()}
        </tspan>
      </text>
    `;
  }).join('');

  return `
    <svg width="100%" height="248" viewBox="0 0 ${size} ${size}" fill="none">
      ${gridPolygons}
      ${axisLines}

      <!-- Filled Data Radar Area -->
      <polygon
        points="${dataPolygonPoints}"
        fill="${allZero ? 'none' : C.blue}"
        fill-opacity="${allZero ? '0' : '0.15'}"
        stroke="${allZero ? 'rgba(23,37,84,0.15)' : C.blue}"
        stroke-width="${allZero ? '1.5' : '2.5'}"
        stroke-dasharray="${allZero ? '4 3' : 'none'}"
      />

      <!-- Data Dots -->
      ${dataPointsArray.map((p) => `
        <circle cx="${p.x}" cy="${p.y}" r="4.5" fill="${C.blue}" stroke="${C.white}" stroke-width="2">
          <title>${p.virtue}: ${p.val} pts</title>
        </circle>
      `).join('')}

      <!-- Axis Labels -->
      ${labels}
    </svg>
  `;
}
