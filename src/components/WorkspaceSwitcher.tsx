import { Building2, Check, ChevronDown, Plus, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { createOrganization, getUserOrganizations } from '../services/organizationService';

type Workspace = {
  id: string;
  name: string;
};

type WorkspaceSwitcherProps = {
  currentOrgId: string | null;
  subscriptionTier: 'starter' | 'pro' | 'enterprise';
  onSelectWorkspace: (orgId: string | null, orgName: string) => void;
  onOpenPricing: () => void;
};

export function WorkspaceSwitcher({
  currentOrgId,
  subscriptionTier,
  onSelectWorkspace,
  onOpenPricing,
}: WorkspaceSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [newOrgName, setNewOrgName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadWorkspaces() {
      const orgs = await getUserOrganizations();
      setWorkspaces(orgs.map((o) => ({ id: o.id, name: o.name })));
    }
    loadWorkspaces();
  }, [currentOrgId]);

  const activeWorkspaceName =
    currentOrgId
      ? workspaces.find((w) => w.id === currentOrgId)?.name || 'Enterprise Team'
      : 'Personal Workspace';

  const handleCreateTeamClick = () => {
    setIsOpen(false);
    // CEGAT: Jika belum Enterprise, suruh upgrade dulu via Pricing Modal!
    if (subscriptionTier !== 'enterprise') {
      onOpenPricing();
    } else {
      setIsCreateModalOpen(true);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName.trim()) return;

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User belum login');

      const createdOrg = await createOrganization(newOrgName.trim());
      if (createdOrg) {
        setWorkspaces((prev) => [...prev, { id: createdOrg.id, name: createdOrg.name }]);
        onSelectWorkspace(createdOrg.id, createdOrg.name);
        setNewOrgName('');
        setIsCreateModalOpen(false);
      }
    } catch (err) {
      console.error('Gagal membuat organisasi:', err);
      alert('Gagal membuat tim baru. Pastikan tabel Supabase sudah sesuai.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative">
      {/* Dropdown Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/90 p-3 text-left hover:border-slate-700 transition shadow-sm"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
            <Building2 className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              {currentOrgId ? 'ENTERPRISE TEAM' : 'STARTER / PRO'}
            </p>
            <p className="truncate text-xs font-bold text-white">{activeWorkspaceName}</p>
          </div>
        </div>
        <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 rounded-2xl border border-slate-800 bg-slate-900 p-2 shadow-xl backdrop-blur-xl animate-in fade-in duration-150">
          <div className="space-y-1">
            {/* Personal Workspace */}
            <button
              type="button"
              onClick={() => {
                onSelectWorkspace(null, 'Personal Workspace');
                setIsOpen(false);
              }}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs font-medium transition ${
                !currentOrgId ? 'bg-violet-500/10 text-violet-300' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <span>Personal Workspace</span>
              {!currentOrgId && <Check className="h-4 w-4 text-violet-400" />}
            </button>

            {/* List Team Workspaces */}
            {workspaces.map((ws) => {
              const isSelected = ws.id === currentOrgId;
              return (
                <button
                  key={ws.id}
                  type="button"
                  onClick={() => {
                    onSelectWorkspace(ws.id, ws.name);
                    setIsOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs font-medium transition ${
                    isSelected ? 'bg-violet-500/10 text-violet-300' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span className="truncate">{ws.name}</span>
                  {isSelected && <Check className="h-4 w-4 text-violet-400" />}
                </button>
              );
            })}
          </div>

          <div className="my-2 border-t border-slate-800/80" />

          {/* Tombol Buat Tim Baru (Ada indikator Kunci jika bukan Enterprise) */}
          <button
            type="button"
            onClick={handleCreateTeamClick}
            className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold text-violet-400 hover:bg-violet-500/10 transition"
          >
            <span className="flex items-center gap-2">
              <Plus className="h-4 w-4" /> + Buat Tim Baru
            </span>
            {subscriptionTier !== 'enterprise' && (
              <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                <Sparkles className="h-2.5 w-2.5" /> Enterprise
              </span>
            )}
          </button>
        </div>
      )}

      {/* Modal Ketik Nama Tim Baru */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-1">Buat Enterprise Team Baru</h3>
            <p className="text-xs text-slate-400 mb-5">
              Masukkan nama studio atau agensi untuk membuat ruang kerja bersama tim.
            </p>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Nama Tim / Agensi *</label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="cth: Studio ABC / Agensi Kreatif..."
                  value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                  className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-xs text-white placeholder-slate-500 outline-none focus:border-violet-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 rounded-2xl border border-slate-800 bg-slate-800/50 py-3 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 rounded-2xl bg-violet-600 py-3 text-xs font-semibold text-white hover:bg-violet-500 transition shadow-lg shadow-violet-600/20"
                >
                  {isSubmitting ? 'Memproses...' : 'Buat Tim'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}