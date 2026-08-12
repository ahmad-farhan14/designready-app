import { Sparkles, AlertCircle, X } from 'lucide-react';

type NotificationModalProps = {
  isOpen: boolean;
  title: string;
  message: string;
  type?: 'success' | 'warning' | 'error';
  onClose: () => void;
};

export function NotificationModal({
  isOpen,
  title,
  message,
  type = 'success',
  onClose,
}: NotificationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm rounded-3xl border border-slate-800 bg-slate-900/95 p-6 shadow-2xl text-center">
        {/* Tombol Silang Close */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Icon Header Modal */}
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border bg-violet-500/10 border-violet-500/20 text-violet-400">
          {type === 'success' ? (
            <Sparkles className="h-7 w-7 text-amber-400 fill-amber-400" />
          ) : (
            <AlertCircle className="h-7 w-7 text-amber-400" />
          )}
        </div>

        {/* Title & Message */}
        <h3 className="text-lg font-extrabold text-white mb-2">{title}</h3>
        <p className="text-xs text-slate-300 leading-relaxed mb-6">{message}</p>

        {/* Tombol Paham / Mengerti */}
        <button
          type="button"
          onClick={onClose}
          className="w-full rounded-2xl bg-violet-600 py-3 text-xs font-semibold text-white hover:bg-violet-500 transition shadow-lg shadow-violet-600/20"
        >
          Mengerti
        </button>
      </div>
    </div>
  );
}