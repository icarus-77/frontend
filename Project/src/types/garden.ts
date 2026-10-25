export type Virtue = 'Intellect' | 'Resilience' | 'Discipline' | 'Harmony' | 'Vitality';

export type Difficulty = 'Easy' | 'Medium' | 'Hard' | 'EASY' | 'MEDIUM' | 'HARD';

export type ColumnId = 'raw' | 'ripening' | 'harvested';

export type TaskStage = ColumnId;

export type UserRole = 'keeper' | 'harvester' | 'observer';

export type WorkspaceId = 'personal' | 'alpha-product' | 'design-growth';

export interface User {
  id: string;
  name: string;
  avatar: string;
  role: UserRole;
  color: string;
  title: string;
  status: 'active' | 'idle';
  totalXp: number;
  virtues: Record<Virtue, number>;
  unlockedBadges?: string[];
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  tags: string[];
  difficulty: Difficulty;
  virtue: Virtue;
  virtueWeights: Record<Virtue, number>;
  xp: number;
  templateType: string;
  estimatedMinutes: number;
  createdAt: number;
  completedAt: number | null;
  assigneeId?: string;
  creatorId?: string;
  stage: ColumnId; // 'raw' | 'ripening' | 'harvested'
  pollinatedBonus?: number; // Reassignment bonus multiplier (e.g. 1.25)
  pollinatedBy?: string;
  startDate?: string;
  dueDate?: string;
  progress?: number;
  workspaceId: WorkspaceId;
}

export interface Workspace {
  id: WorkspaceId;
  name: string;
  type: 'personal' | 'team';
  description: string;
  icon: string;
  memberIds: string[];
}

export interface TeamGoal {
  id: string;
  title: string;
  description: string;
  virtue: Virtue;
  target: number;
  current: number;
  rewardXp: number;
  completed: boolean;
  claimed: boolean;
}

export interface BlendRecipe {
  id: string;
  name: string;
  flavorNotes: string;
  color: string;
  bgGradient: string;
  minRatios: Partial<Record<Virtue, number>>;
  tagline: string;
}

export interface TetrapackArchiveItem {
  id: string;
  batchNumber: string;
  title: string;
  date: string;
  recipeName: string;
  recipeId: string;
  totalXp: number;
  taskCount: number;
  virtues: Record<Virtue, number>;
  participants: User[];
  rating: number;
}

export interface LifetimeStats {
  virtues: Record<Virtue, number>;
  totalShakes: number;
  totalXP: number;
  totalTasksHarvested: number;
}

export interface GamificationProfile {
  level: number;
  currentLevelXp: number;
  nextLevelXp: number;
  progressPercent: number;
  designationTitle: string;
  dominantVirtue: Virtue;
  virtueLevels: Record<Virtue, { level: number; xp: number; title: string }>;
  unlockedBadges: { id: string; name: string; description: string; icon: string; unlocked: boolean }[];
}
