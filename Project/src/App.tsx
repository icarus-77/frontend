import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useStore } from './store/useStore';
import { Navbar } from './components/layout/Navbar';
import { BoardView } from './pages/BoardView';
import { DashboardView } from './pages/DashboardView';
import { GardenAnalytics } from './pages/GardenAnalytics';
import { OrchardTimeline } from './pages/OrchardTimeline';
import { BlendHistory } from './pages/BlendHistory';
import { BlenderModal } from './components/celebration/BlenderModal';
import { LifeCharacterSheet } from './components/profile/LifeCharacterSheet';
import { TaskModal } from './components/modals/TaskModal';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 30,
    },
  },
});

export const AppContent: React.FC = () => {
  const { currentPage } = useStore();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#172554] flex flex-col selection:bg-[#FACC15] selection:text-[#172554]">
      {/* Top Navigation Bar with Workspaces, Tabs, and RBAC Persona Switcher */}
      <Navbar
        onOpenProfile={() => setIsProfileOpen(true)}
        onAddTask={() => setIsTaskModalOpen(true)}
      />

      {/* Main Pages Switcher */}
      <main className="flex-1">
        {currentPage === 'board' && <BoardView />}
        {currentPage === 'dashboard' && <DashboardView />}
        {currentPage === 'analytics' && <GardenAnalytics />}
        {currentPage === 'timeline' && <OrchardTimeline />}
        {currentPage === 'archive' && <BlendHistory />}
      </main>

      {/* Continuous Auto-Listening Blender Celebration Modal */}
      <BlenderModal />

      {/* RPG Life Gamification Character Sheet */}
      <LifeCharacterSheet isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />

      {/* Global Task Creator Modal */}
      <TaskModal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} />

      {/* Editorial Footer */}
      <footer className="border-t-2 border-[#172554] bg-[#172554] py-8 text-white px-4 sm:px-8 font-['Space_Grotesk'] text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🥭</span>
            <span className="font-['Bebas_Neue'] text-xl tracking-wider text-white">CHANGO MANGO</span>
            <span className="text-slate-400">· Team Collaboration & Kanban Platform</span>
          </div>
          <div className="text-slate-400 text-[11px]">
            React 19 + TypeScript + Zustand + Tailwind CSS v4
          </div>
        </div>
      </footer>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
};

export default App;
