import { Building2, Shield, UserPlus, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getOrganizationMembers, inviteMemberToOrg } from '../services/organizationService';
import type { OrganizationMember, UserRole } from '../types/enterprise';

type TeamSettingsPageProps = {
  organizationId: string;
  organizationName: string;
};

export function TeamSettingsPage({ organizationId, organizationName }: TeamSettingsPageProps) {
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [inviteUserId, setInviteUserId] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('designer');
  const [isLoading, setIsLoading] = useState(true);
  const [isInviting, setIsInviting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Helper fungsi untuk memuat ulang data anggota
  const fetchMembers = async () => {
    try {
      const data = await getOrganizationMembers(organizationId);
      setMembers(data);
    } catch (err) {
      console.error('Gagal memuat anggota tim', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const data = await getOrganizationMembers(organizationId);
        if (isMounted) {
          setMembers(data);
        }
      } catch (err) {
        console.error('Gagal memuat anggota tim', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [organizationId]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteUserId.trim()) return;

    setIsInviting(true);
    setMessage(null);

    try {
      await inviteMemberToOrg(organizationId, inviteUserId.trim(), selectedRole);
      setMessage({ type: 'success', text: 'Anggota tim berhasil ditambahkan!' });
      setInviteUserId('');
      await fetchMembers();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal menambahkan anggota tim.';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setIsInviting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      {/* Header Tim */}
      <div className="flex items-center gap-3 rounded-3xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-xl">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/20 text-violet-300 border border-violet-500/30">
          <Building2 className="h-6 w-6" />
        </div>
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-violet-400">Enterprise Workspace</span>
          <h2 className="text-2xl font-bold text-white">{organizationName}</h2>
        </div>
      </div>

      {/* Form Undang Anggota */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-xl space-y-4">
        <div className="flex items-center gap-2">
          <UserPlus className="h-5 w-5 text-violet-400" />
          <h3 className="text-base font-bold text-white">Undang Anggota / Desainer Baru</h3>
        </div>

        {message && (
          <div
            className={`rounded-xl p-3 text-xs font-medium border ${
              message.type === 'success'
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                : 'border-rose-500/30 bg-rose-500/10 text-rose-300'
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            required
            placeholder="Masukkan Supabase User ID / Email Anggota"
            value={inviteUserId}
            onChange={(e) => setInviteUserId(e.target.value)}
            className="flex-1 rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-violet-500"
          />

          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value as UserRole)}
            className="rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white outline-none focus:border-violet-500"
          >
            <option value="designer">Designer (Eksekutor QC)</option>
            <option value="reviewer">Reviewer / QA (Pemberi Approver)</option>
            <option value="admin">Admin (Pengelola Tim)</option>
          </select>

          <button
            type="submit"
            disabled={isInviting}
            className="rounded-xl bg-violet-600 px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-violet-500 disabled:opacity-50 shrink-0"
          >
            {isInviting ? 'Menambahkan...' : 'Tambah Anggota'}
          </button>
        </form>
      </div>

      {/* Daftar Anggota Tim */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-xl">
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-5 w-5 text-violet-400" />
          <h3 className="text-base font-bold text-white">Daftar Anggota Tim ({members.length})</h3>
        </div>

        {isLoading ? (
          <p className="text-xs text-slate-400">Memuat anggota tim...</p>
        ) : members.length === 0 ? (
          <p className="text-xs text-slate-400">Belum ada anggota tim lain.</p>
        ) : (
          <div className="space-y-2">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/60 p-3.5"
              >
                <div>
                  <p className="text-xs font-semibold text-white">User ID: {member.user_id}</p>
                  <p className="text-[10px] text-slate-400">
                    Bergabung: {new Date(member.created_at).toLocaleDateString()}
                  </p>
                </div>

                <span className="inline-flex items-center gap-1 rounded-full bg-violet-500/10 px-3 py-1 text-[10px] font-bold text-violet-300 border border-violet-500/20">
                  <Shield className="h-3 w-3" />
                  {member.role.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}