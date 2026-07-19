import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';

export type ResourceRow = Database['public']['Tables']['resources']['Row'];
export type ResourceInsert = Database['public']['Tables']['resources']['Insert'];
export type ResourceUpdate = Database['public']['Tables']['resources']['Update'];
export type ResourceType = 'pdf' | 'video' | 'link';

/** Fetch all active resources for a topic (students) or all resources (admins, via RLS). */
export function useResourcesByTopic(topicId: string) {
  return useQuery({
    queryKey: ['resources', topicId],
    queryFn: async () => {
      if (!supabase) throw new Error('Supabase not configured');
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .eq('topic_id', topicId)
        .order('display_order');
      if (error) throw error;
      return data as ResourceRow[];
    },
    enabled: !!supabase && !!topicId,
  });
}

// ── Helpers ──────────────────────────────────────────────────────────

/** Detect YouTube or Vimeo and return an embed URL, or null if not a known video host. */
export function getVideoEmbedUrl(url: string): string | null {
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}?rel=0`;
  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return null;
}

/** Return true if the URL points to a PDF (by extension or known pattern). */
export function isPdfUrl(url: string): boolean {
  return /\.pdf(\?.*)?$/i.test(url) || url.includes('drive.google.com');
}

// ── All-resources query (student library view) ────────────────────────

export type ResourceWithTopic = ResourceRow & {
  topics: {
    id: string; name: string; subject_id: string;
    subjects: { id: string; name: string } | null;
  } | null;
};

export function useAllResources() {
  return useQuery({
    queryKey: ['all-resources'],
    queryFn: async (): Promise<ResourceWithTopic[]> => {
      if (!supabase) throw new Error('Supabase not configured');
      const { data, error } = await supabase
        .from('resources')
        .select('*, topics(id, name, subject_id, subjects(id, name))')
        .order('display_order');
      if (error) throw error;
      return (data ?? []) as unknown as ResourceWithTopic[];
    },
    enabled: !!supabase,
  });
}

// ── Admin mutations ───────────────────────────────────────────────────

export function useUpsertResource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: ResourceInsert & { id?: string }) => {
      if (!supabase) throw new Error('Supabase not configured');
      const { id, ...rest } = payload;
      if (id) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await supabase.from('resources').update(rest as any).eq('id', id);
        if (error) throw error;
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await supabase.from('resources').insert(rest as any);
        if (error) throw error;
      }
    },
    onSuccess: (_, payload) => {
      queryClient.invalidateQueries({ queryKey: ['resources', payload.topic_id] });
      queryClient.invalidateQueries({ queryKey: ['all-resources'] });
      toast.success('Resource saved.');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useDeleteResource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, topicId }: { id: string; topicId: string }) => {
      if (!supabase) throw new Error('Supabase not configured');
      const { error } = await supabase.from('resources').delete().eq('id', id);
      if (error) throw error;
      return topicId;
    },
    onSuccess: (topicId) => {
      queryClient.invalidateQueries({ queryKey: ['resources', topicId] });
      queryClient.invalidateQueries({ queryKey: ['all-resources'] });
      toast.success('Resource deleted.');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}
