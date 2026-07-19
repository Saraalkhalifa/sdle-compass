import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';

export type ConversationRow = Database['public']['Tables']['ai_conversations']['Row'];
export type MessageRow = Database['public']['Tables']['ai_messages']['Row'];

// ── Conversations ─────────────────────────────────────────────────────────────

export function useConversations() {
  return useQuery({
    queryKey: ['ai-conversations'],
    queryFn: async (): Promise<ConversationRow[]> => {
      if (!supabase) throw new Error('Supabase not configured');
      const { data, error } = await supabase
        .from('ai_conversations')
        .select('*')
        .order('updated_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!supabase,
  });
}

export function useConversationMessages(conversationId: string | null) {
  return useQuery({
    queryKey: ['ai-messages', conversationId],
    queryFn: async (): Promise<MessageRow[]> => {
      if (!supabase) throw new Error('Supabase not configured');
      if (!conversationId) return [];
      const { data, error } = await supabase
        .from('ai_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!supabase && !!conversationId,
  });
}

// ── Send message (creates conversation if needed) ─────────────────────────────

export function useSendMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      conversationId,
      message,
    }: {
      conversationId: string | null;
      message: string;
    }): Promise<{ convId: string; content: string }> => {
      if (!supabase) throw new Error('Supabase not configured');

      let convId = conversationId;

      // Create conversation on first message
      if (!convId) {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error('Not authenticated');
        const title = message.trim().slice(0, 72) + (message.trim().length > 72 ? '…' : '');
        const { data, error } = await supabase
          .from('ai_conversations')
          .insert({ user_id: session.user.id, title })
          .select('id')
          .single();
        if (error) throw error;
        convId = data.id;
      }

      const { data, error } = await supabase.functions.invoke('ai-tutor', {
        body: { conversation_id: convId, message: message.trim() },
      });
      if (error) throw error;

      const result = data as { content?: string; error?: string };
      if (result.error) throw new Error(result.error);

      return { convId, content: result.content ?? '' };
    },
    onSuccess: ({ convId }) => {
      qc.invalidateQueries({ queryKey: ['ai-conversations'] });
      qc.invalidateQueries({ queryKey: ['ai-messages', convId] });
    },
  });
}

// ── Delete conversation ───────────────────────────────────────────────────────

export function useDeleteConversation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!supabase) throw new Error('Supabase not configured');
      const { error } = await supabase.from('ai_conversations').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ai-conversations'] }),
  });
}
