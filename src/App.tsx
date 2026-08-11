import type { Session } from '@supabase/supabase-js';
import { Plus, X, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ChecklistArea } from './components/ChecklistArea';
import { ConfirmDeleteModal } from './components/ConfirmDeleteModal';
import { LoginPage } from './components/LoginPage';
import { PanduanUkuran } from './components/PanduanUkuran';
import { PricingModal } from './components/PricingModal';
import { Sidebar } from './components/Sidebar';
import { TeamSettingsPage } from './components/TeamSettingsPage';
import { CHECKLIST_ITEMS } from './data';
import { supabase } from './lib/supabase';
import { createOrgTask, deleteOrgTask, getOrgTasks, updateOrgTaskProgress } from './services/taskService';
import type { CategoryKey } from './types';

const TASKS_STORAGE_KEY = 'designready_app_tasks_v1';
const ACTIVE_TASK_KEY = 'designready_app_active_task_v1';
const CUSTOM_CHECKLIST_STORAGE_KEY = 'designready_enterprise_custom_checklist_v1';

type TaskItem = {
  id: string;
  name: string;
  categoryKey: CategoryKey;
  categoryLabel: string;
  progressPercent: number;
  isActive: boolean;
  checkedState: Record<number, boolean>;
};

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // State Enterprise Workspace
  const [currentOrgId, setCurrentOrgId] = useState<string | null>(null);
  const [currentOrgName, setCurrentOrgName] = useState<string>('Personal Workspace');
  const [showTeamSettings, setShowTeamSettings] = useState(false);

  // State Task Lokal (Personal)
  const [personalTasks, setPersonalTasks] = useState<TaskItem[]>(() => {
    try {
      const saved = localStorage.getItem(TASKS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // State Task Organisasi (Enterprise)
  const [orgTasks, setOrgTasks] = useState<TaskItem[]>([]);

  // Task aktif memilih antara Personal vs Enterprise
  const tasks = currentOrgId ? orgTasks : personalTasks;

  const [activeTaskId, setActiveTaskId] = useState<string | null>(() => {
    try {
      return localStorage.getItem(ACTIVE_TASK_KEY) || null;
    } catch {
      return null;
    }
  });

  // State Modal
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<TaskItem | null>(null);

  // Form State Buat Task Baru
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState<CategoryKey>('ui-ux');

  // Helper membaca kriteria (Default + Custom Master Checklist Studio jika Enterprise)
  const getActiveChecklistItems = (categoryKey: CategoryKey): string[] => {
    const defaultItems = CHECKLIST_ITEMS[categoryKey] ?? [];

    if (currentOrgId) {
      try {
        const savedCustom = localStorage.getItem(CUSTOM_CHECKLIST_STORAGE_KEY);
        if (savedCustom) {
          const parsed = JSON.parse(savedCustom);
          const customItems = parsed[categoryKey] || [];
          return [...defaultItems, ...customItems];
        }
      } catch {
        return defaultItems;
      }
    }

    return defaultItems;
  };

  // Supabase Auth Listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Simpan personal tasks ke localStorage
  useEffect(() => {
    try {
      localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(personalTasks));
    } catch (err) {
      console.error('Gagal menyimpan task ke localStorage', err);
    }
  }, [personalTasks]);

  // Sync Task Perusahaan dari Supabase saat Switch Workspace
  useEffect(() => {
    if (!currentOrgId) return;

    let isMounted = true;
    async function loadTasks() {
      const dbTasks = await getOrgTasks(currentOrgId!);
      if (isMounted) {
        const mapped: TaskItem[] = dbTasks.map((t) => ({
          id: t.id,
          name: t.name,
          categoryKey: t.category_key,
          categoryLabel: t.category_label,
          progressPercent: t.progress_percent,
          isActive: true,
          checkedState: t.checked_state,
        }));
        setOrgTasks(mapped);

        // Menggunakan functional update agar activeTaskId tidak perlu masuk dependency array
        setActiveTaskId((prevActiveId) => prevActiveId || (mapped[0]?.id ?? null));
      }
    }

    loadTasks();
    return () => {
      isMounted = false;
    };
  }, [currentOrgId]);

  // Simpan activeTaskId ke localStorage
  useEffect(() => {
    try {
      if (activeTaskId) {
        localStorage.setItem(ACTIVE_TASK_KEY, activeTaskId);
      } else {
        localStorage.removeItem(ACTIVE_TASK_KEY);
      }
    } catch (err) {
      console.error('Gagal menyimpan activeTaskId ke localStorage', err);
    }
  }, [activeTaskId]);

  const handleSelectWorkspace = (orgId: string | null, orgName: string) => {
    setCurrentOrgId(orgId);
    setCurrentOrgName(orgName);
    setShowTeamSettings(Boolean(orgId));
    setActiveTaskId(null);
  };

  // Handler Buat Task Baru
  const handleCreateTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskName.trim()) return;

    const categoryLabels: Record<CategoryKey, string> = {
      'ui-ux': 'UI/UX HANDOFF',
      social: 'ASET MEDIA SOSIAL',
      branding: 'BRANDING & LOGO',
    };

    if (currentOrgId) {
      // 1. Simpan ke Supabase jika Enterprise Workspace
      try {
        const created = await createOrgTask(
          currentOrgId,
          newTaskName.trim(),
          newTaskCategory,
          categoryLabels[newTaskCategory]
        );

        if (created) {
          const newTask: TaskItem = {
            id: created.id,
            name: created.name,
            categoryKey: created.category_key,
            categoryLabel: created.category_label,
            progressPercent: 0,
            isActive: true,
            checkedState: {},
          };

          setOrgTasks((prev) => [newTask, ...prev]);
          setActiveTaskId(created.id);
        }
      } catch (err) {
        console.error('Gagal membuat task perusahaan', err);
      }
    } else {
      // 2. Simpan di local state jika Personal Workspace
      const newTaskId = `task-${Date.now()}`;
      const newTask: TaskItem = {
        id: newTaskId,
        name: newTaskName.trim(),
        categoryKey: newTaskCategory,
        categoryLabel: categoryLabels[newTaskCategory],
        progressPercent: 0,
        isActive: true,
        checkedState: {},
      };

      setPersonalTasks((prev) => [newTask, ...prev]);
      setActiveTaskId(newTaskId);
    }

    setNewTaskName('');
    setIsCreateTaskOpen(false);
    setShowTeamSettings(false);
  };

  // Handler Toggle Item Checklist
  const handleToggleItem = (index: number) => {
    if (!activeTaskId) return;

    const updateState = (prevTasks: TaskItem[]) =>
      prevTasks.map((t) => {
        if (t.id !== activeTaskId) return t;

        const updatedChecked = {
          ...t.checkedState,
          [index]: !t.checkedState[index],
        };

        const currentItems = getActiveChecklistItems(t.categoryKey);
        const totalItems = currentItems.length;
        const checkedCount = Object.values(updatedChecked).filter(Boolean).length;
        const progress = totalItems === 0 ? 0 : Math.round((checkedCount / totalItems) * 100);

        if (currentOrgId) {
          updateOrgTaskProgress(t.id, updatedChecked, progress);
        }

        return {
          ...t,
          checkedState: updatedChecked,
          progressPercent: progress,
        };
      });

    if (currentOrgId) {
      setOrgTasks(updateState);
    } else {
      setPersonalTasks(updateState);
    }
  };

  // Handler Reset Checklist
  const handleResetChecklist = () => {
    if (!activeTaskId) return;

    const resetState = (prevTasks: TaskItem[]) =>
      prevTasks.map((t) => {
        if (t.id !== activeTaskId) return t;

        if (currentOrgId) {
          updateOrgTaskProgress(t.id, {}, 0);
        }

        return { ...t, checkedState: {}, progressPercent: 0 };
      });

    if (currentOrgId) {
      setOrgTasks(resetState);
    } else {
      setPersonalTasks(resetState);
    }
  };

  // Handler Minta Hapus Task
  const handleRequestDeleteTask = (id: string) => {
    const target = tasks.find((t) => t.id === id);
    if (!target) return;
    setTaskToDelete(target);
    setIsDeleteModalOpen(true);
  };

  // Handler Konfirmasi Hapus Task
  const handleConfirmDeleteTask = async () => {
    if (!taskToDelete) return;

    if (currentOrgId) {
      try {
        await deleteOrgTask(taskToDelete.id);
        setOrgTasks((prev) => {
          const remaining = prev.filter((t) => t.id !== taskToDelete.id);
          if (remaining.length === 0) {
            setActiveTaskId(null);
          } else if (activeTaskId === taskToDelete.id) {
            setActiveTaskId(remaining[0].id);
          }
          return remaining;
        });
      } catch (err) {
        console.error('Gagal menghapus task perusahaan', err);
      }
    } else {
      setPersonalTasks((prev) => {
        const remaining = prev.filter((t) => t.id !== taskToDelete.id);
        if (remaining.length === 0) {
          setActiveTaskId(null);
        } else if (activeTaskId === taskToDelete.id) {
          setActiveTaskId(remaining[0].id);
        }
        return remaining;
      });
    }

    setIsDeleteModalOpen(false);
    setTaskToDelete(null);
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center text-xs font-semibold">Memuat...</div>;
  }

  if (!session) {
    return <LoginPage />;
  }

  const activeTask = tasks.find((t) => t.id === activeTaskId) ?? tasks[0] ?? null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-violet-500 selection:text-white">
      {/* Modal Konfirmasi Hapus Task Custom */}
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        title="Hapus Task Pipeline?"
        description="Apakah kamu yakin ingin menghapus task ini? Semua progress checklist task ini akan dihapus secara permanen."
        itemName={taskToDelete ? `Task: ${taskToDelete.name}` : undefined}
        onConfirm={handleConfirmDeleteTask}
        onCancel={() => {
          setIsDeleteModalOpen(false);
          setTaskToDelete(null);
        }}
      />

      {/* Modal Buat Task Baru Custom */}
      {isCreateTaskOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <button
              type="button"
              onClick={() => setIsCreateTaskOpen(false)}
              className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
            >
              <X className="h-4 w-4" />
            </button>

            <h3 className="text-xl font-bold text-white mb-1">Buat Task Baru</h3>
            <p className="text-xs text-slate-400 mb-5">
              Masukkan nama proyek dan pilih jenis kategori checklist QC.
            </p>

            <form onSubmit={handleCreateTaskSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Nama Task / Proyek *</label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="cth: UI UX App / Logo Baru / Feeds Instagram..."
                  value={newTaskName}
                  onChange={(e) => setNewTaskName(e.target.value)}
                  className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-xs text-white placeholder-slate-500 outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">Kategori Jenis Desain (QC)</label>
                <div className="space-y-2">
                  {[
                    { key: 'ui-ux', label: 'UI/UX HANDOFF' },
                    { key: 'social', label: 'ASET MEDIA SOSIAL' },
                    { key: 'branding', label: 'BRANDING & LOGO' },
                  ].map((cat) => {
                    const isSelected = newTaskCategory === cat.key;
                    return (
                      <button
                        key={cat.key}
                        type="button"
                        onClick={() => setNewTaskCategory(cat.key as CategoryKey)}
                        className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition ${
                          isSelected
                            ? 'border-violet-500/50 bg-violet-500/10 text-white'
                            : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:bg-slate-900'
                        }`}
                      >
                        <div
                          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                            isSelected ? 'border-violet-400 bg-violet-500' : 'border-slate-600'
                          }`}
                        >
                          {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                        </div>
                        <span className="text-xs font-semibold">{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCreateTaskOpen(false)}
                  className="flex-1 rounded-2xl border border-slate-800 bg-slate-800/50 py-3 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-2xl bg-violet-600 py-3 text-xs font-semibold text-white hover:bg-violet-500 transition shadow-lg shadow-violet-600/20"
                >
                  Buat Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header Utama */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-extrabold text-white tracking-tight">DesignReady</h1>
            <span className="text-[10px] bg-violet-500/20 text-violet-300 border border-violet-500/30 px-2 py-0.5 rounded-full font-bold">
              {currentOrgId ? 'ENTERPRISE' : 'PRO STUDIO'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsPricingOpen(true)}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 transition flex items-center gap-1.5"
            >
              <Sparkles className="h-3.5 w-3.5" /> Upgrade Pro
            </button>
            <button
              type="button"
              onClick={() => supabase.auth.signOut()}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-xl border border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white transition"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace Grid */}
      <main className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Sidebar dengan Workspace Switcher */}
        <div className="lg:col-span-3">
          <Sidebar
            tasks={tasks.map((t) => ({
              ...t,
              isActive: t.id === activeTask?.id && !showTeamSettings,
            }))}
            activeTaskId={activeTask?.id ?? null}
            currentOrgId={currentOrgId}
            showTeamSettings={showTeamSettings}
            onSelectWorkspace={handleSelectWorkspace}
            onSelectTask={(id) => {
              setActiveTaskId(id);
              setShowTeamSettings(false);
            }}
            onOpenTeamSettings={() => setShowTeamSettings(true)}
            onCreateTask={() => setIsCreateTaskOpen(true)}
            onRequestDeleteTask={handleRequestDeleteTask}
          />
        </div>

        {/* Center Column: Halaman Tim atau Area Checklist Task */}
        <div className="lg:col-span-6">
          {showTeamSettings && currentOrgId ? (
            <TeamSettingsPage
              organizationId={currentOrgId}
              organizationName={currentOrgName}
            />
          ) : activeTask ? (
            <ChecklistArea
              taskId={activeTask.id}
              taskName={activeTask.name}
              categoryLabel={activeTask.categoryLabel}
              items={getActiveChecklistItems(activeTask.categoryKey)}
              checkedState={activeTask.checkedState}
              onToggleItem={handleToggleItem}
              onReset={handleResetChecklist}
            />
          ) : (
            <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-8 text-center flex flex-col items-center justify-center min-h-87.5">
              <div className="h-12 w-12 rounded-2xl bg-violet-500/10 text-violet-400 border border-violet-500/20 flex items-center justify-center mb-3">
                <Plus className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Belum Ada Task Aktif</h3>
              <p className="text-xs text-slate-400 max-w-xs mt-1 mb-5">
                Klik "+ Buat Task Baru" pada pipeline sebelah kiri untuk memulai pemeriksaan kriteria QC.
              </p>
              <button
                type="button"
                onClick={() => setIsCreateTaskOpen(true)}
                className="rounded-2xl bg-violet-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-violet-500 transition"
              >
                + Buat Task Baru
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Panduan Ukuran & Ekspor */}
        <div className="lg:col-span-3">
          <PanduanUkuran />
        </div>
      </main>

      {/* Modal Pricing */}
      <PricingModal
        isOpen={isPricingOpen}
        onClose={() => setIsPricingOpen(false)}
        onSelectEnterprise={() => {
          setIsPricingOpen(false);
        }}
      />
    </div>
  );
}