import { AlertTriangle, X } from 'lucide-react';

type ConfirmDeleteModalProps = {
  isOpen: boolean;
  title: string;
  description: string;
  itemName?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
};

export function ConfirmDeleteModal({
  isOpen,
  title,
  description,
  itemName,
  onConfirm,
  onCancel,
  loading = false,
}: ConfirmDeleteModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl border border-rose-500/20 bg-slate-900 p-6 shadow-2xl">
        {/* Tombol Close Modal */}
        <button
          onClick={onCancel}
          disabled={loading}
          className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">{title}</h3>
            <p className="mt-1 text-xs text-slate-400">{description}</p>

            {itemName && (
              <div className="mt-3 rounded-xl border border-slate-800 bg-slate-950 p-3">
                <p className="text-xs font-mono font-semibold text-rose-300 truncate">{itemName}</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-xl border border-slate-800 bg-slate-800/50 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-500 transition shadow-lg shadow-rose-600/20 disabled:opacity-50"
          >
            {loading ? 'Menghapus...' : 'Ya, Hapus Permanen'}
          </button>
        </div>
      </div>
    </div>
  );
}