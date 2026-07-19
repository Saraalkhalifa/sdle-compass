import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';

export type QuestionRow = Database['public']['Tables']['questions']['Row'];
export type QuestionInsert = Database['public']['Tables']['questions']['Insert'];
export type OptionRow = Database['public']['Tables']['question_options']['Row'];
export type AttemptRow = Database['public']['Tables']['student_question_attempts']['Row'];

export type Difficulty = 'easy' | 'medium' | 'hard';

export type QuestionWithOptions = QuestionRow & { question_options: OptionRow[] };

export interface OptionFormData {
  text: string;
  text_ar: string;
  is_correct: boolean;
}

// ── Student queries ───────────────────────────────────────────────────

export function useQuestionsByTopic(topicId: string) {
  return useQuery({
    queryKey: ['questions', topicId],
    queryFn: async () => {
      if (!supabase) throw new Error('Supabase not configured');
      const { data, error } = await supabase
        .from('questions')
        .select('*, question_options(id, option_text, option_text_ar, is_correct, display_order)')
        .eq('topic_id', topicId)
        .order('display_order');
      if (error) throw error;
      const rows = (data ?? []) as unknown as QuestionWithOptions[];
      return rows.map((q) => ({
        ...q,
        question_options: [...q.question_options].sort((a, b) => a.display_order - b.display_order),
      }));
    },
    enabled: !!supabase && !!topicId,
  });
}

export function useAttemptsByQuestions(questionIds: string[]) {
  return useQuery({
    queryKey: ['question-attempts', ...questionIds],
    queryFn: async () => {
      if (!supabase) throw new Error('Supabase not configured');
      const { data, error } = await supabase
        .from('student_question_attempts')
        .select('*')
        .in('question_id', questionIds)
        .order('created_at', { ascending: false });
      if (error) throw error;
      // Keep only the most recent attempt per question
      const latest: Record<string, AttemptRow> = {};
      for (const attempt of data ?? []) {
        if (!latest[attempt.question_id]) latest[attempt.question_id] = attempt as AttemptRow;
      }
      return latest;
    },
    enabled: !!supabase && questionIds.length > 0,
  });
}

export function useSubmitAttempt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      questionId, selectedOptionId, isCorrect, questionIds,
    }: { questionId: string; selectedOptionId: string; isCorrect: boolean; questionIds: string[] }) => {
      if (!supabase) throw new Error('Supabase not configured');
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error('Not authenticated');
      const { error } = await supabase.from('student_question_attempts').insert({
        user_id: session.user.id,
        question_id: questionId,
        selected_option_id: selectedOptionId,
        is_correct: isCorrect,
      });
      if (error) throw error;
      return questionIds;
    },
    onSuccess: (questionIds) => {
      queryClient.invalidateQueries({ queryKey: ['question-attempts', ...questionIds] });
      queryClient.invalidateQueries({ queryKey: ['my-attempt-summary'] });
      queryClient.invalidateQueries({ queryKey: ['performance-summary'] });
      queryClient.invalidateQueries({ queryKey: ['accuracy-by-topic'] });
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

// ── Question Bank (student practice view) ─────────────────────────────

export type QuestionForBank = QuestionWithOptions & {
  topics: {
    id: string; name: string; subject_id: string;
    subjects: { id: string; name: string } | null;
  } | null;
};

export interface AttemptSummary {
  total: number;
  correct: number;
  latestIsCorrect: boolean | null;
}

export function useAllQuestionsForBank() {
  return useQuery({
    queryKey: ['all-questions-for-bank'],
    queryFn: async (): Promise<QuestionForBank[]> => {
      if (!supabase) throw new Error('Supabase not configured');
      const { data, error } = await supabase
        .from('questions')
        .select('*, question_options(id, option_text, option_text_ar, is_correct, display_order), topics(id, name, subject_id, subjects(id, name))')
        .eq('is_active', true)
        .order('topic_id')
        .order('display_order');
      if (error) throw error;
      const rows = (data ?? []) as unknown as QuestionForBank[];
      return rows.map((q) => ({
        ...q,
        question_options: [...q.question_options].sort((a, b) => a.display_order - b.display_order),
      }));
    },
    enabled: !!supabase,
  });
}

export function useMyAttemptSummary() {
  return useQuery({
    queryKey: ['my-attempt-summary'],
    queryFn: async (): Promise<Map<string, AttemptSummary>> => {
      if (!supabase) throw new Error('Supabase not configured');
      const { data, error } = await supabase
        .from('student_question_attempts')
        .select('question_id, is_correct')
        .order('created_at', { ascending: true });
      if (error) throw error;
      const map = new Map<string, AttemptSummary>();
      for (const row of data ?? []) {
        const entry = map.get(row.question_id) ?? { total: 0, correct: 0, latestIsCorrect: null };
        entry.total++;
        if (row.is_correct) entry.correct++;
        entry.latestIsCorrect = row.is_correct;
        map.set(row.question_id, entry);
      }
      return map;
    },
    enabled: !!supabase,
  });
}

// ── Admin mutations ───────────────────────────────────────────────────

export function useUpsertQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      question, options,
    }: { question: QuestionInsert & { id?: string }; options: OptionFormData[] }) => {
      if (!supabase) throw new Error('Supabase not configured');
      let questionId = question.id;

      if (questionId) {
        const { id: _id, ...rest } = question;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await supabase.from('questions').update(rest as any).eq('id', questionId);
        if (error) throw error;
      } else {
        const { id: _id, ...rest } = question;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await supabase.from('questions').insert(rest as any).select('id').single();
        if (error) throw error;
        questionId = (data as { id: string }).id;
      }

      // Replace all options (delete + re-insert)
      const { error: delErr } = await supabase.from('question_options').delete().eq('question_id', questionId);
      if (delErr) throw delErr;

      const optionRows = options.map((o, i) => ({
        question_id: questionId as string,
        option_text: o.text.trim(),
        option_text_ar: o.text_ar.trim(),
        is_correct: o.is_correct,
        display_order: i,
      }));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: insErr } = await supabase.from('question_options').insert(optionRows as any);
      if (insErr) throw insErr;

      return question.topic_id;
    },
    onSuccess: (topicId) => {
      queryClient.invalidateQueries({ queryKey: ['questions', topicId] });
      toast.success('Question saved.');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export type QuestionWithTopic = QuestionWithOptions & {
  topics: { id: string; name: string } | null;
};

export function useAllQuestions() {
  return useQuery({
    queryKey: ['all-questions'],
    queryFn: async () => {
      if (!supabase) throw new Error('Supabase not configured');
      const { data, error } = await supabase
        .from('questions')
        .select('*, question_options(id, option_text, option_text_ar, is_correct, display_order), topics(id, name)')
        .order('topic_id')
        .order('display_order');
      if (error) throw error;
      const rows = (data ?? []) as unknown as QuestionWithTopic[];
      return rows.map((q) => ({
        ...q,
        question_options: [...q.question_options].sort((a, b) => a.display_order - b.display_order),
      }));
    },
    enabled: !!supabase,
  });
}

export type QuestionAdmin = QuestionWithOptions & {
  topics: {
    id: string; name: string; subject_id: string;
    subjects: { id: string; name: string } | null;
  } | null;
};

export function useAllQuestionsAdmin() {
  return useQuery({
    queryKey: ['all-questions-admin'],
    queryFn: async (): Promise<QuestionAdmin[]> => {
      if (!supabase) throw new Error('Supabase not configured');
      const { data, error } = await supabase
        .from('questions')
        .select('*, question_options(id, option_text, option_text_ar, is_correct, display_order), topics(id, name, subject_id, subjects(id, name))')
        .order('created_at', { ascending: false });
      if (error) throw error;
      const rows = (data ?? []) as unknown as QuestionAdmin[];
      return rows.map((q) => ({
        ...q,
        question_options: [...q.question_options].sort((a, b) => a.display_order - b.display_order),
      }));
    },
    enabled: !!supabase,
  });
}

export function useToggleQuestionActive() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      if (!supabase) throw new Error('Supabase not configured');
      const { error } = await supabase.from('questions').update({ is_active: isActive }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-questions-admin'] });
      queryClient.invalidateQueries({ queryKey: ['all-questions-for-bank'] });
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useDeleteQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, topicId }: { id: string; topicId: string }) => {
      if (!supabase) throw new Error('Supabase not configured');
      const { error } = await supabase.from('questions').delete().eq('id', id);
      if (error) throw error;
      return topicId;
    },
    onSuccess: (topicId) => {
      queryClient.invalidateQueries({ queryKey: ['questions', topicId] });
      toast.success('Question deleted.');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}
