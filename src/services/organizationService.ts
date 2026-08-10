import { supabase } from '../lib/supabase';
import type { Organization, OrganizationMember, UserRole } from '../types/enterprise';

type OrganizationMemberWithOrg = {
  organization_id: string;
  organizations: Organization | null;
};

// 1. Ambil daftar organisasi yang diikuti pengguna
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

// 2. Buat Organisasi / Tim Baru via RPC Supabase
export async function createOrganization(name: string): Promise<Organization | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Pengguna belum login.');

  const slug = `${name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}-${Date.now().toString().slice(-4)}`;

  // Panggil RPC Function create_organization
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

// 3. Ambil daftar anggota dalam tim
export async function getOrganizationMembers(organizationId: string): Promise<OrganizationMember[]> {
  const { data, error } = await supabase
    .from('organization_members')
    .select('*')
    .eq('organization_id', organizationId);

  if (error) {
    console.error('Error fetching members:', error);
    return [];
  }

  return (data as OrganizationMember[]) || [];
}

// 4. Undang / Tambah Anggota Baru ke Tim
export async function inviteMemberToOrg(
  organizationId: string,
  targetUserId: string,
  role: UserRole = 'designer'
) {
  const { data, error } = await supabase
    .from('organization_members')
    .insert([{ organization_id: organizationId, user_id: targetUserId, role }]);

  if (error) {
    console.error('Error inviting member:', error);
    throw error;
  }

  return data;
}