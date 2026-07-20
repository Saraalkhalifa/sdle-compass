import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';

// ── Types ─────────────────────────────────────────────────────────────────────

export type ConversationRow = Database['public']['Tables']['ai_conversations']['Row'];
export type MessageRow      = Database['public']['Tables']['ai_messages']['Row'];

export type EvidenceLevel = 'strong' | 'supported' | 'partial' | 'insufficient';

export interface Citation {
  chunkId: string;
  resourceTitle: string;
  resourceType: string;
  chapter?: string;
  section?: string;
  pageNumber?: string;
  sourceIndex: number;
}

export interface AITutorResult {
  convId: string;
  content: string;
  messageId: string | null;
  citations: Citation[];
  evidenceLevel: EvidenceLevel;
  retrievedSources: number;
  requestId: string;
}

export type AIMode =
  | 'explain'
  | 'find'
  | 'compare'
  | 'mistake'
  | 'quiz'
  | 'flashcards'
  | 'summary'
  | 'session';

// ── Error-code → user-facing message map ─────────────────────────────────────

const ERROR_MAP: Record<string, string> = {
  AUTH_REQUIRED:          'Your session has expired. Please sign in again.',
  AUTH_INVALID:           'Your session has expired. Please sign in again.',
  SERVICE_UNAVAILABLE:    'The AI Tutor is temporarily unavailable. Please try again shortly.',
  RATE_LIMITED:           'You have reached the AI Tutor usage limit for today.',
  TIMEOUT:                'The response took too long. Please retry.',
  AI_UNAVAILABLE:         'The AI Tutor is temporarily unavailable. Please try again shortly.',
  AI_CAPACITY:            'The AI Tutor is experiencing high demand. Please try again in a moment.',
  MESSAGE_TOO_LONG:       'Your message is too long. Please shorten it and try again.',
  MISSING_CONVERSATION:   'Something went wrong starting your conversation. Please try again.',
  CONVERSATION_NOT_FOUND: 'Conversation not found. Please start a new one.',
  EMPTY_MESSAGE:          'Please enter a message before sending.',
  INTERNAL_ERROR:         'We could not complete this request. Please try again.',
  EMPTY_RESPONSE:         'We could not complete this request. Please try again.',
}

type EdgeBody = {
  error?: string;
  code?: string;
  requestId?: string;
  content?: string;
  messageId?: string | null;
  citations?: Citation[];
  evidenceLevel?: EvidenceLevel;
  retrievedSources?: number;
}

/**
 * Extracts a human-readable message from either a FunctionsHttpError
 * (which wraps a Response) or a plain Error.
 */
async function extractError(raw: unknown): Promise<string> {
  // FunctionsHttpError from @supabase/supabase-js v2 stores the raw Response
  // in .context — we need to read the body to get the JSON error message.
  if (raw && typeof raw === 'object' && 'context' in raw) {
    try {
      const ctx = (raw as { context: Response }).context
      const body: EdgeBody = await ctx.json()
      if (body?.error) {
        const mapped  = body.code ? (ERROR_MAP[body.code] ?? body.error) : body.error
        const refPart = body.requestId ? ` (Reference: ${body.requestId})` : ''
        return mapped + refPart
      }
    } catch {
      // fall through to generic handling
    }
  }

  if (raw instanceof Error) {
    return ERROR_MAP[raw.message] ?? raw.message
  }

  return 'We could not complete this request. Please try again.'
}

// ── Conversations ─────────────────────────────────────────────────────────────

export function useConversations() {
  return useQuery({
    queryKey: ['ai-conversations'],
    queryFn: async (): Promise<ConversationRow[]> => {
      if (!supabase) throw new Error('Supabase not configured')
      const { data, error } = await supabase
        .from('ai_conversations')
        .select('*')
        .order('updated_at', { ascending: false })
      if (error) throw error
      return data ?? []
    },
    enabled: !!supabase,
  })
}

export function useConversationMessages(conversationId: string | null) {
  return useQuery({
    queryKey: ['ai-messages', conversationId],
    queryFn: async (): Promise<MessageRow[]> => {
      if (!supabase) throw new Error('Supabase not configured')
      if (!conversationId) return []
      const { data, error } = await supabase
        .from('ai_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })
      if (error) throw error
      return data ?? []
    },
    enabled: !!supabase && !!conversationId,
  })
}

// ── Send message ──────────────────────────────────────────────────────────────

export function useSendMessage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      conversationId,
      message,
    }: {
      conversationId: string | null
      message: string
    }): Promise<AITutorResult> => {
      if (!supabase) throw new Error('Supabase not configured')

      let convId = conversationId

      // Create a new conversation row before the first message
      if (!convId) {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) throw new Error(ERROR_MAP['AUTH_REQUIRED'])

        const title = message.trim().slice(0, 72) + (message.trim().length > 72 ? '…' : '')
        const { data: newConv, error: convErr } = await supabase
          .from('ai_conversations')
          .insert({ user_id: session.user.id, title })
          .select('id')
          .single()
        if (convErr) throw convErr
        convId = newConv.id
      }

      // Invoke the secure edge function
      const { data, error } = await supabase.functions.invoke('ai-tutor', {
        body: { conversation_id: convId, message: message.trim() },
      })

      if (error) {
        // Extract the actual message from the FunctionsHttpError body
        const msg = await extractError(error)
        throw new Error(msg)
      }

      const result = data as EdgeBody
      if (result?.error) {
        const mapped  = result.code ? (ERROR_MAP[result.code] ?? result.error) : result.error
        const refPart = result.requestId ? ` (Reference: ${result.requestId})` : ''
        throw new Error((mapped ?? result.error) + refPart)
      }

      return {
        convId,
        content: result.content ?? '',
        messageId: result.messageId ?? null,
        citations: result.citations ?? [],
        evidenceLevel: result.evidenceLevel ?? 'insufficient',
        retrievedSources: result.retrievedSources ?? 0,
        requestId: result.requestId ?? '',
      }
    },

    onSuccess: ({ convId }) => {
      qc.invalidateQueries({ queryKey: ['ai-conversations'] })
      qc.invalidateQueries({ queryKey: ['ai-messages', convId] })
    },
  })
}

// ── Rename conversation ───────────────────────────────────────────────────────

export function useRenameConversation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, title }: { id: string; title: string }) => {
      if (!supabase) throw new Error('Supabase not configured')
      const { error } = await supabase
        .from('ai_conversations')
        .update({ title: title.trim().slice(0, 100) })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ai-conversations'] }),
  })
}

// ── Delete conversation ───────────────────────────────────────────────────────

export function useDeleteConversation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      if (!supabase) throw new Error('Supabase not configured')
      const { error } = await supabase.from('ai_conversations').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ai-conversations'] }),
  })
}
