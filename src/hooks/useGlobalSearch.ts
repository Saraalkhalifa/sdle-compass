import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { ROUTES } from '@/config/app';

export type SearchResultType = 'subject' | 'topic' | 'question' | 'resource';

export interface SearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  subtitle?: string;
  href: string;
}

export function useGlobalSearch(query: string) {
  return useQuery({
    queryKey: ['global-search', query],
    queryFn: async (): Promise<SearchResult[]> => {
      if (!supabase) throw new Error('Supabase not configured');
      const q = `%${query}%`;

      const [subjectsRes, topicsRes, questionsRes, resourcesRes] = await Promise.all([
        supabase
          .from('subjects')
          .select('id, name')
          .ilike('name', q)
          .eq('is_active', true)
          .limit(4),
        supabase
          .from('topics')
          .select('id, name, subject_id, subjects(id, name)')
          .ilike('name', q)
          .eq('is_active', true)
          .limit(6),
        supabase
          .from('questions')
          .select('id, question_text, topic_id, topics(id, name, subject_id)')
          .ilike('question_text', q)
          .eq('is_active', true)
          .limit(5),
        supabase
          .from('resources')
          .select('id, title, type, topic_id, topics(id, name, subject_id)')
          .ilike('title', q)
          .limit(4),
      ]);

      const results: SearchResult[] = [];

      for (const s of subjectsRes.data ?? []) {
        results.push({
          id: s.id,
          type: 'subject',
          title: s.name,
          subtitle: 'Subject',
          href: ROUTES.subject(s.id),
        });
      }

      for (const t of (topicsRes.data ?? []) as unknown as Array<{
        id: string; name: string; subject_id: string; subjects: { id: string; name: string } | null;
      }>) {
        results.push({
          id: t.id,
          type: 'topic',
          title: t.name,
          subtitle: t.subjects ? `${t.subjects.name} › Topic` : 'Topic',
          href: ROUTES.topic(t.subject_id, t.id),
        });
      }

      for (const q of (questionsRes.data ?? []) as unknown as Array<{
        id: string; question_text: string;
        topics: { id: string; name: string; subject_id: string } | null;
      }>) {
        results.push({
          id: q.id,
          type: 'question',
          title: q.question_text.length > 90
            ? q.question_text.slice(0, 90) + '…'
            : q.question_text,
          subtitle: q.topics ? `Question · ${q.topics.name}` : 'Question',
          href: ROUTES.questionBank,
        });
      }

      for (const r of (resourcesRes.data ?? []) as unknown as Array<{
        id: string; title: string; type: string;
        topics: { id: string; name: string; subject_id: string } | null;
      }>) {
        const typeLabel = r.type === 'pdf' ? 'PDF' : r.type === 'video' ? 'Video' : r.type === 'note' ? 'Note' : 'Resource';
        results.push({
          id: r.id,
          type: 'resource',
          title: r.title,
          subtitle: r.topics ? `${typeLabel} · ${r.topics.name}` : typeLabel,
          href: r.topics
            ? ROUTES.topic(r.topics.subject_id, r.topics.id)
            : ROUTES.subjects,
        });
      }

      return results;
    },
    enabled: !!supabase && query.length >= 2,
    staleTime: 30_000,
  });
}
