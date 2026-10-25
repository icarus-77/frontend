import React, { useMemo } from 'react';
import { useStore } from '../../store/useStore';
import { VIRTUES, VIRTUE_META } from '../../constants/gardenConstants';
import { Virtue } from '../../types/garden';
import { buildGamificationProfile } from '../../utils/gamification';
import { X, Award, Shield, Zap, Sparkles, CheckCircle2, Lock } from 'lucide-react';

interface LifeCharacterSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LifeCharacterSheet: React.FC<LifeCharacterSheetProps> = ({ isOpen, onClose }) => {
  const { currentUser, users, lifetimeStats } = useStore();

  const profile = useMemo(() => {
    return buildGamificationProfile(
      currentUser.totalXp || 0,
      currentUser.virtues || { Intellect: 0, Discipline: 0, Resilience: 0, Harmony: 0, Vitality: 0 },
      lifetimeStats.totalTasksHarvested || 0,
      lifetimeStats.totalShakes || 0
    );
  }, [currentUser, lifetimeStats]);

  // Compute team averages for the dual-polygon radar chart
  const teamVirtueAverages: Record<Virtue, number> = useMemo(() => {
    const acc: Record<Virtue, number> = {
      Intellect: 0,
      Discipline: 0,
      Resilience: 0,
      Harmony: 0,
      Vitality: 0,
    };
    if (!users || users.length === 0) return acc;
    users.forEach((u) => {
      VIRTUES.forEach((v) => {
        acc[v] += u.virtues?.[v] || 0;
      });
    });
    VIRTUES.forEach((v) => {
      acc[v] = Math.round(acc[v] / users.length);
    });
    return acc;
  }, [users]);

  // Pure SVG Dual-Polygon Radar Chart coordinates
  const radarChartData = useMemo(() => {
    const cx = 140;
    const cy = 140;
    const r = 95;
    const n = VIRTUES.length;

    // Calculate maximum scale
    const allValues = [
      ...Object.values(currentUser.virtues || {}),
      ...Object.values(teamVirtueAverages),
    ];
    const maxVal = Math.max(...allValues, 400);

    // Compute polygon vertices
    const getPoint = (v: Virtue, val: number, index: number) => {
      const angle = (index * 2 * Math.PI) / n - Math.PI / 2;
      const normalizedR = Math.max(12, (val / maxVal) * r);
      return {
        x: cx + normalizedR * Math.cos(angle),
        y: cy + normalizedR * Math.sin(angle),
        angle,
      };
    };

    const personalPoints = VIRTUES.map((v, i) =>
      getPoint(v, currentUser.virtues?.[v] || 0, i)
    );
    const teamPoints = VIRTUES.map((v, i) =>
      getPoint(v, teamVirtueAverages[v] || 0, i)
    );

    const personalPath = personalPoints.map((p) => `${p.x},${p.y}`).join(' ');
    const teamPath = teamPoints.map((p) => `${p.x},${p.y}`).join(' ');

    // Concentric guide rings (25%, 50%, 75%, 100%)
    const rings = [0.25, 0.5, 0.75, 1.0].map((frac) => {
      const ringPoints = VIRTUES.map((_, i) => {
        const angle = (i * 2 * Math.PI) / n - Math.PI / 2;
        return `${cx + r * frac * Math.cos(angle)},${cy + r * frac * Math.sin(angle)}`;
      });
      return ringPoints.join(' ');
    });

    // Outer label positions
    const labelPositions = VIRTUES.map((v, i) => {
      const angle = (i * 2 * Math.PI) / n - Math.PI / 2;
      const labelR = r + 26;
      return {
        virtue: v,
        x: cx + labelR * Math.cos(angle),
        y: cy + labelR * Math.sin(angle),
        align: Math.cos(angle) > 0.1 ? 'start' : Math.cos(angle) < -0.1 ? 'end' : 'middle',
      };
    });

    return {
      cx,
      cy,
      personalPath,
      teamPath,
      personalPoints,
      teamPoints,
      rings,
      labelPositions,
    };
  }, [currentUser.virtues, teamVirtueAverages]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#172554]/80 backdrop-blur-md flex justify-center items-start p-4 sm:p-6 font-['Space_Grotesk'] animate-fade-in">
      <div className="relative w-full max-w-4xl bg-white border-2 border-[#172554] shadow-[8px_8px_0_#172554] my-6 p-6 sm:p-8 text-[#172554]">
        {/* Dismiss Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 bg-[#FAFAF8] hover:bg-slate-100 border-2 border-[#172554] shadow-[2px_2px_0_#172554] transition active:translate-x-0.5 active:translate-y-0.5 z-10"
        >
          <X className="w-5 h-5 text-[#172554]" />
        </button>

        {/* 1. HERO HEADER: Avatar, Level, Real-World Designation & XP Bar */}
        <div className="pb-8 border-b-2 border-[#172554]">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar & Pulse Indicator */}
            <div className="relative">
              <div className="w-24 h-24 rounded-none bg-gradient-to-br from-[#FEF08A] to-[#FACC15] border-3 border-[#172554] shadow-[4px_4px_0_#172554] flex items-center justify-center text-5xl">
                {currentUser.avatar}
              </div>
              <div className="absolute -bottom-2 -right-2 px-2.5 py-0.5 bg-[#2563EB] text-white border-2 border-[#172554] font-bold text-xs uppercase shadow-sm">
                {currentUser.role}
              </div>
            </div>

            {/* Profile Titles & Level Badge */}
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 mb-1.5">
                <span className="px-3 py-1 bg-[#FACC15] border-2 border-[#172554] font-['Space_Grotesk'] font-extrabold text-xs uppercase tracking-wider shadow-[2px_2px_0_#172554]">
                  LVL {profile.level}
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {currentUser.title}
                </span>
              </div>

              <h1 className="font-['Bebas_Neue'] text-4xl sm:text-5xl text-[#172554] tracking-wide leading-none m-0">
                {currentUser.name}
              </h1>

              {/* Active Real-World Designation Title */}
              <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-[#172554] text-[#FACC15] border border-[#172554] font-['Space_Grotesk'] font-bold text-xs uppercase tracking-wide">
                <Sparkles className="w-3.5 h-3.5 text-[#FACC15]" />
                <span>DESIGNATION: {profile.designationTitle}</span>
              </div>

              {/* Animated XP Progress Bar to Next Level */}
              <div className="mt-4 max-w-lg">
                <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                  <span className="text-[#2563EB] flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5" />
                    <span>{profile.currentLevelXp.toLocaleString()} Total XP</span>
                  </span>
                  <span className="text-slate-500">
                    Next Level: {profile.nextLevelXp.toLocaleString()} XP ({profile.progressPercent}%)
                  </span>
                </div>
                <div className="w-full h-3 bg-slate-100 border-2 border-[#172554] overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#2563EB] via-[#FB923C] to-[#FACC15] transition-all duration-700 ease-out"
                    style={{ width: `${profile.progressPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. DUAL-POLYGON RADAR CHART & STATS OVERVIEW */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 py-8 border-b-2 border-[#172554] items-center">
          {/* Dual Radar Chart */}
          <div className="lg:col-span-6 flex flex-col items-center">
            <div className="text-xs font-bold uppercase tracking-wider text-[#172554] mb-3 flex items-center gap-2">
              <Award className="w-4 h-4 text-[#2563EB]" />
              Dual-Polygon Virtue Radar (Personal vs Team)
            </div>

            <div className="relative p-2 bg-[#FAFAF8] border-2 border-[#172554] shadow-[4px_4px_0_#172554]">
              <svg width="280" height="280" viewBox="0 0 280 280" className="overflow-visible">
                {/* Concentric Guide Pentagon Rings */}
                {radarChartData.rings.map((ringPath, idx) => (
                  <polygon
                    key={idx}
                    points={ringPath}
                    fill="none"
                    stroke="#E2E8F0"
                    strokeWidth="1.5"
                    strokeDasharray={idx === 3 ? 'none' : '3 3'}
                  />
                ))}

                {/* Axis Spoke Lines */}
                {VIRTUES.map((_, i) => {
                  const angle = (i * 2 * Math.PI) / VIRTUES.length - Math.PI / 2;
                  return (
                    <line
                      key={i}
                      x1={radarChartData.cx}
                      y1={radarChartData.cy}
                      x2={radarChartData.cx + 95 * Math.cos(angle)}
                      y2={radarChartData.cy + 95 * Math.sin(angle)}
                      stroke="#CBD5E1"
                      strokeWidth="1"
                    />
                  );
                })}

                {/* Team Virtue Average Polygon (Orange Translucent) */}
                <polygon
                  points={radarChartData.teamPath}
                  fill="rgba(251, 146, 60, 0.22)"
                  stroke="#FB923C"
                  strokeWidth="2"
                  strokeDasharray="4 3"
                />

                {/* Personal Virtue Polygon (Electric Blue Translucent) */}
                <polygon
                  points={radarChartData.personalPath}
                  fill="rgba(37, 99, 235, 0.35)"
                  stroke="#2563EB"
                  strokeWidth="2.5"
                />

                {/* Personal Point Markers */}
                {radarChartData.personalPoints.map((pt, i) => (
                  <circle
                    key={`p-${i}`}
                    cx={pt.x}
                    cy={pt.y}
                    r="4"
                    fill="#2563EB"
                    stroke="#FFFFFF"
                    strokeWidth="1.5"
                  />
                ))}

                {/* Team Point Markers */}
                {radarChartData.teamPoints.map((pt, i) => (
                  <circle
                    key={`t-${i}`}
                    cx={pt.x}
                    cy={pt.y}
                    r="3"
                    fill="#FB923C"
                    stroke="#FFFFFF"
                    strokeWidth="1"
                  />
                ))}

                {/* Axis Labels */}
                {radarChartData.labelPositions.map((lbl) => (
                  <text
                    key={lbl.virtue}
                    x={lbl.x}
                    y={lbl.y + 4}
                    textAnchor={lbl.align as any}
                    className="font-['Space_Grotesk'] text-[10px] font-bold fill-[#172554]"
                  >
                    {VIRTUE_META[lbl.virtue].icon} {lbl.virtue}
                  </text>
                ))}
              </svg>

              {/* Chart Legend */}
              <div className="flex items-center justify-center gap-5 mt-3 pt-3 border-t border-slate-200 text-[11px] font-bold">
                <div className="flex items-center gap-1.5 text-[#2563EB]">
                  <span className="w-3 h-3 bg-[#2563EB] border border-[#172554]" />
                  <span>You ({profile.dominantVirtue} Focused)</span>
                </div>
                <div className="flex items-center gap-1.5 text-[#EA580C]">
                  <span className="w-3 h-3 bg-[#FB923C] border border-[#172554] border-dashed" />
                  <span>Workspace Team Avg</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Metrics Summary */}
          <div className="lg:col-span-6 space-y-4">
            <div className="p-4 bg-[#FAFAF8] border-2 border-[#172554] shadow-[3px_3px_0_#172554]">
              <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                Dominant Specialty Virtue
              </div>
              <div className="font-['Bebas_Neue'] text-3xl text-[#2563EB] flex items-center gap-2 mt-0.5">
                <span>{VIRTUE_META[profile.dominantVirtue].icon}</span>
                <span>{profile.dominantVirtue}</span>
              </div>
              <p className="text-xs text-slate-600 mt-1 font-['Inter']">
                {VIRTUE_META[profile.dominantVirtue].description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-[#FAFAF8] border-2 border-[#172554]">
                <div className="text-[10px] uppercase font-bold text-slate-500">Tasks Harvested</div>
                <div className="font-['Bebas_Neue'] text-2xl text-[#22C55E]">
                  {lifetimeStats.totalTasksHarvested}
                </div>
              </div>

              <div className="p-3 bg-[#FAFAF8] border-2 border-[#172554]">
                <div className="text-[10px] uppercase font-bold text-slate-500">Total Shakes</div>
                <div className="font-['Bebas_Neue'] text-2xl text-[#FB923C]">
                  {lifetimeStats.totalShakes}
                </div>
              </div>
            </div>

            <div className="p-3 bg-[#FEF08A]/40 border-2 border-[#172554] text-xs font-['Inter'] text-[#172554]">
              <strong>RPG Formula:</strong> Level = Math.max(1, Math.floor(0.1 * √TotalXP)). Reassigning collaborative tasks awards a +25% Team Bonus.
            </div>
          </div>
        </div>

        {/* 3. 5 VIRTUE STAT CARDS */}
        <div className="py-8 border-b-2 border-[#172554]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-['Bebas_Neue'] text-2xl text-[#172554] tracking-wide m-0">
              5 CORE VIRTUE DOMAINS
            </h3>
            <span className="text-xs text-slate-500">Domain Level = 0.15 * √VirtueXP</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {VIRTUES.map((v) => {
              const meta = VIRTUE_META[v];
              const stat = profile.virtueLevels[v];
              return (
                <div
                  key={v}
                  className="p-3.5 bg-white border-2 border-[#172554] shadow-[3px_3px_0_#172554] flex flex-col justify-between transition hover:-translate-y-0.5"
                  style={{ borderTopColor: meta.color, borderTopWidth: '4px' }}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-lg">{meta.icon}</span>
                      <span className="px-1.5 py-0.5 text-[9px] font-extrabold bg-slate-100 border border-[#172554]">
                        LVL {stat.level}
                      </span>
                    </div>

                    <div className="text-xs font-extrabold uppercase text-[#172554] tracking-wider">
                      {v}
                    </div>

                    <div className="text-[10px] font-bold text-[#2563EB] truncate mt-0.5" title={stat.title}>
                      {stat.title}
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-100">
                    <div className="flex justify-between text-[10px] font-mono font-bold text-slate-500">
                      <span>XP</span>
                      <span className="text-[#172554]">{stat.xp.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 border border-[#172554] mt-1">
                      <div
                        className="h-full"
                        style={{
                          width: `${Math.min(100, (stat.xp / 500) * 100)}%`,
                          backgroundColor: meta.color,
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. UNLOCKED BADGE SHOWCASE */}
        <div className="pt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-['Bebas_Neue'] text-2xl text-[#172554] tracking-wide m-0">
              UNLOCKED BADGE SHOWCASE
            </h3>
            <span className="text-xs font-bold text-[#2563EB]">
              {profile.unlockedBadges.filter((b) => b.unlocked).length} / {profile.unlockedBadges.length} UNLOCKED
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {profile.unlockedBadges.map((badge) => (
              <div
                key={badge.id}
                className={`p-3.5 border-2 transition ${
                  badge.unlocked
                    ? 'bg-[#FAFAF8] border-[#172554] shadow-[3px_3px_0_#172554]'
                    : 'bg-slate-50/60 border-slate-300 opacity-60'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 border-2 flex items-center justify-center text-xl shrink-0 ${
                      badge.unlocked
                        ? 'bg-[#FACC15] border-[#172554] shadow-[2px_2px_0_#172554]'
                        : 'bg-slate-200 border-slate-400'
                    }`}
                  >
                    {badge.unlocked ? badge.icon : <Lock className="w-4 h-4 text-slate-500" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-['Space_Grotesk'] text-xs font-bold text-[#172554] truncate">
                        {badge.name}
                      </span>
                      {badge.unlocked && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E] shrink-0 ml-1" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-600 font-['Inter'] mt-0.5 line-clamp-2">
                      {badge.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LifeCharacterSheet;
