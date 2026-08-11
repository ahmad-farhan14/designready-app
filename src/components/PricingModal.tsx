import { Check, Users, X } from 'lucide-react';

type PricingModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSelectEnterprise?: () => void;
};

export function PricingModal({ isOpen, onClose, onSelectEnterprise }: PricingModalProps) {
  if (!isOpen) return null;

  const handleEnterpriseClick = () => {
    onClose();
    if (onSelectEnterprise) {
      onSelectEnterprise();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md">
      <div className="relative w-full max-w-4xl rounded-3xl border border-slate-800 bg-slate-900/95 p-6 md:p-8 shadow-2xl">
        {/* Tombol Close Modal */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full bg-slate-800 p-2 text-slate-400 hover:bg-slate-700 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="text-center max-w-xl mx-auto mb-8">
          <h2 className="text-2xl font-bold text-white">Pilih Paket yang Sesuai Workflow-mu</h2>
          <p className="text-xs text-slate-400 mt-2">
            Tingkatkan produktivitas tim desain tanpa batasan fitur QC.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Paket Starter */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-white">Starter</h3>
                <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-semibold">Free</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Cocok untuk freelancer atau desainer solo.</p>
              <div className="mt-4">
                <span className="text-2xl font-extrabold text-white">Rp 0</span>
                <span className="text-xs text-slate-500"> / selamanya</span>
              </div>
              <ul className="mt-4 space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>Maksimal 5 Task Pipeline</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>Checklist QC Manual (10 Kriteria)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>Auto-save LocalStorage Browser</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>Panduan Dimensi Aset Platform</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>Ringkasan Handoff Teks Dasar</span>
                </li>
              </ul>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 w-full rounded-xl bg-slate-800 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-700"
            >
              Paket Saat Ini
            </button>
          </div>

          {/* Paket Pro Studio */}
          <div className="relative rounded-2xl border border-violet-500/50 bg-violet-950/20 p-5 flex flex-col justify-between shadow-lg shadow-violet-500/10">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-violet-600 px-3 py-0.5 text-[9px] font-bold tracking-wider text-white uppercase">
              RECOMMENDED
            </span>
            <div>
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-violet-200">Pro Studio ⚡</h3>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Untuk profesional & tim agen desain cepat.</p>
              <div className="mt-4">
                <span className="text-2xl font-extrabold text-white">Rp 99.000</span>
                <span className="text-xs text-slate-500"> / bulan</span>
              </div>
              <ul className="mt-4 space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>AI Design Inspector (ZIP & Batch)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>Unlimited Task Pipeline</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>Export Handoff (PDF & TXT)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>Dukungan Ekstraksi .SVG/.PDF/.FIG</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>Deteksi Dimensi Piksel Real-time</span>
                </li>
              </ul>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 w-full rounded-xl bg-violet-600 py-2.5 text-xs font-semibold text-white hover:bg-violet-500"
            >
              Upgrade ke Pro
            </button>
          </div>

          {/* Paket Enterprise */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-white">Enterprise 🏢</h3>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Untuk agensi & tim perusahaan.</p>
              <div className="mt-4">
                <span className="text-2xl font-extrabold text-white">Rp 299.000</span>
                <span className="text-xs text-slate-500"> / bulan</span>
              </div>
              <ul className="mt-4 space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>Multi-User / Team Workspace</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>Kelola Anggota & Roles Tim</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>Custom Branding Logo Export</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>Custom Master Checklist Studio</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>Dukungan CS Prioritas 24/7</span>
                </li>
              </ul>
            </div>

            <button
              type="button"
              onClick={handleEnterpriseClick}
              className="mt-6 flex items-center justify-center gap-1.5 w-full rounded-xl bg-slate-800 py-2.5 text-xs font-semibold text-violet-300 border border-violet-500/30 hover:bg-violet-600 hover:text-white transition"
            >
              <Users className="h-3.5 w-3.5" />
              <span>Coba Fitur Enterprise / Tim</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}