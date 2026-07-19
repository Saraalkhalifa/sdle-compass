import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';

export type DeckRow = Database['public']['Tables']['flashcard_decks']['Row'];
export type DeckInsert = Database['public']['Tables']['flashcard_decks']['Insert'];
export type CardRow = Database['public']['Tables']['flashcards']['Row'];
export type CardInsert = Database['public']['Tables']['flashcards']['Insert'];
export type ProgressRow = Database['public']['Tables']['student_flashcard_progress']['Row'];
export type FlashcardStatus = 'new' | 'learning' | 'known';

// ── Student queries ───────────────────────────────────────────────────

export function useFlashcardDecksByTopic(topicId: string) {
  return useQuery({
    queryKey: ['flashcard-decks', topicId],
    queryFn: async () => {
      if (!supabase) throw new Error('Supabase not configured');
      const { data, error } = await supabase
        .from('flashcard_decks')
        .select('*')
        .eq('topic_id', topicId)
        .order('display_order');
      if (error) throw error;
      return data as DeckRow[];
    },
    enabled: !!supabase && !!topicId,
  });
}

export function useFlashcardsByDeck(deckId: string) {
  return useQuery({
    queryKey: ['flashcard-cards', deckId],
    queryFn: async () => {
      if (!supabase) throw new Error('Supabase not configured');
      const { data, error } = await supabase
        .from('flashcards')
        .select('*')
        .eq('deck_id', deckId)
        .order('display_order');
      if (error) throw error;
      return data as CardRow[];
    },
    enabled: !!supabase && !!deckId,
  });
}

export function useFlashcardProgressByDeck(deckId: string, cardIds: string[]) {
  return useQuery({
    queryKey: ['flashcard-progress', deckId],
    queryFn: async () => {
      if (!supabase) throw new Error('Supabase not configured');
      const { data, error } = await supabase
        .from('student_flashcard_progress')
        .select('flashcard_id, status, review_count')
        .in('flashcard_id', cardIds);
      if (error) throw error;
      return Object.fromEntries((data ?? []).map((r) => [r.flashcard_id, r.status])) as Record<string, FlashcardStatus>;
    },
    enabled: !!supabase && cardIds.length > 0,
  });
}

export function useUpsertFlashcardProgress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ flashcardId, status, deckId }: { flashcardId: string; status: FlashcardStatus; deckId: string }) => {
      if (!supabase) throw new Error('Supabase not configured');
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('student_flashcard_progress')
        .upsert(
          {
            user_id: session.user.id,
            flashcard_id: flashcardId,
            status,
            review_count: 1,
            last_reviewed_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,flashcard_id' },
        );
      if (error) throw error;
      return deckId;
    },
    onSuccess: (deckId) => {
      queryClient.invalidateQueries({ queryKey: ['flashcard-progress', deckId] });
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

// ── Admin mutations ───────────────────────────────────────────────────

export function useUpsertDeck() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: DeckInsert & { id?: string }) => {
      if (!supabase) throw new Error('Supabase not configured');
      const { id, ...rest } = payload;
      if (id) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await supabase.from('flashcard_decks').update(rest as any).eq('id', id);
        if (error) throw error;
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await supabase.from('flashcard_decks').insert(rest as any);
        if (error) throw error;
      }
    },
    onSuccess: (_, payload) => {
      queryClient.invalidateQueries({ queryKey: ['flashcard-decks', payload.topic_id] });
      toast.success('Deck saved.');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useDeleteDeck() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, topicId }: { id: string; topicId: string }) => {
      if (!supabase) throw new Error('Supabase not configured');
      const { error } = await supabase.from('flashcard_decks').delete().eq('id', id);
      if (error) throw error;
      return topicId;
    },
    onSuccess: (topicId) => {
      queryClient.invalidateQueries({ queryKey: ['flashcard-decks', topicId] });
      toast.success('Deck deleted.');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useUpsertCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CardInsert & { id?: string }) => {
      if (!supabase) throw new Error('Supabase not configured');
      const { id, ...rest } = payload;
      if (id) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await supabase.from('flashcards').update(rest as any).eq('id', id);
        if (error) throw error;
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await supabase.from('flashcards').insert(rest as any);
        if (error) throw error;
      }
    },
    onSuccess: (_, payload) => {
      queryClient.invalidateQueries({ queryKey: ['flashcard-cards', payload.deck_id] });
      toast.success('Card saved.');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useDeleteCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, deckId }: { id: string; deckId: string }) => {
      if (!supabase) throw new Error('Supabase not configured');
      const { error } = await supabase.from('flashcards').delete().eq('id', id);
      if (error) throw error;
      return deckId;
    },
    onSuccess: (deckId) => {
      queryClient.invalidateQueries({ queryKey: ['flashcard-cards', deckId] });
      toast.success('Card deleted.');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}
