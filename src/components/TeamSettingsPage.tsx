import { Building2, UserPlus, Shield, Users, AlertCircle, CheckCircle2, Trash2, Upload, Check } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getOrganizationMembers, inviteMemberByEmail, removeMemberFromOrg, updateMemberRole } from '../services/organizationService';
import type { OrganizationMember, UserRole } from '../types/enterprise';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';

type TeamSettingsPageProps = {
  organizationId: string;
  organizationName: string;
};

export function TeamSettingsPage({ organizationId, organizationName }: TeamSettingsPageProps) {
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('designer');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // State Branding White-label
  const [studioName, setStudioName] = useState(organizationName || 'Studio Enterprise');
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
  const [brandingSaved, setBrandingSaved] = useState(false);

  // State Modal Konfirmasi Hapus Anggota
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<{ id: string; userId: string } | null>(null);

  const fetchMembers = async () => {
    const data = await getOrganizationMembers(organizationId);
    setMembers(data);
  };

  useEffect(() => {
    let isMounted = true;

    async function load() {
      const data = await getOrganizationMembers(organizationId);
      if (isMounted) {
        setMembers(data);
      }
    }

    load();

    return () => {
      isMounted = false;
    };
  }, [organizationId]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setLoading(true);
    setStatusMessage(null);

    try {
      await inviteMemberByEmail(organizationId, inviteEmail.trim(), inviteRole);
      setStatusMessage({ type: 'success', text: `Berhasil menambahkan ${inviteEmail} ke tim!` });
      setInviteEmail('');
      await fetchMembers();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal mengundang anggota.';
      setStatusMessage({ type: 'error', text: msg });
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (memberId: string, userId: string, role: string) => {
    if (role === 'owner') {
      setStatusMessage({ type: 'error', text: 'Pemilik tim (Owner) tidak dapat dihapus.' });
      return;
    }
    setMemberToDelete({ id: memberId, userId });
    setDeleteModalOpen(true);
  };

  const confirmDeleteMember = async () => {
    if (!memberToDelete) return;

    setLoading(true);
    try {
      await removeMemberFromOrg(memberToDelete.id);

      // Filter state lokal secara instan
      setMembers((prev) => prev.filter((m) => m.id !== memberToDelete.id));

      setStatusMessage({ type: 'success', text: 'Anggota berhasil dikeluarkan dari tim.' });
      setDeleteModalOpen(false);
      setMemberToDelete(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menghapus anggota.';
      setStatusMessage({ type: 'error', text: msg });
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (memberId: string, currentRole: string, newRole: UserRole) => {
    if (currentRole === 'owner') {
      setStatusMessage({ type: 'error', text: 'Role Pemilik (Owner) tidak dapat diubah.' });
      return;
    }

    try {
      await updateMemberRole(memberId, newRole);
      setStatusMessage({ type: 'success', text: 'Role anggota berhasil diperbarui.' });
      await fetchMembers();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal memperbarui role.';
      setStatusMessage({ type: 'error', text: msg });
    }
  };

  // Handler Upload Logo
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setLogoPreviewUrl(url);
      setBrandingSaved(false);
    }
  };

  const handleSaveBranding = () => {
    setBrandingSaved(true);
    setTimeout(() => setBrandingSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Modal Peringatan Hapus Anggota */}
      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        title="Keluarkan Anggota Tim?"
        description="Apakah kamu yakin ingin mengeluarkan anggota ini dari tim? Tindakan ini tidak dapat dibatalkan."
        itemName={`User ID: ${memberToDelete?.userId}`}
        loading={loading}
        onConfirm={confirmDeleteMember}
        onCancel={() => {
          setDeleteModalOpen(false);
          setMemberToDelete(null);
        }}
      />

      {/* Header Workspace */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/20 text-violet-300 border border-violet-500/30">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-violet-400">Enterprise Workspace</p>
            <h2 className="text-2xl font-bold text-white">{organizationName}</h2>
          </div>
        </div>
      </div>

      {/* Form Undang Anggota */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 backdrop-blur-xl">
        <div className="flex items-center gap-2 mb-4">
          <UserPlus className="h-5 w-5 text-violet-400" />
          <h3 className="text-lg font-bold text-white">Undang Anggota / Desainer Baru</h3>
        </div>

        {statusMessage && (
          <div
            className={`mb-4 flex items-center gap-2 rounded-2xl p-3.5 text-xs font-medium border ${
              statusMessage.type === 'success'
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                : 'border-rose-500/30 bg-rose-500/10 text-rose-300'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            required
            placeholder="Masukkan Alamat Email Desainer (cth: teman@gmail.com)..."
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            className="flex-1 rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-xs text-white placeholder-slate-500 outline-none focus:border-violet-500"
          />

          <select
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value as UserRole)}
            className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-xs text-white outline-none focus:border-violet-500"
          >
            <option value="designer">Designer (Eksekutor QC)</option>
            <option value="reviewer">Reviewer (Checker)</option>
            <option value="admin">Admin Tim</option>
          </select>

          <button
            type="submit"
            disabled={loading}
            className="rounded-2xl bg-violet-600 px-6 py-3 text-xs font-semibold text-white transition hover:bg-violet-500 disabled:opacity-50 shrink-0"
          >
            {loading ? 'Mengundang...' : 'Tambah Anggota'}
          </button>
        </form>
      </div>

      {/* Daftar Anggota & Manajemen */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 backdrop-blur-xl">
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-5 w-5 text-violet-400" />
          <h3 className="text-lg font-bold text-white">Daftar Anggota Tim ({members.length})</h3>
        </div>

        <div className="space-y-2">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between gap-4 rounded-2xl border border-slate-800/80 bg-slate-950/50 p-4"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-slate-300">
                  <Shield className="h-4 w-4" />
                </div>
                <div className="truncate">
                  <p className="text-xs font-mono text-slate-300 truncate">User ID: {member.user_id}</p>
                  <p className="text-[10px] text-slate-500">
                    Bergabung: {new Date(member.created_at).toLocaleDateString('id-ID')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {member.role === 'owner' ? (
                  <span className="rounded-xl bg-violet-500/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-violet-300 border border-violet-500/20">
                    Owner
                  </span>
                ) : (
                  <>
                    <select
                      value={member.role}
                      onChange={(e) => handleRoleChange(member.id, member.role, e.target.value as UserRole)}
                      className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-[11px] font-medium text-slate-300 outline-none focus:border-violet-500"
                    >
                      <option value="designer">Designer</option>
                      <option value="reviewer">Reviewer</option>
                      <option value="admin">Admin</option>
                    </select>

                    <button
                      onClick={() => openDeleteModal(member.id, member.user_id, member.role)}
                      title="Hapus Anggota"
                      className="flex h-8 w-8 items-center justify-center rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-400 transition hover:bg-rose-500 hover:text-white"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section Tambahan: Custom Branding & White-label Report */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Building2 className="h-5 w-5 text-violet-400" />
              <span>Custom Branding & White-label Report</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Logo dan nama agensimu akan otomatis dipasang pada header laporan ekspor PDF/TXT ke klien.
            </p>
          </div>
          <span className="rounded-full bg-violet-500/20 px-2.5 py-0.5 text-[10px] font-bold text-violet-300 border border-violet-500/30">
            ENTERPRISE
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-5">
          {/* Form Input Branding */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Nama Resmi Studio / Agensi</label>
              <input
                type="text"
                value={studioName}
                onChange={(e) => setStudioName(e.target.value)}
                placeholder="cth: ABC Creative Studio"
                className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-xs text-white placeholder-slate-500 outline-none focus:border-violet-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Upload Logo Agensi (PNG / SVG Transparan)</label>
              <div className="flex items-center gap-3">
                <label className="flex flex-1 cursor-pointer items-center justify-between rounded-2xl border border-dashed border-slate-700 bg-slate-950 px-4 py-3 text-xs text-slate-400 hover:border-violet-500 hover:text-white transition">
                  <span className="truncate">{logoPreviewUrl ? 'Logo Terpilih ✅' : 'Pilih File Logo...'}</span>
                  <Upload className="h-4 w-4 shrink-0 text-slate-500" />
                  <input type="file" accept="image/png,image/svg+xml" onChange={handleLogoUpload} className="hidden" />
                </label>

                <button
                  type="button"
                  onClick={handleSaveBranding}
                  className="rounded-2xl bg-violet-600 px-5 py-3 text-xs font-semibold text-white hover:bg-violet-500 transition shadow-lg shadow-violet-600/20 flex items-center gap-1.5 shrink-0"
                >
                  {brandingSaved && <Check className="h-4 w-4 text-emerald-300" />}
                  <span>{brandingSaved ? 'Tersimpan!' : 'Simpan Branding'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Live Preview Header Report */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 flex flex-col justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                Live Preview Header PDF Report Klien:
              </p>
              <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 text-left space-y-2">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    {logoPreviewUrl ? (
                      <img src={logoPreviewUrl} alt="Logo Studio" className="h-6 object-contain max-w-30]" />
                    ) : (
                      <span className="text-xs font-bold text-violet-400 font-mono">[{studioName.toUpperCase()}]</span>
                    )}
                  </div>
                  <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-md font-mono font-bold">
                    QC VERIFIED BY STUDIO
                  </span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">Design QC Handoff Report</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Prepared officially by: {studioName}</p>
                </div>
              </div>
            </div>

            <p className="text-[10px] text-slate-500 italic mt-3">
              * Header ini otomatis digunakan saat mengekspor PDF/TXT dari Enterprise Workspace.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}