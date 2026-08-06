import { Check, Building2, Sparkles, X, Zap } from 'lucide-react';

type PricingModalProps = {
  open: boolean;
  onClose: () => void;
};

export function PricingModal({ open, onClose }: PricingModalProps) {
  if (!open) return null;

  return (
    <div className="modal-overlay-fade fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-md overflow-y-auto">
      <div className="modal-panel-pop relative my-auto w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-700/80 bg-slate-900 p-6 shadow-2xl sm:p-8">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-300">
            <Sparkles className="h-3.5 w-3.5" />
            UPGRADE DESIGNREADY
          </div>
          <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">Pilih Paket yang Sesuai Workflow-mu</h2>
          <p className="mt-2 text-sm text-slate-400">
            Tingkatkan produktivitas tim desain tanpa batasan fitur QC.
          </p>
        </div>

        {/* Pricing Cards Grid (3 Columns) */}
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {/* 1. Free Starter Tier */}
          <div className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-950/60 p-6 transition hover:border-slate-700">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Starter</h3>
                <span className="rounded-full bg-slate-800 px-3 py-1 text-[10px] font-semibold text-slate-300">Free</span>
              </div>
              <p className="mt-2 text-xs text-slate-400">Cocok untuk freelancer atau desainer solo.</p>
              
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-white">Rp 0</span>
                <span className="text-xs text-slate-400">/ selamanya</span>
              </div>

              <ul className="mt-6 space-y-3 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 shrink-0 text-emerald-400" />
                  Maksimal 5 Task Pipeline
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 shrink-0 text-emerald-400" />
                  Checklist QC Manual (UI/UX, Social, Branding)
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 shrink-0 text-emerald-400" />
                  Auto-save LocalStorage
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 shrink-0 text-emerald-400" />
                  Panduan Dimensi Aset Digital
                </li>
              </ul>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="mt-8 w-full rounded-xl border border-slate-700 bg-slate-800 py-2.5 text-xs font-semibold text-slate-300 transition hover:bg-slate-700 hover:text-white"
            >
              Paket Saat Ini
            </button>
          </div>

          {/* 2. Pro Studio Tier (Popular) */}
          <div className="relative flex flex-col justify-between rounded-2xl border-2 border-violet-500/80 bg-linear-to-b from-violet-950/30 to-slate-950/80 p-6 shadow-xl shadow-violet-950/20">
            <div className="absolute -top-3 right-6 rounded-full bg-linear-to-r from-violet-500 to-indigo-500 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow">
              RECOMMENDED
            </div>

            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white flex items-center gap-1.5">
                  Pro Studio <Zap className="h-4 w-4 fill-amber-400 text-amber-400" />
                </h3>
              </div>
              <p className="mt-2 text-xs text-slate-400">Untuk profesional & tim agen desain cepat.</p>

              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-white">Rp 99.000</span>
                <span className="text-xs text-slate-400">/ bulan</span>
              </div>

              <ul className="mt-6 space-y-3 text-xs text-slate-200">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 shrink-0 text-violet-400" />
                  <strong>AI Design Inspector</strong> (Upload PNG/JPG)
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 shrink-0 text-violet-400" />
                  <strong>Automated QC Checklist Verification</strong>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 shrink-0 text-violet-400" />
                  <strong>Unlimited</strong> Task Pipeline
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 shrink-0 text-violet-400" />
                  Export Handoff Summary (PDF & TXT)
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 shrink-0 text-violet-400" />
                  Cloud Sync via Supabase Database
                </li>
              </ul>
            </div>

            <button
              type="button"
              onClick={() => alert('Fitur Integrasi Midtrans / Stripe akan segera hadir!')}
              className="mt-8 w-full rounded-xl bg-linear-to-r from-violet-600 to-indigo-600 py-2.5 text-xs font-semibold text-white shadow-lg shadow-violet-600/30 transition hover:from-violet-500 hover:to-indigo-500"
            >
              Upgrade ke Pro
            </button>
          </div>

          {/* 3. Enterprise Tier */}
          <div className="flex flex-col justify-between rounded-2xl border border-sky-500/30 bg-slate-950/60 p-6 transition hover:border-sky-500/50">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white flex items-center gap-1.5">
                  Enterprise <Building2 className="h-4 w-4 text-sky-400" />
                </h3>
              </div>
              <p className="mt-2 text-xs text-slate-400">Untuk perusahaan skala besar & multi-tim.</p>

              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-white">Rp 299.000</span>
                <span className="text-xs text-slate-400">/ bulan</span>
              </div>

              <ul className="mt-6 space-y-3 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 shrink-0 text-sky-400" />
                  Semua Fitur Pro Studio Included
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 shrink-0 text-sky-400" />
                  <strong>Brand Guidelines AI Inspector</strong> (Upload PDF)
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 shrink-0 text-sky-400" />
                  Cross-Validation Desain vs Brand Rules
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 shrink-0 text-sky-400" />
                  <strong>Multi-User / Team Workspace</strong>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 shrink-0 text-sky-400" />
                  Custom Branding Logo di Export Summary
                </li>
              </ul>
            </div>

            <button
              type="button"
              onClick={() => alert('Silakan hubungi tim sales kami di support@designready.app')}
              className="mt-8 w-full rounded-xl border border-sky-500/30 bg-sky-500/10 py-2.5 text-xs font-semibold text-sky-300 transition hover:bg-sky-500/20 hover:text-white"
            >
              Hubungi Sales / Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}