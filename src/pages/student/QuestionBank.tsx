import React, { useState, useMemo, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { AppShell } from '@/components/layout/AppShell';
import { PageContainer } from '@/components/layout/PageContainer';
import { Skeleton } from '@/components/ui/Skeleton';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/config/app';
import {
  useAllQuestionsForBank,
  useMyAttemptSummary,
  useSubmitAttempt,
  type QuestionForBank,
  type AttemptSummary,
} from '@/hooks/useQuestions';
import { useBookmarkedIds, useToggleBookmark } from '@/hooks/useBookmarks';
import { ReportButton } from '@/components/ui/ReportButton';

// ── Helpers ───────────────────────────────────────────────────────────────────

const DIFFICULTY_META: Record<string, { label: string; cls: string }> = {
  easy:   { label: 'Easy',   cls: 'bg-emerald-100 text-emerald-700' },
  medium: { label: 'Medium', cls: 'bg-amber-100 text-amber-700' },
  hard:   { label: 'Hard',   cls: 'bg-red-100 text-red-700' },
};

function DiffBadge({ difficulty }: { difficulty: string }) {
  const m = DIFFICULTY_META[difficulty] ?? { label: difficulty, cls: 'bg-slate-100 text-slate-500' };
  return <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${m.cls}`}>{m.label}</span>;
}

function StatusIcon({ summary }: { summary?: AttemptSummary }) {
  if (!summary) {
    return (
      <span className="w-5 h-5 rounded-full border-2 border-slate-200 flex items-center justify-center shrink-0" title="Not attempted" />
    );
  }
  if (summary.latestIsCorrect) {
    return (
      <span className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shrink-0 text-white" title="Correct">
        <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 6l3 3 5-5"/></svg>
      </span>
    );
  }
  return (
    <span className="w-5 h-5 rounded-full bg-red-400 flex items-center justify-center shrink-0 text-white" title="Incorrect">
      <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 2l8 8M10 2l-8 8"/></svg>
    </span>
  );
}

// ── Bookmark button ───────────────────────────────────────────────────────────

function BookmarkBtn({ question, bookmarkedIds }: { question: QuestionForBank; bookmarkedIds?: Set<string> }) {
  const toggle = useToggleBookmark();
  const isBookmarked = bookmarkedIds?.has(question.id) ?? false;

  function handleClick(e: React.MouseEvent) {
    e.stopPropagation();
    const subtitle = [question.topics?.subjects?.name, question.topics?.name].filter(Boolean).join(' › ');
    toggle.mutate({
      itemType: 'question',
      itemId: question.id,
      title: question.question_text.slice(0, 80) + (question.question_text.length > 80 ? '…' : ''),
      subtitle,
      itemRoute: ROUTES.questionBank,
      isBookmarked,
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={toggle.isPending}
      className={`p-1 rounded transition-colors ${isBookmarked ? 'text-amber-500' : 'text-slate-300 hover:text-amber-400'}`}
      aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark question'}
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill={isBookmarked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>
      </svg>
    </button>
  );
}

// ── Filter bar ────────────────────────────────────────────────────────────────

type StatusFilter = 'all' | 'new' | 'correct' | 'incorrect';

interface FilterState {
  subjectId: string;
  topicId: string;
  difficulty: string;
  status: StatusFilter;
}

const DEFAULT_FILTERS: FilterState = { subjectId: '', topicId: '', difficulty: '', status: 'all' };

const STATUS_OPTS: { value: StatusFilter; label: string }[] = [
  { value: 'all',       label: 'All' },
  { value: 'new',       label: 'Not tried' },
  { value: 'correct',   label: 'Correct' },
  { value: 'incorrect', label: 'Incorrect' },
];

function FilterBar({
  filters,
  onChange,
  subjects,
  topics,
  onReset,
}: {
  filters: FilterState;
  onChange: (f: Partial<FilterState>) => void;
  subjects: { id: string; name: string }[];
  topics: { id: string; name: string }[];
  onReset: () => void;
}) {
  const hasActive = filters.subjectId || filters.topicId || filters.difficulty || filters.status !== 'all';

  const selectCls = 'px-3 py-1.5 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700';

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <select value={filters.subjectId} onChange={e => onChange({ subjectId: e.target.value, topicId: '' })} className={selectCls}>
        <option value="">All subjects</option>
        {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
      </select>

      <select value={filters.topicId} onChange={e => onChange({ topicId: e.target.value })} className={selectCls} disabled={topics.length === 0}>
        <option value="">All topics</option>
        {topics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
      </select>

      <select value={filters.difficulty} onChange={e => onChange({ difficulty: e.target.value })} className={selectCls}>
        <option value="">Any difficulty</option>
        {Object.entries(DIFFICULTY_META).map(([v, { label }]) => <option key={v} value={v}>{label}</option>)}
      </select>

      <div className="flex rounded-lg border border-slate-200 overflow-hidden">
        {STATUS_OPTS.map(opt => (
          <button
            key={opt.value}
            onClick={() => onChange({ status: opt.value })}
            className={`px-3 py-1.5 text-xs font-medium transition-colors ${
              filters.status === opt.value
                ? 'bg-blue-600 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {hasActive && (
        <button onClick={onReset} className="text-xs text-slate-400 hover:text-slate-600 underline px-1">
          Reset
        </button>
      )}
    </div>
  );
}

// ── Question row ──────────────────────────────────────────────────────────────

function QuestionRow({
  question,
  index,
  summary,
  bookmarkedIds,
  onClick,
}: {
  question: QuestionForBank;
  index: number;
  summary?: AttemptSummary;
  bookmarkedIds?: Set<string>;
  onClick: () => void;
}) {
  return (
    <tr
      className="group cursor-pointer hover:bg-blue-50 transition-colors"
      onClick={onClick}
    >
      <td className="pl-5 py-3 w-8 text-sm text-slate-400 font-mono">{index + 1}</td>
      <td className="py-3 pr-3">
        <StatusIcon summary={summary} />
      </td>
      <td className="py-3 pr-4 max-w-0 w-full">
        <p className="text-sm text-slate-800 line-clamp-2 group-hover:text-blue-700 transition-colors">
          {question.question_text}
        </p>
      </td>
      <td className="py-3 pr-4 whitespace-nowrap">
        <span className="text-xs text-slate-500">
          {question.topics?.subjects?.name && (
            <>{question.topics.subjects.name} <span className="text-slate-300">›</span>{' '}</>
          )}
          {question.topics?.name}
        </span>
      </td>
      <td className="py-3 whitespace-nowrap">
        <DiffBadge difficulty={question.difficulty} />
      </td>
      <td className="py-3 pr-3 w-16">
        <div className="flex items-center gap-0.5">
          <BookmarkBtn question={question} bookmarkedIds={bookmarkedIds} />
          <ReportButton questionId={question.id} />
        </div>
      </td>
    </tr>
  );
}

// ── Practice modal ────────────────────────────────────────────────────────────

const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E'];

function PracticeModal({
  questions,
  index,
  onClose,
  onNav,
  attemptMap,
  bookmarkedIds,
}: {
  questions: QuestionForBank[];
  index: number;
  onClose: () => void;
  onNav: (newIndex: number) => void;
  attemptMap: Map<string, AttemptSummary> | undefined;
  bookmarkedIds?: Set<string>;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed]   = useState(false);
  const submitAttempt = useSubmitAttempt();
  const question = questions[index];
  const questionIds = useMemo(() => questions.map(q => q.id), [questions]);

  // Reset when question changes
  useEffect(() => {
    setSelected(null);
    setRevealed(false);
  }, [index]);

  // Focus first option on open
  const firstBtnRef = useRef<HTMLButtonElement>(null);
  useEffect(() => { firstBtnRef.current?.focus(); }, [index]);

  async function handleOptionClick(optionId: string, isCorrect: boolean) {
    if (revealed) return;
    setSelected(optionId);
    setRevealed(true);
    try {
      await submitAttempt.mutateAsync({ questionId: question.id, selectedOptionId: optionId, isCorrect, questionIds });
    } catch {
      // non-blocking
    }
  }

  function handleReset() {
    setSelected(null);
    setRevealed(false);
  }

  if (!question) return null;

  const correctOptionId = question.question_options.find(o => o.is_correct)?.id;
  const isCorrect = selected === correctOptionId;
  const prevSummary = attemptMap?.get(question.id);

  return (
    <Dialog open onClose={onClose} size="xl" closeOnBackdrop={false}>
      {/* Progress + meta */}
      <div className="flex items-center justify-between mb-4 -mt-1">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-mono">{index + 1} / {questions.length}</span>
          <DiffBadge difficulty={question.difficulty} />
          {question.topics && (
            <span className="text-xs text-slate-400">
              {question.topics.subjects?.name} › {question.topics.name}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {prevSummary && (
            <span className="text-xs text-slate-400">
              {prevSummary.correct}/{prevSummary.total} past
            </span>
          )}
          <BookmarkBtn question={question} bookmarkedIds={bookmarkedIds} />
          <ReportButton questionId={question.id} />
        </div>
      </div>

      {/* Question text */}
      <p className="text-base font-medium text-slate-900 leading-relaxed mb-5">
        {question.question_text}
      </p>

      {/* Options */}
      <div className="space-y-2 mb-5">
        {question.question_options.map((opt, i) => {
          const letter = OPTION_LETTERS[i] ?? String(i + 1);
          const isSelected = selected === opt.id;
          const isCorrectOpt = opt.is_correct;

          let cls = 'bg-white border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-blue-50';
          if (revealed) {
            if (isCorrectOpt) cls = 'bg-emerald-50 border-emerald-400 text-emerald-800';
            else if (isSelected && !isCorrectOpt) cls = 'bg-red-50 border-red-400 text-red-700 line-through';
            else cls = 'bg-white border-slate-200 text-slate-400';
          } else if (isSelected) {
            cls = 'bg-blue-50 border-blue-400 text-blue-800';
          }

          return (
            <button
              key={opt.id}
              ref={i === 0 ? firstBtnRef : undefined}
              disabled={revealed}
              onClick={() => handleOptionClick(opt.id, opt.is_correct)}
              className={`w-full flex items-start gap-3 px-4 py-3 rounded-xl border-2 text-left text-sm transition-all disabled:cursor-default ${cls}`}
            >
              <span className="font-bold shrink-0 w-4">{letter}.</span>
              <span className="flex-1">{opt.option_text}</span>
              {revealed && isCorrectOpt && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
              )}
            </button>
          );
        })}
      </div>

      {/* Result + explanation */}
      {revealed && (
        <div className={`rounded-xl p-4 mb-4 ${isCorrect ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'}`}>
          <p className={`text-sm font-semibold mb-1 ${isCorrect ? 'text-emerald-700' : 'text-red-600'}`}>
            {isCorrect ? '✓ Correct!' : '✗ Incorrect'}
          </p>
          {question.explanation && (
            <p className="text-sm text-slate-700 leading-relaxed">{question.explanation}</p>
          )}
        </div>
      )}

      {/* Navigation footer */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex gap-2">
          {revealed && !isCorrect && (
            <button
              onClick={handleReset}
              className="text-xs text-blue-600 hover:underline"
            >
              Try again
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={index <= 0}
            onClick={() => onNav(index - 1)}
          >
            ← Previous
          </Button>
          {index < questions.length - 1 ? (
            <Button size="sm" onClick={() => onNav(index + 1)}>
              Next →
            </Button>
          ) : (
            <Button size="sm" variant="outline" onClick={onClose}>
              Done
            </Button>
          )}
        </div>
      </div>
    </Dialog>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function QuestionBank() {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [practiceIndex, setPracticeIndex] = useState<number | null>(null);

  const { data: questions, isLoading } = useAllQuestionsForBank();
  const { data: attemptMap }  = useMyAttemptSummary();
  const { data: bookmarkedIds } = useBookmarkedIds('question');

  function updateFilter(partial: Partial<FilterState>) {
    setFilters(f => ({ ...f, ...partial }));
  }

  // Derive subjects from loaded questions
  const subjects = useMemo(() => {
    const map = new Map<string, string>();
    for (const q of questions ?? []) {
      const s = q.topics?.subjects;
      if (s) map.set(s.id, s.name);
    }
    return Array.from(map.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [questions]);

  // Topics for the selected subject
  const topics = useMemo(() => {
    const map = new Map<string, string>();
    for (const q of questions ?? []) {
      if (!filters.subjectId || q.topics?.subjects?.id === filters.subjectId) {
        if (q.topics) map.set(q.topics.id, q.topics.name);
      }
    }
    return Array.from(map.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [questions, filters.subjectId]);

  // Filtered list
  const filtered = useMemo(() => {
    let list = questions ?? [];
    if (filters.subjectId) list = list.filter(q => q.topics?.subjects?.id === filters.subjectId);
    if (filters.topicId)   list = list.filter(q => q.topic_id === filters.topicId);
    if (filters.difficulty) list = list.filter(q => q.difficulty === filters.difficulty);
    if (filters.status === 'new')       list = list.filter(q => !attemptMap?.has(q.id));
    if (filters.status === 'correct')   list = list.filter(q => attemptMap?.get(q.id)?.latestIsCorrect === true);
    if (filters.status === 'incorrect') list = list.filter(q => attemptMap?.get(q.id)?.latestIsCorrect === false);
    return list;
  }, [questions, attemptMap, filters]);

  // Stats
  const totalQ       = questions?.length ?? 0;
  const attempted    = attemptMap?.size ?? 0;
  const correctCount = attemptMap ? Array.from(attemptMap.values()).filter(a => a.latestIsCorrect).length : 0;
  const accuracy     = attempted > 0 ? Math.round((correctCount / attempted) * 100) : 0;

  function openPractice(index: number) {
    setPracticeIndex(index);
  }

  return (
    <AppShell role="student" title="Question Bank">
      <PageContainer
        title="Question Bank"
        description="Practise exam-style questions from the SDLE curriculum"
        maxWidth="2xl"
        actions={
          filtered.length > 0 && (
            <Button size="sm" onClick={() => openPractice(0)}>
              ▶ Practice {filtered.length} question{filtered.length !== 1 ? 's' : ''}
            </Button>
          )
        }
      >
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            { label: 'Total Questions',  value: totalQ,   sub: undefined },
            { label: 'Attempted',        value: `${attempted}`, sub: totalQ > 0 ? `${Math.round((attempted / totalQ) * 100)}% of bank` : undefined },
            { label: 'Accuracy',         value: `${accuracy}%`, colorClass: accuracy >= 70 ? 'text-emerald-600' : attempted > 0 ? 'text-amber-600' : 'text-slate-900' },
          ].map(s => (
            <div key={s.label} className="bg-white border border-slate-200 rounded-xl px-4 py-3">
              <p className={`text-2xl font-bold ${(s as { colorClass?: string }).colorClass ?? 'text-slate-900'}`}>{s.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
              {s.sub && <p className="text-xs text-slate-400">{s.sub}</p>}
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 mb-4">
          <FilterBar
            filters={filters}
            onChange={updateFilter}
            subjects={subjects}
            topics={topics}
            onReset={() => setFilters(DEFAULT_FILTERS)}
          />
        </div>

        {/* Question count */}
        {!isLoading && (
          <p className="text-xs text-slate-400 mb-2 px-1">
            {filtered.length === totalQ
              ? `${totalQ} question${totalQ !== 1 ? 's' : ''}`
              : `${filtered.length} of ${totalQ} questions`}
          </p>
        )}

        {/* Question list */}
        {isLoading ? (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden space-y-px">
            {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-14 rounded-none first:rounded-t-xl last:rounded-b-xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border border-dashed border-slate-200 rounded-xl p-12 text-center">
            <p className="text-slate-500 font-medium mb-1">No questions match your filters</p>
            <p className="text-sm text-slate-400">
              {totalQ === 0
                ? 'No questions have been added to the question bank yet.'
                : 'Try adjusting the filters above.'}
            </p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 text-xs text-slate-400 uppercase tracking-wide">
                  <th className="pl-5 py-2.5 text-left w-10">#</th>
                  <th className="py-2.5 w-8" />
                  <th className="py-2.5 text-left">Question</th>
                  <th className="py-2.5 pr-4 text-left whitespace-nowrap">Topic</th>
                  <th className="py-2.5 text-left">Difficulty</th>
                  <th className="py-2.5 pr-3 w-8" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((q, i) => (
                  <QuestionRow
                    key={q.id}
                    question={q}
                    index={i}
                    summary={attemptMap?.get(q.id)}
                    bookmarkedIds={bookmarkedIds}
                    onClick={() => openPractice(i)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </PageContainer>

      {/* Practice modal */}
      {practiceIndex !== null && filtered.length > 0 && (
        <PracticeModal
          questions={filtered}
          index={practiceIndex}
          onClose={() => setPracticeIndex(null)}
          onNav={setPracticeIndex}
          attemptMap={attemptMap}
          bookmarkedIds={bookmarkedIds}
        />
      )}
    </AppShell>
  );
}
