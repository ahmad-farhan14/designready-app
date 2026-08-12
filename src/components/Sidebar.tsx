import { Plus, Trash2, Users, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { WorkspaceSwitcher } from './WorkspaceSwitcher';

type TaskItem = {
  id: string;
  name: string;
  categoryLabel: string;
  progressPercent: number;
  isActive: boolean;
};

type SidebarProps = {
  tasks: TaskItem[];
  activeTaskId: string | null;
  currentOrgId: string | null;
  showTeamSettings: boolean;
  subscriptionTier: 'starter' | 'pro' | 'enterprise';
  onSelectWorkspace: (orgId: string | null, orgName: string) => void;
  onSelectTask: (id: string) => void;
  onOpenTeamSettings: () => void;
  onCreateTask: () => void;
  onRequestDeleteTask: (id: string) => void;
  onOpenPricing: () => void;
};

export function Sidebar({
  tasks,
  currentOrgId,
  showTeamSettings,
  subscriptionTier,
  onSelectWorkspace,
  onSelectTask,
  onOpenTeamSettings,
  onCreateTask,
  onRequestDeleteTask,
  onOpenPricing,
}: SidebarProps) {
  const [userEmail, setUserEmail] = useState<string>('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) setUserEmail(user.email);
    });
  }, []);

  return (
    <div className="flex h-full flex-col justify-between rounded-3xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-xl p-4 shadow-xl">
      <div className="space-y-6">
        {/* Dropdown Workspace Switcher */}
        <WorkspaceSwitcher
          currentOrgId={currentOrgId}
          subscriptionTier={subscriptionTier}
          onSelectWorkspace={onSelectWorkspace}
          onOpenPricing={onOpenPricing}
        />

        {/* Menu Navigasi Pengaturan Tim (Tampak saat berada di Enterprise Workspace) */}
        {currentOrgId && (
          <div className="space-y-1">
            <button
              type="button"
              onClick={onOpenTeamSettings}
              className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-xs font-semibold transition ${
                showTeamSettings
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/20'
                  : 'bg-slate-950/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800/80'
              }`}
            >
              <Users className="h-4 w-4" /> Pengaturan Tim
            </button>
          </div>
        )}

        {/* Section Pipeline Task */}
        <div>
          <div className="flex items-center justify-between px-1 mb-3">
            <div>
              <h3 className="text-xs font-bold text-white tracking-tight">Pipeline Task</h3>
              <p className="text-[10px] text-slate-400">{tasks.length} task aktif</p>
            </div>
            <button
              type="button"
              onClick={onCreateTask}
              className="flex h-7 w-7 items-center justify-center rounded-xl bg-violet-600 text-white hover:bg-violet-500 transition shadow-md shadow-violet-600/20"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
            {tasks.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-800 p-6 text-center">
                <p className="text-xs text-slate-500">Belum ada task.</p>
                <p className="text-[10px] text-slate-600 mt-1">Klik + untuk membuat task baru.</p>
              </div>
            ) : (
              tasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => onSelectTask(task.id)}
                  className={`group relative flex cursor-pointer items-center justify-between rounded-2xl border p-3 transition ${
                    task.isActive && !showTeamSettings
                      ? 'border-violet-500/50 bg-violet-500/10 text-white shadow-md'
                      : 'border-slate-800/80 bg-slate-950/50 text-slate-400 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <p className="truncate text-xs font-bold text-white">{task.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[9px] font-bold text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded-full border border-violet-500/20">
                        {task.categoryLabel}
                      </span>
                      <span className="text-[10px] font-medium text-slate-400">
                        {task.progressPercent}%
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRequestDeleteTask(task.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 rounded-xl p-1.5 text-slate-500 hover:bg-rose-500/20 hover:text-rose-400 transition"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Footer Profil User */}
      <div className="border-t border-slate-800/80 pt-4 mt-auto">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-800/80 bg-slate-950/80 p-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-violet-500/20 text-violet-300 border border-violet-500/30">
            <User className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-white">{userEmail || 'Memuat akun...'}</p>
            <p className="text-[10px] text-violet-300 font-medium truncate">
              {currentOrgId
                ? 'Enterprise Member'
                : subscriptionTier === 'pro'
                ? 'Pro Studio'
                : subscriptionTier === 'enterprise'
                ? 'Enterprise Owner'
                : 'Free Studio'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}