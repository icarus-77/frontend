/**
 * svgs.js — Pure Vector SVG Generator functions
 * Exact spec palette: Navy (#172554), Blue (#2563EB), Yellow (#FACC15), Orange (#FB923C), Green (#22C55E).
 * Uses standard SVG presentation attributes (stop-color, stop-opacity) for flawless browser color rendering.
 */

const C = {
  navy:   '#172554',
  blue:   '#2563EB',
  yellow: '#FACC15',
  orange: '#FB923C',
  green:  '#22C55E',
  white:  '#FFFFFF',
};

/**
 * Generates an adorable, vibrant MangoTetrapack SVG markup.
 */
export function renderTetrapack({ size = 'md', _animate = false } = {}) {
  const scales = { sm: 0.65, md: 1, lg: 1.25, xl: 1.55 };
  const s = scales[size] ?? 1;
  const w = Math.round(200 * s);
  const h = Math.round(310 * s);

  return `
    <div style="display: inline-block; transform-style: preserve-3d; perspective: 800px;">
      <svg
        width="${w}"
        height="${h}"
        viewBox="0 0 200 310"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Cute Mango Harvest limited-edition carton pack"
        role="img"
      >
        <defs>
          <linearGradient id="tp-body" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#FFE566" />
            <stop offset="100%" stop-color="#FACC15" />
          </linearGradient>

          <linearGradient id="tp-side" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#E5B800" />
            <stop offset="100%" stop-color="#C49B00" />
          </linearGradient>

          <linearGradient id="tp-gable" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stop-color="#F3C618" />
            <stop offset="100%" stop-color="#FFE680" />
          </linearGradient>

          <linearGradient id="tp-sheen" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.35" />
            <stop offset="35%" stop-color="#FFFFFF" stop-opacity="0.1" />
            <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0" />
          </linearGradient>

          <radialGradient id="mango-grad" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stop-color="#FFB04D" />
            <stop offset="100%" stop-color="#FB923C" />
          </radialGradient>

          <filter id="tp-dropshadow" x="-20%" y="-10%" width="150%" height="140%">
            <feDropShadow dx="4" dy="10" stdDeviation="10" flood-color="${C.navy}" flood-opacity="0.25" />
          </filter>

          <clipPath id="clip-front">
            <rect x="15" y="55" width="145" height="225" rx="4" />
          </clipPath>
        </defs>

        <!-- Drop Shadow Ellipse -->
        <ellipse cx="88" cy="298" rx="76" ry="10" fill="rgba(23,37,84,0.18)" />

        <!-- 3D Side Panel -->
        <path d="M160,72 L196,88 L196,280 L160,280 Z" fill="url(#tp-side)" stroke="${C.navy}" stroke-width="2.5" stroke-linejoin="round" />
        <line x1="160" y1="95" x2="196" y2="111" stroke="${C.navy}" stroke-width="1.5" opacity="0.3" />
        <line x1="160" y1="160" x2="196" y2="176" stroke="${C.navy}" stroke-width="1.5" opacity="0.3" />
        <text
          transform="rotate(90,178,180)"
          x="178" y="180"
          text-anchor="middle"
          font-size="8"
          fill="${C.navy}"
          font-family="'Space Grotesk', sans-serif"
          font-weight="800"
          letter-spacing="2"
        >
          CHANGO MANGO · 100% PURE
        </text>

        <!-- Front Face Base -->
        <rect
          x="15" y="55" width="145" height="225" rx="4"
          fill="url(#tp-body)"
          filter="url(#tp-dropshadow)"
        />

        <!-- Electric Blue Header Block -->
        <rect
          x="15" y="55" width="145" height="78"
          fill="${C.blue}"
          clip-path="url(#clip-front)"
        />
        <line x1="15" y1="133" x2="160" y2="133" stroke="${C.navy}" stroke-width="3" />

        <!-- Header Titles -->
        <text
          x="88" y="98"
          text-anchor="middle"
          font-size="30"
          font-family="'Bebas Neue', sans-serif"
          fill="${C.yellow}"
          stroke="${C.navy}"
          stroke-width="1"
          letter-spacing="1.5"
        >
          MANGO
        </text>
        <text
          x="88" y="120"
          text-anchor="middle"
          font-size="11"
          font-family="'Space Grotesk', sans-serif"
          font-weight="800"
          fill="${C.white}"
          letter-spacing="3.5"
        >
          HARVEST
        </text>

        <!-- Cute Mango Character Graphic -->
        <g id="cute-mango-character">
          <!-- Mango Body -->
          <ellipse cx="88" cy="188" rx="40" ry="34" fill="url(#mango-grad)" stroke="${C.navy}" stroke-width="3" />
          <!-- Highlight Glow -->
          <ellipse cx="74" cy="174" rx="14" ry="10" fill="${C.white}" opacity="0.45" />

          <!-- Cute Cheeks -->
          <circle cx="70" cy="194" r="6" fill="#F87171" opacity="0.6" />
          <circle cx="106" cy="194" r="6" fill="#F87171" opacity="0.6" />

          <!-- Cute Happy Eyes -->
          <circle cx="76" cy="184" r="3.5" fill="${C.navy}" />
          <circle cx="77.5" cy="182.5" r="1" fill="${C.white}" />
          <circle cx="100" cy="184" r="3.5" fill="${C.navy}" />
          <circle cx="101.5" cy="182.5" r="1" fill="${C.white}" />

          <!-- Cute Happy Smile -->
          <path d="M 83 192 Q 88 198 93 192" stroke="${C.navy}" stroke-width="2.5" stroke-linecap="round" fill="none" />

          <!-- Leaf Sprout on Top -->
          <path
            d="M 88 154 Q 96 142 108 140 C 114 148 104 158 92 155 Z"
            fill="${C.green}"
            stroke="${C.navy}"
            stroke-width="2.5"
            stroke-linejoin="round"
          />
        </g>

        <!-- Edition Badge -->
        <rect x="24" y="142" width="70" height="18" fill="${C.yellow}" stroke="${C.navy}" stroke-width="2" rx="4" />
        <text
          x="59" y="154"
          text-anchor="middle"
          font-size="8"
          font-family="'Space Grotesk', sans-serif"
          font-weight="800"
          fill="${C.navy}"
          letter-spacing="1"
        >
          LIMITED EDITION
        </text>

        <!-- Green Bottom Accent Stripe -->
        <rect x="15" y="246" width="145" height="8" fill="${C.green}" clip-path="url(#clip-front)" />
        <line x1="15" y1="246" x2="160" y2="246" stroke="${C.navy}" stroke-width="2" />

        <!-- Navy Bottom Footer Band -->
        <rect x="15" y="254" width="145" height="26" fill="${C.navy}" clip-path="url(#clip-front)" />
        <text
          x="88" y="271"
          text-anchor="middle"
          font-size="8"
          font-family="'Space Grotesk', sans-serif"
          font-weight="800"
          fill="${C.yellow}"
          letter-spacing="2"
        >
          SEEDS · RIPEN · HARVEST
        </text>

        <!-- Glass Sheen Overlay -->
        <rect
          x="15" y="55" width="145" height="225" rx="4"
          fill="url(#tp-sheen)"
          clip-path="url(#clip-front)"
        />

        <!-- Front Outer Border -->
        <rect x="15" y="55" width="145" height="225" rx="4" stroke="${C.navy}" stroke-width="3" fill="none" />

        <!-- Top Gable Top Roof -->
        <path d="M15,55 L88,18 L160,55 Z" fill="url(#tp-gable)" stroke="${C.navy}" stroke-width="3" stroke-linejoin="round" />
        <line x1="88" y1="18" x2="88" y2="55" stroke="${C.navy}" stroke-width="2" stroke-dasharray="3,3" />

        <!-- Right Gable Roof -->
        <path d="M160,55 L196,72 L118,38 Z" fill="#DDA000" stroke="${C.navy}" stroke-width="2.5" stroke-linejoin="round" />

        <!-- Cute Spout Cap -->
        <rect x="68" y="10" width="40" height="11" rx="5" fill="${C.blue}" stroke="${C.navy}" stroke-width="2.5" />
        <rect x="74" y="12" width="28" height="7" rx="3" fill="${C.yellow}" stroke="${C.navy}" stroke-width="1.5" />
      </svg>
    </div>
  `;
}

/**
 * Generates a cute, colorful Blender SVG markup.
 */
export function renderBlender({
  isShaking = false,
  fillLevel = 0,
  liquidColor = '#FB923C',
  compact = false,
} = {}) {
  if (compact) {
    return `
      <svg width="28" height="28" viewBox="0 0 180 300" fill="none" aria-hidden="true">
        <path d="M40 42 L24 210 L156 210 L140 42 Z" fill="#FACC15" stroke="#172554" stroke-width="6" stroke-linejoin="round" />
        <path d="M46 42 L134 42 L124 14 L56 14 Z" fill="#2563EB" stroke="#172554" stroke-width="5" stroke-linejoin="round" />
        <rect x="22" y="218" width="136" height="64" rx="10" fill="#FB923C" stroke="#172554" stroke-width="5" />
        <rect x="62" y="232" width="56" height="16" rx="3" fill="#FACC15" />
        <circle cx="148" cy="250" r="8" fill="#22C55E" />
      </svg>
    `;
  }

  const jarTop = 42;
  const jarBottom = 210;
  const jarH = jarBottom - jarTop;
  const liquidY = jarBottom - jarH * fillLevel;

  return `
    <div class="${isShaking ? 'is-shaking' : ''}" style="display: inline-block; transform-origin: bottom center;">
      <svg
        width="180"
        height="300"
        viewBox="0 0 180 300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Cute countertop mango smoothie blender"
        role="img"
      >
        <defs>
          <linearGradient id="bl-base" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="${C.blue}" />
            <stop offset="100%" stop-color="#1D4ED8" />
          </linearGradient>

          <linearGradient id="bl-jar-sheen" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.4" />
            <stop offset="35%" stop-color="#FFFFFF" stop-opacity="0.1" />
            <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0" />
          </linearGradient>

          <linearGradient id="bl-liquid" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#FFE033" stop-opacity="0.95" />
            <stop offset="100%" stop-color="${liquidColor}" stop-opacity="0.95" />
          </linearGradient>

          <clipPath id="bl-jar-clip">
            <path d="M40 42 L24 210 L156 210 L140 42 Z" />
          </clipPath>

          <filter id="bl-shadow" x="-20%" y="-10%" width="140%" height="140%">
            <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="${C.navy}" flood-opacity="0.25" />
          </filter>
        </defs>

        <!-- Drop Shadow Ellipse -->
        <ellipse cx="90" cy="292" rx="72" ry="8" fill="rgba(23,37,84,0.18)" />

        <!-- Motor Base (Vibrant Electric Blue with Navy Trim) -->
        <rect
          x="18" y="216" width="144" height="70"
          rx="12"
          fill="url(#bl-base)"
          stroke="${C.navy}"
          stroke-width="3.5"
          filter="url(#bl-shadow)"
        />

        <!-- Base Vent Lines -->
        <line x1="24" y1="232" x2="156" y2="232" stroke="${C.navy}" stroke-width="1.5" opacity="0.3" />
        <line x1="24" y1="244" x2="156" y2="244" stroke="${C.navy}" stroke-width="1.5" opacity="0.3" />
        <line x1="24" y1="256" x2="156" y2="256" stroke="${C.navy}" stroke-width="1.5" opacity="0.3" />

        <!-- Tactile Button Controls -->
        <rect x="26" y="224" width="36" height="16" rx="3" fill="${C.navy}" stroke="${C.navy}" stroke-width="1.5" />
        <text x="44" y="235" text-anchor="middle" font-size="7.5" font-weight="800" fill="${C.yellow}" font-family="'Space Grotesk', sans-serif">SLOW</text>

        <rect x="72" y="222" width="36" height="20" rx="3" fill="${C.yellow}" stroke="${C.navy}" stroke-width="2.5" />
        <text x="90" y="235" text-anchor="middle" font-size="8" font-weight="900" fill="${C.navy}" font-family="'Space Grotesk', sans-serif">BLEND</text>

        <rect x="118" y="224" width="36" height="16" rx="3" fill="${C.navy}" stroke="${C.navy}" stroke-width="1.5" />
        <text x="136" y="235" text-anchor="middle" font-size="7.5" font-weight="800" fill="${C.yellow}" font-family="'Space Grotesk', sans-serif">PULSE</text>

        <!-- Power Dial Knob -->
        <circle cx="90" cy="264" r="11" fill="${C.yellow}" stroke="${C.navy}" stroke-width="2.5" />
        <circle cx="90" cy="264" r="6" fill="${C.orange}" stroke="${C.navy}" stroke-width="1.5" />
        <circle cx="90" cy="259" r="2" fill="${C.white}" />

        <!-- Glowing Green LED Indicator -->
        <circle cx="152" cy="226" r="5" fill="${C.green}" stroke="${C.navy}" stroke-width="2" />
        <circle cx="152" cy="226" r="2" fill="${C.white}" />

        <!-- Collar Assembly -->
        <rect x="30" y="206" width="120" height="14" rx="4" fill="${C.yellow}" stroke="${C.navy}" stroke-width="3" />
        <rect x="44" y="210" width="92" height="6" rx="2" fill="${C.navy}" opacity="0.3" />

        <!-- Jar Body (Clear Glass Tinted Blue with Navy Outline) -->
        <path
          d="M40 42 L24 210 L156 210 L140 42 Z"
          fill="rgba(37, 99, 235, 0.08)"
          stroke="${C.navy}"
          stroke-width="4.5"
          stroke-linejoin="round"
        />

        <!-- Liquid Smoothie Fill -->
        ${
          fillLevel > 0
            ? `
          <g clip-path="url(#bl-jar-clip)">
            <rect x="0" y="${liquidY}" width="180" height="${jarBottom - liquidY + 6}" fill="url(#bl-liquid)" />
            <!-- Wavy Smoothie Surface -->
            <path
              d="M24 ${liquidY} Q57 ${liquidY - 8} 90 ${liquidY} Q123 ${liquidY + 8} 156 ${liquidY} L156 ${liquidY + 6} Q123 ${liquidY + 14} 90 ${liquidY + 6} Q57 ${liquidY - 2} 24 ${liquidY + 6} Z"
              fill="${C.yellow}"
            />
            <!-- Cute Floating Fruit Bubbles inside Blender -->
            <circle cx="60" cy="${liquidY + 30}" r="6" fill="${C.orange}" stroke="${C.navy}" stroke-width="1.5" />
            <circle cx="120" cy="${liquidY + 50}" r="8" fill="${C.yellow}" stroke="${C.navy}" stroke-width="1.5" />
            <circle cx="85" cy="${liquidY + 70}" r="5" fill="${C.green}" stroke="${C.navy}" stroke-width="1.5" />
          </g>
        `
            : ''
        }

        <!-- Glass Sheen Highlight -->
        <path d="M40 42 L24 210 L156 210 L140 42 Z" fill="url(#bl-jar-sheen)" />
        <line x1="48" y1="46" x2="35" y2="204" stroke="${C.white}" stroke-width="3" opacity="0.6" stroke-linecap="round" />

        <!-- Lid Assembly (Vivid Orange & Blue Cap) -->
        <path
          d="M46 42 L134 42 L124 14 L56 14 Z"
          fill="${C.orange}"
          stroke="${C.navy}"
          stroke-width="4"
          stroke-linejoin="round"
        />
        <line x1="62" y1="28" x2="118" y2="28" stroke="${C.navy}" stroke-width="1.5" opacity="0.4" />
        <rect x="68" y="3" width="44" height="14" rx="7" fill="${C.yellow}" stroke="${C.navy}" stroke-width="3" />
        <circle cx="90" cy="10" r="3.5" fill="${C.blue}" stroke="${C.navy}" stroke-width="1.5" />

        <!-- Pouring Spout -->
        <path d="M140 78 L164 64 L169 76 L145 92 Z" fill="${C.yellow}" stroke="${C.navy}" stroke-width="3" stroke-linejoin="round" />

        <!-- Retro Curved Handle -->
        <path d="M24 100 C-10 100 -10 176 24 176" stroke="${C.yellow}" stroke-width="14" stroke-linecap="round" fill="none" />
        <path d="M24 100 C-10 100 -10 176 24 176" stroke="${C.navy}" stroke-width="3.5" stroke-linecap="round" fill="none" />

        <!-- Spinning Blade Assembly -->
        <g style="transform-origin: 90px 198px; ${isShaking ? 'animation: spin-blade 0.15s linear infinite;' : ''}">
          <line x1="56" y1="198" x2="124" y2="198" stroke="${C.navy}" stroke-width="4.5" stroke-linecap="round" />
          <line x1="90" y1="184" x2="90" y2="212" stroke="${C.navy}" stroke-width="4.5" stroke-linecap="round" />
          <circle cx="90" cy="198" r="6" fill="${C.yellow}" stroke="${C.navy}" stroke-width="2.5" />
        </g>

        <!-- Measurement Markings -->
        <g>
          <line x1="144" y1="110" x2="152" y2="110" stroke="${C.navy}" stroke-width="2" />
          <text x="156" y="113" font-size="8" fill="${C.navy}" font-family="monospace" font-weight="700">1C</text>
          <line x1="144" y1="148" x2="152" y2="148" stroke="${C.navy}" stroke-width="2" />
          <text x="156" y="151" font-size="8" fill="${C.navy}" font-family="monospace" font-weight="700">2C</text>
          <line x1="144" y1="184" x2="152" y2="184" stroke="${C.navy}" stroke-width="2" />
          <text x="156" y="187" font-size="8" fill="${C.navy}" font-family="monospace" font-weight="700">3C</text>
        </g>
      </svg>
    </div>
  `;
}

/**
 * Generates an 8-pointed starburst SVG.
 */
export function renderStarburst({ color = C.orange, size = 32 } = {}) {
  return `
    <svg width="${size}" height="${size}" viewBox="0 0 50 50" fill="${color}" stroke="${C.navy}" stroke-width="2" aria-hidden="true">
      <path d="M25 0 L28 18 L42 8 L32 22 L50 25 L32 28 L42 42 L28 32 L25 50 L22 32 L8 42 L18 28 L0 25 L18 22 L8 8 L22 18 Z" />
    </svg>
  `;
}
