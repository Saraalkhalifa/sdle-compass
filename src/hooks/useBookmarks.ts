import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';

export type BookmarkRow = Database['public']['Tables']['student_bookmarks']['Row'];
export type BookmarkItemType = 'question' | 'topic' | 'flashcard_deck';

// ── Read ──────────────────────────────────────────────────────────────────────

export function useBookmarks(itemType?: BookmarkItemType) {
  return useQuery({
    queryKey: ['bookmarks', itemType ?? 'all'],
    queryFn: async (): Promise<BookmarkRow[]> => {
      if (!supabase) throw new Error('Supabase not configured');
      let q = supabase.from('student_bookmarks').select('*').order('created_at', { ascending: false });
      if (itemType) q = q.eq('item_type', itemType);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!supabase,
  });
}

/** Returns a Set of item IDs bookmarked for the given type — use for O(1) "is bookmarked?" checks */
export function useBookmarkedIds(itemType: BookmarkItemType) {
  return useQuery({
    queryKey: ['bookmarks', itemType],
    queryFn: async (): Promise<Set<string>> => {
      if (!supabase) throw new Error('Supabase not configured');
      const { data, error } = await supabase
        .from('student_bookmarks')
        .select('item_id')
        .eq('item_type', itemType);
      if (error) throw error;
      return new Set((data ?? []).map(b => b.item_id));
    },
    enabled: !!supabase,
  });
}

// ── Write ─────────────────────────────────────────────────────────────────────

export function useToggleBookmark() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      itemType, itemId, title, subtitle, itemRoute, isBookmarked,
    }: {
      itemType: BookmarkItemType;
      itemId: string;
      title: string;
      subtitle?: string;
      itemRoute?: string;
      isBookmarked: boolean;
    }) => {
      if (!supabase) throw new Error('Supabase not configured');
      if (isBookmarked) {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error('Not authenticated');
        const { error } = await supabase
          .from('student_bookmarks')
          .delete()
          .eq('user_id', session.user.id)
          .eq('item_type', itemType)
          .eq('item_id', itemId);
        if (error) throw error;
      } else {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error('Not authenticated');
        const { error } = await supabase.from('student_bookmarks').insert({
          user_id: session.user.id,
          item_type: itemType,
          item_id: itemId,
          title,
          subtitle: subtitle ?? null,
          item_route: itemRoute ?? null,
        } as any);
        if (error) throw error;
      }
      return { itemType };
    },
    onSuccess: ({ itemType }) => {
      qc.invalidateQueries({ queryKey: ['bookmarks'] });
      qc.invalidateQueries({ queryKey: ['bookmarks', itemType] });
      qc.invalidateQueries({ queryKey: ['bookmarks', 'all'] });
    },
  });
}
