import { X, ZoomIn } from 'lucide-react';

type ImageModalProps = {
  isOpen: boolean;
  imageUrl: string | null;
  imageAlt?: string;
  onClose: () => void;
};

export function ImageModal({ isOpen, imageUrl, imageAlt = 'Preview Gambar', onClose }: ImageModalProps) {
  if (!isOpen || !imageUrl) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md animate-in fade-in duration-200 cursor-zoom-out"
    >
      <div
        className="relative max-h-[90vh] max-w-[90vw] overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 p-2 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Tombol Close */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-full bg-slate-900/80 p-2 text-slate-300 backdrop-blur-md hover:bg-slate-800 hover:text-white transition"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Gambar Ukuran Besar */}
        <img
          src={imageUrl}
          alt={imageAlt}
          className="max-h-[85vh] max-w-[85vw] rounded-2xl object-contain shadow-md"
        />

        <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-xl bg-slate-900/80 px-3 py-1.5 text-[11px] font-semibold text-slate-300 backdrop-blur-md border border-slate-800">
          <ZoomIn className="h-3.5 w-3.5 text-violet-400" /> Klik di luar atau X untuk menutup
        </div>
      </div>
    </div>
  );
}