import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';
import type { QuestionWithOptions } from './useQuestions';

export type ExamRow = Database['public']['Tables']['mock_exams']['Row'];
export type ExamInsert = Database['public']['Tables']['mock_exams']['Insert'];
export type ExamQuestionRow = Database['public']['Tables']['mock_exam_questions']['Row'];
export type SessionRow = Database['public']['Tables']['student_exam_sessions']['Row'];
export type AnswerRow = Database['public']['Tables']['student_exam_answers']['Row'];

export type ExamWithCount = ExamRow & { mock_exam_questions: [{ count: number }] };

export type ExamQuestionJoin = {
  id: string;
  display_order: number;
  question_id: string;
  questions: QuestionWithOptions;
};
export type ExamWithQuestions = ExamRow & { mock_exam_questions: ExamQuestionJoin[] };

// ── Student queries ───────────────────────────────────────────────────

export function useMockExams() {
  return useQuery({
    queryKey: ['mock-exams'],
    queryFn: async () => {
      if (!supabase) throw new Error('Supabase not configured');
      const { data, error } = await supabase
        .from('mock_exams')
        .select('*, mock_exam_questions(count)')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as ExamWithCount[];
    },
    enabled: !!supabase,
  });
}

export function useMockExamWithQuestions(examId: string) {
  return useQuery({
    queryKey: ['mock-exam', examId],
    queryFn: async () => {
      if (!supabase) throw new Error('Supabase not configured');
      const { data, error } = await supabase
        .from('mock_exams')
        .select('*, mock_exam_questions(id, display_order, question_id, questions(*, question_options(id, option_text, option_text_ar, is_correct, display_order)))')
        .eq('id', examId)
        .single();
      if (error) throw error;
      const exam = data as unknown as ExamWithQuestions;
      exam.mock_exam_questions = [...exam.mock_exam_questions]
        .sort((a, b) => a.display_order - b.display_order)
        .map((eq) => ({
          ...eq,
          questions: {
            ...eq.questions,
            question_options: [...eq.questions.question_options].sort((a, b) => a.display_order - b.display_order),
          },
        }));
      return exam;
    },
    enabled: !!supabase && !!examId,
  });
}

export function useLatestExamSession(examId: string) {
  return useQuery({
    queryKey: ['exam-session-latest', examId],
    queryFn: async () => {
      if (!supabase) throw new Error('Supabase not configured');
      const { data: { session: authSession } } = await supabase.auth.getSession();
      if (!authSession?.user) return null;
      const { data, error } = await supabase
        .from('student_exam_sessions')
        .select('*')
        .eq('exam_id', examId)
        .eq('user_id', authSession.user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as SessionRow | null;
    },
    enabled: !!supabase && !!examId,
  });
}

export function useExamSession(sessionId: string) {
  return useQuery({
    queryKey: ['exam-session', sessionId],
    queryFn: async () => {
      if (!supabase) throw new Error('Supabase not configured');
      const { data, error } = await supabase
        .from('student_exam_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();
      if (error) throw error;
      return data as SessionRow;
    },
    enabled: !!supabase && !!sessionId,
  });
}

export function useExamAnswers(sessionId: string) {
  return useQuery({
    queryKey: ['exam-answers', sessionId],
    queryFn: async () => {
      if (!supabase) throw new Error('Supabase not configured');
      const { data, error } = await supabase
        .from('student_exam_answers')
        .select('*')
        .eq('session_id', sessionId);
      if (error) throw error;
      const map: Record<string, AnswerRow> = {};
      for (const a of data ?? []) map[a.question_id] = a as AnswerRow;
      return map;
    },
    enabled: !!supabase && !!sessionId,
  });
}

export function useStartExamSession() {
  return useMutation({
    mutationFn: async (examId: string) => {
      if (!supabase) throw new Error('Supabase not configured');
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('student_exam_sessions')
        .insert({ user_id: session.user.id, exam_id: examId })
        .select('id')
        .single();
      if (error) throw error;
      return (data as { id: string }).id;
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useSaveAnswer() {
  return useMutation({
    mutationFn: async ({
      sessionId, questionId, selectedOptionId, isCorrect,
    }: { sessionId: string; questionId: string; selectedOptionId: string; isCorrect: boolean }) => {
      if (!supabase) throw new Error('Supabase not configured');
      const { error } = await supabase
        .from('student_exam_answers')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .upsert({ session_id: sessionId, question_id: questionId, selected_option_id: selectedOptionId, is_correct: isCorrect } as any, { onConflict: 'session_id,question_id' });
      if (error) throw error;
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useSubmitExamSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      sessionId, examId, score, isPassed, timeTakenSecs,
    }: { sessionId: string; examId: string; score: number; isPassed: boolean; timeTakenSecs: number }) => {
      if (!supabase) throw new Error('Supabase not configured');
      const { error } = await supabase
        .from('student_exam_sessions')
        .update({ submitted_at: new Date().toISOString(), score, is_passed: isPassed, time_taken_secs: timeTakenSecs })
        .eq('id', sessionId);
      if (error) throw error;
      return { sessionId, examId };
    },
    onSuccess: ({ sessionId, examId }) => {
      queryClient.invalidateQueries({ queryKey: ['exam-session', sessionId] });
      queryClient.invalidateQueries({ queryKey: ['exam-session-latest', examId] });
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

// ── Admin queries / mutations ─────────────────────────────────────────

export function useAllMockExams() {
  return useQuery({
    queryKey: ['admin-mock-exams'],
    queryFn: async () => {
      if (!supabase) throw new Error('Supabase not configured');
      const { data, error } = await supabase
        .from('mock_exams')
        .select('*, mock_exam_questions(count)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as ExamWithCount[];
    },
    enabled: !!supabase,
  });
}

export function useUpsertMockExam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (exam: ExamInsert & { id?: string }) => {
      if (!supabase) throw new Error('Supabase not configured');
      if (exam.id) {
        const { id, ...rest } = exam;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await supabase.from('mock_exams').update(rest as any).eq('id', id);
        if (error) throw error;
        return id;
      } else {
        const { id: _id, ...rest } = exam;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await supabase.from('mock_exams').insert(rest as any).select('id').single();
        if (error) throw error;
        return (data as { id: string }).id;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-mock-exams'] });
      toast.success('Exam saved.');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useDeleteMockExam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!supabase) throw new Error('Supabase not configured');
      const { error } = await supabase.from('mock_exams').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-mock-exams'] });
      toast.success('Exam deleted.');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useAddExamQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ examId, questionId, displayOrder }: { examId: string; questionId: string; displayOrder: number }) => {
      if (!supabase) throw new Error('Supabase not configured');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await supabase.from('mock_exam_questions').insert({ exam_id: examId, question_id: questionId, display_order: displayOrder } as any);
      if (error) throw error;
      return examId;
    },
    onSuccess: (examId) => {
      queryClient.invalidateQueries({ queryKey: ['mock-exam', examId] });
      queryClient.invalidateQueries({ queryKey: ['admin-mock-exams'] });
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useRemoveExamQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, examId }: { id: string; examId: string }) => {
      if (!supabase) throw new Error('Supabase not configured');
      const { error } = await supabase.from('mock_exam_questions').delete().eq('id', id);
      if (error) throw error;
      return examId;
    },
    onSuccess: (examId) => {
      queryClient.invalidateQueries({ queryKey: ['mock-exam', examId] });
      queryClient.invalidateQueries({ queryKey: ['admin-mock-exams'] });
    },
    onError: (err: Error) => toast.error(err.message),
  });
}
