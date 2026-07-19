import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { AppShell } from '@/components/layout/AppShell';
import { PageContainer } from '@/components/layout/PageContainer';
import { Skeleton } from '@/components/ui/Skeleton';
import { ROUTES } from '@/config/app';
import {
  useBookmarks,
  useToggleBookmark,
  type BookmarkRow,
  type BookmarkItemType,
} from '@/hooks/useBookmarks';

// ── Type metadata ─────────────────────────────────────────────────────────────

const TYPE_META: Record<BookmarkItemType, { label: string; icon: React.ReactNode; color: string }> = {
  question: {
    label: 'Question',
    color: 'bg-blue-100 text-blue-700',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3m.08 4h.01"/>
      </svg>
    ),
  },
  topic: {
    label: 'Topic',
    color: 'bg-violet-100 text-violet-700',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 016.5 17H20M4 19.5V5a2.5 2.5 0 012.5-2.5H20v15"/>
      </svg>
    ),
  },
  flashcard_deck: {
    label: 'Flashcard Deck',
    color: 'bg-amber-100 text-amber-700',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>
      </svg>
    ),
  },
};

type TabValue = 'all' | BookmarkItemType;

// ── Bookmark card ─────────────────────────────────────────────────────────────

function BookmarkCard({ bookmark, onRemove }: { bookmark: BookmarkRow; onRemove: () => void }) {
  const meta = TYPE_META[bookmark.item_type as BookmarkItemType] ?? TYPE_META.question;

  return (
    <div className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors group">
      {/* Type icon */}
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${meta.color}`}>
        {meta.icon}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-800 line-clamp-2">{bookmark.title}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-slate-400">{meta.label}</span>
          {bookmark.subtitle && (
            <>
              <span className="text-slate-200">·</span>
              <span className="text-xs text-slate-400 truncate">{bookmark.subtitle}</span>
            </>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {bookmark.item_route && (
          <Link
            to={bookmark.item_route}
            className="text-xs text-blue-600 hover:underline font-medium whitespace-nowrap"
          >
            Go to →
          </Link>
        )}
        {bookmark.item_type === 'question' && (
          <Link
            to={ROUTES.questionBank}
            className="text-xs text-blue-600 hover:underline font-medium whitespace-nowrap"
          >
            Practice →
          </Link>
        )}
        <button
          onClick={onRemove}
          className="p-1.5 text-slate-300 hover:text-red-400 transition-colors rounded opacity-0 group-hover:opacity-100"
          aria-label="Remove bookmark"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

const TABS: { value: TabValue; label: string }[] = [
  { value: 'all',           label: 'All' },
  { value: 'question',      label: 'Questions' },
  { value: 'topic',         label: 'Topics' },
  { value: 'flashcard_deck', label: 'Flashcards' },
];

export function Bookmarks() {
  const [tab, setTab] = useState<TabValue>('all');
  const toggle = useToggleBookmark();

  const { data: allBookmarks, isLoading } = useBookmarks();

  const filtered = tab === 'all'
    ? (allBookmarks ?? [])
    : (allBookmarks ?? []).filter(b => b.item_type === tab);

  // Counts per tab
  const counts: Record<TabValue, number> = {
    all:           allBookmarks?.length ?? 0,
    question:      allBookmarks?.filter(b => b.item_type === 'question').length ?? 0,
    topic:         allBookmarks?.filter(b => b.item_type === 'topic').length ?? 0,
    flashcard_deck: allBookmarks?.filter(b => b.item_type === 'flashcard_deck').length ?? 0,
  };

  async function handleRemove(bookmark: BookmarkRow) {
    try {
      await toggle.mutateAsync({
        itemType: bookmark.item_type as BookmarkItemType,
        itemId: bookmark.item_id,
        title: bookmark.title,
        isBookmarked: true,
      });
    } catch {
      toast.error('Failed to remove bookmark');
    }
  }

  return (
    <AppShell role="student" title="Bookmarks">
      <PageContainer
        title="Bookmarks"
        description="Questions, topics, and decks you've saved for later"
        maxWidth="2xl"
      >
        {/* Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1 mb-4 w-fit">
          {TABS.map(t => (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                tab === t.value
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {t.label}
              {counts[t.value] > 0 && (
                <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                  tab === t.value ? 'bg-slate-100 text-slate-600' : 'bg-slate-200 text-slate-500'
                }`}>
                  {counts[t.value]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* List */}
        {isLoading ? (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 rounded-none" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border border-dashed border-slate-200 rounded-xl p-14 text-center">
            <div className="w-12 h-12 mx-auto mb-3 bg-amber-50 rounded-2xl flex items-center justify-center">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>
              </svg>
            </div>
            <p className="text-sm font-semibold text-slate-700 mb-1">
              {tab === 'all' ? 'No bookmarks yet' : `No ${TYPE_META[tab as BookmarkItemType]?.label ?? ''} bookmarks`}
            </p>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              {tab === 'all'
                ? 'Bookmark questions and topics using the bookmark icon while studying.'
                : 'Use the bookmark icon to save items as you study.'}
            </p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
            {filtered.map(b => (
              <BookmarkCard
                key={b.id}
                bookmark={b}
                onRemove={() => handleRemove(b)}
              />
            ))}
          </div>
        )}
      </PageContainer>
    </AppShell>
  );
}
