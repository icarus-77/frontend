import React, { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { ColumnId, Task, Virtue, WorkspaceId } from '../types/garden';
import { VIRTUES, VIRTUE_META, DIFFICULTY_META, getRankTitle } from '../constants/gardenConstants';
import { calculateOverallLevel, getDesignationTitle } from '../utils/gamification';
import { HeroSection } from '../components/layout/HeroSection';
import { TaskModal } from '../components/modals/TaskModal';
import { CrossPollinateModal } from '../components/modals/CrossPollinateModal';
import {
  Plus,
  Search,
  Filter,
  ArrowRight,
  ArrowLeft,
  Share2,
  Trash2,
  Check,
  Zap,
  Users,
  Shield,
  Clock,
  Flame,
  TrendingUp,
  AlertTriangle,
  Palette,
  Layers,
  Award,
  GripVertical,
} from 'lucide-react';

export const BoardView: React.FC = () => {
  const {
    tasks,
    columnsByWorkspace,
    currentWorkspace,
    workspaces,
    currentUser,
    users,
    filterAssigneeId,
    filterPriority,
    searchQuery,
    setFilterAssignee,
    setFilterPriority,
    setSearchQuery,
    moveTask,
    deleteTask,
    lifetimeStats,
    getWorkspaceTasks,
  } = useStore();

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [reassigningTask, setReassigningTask] = useState<Task | null>(null);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<ColumnId | null>(null);
  const [selectedTag, setSelectedTag] = useState<string>('all');

  const activeWorkspace = workspaces.find((w) => w.id === currentWorkspace) || workspaces[0];
  const isPersonal = currentWorkspace === 'personal';
  const isAlpha = currentWorkspace === 'alpha-product';
  const isDesignGrowth = currentWorkspace === 'design-growth';

  const isObserver = currentUser.role === 'observer';
  const isKeeper = currentUser.role === 'keeper';

  // 1. Isolated workspace tasks (recalculated whenever tasks, columns, or workspace changes)
  const workspaceTasks = useMemo(() => {
    return getWorkspaceTasks();
  }, [tasks, columnsByWorkspace, currentWorkspace, currentUser.id, getWorkspaceTasks]);

  // 2. Multi-parameter live filtering
  const filterTask = (task: Task) => {
    if (filterAssigneeId !== 'all' && task.assigneeId !== filterAssigneeId) return false;
    if (filterPriority !== 'all' && task.priority !== filterPriority) return false;
    if (selectedTag !== 'all') {
      const hasTag = task.tags?.some((t) => t.toLowerCase() === selectedTag.toLowerCase());
      if (!hasTag) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = task.title.toLowerCase().includes(q);
      const matchDesc = task.description?.toLowerCase().includes(q);
      const matchTags = task.tags?.some((t) => t.toLowerCase().includes(q));
      if (!matchTitle && !matchDesc && !matchTags) return false;
    }
    return true;
  };

  const rawTasks = workspaceTasks.filter((t) => t.stage === 'raw' && filterTask(t));
  const ripeningTasks = workspaceTasks.filter((t) => t.stage === 'ripening' && filterTask(t));
  const harvestedTasks = workspaceTasks.filter((t) => t.stage === 'harvested' && filterTask(t));

  // --- HTML5 Drag and Drop Handlers ---
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    if (isObserver) return;
    setDraggedTaskId(taskId);
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.setData('taskId', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, colId: ColumnId) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverCol !== colId) {
      setDragOverCol(colId);
    }
  };

  const handleDragEnter = (e: React.DragEvent, colId: ColumnId) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverCol(colId);
  };

  const handleDragLeave = (e: React.DragEvent, colId: ColumnId) => {
    e.preventDefault();
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      if (dragOverCol === colId) {
        setDragOverCol(null);
      }
    }
  };

  const handleDrop = (e: React.DragEvent, targetCol: ColumnId) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverCol(null);

    const taskId =
      e.dataTransfer.getData('text/plain') ||
      e.dataTransfer.getData('taskId') ||
      draggedTaskId;

    if (taskId) {
      moveTask(taskId, targetCol);
    }
    setDraggedTaskId(null);
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
    setDragOverCol(null);
  };

  const currentRank = getRankTitle(lifetimeStats.totalShakes);

  const scrollToBoard = () => {
    const el = document.getElementById('board-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  // --- Domain-Specific KPI Computations ---
  // A. Alpha Product Team metrics
  const alphaMetrics = useMemo(() => {
    const totalSprintXp = workspaceTasks.reduce((acc, t) => acc + (t.xp || 0), 0);
    const sprintVelocity = Math.max(45, Math.round(totalSprintXp / 5)); // XP/day
    const blockersCount = workspaceTasks.filter(
      (t) => (t.stage === 'raw' || t.stage === 'ripening') && t.priority === 'high'
    ).length;
    const totalCount = workspaceTasks.length || 1;
    const harvestedCount = workspaceTasks.filter((t) => t.stage === 'harvested').length;
    const completionPercent = Math.round((harvestedCount / totalCount) * 100);

    return {
      sprintVelocity,
      blockersCount,
      completionPercent,
      harvestedCount,
      totalCount,
    };
  }, [workspaceTasks]);

  // B. Design & Growth metrics
  const designMetrics = useMemo(() => {
    const activeCampaignCount = workspaceTasks.filter(
      (t) => t.stage === 'raw' || t.stage === 'ripening'
    ).length;
    const reviewBottlenecks = workspaceTasks.filter((t) => t.stage === 'ripening').length;

    // Harmony vs Intellect Virtue Ratio
    let harmonySum = 0;
    let intellectSum = 0;
    workspaceTasks.forEach((t) => {
      harmonySum += t.virtueWeights?.Harmony || (t.virtue === 'Harmony' ? 50 : 10);
      intellectSum += t.virtueWeights?.Intellect || (t.virtue === 'Intellect' ? 50 : 10);
    });
    const ratio = (harmonySum / Math.max(1, intellectSum)).toFixed(1);

    return {
      activeCampaignCount,
      reviewBottlenecks,
      virtueRatio: `${ratio}x`,
      harmonySum,
      intellectSum,
    };
  }, [workspaceTasks]);

  // C. Personal Board metrics
  const personalMetrics = useMemo(() => {
    const totalPersonalXp = currentUser.totalXp || 0;
    const dailyStreak = 5; // 5-Day Active Streak
    const totalTasks = workspaceTasks.length || 1;
    const harvestedCount = workspaceTasks.filter((t) => t.stage === 'harvested').length;
    const personalProgressPercent = Math.round((harvestedCount / totalTasks) * 100);

    // Mini SVG Radar coordinates for currentUser
    const cx = 55;
    const cy = 55;
    const r = 38;
    const n = VIRTUES.length;
    const maxVal = Math.max(...Object.values(currentUser.virtues || {}), 300);

    const radarPoints = VIRTUES.map((v, i) => {
      const angle = (i * 2 * Math.PI) / n - Math.PI / 2;
      const val = currentUser.virtues?.[v] || 0;
      const normalizedR = Math.max(6, (val / maxVal) * r);
      return `${cx + normalizedR * Math.cos(angle)},${cy + normalizedR * Math.sin(angle)}`;
    }).join(' ');

    return {
      totalPersonalXp,
      dailyStreak,
      harvestedCount,
      totalTasks,
      personalProgressPercent,
      radarPoints,
      cx,
      cy,
      r,
    };
  }, [currentUser, workspaceTasks]);

  return (
    <div className="bg-[#FAFAF8] text-[#172554] min-h-screen">
      {/* 1. Hero Section */}
      <HeroSection onAddTask={() => setIsTaskModalOpen(true)} onScrollToBoard={scrollToBoard} />

      {/* 2. Embedded Kanban Board Section */}
      <section id="board-section" className="max-w-7xl mx-auto px-4 sm:px-8 py-14">
        {/* Section Header & Workspace Title */}
        <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b-2 border-[#172554]">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-2xl">{activeWorkspace.icon}</span>
              <p className="font-['Space_Grotesk'] font-bold text-xs uppercase tracking-[0.16em] text-[#FB923C] m-0">
                WORKSPACE DASHBOARD · {activeWorkspace.name.toUpperCase()}
              </p>
            </div>
            <h2 className="font-['Bebas_Neue'] text-5xl sm:text-6xl tracking-tight text-[#172554] leading-none m-0">
              {isPersonal ? 'MY FOCUS ORCHARD.' : isAlpha ? 'SPRINT ENGINEERING.' : 'CREATIVE PIPELINE.'}
            </h2>
            <p className="font-['Inter'] text-xs sm:text-sm text-[#172554]/70 mt-1 max-w-md">
              {activeWorkspace.description}
            </p>
          </div>

          {/* Workspace Members Strip (Hidden strictly on Personal Board) */}
          {!isPersonal && (
            <div className="flex items-center gap-3 bg-white p-3 border-2 border-[#172554] shadow-[3px_3px_0_#172554]">
              <span className="font-['Space_Grotesk'] text-xs font-bold uppercase tracking-wider text-[#172554] flex items-center gap-1.5">
                <Users className="w-4 h-4 text-[#2563EB]" />
                Team:
              </span>
              <div className="flex -space-x-1.5">
                {users.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => setFilterAssignee(filterAssigneeId === u.id ? 'all' : u.id)}
                    title={`${u.name} (${u.title}) — Click to filter`}
                    className={`w-7 h-7 rounded-full border-2 border-[#172554] flex items-center justify-center text-xs font-bold transition hover:scale-110 ${
                      filterAssigneeId === u.id ? 'bg-[#FACC15] ring-2 ring-[#2563EB]' : 'bg-white'
                    }`}
                  >
                    {u.avatar}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 3. DOMAIN-SPECIFIC KPI BANNERS */}
        {/* BANNER A: PERSONAL BOARD */}
        {isPersonal && (
          <div className="mb-8 p-5 bg-gradient-to-r from-[#EFF6FF] via-white to-[#FFFBEB] border-2 border-[#172554] shadow-[4px_4px_0_#172554]">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#172554]/20">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#2563EB]" />
                <span className="font-['Space_Grotesk'] font-bold text-xs uppercase tracking-widest text-[#2563EB]">
                  Personal Focus Stats (Isolated View)
                </span>
              </div>
              <span className="text-[11px] font-mono font-bold text-slate-500">
                Assignee: {currentUser.name}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
              {/* Total Personal XP */}
              <div className="p-3 bg-white border-2 border-[#172554] shadow-[2px_2px_0_#172554]">
                <div className="text-[10px] uppercase font-bold text-slate-500">Total Personal XP</div>
                <div className="font-['Bebas_Neue'] text-3xl text-[#2563EB] leading-none mt-1">
                  {personalMetrics.totalPersonalXp.toLocaleString()} XP
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  Designation: {getDesignationTitle(calculateOverallLevel(personalMetrics.totalPersonalXp), 'Intellect')}
                </div>
              </div>

              {/* Daily Harvest Streak */}
              <div className="p-3 bg-white border-2 border-[#172554] shadow-[2px_2px_0_#172554]">
                <div className="text-[10px] uppercase font-bold text-slate-500">Daily Harvest Streak</div>
                <div className="font-['Bebas_Neue'] text-3xl text-[#FB923C] leading-none mt-1 flex items-center gap-1.5">
                  <Flame className="w-6 h-6 text-[#FB923C] fill-[#FB923C]" />
                  <span>{personalMetrics.dailyStreak} Days Active</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-1">High momentum streak active</div>
              </div>

              {/* Individual Task Progress */}
              <div className="p-3 bg-white border-2 border-[#172554] shadow-[2px_2px_0_#172554]">
                <div className="flex justify-between items-center text-[10px] uppercase font-bold text-slate-500">
                  <span>Task Progress</span>
                  <span className="text-[#22C55E]">{personalMetrics.personalProgressPercent}%</span>
                </div>
                <div className="font-['Bebas_Neue'] text-3xl text-[#172554] leading-none mt-1">
                  {personalMetrics.harvestedCount} / {personalMetrics.totalTasks} Done
                </div>
                <div className="w-full h-2 bg-slate-100 border border-[#172554] mt-1.5">
                  <div
                    className="h-full bg-[#22C55E]"
                    style={{ width: `${personalMetrics.personalProgressPercent}%` }}
                  />
                </div>
              </div>

              {/* Personal Virtue Radar Overview */}
              <div className="p-2.5 bg-white border-2 border-[#172554] shadow-[2px_2px_0_#172554] flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-500">Virtue Radar</div>
                  <div className="text-xs font-bold text-[#172554] mt-0.5">Balance Overview</div>
                  <div className="text-[10px] text-[#2563EB] font-bold">5 Virtues Tracked</div>
                </div>

                <svg width="76" height="76" viewBox="0 0 110 110" className="overflow-visible">
                  <polygon
                    points={personalMetrics.radarPoints}
                    fill="rgba(37, 99, 235, 0.3)"
                    stroke="#2563EB"
                    strokeWidth="2"
                  />
                  <circle cx={personalMetrics.cx} cy={personalMetrics.cy} r={personalMetrics.r} fill="none" stroke="#CBD5E1" strokeWidth="1" strokeDasharray="2 2" />
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* BANNER B: ALPHA PRODUCT TEAM */}
        {isAlpha && (
          <div className="mb-8 p-5 bg-gradient-to-r from-[#EFF6FF] via-[#F8FAFC] to-[#EFF6FF] border-2 border-[#172554] shadow-[4px_4px_0_#172554]">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#172554]/20">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#2563EB]" />
                <span className="font-['Space_Grotesk'] font-bold text-xs uppercase tracking-widest text-[#2563EB]">
                  Sprint Engineering Banner · Active Sprint #42
                </span>
              </div>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-[#FACC15] border border-[#172554]">
                Phase 2 In Flight
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
              {/* Sprint Velocity */}
              <div className="p-3 bg-white border-2 border-[#172554] shadow-[2px_2px_0_#172554]">
                <div className="text-[10px] uppercase font-bold text-slate-500">Sprint Velocity</div>
                <div className="font-['Bebas_Neue'] text-3xl text-[#2563EB] leading-none mt-1">
                  {alphaMetrics.sprintVelocity} XP / Day
                </div>
                <div className="text-[10px] text-slate-500 mt-1">Based on rolling 5-day cycle</div>
              </div>

              {/* Critical Blockers */}
              <div className="p-3 bg-white border-2 border-[#172554] shadow-[2px_2px_0_#172554]">
                <div className="text-[10px] uppercase font-bold text-slate-500">Critical Blockers</div>
                <div className="font-['Bebas_Neue'] text-3xl text-[#EF4444] leading-none mt-1 flex items-center gap-1.5">
                  <AlertTriangle className="w-6 h-6 text-[#EF4444]" />
                  <span>{alphaMetrics.blockersCount} Blockers</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-1">High priority tasks in queue</div>
              </div>

              {/* Sprint Completion Progress */}
              <div className="p-3 bg-white border-2 border-[#172554] shadow-[2px_2px_0_#172554] col-span-1 sm:col-span-2">
                <div className="flex justify-between items-center text-[10px] uppercase font-bold text-slate-500">
                  <span>Sprint Completion Velocity</span>
                  <span className="text-[#2563EB] font-mono">{alphaMetrics.completionPercent}%</span>
                </div>
                <div className="font-['Bebas_Neue'] text-2xl text-[#172554] leading-none mt-1">
                  {alphaMetrics.harvestedCount} of {alphaMetrics.totalCount} Tasks Delivered
                </div>
                <div className="w-full h-3 bg-slate-100 border-2 border-[#172554] mt-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#2563EB] to-[#22C55E] transition-all duration-500"
                    style={{ width: `${alphaMetrics.completionPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* BANNER C: DESIGN & GROWTH */}
        {isDesignGrowth && (
          <div className="mb-8 p-5 bg-gradient-to-r from-[#FFFBEB] via-[#FAFAF8] to-[#F0FDF4] border-2 border-[#172554] shadow-[4px_4px_0_#172554]">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#172554]/20">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-[#FB923C]" />
                <span className="font-['Space_Grotesk'] font-bold text-xs uppercase tracking-widest text-[#FB923C]">
                  Creative Pipeline Banner · Growth Engine
                </span>
              </div>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-[#22C55E] text-white border border-[#172554]">
                Q4 Campaign Stream
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
              {/* Active Campaigns */}
              <div className="p-3 bg-white border-2 border-[#172554] shadow-[2px_2px_0_#172554]">
                <div className="text-[10px] uppercase font-bold text-slate-500">Active Campaigns</div>
                <div className="font-['Bebas_Neue'] text-3xl text-[#FB923C] leading-none mt-1">
                  {designMetrics.activeCampaignCount} In Flight
                </div>
                <div className="text-[10px] text-slate-500 mt-1">Tasks in Raw & Ripening</div>
              </div>

              {/* Harmony / Intellect Virtue Ratio */}
              <div className="p-3 bg-white border-2 border-[#172554] shadow-[2px_2px_0_#172554]">
                <div className="text-[10px] uppercase font-bold text-slate-500">Harmony / Intellect Ratio</div>
                <div className="font-['Bebas_Neue'] text-3xl text-[#2563EB] leading-none mt-1">
                  {designMetrics.virtueRatio}
                </div>
                <div className="text-[10px] text-slate-500 mt-1">Creative alignment balance</div>
              </div>

              {/* Review Bottlenecks */}
              <div className="p-3 bg-white border-2 border-[#172554] shadow-[2px_2px_0_#172554]">
                <div className="text-[10px] uppercase font-bold text-slate-500">Review Bottlenecks</div>
                <div className="font-['Bebas_Neue'] text-3xl text-[#FACC15] leading-none mt-1">
                  {designMetrics.reviewBottlenecks} In Review
                </div>
                <div className="text-[10px] text-slate-500 mt-1">Ripening tasks pending harvest</div>
              </div>
            </div>

            {/* Creative Tag Filters */}
            <div className="mt-4 pt-3 border-t border-[#172554]/10 flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-[#172554] flex items-center gap-1 mr-1">
                <Layers className="w-3.5 h-3.5" /> Pipeline Filter:
              </span>
              {['all', 'UI/UX', 'Branding', 'Marketing'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`px-3 py-1 text-xs font-['Space_Grotesk'] font-bold uppercase tracking-wider border-2 border-[#172554] transition ${
                    selectedTag.toLowerCase() === tag.toLowerCase()
                      ? 'bg-[#172554] text-[#FACC15] shadow-[2px_2px_0_#FB923C]'
                      : 'bg-white hover:bg-slate-100 text-[#172554]'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 4. Filter and Action Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-8 bg-white p-4 border-2 border-[#172554] shadow-[3px_3px_0_#172554]">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tasks..."
                className="pl-9 pr-3 py-1.5 bg-slate-50 border-2 border-[#172554] text-xs font-['Inter'] font-medium text-[#172554] focus:outline-none w-44 sm:w-56"
              />
            </div>

            {/* Filter Assignee (Only for team workspaces) */}
            {!isPersonal && (
              <select
                value={filterAssigneeId}
                onChange={(e) => setFilterAssignee(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border-2 border-[#172554] text-xs font-['Space_Grotesk'] font-bold text-[#172554]"
              >
                <option value="all">All Assignees</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.title})
                  </option>
                ))}
              </select>
            )}

            {/* Filter Priority */}
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value as any)}
              className="px-3 py-1.5 bg-slate-50 border-2 border-[#172554] text-xs font-['Space_Grotesk'] font-bold text-[#172554]"
            >
              <option value="all">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>

          {/* Add Task Button */}
          <div>
            {!isObserver ? (
              <button
                onClick={() => setIsTaskModalOpen(true)}
                className="w-full sm:w-auto px-5 py-2 bg-[#2563EB] hover:bg-blue-700 text-white font-['Space_Grotesk'] font-bold text-xs uppercase tracking-wider border-2 border-[#172554] shadow-[2px_2px_0_#172554] transition active:translate-x-0.5 active:translate-y-0.5 flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                ADD TASK
              </button>
            ) : (
              <div className="text-xs font-['Space_Grotesk'] font-bold text-slate-500 bg-slate-100 px-3 py-1.5 border border-slate-300">
                VIEWER MODE (READ-ONLY)
              </div>
            )}
          </div>
        </div>

        {/* 5. 3-Column Kanban Board Grid with Responsive Drop Targets */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Column 1: TO DO */}
          {renderColumn('01', 'TO DO', 'raw', rawTasks, '#2563EB', '#EFF6FF', 'Nothing planned yet.')}

          {/* Column 2: IN PROGRESS */}
          {renderColumn('02', 'IN PROGRESS', 'ripening', ripeningTasks, '#FB923C', '#FFFBEB', 'No tasks in progress.')}

          {/* Column 3: COMPLETED */}
          {renderColumn('03', 'COMPLETED', 'harvested', harvestedTasks, '#22C55E', '#F0FDF4', 'No completed tasks yet.')}
        </div>
      </section>

      {/* 6. Lifetime Harvest Stats Section */}
      <section className="bg-white border-t-2 border-[#172554] py-16 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10">
            <p className="font-['Space_Grotesk'] font-bold text-xs uppercase tracking-[0.16em] text-[#2563EB] mb-2">
              05 / STATS
            </p>
            <h2 className="font-['Bebas_Neue'] text-5xl sm:text-6xl tracking-tight text-[#172554] leading-none m-0">
              YOUR HARVEST.
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 border-2 border-[#172554] bg-white divide-y-2 md:divide-y-0 md:divide-x-2 divide-[#172554] shadow-[4px_4px_0_#172554]">
            <div className="p-8">
              <div className="font-['Bebas_Neue'] text-6xl lg:text-7xl leading-none text-[#22C55E] mb-2">
                {lifetimeStats.totalTasksHarvested}
              </div>
              <div className="font-['Space_Grotesk'] font-bold text-xs uppercase tracking-wider text-[#172554]/70">
                Tasks Completed
              </div>
            </div>

            <div className="p-8">
              <div className="font-['Bebas_Neue'] text-6xl lg:text-7xl leading-none text-[#2563EB] mb-2">
                {lifetimeStats.totalXP.toLocaleString()}
              </div>
              <div className="font-['Space_Grotesk'] font-bold text-xs uppercase tracking-wider text-[#172554]/70">
                XP Earned
              </div>
            </div>

            <div className="p-8">
              <div className="font-['Bebas_Neue'] text-6xl lg:text-7xl leading-none text-[#FB923C] mb-2">
                {lifetimeStats.totalShakes}
              </div>
              <div className="font-['Space_Grotesk'] font-bold text-xs uppercase tracking-wider text-[#172554]/70">
                Sessions Blended
              </div>
            </div>

            <div className="p-8">
              <div className="font-['Bebas_Neue'] text-4xl lg:text-5xl leading-tight text-[#172554] mb-2 flex items-center gap-2">
                <span>{currentRank.icon}</span>
                <span>{currentRank.title}</span>
              </div>
              <div className="font-['Space_Grotesk'] font-bold text-xs uppercase tracking-wider text-[#172554]/70">
                Current Rank
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Task Creation Modal */}
      <TaskModal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} />

      {/* Reassign / Collaboration Modal */}
      <CrossPollinateModal task={reassigningTask} onClose={() => setReassigningTask(null)} />
    </div>
  );

  // Column Renderer with Drop Target Highlighting
  function renderColumn(
    num: string,
    title: string,
    colId: ColumnId,
    colTasks: Task[],
    accentColor: string,
    bgHeaderColor: string,
    emptyMessage: string
  ) {
    const isOver = dragOverCol === colId;

    return (
      <div
        key={colId}
        onDragOver={(e) => handleDragOver(e, colId)}
        onDragEnter={(e) => handleDragEnter(e, colId)}
        onDragLeave={(e) => handleDragLeave(e, colId)}
        onDrop={(e) => handleDrop(e, colId)}
        className={`bg-white border-2 flex flex-col min-h-[520px] transition-all duration-150 ${
          isOver
            ? 'border-[#2563EB] ring-4 ring-[#2563EB]/25 shadow-[6px_6px_0_#172554] scale-[1.01]'
            : 'border-[#172554] shadow-[4px_4px_0_#172554]'
        }`}
      >
        {/* Column Header */}
        <div
          className="p-4 border-b-2 border-[#172554] flex items-center justify-between transition-colors"
          style={{ backgroundColor: isOver ? '#DBEAFE' : bgHeaderColor }}
        >
          <div className="flex items-center gap-2">
            <span className="font-['Space_Grotesk'] font-bold text-xs text-[#172554]/70">{num}</span>
            <h3 className="font-['Bebas_Neue'] text-2xl tracking-wide text-[#172554] m-0">{title}</h3>
          </div>
          <span className="w-6 h-6 rounded-full border-2 border-[#172554] bg-white font-['Space_Grotesk'] font-bold text-xs flex items-center justify-center text-[#172554]">
            {colTasks.length}
          </span>
        </div>

        {/* Task Cards Container */}
        <div
          onDragOver={(e) => handleDragOver(e, colId)}
          onDragEnter={(e) => handleDragEnter(e, colId)}
          onDrop={(e) => handleDrop(e, colId)}
          className={`p-3.5 space-y-3 flex-1 transition-colors ${
            isOver ? 'bg-blue-50/60' : 'bg-[#FAFAF8]/50'
          }`}
        >
          {/* Active Drop Placeholder */}
          {draggedTaskId && isOver && (
            <div className="border-2 border-dashed border-[#2563EB] bg-[#2563EB]/10 p-3.5 text-center text-xs font-['Space_Grotesk'] font-bold text-[#2563EB] uppercase tracking-wider animate-pulse">
              + Drop here to move to {title}
            </div>
          )}

          {colTasks.length === 0 && (!draggedTaskId || !isOver) ? (
            <div className="py-16 text-center text-xs font-['Inter'] text-[#172554]/40 italic">
              {emptyMessage}
            </div>
          ) : (
            colTasks.map((task) => renderCard(task, colId, accentColor))
          )}
        </div>
      </div>
    );
  }

  // Card Renderer with Dragging Hooks and Cursors
  function renderCard(task: Task, colId: ColumnId, accentColor: string) {
    const assignee = users.find((u) => u.id === task.assigneeId) || users[0];
    const priorityColor =
      task.priority === 'high' ? '#FB923C' : task.priority === 'medium' ? '#FACC15' : '#22C55E';
    const virtueMeta = VIRTUE_META[task.virtue || 'Intellect'];
    const isDragging = draggedTaskId === task.id;

    return (
      <div
        key={task.id}
        draggable={!isObserver}
        onDragStart={(e) => handleDragStart(e, task.id)}
        onDragEnd={handleDragEnd}
        onDragOver={(e) => handleDragOver(e, colId)}
        onDrop={(e) => handleDrop(e, colId)}
        className={`bg-white border-2 border-[#172554] p-3.5 transition-all duration-150 select-none relative group ${
          !isObserver ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
        } ${
          isDragging
            ? 'opacity-40 border-dashed scale-95 shadow-none'
            : 'hover:-translate-y-1 hover:shadow-[3px_3px_0_#172554]'
        }`}
        style={{ borderLeftWidth: '6px', borderLeftColor: accentColor }}
      >
        {/* Top: Priority Dot, Title & Virtue Badge */}
        <div className="flex items-start gap-2.5 mb-1.5">
          <div
            className="w-2.5 h-2.5 rounded-full border border-[#172554] shrink-0 mt-1"
            style={{ backgroundColor: priorityColor }}
            title={`Priority: ${task.priority}`}
          />
          <h4 className="font-['Space_Grotesk'] font-bold text-sm text-[#172554] leading-snug flex-1 m-0">
            {task.title}
          </h4>
          {!isObserver && (
            <GripVertical className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
          )}
        </div>

        {/* Description */}
        {task.description && (
          <p className="font-['Inter'] text-xs text-[#172554]/70 mb-3 line-clamp-2 pl-5">
            {task.description}
          </p>
        )}

        {/* Tags & Virtue Badges */}
        <div className="flex flex-wrap items-center gap-1.5 mb-3 pl-5">
          {/* Virtue Pill */}
          <span
            className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider border border-[#172554] flex items-center gap-1"
            style={{ backgroundColor: virtueMeta.bg, color: virtueMeta.color }}
          >
            <span>{virtueMeta.icon}</span>
            <span>{task.virtue}</span>
          </span>

          {/* Difficulty Pill */}
          {task.difficulty && (
            <span className="px-1.5 py-0.5 bg-slate-100 text-slate-700 border border-slate-300 font-['Space_Grotesk'] text-[9px] font-bold uppercase">
              {task.difficulty}
            </span>
          )}

          {task.tags?.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 bg-slate-100 text-[#172554] border border-slate-300 font-['Space_Grotesk'] text-[10px] font-bold uppercase tracking-wider"
            >
              {tag}
            </span>
          ))}

          {task.pollinatedBonus && (
            <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 border border-amber-300 font-['Space_Grotesk'] text-[9px] font-extrabold uppercase">
              +25% TEAM XP
            </span>
          )}
        </div>

        {/* Card Footer: Assignee (hidden on personal board), XP & Quick Move Buttons */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between pl-5">
          <div className="flex items-center gap-2">
            {!isPersonal && (
              <div
                className="w-5 h-5 rounded-full border border-[#172554] bg-white flex items-center justify-center text-[10px]"
                title={`Assigned: ${assignee.name}`}
              >
                {assignee.avatar}
              </div>
            )}
            <span className="font-['Space_Grotesk'] text-xs font-bold text-[#172554]/80">
              +{task.xp} XP
            </span>
          </div>

          {/* Quick Action Buttons */}
          {!isObserver && (
            <div className="flex items-center gap-1">
              {/* Reassign / Delegate (+25% Team XP) */}
              {!isPersonal && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setReassigningTask(task);
                  }}
                  title="Reassign to teammate (+25% Team XP bonus)"
                  className="p-1 hover:bg-slate-100 text-[#172554] transition"
                >
                  <Share2 className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Move forward/back buttons */}
              {colId === 'raw' && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    moveTask(task.id, 'ripening');
                  }}
                  title="Move to In Progress"
                  className="p-1 hover:bg-orange-50 text-[#FB923C] transition"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              {colId === 'ripening' && (
                <div className="flex items-center gap-0.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      moveTask(task.id, 'raw');
                    }}
                    title="Move back to To Do"
                    className="p-1 hover:bg-slate-100 text-slate-500 transition"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      moveTask(task.id, 'harvested');
                    }}
                    title="Mark Completed"
                    className="p-1 hover:bg-green-50 text-[#22C55E] transition"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {colId === 'harvested' && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    moveTask(task.id, 'ripening');
                  }}
                  title="Reopen Task"
                  className="p-1 hover:bg-slate-100 text-slate-400 transition"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Delete button (Keeper/Admin only) */}
              {isKeeper && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteTask(task.id);
                  }}
                  title="Delete Task (Admin only)"
                  className="p-1 hover:bg-red-50 text-red-500 transition ml-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }
};

export default BoardView;
