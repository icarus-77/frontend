import { describe, it, expect, beforeEach } from 'vitest';
import { useGardenStore } from '../store/useGardenStore';
import { getRankTitle, INITIAL_USERS } from '../constants/gardenConstants';

describe('Mango Harvest Gamification & Virtue Engine', () => {
  it('correctly calculates rank progression based on total harvests', () => {
    expect(getRankTitle(0).title).toBe('Seedling');
    expect(getRankTitle(1).title).toBe('Harvest Hand');
    expect(getRankTitle(3).title).toBe('Sun Tender');
    expect(getRankTitle(6).title).toBe('Ripe Picker');
    expect(getRankTitle(10).title).toBe('Master Blender');
    expect(getRankTitle(25).title).toBe('Mango Sage');
  });
});

describe('Zustand State & RBAC Permissions', () => {
  beforeEach(() => {
    useGardenStore.setState({
      currentUser: INITIAL_USERS[0], // Aman - Admin
    });
  });

  it('allows Member and Admin to move tasks across columns', () => {
    const store = useGardenStore.getState();
    const task = store.tasks['task-1'];
    expect(task).toBeDefined();

    const moved = store.moveTask('task-1', 'ripening');
    expect(moved).toBe(true);

    const updatedCols = useGardenStore.getState().columnsByWorkspace[store.currentWorkspaceId];
    expect(updatedCols.ripening).toContain('task-1');
    expect(updatedCols.raw).not.toContain('task-1');
  });

  it('enforces RBAC: Observer cannot move tasks (Read-Only)', () => {
    const store = useGardenStore.getState();
    store.setUserRole('observer');

    const moved = store.moveTask('task-1', 'harvested');
    expect(moved).toBe(false);
  });

  it('attaches 1.25x XP multiplier upon Task Reassignment', () => {
    const store = useGardenStore.getState();
    store.setUserRole('harvester');

    const success = store.reassignTask('task-1', 'user-maya');
    expect(success).toBe(true);

    const task = useGardenStore.getState().tasks['task-1'];
    expect(task.assigneeId).toBe('user-maya');
    expect(task.pollinatedBonus).toBe(1.25);
  });

  it('enforces RBAC: Member cannot delete tasks, but Admin can', () => {
    const store = useGardenStore.getState();

    // Member tries to delete
    store.setUserRole('harvester');
    const deleteAttempt = store.deleteTask('task-3');
    expect(deleteAttempt).toBe(false);
    expect(useGardenStore.getState().tasks['task-3']).toBeDefined();

    // Admin deletes
    store.setUserRole('keeper');
    const keeperDelete = store.deleteTask('task-3');
    expect(keeperDelete).toBe(true);
    expect(useGardenStore.getState().tasks['task-3']).toBeUndefined();
  });

  it('correctly clears harvested tasks and logs to archive upon session collection', () => {
    const store = useGardenStore.getState();
    const initialArchiveCount = store.archive.length;

    // Clear harvested tasks
    store.clearHarvestedTasks();

    const stateAfter = useGardenStore.getState();
    expect(stateAfter.columnsByWorkspace[store.currentWorkspaceId].harvested.length).toBe(0);
    expect(stateAfter.archive.length).toBe(initialArchiveCount + 1);
  });
});
