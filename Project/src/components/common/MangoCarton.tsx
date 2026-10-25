import React from 'react';

interface MangoCartonProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const MangoCarton: React.FC<MangoCartonProps> = ({ className = '', size = 'md' }) => {
  const scales = { sm: 0.7, md: 1, lg: 1.25 };
  const s = scales[size] ?? 1;
  const w = Math.round(200 * s);
  const h = Math.round(310 * s);

  return (
    <div className={`inline-block select-none ${className}`} style={{ transformStyle: 'preserve-3d', perspective: 800 }}>
      <svg
        width={w}
        height={h}
        viewBox="0 0 200 310"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Mango Harvest carton"
        role="img"
      >
        <defs>
          <linearGradient id="mc-tp-body" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFE566" />
            <stop offset="100%" stopColor="#FACC15" />
          </linearGradient>

          <linearGradient id="mc-tp-side" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#E5B800" />
            <stop offset="100%" stopColor="#C49B00" />
          </linearGradient>

          <linearGradient id="mc-tp-gable" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#F3C618" />
            <stop offset="100%" stopColor="#FFE680" />
          </linearGradient>

          <radialGradient id="mc-mango-grad" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#FFB04D" />
            <stop offset="100%" stopColor="#FB923C" />
          </radialGradient>
        </defs>

        {/* Drop Shadow */}
        <ellipse cx="88" cy="298" rx="76" ry="10" fill="rgba(23,37,84,0.18)" />

        {/* 3D Side Panel */}
        <path d="M160,72 L196,88 L196,280 L160,280 Z" fill="url(#mc-tp-side)" stroke="#172554" strokeWidth="2.5" strokeLinejoin="round" />
        <line x1="160" y1="95" x2="196" y2="111" stroke="#172554" strokeWidth="1.5" opacity="0.3" />
        <line x1="160" y1="160" x2="196" y2="176" stroke="#172554" strokeWidth="1.5" opacity="0.3" />
        <text
          transform="rotate(90,178,180)"
          x="178"
          y="180"
          textAnchor="middle"
          fill="#172554"
          fontSize="10"
          fontFamily="Space Grotesk, sans-serif"
          fontWeight="700"
          letterSpacing="2.5"
          opacity="0.65"
        >
          PURE SPRINT
        </text>

        {/* Top Gable Peak Side Slope */}
        <polygon points="160,72 196,88 180,38 144,22" fill="#D4A000" stroke="#172554" strokeWidth="2" strokeLinejoin="round" />

        {/* Front Main Gable Slope */}
        <polygon points="15,55 160,72 144,22 15,22" fill="url(#mc-tp-gable)" stroke="#172554" strokeWidth="2.5" strokeLinejoin="round" />

        {/* Gable Ridge Crest Fold */}
        <polygon points="15,22 144,22 136,12 15,12" fill="#FACC15" stroke="#172554" strokeWidth="2" strokeLinejoin="round" />

        {/* Front Main Face */}
        <rect x="15" y="55" width="145" height="225" rx="3" fill="url(#mc-tp-body)" stroke="#172554" strokeWidth="3" />

        {/* Top Header Banner Strip */}
        <rect x="15" y="55" width="145" height="34" fill="#172554" />
        <text
          x="87"
          y="77"
          textAnchor="middle"
          fill="#FACC15"
          fontFamily="Bebas Neue, sans-serif"
          fontSize="19"
          letterSpacing="2"
        >
          MANGO HARVEST
        </text>

        {/* Center Mango Illustration */}
        <g transform="translate(87, 160)">
          <path
            d="M 0,-42 C 30,-42 46,-18 46,14 C 46,46 22,54 0,54 C -22,54 -46,46 -46,14 C -46,-18 -30,-42 0,-42 Z"
            fill="url(#mc-mango-grad)"
            stroke="#172554"
            strokeWidth="3"
          />
          {/* Stem & Leaf */}
          <path d="M 0,-42 C -4,-54 2,-62 10,-60 C 8,-52 4,-46 0,-42 Z" fill="#22C55E" stroke="#172554" strokeWidth="2" />
          <path d="M 6,-54 C 20,-62 34,-52 28,-42 C 18,-42 10,-48 6,-54 Z" fill="#22C55E" stroke="#172554" strokeWidth="2" />
          {/* Cute Face */}
          <circle cx="-13" cy="6" r="3.5" fill="#172554" />
          <circle cx="13" cy="6" r="3.5" fill="#172554" />
          <circle cx="-14" cy="4" r="1.2" fill="#FFFFFF" />
          <circle cx="12" cy="4" r="1.2" fill="#FFFFFF" />
          {/* Smile */}
          <path d="M -6,16 Q 0,22 6,16" stroke="#172554" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          {/* Cheeks */}
          <ellipse cx="-20" cy="14" rx="4" ry="2" fill="#FF7A7A" opacity="0.6" />
          <ellipse cx="20" cy="14" rx="4" ry="2" fill="#FF7A7A" opacity="0.6" />
        </g>

        {/* Bottom Flavor Badge */}
        <rect x="25" y="235" width="125" height="30" rx="4" fill="#FFFFFF" stroke="#172554" strokeWidth="2" />
        <text
          x="87"
          y="254"
          textAnchor="middle"
          fill="#172554"
          fontFamily="Space Grotesk, sans-serif"
          fontWeight="800"
          fontSize="11"
          letterSpacing="1"
        >
          100% COLLABORATIVE
        </text>
      </svg>
    </div>
  );
};
