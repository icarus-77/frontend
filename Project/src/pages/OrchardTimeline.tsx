import React, { useState } from 'react';
import { useGardenStore } from '../store/useGardenStore';
import { DIFFICULTY_META } from '../constants/gardenConstants';
import { Task } from '../types/garden';
import { CalendarDays, AlertCircle, CheckCircle2 } from 'lucide-react';

export const OrchardTimeline: React.FC = () => {
  const { currentWorkspaceId, workspaces, tasks, columnsByWorkspace, users } = useGardenStore();
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');

  const currentWorkspace = workspaces.find((w) => w.id === currentWorkspaceId) || workspaces[0];
  const wsCols = columnsByWorkspace[currentWorkspaceId] || { raw: [], ripening: [], harvested: [] };
  const allWorkspaceTaskIds = [...wsCols.raw, ...wsCols.ripening, ...wsCols.harvested];
  const workspaceTasks = allWorkspaceTaskIds.map((id) => tasks[id]).filter(Boolean);

  const timelineDays = [
    { label: 'Oct 22', date: '2026-10-22', dayOfWeek: 'Thu' },
    { label: 'Oct 23', date: '2026-10-23', dayOfWeek: 'Fri' },
    { label: 'Oct 24', date: '2026-10-24', dayOfWeek: 'Sat' },
    { label: 'Oct 25', date: '2026-10-25', dayOfWeek: 'Sun', isToday: true },
    { label: 'Oct 26', date: '2026-10-26', dayOfWeek: 'Mon' },
    { label: 'Oct 27', date: '2026-10-27', dayOfWeek: 'Tue' },
    { label: 'Oct 28', date: '2026-10-28', dayOfWeek: 'Wed' },
    { label: 'Oct 29', date: '2026-10-29', dayOfWeek: 'Thu' },
    { label: 'Oct 30', date: '2026-10-30', dayOfWeek: 'Fri' },
    { label: 'Oct 31', date: '2026-10-31', dayOfWeek: 'Sat' },
  ];

  const startDateOffset = new Date('2026-10-22').getTime();
  const msPerDay = 86400000;

  const calculateBarPosition = (task: Task) => {
    const sDate = task.startDate ? new Date(task.startDate).getTime() : startDateOffset + msPerDay;
    const dDate = task.dueDate ? new Date(task.dueDate).getTime() : sDate + msPerDay * 3;

    const startDayIndex = Math.max(0, (sDate - startDateOffset) / msPerDay);
    const durationDays = Math.max(1, (dDate - sDate) / msPerDay);

    const leftPercent = (startDayIndex / timelineDays.length) * 100;
    const widthPercent = (durationDays / timelineDays.length) * 100;

    return {
      left: `${leftPercent}%`,
      width: `${Math.min(widthPercent, 100 - leftPercent)}%`,
    };
  };

  const filteredTasks = workspaceTasks.filter((t) => {
    if (filterDifficulty !== 'all' && t.difficulty !== filterDifficulty) return false;
    return true;
  });

  return (
    <div className="bg-[#FAFAF8] text-[#172554] min-h-screen py-12 px-4 sm:px-8 font-['Space_Grotesk']">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b-2 border-[#172554]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#FB923C] mb-1">
              06 / GANTT TIMELINE · {currentWorkspace.name.toUpperCase()}
            </p>
            <h1 className="font-['Bebas_Neue'] text-5xl sm:text-6xl text-[#172554] tracking-tight leading-none m-0">
              PROJECT TIMELINE.
            </h1>
            <p className="font-['Inter'] text-sm text-[#172554]/70 mt-2">
              Track task durations, sprint deadlines, and team dependencies across calendar days.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              className="px-3 py-1.5 bg-white border-2 border-[#172554] text-xs font-bold text-[#172554] shadow-[2px_2px_0_#172554]"
            >
              <option value="all">All Difficulties</option>
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>
          </div>
        </div>

        {/* Timeline Table */}
        <div className="bg-white border-2 border-[#172554] shadow-[4px_4px_0_#172554] overflow-hidden">
          {/* Days Header */}
          <div className="grid grid-cols-12 bg-slate-50 border-b-2 border-[#172554] text-xs py-3 px-4 font-bold">
            <div className="col-span-4 text-[#172554] uppercase tracking-wider">Task & Assignee</div>
            <div className="col-span-8 grid grid-cols-10 text-center">
              {timelineDays.map((d) => (
                <div
                  key={d.date}
                  className={`flex flex-col items-center ${
                    d.isToday ? 'text-[#2563EB] font-extrabold' : 'text-slate-500'
                  }`}
                >
                  <span className="text-[10px] uppercase">{d.dayOfWeek}</span>
                  <span className={`text-xs ${d.isToday ? 'bg-blue-100 px-1 rounded' : ''}`}>
                    {d.label.split(' ')[1]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Task Timeline Rows */}
          <div className="divide-y-2 divide-slate-100">
            {filteredTasks.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400 italic">
                No tasks scheduled in this workspace.
              </div>
            ) : (
              filteredTasks.map((task) => {
                const assignee = users.find((u) => u.id === task.assigneeId) || users[0];
                const { left, width } = calculateBarPosition(task);
                const isCompleted = task.progress === 100;

                return (
                  <div key={task.id} className="grid grid-cols-12 items-center py-3.5 px-4 hover:bg-slate-50 transition">
                    <div className="col-span-4 pr-3 flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-full border border-[#172554] flex items-center justify-center text-xs shrink-0 bg-white">
                        {assignee.avatar}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-[#172554] truncate">
                          {task.title}
                        </div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5">
                          <span>{DIFFICULTY_META[task.difficulty]?.label}</span>
                          <span>·</span>
                          <span>{task.estimatedMinutes}m</span>
                        </div>
                      </div>
                    </div>

                    <div className="col-span-8 relative h-7 flex items-center">
                      <div className="absolute inset-0 grid grid-cols-10 pointer-events-none">
                        {timelineDays.map((d, i) => (
                          <div
                            key={i}
                            className={`border-r border-slate-200 h-full ${d.isToday ? 'bg-blue-50/50' : ''}`}
                          />
                        ))}
                      </div>

                      <div
                        style={{ left, width }}
                        className={`absolute h-5 rounded-none border-2 border-[#172554] shadow-[1px_1px_0_#172554] flex items-center justify-between px-2 text-[10px] font-bold ${
                          isCompleted
                            ? 'bg-[#22C55E] text-white'
                            : task.progress && task.progress > 0
                            ? 'bg-[#FB923C] text-white'
                            : 'bg-[#2563EB] text-white'
                        }`}
                      >
                        <span className="truncate">{isCompleted ? 'Done' : `${task.progress || 0}%`}</span>
                        {isCompleted ? (
                          <CheckCircle2 className="w-3 h-3 stroke-[3]" />
                        ) : (
                          <span>{task.xp} XP</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Milestone Callout */}
        <div className="bg-white border-2 border-[#172554] shadow-[4px_4px_0_#172554] p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-[#2563EB] shrink-0" />
          <div className="text-xs text-[#172554]">
            <strong>Milestone Scheduled:</strong> Sprint cut and final review window set for <strong>Oct 28</strong>.
          </div>
        </div>
      </div>
    </div>
  );
};
