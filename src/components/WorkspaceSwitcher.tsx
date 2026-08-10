import { Building2, Check, ChevronDown, Plus, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createOrganization, getUserOrganizations } from '../services/organizationService';
import type { Organization } from '../types/enterprise';

type WorkspaceSwitcherProps = {
  currentOrgId: string | null;
  onSelectWorkspace: (orgId: string | null, orgName: string) => void;
};

export function WorkspaceSwitcher({ currentOrgId, onSelectWorkspace }: WorkspaceSwitcherProps) {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    loadOrganizations();
  }, []);

  async function loadOrganizations() {
    const orgs = await getUserOrganizations();
    setOrganizations(orgs);
  }

  const currentOrg = organizations.find((o) => o.id === currentOrgId);
  const currentLabel = currentOrg ? currentOrg.name : 'Personal Workspace';

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName.trim()) return;

    setIsCreating(true);
    try {
      const created = await createOrganization(newOrgName.trim());
      if (created) {
        await loadOrganizations();
        onSelectWorkspace(created.id, created.name);
        setNewOrgName('');
        setShowCreateModal(false);
        setIsOpen(false);
      }
    } catch (err) {
      console.error('Gagal membuat organisasi', err);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="relative w-full">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between gap-2 rounded-2xl border border-slate-800 bg-slate-900/90 px-3.5 py-2.5 text-left transition hover:border-violet-500/40 hover:bg-slate-800/80"
      >
        <div className="flex items-center gap-2.5 truncate">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-violet-500/20 text-violet-300 border border-violet-500/30">
            {currentOrgId ? <Building2 className="h-4 w-4" /> : <User className="h-4 w-4" />}
          </div>
          <div className="truncate">
            <p className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
              {currentOrgId ? 'Enterprise Team' : 'Starter / Pro'}
            </p>
            <p className="truncate text-xs font-bold text-white">{currentLabel}</p>
          </div>
        </div>
        <ChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/95 p-1.5 backdrop-blur-xl shadow-2xl">
          <div className="px-2 py-1.5 text-[10px] font-semibold text-slate-400 uppercase">
            Pilih Ruang Kerja
          </div>

          <button
            type="button"
            onClick={() => {
              onSelectWorkspace(null, 'Personal Workspace');
              setIsOpen(false);
            }}
            className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs transition ${
              currentOrgId === null ? 'bg-violet-500/20 text-violet-200 font-semibold' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-2">
              <User className="h-3.5 w-3.5 text-slate-400" />
              <span>Personal Workspace</span>
            </div>
            {currentOrgId === null && <Check className="h-3.5 w-3.5 text-violet-400" />}
          </button>

          {organizations.map((org) => {
            const isSelected = currentOrgId === org.id;
            return (
              <button
                key={org.id}
                type="button"
                onClick={() => {
                  onSelectWorkspace(org.id, org.name);
                  setIsOpen(false);
                }}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs transition ${
                  isSelected ? 'bg-violet-500/20 text-violet-200 font-semibold' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <Building2 className="h-3.5 w-3.5 text-violet-400 shrink-0" />
                  <span className="truncate">{org.name}</span>
                </div>
                {isSelected && <Check className="h-3.5 w-3.5 text-violet-400 shrink-0" />}
              </button>
            );
          })}

          <div className="my-1 border-t border-slate-800" />

          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-semibold text-violet-300 transition hover:bg-violet-500/10"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Buat Tim / Perusahaan Baru</span>
          </button>
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Buat Team Workspace (Enterprise)</h3>
            <p className="mt-1 text-xs text-slate-400">
              Buat ruang kerja tim untuk mengundang desainer, mengagregasi task QC, dan mengelola branding perusahaan.
            </p>

            <form onSubmit={handleCreateOrg} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Nama Tim / Perusahaan</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Studio Agensi Kreatif"
                  value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-violet-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 transition hover:bg-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="rounded-xl bg-violet-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-violet-500 disabled:opacity-50"
                >
                  {isCreating ? 'Membuat...' : 'Buat Tim'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}