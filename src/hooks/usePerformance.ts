import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';

type SessionRow = Database['public']['Tables']['student_exam_sessions']['Row'];

// ── Exported types ────────────────────────────────────────────────────

export interface PerformanceSummary {
  totalAttempts: number;
  correctAttempts: number;
  accuracy: number;
  examsCompleted: number;
  avgExamScore: number;
  knownCards: number;
  totalCards: number;
}

export interface TopicAccuracy {
  id: string;
  name: string;
  total: number;
  correct: number;
  accuracy: number;
}

export interface ExamHistoryRow extends SessionRow {
  mock_exams: { id: string; title: string; passing_score: number; duration_mins: number } | null;
}

// ── Hooks ─────────────────────────────────────────────────────────────

export function usePerformanceSummary() {
  return useQuery({
    queryKey: ['performance-summary'],
    queryFn: async (): Promise<PerformanceSummary> => {
      if (!supabase) throw new Error('Supabase not configured');
      const [attemptsRes, sessionsRes, flashRes] = await Promise.all([
        supabase.from('student_question_attempts').select('is_correct'),
        supabase.from('student_exam_sessions').select('score').not('submitted_at', 'is', null),
        supabase.from('student_flashcard_progress').select('status'),
      ]);
      if (attemptsRes.error) throw attemptsRes.error;
      if (sessionsRes.error) throw sessionsRes.error;
      if (flashRes.error) throw flashRes.error;

      const attempts = attemptsRes.data ?? [];
      const sessions = sessionsRes.data ?? [];
      const flash = flashRes.data ?? [];

      const totalAttempts = attempts.length;
      const correctAttempts = attempts.filter((a) => a.is_correct).length;
      const accuracy = totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0;
      const examsCompleted = sessions.length;
      const avgExamScore = sessions.length > 0
        ? Math.round(sessions.reduce((sum, s) => sum + (s.score ?? 0), 0) / sessions.length)
        : 0;
      const knownCards = flash.filter((f) => f.status === 'known').length;
      const totalCards = flash.length;

      return { totalAttempts, correctAttempts, accuracy, examsCompleted, avgExamScore, knownCards, totalCards };
    },
    enabled: !!supabase,
  });
}

export function useQuestionAccuracyByTopic() {
  return useQuery({
    queryKey: ['accuracy-by-topic'],
    queryFn: async (): Promise<TopicAccuracy[]> => {
      if (!supabase) throw new Error('Supabase not configured');
      const { data, error } = await supabase
        .from('student_question_attempts')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .select('is_correct, questions!inner(topic_id, topics!inner(id, name))') as any;
      if (error) throw error;

      const topicMap = new Map<string, { name: string; total: number; correct: number }>();
      for (const attempt of (data ?? []) as Record<string, unknown>[]) {
        const topic = (attempt.questions as { topics: { id: string; name: string } } | null)?.topics;
        if (!topic) continue;
        if (!topicMap.has(topic.id)) topicMap.set(topic.id, { name: topic.name, total: 0, correct: 0 });
        const entry = topicMap.get(topic.id)!;
        entry.total++;
        if (attempt.is_correct) entry.correct++;
      }

      return Array.from(topicMap.entries())
        .map(([id, { name, total, correct }]) => ({
          id, name, total, correct,
          accuracy: total > 0 ? Math.round((correct / total) * 100) : 0,
        }))
        .sort((a, b) => b.total - a.total);
    },
    enabled: !!supabase,
  });
}

export function useExamHistory() {
  return useQuery({
    queryKey: ['exam-history'],
    queryFn: async (): Promise<ExamHistoryRow[]> => {
      if (!supabase) throw new Error('Supabase not configured');
      const { data, error } = await supabase
        .from('student_exam_sessions')
        .select('*, mock_exams(id, title, passing_score, duration_mins)')
        .not('submitted_at', 'is', null)
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return (data ?? []) as unknown as ExamHistoryRow[];
    },
    enabled: !!supabase,
  });
}

export function useFlashcardProgressCounts() {
  return useQuery({
    queryKey: ['flashcard-progress-counts'],
    queryFn: async () => {
      if (!supabase) throw new Error('Supabase not configured');
      const { data, error } = await supabase
        .from('student_flashcard_progress')
        .select('status');
      if (error) throw error;
      const counts = { new: 0, learning: 0, known: 0 };
      for (const row of data ?? []) {
        if (row.status === 'new' || row.status === 'learning' || row.status === 'known') {
          counts[row.status]++;
        }
      }
      return counts;
    },
    enabled: !!supabase,
  });
}

export function useTopicProgressSummary() {
  return useQuery({
    queryKey: ['topic-progress-summary'],
    queryFn: async () => {
      if (!supabase) throw new Error('Supabase not configured');
      const { data, error } = await supabase
        .from('student_topic_progress')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .select('status, topic_id, topics!inner(id, name, subjects!inner(id, name))') as any;
      if (error) throw error;
      return (data ?? []) as Array<{
        status: 'not_started' | 'in_progress' | 'completed';
        topic_id: string;
        topics: { id: string; name: string; subjects: { id: string; name: string } };
      }>;
    },
    enabled: !!supabase,
  });
}
