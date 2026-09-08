import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { VIRTUES, VIRTUE_META } from '../virtues';

/**
 * CartonLabel — Juice Carton Nutritional Facts panel.
 *
 * Styled like the back of a juice carton / FDA nutrition label.
 * Shows session virtue breakdown as % bars, highlights permanent
 * stat upgrades earned from HEAVY tasks this session.
 *
 * Props:
 *   sessionVirtues      { Intellect, Resilience, Discipline, Harmony, Vitality } — 0-100 each
 *   heavyUpgrades       [{ virtue, delta }] — permanent gains from this session
 *   totalTasks          number
 */
export function CartonLabel({ sessionVirtues = {}, heavyUpgrades = [], totalTasks = 0 }) {
  const [animated, setAnimated] = useState(false);

  // Trigger bar animations after a short mount delay
  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 200);
    return () => clearTimeout(t);
  }, []);

  // Group heavy upgrades by virtue for display
  const upgradeMap = {};
  for (const { virtue, delta } of heavyUpgrades) {
    upgradeMap[virtue] = (upgradeMap[virtue] ?? 0) + delta;
  }
  const hasUpgrades = Object.keys(upgradeMap).length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.93 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 220, damping: 20 }}
      style={{
        width: '100%',
        maxWidth: 360,
        background: '#FFFEF8',
        border: '3px solid #1a1a1a',
        borderRadius: 12,
        overflow: 'hidden',
        fontFamily: "'Courier New', Courier, monospace",
        boxShadow: '0 20px 60px rgba(0,0,0,0.35), 0 4px 16px rgba(0,0,0,0.2)',
        color: '#1a1a1a',
      }}
    >
      {/* ── Header Band ──────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, #F59E0B, #D97706)',
        padding: '10px 16px 8px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}>
        <span style={{ fontSize: 28 }}>🧃</span>
        <div>
          <div style={{
            fontSize: 18,
            fontWeight: 900,
            color: '#fff',
            letterSpacing: '-0.01em',
            fontFamily: 'Inter, system-ui, sans-serif',
          }}>
            MANGO SHAKE
          </div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.8)', letterSpacing: '0.1em' }}>
            PREMIUM BLEND · SESSION REPORT
          </div>
        </div>
      </div>

      <div style={{ padding: '12px 16px' }}>

        {/* ── Title Row ─────────────────────────────── */}
        <div style={{ borderBottom: '8px solid #1a1a1a', paddingBottom: 4, marginBottom: 2 }}>
          <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1 }}>
            Nutrition Facts
          </div>
        </div>

        {/* ── Serving info ──────────────────────────── */}
        <div style={{ borderBottom: '1px solid #1a1a1a', padding: '4px 0', fontSize: 11 }}>
          <span>{totalTasks} serving{totalTasks !== 1 ? 's' : ''} per session</span>
        </div>
        <div style={{
          borderBottom: '4px solid #1a1a1a',
          padding: '4px 0',
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 11,
        }}>
          <span>Blend Size</span>
          <span style={{ fontWeight: 700 }}>{totalTasks} task{totalTasks !== 1 ? 's' : ''}</span>
        </div>

        {/* ── Column Header ─────────────────────────── */}
        <div style={{
          borderBottom: '1px solid #1a1a1a',
          padding: '3px 0',
          textAlign: 'right',
          fontSize: 9,
          letterSpacing: '0.04em',
        }}>
          % Daily Virtue Value *
        </div>

        {/* ── Virtue Rows ───────────────────────────── */}
        {VIRTUES.map((virtue, i) => {
          const pct = sessionVirtues[virtue] ?? 0;
          const meta = VIRTUE_META[virtue];
          const isUpgraded = !!upgradeMap[virtue];

          return (
            <div
              key={virtue}
              style={{
                borderBottom: '1px solid #ccc',
                padding: '5px 0',
              }}
            >
              {/* Label row */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 4,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 13 }}>{meta.icon}</span>
                  <span style={{
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: '0.01em',
                  }}>
                    {virtue}
                  </span>
                  {/* Permanent upgrade badge */}
                  {isUpgraded && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 300, delay: i * 0.08 + 0.4 }}
                      style={{
                        background: 'linear-gradient(135deg, #FBBF24, #F59E0B)',
                        color: '#1a1a1a',
                        fontSize: 9,
                        fontWeight: 900,
                        borderRadius: 4,
                        padding: '1px 5px',
                        letterSpacing: '0.05em',
                        fontFamily: 'Inter, system-ui, sans-serif',
                        boxShadow: '0 0 8px rgba(251,191,36,0.6)',
                      }}
                    >
                      ⭐ +{upgradeMap[virtue]} PERM
                    </motion.span>
                  )}
                </div>
                <span style={{ fontSize: 12, fontWeight: 700 }}>{pct}%</span>
              </div>

              {/* Progress bar */}
              <div style={{
                height: 8,
                background: '#e5e7eb',
                borderRadius: 4,
                overflow: 'hidden',
              }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: animated ? `${pct}%` : 0 }}
                  transition={{ duration: 0.7, ease: 'easeOut', delay: i * 0.1 + 0.1 }}
                  style={{
                    height: '100%',
                    background: isUpgraded
                      ? `linear-gradient(90deg, ${meta.color}, #FBBF24)`
                      : meta.color,
                    borderRadius: 4,
                    boxShadow: isUpgraded ? `0 0 6px ${meta.glow}` : 'none',
                  }}
                />
              </div>
            </div>
          );
        })}

        {/* ── Divider ───────────────────────────────── */}
        <div style={{ borderBottom: '4px solid #1a1a1a', margin: '6px 0' }} />

        {/* ── Permanent Upgrades Summary ─────────────── */}
        {hasUpgrades && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            style={{
              background: 'linear-gradient(135deg, rgba(251,191,36,0.12), rgba(245,158,11,0.08))',
              border: '1.5px solid #FBBF24',
              borderRadius: 8,
              padding: '8px 10px',
              marginBottom: 10,
            }}
          >
            <div style={{
              fontSize: 10,
              fontWeight: 900,
              letterSpacing: '0.08em',
              marginBottom: 6,
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              fontFamily: 'Inter, system-ui, sans-serif',
            }}>
              ⭐ HEAVY TASK STAT UPGRADES EARNED
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {Object.entries(upgradeMap).map(([virtue, delta]) => (
                <motion.div
                  key={virtue}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 0.9 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    background: VIRTUE_META[virtue].bg,
                    border: `1.5px solid ${VIRTUE_META[virtue].color}`,
                    borderRadius: 20,
                    padding: '2px 8px',
                    fontSize: 11,
                    fontWeight: 700,
                    fontFamily: 'Inter, system-ui, sans-serif',
                    color: VIRTUE_META[virtue].color,
                  }}
                >
                  <span>{VIRTUE_META[virtue].icon}</span>
                  <span>+{delta} {virtue}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Footnote ──────────────────────────────── */}
        <div style={{
          fontSize: 8,
          color: '#6b7280',
          lineHeight: 1.5,
          letterSpacing: '0.01em',
        }}>
          * % Daily Values based on a 100-point virtue blend.
          {hasUpgrades && ' ⭐ Permanent upgrades are added to your Lifetime Profile.'}
        </div>
      </div>
    </motion.div>
  );
}
