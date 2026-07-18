/**
 * Supabase database type definitions.
 * Generated manually for Phase 1; replace with `supabase gen types` output after Phase 2 migrations.
 */
export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          role: UserRole;
          account_status: AccountStatus;
          preferred_language: 'en' | 'ar';
          university: string | null;
          graduation_year: number | null;
          exam_date: string | null;
          weekly_hours: number | null;
          previous_attempt: boolean;
          avatar_color: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole;
      account_status: AccountStatus;
    };
  };
}

export type UserRole = 'student' | 'editor' | 'reviewer' | 'admin' | 'main_admin';
export type AccountStatus = 'pending' | 'active' | 'suspended' | 'deleted';
