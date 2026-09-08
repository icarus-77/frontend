import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BlenderSVG } from './BlenderSVG';
import { CartonLabel } from './CartonLabel';

/**
 * CelebrationPortal — 6-stage full-screen animation sequence.
 *
 * Stages:
 *   1. GATHER  — harvested card thumbnails appear in a semicircle around the blender
 *   2. FLY     — cards shrink and fly into the blender center (staggered)
 *   3. SHAKE   — blender plays CSS shake keyframe, liquid fills
 *   4. WAVE    — golden-orange wave scales up from bottom
 *   5. SUCCESS — "Sweet Success." text + confetti
 *   6. CARTON  — CartonLabel panel slides in showing session nutrition facts
 *
 * Props:
 *   tasks              {Array}    — harvested task objects
 *   sessionVirtues     {Object}   — aggregated session virtue percentages
 *   heavyUpgrades      {Array}    — [{ virtue, delta }] permanent gains
 *   onReset            {Function} — called when user clicks "Blend Again"
 */

const STAGES = {
  GATHER:  'gather',
  FLY:     'fly',
  SHAKE:   'shake',
  WAVE:    'wave',
  SUCCESS: 'success',
  CARTON:  'carton',
};

const STAGE_DURATIONS = {
  [STAGES.GATHER]:  1200,
  [STAGES.FLY]:     1800,
  [STAGES.SHAKE]:   1000,
  [STAGES.WAVE]:    1200,
  [STAGES.SUCCESS]: 2400,  // linger on success before showing carton
  [STAGES.CARTON]:  0,     // manual dismiss
};

export function CelebrationPortal({ tasks, sessionVirtues = {}, heavyUpgrades = [], onReset }) {
  const [stage, setStage] = useState(STAGES.GATHER);
  const [flownCards, setFlownCards] = useState(new Set());
  const timerRef = useRef(null);

  // ── Auto-advance through stages ──────────────────────────────────────────
  useEffect(() => {
    const duration = STAGE_DURATIONS[stage];
    if (duration === 0) return;
    timerRef.current = setTimeout(() => {
      const order = [STAGES.GATHER, STAGES.FLY, STAGES.SHAKE, STAGES.WAVE, STAGES.SUCCESS, STAGES.CARTON];
      const next = order[order.indexOf(stage) + 1];
      if (next) setStage(next);
    }, duration);
    return () => clearTimeout(timerRef.current);
  }, [stage]);

  // ── Stagger cards flying into blender ────────────────────────────────────
  useEffect(() => {
    if (stage !== STAGES.FLY) return;
    const timers = tasks.map((task, i) =>
      setTimeout(() => setFlownCards((prev) => new Set([...prev, task.id])), i * 200)
    );
    return () => timers.forEach(clearTimeout);
  }, [stage, tasks]);

  const isShaking   = stage === STAGES.SHAKE;
  const showWave    = [STAGES.WAVE, STAGES.SUCCESS, STAGES.CARTON].includes(stage);
  const showSuccess = [STAGES.SUCCESS, STAGES.CARTON].includes(stage);
  const showCarton  = stage === STAGES.CARTON;

  // Semicircle positions for gathering cards
  const cardPositions = tasks.map((_, i) => {
    const angle = (i / tasks.length) * Math.PI - Math.PI / 2;
    return { x: Math.cos(angle) * 200, y: Math.sin(angle) * 200 - 60 };
  });

  return createPortal(
    <AnimatePresence>
      <motion.div
        key="celebration-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(10, 6, 0, 0.92)',
          backdropFilter: 'blur(8px)',
        }}
      >
        {/* ── GATHER / FLY / SHAKE: Blender + Flying Cards ──── */}
        {[STAGES.GATHER, STAGES.FLY, STAGES.SHAKE].includes(stage) && (
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* Blender */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.2 }}
              style={{ position: 'relative', zIndex: 10 }}
            >
              <BlenderSVG
                isShaking={isShaking}
                fillLevel={isShaking ? 0.7 : 0}
                liquidColor="#F59E0B"
              />
            </motion.div>

            {/* Harvested card thumbnails */}
            {tasks.map((task, i) => {
              const pos = cardPositions[i];
              const hasFlown = flownCards.has(task.id);
              return (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, scale: 0, x: pos.x, y: pos.y }}
                  animate={
                    stage === STAGES.GATHER
                      ? { opacity: 1, scale: 1, x: pos.x, y: pos.y }
                      : hasFlown
                      ? { opacity: 0, scale: 0, x: 0, y: 0 }
                      : { opacity: 1, scale: 1, x: pos.x, y: pos.y }
                  }
                  transition={
                    stage === STAGES.GATHER
                      ? { type: 'spring', stiffness: 200, damping: 18, delay: i * 0.12 }
                      : { type: 'spring', stiffness: 280, damping: 25 }
                  }
                  style={{
                    position: 'absolute', width: 120,
                    background: '#FFE5D0', borderRadius: 12, padding: '10px 12px',
                    border: '2px solid #FFBA72',
                    boxShadow: '0 4px 20px rgba(255, 150, 60, 0.3)',
                    pointerEvents: 'none',
                  }}
                >
                  <div style={{ fontSize: 18, marginBottom: 3 }}>{task.emoji}</div>
                  <div style={{
                    fontSize: 10, fontWeight: 700, color: '#92400E',
                    lineHeight: 1.3, overflow: 'hidden',
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                  }}>
                    {task.title}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* ── WAVE: golden screen fill ─────────────────────── */}
        <AnimatePresence>
          {showWave && (
            <motion.div
              key="wave"
              initial={{ scaleY: 0, originY: 1 }}
              animate={{ scaleY: 1 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(160deg, #FDE68A 0%, #F59E0B 40%, #D97706 80%, #92400E 100%)',
                transformOrigin: 'bottom center',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                zIndex: 20, overflow: 'hidden',
              }}
            >
              {/* Decorative rings */}
              {[...Array(6)].map((_, i) => (
                <motion.div key={i}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: [0, 1.5, 1], opacity: [0, 0.3, 0.1] }}
                  transition={{ delay: 0.3 + i * 0.15, duration: 1.2 }}
                  style={{
                    position: 'absolute',
                    width: 80 + i * 60, height: 80 + i * 60,
                    borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)',
                    pointerEvents: 'none',
                  }}
                />
              ))}

              {/* ── SUCCESS content ───────────────────────── */}
              <AnimatePresence>
                {showSuccess && !showCarton && (
                  <motion.div
                    key="success-content"
                    initial={{ opacity: 0, y: 30, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ type: 'spring', stiffness: 240, damping: 18 }}
                    style={{ textAlign: 'center', padding: '0 24px' }}
                  >
                    <motion.div
                      className="float-animation"
                      style={{ marginBottom: 24, filter: 'drop-shadow(0 12px 30px rgba(0,0,0,0.3))' }}
                    >
                      <BlenderSVG isShaking={false} fillLevel={0.75} liquidColor="#FDE68A" />
                    </motion.div>

                    <motion.div
                      animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
                      transition={{ delay: 0.2, duration: 0.8 }}
                      style={{ fontSize: 56, marginBottom: 12 }}
                    >
                      🥭
                    </motion.div>

                    <h1 className="shimmer-text" style={{
                      fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 900,
                      letterSpacing: '-0.02em', marginBottom: 10,
                      fontFamily: 'Inter, system-ui, sans-serif',
                    }}>
                      Sweet Success.
                    </h1>
                    <p style={{
                      fontSize: 'clamp(15px, 2.2vw, 20px)',
                      color: 'rgba(255,255,255,0.9)', fontWeight: 500,
                      marginBottom: 24, fontFamily: 'Inter, system-ui, sans-serif',
                    }}>
                      Enjoy your shake! 🍹
                    </p>

                    <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 8 }}>
                      {['⭐', '✨', '🌟', '💫', '⭐', '✨'].map((s, i) => (
                        <motion.span key={i}
                          initial={{ opacity: 0, y: -20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 * i, type: 'spring' }}
                          style={{ fontSize: 22 }}
                        >
                          {s}
                        </motion.span>
                      ))}
                    </div>

                    <p style={{
                      fontSize: 13, color: 'rgba(255,255,255,0.6)',
                      fontFamily: 'Inter, system-ui, sans-serif',
                    }}>
                      Checking your nutrition facts…
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── CARTON stage: two-column layout ─────── */}
              <AnimatePresence>
                {showCarton && (
                  <motion.div
                    key="carton-layout"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4 }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 40,
                      padding: '20px 24px',
                      width: '100%',
                      maxWidth: 860,
                      flexWrap: 'wrap',
                    }}
                  >
                    {/* Left: blender + text */}
                    <motion.div
                      initial={{ x: -40, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 220, damping: 22 }}
                      style={{ textAlign: 'center', flexShrink: 0 }}
                    >
                      <div className="float-animation" style={{ marginBottom: 16 }}>
                        <BlenderSVG isShaking={false} fillLevel={0.8} liquidColor="#FDE68A" />
                      </div>
                      <h2 className="shimmer-text" style={{
                        fontSize: 26, fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 6,
                        fontFamily: 'Inter, system-ui, sans-serif',
                      }}>
                        Sweet Success.
                      </h2>
                      <p style={{
                        fontSize: 13, color: 'rgba(255,255,255,0.75)',
                        fontFamily: 'Inter, system-ui, sans-serif', marginBottom: 20,
                      }}>
                        Session complete 🍹
                      </p>

                      {/* Action buttons */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
                        <motion.button
                          whileHover={{ scale: 1.06, boxShadow: '0 8px 30px rgba(0,0,0,0.3)' }}
                          whileTap={{ scale: 0.97 }}
                          onClick={onReset}
                          style={{
                            background: 'rgba(255,255,255,0.95)', color: '#92400E',
                            border: 'none', borderRadius: 50,
                            padding: '12px 28px', fontSize: 14, fontWeight: 700,
                            cursor: 'pointer', fontFamily: 'Inter, system-ui, sans-serif',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                          }}
                        >
                          🔄 &nbsp;Blend Again
                        </motion.button>
                      </div>
                    </motion.div>

                    {/* Right: Carton Label */}
                    <motion.div
                      initial={{ x: 40, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 220, damping: 22, delay: 0.1 }}
                      style={{ flex: '0 1 360px', minWidth: 280 }}
                    >
                      <CartonLabel
                        sessionVirtues={sessionVirtues}
                        heavyUpgrades={heavyUpgrades}
                        totalTasks={tasks.length}
                      />
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}
