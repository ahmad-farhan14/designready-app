import { useState } from 'react';
import { Check, ClipboardList, Copy, RotateCcw, Sparkles } from 'lucide-react';

function getProgressTone(progressPercent: number) {
  if (progressPercent === 100) {
    return {
      bar: 'bg-emerald-500',
      glow: 'shadow-emerald-500/40',
      badge: 'bg-emerald-500/15 text-emerald-100 border-emerald-500/20',
    };
  }

  if (progressPercent >= 50) {
    return {
      bar: 'bg-amber-400',
      glow: 'shadow-amber-400/40',
      badge: 'bg-amber-400/15 text-amber-100 border-amber-400/20',
    };
  }

  return {
    bar: 'bg-rose-500',
    glow: 'shadow-rose-500/40',
    badge: 'bg-rose-500/15 text-rose-100 border-rose-500/20',
  };
}

function formatSummaryText(taskName: string, categoryLabel: string, items: string[], checkedIndices: number[]) {
  const today = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const checkedLines = checkedIndices.map((index) => `• ${items[index]}`).join('\n');
  const fallback = checkedIndices.length === 0 ? '- Belum ada item yang diverifikasi' : checkedLines;
  const totalItems = items.length;
  const checkedCount = checkedIndices.length;
  const completionPercent = totalItems === 0 ? 0 : Math.round((checkedCount / totalItems) * 100);

  return `✅ [DesignReady QC Report]\n\nNama Task  : ${taskName}\nKategori   : ${categoryLabel}\nStatus     : ${completionPercent}% Selesai (${checkedCount}/${totalItems} item)\nTanggal    : ${today}\n\nChecklist yang telah diverifikasi:\n${fallback}\n\nCatatan    : Semua kriteria teknis telah diverifikasi.`;
}

export function ChecklistArea({
  taskName,
  categoryLabel,
  items,
  checkedState,
  onToggleItem,
  onReset,
}: {
  taskName: string;
  categoryLabel: string;
  items: string[];
  checkedState: Record<number, boolean>;
  onToggleItem: (index: number) => void;
  onReset: () => void;
}) {
  const [summaryCopied, setSummaryCopied] = useState(false);

  const checkedIndices = Object.keys(checkedState)
    .filter((key) => checkedState[Number(key)])
    .map(Number);

  const totalItems = items.length;
  const checkedCount = checkedIndices.length;
  const progressPercent = totalItems === 0 ? 0 : Math.round((checkedCount / totalItems) * 100);
  const tone = getProgressTone(progressPercent);
  const summary = formatSummaryText(taskName, categoryLabel, items, checkedIndices);

  const handleCopySummary = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      setSummaryCopied(true);
      window.setTimeout(() => setSummaryCopied(false), 1800);
    } catch (error) {
      console.warn('Failed to copy summary', error);
    }
  };

  return (
    <section className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950/75 shadow-2xl shadow-black/30 backdrop-blur-xl">
      <div className="border-b border-slate-800/80 bg-slate-900/60 p-6 sm:p-7">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">{taskName}</p>
            <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-violet-500/25 bg-violet-500/12 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-violet-100">
              <ClipboardList className="h-3.5 w-3.5" />
              {categoryLabel}
            </div>
          </div>

          <div className={`rounded-2xl border px-5 py-4 ${tone.badge}`}>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-semibold tracking-tight text-white">{progressPercent}%</span>
            </div>
            <p className="mt-1 text-xs font-medium uppercase tracking-[0.22em] text-white/65">
              {checkedCount} / {totalItems} selesai
            </p>
          </div>
        </div>

        <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/8">
          <div className={`h-full rounded-full ${tone.bar} ${tone.glow}`} style={{ width: `${progressPercent}%` }} />
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onReset}
            disabled={checkedCount === 0}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-800/80 bg-slate-900/70 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:border-slate-700 hover:bg-slate-800/70 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <RotateCcw className="h-4 w-4" />
            Reset checklist
          </button>

          <button
            type="button"
            onClick={handleCopySummary}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
              summaryCopied
                ? 'border border-emerald-400/25 bg-emerald-400/15 text-emerald-100'
                : 'border border-cyan-400/25 bg-cyan-400/15 text-cyan-50 hover:bg-cyan-400/20'
            }`}
          >
            {summaryCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {summaryCopied ? 'Tersalin' : 'Salin ringkasan'}
          </button>
        </div>
      </div>

      <div className="p-3 sm:p-4">
        <div className="space-y-2">
          {items.map((item, index) => {
            const isChecked = Boolean(checkedState[index]);

            return (
              <button
                key={item}
                type="button"
                onClick={() => onToggleItem(index)}
                className={`group flex w-full items-start gap-4 rounded-2xl border px-4 py-4 text-left transition-all duration-200 ${
                  isChecked
                    ? 'border-emerald-400/20 bg-emerald-400/8'
                    : 'border-slate-800/70 bg-slate-900/55 hover:border-slate-700 hover:bg-slate-900/80'
                }`}
              >
                <span
                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border transition ${
                    isChecked
                      ? 'border-emerald-400/25 bg-emerald-400 text-slate-950'
                      : 'border-slate-700 bg-slate-900/40 text-transparent group-hover:border-cyan-400/35'
                  }`}
                >
                  <Check className="h-3.5 w-3.5" strokeWidth={3} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm leading-6 sm:text-[15px] ${isChecked ? 'text-slate-400 line-through decoration-slate-500/50' : 'text-slate-100'}`}>
                    {item}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Sparkles className="h-4 w-4 text-cyan-200" />
            Ringkasan Handoff
          </div>
          <textarea
            readOnly
            value={summary}
            className="mt-3 h-52 w-full resize-none rounded-2xl border border-white/10 bg-slate-950/60 p-4 font-mono text-sm leading-6 text-slate-200 outline-none focus:border-cyan-400/35"
          />
        </div>
      </div>
    </section>
  );
}