import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/config/app';
import { useGlobalSearch, type SearchResult, type SearchResultType } from '@/hooks/useGlobalSearch';

// ── Type metadata ─────────────────────────────────────────────────────────────

const TYPE_ORDER: SearchResultType[] = ['subject', 'topic', 'question', 'resource'];

const TYPE_META: Record<SearchResultType, { label: string; color: string; icon: React.ReactNode }> = {
  subject: {
    label: 'Subjects',
    color: 'text-violet-600 bg-violet-50',
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 016.5 17H20M4 19.5V5a2.5 2.5 0 012.5-2.5H20v15"/>
      </svg>
    ),
  },
  topic: {
    label: 'Topics',
    color: 'text-blue-600 bg-blue-50',
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
      </svg>
    ),
  },
  question: {
    label: 'Questions',
    color: 'text-slate-600 bg-slate-100',
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3m.08 4h.01"/>
      </svg>
    ),
  },
  resource: {
    label: 'Resources',
    color: 'text-amber-600 bg-amber-50',
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V7z"/><path d="M14 2v5h5M10 9H8m8 0h-4m4 4H8m8 4H8"/>
      </svg>
    ),
  },
};

// ── Quick links (shown when query is empty) ───────────────────────────────────

const QUICK_LINKS = [
  { label: 'Study Plan',    href: ROUTES.studyPlan,     icon: '📅' },
  { label: 'Question Bank', href: ROUTES.questionBank,  icon: '❓' },
  { label: 'Mock Exams',    href: ROUTES.mockExams,     icon: '📝' },
  { label: 'AI Tutor',      href: ROUTES.aiTutor,       icon: '🤖' },
  { label: 'Subjects',      href: ROUTES.subjects,      icon: '📚' },
  { label: 'Performance',   href: ROUTES.performance,   icon: '📊' },
];

function QuickLinks({ onNavigate }: { onNavigate: (href: string) => void }) {
  return (
    <div className="p-3">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2 px-1">Quick links</p>
      <div className="grid grid-cols-2 gap-1">
        {QUICK_LINKS.map(link => (
          <button
            key={link.href}
            onClick={() => onNavigate(link.href)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-slate-100 transition-colors text-left"
          >
            <span className="text-base">{link.icon}</span>
            {link.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Result item ───────────────────────────────────────────────────────────────

function ResultItem({
  result,
  focused,
  onClick,
  onMouseEnter,
}: {
  result: SearchResult;
  focused: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
}) {
  const meta = TYPE_META[result.type];
  const ref = useRef<HTMLDivElement>(null);

  // Scroll focused item into view
  useEffect(() => {
    if (focused) ref.current?.scrollIntoView({ block: 'nearest' });
  }, [focused]);

  return (
    <div
      ref={ref}
      className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors ${focused ? 'bg-blue-50' : 'hover:bg-slate-50'}`}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
    >
      <div className={`w-6 h-6 rounded flex items-center justify-center shrink-0 ${meta.color}`}>
        {meta.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${focused ? 'text-blue-700' : 'text-slate-800'}`}>
          {result.title}
        </p>
        {result.subtitle && (
          <p className="text-xs text-slate-400 truncate">{result.subtitle}</p>
        )}
      </div>
      <svg
        width="14" height="14" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        className={`shrink-0 transition-colors ${focused ? 'text-blue-400' : 'text-slate-200'}`}
      >
        <path d="M9 18l6-6-6-6"/>
      </svg>
    </div>
  );
}

// ── Command Palette ───────────────────────────────────────────────────────────

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const [query, setQuery]           = useState('');
  const [debouncedQuery, setDebQ]   = useState('');
  const [focusedIdx, setFocusedIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Debounce
  useEffect(() => {
    const t = setTimeout(() => setDebQ(query), 280);
    return () => clearTimeout(t);
  }, [query]);

  const { data: results, isFetching } = useGlobalSearch(debouncedQuery);

  // Reset on open
  useEffect(() => {
    if (open) {
      setQuery('');
      setDebQ('');
      setFocusedIdx(0);
      const t = setTimeout(() => inputRef.current?.focus(), 40);
      return () => clearTimeout(t);
    }
  }, [open]);

  // Reset focus when results change
  useEffect(() => { setFocusedIdx(0); }, [results]);

  const handleNavigate = useCallback((href: string) => {
    navigate(href);
    onClose();
  }, [navigate, onClose]);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;
    const total = results?.length ?? 0;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape')     { onClose(); return; }
      if (e.key === 'ArrowDown')  { e.preventDefault(); setFocusedIdx(i => Math.min(i + 1, total - 1)); }
      if (e.key === 'ArrowUp')    { e.preventDefault(); setFocusedIdx(i => Math.max(i - 1, 0)); }
      if (e.key === 'Enter' && results?.[focusedIdx]) {
        handleNavigate(results[focusedIdx].href);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, results, focusedIdx, onClose, handleNavigate]);

  if (!open) return null;

  // Group results preserving TYPE_ORDER
  const grouped: [SearchResultType, SearchResult[]][] = TYPE_ORDER
    .map(type => [type, (results ?? []).filter(r => r.type === type)] as [SearchResultType, SearchResult[]])
    .filter(([, items]) => items.length > 0);

  const hasResults = (results ?? []).length > 0;
  const showEmpty  = debouncedQuery.length >= 2 && !isFetching && !hasResults;

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center pt-[10vh] px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[75vh]">
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100 shrink-0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 shrink-0">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search topics, questions, resources…"
            className="flex-1 text-sm text-slate-900 placeholder:text-slate-400 outline-none"
          />
          {isFetching ? (
            <svg className="animate-spin text-slate-400 shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12a9 9 0 11-6.219-8.56"/>
            </svg>
          ) : (
            <kbd className="hidden sm:block text-xs text-slate-400 bg-slate-100 border border-slate-200 rounded px-1.5 py-0.5 shrink-0">
              Esc
            </kbd>
          )}
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto">
          {!hasResults && !showEmpty ? (
            <QuickLinks onNavigate={handleNavigate} />
          ) : showEmpty ? (
            <div className="px-4 py-10 text-center">
              <p className="text-sm font-medium text-slate-500">No results for "{debouncedQuery}"</p>
              <p className="text-xs text-slate-400 mt-1">Try a different keyword</p>
            </div>
          ) : (
            grouped.map(([type, items]) => {
              const meta = TYPE_META[type];
              return (
                <div key={type}>
                  <div className="px-4 py-1.5 bg-slate-50 border-b border-slate-100">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                      {meta.label}
                    </span>
                  </div>
                  {items.map(result => {
                    const globalIdx = (results ?? []).indexOf(result);
                    return (
                      <ResultItem
                        key={result.id}
                        result={result}
                        focused={globalIdx === focusedIdx}
                        onClick={() => handleNavigate(result.href)}
                        onMouseEnter={() => setFocusedIdx(globalIdx)}
                      />
                    );
                  })}
                </div>
              );
            })
          )}
        </div>

        {/* Footer hint */}
        <div className="shrink-0 border-t border-slate-100 px-4 py-2 flex items-center gap-4 text-xs text-slate-400">
          <span className="flex items-center gap-1"><kbd className="bg-slate-100 px-1 rounded text-[10px]">↑↓</kbd> Navigate</span>
          <span className="flex items-center gap-1"><kbd className="bg-slate-100 px-1 rounded text-[10px]">↵</kbd> Open</span>
          <span className="flex items-center gap-1"><kbd className="bg-slate-100 px-1 rounded text-[10px]">Esc</kbd> Close</span>
        </div>
      </div>
    </div>
  );
}
