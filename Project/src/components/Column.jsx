import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { motion, AnimatePresence } from 'framer-motion';
import { TaskCard } from './TaskCard';

/**
 * Column — A droppable Kanban column with ripening-stage visual theming.
 *
 * Props:
 *   columnId  {string}   — 'raw' | 'ripening' | 'harvested'
 *   tasks     {Array}    — ordered array of task objects for this column
 *   meta      {Object}   — COLUMN_META config (colors, labels, etc.)
 */
export function Column({ columnId, tasks, meta }) {
  const { isOver, setNodeRef } = useDroppable({ id: columnId });

  const taskCount = tasks.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 240, damping: 22, delay: columnId === 'raw' ? 0 : columnId === 'ripening' ? 0.08 : 0.16 }}
      style={{
        flex: '1 1 0',
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        maxWidth: 360,
      }}
    >
      {/* Column shell */}
      <div
        style={{
          background: meta.bgColor,
          border: `2px ${meta.borderStyle} ${meta.borderColor}`,
          borderRadius: 20,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          minHeight: 520,
          maxHeight: 'calc(100vh - 180px)',
          boxShadow: isOver
            ? `0 0 0 3px ${meta.borderColor}, 0 8px 32px ${meta.accentGlow}`
            : `0 4px 24px rgba(0,0,0,0.06)`,
          transition: 'box-shadow 0.2s ease',
        }}
      >
        {/* Column header */}
        <div style={{
          padding: '18px 20px 14px',
          borderBottom: `1px solid ${meta.borderColor}66`,
          background: `linear-gradient(180deg, ${meta.bgColor} 0%, ${meta.cardBg}55 100%)`,
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 22 }}>{meta.emoji}</span>
              <h2 style={{
                margin: 0,
                fontSize: 16,
                fontWeight: 800,
                color: meta.headerColor,
                fontFamily: 'Inter, system-ui, sans-serif',
                letterSpacing: '-0.02em',
              }}>
                {meta.title}
              </h2>
            </div>
            {/* Task count badge */}
            <motion.span
              key={taskCount}
              initial={{ scale: 1.3 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              style={{
                background: meta.borderColor,
                color: meta.headerColor,
                fontSize: 12,
                fontWeight: 700,
                borderRadius: 20,
                padding: '2px 10px',
                minWidth: 24,
                textAlign: 'center',
                fontFamily: 'Inter, system-ui, sans-serif',
              }}
            >
              {taskCount}
            </motion.span>
          </div>
          <p style={{
            margin: 0,
            fontSize: 12,
            color: `${meta.headerColor}99`,
            fontFamily: 'Inter, system-ui, sans-serif',
          }}>
            {meta.subtitle}
          </p>
        </div>

        {/* Droppable card area */}
        <div
          ref={setNodeRef}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '14px 14px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            transition: 'background 0.25s ease',
            background: isOver ? `${meta.accentGlow}` : 'transparent',
          }}
        >
          {/* Drop hint when over empty column */}
          {isOver && taskCount === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                border: `2px dashed ${meta.borderColor}`,
                borderRadius: 12,
                padding: '24px 16px',
                textAlign: 'center',
                color: `${meta.headerColor}88`,
                fontSize: 13,
                fontFamily: 'Inter, system-ui, sans-serif',
              }}
            >
              Drop here to{' '}
              {columnId === 'raw' ? 'move back to Backlog' :
               columnId === 'ripening' ? 'start ripening' :
               'harvest this mango 🥭'}
            </motion.div>
          )}

          {/* Empty state */}
          {!isOver && taskCount === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              style={{
                textAlign: 'center',
                padding: '32px 16px',
                color: `${meta.headerColor}77`,
                fontSize: 13,
                fontFamily: 'Inter, system-ui, sans-serif',
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 8, opacity: 0.5 }}>{meta.emoji}</div>
              <p style={{ margin: 0 }}>
                {columnId === 'raw' ? 'All seeds are growing!' :
                 columnId === 'ripening' ? 'Nothing ripening yet.' :
                 'No mangoes harvested yet.'}
              </p>
            </motion.div>
          )}

          {/* Task cards */}
          <AnimatePresence mode="popLayout">
            {tasks.map((task, index) => (
              <TaskCard
                key={task.id}
                task={task}
                columnId={columnId}
                theme={meta}
                index={index}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
