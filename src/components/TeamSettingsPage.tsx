import { Building2, UserPlus, Shield, Users, AlertCircle, CheckCircle2, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getOrganizationMembers, inviteMemberByEmail, removeMemberFromOrg, updateMemberRole } from '../services/organizationService';
import type { OrganizationMember, UserRole } from '../types/enterprise';

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

  const handleRemoveMember = async (memberId: string, role: string) => {
    if (role === 'owner') {
      setStatusMessage({ type: 'error', text: 'Pemilik tim (Owner) tidak dapat dihapus.' });
      return;
    }

    if (!confirm('Apakah kamu yakin ingin menghapus anggota ini dari tim?')) return;

    try {
      await removeMemberFromOrg(memberId);
      setStatusMessage({ type: 'success', text: 'Anggota berhasil dihapus dari tim.' });
      await fetchMembers();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menghapus anggota.';
      setStatusMessage({ type: 'error', text: msg });
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

  return (
    <div className="space-y-6">
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
                      onClick={() => handleRemoveMember(member.id, member.role)}
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
    </div>
  );
}