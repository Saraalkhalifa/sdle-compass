import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';

export type ErrorReportRow    = Database['public']['Tables']['error_reports']['Row'];
export type ErrorReportInsert = Database['public']['Tables']['error_reports']['Insert'];
export type ErrorReportType   = ErrorReportRow['type'];
export type ErrorReportStatus = ErrorReportRow['status'];

export type ErrorReportAdmin = ErrorReportRow & {
  users: { full_name: string; email: string } | null;
  questions: { question_text: string } | null;
};

// ── Student: submit a report ──────────────────────────────────────────────────

export function useReportError() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Omit<ErrorReportInsert, 'user_id'>) => {
      if (!supabase) throw new Error('Supabase not configured');
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('error_reports')
        .insert({ ...payload, user_id: session.user.id } as ErrorReportInsert);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-error-reports'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-counts'] });
      toast.success('Report submitted. Thank you for helping us improve!');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

// ── Admin: list all reports ───────────────────────────────────────────────────

export function useAllErrorReports() {
  return useQuery({
    queryKey: ['admin-error-reports'],
    queryFn: async (): Promise<ErrorReportAdmin[]> => {
      if (!supabase) throw new Error('Supabase not configured');
      const { data, error } = await supabase
        .from('error_reports')
        .select('*, users(full_name, email), questions(question_text)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as ErrorReportAdmin[];
    },
    enabled: !!supabase,
  });
}

// ── Admin: update report status ───────────────────────────────────────────────

export function useUpdateErrorReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      status,
      adminNotes,
    }: {
      id: string;
      status: ErrorReportStatus;
      adminNotes?: string;
    }) => {
      if (!supabase) throw new Error('Supabase not configured');
      const update: Database['public']['Tables']['error_reports']['Update'] = {
        status,
        admin_notes: adminNotes ?? null,
        resolved_at: (status === 'resolved' || status === 'dismissed') ? new Date().toISOString() : null,
      };
      const { error } = await supabase.from('error_reports').update(update).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-error-reports'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-counts'] });
      toast.success('Report updated.');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}
