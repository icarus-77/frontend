import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { VIRTUES, VIRTUE_META } from '../virtues';
import { useStore, selectProfile } from '../store/useStore';

// ─── Custom Radar Dot ─────────────────────────────────────────────────────────
function CustomDot({ cx, cy, r, fill }) {
  return (
    <circle
      cx={cx} cy={cy} r={r + 3}
      fill={fill}
      stroke="rgba(255,255,255,0.6)"
      strokeWidth={2}
      style={{ filter: `drop-shadow(0 0 6px ${fill})` }}
    />
  );
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const { subject, value } = payload[0].payload;
  const meta = VIRTUE_META[subject];
  return (
    <div style={{
      background: 'rgba(15, 12, 0, 0.92)',
      border: `1.5px solid ${meta?.color ?? '#FBBF24'}`,
      borderRadius: 10,
      padding: '8px 12px',
      fontFamily: 'Inter, system-ui, sans-serif',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
        <span style={{ fontSize: 16 }}>{meta?.icon}</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: meta?.color ?? '#FBBF24' }}>
          {subject}
        </span>
      </div>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginBottom: 2 }}>
        {meta?.description}
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: '#FDE68A' }}>
        {value} <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>pts</span>
      </div>
    </div>
  );
}

// ─── Custom Axis Tick ──────────────────────────────────────────────────────────
function CustomTick({ x, y, payload }) {
  const meta = VIRTUE_META[payload.value];
  if (!meta) return null;
  return (
    <text x={x} y={y} textAnchor="middle" dominantBaseline="middle">
      <tspan dy={-10} fontSize={18}>{meta.icon}</tspan>
      <tspan x={x} dy={16} fontSize={10} fill={meta.color} fontWeight={700}
        fontFamily="Inter, system-ui, sans-serif">
        {payload.value}
      </tspan>
    </text>
  );
}

/**
 * ProfileStats — Slide-in drawer showing the user's Lifetime Virtue Profile.
 *
 * Props:
 *   isOpen    {boolean}   — controls the slide-in
 *   onClose   {Function}
 */
export function ProfileStats({ isOpen, onClose }) {
  const profile = useStore(selectProfile);
  const { lifetimeStats, totalShakes, rank } = profile;

  // Prepare radar data
  const radarData = useMemo(
    () => VIRTUES.map((v) => ({ subject: v, value: lifetimeStats[v] ?? 0, fullMark: 50 })),
    [lifetimeStats]
  );

  const totalPoints = VIRTUES.reduce((sum, v) => sum + (lifetimeStats[v] ?? 0), 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="profile-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(5, 3, 0, 0.6)',
              backdropFilter: 'blur(4px)',
              zIndex: 8000,
            }}
          />

          {/* Drawer */}
          <motion.aside
            key="profile-drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            style={{
              position: 'fixed',
              top: 0, right: 0, bottom: 0,
              width: 'min(440px, 100vw)',
              background: 'linear-gradient(160deg, #1a1200 0%, #0f0c00 60%, #0a0800 100%)',
              borderLeft: '1px solid rgba(245, 158, 11, 0.2)',
              zIndex: 8001,
              display: 'flex',
              flexDirection: 'column',
              overflowY: 'auto',
            }}
          >
            {/* ── Header ─────────────────────────────────────────────── */}
            <div style={{
              padding: '24px 24px 16px',
              borderBottom: '1px solid rgba(245, 158, 11, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexShrink: 0,
            }}>
              <div>
                <div style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: 'rgba(253,230,138,0.5)',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  fontFamily: 'Inter, system-ui, sans-serif',
                  marginBottom: 4,
                }}>
                  Lifetime Profile
                </div>
                <h2 style={{
                  margin: 0,
                  fontSize: 22,
                  fontWeight: 900,
                  letterSpacing: '-0.02em',
                  background: 'linear-gradient(90deg, #FDE68A, #F59E0B)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontFamily: 'Inter, system-ui, sans-serif',
                }}>
                  Virtue Dashboard
                </h2>
              </div>
              <motion.button
                whileHover={{ scale: 1.08, background: 'rgba(245,158,11,0.15)' }}
                whileTap={{ scale: 0.94 }}
                onClick={onClose}
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.7)',
                  borderRadius: 8,
                  padding: '6px 10px',
                  cursor: 'pointer',
                  fontSize: 16,
                  lineHeight: 1,
                }}
                aria-label="Close profile"
              >
                ✕
              </motion.button>
            </div>

            {/* ── Rank Card ───────────────────────────────────────────── */}
            <div style={{ padding: '20px 24px 0' }}>
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                style={{
                  background: 'linear-gradient(135deg, rgba(251,191,36,0.12), rgba(245,158,11,0.06))',
                  border: '1.5px solid rgba(251,191,36,0.3)',
                  borderRadius: 16,
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  marginBottom: 20,
                }}
              >
                <motion.div
                  animate={{ rotate: [0, -8, 8, -4, 4, 0] }}
                  transition={{ delay: 0.5, duration: 1.2, repeat: Infinity, repeatDelay: 4 }}
                  style={{ fontSize: 44, lineHeight: 1 }}
                >
                  {rank.icon}
                </motion.div>
                <div>
                  <div style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: 'rgba(253,230,138,0.5)',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    fontFamily: 'Inter, system-ui, sans-serif',
                    marginBottom: 3,
                  }}>
                    Current Rank
                  </div>
                  <div style={{
                    fontSize: 22,
                    fontWeight: 900,
                    color: '#FDE68A',
                    letterSpacing: '-0.02em',
                    fontFamily: 'Inter, system-ui, sans-serif',
                    lineHeight: 1.1,
                  }}>
                    {rank.title}
                  </div>
                  <div style={{
                    fontSize: 12,
                    color: 'rgba(253,230,138,0.55)',
                    fontFamily: 'Inter, system-ui, sans-serif',
                    marginTop: 3,
                  }}>
                    🍹 {totalShakes} shake{totalShakes !== 1 ? 's' : ''} completed
                    &nbsp;·&nbsp;
                    {totalPoints} total pts
                  </div>
                </div>
              </motion.div>

              {/* ── Radar Chart ───────────────────────────────────────── */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.25, type: 'spring', stiffness: 200, damping: 20 }}
                style={{ marginBottom: 20 }}
              >
                <div style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: 'rgba(253,230,138,0.45)',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  fontFamily: 'Inter, system-ui, sans-serif',
                  marginBottom: 8,
                }}>
                  Virtue Radar
                </div>
                <div style={{
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: 16,
                  border: '1px solid rgba(255,255,255,0.06)',
                  padding: '12px 0',
                }}>
                  <ResponsiveContainer width="100%" height={260}>
                    <RadarChart data={radarData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                      <PolarGrid
                        stroke="rgba(255,255,255,0.08)"
                        gridType="polygon"
                      />
                      <PolarAngleAxis
                        dataKey="subject"
                        tick={<CustomTick />}
                        tickLine={false}
                        axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                      />
                      <Radar
                        name="Lifetime"
                        dataKey="value"
                        stroke="#F59E0B"
                        fill="#F59E0B"
                        fillOpacity={0.22}
                        strokeWidth={2.5}
                        dot={<CustomDot fill="#FBBF24" />}
                        activeDot={{ r: 7, fill: '#FDE68A', stroke: '#fff', strokeWidth: 2 }}
                        animationBegin={300}
                        animationDuration={900}
                        animationEasing="ease-out"
                      />
                      <Tooltip content={<CustomTooltip />} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              {/* ── Virtue Stat Bars ──────────────────────────────────── */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                style={{ paddingBottom: 32 }}
              >
                <div style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: 'rgba(253,230,138,0.45)',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  fontFamily: 'Inter, system-ui, sans-serif',
                  marginBottom: 12,
                }}>
                  Lifetime Stats
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {VIRTUES.map((virtue, i) => {
                    const val = lifetimeStats[virtue] ?? 0;
                    const meta = VIRTUE_META[virtue];
                    // Cap bar at 50 pts for visual scale
                    const barPct = Math.min((val / 50) * 100, 100);
                    return (
                      <motion.div
                        key={virtue}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.45 + i * 0.07 }}
                      >
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: 5,
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                            <span style={{ fontSize: 14 }}>{meta.icon}</span>
                            <span style={{
                              fontSize: 13,
                              fontWeight: 600,
                              color: meta.color,
                              fontFamily: 'Inter, system-ui, sans-serif',
                            }}>
                              {virtue}
                            </span>
                          </div>
                          <span style={{
                            fontSize: 13,
                            fontWeight: 800,
                            color: val > 0 ? meta.color : 'rgba(255,255,255,0.25)',
                            fontFamily: 'Inter, system-ui, sans-serif',
                          }}>
                            {val} pts
                          </span>
                        </div>
                        <div style={{
                          height: 7,
                          background: 'rgba(255,255,255,0.07)',
                          borderRadius: 4,
                          overflow: 'hidden',
                        }}>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${barPct}%` }}
                            transition={{ duration: 0.9, ease: 'easeOut', delay: 0.5 + i * 0.08 }}
                            style={{
                              height: '100%',
                              background: `linear-gradient(90deg, ${meta.color}cc, ${meta.color})`,
                              borderRadius: 4,
                              boxShadow: barPct > 0 ? `0 0 8px ${meta.glow}` : 'none',
                            }}
                          />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
