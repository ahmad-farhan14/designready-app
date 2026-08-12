import { supabase } from '../lib/supabase';
import { CheckCircle2, Plus, X, LogOut, Sparkles } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { CATEGORIES, CHECKLIST_ITEMS } from '../data';
import type { CategoryKey } from '../types';
import { ChecklistArea } from './ChecklistArea';
import { PanduanUkuran } from './PanduanUkuran';
import { Sidebar } from './Sidebar';
import type { ChecklistState, WorkspaceTask } from './workspaceTypes';
import { PricingModal } from './PricingModal';
import { TeamSettingsPage } from './TeamSettingsPage';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';

const TASK_STORAGE_KEY = 'designready-tasks-v2';
const TASK_SEQUENCE_KEY = 'designready-task-sequence-v2';

type CreateTaskFormState = {
  name: string;
  categoryKey: CategoryKey;
};

function createEmptyChecklistState(): ChecklistState {
  return {
    'ui-ux': {},
    social: {},
    branding: {},
  };
}

function makeTaskId() {
  return `task-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function createTaskFromNumber(taskNumber: number, categoryKey: CategoryKey = 'ui-ux'): WorkspaceTask {
  return {
    id: makeTaskId(),
    name: String(taskNumber),
    categoryKey,
    checkedState: createEmptyChecklistState(),
    createdAt: Date.now(),
  };
}

function inferNextTaskNumber(tasks: WorkspaceTask[]) {
  const highestNumericName = tasks.reduce((highest, task) => {
    const parsedNumber = Number(task.name);
    if (!Number.isFinite(parsedNumber)) return highest;
    return Math.max(highest, parsedNumber);
  }, 0);

  return highestNumericName + 1;
}

function loadWorkspaceState(): { tasks: WorkspaceTask[]; nextTaskNumber: number } {
  try {
    const stored = window.localStorage.getItem(TASK_STORAGE_KEY);
    const storedSequence = Number(window.localStorage.getItem(TASK_SEQUENCE_KEY));

    if (stored) {
      const parsed = JSON.parse(stored) as WorkspaceTask[];
      const normalizedTasks = parsed.map((task) => ({
        ...task,
        checkedState: task.checkedState ?? createEmptyChecklistState(),
      }));

      const supportedCategoryKeys: CategoryKey[] = ['ui-ux', 'social', 'branding'];
      const filteredTasks = normalizedTasks.filter((task) => supportedCategoryKeys.includes(task.categoryKey));

      const inferredNextTaskNumber = inferNextTaskNumber(filteredTasks);
      const nextTaskNumber = Number.isFinite(storedSequence)
        ? Math.max(storedSequence, inferredNextTaskNumber)
        : inferredNextTaskNumber;

      return { tasks: filteredTasks, nextTaskNumber };
    }
  } catch (error) {
    console.warn('Gagal membaca localStorage', error);
  }

  // Task awal bersih / kosong
  return {
    tasks: [],
    nextTaskNumber: 1,
  };
}

function getTaskProgress(task: WorkspaceTask) {
  const items = CHECKLIST_ITEMS[task.categoryKey] ?? [];
  const totalItems = items.length;
  const checkedCount = Object.values(task.checkedState[task.categoryKey] ?? {}).filter(Boolean).length;
  const progressPercent = totalItems === 0 ? 0 : Math.round((checkedCount / totalItems) * 100);

  return { checkedCount, totalItems, progressPercent };
}

function getCategoryLabel(categoryKey: CategoryKey) {
  return CATEGORIES.find((category) => category.key === categoryKey)?.label ?? 'Unknown';
}

function CreateTaskModal({
  open,
  formState,
  taskCount,
  onChange,
  onClose,
  onSubmit,
  onOpenPricing,
}: {
  open: boolean;
  formState: CreateTaskFormState;
  taskCount: number;
  onChange: (nextState: CreateTaskFormState) => void;
  onClose: () => void;
  onSubmit: () => void;
  onOpenPricing: () => void;
}) {
  if (!open) return null;

  const FREE_TASK_LIMIT = 5;
  const isLimitReached = taskCount >= FREE_TASK_LIMIT;
  const isSubmitDisabled = formState.name.trim().length === 0 || isLimitReached;

  return (
    <div className="modal-overlay-fade fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6 backdrop-blur-sm">
      <div className="modal-panel-pop w-full max-w-xl overflow-hidden rounded-3xl border border-slate-700/80 bg-slate-900 shadow-2xl shadow-black/50">
        <div className="flex items-start justify-between gap-4 border-b border-slate-800/80 px-6 py-5">
          <div>
            <h2 className="text-2xl font-semibold text-white">Buat Task Baru</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300/75">
              Isi nama task dan pilih kategori QC yang akan digunakan.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-slate-400 transition hover:bg-white/5 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 px-6 py-5">
          {isLimitReached && (
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-200">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 shrink-0 text-amber-400" />
                  <span>
                    Batas paket <strong>Starter (Maks. 5 Task)</strong> telah tercapai.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenPricing();
                  }}
                  className="shrink-0 rounded-xl bg-amber-500 px-3 py-1.5 font-semibold text-slate-950 transition hover:bg-amber-400"
                >
                  Upgrade Pro
                </button>
              </div>
            </div>
          )}

          <div>
            <label className="text-sm font-semibold text-slate-100">Nama Task *</label>
            <input
              autoFocus
              disabled={isLimitReached}
              value={formState.name}
              onChange={(event) => onChange({ ...formState, name: event.target.value })}
              placeholder={isLimitReached ? 'Batas task tercapai...' : 'cth: Desain Logo Perusahaan X / UI App'}
              className="mt-2 w-full rounded-2xl border border-violet-500/35 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-violet-400 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-100">Kategori Jenis Desain (QC)</p>
            <div className="mt-3 space-y-3">
              {CATEGORIES.map((category) => {
                const isSelected = formState.categoryKey === category.key;

                return (
                  <button
                    key={category.key}
                    type="button"
                    disabled={isLimitReached}
                    onClick={() => onChange({ ...formState, categoryKey: category.key })}
                    className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition disabled:cursor-not-allowed disabled:opacity-50 ${
                      isSelected
                        ? 'border-violet-400/45 bg-violet-500/12'
                        : 'border-slate-800/80 bg-slate-950/50 hover:border-slate-700 hover:bg-slate-900/75'
                    }`}
                  >
                    <span className={`flex h-5 w-5 items-center justify-center rounded-full border ${isSelected ? 'border-violet-400 bg-violet-500/20' : 'border-slate-600'}`}>
                      <span className={`h-2.5 w-2.5 rounded-full ${isSelected ? 'bg-violet-400' : 'bg-transparent'}`} />
                    </span>
                    <span className="font-semibold text-slate-100">{category.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex gap-3 border-t border-slate-800/80 px-6 py-5">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-2xl border border-slate-800/80 bg-slate-950/70 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-900"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={isSubmitDisabled}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-violet-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-400 disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            Buat Task
          </button>
        </div>
      </div>
    </div>
  );
}

function EmptyChecklistState({ onCreateTask }: { onCreateTask: () => void }) {
  return (
    <section className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950/75 shadow-2xl shadow-black/30 backdrop-blur-xl">
      <div className="flex min-h-90 flex-col items-center justify-center px-6 py-12 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-violet-500/12 text-violet-200">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h3 className="mt-6 text-2xl font-semibold text-white">Belum ada task dipilih</h3>
        <p className="mt-2 max-w-lg text-sm leading-6 text-slate-300/75 sm:text-base">
          Buat task baru atau pilih dari daftar pipeline untuk mulai proses QC.
        </p>
        <button
          type="button"
          onClick={onCreateTask}
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-violet-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-400"
        >
          <Plus className="h-4 w-4" />
          Buat Task Baru
        </button>
      </div>
    </section>
  );
}

export function DesignReadyWorkspace() {
  const initialWorkspaceState = loadWorkspaceState();

  const [tasks, setTasks] = useState<WorkspaceTask[]>(initialWorkspaceState.tasks);
  const [currentOrgId, setCurrentOrgId] = useState<string | null>(null);
  const [currentOrgName, setCurrentOrgName] = useState<string>('Personal Workspace');
  const [showTeamSettings, setShowTeamSettings] = useState(false);

  const [activeTaskId, setActiveTaskId] = useState<string | null>(() => {
    const savedActiveId = window.localStorage.getItem('designready-active-task-id');
    const exists = initialWorkspaceState.tasks.some((task) => task.id === savedActiveId);
    if (savedActiveId && exists) return savedActiveId;
    return initialWorkspaceState.tasks[0]?.id ?? null;
  });

  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<WorkspaceTask | null>(null);
  const [nextTaskNumber, setNextTaskNumber] = useState(initialWorkspaceState.nextTaskNumber);
  const [formState, setFormState] = useState<CreateTaskFormState>({
    name: '',
    categoryKey: 'ui-ux',
  });

  useEffect(() => {
    window.localStorage.setItem(TASK_STORAGE_KEY, JSON.stringify(tasks));
    window.localStorage.setItem(TASK_SEQUENCE_KEY, String(nextTaskNumber));
  }, [nextTaskNumber, tasks]);

  useEffect(() => {
    if (activeTaskId) {
      window.localStorage.setItem('designready-active-task-id', activeTaskId);
    } else {
      window.localStorage.removeItem('designready-active-task-id');
    }
  }, [activeTaskId]);

  const handleSelectWorkspace = (orgId: string | null, orgName: string) => {
    setCurrentOrgId(orgId);
    setCurrentOrgName(orgName);
    setShowTeamSettings(Boolean(orgId));
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const activeTask = useMemo(() => {
    if (tasks.length === 0) return null;
    return tasks.find((task) => task.id === activeTaskId) ?? null;
  }, [activeTaskId, tasks]);

  const taskCards = tasks.map((task) => {
    const progress = getTaskProgress(task);
    return {
      id: task.id,
      name: task.name,
      categoryLabel: getCategoryLabel(task.categoryKey),
      progressPercent: progress.progressPercent,
      isActive: task.id === (activeTask?.id ?? null),
    };
  });

  const handleCreateTask = () => {
    const trimmedName = formState.name.trim();
    if (trimmedName.length === 0) return;

    const newTask: WorkspaceTask = {
      ...createTaskFromNumber(nextTaskNumber, formState.categoryKey),
      name: trimmedName,
    };

    setTasks((previousTasks) => [newTask, ...previousTasks]);
    setNextTaskNumber((currentNumber) => currentNumber + 1);
    setActiveTaskId(newTask.id);
    setIsCreateTaskOpen(false);
    setFormState({ name: '', categoryKey: 'ui-ux' });
  };

  const handleToggleItem = (index: number) => {
    if (!activeTask) return;

    setTasks((previousTasks) =>
      previousTasks.map((task) => {
        if (task.id !== activeTask.id) return task;
        return {
          ...task,
          checkedState: {
            ...task.checkedState,
            [task.categoryKey]: {
              ...task.checkedState[task.categoryKey],
              [index]: !task.checkedState[task.categoryKey]?.[index],
            },
          },
        };
      }),
    );
  };

  const handleResetTask = () => {
    if (!activeTask) return;

    setTasks((previousTasks) =>
      previousTasks.map((task) =>
        task.id === activeTask.id
          ? {
              ...task,
              checkedState: {
                ...task.checkedState,
                [task.categoryKey]: {},
              },
            }
          : task,
      ),
    );
  };

  const handleRequestDeleteTask = (taskId: string) => {
    const targetTask = tasks.find((task) => task.id === taskId) ?? null;
    if (!targetTask) return;

    setTaskToDelete(targetTask);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDeleteTask = () => {
    if (!taskToDelete) return;

    setTasks((previousTasks) => {
      const nextTasks = previousTasks.filter((task) => task.id !== taskToDelete.id);
      if (nextTasks.length === 0) {
        setActiveTaskId(null);
        return [];
      }
      if (activeTaskId === taskToDelete.id) {
        setActiveTaskId(nextTasks[0].id);
      }
      return nextTasks;
    });

    setIsDeleteModalOpen(false);
    setTaskToDelete(null);
  };

  return (
    <div className="min-h-dvh bg-[#08111f] text-slate-50">
      {/* Modal Custom Konfirmasi Hapus Task */}
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        title="Hapus Task Pipeline?"
        description="Apakah kamu yakin ingin menghapus task ini? Semua data checklist untuk task ini akan dihapus permanen."
        itemName={`Task: ${taskToDelete?.name}`}
        onConfirm={handleConfirmDeleteTask}
        onCancel={() => {
          setIsDeleteModalOpen(false);
          setTaskToDelete(null);
        }}
      />

      <header className="mx-auto max-w-7xl px-4 pb-8 pt-10 sm:px-6 lg:px-8">
        <div className="flex items-start justify-between gap-6 border-b border-slate-800/80 pb-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/25 bg-violet-500/12 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-violet-100">
              <CheckCircle2 className="h-3.5 w-3.5" />
              QC TOOL FOR DESIGNERS
            </div>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">DesignReady</h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsPricingOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm font-semibold text-amber-300 hover:bg-amber-500/20"
            >
              <Sparkles className="h-4 w-4 fill-amber-300 text-amber-300" />
              Upgrade Pro
            </button>

            <button
              type="button"
              onClick={() => setIsCreateTaskOpen(true)}
              className="inline-flex items-center gap-2 rounded-2xl bg-violet-500 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-400"
            >
              <Plus className="h-4 w-4" />
              Buat Task Baru
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm font-semibold text-slate-300 hover:bg-slate-800"
            >
              <LogOut className="h-4 w-4 text-rose-400" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="grid items-start gap-6 xl:grid-cols-[320px_minmax(0,1fr)_360px]">
          <Sidebar
            tasks={taskCards}
            activeTaskId={activeTaskId}
            currentOrgId={currentOrgId}
            onSelectWorkspace={handleSelectWorkspace}
            onSelectTask={(taskId) => {
              setActiveTaskId(taskId);
              setShowTeamSettings(false);
            }}
            onCreateTask={() => setIsCreateTaskOpen(true)}
            onRequestDeleteTask={handleRequestDeleteTask}
          />

          {showTeamSettings && currentOrgId ? (
            <TeamSettingsPage organizationId={currentOrgId} organizationName={currentOrgName} />
          ) : activeTask ? (
            <ChecklistArea
              taskId={activeTask.id}
              taskName={activeTask.name}
              categoryLabel={getCategoryLabel(activeTask.categoryKey)}
              items={CHECKLIST_ITEMS[activeTask.categoryKey] ?? []}
              checkedState={activeTask.checkedState[activeTask.categoryKey] ?? {}}
              onToggleItem={handleToggleItem}
              onReset={handleResetTask}
            />
          ) : (
            <EmptyChecklistState onCreateTask={() => setIsCreateTaskOpen(true)} />
          )}

          <PanduanUkuran />
        </div>
      </main>

      <CreateTaskModal
        open={isCreateTaskOpen}
        formState={formState}
        taskCount={tasks.length}
        onChange={setFormState}
        onClose={() => setIsCreateTaskOpen(false)}
        onSubmit={handleCreateTask}
        onOpenPricing={() => setIsPricingOpen(true)}
      />

      <PricingModal
        isOpen={isPricingOpen}
        onClose={() => setIsPricingOpen(false)}
        onSelectEnterprise={() => setIsPricingOpen(false)}
      />
    </div>
  );
}