import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useGardenStore } from '../store/useGardenStore';
import { ColumnId, Task, Virtue } from '../types/garden';

// Simulated latency to demonstrate React Query loading and caching states
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function useWorkspaceTasks(workspaceId: string) {
  const store = useGardenStore();

  return useQuery({
    queryKey: ['workspace-tasks', workspaceId],
    queryFn: async () => {
      await delay(80);
      const wsCols = store.columnsByWorkspace[workspaceId] || { raw: [], ripening: [], harvested: [] };
      const allIds = [...wsCols.raw, ...wsCols.ripening, ...wsCols.harvested];
      return allIds.map((id) => store.tasks[id]).filter(Boolean);
    },
    staleTime: 1000 * 30, // 30 seconds
  });
}

export function useTeamVirtueMetrics() {
  const store = useGardenStore();

  return useQuery({
    queryKey: ['team-virtue-metrics', store.currentWorkspaceId],
    queryFn: async () => {
      await delay(100);
      // Compute virtue metrics across tasks in current workspace
      const wsCols = store.columnsByWorkspace[store.currentWorkspaceId] || { raw: [], ripening: [], harvested: [] };
      const allIds = [...wsCols.raw, ...wsCols.ripening, ...wsCols.harvested];
      const tasks = allIds.map((id) => store.tasks[id]).filter(Boolean);

      const teamVirtues: Record<Virtue, number> = {
        Intellect: 0,
        Resilience: 0,
        Discipline: 0,
        Harmony: 0,
        Vitality: 0,
      };

      for (const t of tasks) {
        for (const [v, weight] of Object.entries(t.virtueWeights)) {
          teamVirtues[v as Virtue] += weight;
        }
      }

      return {
        teamVirtues,
        taskCount: tasks.length,
        ripeningCount: wsCols.ripening.length,
        harvestedCount: wsCols.harvested.length,
        totalXp: tasks.reduce((sum, t) => sum + t.xp, 0),
      };
    },
    staleTime: 1000 * 10,
  });
}

export function useOptimisticMoveTask() {
  const queryClient = useQueryClient();
  const store = useGardenStore();

  return useMutation({
    mutationFn: async ({ taskId, targetCol }: { taskId: string; targetCol: ColumnId }) => {
      const success = store.moveTask(taskId, targetCol);
      if (!success) throw new Error('Task move failed (check permissions).');
      return { taskId, targetCol };
    },
    onMutate: async ({ taskId, targetCol }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['workspace-tasks', store.currentWorkspaceId] });

      // Snapshot previous value
      const previousTasks = queryClient.getQueryData<Task[]>(['workspace-tasks', store.currentWorkspaceId]);

      // Optimistically update
      if (previousTasks) {
        queryClient.setQueryData<Task[]>(
          ['workspace-tasks', store.currentWorkspaceId],
          previousTasks.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  progress: targetCol === 'harvested' ? 100 : targetCol === 'ripening' ? 50 : 0,
                  completedAt: targetCol === 'harvested' ? Date.now() : null,
                }
              : t
          )
        );
      }

      return { previousTasks };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(['workspace-tasks', store.currentWorkspaceId], context.previousTasks);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace-tasks', store.currentWorkspaceId] });
      queryClient.invalidateQueries({ queryKey: ['team-virtue-metrics', store.currentWorkspaceId] });
    },
  });
}
