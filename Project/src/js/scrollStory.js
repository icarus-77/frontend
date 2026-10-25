/**
 * scrollStory.js — Scroll interactions, Navigation & Live Stats (Vanilla JS)
 */

import { store, COLUMNS } from './store.js';
import { renderTetrapack, renderBlender } from './svgs.js';
import { openProfileDrawer } from './profile.js';

export function initScrollStory() {
  // Inject Hero, Ripening, and Harvest SVGs
  injectVectorIllustrations();

  // Scroll listeners
  setupNavScroll();
  setupMobileMenu();
  setupSmoothScroll();
  setupIntersectionObserver();

  // Live Stats Subscriber
  store.subscribe(updateStatsSection);
  updateStatsSection(store.getState());
}

function injectVectorIllustrations() {
  const heroTetrapackEl = document.getElementById('hero-tetrapack-mount');
  if (heroTetrapackEl) {
    heroTetrapackEl.innerHTML = renderTetrapack({ size: 'xl', animate: true });
  }

  const ripeningBlenderEl = document.getElementById('ripening-blender-mount');
  if (ripeningBlenderEl) {
    ripeningBlenderEl.innerHTML = renderBlender({ isShaking: false, fillLevel: 0.52 });
  }

  const harvestTetrapackEl = document.getElementById('harvest-tetrapack-mount');
  if (harvestTetrapackEl) {
    harvestTetrapackEl.innerHTML = renderTetrapack({ size: 'lg', animate: true });
  }
}

function setupNavScroll() {
  const nav = document.getElementById('main-nav');
  if (!nav) return;

  const handleScroll = () => {
    if (window.scrollY > 80) {
      nav.classList.add('nav-scrolled');
    } else {
      nav.classList.remove('nav-scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
}

function setupMobileMenu() {
  const toggleBtn = document.getElementById('mobile-menu-toggle');
  const menu = document.getElementById('mobile-menu');
  const links = document.querySelectorAll('.mobile-nav-link');

  if (!toggleBtn || !menu) return;

  toggleBtn.addEventListener('click', () => {
    menu.classList.toggle('open');
  });

  links.forEach((link) => {
    link.addEventListener('click', () => {
      menu.classList.remove('open');
      if (link.dataset.action === 'profile') {
        openProfileDrawer();
      }
    });
  });
}

function setupSmoothScroll() {
  const backToTopBtn = document.getElementById('back-to-top-btn');
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  const wordmark = document.querySelector('.nav-wordmark');
  if (wordmark) {
    wordmark.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  const startBtn = document.getElementById('start-harvesting-btn');
  if (startBtn) {
    startBtn.addEventListener('click', () => {
      document.getElementById('board')?.scrollIntoView({ behavior: 'smooth' });
    });
  }
}

function setupIntersectionObserver() {
  const revealElements = document.querySelectorAll('.reveal');
  if (!revealElements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
  );

  revealElements.forEach((el) => observer.observe(el));
}

function updateStatsSection(state) {
  const harvestedIds = state.columns[COLUMNS.HARVESTED] ?? [];
  const totalXP = state.profile.totalXP ?? 0;
  const totalHarvested = state.profile.totalTasksHarvested ?? harvestedIds.length;

  const statHarvestedEl = document.getElementById('stat-tasks-harvested');
  const statXpEl = document.getElementById('stat-xp-earned');
  const statSessionsEl = document.getElementById('stat-sessions-blended');
  const statRankEl = document.getElementById('stat-current-rank');

  if (statHarvestedEl) statHarvestedEl.textContent = totalHarvested;
  if (statXpEl) statXpEl.textContent = totalXP;
  if (statSessionsEl) statSessionsEl.textContent = state.profile.totalShakes;
  if (statRankEl) statRankEl.textContent = state.profile.rank.title;
}
