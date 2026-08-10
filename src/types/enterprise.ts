export type UserRole = 'owner' | 'admin' | 'reviewer' | 'designer';

export type Organization = {
  id: string;
  name: string;
  slug?: string;
  logo_url?: string;
  subscription_status: 'inactive' | 'active' | 'trial' | 'cancelled';
  created_at: string;
  updated_at: string;
};

export type OrganizationMember = {
  id: string;
  organization_id: string;
  user_id: string;
  role: UserRole;
  created_at: string;
  user_email?: string;
  user_name?: string;
  avatar_url?: string;
};

export type TeamTask = {
  id: string;
  user_id: string;
  organization_id: string | null;
  title: string;
  category: string;
  progress: number;
  checked_state: Record<number, boolean>;
  created_at: string;
  updated_at: string;
};