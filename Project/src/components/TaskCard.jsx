import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import { VIRTUE_META, DIFFICULTY_META, getTopVirtues } from '../virtues';

const PRIORITY_CONFIG = {
  high:   { label: 'High', color: '#DC2626', bg: 'rgba(220, 38, 38, 0.12)', dot: '#EF4444' },
  medium: { label: 'Med',  color: '#D97706', bg: 'rgba(217, 119, 6, 0.12)',  dot: '#F59E0B' },
  low:    { label: 'Low',  color: '#059669', bg: 'rgba(5, 150, 105, 0.12)',  dot: '#10B981' },
};

/**
 * TaskCard — Draggable Kanban card with ripening-stage visual theming.
 *
 * Props:
 *   task      {Object}  — task data { id, title, description, priority, emoji, tags,
 *                          difficulty, virtueWeights }
 *   columnId  {string}  — parent column ID ('raw' | 'ripening' | 'harvested')
 *   theme     {Object}  — column theme config from COLUMN_META
 *   index     {number}  — card position in column (for stagger animation)
 */
export function TaskCard({ task, columnId, theme, index }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: { columnId, task },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    touchAction: 'none',
    cursor: isDragging ? 'grabbing' : 'grab',
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 1000 : 'auto',
  };

  const priority   = PRIORITY_CONFIG[task.priority] ?? PRIORITY_CONFIG.medium;
  const difficulty = DIFFICULTY_META[task.difficulty] ?? DIFFICULTY_META.LIGHT;
  const isHarvested = columnId === 'harvested';
  const topVirtues  = getTopVirtues(task.virtueWeights ?? {}, 2);

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      initial={{ opacity: 0, y: 18, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, y: -10 }}
      transition={{ type: 'spring', stiffness: 340, damping: 26, delay: index * 0.06 }}
      {...(isHarvested && {
        animate: { opacity: 1, y: 0, scale: [0.85, 1.06, 0.97, 1.02, 1] },
        transition: { duration: 0.55, ease: 'easeOut', delay: index * 0.06 },
      })}
      layout
      layoutId={task.id}
      whileHover={{
        y: -3,
        boxShadow: `0 10px 30px ${theme.accentGlow}, 0 2px 8px rgba(0,0,0,0.08)`,
        transition: { duration: 0.2 },
      }}
    >
      <div
        style={{
          background: theme.cardBg,
          border: `2px ${theme.borderStyle} ${theme.cardBorder}`,
          borderRadius: 14,
          padding: '14px 16px',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: `0 2px 12px rgba(0,0,0,0.06)`,
          transition: 'box-shadow 0.2s',
        }}
      >
        {/* Accent glow bar at top */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 3,
          background: `linear-gradient(90deg, ${theme.cardBorder}, transparent)`,
          borderRadius: '14px 14px 0 0',
          opacity: 0.6,
        }} />

        {/* ── Row 1: emoji + priority + difficulty badges ──── */}
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', marginBottom: 8,
        }}>
          <span style={{ fontSize: 22 }}>{task.emoji}</span>

          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            {/* Difficulty badge */}
            <span style={{
              display: 'flex', alignItems: 'center', gap: 3,
              fontSize: 9, fontWeight: 800,
              color: difficulty.color,
              background: difficulty.bg,
              borderRadius: 20, padding: '2px 7px',
              letterSpacing: '0.06em', textTransform: 'uppercase',
              fontFamily: 'Inter, system-ui, sans-serif',
              border: `1px solid ${difficulty.color}44`,
            }}>
              {difficulty.icon} {difficulty.label}
            </span>

            {/* Priority badge */}
            <span style={{
              display: 'flex', alignItems: 'center', gap: 3,
              fontSize: 9, fontWeight: 700,
              color: priority.color,
              background: priority.bg,
              borderRadius: 20, padding: '2px 7px',
              letterSpacing: '0.05em', textTransform: 'uppercase',
              fontFamily: 'Inter, system-ui, sans-serif',
            }}>
              <span style={{ width: 4, height: 4, borderRadius: '50%', background: priority.dot, display: 'inline-block' }} />
              {priority.label}
            </span>
          </div>
        </div>

        {/* ── Title ──────────────────────────────────────── */}
        <h3 style={{
          margin: '0 0 5px', fontSize: 13.5, fontWeight: 700,
          color: theme.headerColor, lineHeight: 1.35,
          fontFamily: 'Inter, system-ui, sans-serif',
        }}>
          {task.title}
        </h3>

        {/* ── Description ────────────────────────────────── */}
        <p style={{
          margin: '0 0 10px', fontSize: 11.5,
          color: `${theme.headerColor}aa`, lineHeight: 1.5,
          fontFamily: 'Inter, system-ui, sans-serif',
        }}>
          {task.description}
        </p>

        {/* ── Footer: tags + virtue dots ──────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
          {/* Tags */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {task.tags?.map((tag) => (
              <span key={tag} style={{
                fontSize: 9.5, fontWeight: 600, color: theme.tagColor,
                background: `${theme.cardBorder}55`,
                borderRadius: 5, padding: '2px 6px',
                border: `1px solid ${theme.cardBorder}88`,
                fontFamily: 'Inter, system-ui, sans-serif',
              }}>
                {tag}
              </span>
            ))}
          </div>

          {/* Top virtue dots */}
          {topVirtues.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 }}>
              {topVirtues.map(({ virtue, weight }) => {
                const vm = VIRTUE_META[virtue];
                return (
                  <div
                    key={virtue}
                    title={`${virtue} ${weight}%`}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 2,
                      background: vm.bg, border: `1px solid ${vm.color}55`,
                      borderRadius: 10, padding: '1px 5px',
                    }}
                  >
                    <span style={{ fontSize: 9 }}>{vm.icon}</span>
                    <span style={{
                      fontSize: 8.5, fontWeight: 700, color: vm.color,
                      fontFamily: 'Inter, system-ui, sans-serif',
                    }}>
                      {weight}%
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Harvested: golden glow shimmer overlay */}
        {isHarvested && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(135deg, rgba(255, 200, 80, 0.1) 0%, transparent 60%)',
            borderRadius: 12, pointerEvents: 'none',
          }} />
        )}
      </div>
    </motion.div>
  );
}
