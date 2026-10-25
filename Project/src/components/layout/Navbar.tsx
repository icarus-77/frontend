import React, { useState } from 'react';
import { useGardenStore } from '../../store/useGardenStore';
import { UserRole } from '../../types/garden';
import { ChevronDown, Plus, Sparkles, UserCheck, Shield } from 'lucide-react';

interface NavbarProps {
  onOpenProfile: () => void;
  onAddTask: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenProfile, onAddTask }) => {
  const {
    currentPage,
    setCurrentPage,
    currentWorkspaceId,
    setWorkspace,
    workspaces,
    currentUser,
    users,
    setCurrentUser,
    setUserRole,
    triggerHarvestCelebration,
  } = useGardenStore();

  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);

  const currentWorkspace = workspaces.find((w) => w.id === currentWorkspaceId) || workspaces[0];

  const roleLabels: Record<UserRole, { label: string; badgeClass: string }> = {
    keeper: { label: 'Admin', badgeClass: 'bg-[#FACC15] text-[#172554]' },
    harvester: { label: 'Member', badgeClass: 'bg-[#22C55E] text-white' },
    observer: { label: 'Viewer', badgeClass: 'bg-slate-200 text-slate-700' },
  };

  return (
    <header className="sticky top-0 z-50 bg-[#172554] text-white border-b-2 border-[#172554] shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Wordmark & Workspace Switcher */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCurrentPage('board')}
              className="flex items-center gap-2 text-left group focus:outline-none"
            >
              <span className="text-2xl">🥭</span>
              <span className="font-['Bebas_Neue'] text-2xl tracking-widest text-white group-hover:text-[#FACC15] transition-colors">
                CHANGO MANGO
              </span>
            </button>

            {/* Workspace Switcher */}
            <div className="relative">
              <button
                onClick={() => setWorkspaceOpen(!workspaceOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-none bg-white/10 hover:bg-white/20 border border-white/25 text-white text-xs font-['Space_Grotesk'] font-bold transition"
              >
                <span>{currentWorkspace.icon}</span>
                <span className="hidden sm:inline">{currentWorkspace.name}</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-80" />
              </button>

              {workspaceOpen && (
                <div
                  className="absolute left-0 mt-2 w-72 bg-white text-[#172554] border-2 border-[#172554] shadow-[4px_4px_0_#172554] py-2 z-50 font-['Space_Grotesk']"
                  onMouseLeave={() => setWorkspaceOpen(false)}
                >
                  <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                    Switch Workspace
                  </div>
                  {workspaces.map((ws) => (
                    <button
                      key={ws.id}
                      onClick={() => {
                        setWorkspace(ws.id);
                        setWorkspaceOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 flex items-center gap-3 hover:bg-yellow-50 transition ${
                        ws.id === currentWorkspaceId ? 'bg-yellow-100 font-bold' : ''
                      }`}
                    >
                      <span className="text-xl">{ws.icon}</span>
                      <div className="flex-1 truncate">
                        <div className="text-xs font-bold">{ws.name}</div>
                        <div className="text-[10px] text-slate-500 truncate">{ws.description}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Center Tabs: Board, Dashboard, Analytics, Timeline, Archive */}
          <nav className="hidden md:flex items-center gap-1 font-['Space_Grotesk']">
            {[
              { id: 'board', label: 'BOARD' },
              { id: 'dashboard', label: 'MY DASHBOARD' },
              { id: 'analytics', label: 'ANALYTICS' },
              { id: 'timeline', label: 'TIMELINE' },
              { id: 'archive', label: 'ARCHIVE' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setCurrentPage(tab.id as any)}
                className={`px-3.5 py-2 text-xs font-bold uppercase tracking-wider transition ${
                  currentPage === tab.id
                    ? 'text-[#FACC15] border-b-2 border-[#FACC15]'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Right: Quick Action, Role Selector, Profile */}
          <div className="flex items-center gap-3">
            {/* Quick Add Task Button */}
            {currentUser.role !== 'observer' && (
              <button
                onClick={onAddTask}
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 bg-[#FACC15] hover:bg-yellow-300 text-[#172554] font-['Space_Grotesk'] font-bold text-xs uppercase tracking-wider shadow-[2px_2px_0_#0F172A] transition active:translate-x-0.5 active:translate-y-0.5"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                ADD TASK
              </button>
            )}

            {/* Instant Session Blend Celebration */}
            <button
              onClick={() => triggerHarvestCelebration()}
              className="flex items-center gap-1 px-3 py-1.5 bg-[#22C55E] hover:bg-green-600 text-white font-['Space_Grotesk'] font-bold text-xs uppercase tracking-wider transition shadow-[2px_2px_0_#0F172A]"
            >
              <Sparkles className="w-3.5 h-3.5" />
              BLEND
            </button>

            {/* Role & Teammate Selector */}
            <div className="relative font-['Space_Grotesk']">
              <button
                onClick={() => setRoleOpen(!roleOpen)}
                className="flex items-center gap-2 px-2.5 py-1.5 bg-white/10 hover:bg-white/20 border border-white/30 text-white text-xs font-semibold"
              >
                <span>{currentUser.avatar}</span>
                <span className="hidden sm:inline font-bold">{currentUser.name.split(' ')[0]}</span>
                <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded ${roleLabels[currentUser.role].badgeClass}`}>
                  {roleLabels[currentUser.role].label}
                </span>
                <ChevronDown className="w-3 h-3 opacity-70" />
              </button>

              {roleOpen && (
                <div
                  className="absolute right-0 mt-2 w-64 bg-white text-[#172554] border-2 border-[#172554] shadow-[4px_4px_0_#172554] py-2 z-50 text-xs"
                  onMouseLeave={() => setRoleOpen(false)}
                >
                  <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                    Switch Permission Role
                  </div>
                  <div className="p-1 space-y-1">
                    {(['keeper', 'harvester', 'observer'] as UserRole[]).map((r) => (
                      <button
                        key={r}
                        onClick={() => {
                          setUserRole(r);
                          setRoleOpen(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 flex items-center justify-between hover:bg-yellow-50 transition ${
                          currentUser.role === r ? 'font-bold bg-yellow-100' : ''
                        }`}
                      >
                        <span>{roleLabels[r].label}</span>
                        {currentUser.role === r && <UserCheck className="w-3.5 h-3.5 text-[#2563EB]" />}
                      </button>
                    ))}
                  </div>

                  <div className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-t border-slate-100">
                    Switch Teammate Profile
                  </div>
                  <div className="p-1">
                    {users.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => {
                          setCurrentUser(u);
                          setRoleOpen(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 flex items-center gap-2 hover:bg-yellow-50 transition ${
                          currentUser.id === u.id ? 'font-bold bg-yellow-100' : ''
                        }`}
                      >
                        <span>{u.avatar}</span>
                        <span className="truncate">{u.name} ({u.title})</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Drawer Button */}
            <button
              onClick={onOpenProfile}
              className="px-3 py-1.5 border border-white/50 text-white hover:bg-white hover:text-[#172554] font-['Space_Grotesk'] font-bold text-xs uppercase tracking-wider transition"
            >
              PROFILE
            </button>
          </div>
        </div>

        {/* Mobile Nav Links */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-white/15 font-['Space_Grotesk'] text-[11px] font-bold">
          <button
            onClick={() => setCurrentPage('board')}
            className={currentPage === 'board' ? 'text-[#FACC15]' : 'text-white/80'}
          >
            BOARD
          </button>
          <button
            onClick={() => setCurrentPage('dashboard')}
            className={currentPage === 'dashboard' ? 'text-[#FACC15]' : 'text-white/80'}
          >
            MY TASKS
          </button>
          <button
            onClick={() => setCurrentPage('analytics')}
            className={currentPage === 'analytics' ? 'text-[#FACC15]' : 'text-white/80'}
          >
            STATS
          </button>
          <button
            onClick={() => setCurrentPage('timeline')}
            className={currentPage === 'timeline' ? 'text-[#FACC15]' : 'text-white/80'}
          >
            TIMELINE
          </button>
          <button
            onClick={() => setCurrentPage('archive')}
            className={currentPage === 'archive' ? 'text-[#FACC15]' : 'text-white/80'}
          >
            ARCHIVE
          </button>
        </div>
      </div>
    </header>
  );
};
