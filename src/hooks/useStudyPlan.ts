import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';

type SessionRow = Database['public']['Tables']['study_sessions']['Row'];

export type StudySessionWithRefs = SessionRow & {
  topics: { id: string; name: string } | null;
  subjects: { id: string; name: string } | null;
};

// Returns ISO date string for today + offset days
function offsetDate(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

const QUERY_KEY = 'study-sessions-week';

// ── Read ──────────────────────────────────────────────────────────────────────

export function useWeekSessions() {
  const startDate = offsetDate(0);
  const endDate = offsetDate(6);
  return useQuery({
    queryKey: [QUERY_KEY, startDate],
    queryFn: async (): Promise<StudySessionWithRefs[]> => {
      if (!supabase) throw new Error('Supabase not configured');
      const { data, error } = await supabase
        .from('study_sessions')
        .select('*, topics(id, name), subjects(id, name)')
        .gte('scheduled_date', startDate)
        .lte('scheduled_date', endDate)
        .order('scheduled_date')
        .order('created_at');
      if (error) throw error;
      return (data ?? []) as unknown as StudySessionWithRefs[];
    },
    enabled: !!supabase,
  });
}

// ── Write ─────────────────────────────────────────────────────────────────────

export function useMarkSessionComplete() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, undo }: { id: string; undo?: boolean }) => {
      if (!supabase) throw new Error('Supabase not configured');
      const { error } = await supabase
        .from('study_sessions')
        .update(
          undo
            ? { is_completed: false, completed_at: null }
            : { is_completed: true, completed_at: new Date().toISOString() }
        )
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useCreateStudySession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: {
      title: string;
      scheduled_date: string;
      duration_mins: number;
      session_type: 'study' | 'review' | 'mock_exam' | 'break';
    }) => {
      if (!supabase) throw new Error('Supabase not configured');
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');
      const { error } = await supabase.from('study_sessions').insert({
        user_id: session.user.id,
        ...values,
      } as any);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useDeleteStudySession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!supabase) throw new Error('Supabase not configured');
      const { error } = await supabase.from('study_sessions').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

// ── Generate plan ─────────────────────────────────────────────────────────────

const DAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const DAY_HOUR_KEYS = [
  'sunday_hours', 'monday_hours', 'tuesday_hours', 'wednesday_hours',
  'thursday_hours', 'friday_hours', 'saturday_hours',
] as const;

const CONF_RANK: Record<string, number> = {
  very_low: 0, low: 1, medium: 2, high: 3, very_high: 4,
};

function parseSessionMins(preferred: string | undefined): number {
  const n = parseInt(preferred ?? '', 10);
  if (!isNaN(n) && n > 0) return n;
  if (preferred === 'short') return 30;
  if (preferred === 'long') return 90;
  return 60;
}

export function useGenerateWeeklyPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!supabase) throw new Error('Supabase not configured');
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');
      const uid = session.user.id;

      const [availRes, topicsRes, progressRes, confRes] = await Promise.all([
        supabase.from('student_availability').select('*').eq('user_id', uid).maybeSingle(),
        supabase.from('topics').select('id, name, subject_id, estimated_hours, subjects(id, name)').eq('is_active', true).order('subject_id').order('display_order'),
        supabase.from('student_topic_progress').select('topic_id, status').eq('user_id', uid),
        supabase.from('subject_confidence').select('subject_id, confidence_level').eq('user_id', uid),
      ]);

      if (availRes.error) throw availRes.error;
      if (topicsRes.error) throw topicsRes.error;

      const availability = availRes.data;
      const allTopics = (topicsRes.data ?? []) as unknown as Array<{
        id: string; name: string; subject_id: string; estimated_hours: number;
        subjects: { id: string; name: string } | null;
      }>;
      const progress = progressRes.data ?? [];
      const confidence = confRes.data ?? [];

      const completedIds = new Set(progress.filter(p => p.status === 'completed').map(p => p.topic_id));
      const confMap: Record<string, number> = {};
      for (const c of confidence) confMap[c.subject_id] = CONF_RANK[c.confidence_level] ?? 2;

      const remaining = allTopics
        .filter(t => !completedIds.has(t.id))
        .sort((a, b) => {
          const ac = confMap[a.subject_id] ?? 2;
          const bc = confMap[b.subject_id] ?? 2;
          return ac !== bc ? ac - bc : a.estimated_hours - b.estimated_hours;
        });

      const sessionMins = parseSessionMins(availability?.preferred_session_length);

      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      const newSessions: Array<{
        user_id: string; topic_id: string | null; subject_id: string | null;
        session_type: 'study' | 'review'; scheduled_date: string; duration_mins: number; title: string;
      }> = [];

      let topicIndex = 0;
      const topicsPool = remaining.length > 0 ? remaining : allTopics;
      const defaultType: 'study' | 'review' = remaining.length > 0 ? 'study' : 'review';

      for (let i = 0; i < 7; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        const dateStr = d.toISOString().split('T')[0];
        const dayName = DAY_NAMES[d.getDay()];
        const hourKey = DAY_HOUR_KEYS[d.getDay()];

        if (availability?.rest_day?.toLowerCase() === dayName) continue;

        const dailyHours = availability ? Number(availability[hourKey]) : 2;
        if (dailyHours <= 0) continue;

        const numSessions = Math.max(1, Math.floor((dailyHours * 60) / sessionMins));

        for (let s = 0; s < numSessions; s++) {
          if (topicsPool.length === 0) break;
          const topic = topicsPool[topicIndex % topicsPool.length];
          newSessions.push({
            user_id: uid,
            topic_id: topic.id,
            subject_id: topic.subject_id,
            session_type: defaultType,
            scheduled_date: dateStr,
            duration_mins: sessionMins,
            title: topic.name,
          });
          topicIndex++;
        }
      }

      // Delete existing future incomplete sessions before inserting
      const { error: delErr } = await supabase
        .from('study_sessions')
        .delete()
        .eq('user_id', uid)
        .gte('scheduled_date', todayStr)
        .eq('is_completed', false);
      if (delErr) throw delErr;

      if (newSessions.length > 0) {
        const { error: insErr } = await supabase.from('study_sessions').insert(newSessions as any);
        if (insErr) throw insErr;
      }

      return newSessions.length;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}
