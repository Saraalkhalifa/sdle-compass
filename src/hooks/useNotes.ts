import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';

export type TopicNoteRow = Database['public']['Tables']['topic_notes']['Row'];
export type TopicNoteInsert = Database['public']['Tables']['topic_notes']['Insert'];
export type StudentNoteRow = Database['public']['Tables']['student_notes']['Row'];

// ── Admin study notes ─────────────────────────────────────────────────

export type TopicNoteWithTopic = TopicNoteRow & {
  topics: { id: string; name: string; subject_id: string; subjects: { id: string; name: string } | null } | null;
};

export function useAllTopicNotesAdmin() {
  return useQuery({
    queryKey: ['all-topic-notes'],
    queryFn: async (): Promise<TopicNoteWithTopic[]> => {
      if (!supabase) throw new Error('Supabase not configured');
      const { data, error } = await supabase
        .from('topic_notes')
        .select('*, topics(id, name, subject_id, subjects(id, name))')
        .order('display_order');
      if (error) throw error;
      return (data ?? []) as unknown as TopicNoteWithTopic[];
    },
    enabled: !!supabase,
  });
}

export function useTopicNotes(topicId: string) {
  return useQuery({
    queryKey: ['topic-notes', topicId],
    queryFn: async () => {
      if (!supabase) throw new Error('Supabase not configured');
      const { data, error } = await supabase
        .from('topic_notes')
        .select('*')
        .eq('topic_id', topicId)
        .order('display_order');
      if (error) throw error;
      return data as TopicNoteRow[];
    },
    enabled: !!supabase && !!topicId,
  });
}

export function useUpsertTopicNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: TopicNoteInsert & { id?: string }) => {
      if (!supabase) throw new Error('Supabase not configured');
      const { id, ...rest } = payload;
      if (id) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await supabase.from('topic_notes').update(rest as any).eq('id', id);
        if (error) throw error;
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await supabase.from('topic_notes').insert(rest as any);
        if (error) throw error;
      }
    },
    onSuccess: (_, payload) => {
      queryClient.invalidateQueries({ queryKey: ['topic-notes', payload.topic_id] });
      queryClient.invalidateQueries({ queryKey: ['all-topic-notes'] });
      toast.success('Note saved.');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useDeleteTopicNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, topicId }: { id: string; topicId: string }) => {
      if (!supabase) throw new Error('Supabase not configured');
      const { error } = await supabase.from('topic_notes').delete().eq('id', id);
      if (error) throw error;
      return topicId;
    },
    onSuccess: (topicId) => {
      queryClient.invalidateQueries({ queryKey: ['topic-notes', topicId] });
      queryClient.invalidateQueries({ queryKey: ['all-topic-notes'] });
      toast.success('Note deleted.');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

// ── Student personal notes ────────────────────────────────────────────

export function useStudentNote(topicId: string) {
  return useQuery({
    queryKey: ['student-note', topicId],
    queryFn: async () => {
      if (!supabase) throw new Error('Supabase not configured');
      const { data, error } = await supabase
        .from('student_notes')
        .select('*')
        .eq('topic_id', topicId)
        .maybeSingle();
      if (error) throw error;
      return data as StudentNoteRow | null;
    },
    enabled: !!supabase && !!topicId,
  });
}

export function useUpsertStudentNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ topicId, content }: { topicId: string; content: string }) => {
      if (!supabase) throw new Error('Supabase not configured');
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('student_notes')
        .upsert(
          { user_id: session.user.id, topic_id: topicId, content },
          { onConflict: 'user_id,topic_id' },
        );
      if (error) throw error;
    },
    onSuccess: (_, { topicId }) => {
      queryClient.invalidateQueries({ queryKey: ['student-note', topicId] });
    },
    onError: (err: Error) => toast.error(err.message),
  });
}
