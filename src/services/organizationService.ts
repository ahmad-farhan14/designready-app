import { supabase } from '../lib/supabase';
import type { Organization, OrganizationMember, UserRole } from '../types/enterprise';

type OrganizationMemberWithOrg = {
  organization_id: string;
  organizations: Organization | null;
};

export type OrganizationMemberWithEmail = OrganizationMember & {
  email?: string;
};

// Interface lokal untuk hasil query join Supabase (menghindari 'any')
interface DBOrganizationMemberRow {
  id: string;
  organization_id: string;
  user_id: string;
  role: UserRole;
  created_at: string;
  profiles?: {
    email: string;
  } | null;
}

// 1. Ambil daftar organisasi pengguna
export async function getUserOrganizations(): Promise<Organization[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('organization_members')
    .select('organization_id, organizations(*)')
    .eq('user_id', user.id);

  if (error) {
    console.error('Error fetching organizations:', error);
    return [];
  }

  if (!data) return [];

  const typedData = data as unknown as OrganizationMemberWithOrg[];

  return typedData
    .map((item) => item.organizations)
    .filter((org): org is Organization => org !== null);
}

// 2. Buat Organisasi via RPC
export async function createOrganization(name: string): Promise<Organization | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Pengguna belum login.');

  const slug = `${name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}-${Date.now().toString().slice(-4)}`;

  const { data, error } = await supabase.rpc('create_organization', {
    org_name: name,
    org_slug: slug,
  });

  if (error) {
    console.error('Error creating organization via RPC:', error);
    throw new Error(error.message);
  }

  return data as Organization;
}

// 3. Ambil daftar anggota tim (Sudah diperbaiki tanpa tipe 'any')
export async function getOrganizationMembers(organizationId: string): Promise<OrganizationMemberWithEmail[]> {
  const { data, error } = await supabase
    .from('organization_members')
    .select(`
      id,
      organization_id,
      user_id,
      role,
      created_at,
      profiles:user_id (email)
    `)
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching members:', error);
    return [];
  }

  if (!data) return [];

  const rows = data as unknown as DBOrganizationMemberRow[];

  return rows.map((member) => ({
    id: member.id,
    organization_id: member.organization_id,
    user_id: member.user_id,
    role: member.role,
    created_at: member.created_at,
    email: member.profiles?.email || member.user_id,
  }));
}

// 4. Undang Anggota Baru Menggunakan Email
export async function inviteMemberByEmail(
  organizationId: string,
  email: string,
  role: UserRole = 'designer'
) {
  // Cari user_id berdasarkan email via RPC
  const { data: targetUserId, error: rpcError } = await supabase.rpc('get_user_id_by_email', {
    email_input: email,
  });

  if (rpcError || !targetUserId) {
    throw new Error('Pengguna dengan email tersebut tidak ditemukan atau belum terdaftar.');
  }

  // Insert ke organization_members
  const { data, error } = await supabase
    .from('organization_members')
    .insert([{ organization_id: organizationId, user_id: targetUserId, role }]);

  if (error) {
    if (error.code === '23505') {
      throw new Error('Pengguna ini sudah menjadi anggota tim.');
    }
    console.error('Error inviting member:', error);
    throw new Error(error.message);
  }

  return data;
}

// 5. Hapus Anggota dari Tim
export async function removeMemberFromOrg(memberId: string) {
  const { error } = await supabase
    .from('organization_members')
    .delete()
    .eq('id', memberId);

  if (error) {
    console.error('Error removing member:', error);
    throw new Error(`Gagal menghapus anggota: ${error.message}`);
  }
}

// 6. Ubah Role Anggota
export async function updateMemberRole(memberId: string, newRole: UserRole) {
  const { error } = await supabase
    .from('organization_members')
    .update({ role: newRole })
    .eq('id', memberId);

  if (error) {
    console.error('Error updating member role:', error);
    throw new Error(`Gagal mengubah role: ${error.message}`);
  }
}