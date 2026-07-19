import React, { useState, useRef, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { AppShell } from '@/components/layout/AppShell';
import {
  useConversations,
  useConversationMessages,
  useSendMessage,
  useDeleteConversation,
  type ConversationRow,
  type MessageRow,
} from '@/hooks/useAITutor';

// ── Lightweight markdown renderer ─────────────────────────────────────────────

function applyInline(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((p, i) => {
    if (p.startsWith('**') && p.endsWith('**')) return <strong key={i}>{p.slice(2, -2)}</strong>;
    if (p.startsWith('`') && p.endsWith('`')) return <code key={i} className="bg-slate-700 px-1 rounded text-xs font-mono">{p.slice(1, -1)}</code>;
    return p;
  });
}

function SimpleMarkdown({ text, isUser }: { text: string; isUser: boolean }) {
  const codeBlockRe = /```[\w]*\n?([\s\S]*?)```/g;
  const blocks: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = codeBlockRe.exec(text)) !== null) {
    if (match.index > lastIndex) {
      blocks.push(<ParagraphBlock key={lastIndex} text={text.slice(lastIndex, match.index)} isUser={isUser} />);
    }
    blocks.push(
      <pre key={match.index} className="bg-slate-900 text-slate-100 rounded-lg p-3 overflow-x-auto text-xs font-mono my-2">
        {match[1].trim()}
      </pre>
    );
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    blocks.push(<ParagraphBlock key={lastIndex} text={text.slice(lastIndex)} isUser={isUser} />);
  }
  return <div className="space-y-1.5">{blocks}</div>;
}

function ParagraphBlock({ text, isUser }: { text: string; isUser: boolean }) {
  const paragraphs = text.split(/\n{2,}/);
  return (
    <>
      {paragraphs.map((para, pi) => {
        const lines = para.split('\n').filter(Boolean);
        if (lines.length === 0) return null;

        const isOrderedList = lines.every(l => /^\d+\.\s/.test(l));
        const isUnorderedList = lines.every(l => /^[-*•]\s/.test(l));

        if (isOrderedList) {
          return (
            <ol key={pi} className="list-decimal list-inside space-y-0.5 text-sm">
              {lines.map((l, li) => (
                <li key={li}>{applyInline(l.replace(/^\d+\.\s/, ''))}</li>
              ))}
            </ol>
          );
        }
        if (isUnorderedList) {
          return (
            <ul key={pi} className="list-disc list-inside space-y-0.5 text-sm">
              {lines.map((l, li) => (
                <li key={li}>{applyInline(l.replace(/^[-*•]\s/, ''))}</li>
              ))}
            </ul>
          );
        }
        return (
          <p key={pi} className="text-sm leading-relaxed">
            {lines.map((l, li) => (
              <React.Fragment key={li}>
                {li > 0 && <br />}
                {applyInline(l)}
              </React.Fragment>
            ))}
          </p>
        );
      })}
    </>
  );
}

// ── Message bubble ────────────────────────────────────────────────────────────

function MessageBubble({ message }: { message: MessageRow }) {
  const isUser = message.role === 'user';
  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold mt-0.5 ${
        isUser ? 'bg-blue-600 text-white' : 'bg-slate-700 text-white'
      }`}>
        {isUser ? 'You' : 'AI'}
      </div>

      {/* Bubble */}
      <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
        isUser
          ? 'bg-blue-600 text-white rounded-tr-sm'
          : 'bg-slate-800 text-slate-100 rounded-tl-sm'
      }`}>
        <SimpleMarkdown text={message.content} isUser={isUser} />
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-3">
      <div className="w-7 h-7 rounded-full bg-slate-700 text-white flex items-center justify-center shrink-0 text-xs font-bold">
        AI
      </div>
      <div className="bg-slate-800 rounded-2xl rounded-tl-sm px-4 py-3">
        <div className="flex gap-1 items-center h-5">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.15}s`, animationDuration: '0.9s' }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Conversation list item ─────────────────────────────────────────────────────

function ConvItem({
  conv,
  active,
  onClick,
  onDelete,
}: {
  conv: ConversationRow;
  active: boolean;
  onClick: () => void;
  onDelete: () => void;
}) {
  const date = new Date(conv.updated_at);
  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();
  const label = sameDay
    ? date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <div
      className={`group relative flex items-start gap-2 px-3 py-2.5 cursor-pointer rounded-lg mx-1 transition-colors ${
        active ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
      }`}
      onClick={onClick}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5 opacity-60">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
      </svg>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium truncate leading-snug">{conv.title}</p>
        <p className="text-xs opacity-50 mt-0.5">{label}</p>
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        className="opacity-0 group-hover:opacity-100 shrink-0 p-0.5 hover:text-red-400 transition-all rounded"
        aria-label="Delete conversation"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>
        </svg>
      </button>
    </div>
  );
}

// ── Welcome screen ─────────────────────────────────────────────────────────────

const SUGGESTIONS = [
  'Explain the histology of enamel and its clinical significance',
  'What are the differences between Type I and Type II gypsum products?',
  'Walk me through the steps of an indirect pulp capping procedure',
  'What pharmacology topics are most commonly tested in the SDLE?',
];

function WelcomeScreen({ onSuggest }: { onSuggest: (s: string) => void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
      <div className="w-14 h-14 bg-slate-700 rounded-2xl flex items-center justify-center mb-4">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"/>
        </svg>
      </div>
      <h2 className="text-lg font-semibold text-white mb-1">SDLE AI Tutor</h2>
      <p className="text-sm text-slate-400 mb-8 max-w-xs">Ask anything about dental science, exam topics, or clinical concepts.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => onSuggest(s)}
            className="text-left text-xs text-slate-400 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 rounded-xl px-3 py-2.5 transition-colors leading-relaxed"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Chat input ────────────────────────────────────────────────────────────────

function ChatInput({
  value,
  onChange,
  onSubmit,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  disabled: boolean;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  function resize() {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 160) + 'px';
  }

  return (
    <div className="flex items-end gap-2 bg-slate-800 border border-slate-600 rounded-2xl px-4 py-3 focus-within:border-slate-400 transition-colors">
      <textarea
        ref={ref}
        value={value}
        rows={1}
        placeholder="Ask anything about the SDLE…"
        disabled={disabled}
        className="flex-1 bg-transparent resize-none outline-none text-sm text-slate-100 placeholder:text-slate-500 min-h-[24px] leading-relaxed"
        onChange={(e) => { onChange(e.target.value); resize(); }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSubmit();
          }
        }}
      />
      <button
        onClick={onSubmit}
        disabled={disabled || !value.trim()}
        className="shrink-0 w-8 h-8 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white flex items-center justify-center transition-colors"
        aria-label="Send"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
        </svg>
      </button>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function AITutor() {
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [input, setInput]               = useState('');
  const [isThinking, setIsThinking]     = useState(false);
  const [sidebarOpen, setSidebarOpen]   = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: conversations }          = useConversations();
  const { data: messages }               = useConversationMessages(activeConvId);
  const sendMessage   = useSendMessage();
  const deleteConv    = useDeleteConversation();

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isThinking]);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || isThinking) return;
    setInput('');
    setIsThinking(true);
    try {
      const { convId } = await sendMessage.mutateAsync({ conversationId: activeConvId, message: text });
      if (!activeConvId) setActiveConvId(convId);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to get a response';
      toast.error(msg);
    } finally {
      setIsThinking(false);
    }
  }, [input, isThinking, activeConvId, sendMessage]);

  function handleNewChat() {
    setActiveConvId(null);
    setInput('');
  }

  async function handleDelete(id: string) {
    try {
      await deleteConv.mutateAsync(id);
      if (activeConvId === id) setActiveConvId(null);
    } catch {
      toast.error('Failed to delete conversation');
    }
  }

  function handleSuggest(suggestion: string) {
    setInput(suggestion);
  }

  return (
    <AppShell role="student" title="AI Tutor">
      {/* Full-height chat layout — dark theme */}
      <div className="h-full flex overflow-hidden bg-slate-900">

        {/* Sidebar */}
        <div className={`flex flex-col shrink-0 transition-all duration-200 border-r border-slate-700/60 ${
          sidebarOpen ? 'w-64' : 'w-0 overflow-hidden'
        }`}>
          <div className="p-3 border-b border-slate-700/60 shrink-0">
            <button
              onClick={handleNewChat}
              className="w-full flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm font-medium rounded-xl transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14"/>
              </svg>
              New chat
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-2 space-y-0.5">
            {conversations && conversations.length > 0 ? (
              conversations.map(c => (
                <ConvItem
                  key={c.id}
                  conv={c}
                  active={c.id === activeConvId}
                  onClick={() => setActiveConvId(c.id)}
                  onDelete={() => handleDelete(c.id)}
                />
              ))
            ) : (
              <p className="text-xs text-slate-500 px-4 py-3">No conversations yet</p>
            )}
          </div>
        </div>

        {/* Main chat area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Chat toolbar */}
          <div className="flex items-center gap-3 px-4 h-12 border-b border-slate-700/60 shrink-0">
            <button
              onClick={() => setSidebarOpen(o => !o)}
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-700 rounded-lg transition-colors"
              aria-label="Toggle sidebar"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12h18M3 6h18M3 18h18"/>
              </svg>
            </button>
            <span className="text-sm font-medium text-slate-300">
              {activeConvId
                ? conversations?.find(c => c.id === activeConvId)?.title ?? 'Conversation'
                : 'New conversation'}
            </span>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
            {!activeConvId && !isThinking ? (
              <WelcomeScreen onSuggest={handleSuggest} />
            ) : (
              <>
                {(messages ?? []).map(m => <MessageBubble key={m.id} message={m} />)}
                {isThinking && <TypingIndicator />}
              </>
            )}
          </div>

          {/* Input */}
          <div className="px-4 pb-4 pt-2 shrink-0">
            <ChatInput
              value={input}
              onChange={setInput}
              onSubmit={handleSend}
              disabled={isThinking}
            />
            <p className="text-center text-xs text-slate-600 mt-2">
              AI responses are for study purposes only — verify clinical information from authoritative sources.
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
