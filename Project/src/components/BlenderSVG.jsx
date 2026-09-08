import React from 'react';
import { motion } from 'framer-motion';

/**
 * BlenderSVG — Minimalist glass blender illustration
 *
 * Props:
 *   isShaking {boolean} - triggers the blender-shake CSS keyframe animation
 *   fillLevel {number}  - 0 to 1, controls how full the blender liquid appears
 *   liquidColor {string} - CSS color for the liquid fill
 */
export function BlenderSVG({ isShaking = false, fillLevel = 0, liquidColor = '#FBBF24' }) {
  // Calculate the y position for the liquid top edge (SVG coordinate space)
  // The jar interior spans from y=30 to y=200 (height=170)
  const jarTop = 30;
  const jarBottom = 200;
  const jarHeight = jarBottom - jarTop;
  const liquidY = jarBottom - jarHeight * fillLevel;

  return (
    <div
      className={isShaking ? 'blender-shaking' : ''}
      style={{ transformOrigin: 'bottom center' }}
    >
      <svg
        width="160"
        height="280"
        viewBox="0 0 160 280"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Glass blender"
        role="img"
      >
        {/* ── Drop shadow filter ────────────────── */}
        <defs>
          <filter id="blender-shadow" x="-20%" y="-10%" width="140%" height="130%">
            <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="rgba(0,0,0,0.25)" />
          </filter>
          <linearGradient id="jar-glass" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.6)" />
            <stop offset="40%" stopColor="rgba(255,255,255,0.15)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.4)" />
          </linearGradient>
          <linearGradient id="liquid-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={liquidColor} stopOpacity="0.95" />
            <stop offset="100%" stopColor="#D97706" stopOpacity="0.85" />
          </linearGradient>
          <clipPath id="jar-clip">
            <path d="M35 30 L20 200 L140 200 L125 30 Z" />
          </clipPath>
        </defs>

        {/* ── Base / Motor ──────────────────────── */}
        <rect
          x="22" y="208" width="116" height="52"
          rx="8"
          fill="#374151"
          filter="url(#blender-shadow)"
        />
        <rect x="30" y="216" width="100" height="8" rx="4" fill="#4B5563" />
        {/* Speed buttons */}
        <rect x="36" y="230" width="24" height="12" rx="3" fill="#6B7280" />
        <rect x="68" y="230" width="24" height="12" rx="3" fill="#F59E0B" />
        <rect x="100" y="230" width="24" height="12" rx="3" fill="#6B7280" />
        <circle cx="80" cy="252" r="8" fill="#9CA3AF" />
        <circle cx="80" cy="252" r="4" fill="#D1D5DB" />

        {/* ── Coupling ring ─────────────────────── */}
        <rect x="38" y="200" width="84" height="12" rx="4" fill="#4B5563" />

        {/* ── Jar / Pitcher body ────────────────── */}
        {/* Jar background (frosted glass) */}
        <path
          d="M35 30 L20 200 L140 200 L125 30 Z"
          fill="rgba(220, 240, 255, 0.35)"
          stroke="rgba(255,255,255,0.6)"
          strokeWidth="1.5"
        />

        {/* Liquid fill (animated via fillLevel prop) */}
        {fillLevel > 0 && (
          <motion.g
            clipPath="url(#jar-clip)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            {/* Liquid body */}
            <rect
              x="0" y={liquidY}
              width="160" height={jarBottom - liquidY + 5}
              fill="url(#liquid-grad)"
            />
            {/* Liquid surface wave */}
            <motion.path
              d={`M20 ${liquidY} Q50 ${liquidY - 8} 80 ${liquidY} Q110 ${liquidY + 8} 140 ${liquidY} L140 ${liquidY + 4} Q110 ${liquidY + 12} 80 ${liquidY + 4} Q50 ${liquidY - 4} 20 ${liquidY + 4} Z`}
              fill={liquidColor}
              opacity={0.7}
              animate={{ d: [
                `M20 ${liquidY} Q50 ${liquidY - 8} 80 ${liquidY} Q110 ${liquidY + 8} 140 ${liquidY} L140 ${liquidY+4} Q110 ${liquidY+12} 80 ${liquidY+4} Q50 ${liquidY-4} 20 ${liquidY+4} Z`,
                `M20 ${liquidY} Q50 ${liquidY + 8} 80 ${liquidY} Q110 ${liquidY - 8} 140 ${liquidY} L140 ${liquidY+4} Q110 ${liquidY-4} 80 ${liquidY+4} Q50 ${liquidY+12} 20 ${liquidY+4} Z`,
                `M20 ${liquidY} Q50 ${liquidY - 8} 80 ${liquidY} Q110 ${liquidY + 8} 140 ${liquidY} L140 ${liquidY+4} Q110 ${liquidY+12} 80 ${liquidY+4} Q50 ${liquidY-4} 20 ${liquidY+4} Z`,
              ]}}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
          </motion.g>
        )}

        {/* Glass sheen / reflection (drawn on top of liquid) */}
        <path
          d="M35 30 L20 200 L140 200 L125 30 Z"
          fill="url(#jar-glass)"
          stroke="rgba(255,255,255,0.7)"
          strokeWidth="1.5"
        />

        {/* ── Lid ──────────────────────────────── */}
        <path
          d="M42 30 L118 30 L112 10 L48 10 Z"
          fill="#374151"
          stroke="rgba(255,255,255,0.3)"
          strokeWidth="1"
        />
        {/* Lid cap */}
        <rect x="62" y="2" width="36" height="10" rx="3" fill="#4B5563" />

        {/* ── Spout / Pour spout ───────────────── */}
        <path
          d="M125 80 L148 68 L152 76 L128 90 Z"
          fill="rgba(220, 240, 255, 0.5)"
          stroke="rgba(255,255,255,0.6)"
          strokeWidth="1.5"
        />

        {/* ── Handle ───────────────────────────── */}
        <path
          d="M20 100 C-8 100 -8 160 20 160"
          stroke="rgba(220, 240, 255, 0.7)"
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M20 100 C-4 100 -4 160 20 160"
          stroke="rgba(255, 255, 255, 0.5)"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />

        {/* ── Blade indicator ──────────────────── */}
        <line x1="55" y1="196" x2="80" y2="190" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round" />
        <line x1="80" y1="190" x2="105" y2="196" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round" />
        <circle cx="80" cy="190" r="3" fill="rgba(255,255,255,0.5)" />
      </svg>
    </div>
  );
}
