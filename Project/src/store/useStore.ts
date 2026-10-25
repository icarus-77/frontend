import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Task,
  User,
  Workspace,
  WorkspaceId,
  TeamGoal,
  BlendRecipe,
  TetrapackArchiveItem,
  Virtue,
  ColumnId,
  LifetimeStats,
  UserRole,
} from '../types/garden';
import {
  INITIAL_TASKS,
  INITIAL_USERS,
  WORKSPACES,
  INITIAL_TEAM_GOALS,
  BLEND_RECIPES,
  INITIAL_ARCHIVE,
  VIRTUES,
} from '../constants/gardenConstants';

export interface StoreState {
  // Navigation
  currentPage: 'dashboard' | 'board' | 'analytics' | 'timeline' | 'archive';
  setCurrentPage: (page: 'dashboard' | 'board' | 'analytics' | 'timeline' | 'archive') => void;

  // Workspace & Navigation
  currentWorkspace: WorkspaceId;
  currentWorkspaceId: WorkspaceId; // compatibility alias
  setWorkspace: (workspaceId: WorkspaceId) => void;
  workspaces: Workspace[];

  // Users & Active Persona
  currentUser: User;
  users: User[];
  setCurrentUser: (user: User) => void;
  setUserRole: (role: UserRole) => void;

  // Tasks & Columns
  tasks: Record<string, Task>;
  columnsByWorkspace: Record<WorkspaceId, Record<ColumnId, string[]>>;

  // Task Feed Helper for Workspace Isolation
  getWorkspaceTasks: () => Task[];

  // Board Filters
  filterAssigneeId: string | 'all';
  filterPriority: 'all' | 'high' | 'medium' | 'low';
  searchQuery: string;
  setFilterAssignee: (id: string | 'all') => void;
  setFilterPriority: (priority: 'all' | 'high' | 'medium' | 'low') => void;
  setSearchQuery: (query: string) => void;

  // Task Mutations
  moveTask: (taskId: string, targetStage: ColumnId) => boolean;
  createTask: (taskData: Omit<Task, 'id' | 'createdAt' | 'completedAt' | 'stage'> & { stage?: ColumnId }) => Task | null;
  updateTask: (taskId: string, updates: Partial<Task>) => boolean;
  deleteTask: (taskId: string) => boolean;
  reassignTask: (taskId: string, newAssigneeId: string) => boolean;
  clearHarvestedTasks: () => void;

  // Blend History & Archive
  blendHistory: TetrapackArchiveItem[];
  archive: TetrapackArchiveItem[]; // alias

  // Celebration state
  isCelebrating: boolean;
  celebrationData: {
    recipe: BlendRecipe;
    harvestedTasks: Task[];
    sessionVirtues: Record<Virtue, number>;
    xpGained: number;
    batchNumber: string;
  } | null;
  triggerHarvestCelebration: (recipeId?: string) => void;
  closeCelebration: () => void;

  // Gamification & Goals
  teamGoals: TeamGoal[];
  claimGoalReward: (goalId: string) => void;
  selectedRecipeId: string;
  setSelectedRecipeId: (id: string) => void;
  customRecipes: BlendRecipe[];
  lifetimeStats: LifetimeStats;
  addLifetimeStats: (xp: number, virtues: Record<Virtue, number>, taskCount: number) => void;

  // Broadcast
  broadcastAction: (action: unknown) => void;
}

// Native BroadcastChannel for multi-tab synchronization
let syncChannel: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    syncChannel = new BroadcastChannel('mango_chango_realtime_channel');
  } catch (e) {
    console.warn('BroadcastChannel unavailable', e);
  }
}

const initialColumnsByWorkspace: Record<WorkspaceId, Record<ColumnId, string[]>> = {
  'alpha-product': {
    raw: ['task-1'],
    ripening: ['task-2', 'task-3'],
    harvested: ['task-4'],
  },
  personal: {
    raw: ['task-5'],
    ripening: [],
    harvested: [],
  },
  'design-growth': {
    raw: ['task-6'],
    ripening: ['task-7'],
    harvested: [],
  },
};

const initialTasksMap = Object.fromEntries(INITIAL_TASKS.map((t) => [t.id, t]));

export const useStore = create<StoreState>()(
  persist(
    (set, get) => {
      // Cross-tab real-time sync listener
      if (syncChannel) {
        syncChannel.onmessage = (event) => {
          const { type, payload } = event.data || {};
          if (!type) return;

          switch (type) {
            case 'WORKSPACE_CHANGED': {
              const { workspaceId } = payload;
              set({ currentWorkspace: workspaceId, currentWorkspaceId: workspaceId });
              break;
            }

            case 'TASK_MOVED': {
              const { taskId, targetStage, workspaceId, updatedTask, updatedUser } = payload;
              const { columnsByWorkspace, tasks, users } = get();
              const wsCols = columnsByWorkspace[workspaceId as WorkspaceId];
              if (!wsCols || !tasks[taskId]) return;

              const nextWsCols: Record<ColumnId, string[]> = {
                raw: wsCols.raw.filter((id) => id !== taskId),
                ripening: wsCols.ripening.filter((id) => id !== taskId),
                harvested: wsCols.harvested.filter((id) => id !== taskId),
              };
              nextWsCols[targetStage as ColumnId].push(taskId);

              set((state) => ({
                columnsByWorkspace: {
                  ...columnsByWorkspace,
                  [workspaceId as WorkspaceId]: nextWsCols,
                },
                tasks: {
                  ...tasks,
                  [taskId]: updatedTask || {
                    ...tasks[taskId],
                    stage: targetStage as ColumnId,
                    completedAt: targetStage === 'harvested' ? Date.now() : null,
                    progress: targetStage === 'harvested' ? 100 : targetStage === 'ripening' ? 50 : 0,
                  },
                },
                currentUser: updatedUser && state.currentUser.id === updatedUser.id ? updatedUser : state.currentUser,
                users: updatedUser ? state.users.map((u) => (u.id === updatedUser.id ? updatedUser : u)) : state.users,
              }));
              break;
            }

            case 'TASK_CREATED': {
              const { task } = payload;
              const { tasks, columnsByWorkspace } = get();
              const wsId = task.workspaceId as WorkspaceId;
              const wsCols = columnsByWorkspace[wsId] || { raw: [], ripening: [], harvested: [] };

              set({
                tasks: { ...tasks, [task.id]: task },
                columnsByWorkspace: {
                  ...columnsByWorkspace,
                  [wsId]: {
                    ...wsCols,
                    raw: [task.id, ...wsCols.raw],
                  },
                },
              });
              break;
            }

            case 'TASK_REASSIGNED': {
              const { taskId, newAssigneeId, bonus, byUserId } = payload;
              const { tasks } = get();
              if (!tasks[taskId]) return;
              set({
                tasks: {
                  ...tasks,
                  [taskId]: {
                    ...tasks[taskId],
                    assigneeId: newAssigneeId,
                    pollinatedBonus: bonus,
                    pollinatedBy: byUserId,
                  },
                },
              });
              break;
            }

            case 'CLEAR_HARVESTED': {
              const { workspaceId, newArchiveItem, updatedLifetimeStats } = payload;
              const { columnsByWorkspace, blendHistory } = get();
              const wsCols = columnsByWorkspace[workspaceId as WorkspaceId];
              if (!wsCols) return;

              set({
                columnsByWorkspace: {
                  ...columnsByWorkspace,
                  [workspaceId as WorkspaceId]: {
                    ...wsCols,
                    harvested: [],
                  },
                },
                blendHistory: newArchiveItem ? [newArchiveItem, ...blendHistory] : blendHistory,
                archive: newArchiveItem ? [newArchiveItem, ...blendHistory] : blendHistory,
                lifetimeStats: updatedLifetimeStats || get().lifetimeStats,
                isCelebrating: false,
                celebrationData: null,
              });
              break;
            }

            case 'HARVEST_CELEBRATION': {
              const { recipeId, workspaceId } = payload;
              if (workspaceId === get().currentWorkspace) {
                get().triggerHarvestCelebration(recipeId);
              }
              break;
            }
          }
        };
      }

      return {
        // Navigation
        currentPage: 'board',
        setCurrentPage: (page) => set({ currentPage: page }),

        // Workspaces
        currentWorkspace: 'alpha-product',
        currentWorkspaceId: 'alpha-product',
        setWorkspace: (workspaceId) => {
          set({ currentWorkspace: workspaceId, currentWorkspaceId: workspaceId });
          if (syncChannel) {
            syncChannel.postMessage({
              type: 'WORKSPACE_CHANGED',
              payload: { workspaceId },
            });
          }
        },
        workspaces: WORKSPACES,

        // Users
        currentUser: INITIAL_USERS[0],
        users: INITIAL_USERS,
        setCurrentUser: (user) => set({ currentUser: user }),
        setUserRole: (role) =>
          set((state) => ({
            currentUser: { ...state.currentUser, role },
            users: state.users.map((u) => (u.id === state.currentUser.id ? { ...u, role } : u)),
          })),

        // Tasks & Columns
        tasks: initialTasksMap,
        columnsByWorkspace: initialColumnsByWorkspace,

        // Workspace Tasks Filter Helper
        getWorkspaceTasks: () => {
          const { currentWorkspace, currentUser, tasks, columnsByWorkspace } = get();
          const wsCols = columnsByWorkspace[currentWorkspace] || { raw: [], ripening: [], harvested: [] };
          const orderedIds = [...wsCols.raw, ...wsCols.ripening, ...wsCols.harvested];
          
          const seen = new Set<string>();
          const result: Task[] = [];
          
          for (const id of orderedIds) {
            const t = tasks[id];
            if (t) {
              seen.add(id);
              result.push(t);
            }
          }

          for (const t of Object.values(tasks)) {
            if (t && t.workspaceId === currentWorkspace && !seen.has(t.id)) {
              seen.add(t.id);
              result.push(t);
            }
          }

          if (currentWorkspace === 'personal') {
            // Strictly return tasks where workspaceId === 'personal' AND assigneeId === currentUser.id
            return result.filter((t) => t.workspaceId === 'personal' && t.assigneeId === currentUser.id);
          }

          // For team workspaces, return all tasks in that workspace
          return result.filter((t) => t.workspaceId === currentWorkspace);
        },

        // Filters
        filterAssigneeId: 'all',
        filterPriority: 'all',
        searchQuery: '',
        setFilterAssignee: (id) => set({ filterAssigneeId: id }),
        setFilterPriority: (priority) => set({ filterPriority: priority }),
        setSearchQuery: (query) => set({ searchQuery: query }),

        broadcastAction: (action) => {
          if (syncChannel) {
            syncChannel.postMessage(action);
          }
        },

        // Task Mutations
        moveTask: (taskId, targetStage) => {
          const { currentUser, tasks, columnsByWorkspace, currentWorkspace, users, lifetimeStats } = get();
          if (currentUser.role === 'observer') return false;

          const task = tasks[taskId];
          if (!task) return false;

          const targetWs = (task.workspaceId || currentWorkspace) as WorkspaceId;
          const wsCols = columnsByWorkspace[targetWs] || { raw: [], ripening: [], harvested: [] };

          const nextWsCols: Record<ColumnId, string[]> = {
            raw: wsCols.raw.filter((id) => id !== taskId),
            ripening: wsCols.ripening.filter((id) => id !== taskId),
            harvested: wsCols.harvested.filter((id) => id !== taskId),
          };
          nextWsCols[targetStage] = [...nextWsCols[targetStage].filter((id) => id !== taskId), taskId];

          let updatedUser = currentUser;
          let earnedXp = 0;

          // If moving to 'harvested', compute earned XP with Team Bonus
          if (targetStage === 'harvested') {
            const isCollaborative =
              Boolean(task.creatorId && task.assigneeId && task.assigneeId !== task.creatorId) ||
              Boolean(task.pollinatedBonus && task.pollinatedBonus > 1.0);

            const multiplier = isCollaborative ? 1.25 : 1.0;
            earnedXp = Math.round(task.xp * multiplier);

            // Update user's virtue stats and total XP
            const taskVirtue = task.virtue || 'Intellect';
            const currentVirtueXp = currentUser.virtues[taskVirtue] || 0;

            updatedUser = {
              ...currentUser,
              totalXp: (currentUser.totalXp || 0) + earnedXp,
              virtues: {
                ...currentUser.virtues,
                [taskVirtue]: currentVirtueXp + earnedXp,
              },
            };
          }

          const updatedTask: Task = {
            ...task,
            stage: targetStage,
            completedAt: targetStage === 'harvested' ? Date.now() : null,
            progress: targetStage === 'harvested' ? 100 : targetStage === 'ripening' ? 50 : 0,
          };

          const nextLifetime = targetStage === 'harvested'
            ? {
                ...lifetimeStats,
                totalXP: lifetimeStats.totalXP + earnedXp,
                totalTasksHarvested: lifetimeStats.totalTasksHarvested + 1,
              }
            : lifetimeStats;

          set((state) => ({
            columnsByWorkspace: {
              ...columnsByWorkspace,
              [targetWs]: nextWsCols,
            },
            tasks: {
              ...tasks,
              [taskId]: updatedTask,
            },
            currentUser: updatedUser,
            users: state.users.map((u) => (u.id === updatedUser.id ? updatedUser : u)),
            lifetimeStats: nextLifetime,
          }));

          if (syncChannel) {
            syncChannel.postMessage({
              type: 'TASK_MOVED',
              payload: {
                taskId,
                targetStage,
                workspaceId: currentWorkspace,
                updatedTask,
                updatedUser,
              },
            });
          }

          return true;
        },

        createTask: (taskData) => {
          const { currentUser, tasks, columnsByWorkspace, currentWorkspace } = get();
          if (currentUser.role === 'observer') return null;

          const newId = `task-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
          const newTask: Task = {
            ...taskData,
            id: newId,
            createdAt: Date.now(),
            completedAt: null,
            progress: 0,
            stage: taskData.stage || 'raw',
            creatorId: currentUser.id,
            workspaceId: currentWorkspace,
          };

          const wsCols = columnsByWorkspace[currentWorkspace] || { raw: [], ripening: [], harvested: [] };

          set({
            tasks: { ...tasks, [newId]: newTask },
            columnsByWorkspace: {
              ...columnsByWorkspace,
              [currentWorkspace]: {
                ...wsCols,
                raw: [newId, ...wsCols.raw],
              },
            },
          });

          if (syncChannel) {
            syncChannel.postMessage({
              type: 'TASK_CREATED',
              payload: { task: newTask },
            });
          }

          return newTask;
        },

        updateTask: (taskId, updates) => {
          const { currentUser, tasks } = get();
          if (currentUser.role === 'observer') return false;
          if (!tasks[taskId]) return false;

          set({
            tasks: {
              ...tasks,
              [taskId]: { ...tasks[taskId], ...updates },
            },
          });
          return true;
        },

        deleteTask: (taskId) => {
          const { currentUser, tasks, columnsByWorkspace, currentWorkspace } = get();
          if (currentUser.role !== 'keeper') {
            if (typeof window !== 'undefined' && typeof window.alert === 'function') {
              window.alert('Permission denied: Only Workspace Admins can delete tasks.');
            }
            return false;
          }

          const wsCols = columnsByWorkspace[currentWorkspace];
          if (!wsCols) return false;

          const nextTasks = { ...tasks };
          delete nextTasks[taskId];

          const nextWsCols: Record<ColumnId, string[]> = {
            raw: wsCols.raw.filter((id) => id !== taskId),
            ripening: wsCols.ripening.filter((id) => id !== taskId),
            harvested: wsCols.harvested.filter((id) => id !== taskId),
          };

          set({
            tasks: nextTasks,
            columnsByWorkspace: {
              ...columnsByWorkspace,
              [currentWorkspace]: nextWsCols,
            },
          });
          return true;
        },

        reassignTask: (taskId, newAssigneeId) => {
          const { currentUser, tasks, teamGoals } = get();
          if (currentUser.role === 'observer') return false;
          const task = tasks[taskId];
          if (!task) return false;

          const bonus = 1.25;
          const updatedTask: Task = {
            ...task,
            assigneeId: newAssigneeId,
            pollinatedBonus: bonus,
            pollinatedBy: currentUser.id,
          };

          const updatedGoals = teamGoals.map((g) => {
            if (g.id === 'goal-2' && !g.completed) {
              const current = g.current + 1;
              return { ...g, current, completed: current >= g.target };
            }
            return g;
          });

          set({
            tasks: { ...tasks, [taskId]: updatedTask },
            teamGoals: updatedGoals,
          });

          if (syncChannel) {
            syncChannel.postMessage({
              type: 'TASK_REASSIGNED',
              payload: {
                taskId,
                newAssigneeId,
                bonus,
                byUserId: currentUser.id,
              },
            });
          }

          return true;
        },

        clearHarvestedTasks: () => {
          const {
            currentWorkspace,
            columnsByWorkspace,
            tasks,
            selectedRecipeId,
            customRecipes,
            blendHistory,
            users,
            lifetimeStats,
          } = get();

          const wsCols = columnsByWorkspace[currentWorkspace] || { raw: [], ripening: [], harvested: [] };
          const harvestedTasks = wsCols.harvested.map((id) => tasks[id]).filter(Boolean);

          if (harvestedTasks.length === 0) {
            set({ isCelebrating: false, celebrationData: null });
            return;
          }

          const recipe = customRecipes.find((r) => r.id === selectedRecipeId) || customRecipes[0];
          const rawVirtues: Record<Virtue, number> = {
            Intellect: 0,
            Resilience: 0,
            Discipline: 0,
            Harmony: 0,
            Vitality: 0,
          };

          let totalBaseXp = 0;
          for (const t of harvestedTasks) {
            const mult = t.pollinatedBonus || 1.0;
            totalBaseXp += Math.round(t.xp * mult);
            for (const v of VIRTUES) {
              rawVirtues[v] += t.virtueWeights[v] || 0;
            }
          }

          const sumWeights = Object.values(rawVirtues).reduce((a, b) => a + b, 0);
          const normalizedVirtues: Record<Virtue, number> = { ...rawVirtues };
          if (sumWeights > 0) {
            for (const v of VIRTUES) {
              normalizedVirtues[v] = Math.round((rawVirtues[v] / sumWeights) * 100);
            }
          } else {
            normalizedVirtues.Intellect = 50;
            normalizedVirtues.Discipline = 30;
            normalizedVirtues.Harmony = 20;
          }

          const batchNumber = `MG-${109 + blendHistory.length}`;
          const newArchiveItem: TetrapackArchiveItem = {
            id: `pack-${Date.now()}`,
            batchNumber,
            title: `${recipe.name} — Batch #${batchNumber}`,
            date: new Date().toISOString().split('T')[0],
            recipeName: recipe.name,
            recipeId: recipe.id,
            totalXp: totalBaseXp || 250,
            taskCount: harvestedTasks.length,
            virtues: normalizedVirtues,
            participants: users.slice(0, 3),
            rating: 5,
          };

          const nextWsCols: Record<ColumnId, string[]> = {
            ...wsCols,
            harvested: [],
          };

          const nextLifetime: LifetimeStats = {
            ...lifetimeStats,
            totalShakes: lifetimeStats.totalShakes + 1,
            totalXP: lifetimeStats.totalXP + (totalBaseXp || 250),
            totalTasksHarvested: lifetimeStats.totalTasksHarvested + harvestedTasks.length,
          };

          set({
            columnsByWorkspace: {
              ...columnsByWorkspace,
              [currentWorkspace]: nextWsCols,
            },
            blendHistory: [newArchiveItem, ...blendHistory],
            archive: [newArchiveItem, ...blendHistory],
            lifetimeStats: nextLifetime,
            isCelebrating: false,
            celebrationData: null,
          });

          if (syncChannel) {
            syncChannel.postMessage({
              type: 'CLEAR_HARVESTED',
              payload: {
                workspaceId: currentWorkspace,
                newArchiveItem,
                updatedLifetimeStats: nextLifetime,
              },
            });
          }
        },

        // Blend History & Archive
        blendHistory: INITIAL_ARCHIVE,
        archive: INITIAL_ARCHIVE,

        // Celebration
        isCelebrating: false,
        celebrationData: null,

        triggerHarvestCelebration: (recipeId) => {
          const {
            tasks,
            columnsByWorkspace,
            currentWorkspace,
            selectedRecipeId,
            customRecipes,
            blendHistory,
            users,
          } = get();

          const activeRecipeId = recipeId || selectedRecipeId;
          const recipe = customRecipes.find((r) => r.id === activeRecipeId) || customRecipes[0];
          const wsCols = columnsByWorkspace[currentWorkspace] || { raw: [], ripening: [], harvested: [] };
          const harvestedTasks = wsCols.harvested.map((id) => tasks[id]).filter(Boolean);

          const rawVirtues: Record<Virtue, number> = {
            Intellect: 0,
            Resilience: 0,
            Discipline: 0,
            Harmony: 0,
            Vitality: 0,
          };

          let totalBaseXp = 0;
          for (const t of harvestedTasks) {
            const mult = t.pollinatedBonus || 1.0;
            totalBaseXp += Math.round(t.xp * mult);
            for (const v of VIRTUES) {
              rawVirtues[v] += t.virtueWeights[v] || 0;
            }
          }

          const sumWeights = Object.values(rawVirtues).reduce((a, b) => a + b, 0);
          const normalizedVirtues: Record<Virtue, number> = { ...rawVirtues };
          if (sumWeights > 0) {
            for (const v of VIRTUES) {
              normalizedVirtues[v] = Math.round((rawVirtues[v] / sumWeights) * 100);
            }
          } else {
            normalizedVirtues.Intellect = 50;
            normalizedVirtues.Discipline = 30;
            normalizedVirtues.Harmony = 20;
          }

          const batchNumber = `MG-${109 + blendHistory.length}`;

          set({
            isCelebrating: true,
            celebrationData: {
              recipe,
              harvestedTasks: harvestedTasks.length > 0 ? harvestedTasks : [tasks['task-4']],
              sessionVirtues: normalizedVirtues,
              xpGained: totalBaseXp || 250,
              batchNumber,
            },
          });

          if (syncChannel) {
            syncChannel.postMessage({
              type: 'HARVEST_CELEBRATION',
              payload: { recipeId: recipe.id, workspaceId: currentWorkspace },
            });
          }
        },

        closeCelebration: () => {
          set({ isCelebrating: false, celebrationData: null });
        },

        // Team Goals
        teamGoals: INITIAL_TEAM_GOALS,
        claimGoalReward: (goalId) => {
          const { teamGoals, lifetimeStats, currentUser } = get();
          const goal = teamGoals.find((g) => g.id === goalId);
          if (!goal || !goal.completed || goal.claimed) return;

          set((state) => ({
            teamGoals: teamGoals.map((g) => (g.id === goalId ? { ...g, claimed: true } : g)),
            currentUser: {
              ...currentUser,
              totalXp: (currentUser.totalXp || 0) + goal.rewardXp,
            },
            lifetimeStats: {
              ...lifetimeStats,
              totalXP: lifetimeStats.totalXP + goal.rewardXp,
            },
          }));
        },

        selectedRecipeId: 'recipe-focus-nectar',
        setSelectedRecipeId: (id) => set({ selectedRecipeId: id }),
        customRecipes: BLEND_RECIPES,
        addCustomRecipe: (recipe) =>
          set((state) => ({ customRecipes: [recipe, ...state.customRecipes] })),

        lifetimeStats: {
          virtues: { Intellect: 350, Resilience: 210, Discipline: 480, Harmony: 190, Vitality: 150 },
          totalShakes: 12,
          totalXP: 1480,
          totalTasksHarvested: 24,
        },
        addLifetimeStats: (xp, virtues, taskCount) =>
          set((state) => {
            const nextVirtues = { ...state.lifetimeStats.virtues };
            for (const v of VIRTUES) {
              nextVirtues[v] += virtues[v] || 0;
            }
            return {
              lifetimeStats: {
                virtues: nextVirtues,
                totalShakes: state.lifetimeStats.totalShakes + 1,
                totalXP: state.lifetimeStats.totalXP + xp,
                totalTasksHarvested: state.lifetimeStats.totalTasksHarvested + taskCount,
              },
            };
          }),
      };
    },
    {
      name: 'mango_harvest_phase2_state',
      partialize: (state) => ({
        currentWorkspace: state.currentWorkspace,
        currentWorkspaceId: state.currentWorkspaceId,
        tasks: state.tasks,
        columnsByWorkspace: state.columnsByWorkspace,
        lifetimeStats: state.lifetimeStats,
        blendHistory: state.blendHistory,
        archive: state.archive,
        teamGoals: state.teamGoals,
        selectedRecipeId: state.selectedRecipeId,
      }),
    }
  )
);

export const useGardenStore = useStore;
export default useStore;
