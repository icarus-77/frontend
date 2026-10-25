import React from 'react';
import { useGardenStore } from '../../store/useGardenStore';
import { VIRTUES, VIRTUE_META, getRankTitle } from '../../constants/gardenConstants';
import { X, Award, Zap } from 'lucide-react';

interface ProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileDrawer: React.FC<ProfileDrawerProps> = ({ isOpen, onClose }) => {
  const { lifetimeStats, currentUser } = useGardenStore();

  if (!isOpen) return null;

  const currentRank = getRankTitle(lifetimeStats.totalShakes);

  const center = 110;
  const radius = 75;
  const virtuesCount = VIRTUES.length;
  const maxVirtueVal = Math.max(...Object.values(lifetimeStats.virtues), 500);

  const points = VIRTUES.map((v, i) => {
    const angle = (i * 2 * Math.PI) / virtuesCount - Math.PI / 2;
    const val = lifetimeStats.virtues[v] || 0;
    const r = (val / maxVirtueVal) * radius * 0.9 + 15;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
      virtue: v,
      val,
    };
  });

  const polygonPath = points.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-md bg-white border-l-2 border-[#172554] h-full p-6 flex flex-col justify-between overflow-y-auto text-[#172554] font-['Space_Grotesk']">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b-2 border-[#172554]">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{currentUser.avatar}</span>
              <div>
                <p className="font-['Space_Grotesk'] text-[10px] font-bold uppercase tracking-wider text-[#2563EB] m-0">
                  Profile & Stats
                </p>
                <h3 className="font-['Bebas_Neue'] text-3xl text-[#172554] tracking-wide m-0">
                  {currentUser.name}
                </h3>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 border border-[#172554] hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Current Rank Card */}
          <div className="bg-[#FACC15] border-2 border-[#172554] shadow-[4px_4px_0_#172554] p-4 flex items-center gap-4 my-6">
            <span className="text-4xl">{currentRank.icon}</span>
            <div>
              <div className="text-[10px] uppercase font-bold text-[#172554]/70">Current Rank</div>
              <div className="font-['Bebas_Neue'] text-3xl text-[#172554] tracking-wider leading-none">
                {currentRank.title}
              </div>
              <div className="text-xs text-[#172554]/80 mt-1">
                {lifetimeStats.totalShakes} sessions · {lifetimeStats.totalXP.toLocaleString()} XP total
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="p-3 bg-slate-50 border-2 border-[#172554]">
              <div className="text-[10px] uppercase font-bold text-slate-500">Tasks Completed</div>
              <div className="font-['Bebas_Neue'] text-3xl text-[#22C55E]">
                {lifetimeStats.totalTasksHarvested}
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-2 border-[#172554]">
              <div className="text-[10px] uppercase font-bold text-slate-500">XP Earned</div>
              <div className="font-['Bebas_Neue'] text-3xl text-[#2563EB]">
                {lifetimeStats.totalXP.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Radar Chart */}
          <div className="border-2 border-[#172554] p-4 bg-slate-50/50 mb-6">
            <div className="text-xs font-bold uppercase tracking-wider text-[#172554] mb-3 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-[#2563EB]" />
              Virtue Balance Radar
            </div>

            <div className="flex justify-center">
              <svg width="220" height="220" viewBox="0 0 220 220" className="overflow-visible">
                {[0.3, 0.6, 0.9].map((ratio, idx) => (
                  <polygon
                    key={idx}
                    points={VIRTUES.map((_, i) => {
                      const angle = (i * 2 * Math.PI) / virtuesCount - Math.PI / 2;
                      const r = radius * ratio;
                      return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
                    }).join(' ')}
                    fill="none"
                    stroke="#172554"
                    strokeOpacity="0.1"
                    strokeWidth="1"
                  />
                ))}

                {VIRTUES.map((_, i) => {
                  const angle = (i * 2 * Math.PI) / virtuesCount - Math.PI / 2;
                  return (
                    <line
                      key={i}
                      x1={center}
                      y1={center}
                      x2={center + radius * Math.cos(angle)}
                      y2={center + radius * Math.sin(angle)}
                      stroke="#172554"
                      strokeOpacity="0.15"
                      strokeWidth="1"
                    />
                  );
                })}

                <polygon
                  points={polygonPath}
                  fill="rgba(37, 99, 235, 0.2)"
                  stroke="#2563EB"
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                />

                {points.map((p, i) => (
                  <g key={i}>
                    <circle cx={p.x} cy={p.y} r="3.5" fill="#2563EB" stroke="#FFFFFF" strokeWidth="1.5" />
                    <text
                      x={center + (radius + 20) * Math.cos((i * 2 * Math.PI) / virtuesCount - Math.PI / 2)}
                      y={center + (radius + 16) * Math.sin((i * 2 * Math.PI) / virtuesCount - Math.PI / 2)}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="#172554"
                      fontSize="9"
                      fontWeight="bold"
                    >
                      {p.virtue.slice(0, 3)}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-[#172554] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#2563EB] transition"
        >
          CLOSE PROFILE
        </button>
      </div>
    </div>
  );
};
