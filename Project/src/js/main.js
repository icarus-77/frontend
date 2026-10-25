/**
 * main.js — Vanilla JS Application Bootstrap
 */

import { initBoard } from './board.js';
import { initProfile } from './profile.js';
import { initScrollStory } from './scrollStory.js';
import { initSprinkler } from './sprinkler.js';
import { initTaskCreator } from './taskCreator.js';

document.addEventListener('DOMContentLoaded', () => {
  initBoard();
  initProfile();
  initScrollStory();
  initSprinkler();
  initTaskCreator();
});
