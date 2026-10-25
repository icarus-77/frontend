import React, { useState } from 'react';
import { useGardenStore } from '../store/useGardenStore';
import { VIRTUES, VIRTUE_META } from '../constants/gardenConstants';
import { Virtue } from '../types/garden';
import {
  TrendingUp,
  Clock,
  Award,
  Flame,
} from 'lucide-react';

export const GardenAnalytics: React.FC = () => {
  const { currentWorkspaceId, workspaces } = useGardenStore();
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'sprint'>('week');

  const currentWorkspace = workspaces.find((w) => w.id === currentWorkspaceId) || workspaces[0];

  const center = 150;
  const radius = 95;
  const virtuesCount = VIRTUES.length;

  const individualVirtues: Record<Virtue, number> = {
    Intellect: 85,
    Resilience: 55,
    Discipline: 90,
    Harmony: 65,
    Vitality: 50,
  };

  const teamAverageVirtues: Record<Virtue, number> = {
    Intellect: 70,
    Resilience: 75,
    Discipline: 65,
    Harmony: 80,
    Vitality: 60,
  };

  const getPoints = (virtueRecord: Record<Virtue, number>) => {
    return VIRTUES.map((v, i) => {
      const angle = (i * 2 * Math.PI) / virtuesCount - Math.PI / 2;
      const val = virtueRecord[v] || 50;
      const r = (val / 100) * radius;
      return {
        x: center + r * Math.cos(angle),
        y: center + r * Math.sin(angle),
        virtue: v,
        val,
      };
    });
  };

  const indPoints = getPoints(individualVirtues);
  const teamPoints = getPoints(teamAverageVirtues);

  const indPolygon = indPoints.map((p) => `${p.x},${p.y}`).join(' ');
  const teamPolygon = teamPoints.map((p) => `${p.x},${p.y}`).join(' ');

  const hourlyDistribution = [
    { hour: '9 AM', tasks: 4, height: 40 },
    { hour: '10 AM', tasks: 8, height: 80 },
    { hour: '11 AM', tasks: 10, height: 95 },
    { hour: '12 PM', tasks: 5, height: 45 },
    { hour: '1 PM', tasks: 3, height: 30 },
    { hour: '2 PM', tasks: 7, height: 70 },
    { hour: '3 PM', tasks: 9, height: 88 },
    { hour: '4 PM', tasks: 11, height: 100 },
    { hour: '5 PM', tasks: 6, height: 55 },
    { hour: '6 PM', tasks: 4, height: 35 },
  ];

  const burndownDays = [
    { day: 'Mon', ideal: 120, actual: 120 },
    { day: 'Tue', ideal: 96, actual: 104 },
    { day: 'Wed', ideal: 72, actual: 75 },
    { day: 'Thu', ideal: 48, actual: 40 },
    { day: 'Fri', ideal: 24, actual: 18 },
    { day: 'Sat', ideal: 0, actual: 0 },
  ];

  return (
    <div className="bg-[#FAFAF8] text-[#172554] min-h-screen py-12 px-4 sm:px-8 font-['Space_Grotesk']">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b-2 border-[#172554]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#2563EB] mb-1">
              05 / TELEMETRY & PRODUCTIVITY METRICS
            </p>
            <h1 className="font-['Bebas_Neue'] text-5xl sm:text-6xl text-[#172554] tracking-tight leading-none m-0">
              ANALYTICS HUB.
            </h1>
            <p className="font-['Inter'] text-sm text-[#172554]/70 mt-2">
              Workspace: <strong>{currentWorkspace.name}</strong> · Team virtue balance, velocity, and focus patterns.
            </p>
          </div>

          <div className="flex items-center gap-1 bg-white border-2 border-[#172554] p-1 shadow-[2px_2px_0_#172554]">
            {(['week', 'month', 'sprint'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setSelectedTimeframe(tf)}
                className={`px-3 py-1 text-xs font-bold uppercase transition ${
                  selectedTimeframe === tf ? 'bg-[#172554] text-white' : 'text-[#172554] hover:bg-slate-100'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        {/* 4 Metric KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border-2 border-[#172554] shadow-[4px_4px_0_#172554] p-5">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              <span>Velocity</span>
              <TrendingUp className="w-4 h-4 text-[#22C55E]" />
            </div>
            <div className="font-['Bebas_Neue'] text-4xl text-[#172554] leading-tight">42 XP / DAY</div>
            <div className="text-[11px] text-[#22C55E] font-bold mt-1">↑ +18% team increase</div>
          </div>

          <div className="bg-white border-2 border-[#172554] shadow-[4px_4px_0_#172554] p-5">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              <span>Turnaround</span>
              <Clock className="w-4 h-4 text-[#FB923C]" />
            </div>
            <div className="font-['Bebas_Neue'] text-4xl text-[#172554] leading-tight">1.8 DAYS</div>
            <div className="text-[11px] text-slate-500 font-medium mt-1">Average task duration</div>
          </div>

          <div className="bg-white border-2 border-[#172554] shadow-[4px_4px_0_#172554] p-5">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              <span>Top Virtue</span>
              <Flame className="w-4 h-4 text-[#2563EB]" />
            </div>
            <div className="font-['Bebas_Neue'] text-4xl text-[#2563EB] leading-tight">DISCIPLINE</div>
            <div className="text-[11px] text-slate-500 font-medium mt-1">38% of completed tasks</div>
          </div>

          <div className="bg-white border-2 border-[#172554] shadow-[4px_4px_0_#172554] p-5">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              <span>Sprint Rating</span>
              <Award className="w-4 h-4 text-[#FACC15]" />
            </div>
            <div className="font-['Bebas_Neue'] text-4xl text-[#172554] leading-tight">4.9 / 5.0</div>
            <div className="text-[11px] text-[#FACC15] font-bold mt-1">★ High team consistency</div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Dual Radar Chart */}
          <div className="bg-white border-2 border-[#172554] shadow-[4px_4px_0_#172554] p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-slate-100">
                <div>
                  <h3 className="font-['Bebas_Neue'] text-2xl text-[#172554] tracking-wide m-0">
                    TEAM VIRTUE RADAR
                  </h3>
                  <p className="text-xs text-slate-500">Your profile balance vs. team average</p>
                </div>
                <div className="flex items-center gap-3 text-xs font-bold">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 bg-[#FACC15] border border-[#172554]" />
                    <span>You</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 bg-[#2563EB] border border-[#172554]" />
                    <span>Team Avg</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-center py-4">
                <svg width="280" height="280" viewBox="0 0 300 300" className="overflow-visible">
                  {[0.25, 0.5, 0.75, 1.0].map((scale, idx) => (
                    <polygon
                      key={idx}
                      points={VIRTUES.map((_, i) => {
                        const angle = (i * 2 * Math.PI) / virtuesCount - Math.PI / 2;
                        const r = radius * scale;
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
                    points={teamPolygon}
                    fill="rgba(37, 99, 235, 0.15)"
                    stroke="#2563EB"
                    strokeWidth="2.5"
                    strokeLinejoin="round"
                  />

                  <polygon
                    points={indPolygon}
                    fill="rgba(250, 204, 21, 0.3)"
                    stroke="#D97706"
                    strokeWidth="2.5"
                    strokeLinejoin="round"
                  />

                  {VIRTUES.map((v, i) => {
                    const angle = (i * 2 * Math.PI) / virtuesCount - Math.PI / 2;
                    const labelRadius = radius + 22;
                    return (
                      <text
                        key={v}
                        x={center + labelRadius * Math.cos(angle)}
                        y={center + labelRadius * Math.sin(angle)}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="#172554"
                        fontSize="10"
                        fontWeight="bold"
                      >
                        {v}
                      </text>
                    );
                  })}
                </svg>
              </div>
            </div>

            <div className="bg-slate-50 p-3 border-2 border-[#172554] text-xs text-[#172554]">
              💡 <strong>Insight:</strong> High focus momentum detected on <em>Intellect</em> and <em>Discipline</em> tasks.
            </div>
          </div>

          {/* Burn-Down Curve */}
          <div className="bg-white border-2 border-[#172554] shadow-[4px_4px_0_#172554] p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-slate-100">
                <div>
                  <h3 className="font-['Bebas_Neue'] text-2xl text-[#172554] tracking-wide m-0">
                    SPRINT BURN-DOWN
                  </h3>
                  <p className="text-xs text-slate-500">Remaining sprint tasks vs ideal trajectory</p>
                </div>
                <div className="flex items-center gap-3 text-xs font-bold">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-0.5 bg-slate-400" />
                    <span>Ideal</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-0.5 bg-[#2563EB]" />
                    <span>Actual</span>
                  </div>
                </div>
              </div>

              <div className="py-4">
                <svg width="100%" height="200" viewBox="0 0 380 200" className="overflow-visible">
                  {[0, 50, 100, 150].map((y) => (
                    <line key={y} x1="30" y1={y} x2="360" y2={y} stroke="#172554" strokeOpacity="0.08" strokeWidth="1" />
                  ))}

                  <polyline
                    fill="none"
                    stroke="#94A3B8"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                    points="40,20 100,55 160,95 220,130 280,165 340,185"
                  />

                  <polyline
                    fill="none"
                    stroke="#2563EB"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points="40,20 100,45 160,88 220,140 280,175 340,185"
                  />

                  {[
                    { cx: 40, cy: 20 },
                    { cx: 100, cy: 45 },
                    { cx: 160, cy: 88 },
                    { cx: 220, cy: 140 },
                    { cx: 280, cy: 175 },
                    { cx: 340, cy: 185 },
                  ].map((pt, idx) => (
                    <circle key={idx} cx={pt.cx} cy={pt.cy} r="4" fill="#2563EB" stroke="#FFFFFF" strokeWidth="2" />
                  ))}

                  {burndownDays.map((d, idx) => (
                    <text key={d.day} x={40 + idx * 60} y="198" textAnchor="middle" fill="#172554" fontSize="10" fontWeight="bold">
                      {d.day}
                    </text>
                  ))}
                </svg>
              </div>
            </div>

            <div className="bg-slate-50 p-3 border-2 border-[#172554] text-xs text-[#172554]">
              🎯 <strong>Status:</strong> The team is on track to complete all active sprint milestones ahead of deadline.
            </div>
          </div>
        </div>

        {/* Productivity Peak Distribution */}
        <div className="bg-white border-2 border-[#172554] shadow-[4px_4px_0_#172554] p-6">
          <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-slate-100">
            <div>
              <h3 className="font-['Bebas_Neue'] text-2xl text-[#172554] tracking-wide m-0">
                HOURLY PRODUCTIVITY DISTRIBUTION
              </h3>
              <p className="text-xs text-slate-500">Distribution of task completions across the workday</p>
            </div>
            <span className="text-xs font-bold text-[#172554] bg-yellow-100 px-3 py-1 border border-[#172554]">
              Peak Focus: 11 AM & 4 PM
            </span>
          </div>

          <div className="pt-6 pb-2">
            <div className="grid grid-cols-10 gap-2 items-end h-40">
              {hourlyDistribution.map((h) => (
                <div key={h.hour} className="flex flex-col items-center gap-1.5 h-full justify-end">
                  <span className="text-[10px] font-bold text-slate-500">{h.tasks}</span>
                  <div className="w-full bg-slate-100 border border-[#172554] h-28 flex items-end">
                    <div
                      className="w-full transition-all duration-300"
                      style={{
                        height: `${h.height}%`,
                        backgroundColor: h.height >= 90 ? '#FACC15' : h.height >= 60 ? '#2563EB' : '#172554',
                      }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-[#172554] truncate">{h.hour}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
