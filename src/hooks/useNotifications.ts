import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { Database } from '@/types/database';

export type NotificationRow = Database['public']['Tables']['notifications']['Row'];
export type NotificationType = 'exam_result' | 'study_reminder' | 'ai_response' | 'system' | 'achievement';

const QK = ['notifications'] as const;

export function useNotifications() {
  const { session } = useAuth();

  return useQuery({
    queryKey: QK,
    queryFn: async (): Promise<NotificationRow[]> => {
      if (!supabase) throw new Error('Supabase not configured');
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(30);
      if (error) throw error;
      return data as NotificationRow[];
    },
    enabled: !!supabase && !!session,
  });
}

/**
 * Call this ONCE from AppShell. Registers the realtime subscription that
 * invalidates the notifications query on INSERT. Keeping it separate from
 * useNotifications prevents the "cannot add callbacks after subscribe()" error
 * that occurs when the hook is called from multiple sibling components.
 */
export function useNotificationsSync() {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!supabase || !session?.user?.id) return;
    const client = supabase;
    const channel = client
      .channel(`notifications-${session.user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${session.user.id}`,
        },
        () => { queryClient.invalidateQueries({ queryKey: QK }); },
      )
      .subscribe();
    return () => { client.removeChannel(channel); };
  }, [session?.user?.id, queryClient]);
}

export function useUnreadCount() {
  const { data } = useNotifications();
  return data?.filter(n => !n.is_read).length ?? 0;
}

export function useMarkRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!supabase) throw new Error('Supabase not configured');
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QK }),
  });
}

export function useMarkAllRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!supabase) throw new Error('Supabase not configured');
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('is_read', false);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QK }),
  });
}
