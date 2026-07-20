import React, {
  useState, useRef, useEffect, useCallback,
} from 'react';
import { toast } from 'sonner';
import { AppShell } from '@/components/layout/AppShell';
import {
  useConversations,
  useConversationMessages,
  useSendMessage,
  useDeleteConversation,
  useRenameConversation,
  type ConversationRow,
  type MessageRow,
  type AIMode,
  type Citation,
  type EvidenceLevel,
} from '@/hooks/useAITutor';

// ── Constants ─────────────────────────────────────────────────────────────────

const MAX_INPUT = 4000;

// ── Tutor mode definitions ────────────────────────────────────────────────────

interface ModeConfig {
  id: AIMode;
  icon: string;
  label: string;
  labelAr: string;
  placeholder: string;
  example: string;
}

const MODES: ModeConfig[] = [
  {
    id: 'explain',
    icon: '💡',
    label: 'Explain a Concept',
    labelAr: 'اشرح مفهوماً',
    placeholder: 'Ask anything about dental science or exam topics…',
    example: 'Explain symptomatic irreversible pulpitis and its diagnosis',
  },
  {
    id: 'find',
    icon: '🔍',
    label: 'Find Where to Study',
    labelAr: 'أين أدرس هذا؟',
    placeholder: 'Which topic or concept do you want to locate?',
    example: 'Where can I study vertical root fracture?',
  },
  {
    id: 'compare',
    icon: '⚖️',
    label: 'Compare Concepts',
    labelAr: 'قارن المفاهيم',
    placeholder: 'Which two concepts do you want to compare?',
    example: 'Compare internal and external root resorption',
  },
  {
    id: 'quiz',
    icon: '📝',
    label: 'Test Me',
    labelAr: 'اختبرني',
    placeholder: 'Describe what you want to be tested on…',
    example: 'Test me with 5 clinical questions about avulsed permanent teeth',
  },
  {
    id: 'flashcards',
    icon: '🗂️',
    label: 'Create Flashcards',
    labelAr: 'أنشئ بطاقات',
    placeholder: 'What topic should the flashcards cover?',
    example: 'Create flashcards for the classification of periodontal diseases',
  },
  {
    id: 'summary',
    icon: '📄',
    label: 'Revision Summary',
    labelAr: 'ملخص مراجعة',
    placeholder: 'What topic do you want summarised?',
    example: 'Give me a one-page high-yield revision summary of endodontic emergencies',
  },
  {
    id: 'compare',
    icon: '🎯',
    label: 'Explain My Mistake',
    labelAr: 'فهّمني خطأي',
    placeholder: 'Paste the question and your answer…',
    example: 'I answered D but the correct answer is B — can you explain why?',
  },
  {
    id: 'session',
    icon: '⏱️',
    label: 'Build a Study Session',
    labelAr: 'بناء جلسة دراسية',
    placeholder: 'How long do you have and what do you want to cover?',
    example: 'I have 40 minutes to revise periodontal diagnosis',
  },
];

// ── Lightweight markdown renderer ─────────────────────────────────────────────

function applyInline(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g);
  return parts.map((p, i) => {
    if (p.startsWith('**') && p.endsWith('**'))
      return <strong key={i}>{p.slice(2, -2)}</strong>;
    if (p.startsWith('*') && p.endsWith('*'))
      return <em key={i}>{p.slice(1, -1)}</em>;
    if (p.startsWith('`') && p.endsWith('`'))
      return (
        <code key={i} className="bg-slate-700 px-1.5 py-0.5 rounded text-xs font-mono text-slate-200">
          {p.slice(1, -1)}
        </code>
      );
    return p;
  });
}

function ParagraphBlock({ text, isUser }: { text: string; isUser: boolean }) {
  const paragraphs = text.split(/\n{2,}/);
  return (
    <>
      {paragraphs.map((para, pi) => {
        const lines = para.split('\n').filter(Boolean);
        if (lines.length === 0) return null;

        const isHeading   = lines.length === 1 && /^#{1,3}\s/.test(lines[0]);
        const isOrdered   = lines.every(l => /^\d+\.\s/.test(l));
        const isUnordered = lines.every(l => /^[-*•]\s/.test(l));

        if (isHeading) {
          const level = (lines[0].match(/^(#+)/) ?? ['', ''])[1].length;
          const text  = lines[0].replace(/^#+\s/, '');
          return level === 1
            ? <h3 key={pi} className="text-sm font-bold text-slate-100 mt-1 mb-0.5">{text}</h3>
            : <h4 key={pi} className="text-xs font-semibold text-slate-300 mt-1">{text}</h4>;
        }
        if (isOrdered) {
          return (
            <ol key={pi} className="list-decimal list-inside space-y-0.5 text-sm">
              {lines.map((l, li) => (
                <li key={li} className={isUser ? '' : 'text-slate-200'}>
                  {applyInline(l.replace(/^\d+\.\s/, ''))}
                </li>
              ))}
            </ol>
          );
        }
        if (isUnordered) {
          return (
            <ul key={pi} className="list-disc list-inside space-y-0.5 text-sm">
              {lines.map((l, li) => (
                <li key={li} className={isUser ? '' : 'text-slate-200'}>
                  {applyInline(l.replace(/^[-*•]\s/, ''))}
                </li>
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

function SimpleMarkdown({ text, isUser }: { text: string; isUser: boolean }) {
  const codeBlockRe = /```[\w]*\n?([\s\S]*?)```/g;
  const blocks: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = codeBlockRe.exec(text)) !== null) {
    if (match.index > lastIndex) {
      blocks.push(
        <ParagraphBlock key={`p-${lastIndex}`} text={text.slice(lastIndex, match.index)} isUser={isUser} />
      );
    }
    blocks.push(
      <pre
        key={`code-${match.index}`}
        className="bg-slate-900 text-slate-100 rounded-lg p-3 overflow-x-auto text-xs font-mono my-2 border border-slate-700"
      >
        {match[1].trim()}
      </pre>
    );
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    blocks.push(
      <ParagraphBlock key={`p-end`} text={text.slice(lastIndex)} isUser={isUser} />
    );
  }
  return <div className="space-y-1.5">{blocks}</div>;
}

// ── Copy button ───────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Could not copy to clipboard');
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-500 hover:text-slate-300 hover:bg-slate-700 rounded-lg transition-all"
      aria-label="Copy message"
      title="Copy"
    >
      {copied ? (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      ) : (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
        </svg>
      )}
    </button>
  );
}

// ── Message bubble ────────────────────────────────────────────────────────────

function MessageBubble({ message, onRetry }: { message: MessageRow; onRetry?: () => void }) {
  const isUser = message.role === 'user';

  return (
    <div className={`group flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold mt-0.5 select-none ${
        isUser ? 'bg-blue-600 text-white' : 'bg-slate-600 text-white'
      }`}>
        {isUser ? 'You' : 'AI'}
      </div>

      {/* Content + actions */}
      <div className={`flex flex-col gap-1.5 max-w-[82%] min-w-0 ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={`rounded-2xl px-4 py-3 ${
          isUser
            ? 'bg-blue-600 text-white rounded-tr-sm'
            : 'bg-slate-800 text-slate-100 rounded-tl-sm border border-slate-700/40'
        }`}>
          <SimpleMarkdown text={message.content} isUser={isUser} />
        </div>

        {/* Action bar — visible on hover */}
        <div className={`flex items-center gap-0.5 ${isUser ? 'flex-row-reverse' : ''}`}>
          <CopyButton text={message.content} />
          {isUser && onRetry && (
            <button
              onClick={onRetry}
              className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-500 hover:text-slate-300 hover:bg-slate-700 rounded-lg transition-all text-[10px] font-medium flex items-center gap-1"
              title="Retry this message"
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 4v6h6"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/>
              </svg>
              Retry
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Typing indicator ──────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex gap-3">
      <div className="w-7 h-7 rounded-full bg-slate-600 text-white flex items-center justify-center shrink-0 text-[10px] font-bold">
        AI
      </div>
      <div className="bg-slate-800 rounded-2xl rounded-tl-sm px-4 py-3 border border-slate-700/40">
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

// ── Conversation list item ────────────────────────────────────────────────────

function ConvItem({
  conv,
  active,
  onClick,
  onDelete,
  onRename,
}: {
  conv: ConversationRow;
  active: boolean;
  onClick: () => void;
  onDelete: () => void;
  onRename: (title: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft,   setDraft]   = useState(conv.title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const date    = new Date(conv.updated_at);
  const now     = new Date();
  const sameDay = date.toDateString() === now.toDateString();
  const label   = sameDay
    ? date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  function commitRename() {
    const t = draft.trim();
    if (t && t !== conv.title) onRename(t);
    setEditing(false);
  }

  return (
    <div
      className={`group relative flex items-start gap-2 px-3 py-2.5 cursor-pointer rounded-lg mx-1 transition-colors ${
        active
          ? 'bg-white/10 text-white'
          : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
      }`}
      onClick={() => { if (!editing) onClick(); }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5 opacity-60">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
      </svg>

      <div className="flex-1 min-w-0">
        {editing ? (
          <input
            ref={inputRef}
            value={draft}
            onClick={e => e.stopPropagation()}
            onChange={e => setDraft(e.target.value)}
            onBlur={commitRename}
            onKeyDown={e => {
              if (e.key === 'Enter') { e.preventDefault(); commitRename(); }
              if (e.key === 'Escape') { setDraft(conv.title); setEditing(false); }
            }}
            className="w-full bg-slate-700 text-white text-xs rounded px-1 py-0.5 outline-none"
          />
        ) : (
          <>
            <p className="text-xs font-medium truncate leading-snug">{conv.title}</p>
            <p className="text-xs opacity-50 mt-0.5">{label}</p>
          </>
        )}
      </div>

      {/* Hover actions */}
      <div className="opacity-0 group-hover:opacity-100 flex gap-0.5 shrink-0 transition-opacity">
        <button
          onClick={e => { e.stopPropagation(); setDraft(conv.title); setEditing(true); }}
          className="p-0.5 hover:text-blue-400 rounded transition-colors"
          aria-label="Rename conversation"
          title="Rename"
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 3a2.828 2.828 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
          </svg>
        </button>
        <button
          onClick={e => { e.stopPropagation(); onDelete(); }}
          className="p-0.5 hover:text-red-400 rounded transition-colors"
          aria-label="Delete conversation"
          title="Delete"
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

// ── Mode card (welcome screen) ────────────────────────────────────────────────

function ModeCard({ mode, onClick }: { mode: ModeConfig; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="text-left bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 rounded-xl px-3.5 py-3 transition-colors group"
    >
      <div className="flex items-start gap-2.5">
        <span className="text-base leading-none mt-0.5">{mode.icon}</span>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-slate-200 group-hover:text-white transition-colors">{mode.label}</p>
          <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed line-clamp-2">{mode.example}</p>
        </div>
      </div>
    </button>
  );
}

// ── Welcome screen ────────────────────────────────────────────────────────────

function WelcomeScreen({ onModeSelect, onSuggest }: {
  onModeSelect: (mode: AIMode) => void;
  onSuggest: (text: string) => void;
}) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 overflow-y-auto">
      {/* Hero */}
      <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-900/40">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"/>
        </svg>
      </div>

      <h2 className="text-lg font-bold text-white mb-1">SDLE AI Tutor</h2>
      <p className="text-sm text-slate-400 mb-6 text-center max-w-sm leading-relaxed">
        Ask a dental question, get a clear explanation, and find the exact approved source where you can study it.
      </p>

      {/* Mode grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-xl mb-6">
        {MODES.map((m, i) => (
          <ModeCard
            key={`${m.id}-${i}`}
            mode={m}
            onClick={() => {
              onModeSelect(m.id);
              onSuggest(m.example);
            }}
          />
        ))}
      </div>

      {/* Safety notice */}
      <p className="text-[11px] text-slate-600 text-center max-w-sm leading-relaxed">
        Do not enter patient-identifying information, confidential exam questions, passwords, or private third-party data.
      </p>
    </div>
  );
}

// ── Mode selector bar ─────────────────────────────────────────────────────────

function ModePill({
  mode,
  active,
  onClick,
}: {
  mode: ModeConfig;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
        active
          ? 'bg-blue-600 text-white'
          : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700 border border-slate-700'
      }`}
    >
      <span>{mode.icon}</span>
      <span className="hidden sm:inline">{mode.label}</span>
    </button>
  );
}

// ── Chat input ────────────────────────────────────────────────────────────────

function ChatInput({
  value,
  onChange,
  onSubmit,
  disabled,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  disabled: boolean;
  placeholder: string;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  function resize() {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 180) + 'px';
  }

  const overLimit = value.length > MAX_INPUT;
  const nearLimit = value.length > MAX_INPUT * 0.85;

  return (
    <div className={`flex flex-col bg-slate-800 border rounded-2xl px-4 pt-3 pb-2 focus-within:border-slate-400 transition-colors ${
      overLimit ? 'border-red-500' : 'border-slate-600'
    }`}>
      <textarea
        ref={ref}
        value={value}
        rows={1}
        placeholder={placeholder}
        disabled={disabled}
        aria-label="Message input"
        className="flex-1 bg-transparent resize-none outline-none text-sm text-slate-100 placeholder:text-slate-500 min-h-[24px] leading-relaxed w-full"
        onChange={e => { onChange(e.target.value); resize(); }}
        onKeyDown={e => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (!overLimit) onSubmit();
          }
        }}
      />

      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-700/50">
        <span className={`text-[11px] transition-colors ${
          overLimit ? 'text-red-400' : nearLimit ? 'text-amber-400' : 'text-slate-600'
        }`}>
          {value.length > 0 ? `${value.length} / ${MAX_INPUT}` : ''}
          {overLimit ? ' — too long' : ''}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-600 hidden sm:inline">Shift+Enter for new line</span>
          <button
            onClick={onSubmit}
            disabled={disabled || !value.trim() || overLimit}
            className="w-8 h-8 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white flex items-center justify-center transition-colors"
            aria-label="Send message"
          >
            {disabled ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin">
                <circle cx="12" cy="12" r="10" strokeOpacity="0.25"/>
                <path d="M12 2a10 10 0 010 20" strokeOpacity="1"/>
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Evidence level badge ──────────────────────────────────────────────────────

const EVIDENCE_META: Record<EvidenceLevel, { label: string; cls: string; icon: string }> = {
  strong:       { label: 'Strongly supported', cls: 'text-emerald-400 bg-emerald-950/40 border-emerald-800/40', icon: '✓✓' },
  supported:    { label: 'Supported',           cls: 'text-blue-400 bg-blue-950/40 border-blue-800/40',         icon: '✓'  },
  partial:      { label: 'Partially supported', cls: 'text-amber-400 bg-amber-950/40 border-amber-800/40',     icon: '~'  },
  insufficient: { label: 'General knowledge',   cls: 'text-slate-400 bg-slate-800/40 border-slate-700/40',     icon: '?'  },
};

function EvidenceBadge({ level }: { level: EvidenceLevel }) {
  const m = EVIDENCE_META[level];
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border ${m.cls}`}>
      <span>{m.icon}</span>
      {m.label}
    </span>
  );
}

// ── Citation card ─────────────────────────────────────────────────────────────

function CitationList({ citations }: { citations: Citation[] }) {
  if (citations.length === 0) return null;
  return (
    <div className="mt-2 space-y-1.5">
      <p className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">Sources used</p>
      {citations.map(c => (
        <div
          key={c.chunkId}
          className="bg-slate-850 border border-slate-700/50 rounded-lg px-3 py-2 text-[11px] text-slate-300"
        >
          <div className="flex items-start gap-2">
            <span className="shrink-0 text-slate-500 font-bold text-[10px] mt-0.5">
              [{c.sourceIndex}]
            </span>
            <div className="min-w-0">
              <p className="font-medium text-slate-200 leading-snug truncate">{c.resourceTitle}</p>
              <p className="text-slate-500 mt-0.5 capitalize">
                {c.resourceType}
                {c.chapter ? ` · ${c.chapter}` : ''}
                {c.section  ? ` · ${c.section}`  : ''}
                {c.pageNumber ? ` · p. ${c.pageNumber}` : ''}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Error banner ──────────────────────────────────────────────────────────────

function ErrorBanner({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="mx-4 mb-2 px-4 py-3 bg-red-950/40 border border-red-800/50 rounded-xl flex items-start gap-3">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-red-300 leading-relaxed">{message}</p>
      </div>
      <button
        onClick={onRetry}
        className="shrink-0 text-xs text-red-400 hover:text-red-200 font-medium transition-colors"
      >
        Retry
      </button>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

interface LastResponse {
  messageId: string | null;
  citations: Citation[];
  evidenceLevel: EvidenceLevel;
  retrievedSources: number;
  requestId: string;
}

export function AITutor() {
  const [activeConvId,  setActiveConvId]  = useState<string | null>(null);
  const [activeMode,    setActiveMode]    = useState<AIMode>('explain');
  const [input,         setInput]         = useState('');
  const [isThinking,    setIsThinking]    = useState(false);
  const [sidebarOpen,   setSidebarOpen]   = useState(true);
  const [lastError,     setLastError]     = useState<string | null>(null);
  const [lastInput,     setLastInput]     = useState<string>('');
  const [lastResponse,  setLastResponse]  = useState<LastResponse | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: conversations }        = useConversations();
  const { data: messages }             = useConversationMessages(activeConvId);
  const sendMessage   = useSendMessage();
  const deleteConv    = useDeleteConversation();
  const renameConv    = useRenameConversation();

  // Auto-scroll when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isThinking]);

  const handleSend = useCallback(async (textOverride?: string) => {
    const text = (textOverride ?? input).trim();
    if (!text || isThinking) return;
    setInput('');
    setLastError(null);
    setLastInput(text);
    setLastResponse(null);
    setIsThinking(true);
    try {
      const result = await sendMessage.mutateAsync({
        conversationId: activeConvId,
        message: text,
      });
      if (!activeConvId) setActiveConvId(result.convId);
      setLastResponse({
        messageId: result.messageId,
        citations: result.citations,
        evidenceLevel: result.evidenceLevel,
        retrievedSources: result.retrievedSources,
        requestId: result.requestId,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'We could not complete this request. Please try again.';
      setLastError(msg);
      toast.error(msg, { duration: 5000 });
    } finally {
      setIsThinking(false);
    }
  }, [input, isThinking, activeConvId, sendMessage]);

  function handleRetry() {
    if (lastInput) handleSend(lastInput);
  }

  function handleNewChat() {
    setActiveConvId(null);
    setInput('');
    setLastError(null);
    setLastResponse(null);
  }

  async function handleDelete(id: string) {
    try {
      await deleteConv.mutateAsync(id);
      if (activeConvId === id) setActiveConvId(null);
    } catch {
      toast.error('Failed to delete conversation');
    }
  }

  async function handleRename(id: string, title: string) {
    try {
      await renameConv.mutateAsync({ id, title });
    } catch {
      toast.error('Failed to rename conversation');
    }
  }

  const activeTitle = activeConvId
    ? conversations?.find(c => c.id === activeConvId)?.title ?? 'Conversation'
    : 'New conversation';

  const currentMode = MODES.find(m => m.id === activeMode) ?? MODES[0];

  return (
    <AppShell role="student" title="AI Tutor">
      <div className="h-full flex overflow-hidden bg-slate-900">

        {/* ── Sidebar ── */}
        <div className={`flex flex-col shrink-0 transition-all duration-200 border-r border-slate-700/60 bg-slate-900 ${
          sidebarOpen ? 'w-60' : 'w-0 overflow-hidden'
        }`}>
          {/* New chat button */}
          <div className="p-3 border-b border-slate-700/60 shrink-0">
            <button
              onClick={handleNewChat}
              className="w-full flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-xl transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14"/>
              </svg>
              New chat
            </button>
          </div>

          {/* Conversation list */}
          <div className="flex-1 overflow-y-auto py-2 space-y-0.5">
            {conversations && conversations.length > 0 ? (
              <>
                <p className="text-[10px] uppercase tracking-wider text-slate-600 px-4 pt-1 pb-1.5 font-medium">
                  Recent
                </p>
                {conversations.map(c => (
                  <ConvItem
                    key={c.id}
                    conv={c}
                    active={c.id === activeConvId}
                    onClick={() => { setActiveConvId(c.id); setLastError(null); setLastResponse(null); }}
                    onDelete={() => handleDelete(c.id)}
                    onRename={title => handleRename(c.id, title)}
                  />
                ))}
              </>
            ) : (
              <p className="text-xs text-slate-500 px-4 py-3">No conversations yet</p>
            )}
          </div>

          {/* Safety footer */}
          <div className="p-3 border-t border-slate-700/60 shrink-0">
            <p className="text-[10px] text-slate-600 leading-relaxed">
              Do not share patient data, confidential exam content, passwords, or private information.
            </p>
          </div>
        </div>

        {/* ── Main chat area ── */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

          {/* Toolbar */}
          <div className="flex items-center gap-3 px-4 h-12 border-b border-slate-700/60 shrink-0">
            <button
              onClick={() => setSidebarOpen(o => !o)}
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-700 rounded-lg transition-colors"
              aria-label={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12h18M3 6h18M3 18h18"/>
              </svg>
            </button>
            <span className="text-sm font-medium text-slate-300 truncate flex-1 min-w-0">
              {activeTitle}
            </span>
          </div>

          {/* Mode pills (only visible during active chat) */}
          {activeConvId && (
            <div className="flex gap-1.5 px-4 py-2 overflow-x-auto border-b border-slate-800/60 shrink-0">
              {MODES.slice(0, 5).map((m, i) => (
                <ModePill
                  key={`${m.id}-${i}`}
                  mode={m}
                  active={activeMode === m.id && i === MODES.findIndex(x => x.id === activeMode)}
                  onClick={() => setActiveMode(m.id)}
                />
              ))}
            </div>
          )}

          {/* Messages area */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
            {!activeConvId && !isThinking ? (
              <WelcomeScreen
                onModeSelect={m => setActiveMode(m)}
                onSuggest={text => setInput(text)}
              />
            ) : (
              <>
                {(messages ?? []).map((m, i) => {
                  const isLastAssistant =
                    m.role === 'assistant' &&
                    i === (messages?.length ?? 0) - 1 &&
                    !isThinking &&
                    lastResponse !== null;

                  return (
                    <React.Fragment key={m.id}>
                      <MessageBubble
                        message={m}
                        onRetry={
                          m.role === 'user' && i === (messages?.length ?? 0) - 2
                            ? handleRetry
                            : undefined
                        }
                      />
                      {isLastAssistant && (
                        <div className="flex gap-3">
                          <div className="w-7 shrink-0" />
                          <div className="flex-1 min-w-0 space-y-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <EvidenceBadge level={lastResponse.evidenceLevel} />
                              {lastResponse.retrievedSources > 0 && (
                                <span className="text-[10px] text-slate-600">
                                  {lastResponse.retrievedSources} source{lastResponse.retrievedSources > 1 ? 's' : ''} searched
                                </span>
                              )}
                            </div>
                            <CitationList citations={lastResponse.citations} />
                          </div>
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
                {isThinking && <TypingIndicator />}
              </>
            )}
          </div>

          {/* Error banner */}
          {lastError && !isThinking && (
            <ErrorBanner message={lastError} onRetry={handleRetry} />
          )}

          {/* Input area */}
          <div className="px-4 pb-4 pt-2 shrink-0">
            <ChatInput
              value={input}
              onChange={setInput}
              onSubmit={() => handleSend()}
              disabled={isThinking}
              placeholder={activeConvId ? currentMode.placeholder : 'Ask a dental question or choose a mode above…'}
            />
            <p className="text-center text-[11px] text-slate-600 mt-2">
              AI responses are for study purposes only — verify clinical information from authoritative sources.
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
