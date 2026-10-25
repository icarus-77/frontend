import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { ColumnId, Task, Virtue } from '../types/garden';
import { VIRTUES, VIRTUE_META, DIFFICULTY_META, getRankTitle } from '../constants/gardenConstants';
import {
  Zap,
  Clock,
  CheckCircle2,
  ListTodo,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Filter,
  User as UserIcon,
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const {
    currentUser,
    tasks,
    columnsByWorkspace,
    currentWorkspaceId,
    workspaces,
    moveTask,
    lifetimeStats,
  } = useStore();

  const [feedFilter, setFeedFilter] = useState<'all' | ColumnId>('all');

  const currentWorkspace = workspaces.find((w) => w.id === currentWorkspaceId) || workspaces[0];

  // 1. Filter tasks assigned to current user across current workspace
  const wsCols = columnsByWorkspace[currentWorkspaceId] || { raw: [], ripening: [], harvested: [] };
  const allWorkspaceTaskIds = [...wsCols.raw, ...wsCols.ripening, ...wsCols.harvested];
  const allWorkspaceTasks = allWorkspaceTaskIds.map((id) => tasks[id]).filter(Boolean);

  const userTasks = allWorkspaceTasks.filter((t) => t.assigneeId === currentUser.id);

  // 2. Compute personalized metrics
  const pendingSeeds = userTasks.filter((t) => t.stage === 'raw' || wsCols.raw.includes(t.id));
  const ripeningTasks = userTasks.filter((t) => t.stage === 'ripening' || wsCols.ripening.includes(t.id));
  const completedHarvests = userTasks.filter((t) => t.stage === 'harvested' || wsCols.harvested.includes(t.id));

  const personalEarnedXp = completedHarvests.reduce((sum, t) => {
    const mult = t.pollinatedBonus || 1.0;
    return sum + Math.round(t.xp * mult);
  }, 0);

  // Personal top virtue calculation
  const personalVirtueTally: Record<Virtue, number> = {
    Intellect: 0,
    Resilience: 0,
    Discipline: 0,
    Harmony: 0,
    Vitality: 0,
  };

  userTasks.forEach((t) => {
    for (const v of VIRTUES) {
      personalVirtueTally[v] += t.virtueWeights[v] || 0;
    }
  });

  const dominantVirtue = (Object.entries(personalVirtueTally).sort((a, b) => b[1] - a[1])[0]?.[0] as Virtue) || 'Intellect';

  // 3. Filtered feed list
  const filteredFeed = userTasks.filter((t) => {
    if (feedFilter === 'all') return true;
    if (feedFilter === 'raw') return wsCols.raw.includes(t.id) || t.stage === 'raw';
    if (feedFilter === 'ripening') return wsCols.ripening.includes(t.id) || t.stage === 'ripening';
    if (feedFilter === 'harvested') return wsCols.harvested.includes(t.id) || t.stage === 'harvested';
    return true;
  });

  const currentRank = getRankTitle(lifetimeStats.totalShakes);

  return (
    <div className="bg-[#FAFAF8] text-[#172554] min-h-screen py-10 px-4 sm:px-8 font-['Space_Grotesk']">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* User Identity Header */}
        <div className="bg-white border-2 border-[#172554] shadow-[4px_4px_0_#172554] p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-full border-2 border-[#172554] bg-[#FACC15] flex items-center justify-center text-3xl shadow-[2px_2px_0_#172554]">
              {currentUser.avatar}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-[#2563EB] text-white">
                  Active Persona
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border border-[#172554] text-[#172554] bg-yellow-100">
                  {currentUser.role === 'keeper' ? 'Admin' : currentUser.role === 'harvester' ? 'Member' : 'Viewer'}
                </span>
              </div>
              <h1 className="font-['Bebas_Neue'] text-4xl sm:text-5xl text-[#172554] tracking-wide leading-none m-0">
                {currentUser.name}
              </h1>
              <p className="font-['Inter'] text-xs text-[#172554]/75 mt-1">
                {currentUser.title} · Workspace: <strong>{currentWorkspace.name}</strong>
              </p>
            </div>
          </div>

          {/* Quick Rank & Virtue Pill */}
          <div className="flex items-center gap-3 bg-[#FAFAF8] border-2 border-[#172554] p-3 shadow-[2px_2px_0_#172554]">
            <div className="text-right">
              <div className="text-[9px] uppercase font-bold text-slate-500">Dominant Virtue</div>
              <div className="text-xs font-bold text-[#172554] flex items-center gap-1 justify-end">
                <span>{VIRTUE_META[dominantVirtue].icon}</span>
                <span>{dominantVirtue}</span>
              </div>
            </div>
            <div className="w-px h-8 bg-[#172554]/20" />
            <div>
              <div className="text-[9px] uppercase font-bold text-slate-500">Team Rank</div>
              <div className="text-xs font-bold text-[#172554]">{currentRank.title}</div>
            </div>
          </div>
        </div>

        {/* 3 Personalized Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* Card 1: Total Personal XP */}
          <div className="bg-white border-2 border-[#172554] shadow-[4px_4px_0_#172554] p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
              <span>Personal XP Earned</span>
              <Zap className="w-5 h-5 text-[#2563EB]" />
            </div>
            <div className="font-['Bebas_Neue'] text-5xl sm:text-6xl text-[#2563EB] leading-tight my-2">
              {personalEarnedXp} XP
            </div>
            <div className="text-[11px] font-['Inter'] text-slate-600">
              Total XP accumulated from completed tasks in this workspace
            </div>
          </div>

          {/* Card 2: Pending Seeds */}
          <div className="bg-white border-2 border-[#172554] shadow-[4px_4px_0_#172554] p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
              <span>Pending Seeds (Planned)</span>
              <Clock className="w-5 h-5 text-[#FB923C]" />
            </div>
            <div className="font-['Bebas_Neue'] text-5xl sm:text-6xl text-[#FB923C] leading-tight my-2">
              {pendingSeeds.length}
            </div>
            <div className="text-[11px] font-['Inter'] text-slate-600">
              {ripeningTasks.length} additional task{ripeningTasks.length === 1 ? '' : 's'} currently in progress
            </div>
          </div>

          {/* Card 3: Completed Harvests */}
          <div className="bg-white border-2 border-[#172554] shadow-[4px_4px_0_#172554] p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
              <span>Completed Harvests</span>
              <CheckCircle2 className="w-5 h-5 text-[#22C55E]" />
            </div>
            <div className="font-['Bebas_Neue'] text-5xl sm:text-6xl text-[#22C55E] leading-tight my-2">
              {completedHarvests.length}
            </div>
            <div className="text-[11px] font-['Inter'] text-slate-600">
              Reaped and ready for the next session blend
            </div>
          </div>
        </div>

        {/* Personalized Task Feed Section */}
        <div className="bg-white border-2 border-[#172554] shadow-[4px_4px_0_#172554] p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-[#172554] mb-6">
            <div>
              <h2 className="font-['Bebas_Neue'] text-3xl sm:text-4xl text-[#172554] tracking-wide m-0">
                MY TASK FEED
              </h2>
              <p className="font-['Inter'] text-xs text-[#172554]/70 mt-1">
                Showing tasks assigned to <strong>{currentUser.name}</strong> ({filteredFeed.length} total)
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold">
              {[
                { id: 'all', label: 'All Tasks' },
                { id: 'raw', label: `Seeds (${pendingSeeds.length})` },
                { id: 'ripening', label: `In Progress (${ripeningTasks.length})` },
                { id: 'harvested', label: `Completed (${completedHarvests.length})` },
              ].map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => setFeedFilter(pill.id as any)}
                  className={`px-3 py-1.5 transition border-2 border-[#172554] ${
                    feedFilter === pill.id
                      ? 'bg-[#172554] text-white shadow-[2px_2px_0_#FACC15]'
                      : 'bg-white text-[#172554] hover:bg-slate-100'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>

          {/* Task Cards List */}
          {filteredFeed.length === 0 ? (
            <div className="py-16 text-center text-slate-400 font-['Inter'] text-sm italic">
              No tasks currently assigned to {currentUser.name} matching this filter.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredFeed.map((task) => {
                const isRaw = wsCols.raw.includes(task.id) || task.stage === 'raw';
                const isRipening = wsCols.ripening.includes(task.id) || task.stage === 'ripening';
                const isHarvested = wsCols.harvested.includes(task.id) || task.stage === 'harvested';

                const stageColor = isHarvested ? '#22C55E' : isRipening ? '#FB923C' : '#2563EB';
                const stageLabel = isHarvested ? 'COMPLETED' : isRipening ? 'IN PROGRESS' : 'SEED / TO DO';

                return (
                  <div
                    key={task.id}
                    className="p-4 bg-[#FAFAF8] border-2 border-[#172554] shadow-[3px_3px_0_#172554] flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition hover:-translate-y-0.5"
                    style={{ borderLeftWidth: '6px', borderLeftColor: stageColor }}
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className="px-2 py-0.5 text-[9px] font-extrabold uppercase border border-[#172554]"
                          style={{
                            backgroundColor: isHarvested ? '#DCFCE7' : isRipening ? '#FEF3C7' : '#DBEAFE',
                            color: stageColor,
                          }}
                        >
                          {stageLabel}
                        </span>
                        <span className="text-[10px] uppercase font-bold text-slate-500">
                          {DIFFICULTY_META[task.difficulty]?.label}
                        </span>
                        {task.pollinatedBonus && (
                          <span className="px-1.5 py-0.2 text-[9px] font-extrabold uppercase bg-yellow-200 text-[#172554] border border-[#172554]">
                            +25% Bonus
                          </span>
                        )}
                      </div>

                      <h3 className="font-['Space_Grotesk'] font-bold text-base text-[#172554] m-0">
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className="font-['Inter'] text-xs text-[#172554]/75 line-clamp-1 m-0">
                          {task.description}
                        </p>
                      )}
                    </div>

                    {/* Right Action / Stage Shift */}
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right font-['Space_Grotesk']">
                        <div className="font-bold text-sm text-[#2563EB]">+{task.xp} XP</div>
                        <div className="text-[10px] text-slate-500">{task.estimatedMinutes}m est</div>
                      </div>

                      {/* Advance Stage Controls */}
                      <div className="flex items-center gap-1">
                        {isRaw && (
                          <button
                            onClick={() => moveTask(task.id, 'ripening')}
                            title="Start Task (Move to In Progress)"
                            className="px-3 py-1.5 bg-[#FB923C] hover:bg-orange-600 text-white font-bold text-xs uppercase border border-[#172554] shadow-[1px_1px_0_#172554] transition flex items-center gap-1"
                          >
                            <span>Start</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {isRipening && (
                          <button
                            onClick={() => moveTask(task.id, 'harvested')}
                            title="Complete Task"
                            className="px-3 py-1.5 bg-[#22C55E] hover:bg-green-600 text-white font-bold text-xs uppercase border border-[#172554] shadow-[1px_1px_0_#172554] transition flex items-center gap-1"
                          >
                            <span>Harvest</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {isHarvested && (
                          <div className="px-3 py-1 bg-green-100 text-green-800 border border-green-300 text-xs font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-700" />
                            <span>Done</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
