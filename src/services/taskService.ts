import { supabase } from '../lib/supabase';
import type { CategoryKey } from '../types';

export type DBTaskItem = {
  id: string;
  organization_id: string;
  name: string;
  category_key: CategoryKey;
  category_label: string;
  progress_percent: number;
  checked_state: Record<number, boolean>;
  created_at?: string;
};

// Fetch daftar task milik organisasi dari Supabase
export async function getOrgTasks(organizationId: string): Promise<DBTaskItem[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching org tasks:', error);
    return [];
  }

  return (data || []).map((t) => ({
    id: t.id,
    organization_id: t.organization_id,
    name: t.name,
    category_key: t.category_key as CategoryKey,
    category_label: t.category_label,
    progress_percent: t.progress_percent || 0,
    checked_state: t.checked_state || {},
    created_at: t.created_at,
  }));
}

// Buat Task Baru di Supabase
export async function createOrgTask(
  organizationId: string,
  name: string,
  categoryKey: CategoryKey,
  categoryLabel: string
): Promise<DBTaskItem | null> {
  const { data, error } = await supabase
    .from('tasks')
    .insert([
      {
        organization_id: organizationId,
        name,
        category_key: categoryKey,
        category_label: categoryLabel,
        progress_percent: 0,
        checked_state: {},
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating org task:', error);
    throw new Error(error.message);
  }

  return {
    id: data.id,
    organization_id: data.organization_id,
    name: data.name,
    category_key: data.category_key as CategoryKey,
    category_label: data.category_label,
    progress_percent: data.progress_percent || 0,
    checked_state: data.checked_state || {},
    created_at: data.created_at,
  };
}

// Update Checklist & Progress Task di Supabase
export async function updateOrgTaskProgress(
  taskId: string,
  checkedState: Record<number, boolean>,
  progressPercent: number
) {
  const { error } = await supabase
    .from('tasks')
    .update({
      checked_state: checkedState,
      progress_percent: progressPercent,
      updated_at: new Date().toISOString(),
    })
    .eq('id', taskId);

  if (error) {
    console.error('Error updating task progress:', error);
  }
}

// Hapus Task dari Supabase
export async function deleteOrgTask(taskId: string) {
  const { error } = await supabase.from('tasks').delete().eq('id', taskId);
  if (error) {
    console.error('Error deleting task:', error);
    throw new Error(error.message);
  }
}