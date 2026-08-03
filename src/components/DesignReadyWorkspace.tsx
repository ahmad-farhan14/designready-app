import { CheckCircle2, Plus, TriangleAlert, X, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { CATEGORIES, CHECKLIST_ITEMS } from '../data';
import type { CategoryKey } from '../types';
import { ChecklistArea } from './ChecklistArea';
import { PanduanUkuran } from './PanduanUkuran';
import { Sidebar } from './Sidebar';
import type { ChecklistState, WorkspaceTask } from './workspaceTypes';

const TASK_STORAGE_KEY = 'designready-tasks';
const TASK_SEQUENCE_KEY = 'designready-task-sequence';

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

    if (!Number.isFinite(parsedNumber)) {
      return highest;
    }

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

      return {
        tasks: filteredTasks,
        nextTaskNumber,
      };
    }
  } catch (error) {
    console.warn('Failed to read localStorage', error);
  }

  return {
    tasks: [createTaskFromNumber(1)],
    nextTaskNumber: 2,
  };
}

function getTaskProgress(task: WorkspaceTask) {
  const totalItems = CHECKLIST_ITEMS[task.categoryKey].length;
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
  onChange,
  onClose,
  onSubmit,
}: {
  open: boolean;
  formState: CreateTaskFormState;
  onChange: (nextState: CreateTaskFormState) => void;
  onClose: () => void;
  onSubmit: () => void;
}) {
  if (!open) {
    return null;
  }

  const isSubmitDisabled = formState.name.trim().length === 0;

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
            aria-label="Tutup modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 px-6 py-5">
          <div>
            <label className="text-sm font-semibold text-slate-100">Nama Task *</label>
            <input
              autoFocus
              value={formState.name}
              onChange={(event) => onChange({ ...formState, name: event.target.value })}
              placeholder="cth: Desain Logo Perusahaan X"
              className="mt-2 w-full rounded-2xl border border-violet-500/35 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none ring-0 placeholder:text-slate-500 focus:border-violet-400"
            />
            <p className="mt-2 text-xs text-slate-400">Nama task wajib diisi.</p>
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-100">Kategori QC</p>
            <div className="mt-3 space-y-3">
              {CATEGORIES.map((category) => {
                const isSelected = formState.categoryKey === category.key;

                return (
                  <button
                    key={category.key}
                    type="button"
                    onClick={() => onChange({ ...formState, categoryKey: category.key })}
                    className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition ${
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
            className="flex-1 rounded-2xl border border-slate-800/80 bg-slate-950/70 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-slate-700 hover:bg-slate-900/80"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={isSubmitDisabled}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-violet-500/25 bg-violet-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            Buat Task
          </button>
        </div>
      </div>
    </div>
  );
}

function DeleteTaskModal({
  open,
  taskName,
  onClose,
  onConfirm,
}: {
  open: boolean;
  taskName: string;
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="modal-overlay-fade fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6 backdrop-blur-sm">
      <div className="modal-panel-pop w-full max-w-lg overflow-hidden rounded-3xl border border-slate-700/80 bg-slate-900 shadow-2xl shadow-black/60">
        <div className="border-b border-slate-800/80 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-300 animate-shake">
              <TriangleAlert className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Hapus Task {taskName}?</h2>
              <p className="mt-1 text-sm leading-6 text-slate-300/75">Tindakan ini tidak dapat dibatalkan.</p>
            </div>
          </div>
        </div>

        <div className="px-6 py-5">
          <div className="rounded-2xl border border-rose-500/15 bg-rose-500/8 p-4 text-sm leading-6 text-slate-200/90">
            <div className="flex items-start gap-3">
              <Trash2 className="mt-0.5 h-4 w-4 shrink-0 text-rose-300" />
              <p>
                Task ini akan dihapus permanen dari daftar. Jika task ini sedang aktif, workspace akan kembali ke keadaan kosong.
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-3 border-t border-slate-800/80 px-6 py-5">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-2xl border border-slate-800/80 bg-slate-950/70 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-slate-700 hover:bg-slate-900/80"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            <Trash2 className="h-4 w-4" />
            Ya, Hapus Permanent
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
          className="mt-8 inline-flex items-center gap-2 rounded-xl border border-violet-500/25 bg-violet-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-400"
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
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
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
    if (tasks.length === 0) {
      return;
    }

    const taskStillExists = tasks.some((task) => task.id === activeTaskId);

    if (!taskStillExists) {
      setActiveTaskId(tasks[0].id);
    }
  }, [activeTaskId, tasks]);

  const activeTask = useMemo(
    () => tasks.find((task) => task.id === activeTaskId) ?? tasks[0] ?? null,
    [activeTaskId, tasks],
  );

  const taskCards = tasks.map((task) => {
    const progress = getTaskProgress(task);

    return {
      id: task.id,
      name: task.name,
      categoryLabel: getCategoryLabel(task.categoryKey),
      progressPercent: progress.progressPercent,
      isActive: task.id === activeTaskId,
    };
  });

  const handleCreateTask = () => {
    const trimmedName = formState.name.trim();

    if (trimmedName.length === 0) {
      return;
    }

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
    if (!activeTask) {
      return;
    }

    setTasks((previousTasks) =>
      previousTasks.map((task) => {
        if (task.id !== activeTask.id) {
          return task;
        }

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
    if (!activeTask) {
      return;
    }

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

    if (!targetTask) {
      return;
    }

    setTaskToDelete(targetTask);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDeleteTask = () => {
    if (!taskToDelete) {
      return;
    }

    setTasks((previousTasks) => {
      const nextTasks = previousTasks.filter((task) => task.id !== taskToDelete.id);

      if (nextTasks.length === 0) {
        setActiveTaskId(null);
        return [];
      }

      const nextActiveTaskId = activeTaskId === taskToDelete.id ? nextTasks[0].id : activeTaskId;
      setActiveTaskId(nextActiveTaskId);
      return nextTasks;
    });

    setIsDeleteModalOpen(false);
    setTaskToDelete(null);
  };

  return (
    <div className="min-h-dvh bg-[#08111f] text-slate-50">
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(circle at top left, rgba(14,165,233,0.18), transparent 34%), radial-gradient(circle at top right, rgba(124,58,237,0.14), transparent 28%), linear-gradient(180deg, rgba(8,17,31,1) 0%, rgba(5,10,20,1) 100%)',
          }}
        />
      </div>

      <header className="mx-auto max-w-7xl px-4 pb-8 pt-10 sm:px-6 lg:px-8">
        <div className="flex items-start justify-between gap-6 border-b border-slate-800/80 pb-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/25 bg-violet-500/12 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-violet-100">
              <CheckCircle2 className="h-3.5 w-3.5" />
              QC TOOL FOR DESIGNERS
            </div>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">DesignReady</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300/75 sm:text-base">
              Pastikan kualitas berkas desainmu sempurna sebelum diserahkan ke klien atau pengembang.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsCreateTaskOpen(true)}
            className="inline-flex items-center gap-2 rounded-2xl border border-violet-500/25 bg-violet-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:bg-violet-400"
          >
            <Plus className="h-4 w-4" />
            Buat Task Baru
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="grid items-start gap-6 xl:grid-cols-[320px_minmax(0,1fr)_360px]">
          <Sidebar
            tasks={taskCards}
            activeTaskId={activeTaskId}
            onSelectTask={setActiveTaskId}
            onCreateTask={() => setIsCreateTaskOpen(true)}
            onRequestDeleteTask={handleRequestDeleteTask}
          />

          {activeTask ? (
            <ChecklistArea
              taskName={activeTask.name}
              categoryLabel={getCategoryLabel(activeTask.categoryKey)}
              items={CHECKLIST_ITEMS[activeTask.categoryKey]}
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
        onChange={setFormState}
        onClose={() => setIsCreateTaskOpen(false)}
        onSubmit={handleCreateTask}
      />

      <DeleteTaskModal
        open={isDeleteModalOpen}
        taskName={taskToDelete?.name ?? ''}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setTaskToDelete(null);
        }}
        onConfirm={handleConfirmDeleteTask}
      />
    </div>
  );
}
