import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SYSTEM_PROMPT = `You are an AI tutor specialising in the Saudi Dental Licensure Examination (SDLE). Your role is to help dental students prepare for their licensing exam.

Key subject areas covered in the SDLE:
- Dental Anatomy & Morphology
- Oral Biology & Histology
- Dental Materials Science
- Oral Pathology & Medicine
- Pharmacology
- Microbiology & Immunology
- Physiology & Biochemistry
- Oral & Maxillofacial Radiology
- Periodontics
- Endodontics
- Fixed & Removable Prosthodontics
- Oral & Maxillofacial Surgery
- Pediatric Dentistry (Pedodontics)
- Orthodontics
- Preventive Dentistry & Community Oral Health

Guidelines:
- Give clear, accurate, exam-relevant explanations
- Walk through reasoning step by step for clinical scenarios
- Use mnemonics and memory aids where helpful
- Keep responses focused and well-structured — use bullet points or numbered lists when they improve clarity
- When relevant, highlight what the SDLE commonly tests on a topic
- Encourage students and acknowledge correct reasoning
- If asked something unrelated to dentistry or exam prep, politely redirect`

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY')

    if (!anthropicKey) {
      return new Response(JSON.stringify({ error: 'AI service not configured. Set ANTHROPIC_API_KEY in Supabase secrets.' }), {
        status: 503,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      })
    }

    // Verify user via JWT
    const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } })
    const jwt = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authErr } = await supabase.auth.getUser(jwt)
    if (authErr || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      })
    }

    const { conversation_id, message } = await req.json()
    if (!conversation_id || !message?.trim()) {
      return new Response(JSON.stringify({ error: 'conversation_id and message are required' }), {
        status: 400,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      })
    }

    // Verify conversation belongs to this user
    const { data: conv, error: convErr } = await supabase
      .from('ai_conversations')
      .select('id, title')
      .eq('id', conversation_id)
      .eq('user_id', user.id)
      .maybeSingle()
    if (convErr || !conv) {
      return new Response(JSON.stringify({ error: 'Conversation not found' }), {
        status: 404,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      })
    }

    // Save user message
    const { error: userMsgErr } = await supabase.from('ai_messages').insert({
      conversation_id,
      role: 'user',
      content: message.trim(),
    })
    if (userMsgErr) throw userMsgErr

    // Fetch recent history (last 30 messages for context)
    const { data: history, error: histErr } = await supabase
      .from('ai_messages')
      .select('role, content')
      .eq('conversation_id', conversation_id)
      .order('created_at', { ascending: true })
      .limit(30)
    if (histErr) throw histErr

    // Auto-update conversation title from first user message
    if (conv.title === 'New conversation') {
      const trimmed = message.trim().slice(0, 72)
      const title = trimmed.length < message.trim().length ? trimmed + '…' : trimmed
      await supabase.from('ai_conversations').update({ title, updated_at: new Date().toISOString() }).eq('id', conversation_id)
    } else {
      await supabase.from('ai_conversations').update({ updated_at: new Date().toISOString() }).eq('id', conversation_id)
    }

    // Call Anthropic API
    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1536,
        system: SYSTEM_PROMPT,
        messages: (history ?? []).map((m) => ({ role: m.role, content: m.content })),
      }),
    })

    if (!anthropicRes.ok) {
      const errText = await anthropicRes.text()
      throw new Error(`Anthropic API error ${anthropicRes.status}: ${errText}`)
    }

    const aiData = await anthropicRes.json()
    const assistantContent: string = aiData.content?.[0]?.text ?? ''

    // Save assistant response
    const { error: asstErr } = await supabase.from('ai_messages').insert({
      conversation_id,
      role: 'assistant',
      content: assistantContent,
    })
    if (asstErr) throw asstErr

    return new Response(JSON.stringify({ content: assistantContent }), {
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Internal server error'
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    })
  }
})
