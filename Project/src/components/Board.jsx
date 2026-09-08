import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { motion, AnimatePresence } from 'framer-motion';

import {
  useStore,
  COLUMNS,
  COLUMN_META,
  selectColumns,
  selectTasks,
  selectProfile,
  selectSessionVirtues,
  selectSessionHeavyUpgrades,
  selectHarvestedIds,
  selectMoveTask,
  selectCompleteSession,
  selectResetBoard,
} from '../store/useStore';
import { useCheckCompletion } from '../hooks/useCheckCompletion';
import { Column } from './Column';
import { CelebrationPortal } from './CelebrationPortal';
import { ProfileStats } from './ProfileStats';

/**
 * Board — Root Kanban board component (Zustand-powered).
 *
 * Responsibilities:
 * - Subscribes to the Zustand store slices
 * - Provides DndContext, handles onDragEnd → store.moveTask()
 * - Monitors completion, calls store.completeSession() once
 * - Renders three Column components + DragOverlay + CelebrationPortal + ProfileStats
 */
export function Board({ onBackToStory }) {
  const columns          = useStore(selectColumns);
  const tasks            = useStore(selectTasks);
  const profile          = useStore(selectProfile);
  const sessionVirtues   = useStore(selectSessionVirtues);
  const heavyUpgrades    = useStore(selectSessionHeavyUpgrades);
  const harvestedIds     = useStore(selectHarvestedIds);

  // Derive task objects from IDs — useMemo keeps the array reference stable
  // so it doesn’t cause a Zustand getSnapshot infinite loop
  const harvestedTasks = useMemo(
    () => harvestedIds.map((id) => tasks[id]).filter(Boolean),
    [harvestedIds, tasks]
  );

  const moveTask         = useStore(selectMoveTask);
  const completeSession  = useStore(selectCompleteSession);
  const resetBoard       = useStore(selectResetBoard);

  const [activeTask,       setActiveTask]       = useState(null);
  const [activeColumn,     setActiveColumn]     = useState(null);
  const [showCelebration,  setShowCelebration]  = useState(false);
  const [showProfile,      setShowProfile]      = useState(false);

  const { isComplete } = useCheckCompletion(columns);
  const prevCompleteRef = useRef(false);

  // ── Trigger celebration + completeSession once on board completion ─────────
  useEffect(() => {
    if (isComplete && !prevCompleteRef.current) {
      prevCompleteRef.current = true;
      // Allow last drop animation to settle, then aggregate session + show portal
      const timer = setTimeout(() => {
        completeSession();
        setShowCelebration(true);
      }, 600);
      return () => clearTimeout(timer);
    }
    if (!isComplete) {
      prevCompleteRef.current = false;
    }
  }, [isComplete, completeSession]);

  // ── dnd-kit sensors ───────────────────────────────────────────────────────
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // ── Find which column owns a task ─────────────────────────────────────────
  const findTaskColumn = useCallback(
    (taskId) =>
      Object.entries(columns).find(([, ids]) => ids.includes(taskId))?.[0],
    [columns]
  );

  // ── Drag handlers ─────────────────────────────────────────────────────────
  const handleDragStart = ({ active }) => {
    setActiveTask(tasks[active.id]);
    setActiveColumn(findTaskColumn(active.id));
  };

  const handleDragEnd = ({ active, over }) => {
    setActiveTask(null);
    setActiveColumn(null);
    if (!over) return;

    const fromColumn = findTaskColumn(active.id);
    const toColumn   = over.id;
    if (!fromColumn || !toColumn) return;

    moveTask(active.id, fromColumn, toColumn);
  };

  // ── Reset ─────────────────────────────────────────────────────────────────
  const handleReset = () => {
    setShowCelebration(false);
    resetBoard();
  };

  const columnOrder = [COLUMNS.RAW, COLUMNS.RIPENING, COLUMNS.HARVESTED];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1200 0%, #0f0c00 40%, #1a0e00 100%)',
      padding: '0 0 40px',
    }}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        style={{
          padding: '24px 32px 20px',
          borderBottom: '1px solid rgba(245, 158, 11, 0.15)',
          marginBottom: 28,
          background: 'rgba(255, 200, 60, 0.03)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <div style={{
          maxWidth: 1200, margin: '0 auto',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 16, flexWrap: 'wrap',
        }}>
          {/* Left: title */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <motion.span
                animate={{ rotate: [0, -10, 10, -5, 5, 0] }}
                transition={{ delay: 1, duration: 1.2, repeat: Infinity, repeatDelay: 5 }}
                style={{ fontSize: 32 }}
              >
                🥭
              </motion.span>
              <h1 style={{
                margin: 0, fontSize: 'clamp(20px, 3vw, 30px)', fontWeight: 900,
                letterSpacing: '-0.03em',
                background: 'linear-gradient(90deg, #FDE68A, #F59E0B, #FBBF24)',
                backgroundClip: 'text', WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontFamily: 'Inter, system-ui, sans-serif',
              }}>
                The Mango Harvest
              </h1>
            </div>
            <p style={{
              margin: 0, fontSize: 13,
              color: 'rgba(253, 230, 138, 0.5)',
              fontFamily: 'Inter, system-ui, sans-serif',
            }}>
              Drag tasks through the ripening stages — harvest them all to unlock the finale 🍹
            </p>
          </div>

          {/* Right: progress bars + profile button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            {/* Column progress mini bars */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5 }}>
              <div style={{
                fontSize: 10, fontWeight: 700,
                color: 'rgba(253, 230, 138, 0.45)',
                letterSpacing: '0.1em', textTransform: 'uppercase',
                fontFamily: 'Inter, system-ui, sans-serif',
              }}>
                Harvest Progress
              </div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                {columnOrder.map((colId) => {
                  const count = columns[colId].length;
                  const meta  = COLUMN_META[colId];
                  return (
                    <div key={colId} style={{ textAlign: 'center' }}>
                      <div style={{
                        fontSize: 10, color: `${meta.borderColor}cc`,
                        fontFamily: 'Inter, system-ui, sans-serif', marginBottom: 3,
                      }}>
                        {meta.emoji} {count}
                      </div>
                      <div style={{
                        width: 36, height: 4,
                        background: `${meta.borderColor}33`, borderRadius: 4, overflow: 'hidden',
                      }}>
                        <motion.div
                          animate={{ width: count > 0 ? '100%' : '0%' }}
                          transition={{ type: 'spring', stiffness: 200 }}
                          style={{ height: '100%', background: meta.borderColor, borderRadius: 4 }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Profile toggle button */}
            {onBackToStory && (
              <motion.button
                id="story-credits-btn"
                whileHover={{ scale: 1.06, boxShadow: '0 0 20px rgba(245,158,11,0.3)' }}
                whileTap={{ scale: 0.95 }}
                onClick={onBackToStory}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  gap: 3, background: 'rgba(245,158,11,0.15)',
                  border: '1.5px solid rgba(245,158,11,0.4)',
                  borderRadius: 12, padding: '8px 14px',
                  cursor: 'pointer', color: '#FDE68A',
                  fontFamily: 'Inter, system-ui, sans-serif',
                }}
              >
                <span style={{ fontSize: 20 }}>🎬</span>
                <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  Credits
                </span>
                <span style={{ fontSize: 9, color: 'rgba(253,230,138,0.65)' }}>
                  Story View
                </span>
              </motion.button>
            )}

            <motion.button
              id="profile-toggle-btn"
              whileHover={{ scale: 1.06, boxShadow: '0 0 20px rgba(251,191,36,0.3)' }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowProfile(true)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: 3, background: 'rgba(251,191,36,0.1)',
                border: '1.5px solid rgba(251,191,36,0.3)',
                borderRadius: 12, padding: '8px 14px',
                cursor: 'pointer', color: '#FDE68A',
                fontFamily: 'Inter, system-ui, sans-serif',
              }}
            >
              <span style={{ fontSize: 20 }}>{profile.rank.icon}</span>
              <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Profile
              </span>
              <span style={{ fontSize: 9, color: 'rgba(253,230,138,0.55)' }}>
                {profile.rank.title}
              </span>
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* ── Board ──────────────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
            {columnOrder.map((colId) => {
              const taskObjs = columns[colId].map((id) => tasks[id]).filter(Boolean);
              return (
                <Column key={colId} columnId={colId} tasks={taskObjs} meta={COLUMN_META[colId]} />
              );
            })}
          </div>

          {/* Drag overlay ghost card */}
          <DragOverlay>
            {activeTask ? (
              <div className="drag-overlay" style={{
                background: COLUMN_META[activeColumn]?.cardBg ?? '#FFF8D6',
                border: `2px solid ${COLUMN_META[activeColumn]?.cardBorder ?? '#F0D060'}`,
                borderRadius: 14, padding: '14px 16px', width: 280, pointerEvents: 'none',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <span style={{ fontSize: 22 }}>{activeTask.emoji}</span>
                  <span style={{
                    fontSize: 13, fontWeight: 700,
                    color: COLUMN_META[activeColumn]?.headerColor ?? '#92400E',
                    fontFamily: 'Inter, system-ui, sans-serif',
                  }}>
                    {activeTask.title}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: 11, color: '#9CA3AF', fontFamily: 'Inter, system-ui, sans-serif' }}>
                  {activeTask.description}
                </p>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* ── Celebration Portal ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {showCelebration && (
          <CelebrationPortal
            tasks={harvestedTasks}
            sessionVirtues={sessionVirtues}
            heavyUpgrades={heavyUpgrades}
            onReset={handleReset}
          />
        )}
      </AnimatePresence>

      {/* ── Profile Stats Drawer ───────────────────────────────────────────── */}
      <ProfileStats isOpen={showProfile} onClose={() => setShowProfile(false)} />
    </div>
  );
}
