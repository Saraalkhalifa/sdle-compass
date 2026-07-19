import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import type { AccountStatus } from '@/types/database';

// ── Admin dashboard counts (lightweight — for top stat cards) ─────────────────

export interface AdminDashboardCounts {
  activeStudents: number;
  publishedQuestions: number;
  draftQuestions: number;
  openErrorReports: number;
}

export function useAdminDashboardCounts() {
  return useQuery({
    queryKey: ['admin-dashboard-counts'],
    queryFn: async (): Promise<AdminDashboardCounts> => {
      if (!supabase) throw new Error('Supabase not configured');
      const [studentsRes, questionsRes] = await Promise.all([
        supabase.from('users').select('account_status').not('role', 'in', '(main_admin,admin)'),
        supabase.from('questions').select('is_active'),
      ]);
      if (studentsRes.error) throw studentsRes.error;
      if (questionsRes.error) throw questionsRes.error;

      // Error reports table may not be migrated yet — degrade gracefully
      let openErrorReports = 0;
      try {
        const { data } = await supabase.from('error_reports').select('id').eq('status', 'open');
        openErrorReports = data?.length ?? 0;
      } catch { /* table not yet created */ }

      return {
        activeStudents:     (studentsRes.data ?? []).filter(u => u.account_status === 'active').length,
        publishedQuestions: (questionsRes.data ?? []).filter(q => q.is_active).length,
        draftQuestions:     (questionsRes.data ?? []).filter(q => !q.is_active).length,
        openErrorReports,
      };
    },
    enabled: !!supabase,
    staleTime: 2 * 60 * 1000,
  });
}

// ── Student roster ────────────────────────────────────────────────────────────

export interface StudentRow {
  id: string;
  email: string;
  full_name: string;
  role: string;
  account_status: AccountStatus;
  preferred_language: 'en' | 'ar';
  onboarding_completed: boolean;
  exam_date: string | null;
  university: string | null;
  avatar_color: string;
  created_at: string;
}

export function useAllStudents() {
  return useQuery({
    queryKey: ['admin-students'],
    queryFn: async (): Promise<StudentRow[]> => {
      if (!supabase) throw new Error('Supabase not configured');
      const { data, error } = await supabase
        .from('users')
        .select('id, email, full_name, role, account_status, preferred_language, onboarding_completed, exam_date, university, avatar_color, created_at')
        .not('role', 'in', '(main_admin,admin)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as StudentRow[];
    },
    enabled: !!supabase,
  });
}

export function useUpdateAccountStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: AccountStatus }) => {
      if (!supabase) throw new Error('Supabase not configured');
      const { error } = await supabase
        .from('users')
        .update({ account_status: status })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-students'] });
      toast.success('Student status updated.');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

// ── Platform statistics ───────────────────────────────────────────────────────

export interface PlatformStats {
  totalStudents: number;
  activeStudents: number;
  onboardingDone: number;
  examDateSet: number;
  arabicStudents: number;
  totalQuestions: number;
  activeQuestions: number;
  byDifficulty: { easy: number; medium: number; hard: number };
  totalAttempts: number;
  correctAttempts: number;
  accuracy: number;
  totalExamSessions: number;
  passedSessions: number;
  passRate: number;
  recentSignups: { date: string; count: number }[];
}

export function usePlatformStats() {
  return useQuery({
    queryKey: ['admin-platform-stats'],
    queryFn: async (): Promise<PlatformStats> => {
      if (!supabase) throw new Error('Supabase not configured');

      const [usersRes, questionsRes, attemptsRes, sessionsRes] = await Promise.all([
        supabase.from('users').select('role, account_status, onboarding_completed, preferred_language, exam_date, created_at'),
        supabase.from('questions').select('difficulty, is_active'),
        supabase.from('student_question_attempts').select('is_correct'),
        supabase.from('student_exam_sessions').select('is_passed'),
      ]);

      if (usersRes.error)    throw usersRes.error;
      if (questionsRes.error) throw questionsRes.error;
      if (attemptsRes.error)  throw attemptsRes.error;
      if (sessionsRes.error)  throw sessionsRes.error;

      const allUsers    = usersRes.data ?? [];
      const questions   = questionsRes.data ?? [];
      const attempts    = attemptsRes.data ?? [];
      const sessions    = sessionsRes.data ?? [];

      const students = allUsers.filter(u => u.role === 'student' || u.role === 'editor' || u.role === 'reviewer');
      const studentOnly = allUsers.filter(u => u.role === 'student');

      // Signups per day — last 30 days
      const now = Date.now();
      const DAY = 86_400_000;
      const signupMap = new Map<string, number>();
      for (let i = 29; i >= 0; i--) {
        const d = new Date(now - i * DAY);
        signupMap.set(d.toISOString().slice(0, 10), 0);
      }
      for (const u of studentOnly) {
        const day = u.created_at.slice(0, 10);
        if (signupMap.has(day)) signupMap.set(day, (signupMap.get(day) ?? 0) + 1);
      }
      const recentSignups = Array.from(signupMap.entries()).map(([date, count]) => ({ date, count }));

      const totalAttempts   = attempts.length;
      const correctAttempts = attempts.filter(a => a.is_correct).length;
      const totalSessions   = sessions.length;
      const passedSessions  = sessions.filter(s => s.is_passed).length;

      return {
        totalStudents:   studentOnly.length,
        activeStudents:  studentOnly.filter(s => s.account_status === 'active').length,
        onboardingDone:  studentOnly.filter(s => s.onboarding_completed).length,
        examDateSet:     studentOnly.filter(s => s.exam_date).length,
        arabicStudents:  studentOnly.filter(s => s.preferred_language === 'ar').length,
        totalQuestions:  questions.length,
        activeQuestions: questions.filter(q => q.is_active).length,
        byDifficulty: {
          easy:   questions.filter(q => q.difficulty === 'easy').length,
          medium: questions.filter(q => q.difficulty === 'medium').length,
          hard:   questions.filter(q => q.difficulty === 'hard').length,
        },
        totalAttempts,
        correctAttempts,
        accuracy: totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0,
        totalExamSessions: totalSessions,
        passedSessions,
        passRate: totalSessions > 0 ? Math.round((passedSessions / totalSessions) * 100) : 0,
        recentSignups,
      };
    },
    enabled: !!supabase,
    staleTime: 5 * 60 * 1000,
  });
}
