import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { Database } from '@/types/database';

export type SubjectRow = Database['public']['Tables']['subjects']['Row'];
export type SubjectInsert = Database['public']['Tables']['subjects']['Insert'];
export type SubjectUpdate = Database['public']['Tables']['subjects']['Update'];
export type TopicRow = Database['public']['Tables']['topics']['Row'];
export type TopicInsert = Database['public']['Tables']['topics']['Insert'];
export type TopicUpdate = Database['public']['Tables']['topics']['Update'];
export type SubtopicRow = Database['public']['Tables']['subtopics']['Row'];
export type SubtopicInsert = Database['public']['Tables']['subtopics']['Insert'];
export type SubtopicUpdate = Database['public']['Tables']['subtopics']['Update'];
export type LORow = Database['public']['Tables']['learning_objectives']['Row'];
export type LOInsert = Database['public']['Tables']['learning_objectives']['Insert'];
export type LOUpdate = Database['public']['Tables']['learning_objectives']['Update'];
export type TopicProgressRow = Database['public']['Tables']['student_topic_progress']['Row'];

export type SubtopicWithObjectives = SubtopicRow & { learning_objectives: LORow[] };
export type TopicWithSubject = TopicRow & { subjects: SubjectRow };

// ── Subjects ────────────────────────────────────────────────────────

/** Fetch all subjects visible to the current user (RLS handles admin vs student). */
export function useSubjectsList() {
  return useQuery({
    queryKey: ['subjects'],
    queryFn: async () => {
      if (!supabase) throw new Error('Supabase not configured');
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .order('display_order');
      if (error) throw error;
      return data as SubjectRow[];
    },
    enabled: !!supabase,
  });
}

/** Fetch a single subject by ID. */
export function useSubject(id: string) {
  return useQuery({
    queryKey: ['subjects', id],
    queryFn: async () => {
      if (!supabase) throw new Error('Supabase not configured');
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as SubjectRow;
    },
    enabled: !!supabase && !!id,
  });
}

// ── Topics ──────────────────────────────────────────────────────────

/** Fetch all topics for a subject, ordered by display_order. */
export function useTopicsBySubject(subjectId: string) {
  return useQuery({
    queryKey: ['topics', 'by-subject', subjectId],
    queryFn: async () => {
      if (!supabase) throw new Error('Supabase not configured');
      const { data, error } = await supabase
        .from('topics')
        .select('*')
        .eq('subject_id', subjectId)
        .order('display_order');
      if (error) throw error;
      return data as TopicRow[];
    },
    enabled: !!supabase && !!subjectId,
  });
}

/** Fetch a single topic with its parent subject joined. */
export function useTopic(topicId: string) {
  return useQuery({
    queryKey: ['topics', topicId],
    queryFn: async () => {
      if (!supabase) throw new Error('Supabase not configured');
      const { data, error } = await supabase
        .from('topics')
        .select('*, subjects(*)')
        .eq('id', topicId)
        .single();
      if (error) throw error;
      return data as unknown as TopicWithSubject;
    },
    enabled: !!supabase && !!topicId,
  });
}

// ── Subtopics + LOs ─────────────────────────────────────────────────

/** Fetch all subtopics for a topic, each with their learning objectives. */
export function useSubtopicsWithObjectives(topicId: string) {
  return useQuery({
    queryKey: ['subtopics', topicId],
    queryFn: async () => {
      if (!supabase) throw new Error('Supabase not configured');
      const { data, error } = await supabase
        .from('subtopics')
        .select('*, learning_objectives(*)')
        .eq('topic_id', topicId)
        .order('display_order');
      if (error) throw error;
      return (data ?? []).map((st) => ({
        ...st,
        learning_objectives: [...((st.learning_objectives as unknown as LORow[]) ?? [])].sort(
          (a, b) => a.display_order - b.display_order,
        ),
      })) as SubtopicWithObjectives[];
    },
    enabled: !!supabase && !!topicId,
  });
}

// ── Student topic progress ──────────────────────────────────────────

/** Fetch the current user's progress for a list of topic IDs. Returns a map of topicId → status. */
export function useTopicProgress(topicIds: string[]) {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ['topic-progress', profile?.id, topicIds],
    queryFn: async () => {
      if (!supabase) throw new Error('Supabase not configured');
      if (!topicIds.length) return {} as Record<string, string>;
      const { data, error } = await supabase
        .from('student_topic_progress')
        .select('topic_id, status')
        .in('topic_id', topicIds);
      if (error) throw error;
      return Object.fromEntries((data ?? []).map((r) => [r.topic_id, r.status]));
    },
    enabled: !!supabase && !!profile?.id && topicIds.length > 0,
  });
}

/** Mutation to upsert a student's status for one topic. */
export function useUpsertTopicStatus() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      topicId,
      status,
    }: {
      topicId: string;
      status: 'not_started' | 'in_progress' | 'completed';
    }) => {
      if (!supabase || !profile?.id) throw new Error('Not authenticated');
      const { error } = await supabase.from('student_topic_progress').upsert(
        {
          user_id: profile.id,
          topic_id: topicId,
          status,
          last_studied_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,topic_id' },
      );
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topic-progress'] });
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });
}

// ── Admin mutations — subjects ───────────────────────────────────────

export function useUpsertSubject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: SubjectInsert & { id?: string }) => {
      if (!supabase) throw new Error('Supabase not configured');
      const { id, ...rest } = payload;
      if (id) {
        const { error } = await supabase.from('subjects').update(rest).eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('subjects').insert(rest);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      toast.success('Subject saved.');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useDeleteSubject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!supabase) throw new Error('Supabase not configured');
      const { error } = await supabase.from('subjects').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      toast.success('Subject deleted.');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useReorderSubjects() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (orderedIds: string[]) => {
      if (!supabase) throw new Error('Supabase not configured');
      await Promise.all(
        orderedIds.map((id, i) =>
          supabase!.from('subjects').update({ display_order: i + 1 }).eq('id', id),
        ),
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

// ── Admin mutations — topics ─────────────────────────────────────────

export function useUpsertTopic() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: TopicInsert & { id?: string }) => {
      if (!supabase) throw new Error('Supabase not configured');
      const { id, ...rest } = payload;
      if (id) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await supabase.from('topics').update(rest as any).eq('id', id);
        if (error) throw error;
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await supabase.from('topics').insert(rest as any);
        if (error) throw error;
      }
    },
    onSuccess: (_, payload) => {
      queryClient.invalidateQueries({ queryKey: ['topics', 'by-subject', payload.subject_id] });
      toast.success('Topic saved.');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useDeleteTopic() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ topicId, subjectId }: { topicId: string; subjectId: string }) => {
      if (!supabase) throw new Error('Supabase not configured');
      const { error } = await supabase.from('topics').delete().eq('id', topicId);
      if (error) throw error;
      return subjectId;
    },
    onSuccess: (subjectId) => {
      queryClient.invalidateQueries({ queryKey: ['topics', 'by-subject', subjectId] });
      toast.success('Topic deleted.');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

// ── Admin mutations — subtopics ──────────────────────────────────────

export function useUpsertSubtopic() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: SubtopicInsert & { id?: string }) => {
      if (!supabase) throw new Error('Supabase not configured');
      const { id, ...rest } = payload;
      if (id) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await supabase.from('subtopics').update(rest as any).eq('id', id);
        if (error) throw error;
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await supabase.from('subtopics').insert(rest as any);
        if (error) throw error;
      }
    },
    onSuccess: (_, payload) => {
      queryClient.invalidateQueries({ queryKey: ['subtopics', payload.topic_id] });
      toast.success('Subtopic saved.');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useDeleteSubtopic() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ subtopicId, topicId }: { subtopicId: string; topicId: string }) => {
      if (!supabase) throw new Error('Supabase not configured');
      const { error } = await supabase.from('subtopics').delete().eq('id', subtopicId);
      if (error) throw error;
      return topicId;
    },
    onSuccess: (topicId) => {
      queryClient.invalidateQueries({ queryKey: ['subtopics', topicId] });
      toast.success('Subtopic deleted.');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

// ── Admin mutations — learning objectives ────────────────────────────

export function useUpsertLO() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: LOInsert & { id?: string; topicId: string }) => {
      if (!supabase) throw new Error('Supabase not configured');
      const { id, topicId: _topicId, ...rest } = payload;
      if (id) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await supabase.from('learning_objectives').update(rest as any).eq('id', id);
        if (error) throw error;
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await supabase.from('learning_objectives').insert(rest as any);
        if (error) throw error;
      }
    },
    onSuccess: (_, payload) => {
      queryClient.invalidateQueries({ queryKey: ['subtopics', payload.topicId] });
      toast.success('Learning objective saved.');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useDeleteLO() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ loId, topicId }: { loId: string; topicId: string }) => {
      if (!supabase) throw new Error('Supabase not configured');
      const { error } = await supabase.from('learning_objectives').delete().eq('id', loId);
      if (error) throw error;
      return topicId;
    },
    onSuccess: (topicId) => {
      queryClient.invalidateQueries({ queryKey: ['subtopics', topicId] });
      toast.success('Learning objective deleted.');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}
