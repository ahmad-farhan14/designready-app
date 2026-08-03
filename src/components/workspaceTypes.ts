import type { CategoryKey } from '../types';

export type ChecklistState = Record<CategoryKey, Record<number, boolean>>;

export type CategoryProgress = {
  checkedCount: number;
  totalItems: number;
  progressPercent: number;
};

export type WorkspaceTask = {
  id: string;
  name: string;
  categoryKey: CategoryKey;
  checkedState: ChecklistState;
  createdAt: number;
};
