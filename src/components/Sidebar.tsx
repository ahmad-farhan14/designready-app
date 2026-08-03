import { Trash2 } from 'lucide-react';
export function Sidebar({
  tasks,
  activeTaskId,
  onSelectTask,
  onCreateTask,
  onRequestDeleteTask,
}: {
  tasks: { id: string; name: string; categoryLabel: string; progressPercent: number; isActive: boolean }[];
  activeTaskId: string | null;
  onSelectTask: (taskId: string) => void;
  onCreateTask: () => void;
  onRequestDeleteTask: (taskId: string) => void;
}) {
  return (
    <aside className="space-y-5 lg:sticky lg:top-6">
      <section className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950/75 shadow-2xl shadow-black/30 backdrop-blur-xl">
        <div className="border-b border-slate-800/80 bg-slate-900/60 p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-white">Pipeline Task</h2>
              <p className="mt-1 text-xs text-slate-300/70">{tasks.length} task aktif</p>
            </div>

            <button
              type="button"
              onClick={onCreateTask}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-violet-500/25 bg-violet-500/12 text-violet-100 transition hover:bg-violet-500/20"
              aria-label="Buat task baru"
            >
              +
            </button>
          </div>
        </div>

        <div className="space-y-3 p-4">
          {tasks.length === 0 ? (
            <button
              type="button"
              onClick={onCreateTask}
              className="flex min-h-49.5 w-full flex-col items-center justify-center rounded-2xl border border-slate-800/80 bg-slate-900/55 px-5 py-8 text-center text-slate-300/70 transition hover:border-slate-700 hover:bg-slate-900/75"
              aria-label="Buat task baru"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-500/15 text-xl text-violet-200 transition group-hover:bg-violet-500/20">
                +
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-300/80">
                Belum ada task.
                <br />
                Klik + untuk membuat task baru.
              </p>
            </button>
          ) : (
            tasks.map((task) => {
              const isActive = task.id === activeTaskId;

              return (
                <div
                  key={task.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => onSelectTask(task.id)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      onSelectTask(task.id);
                    }
                  }}
                  className={`group w-full rounded-2xl border p-4 text-left transition-all duration-200 ${
                    isActive
                      ? 'border-violet-400/35 bg-violet-500/12 shadow-lg shadow-violet-500/10'
                      : 'border-slate-800/80 bg-slate-900/55 hover:border-slate-700 hover:bg-slate-900/75'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white">{task.name}</p>
                      <div className="mt-2 inline-flex rounded-full border border-violet-500/25 bg-violet-500/12 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-violet-100">
                        {task.categoryLabel}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        onRequestDeleteTask(task.id);
                      }}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500/15 text-rose-300 transition hover:bg-rose-500/25 hover:text-rose-200"
                      aria-label={`Hapus task ${task.name}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/6">
                    <div
                      className="h-full rounded-full bg-violet-500"
                      style={{ width: `${task.progressPercent}%` }}
                    />
                  </div>

                  <div className="mt-2 text-right text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                    {task.progressPercent}%
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </aside>
  );
}