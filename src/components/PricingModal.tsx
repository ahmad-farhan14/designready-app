import { Check, Building2, Zap, X, UserCheck } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '../lib/supabase';

type PricingModalProps = {
  isOpen: boolean;
  onClose: () => void;
  currentTier: 'starter' | 'pro' | 'enterprise';
  onTierUpdated: (newTier: 'starter' | 'pro' | 'enterprise') => void;
  onOpenCreateOrg: () => void;
};

export function PricingModal({
  isOpen,
  onClose,
  currentTier,
  onTierUpdated,
  onOpenCreateOrg,
}: PricingModalProps) {
  const [loadingTier, setLoadingTier] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSimulateUpgrade = async (tier: 'pro' | 'enterprise') => {
    setLoadingTier(tier);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User belum login');

      const { error } = await supabase
        .from('profiles')
        .update({ subscription_tier: tier })
        .eq('id', user.id);

      if (error) throw error;

      onTierUpdated(tier);

      if (tier === 'enterprise') {
        onClose();
        onOpenCreateOrg();
      } else {
        alert('🎉 Selamat! Akun kamu berhasil di-upgrade ke Pro Studio (Demo Mode).');
        onClose();
      }
    } catch (err) {
      console.error('Gagal update tier:', err);
      alert('Gagal memproses simulasi upgrade.');
    } finally {
      setLoadingTier(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl rounded-3xl border border-slate-800/80 bg-slate-900/90 p-6 md:p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Pilih Paket yang Sesuai Workflow-mu
          </h2>
          <p className="text-xs md:text-sm text-slate-400 mt-2">
            Tingkatkan produktivitas tim desain tanpa batasan fitur QC.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card Starter */}
          <div className="rounded-3xl border border-slate-800 bg-slate-950/60 p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-white">Starter</h3>
                <span className="text-[10px] bg-slate-800 text-slate-400 px-2.5 py-0.5 rounded-full font-bold">Free</span>
              </div>
              <p className="text-xs text-slate-400 mb-4">Cocok untuk freelancer atau desainer solo.</p>
              <div className="mb-6">
                <span className="text-2xl font-black text-white">Rp 0</span>
                <span className="text-xs text-slate-500"> / selamanya</span>
              </div>
              <ul className="space-y-3 text-xs text-slate-300 mb-6">
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400 shrink-0" /> Maksimal 5 Task Pipeline</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400 shrink-0" /> Checklist QC Manual (10 Kriteria)</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400 shrink-0" /> Auto-save LocalStorage Browser</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400 shrink-0" /> Panduan Dimensi Aset Platform</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400 shrink-0" /> Ringkasan Handoff Teks Dasar</li>
              </ul>
            </div>

            <button
              disabled
              type="button"
              className="w-full rounded-2xl border border-slate-800 bg-slate-900/50 py-3 text-xs font-semibold text-slate-500 cursor-not-allowed"
            >
              {currentTier === 'starter' ? 'Paket Saat Ini' : 'Gratis'}
            </button>
          </div>

          {/* Card Pro Studio */}
          <div className="relative rounded-3xl border border-violet-500/50 bg-violet-950/20 p-6 flex flex-col justify-between shadow-xl shadow-violet-500/10">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-violet-600 px-3 py-1 text-[10px] font-extrabold text-white uppercase tracking-wider">
              RECOMMENDED
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-white flex items-center gap-1.5">
                  Pro Studio <Zap className="h-4 w-4 text-amber-400 fill-amber-400" />
                </h3>
              </div>
              <p className="text-xs text-slate-400 mb-4">Untuk profesional & tim agen desain cepat.</p>
              <div className="mb-6">
                <span className="text-2xl font-black text-white">Rp 99.000</span>
                <span className="text-xs text-slate-500"> / bulan</span>
              </div>
              <ul className="space-y-3 text-xs text-slate-300 mb-6">
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400 shrink-0" /> AI Design Inspector (ZIP & Batch)</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400 shrink-0" /> Unlimited Task Pipeline</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400 shrink-0" /> Export Handoff (PDF & TXT)</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400 shrink-0" /> Dukungan Ekstraksi .SVG/.PDF/.FIG</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400 shrink-0" /> Deteksi Dimensi Piksel Real-time</li>
              </ul>
            </div>

            {currentTier === 'pro' ? (
              <button
                disabled
                type="button"
                className="w-full rounded-2xl bg-violet-500/20 border border-violet-500/30 py-3 text-xs font-semibold text-violet-300 flex items-center justify-center gap-2 cursor-default"
              >
                <UserCheck className="h-4 w-4" /> Paket Saat Ini (Aktif)
              </button>
            ) : (
              <button
                type="button"
                disabled={loadingTier === 'pro'}
                onClick={() => handleSimulateUpgrade('pro')}
                className="w-full rounded-2xl bg-violet-600 py-3 text-xs font-semibold text-white hover:bg-violet-500 transition shadow-lg shadow-violet-600/30"
              >
                {loadingTier === 'pro' ? 'Memproses Upgrade...' : 'Simulasi Aktifkan Pro (Demo)'}
              </button>
            )}
          </div>

          {/* Card Enterprise */}
          <div className="rounded-3xl border border-slate-800 bg-slate-950/60 p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-white flex items-center gap-1.5">
                  Enterprise <Building2 className="h-4 w-4 text-violet-400" />
                </h3>
              </div>
              <p className="text-xs text-slate-400 mb-4">Untuk agensi & tim perusahaan.</p>
              <div className="mb-6">
                <span className="text-2xl font-black text-white">Rp 299.000</span>
                <span className="text-xs text-slate-500"> / bulan</span>
              </div>
              <ul className="space-y-3 text-xs text-slate-300 mb-6">
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400 shrink-0" /> Semua Fitur Studio Pro Tersedia</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400 shrink-0" /> Multi-User / Team Workspace</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400 shrink-0" /> Kelola Anggota & Roles Tim</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400 shrink-0" /> Custom Branding Logo Export</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400 shrink-0" /> Custom Master Checklist Studio</li>
              </ul>
            </div>

            {currentTier === 'enterprise' ? (
              <button
                disabled
                type="button"
                className="w-full rounded-2xl bg-violet-500/20 border border-violet-500/30 py-3 text-xs font-semibold text-violet-300 flex items-center justify-center gap-2 cursor-default"
              >
                <UserCheck className="h-4 w-4" /> Paket Saat Ini (Aktif)
              </button>
            ) : (
              <button
                type="button"
                disabled={loadingTier === 'enterprise'}
                onClick={() => handleSimulateUpgrade('enterprise')}
                className="w-full rounded-2xl border border-slate-700 bg-slate-800/80 py-3 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition"
              >
                {loadingTier === 'enterprise' ? 'Memproses...' : 'Simulasi Aktifkan Enterprise'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}