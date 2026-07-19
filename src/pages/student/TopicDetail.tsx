import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { AppShell } from '@/components/layout/AppShell';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { Tabs, TabList, TabTrigger, TabPanel } from '@/components/ui/Tabs';
import { ROUTES } from '@/config/app';
import {
  useTopic,
  useSubtopicsWithObjectives,
  useTopicProgress,
  useUpsertTopicStatus,
  type SubtopicWithObjectives,
} from '@/hooks/useSubjects';
import {
  useResourcesByTopic,
  getVideoEmbedUrl,
  type ResourceRow,
} from '@/hooks/useResources';
import {
  useFlashcardDecksByTopic,
  useFlashcardsByDeck,
  useFlashcardProgressByDeck,
  type DeckRow,
} from '@/hooks/useFlashcards';
import {
  useTopicNotes,
  useStudentNote,
  useUpsertStudentNote,
  type TopicNoteRow,
} from '@/hooks/useNotes';
import {
  useQuestionsByTopic,
  useAttemptsByQuestions,
  useSubmitAttempt,
  type QuestionWithOptions,
  type OptionRow,
  type AttemptRow,
} from '@/hooks/useQuestions';
import { useBookmarkedIds, useToggleBookmark } from '@/hooks/useBookmarks';

const BLOOM_COLORS: Record<string, string> = {
  knowledge:      'bg-slate-100 text-slate-600',
  comprehension:  'bg-blue-100 text-blue-700',
  application:    'bg-emerald-100 text-emerald-700',
  analysis:       'bg-violet-100 text-violet-700',
  synthesis:      'bg-amber-100 text-amber-700',
  evaluation:     'bg-rose-100 text-rose-700',
};

// ── Subtopic accordion ───────────────────────────────────────────────

function SubtopicItem({ subtopic }: { subtopic: SubtopicWithObjectives }) {
  const [open, setOpen] = useState(false);
  const loCount = subtopic.learning_objectives.length;

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <button
        type="button"
        className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors"
        onClick={() => setOpen((p) => !p)}
        aria-expanded={open}
      >
        <div>
          <p className="text-sm font-semibold text-slate-800">{subtopic.name}</p>
          {subtopic.name_ar && <p className="text-xs text-slate-400 mt-0.5">{subtopic.name_ar}</p>}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {loCount > 0 && (
            <span className="text-xs text-slate-400">{loCount} objective{loCount !== 1 ? 's' : ''}</span>
          )}
          <svg
            className={`w-4 h-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}
            viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 8l5 5 5-5" />
          </svg>
        </div>
      </button>

      {open && (
        <div className="border-t border-slate-100 px-4 py-3 space-y-2">
          {subtopic.description && (
            <p className="text-xs text-slate-500 mb-3 leading-relaxed">{subtopic.description}</p>
          )}
          {loCount === 0 ? (
            <p className="text-xs text-slate-400 italic">No learning objectives added yet.</p>
          ) : (
            <ul className="space-y-2">
              {subtopic.learning_objectives.map((lo) => (
                <li key={lo.id} className="flex items-start gap-2.5">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium mt-0.5 uppercase tracking-wide shrink-0 ${BLOOM_COLORS[lo.bloom_level] ?? BLOOM_COLORS.knowledge}`}>
                    {lo.bloom_level.slice(0, 3)}
                  </span>
                  <span className="text-sm text-slate-700 leading-snug">{lo.text}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

// ── Books tab ────────────────────────────────────────────────────────

function BookCard({ resource }: { resource: ResourceRow }) {
  const [expanded, setExpanded] = useState(false);
  const isPdf = resource.type === 'pdf';

  return (
    <Card className="overflow-hidden">
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${isPdf ? 'bg-red-50' : 'bg-blue-50'}`}>
          {isPdf ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="1.8" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.8" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244"/>
            </svg>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-slate-900 leading-snug">{resource.title}</h3>
              {resource.title_ar && <p className="text-xs text-slate-400 mt-0.5">{resource.title_ar}</p>}
              {resource.description && (
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{resource.description}</p>
              )}
            </div>
            <Badge color="neutral" size="xs" className="shrink-0">{resource.type.toUpperCase()}</Badge>
          </div>
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <a
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
            >
              {isPdf ? 'Open PDF' : 'Visit link'}
              <svg width="12" height="12" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"/>
              </svg>
            </a>
            {isPdf && (
              <button
                type="button"
                onClick={() => setExpanded((p) => !p)}
                className="text-xs font-medium text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors"
              >
                {expanded ? 'Hide preview' : 'Preview'}
              </button>
            )}
          </div>
        </div>
      </div>

      {expanded && isPdf && (
        <div className="mt-4 rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
          <iframe
            src={resource.url}
            className="w-full h-[600px]"
            title={resource.title}
          />
        </div>
      )}
    </Card>
  );
}

function BooksTab({ resources, loading }: { resources: ResourceRow[] | undefined; loading: boolean }) {
  const items = (resources ?? []).filter((r) => r.type === 'pdf' || r.type === 'link');

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="py-16 text-center text-slate-400">
        <p className="text-4xl mb-3">📖</p>
        <p className="font-medium text-slate-600">No books or references yet</p>
        <p className="text-sm mt-1">Reading materials will appear here when added.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((r) => <BookCard key={r.id} resource={r} />)}
    </div>
  );
}

// ── Videos tab ───────────────────────────────────────────────────────

function VideoCard({ resource }: { resource: ResourceRow }) {
  const [playing, setPlaying] = useState(false);
  const embedUrl = getVideoEmbedUrl(resource.url);

  return (
    <Card className="overflow-hidden">
      {/* Thumbnail / player area */}
      <div className="rounded-xl overflow-hidden bg-slate-900 mb-3 aspect-video relative">
        {playing && embedUrl ? (
          <iframe
            src={`${embedUrl}&autoplay=1`}
            className="w-full h-full"
            title={resource.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            className="w-full h-full flex flex-col items-center justify-center gap-3 group"
            aria-label={`Play ${resource.title}`}
          >
            <div className="w-16 h-16 bg-white/10 group-hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="white" aria-hidden="true">
                <path d="M8 5.14v14l11-7-11-7z"/>
              </svg>
            </div>
            {!embedUrl && (
              <p className="text-xs text-white/60">External video — opens in new tab</p>
            )}
          </button>
        )}
      </div>

      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-slate-900">{resource.title}</h3>
          {resource.title_ar && <p className="text-xs text-slate-400 mt-0.5">{resource.title_ar}</p>}
          {resource.description && (
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">{resource.description}</p>
          )}
        </div>
        {resource.duration_mins && (
          <Badge color="neutral" size="xs" className="shrink-0">{resource.duration_mins}m</Badge>
        )}
      </div>

      {!embedUrl && (
        <a
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:underline"
        >
          Open video
          <svg width="12" height="12" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"/>
          </svg>
        </a>
      )}
    </Card>
  );
}

function VideosTab({ resources, loading }: { resources: ResourceRow[] | undefined; loading: boolean }) {
  const items = (resources ?? []).filter((r) => r.type === 'video');

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="py-16 text-center text-slate-400">
        <p className="text-4xl mb-3">🎬</p>
        <p className="font-medium text-slate-600">No videos yet</p>
        <p className="text-sm mt-1">Video lectures will appear here when added.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {items.map((r) => <VideoCard key={r.id} resource={r} />)}
    </div>
  );
}

// ── Questions tab ─────────────────────────────────────────────────────

const DIFFICULTY_STYLE: Record<string, string> = {
  easy:   'bg-emerald-100 text-emerald-700',
  medium: 'bg-amber-100   text-amber-700',
  hard:   'bg-red-100     text-red-700',
};

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

interface QuestionCardProps {
  question: QuestionWithOptions;
  attempt: AttemptRow | undefined;
  questionIds: string[];
}

function QuestionCard({ question, attempt, questionIds }: QuestionCardProps) {
  const submit = useSubmitAttempt();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [result, setResult] = useState<{ correct: boolean; correctId: string } | null>(
    attempt ? { correct: attempt.is_correct, correctId: question.question_options.find((o) => o.is_correct)?.id ?? '' } : null
  );

  const hasAttempted = !!attempt || !!result;

  const handleSubmit = async () => {
    if (!selected) return;
    const chosenOption = question.question_options.find((o) => o.id === selected);
    if (!chosenOption) return;
    const correct = chosenOption.is_correct;
    const correctId = question.question_options.find((o) => o.is_correct)?.id ?? '';
    setResult({ correct, correctId });
    await submit.mutateAsync({ questionId: question.id, selectedOptionId: selected, isCorrect: correct, questionIds });
  };

  const displaySelected = result ? (attempt?.selected_option_id ?? selected) : selected;

  return (
    <div className={`border rounded-xl overflow-hidden transition-colors ${open ? 'border-blue-200' : 'border-slate-200'}`}>
      {/* Header */}
      <button type="button" onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors">
        <svg className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${open ? 'rotate-90' : ''}`}
          viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
        <span className="flex-1 text-sm font-medium text-slate-800 text-left line-clamp-2">{question.question_text}</span>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold uppercase ${DIFFICULTY_STYLE[question.difficulty]}`}>
            {question.difficulty}
          </span>
          {hasAttempted && (
            <span className={`text-xs font-semibold ${(result?.correct ?? attempt?.is_correct) ? 'text-emerald-600' : 'text-red-500'}`}>
              {(result?.correct ?? attempt?.is_correct) ? '✓' : '✗'}
            </span>
          )}
        </div>
      </button>

      {/* Expanded body */}
      {open && (
        <div className="px-4 pb-4 pt-1 border-t border-slate-100 space-y-3">
          <p className="text-sm text-slate-800 leading-relaxed">{question.question_text}</p>

          {/* Options */}
          <div className="space-y-2">
            {question.question_options.map((opt, i) => {
              const isSelected = displaySelected === opt.id;
              const isCorrectOpt = opt.is_correct;
              const showResult = !!result;

              let optStyle = 'border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50';
              if (showResult) {
                if (isCorrectOpt) optStyle = 'border-emerald-400 bg-emerald-50 text-emerald-800 font-semibold';
                else if (isSelected && !isCorrectOpt) optStyle = 'border-red-400 bg-red-50 text-red-700';
                else optStyle = 'border-slate-200 bg-white text-slate-400';
              } else if (isSelected) {
                optStyle = 'border-blue-500 bg-blue-50 text-blue-800';
              }

              return (
                <button key={opt.id} type="button"
                  disabled={!!result || submit.isPending}
                  onClick={() => setSelected(opt.id)}
                  className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-lg border-2 text-left transition-all ${optStyle} disabled:cursor-default`}>
                  <span className="w-5 h-5 rounded-full border-2 border-current flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    {OPTION_LABELS[i]}
                  </span>
                  <span className="text-sm leading-snug">{opt.option_text}</span>
                  {showResult && isCorrectOpt && (
                    <svg className="w-4 h-4 text-emerald-600 ml-auto shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>

          {/* Submit / Result */}
          {!result ? (
            <Button color="primary" size="sm" disabled={!selected} loading={submit.isPending} onClick={handleSubmit}>
              Submit answer
            </Button>
          ) : (
            <div className={`rounded-lg px-4 py-3 ${result.correct ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'}`}>
              <p className={`text-sm font-semibold mb-1 ${result.correct ? 'text-emerald-700' : 'text-red-700'}`}>
                {result.correct ? '✓ Correct!' : '✗ Incorrect'}
              </p>
              {question.explanation && (
                <p className="text-sm text-slate-700 leading-relaxed">{question.explanation}</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function QuestionsTab({
  questions, loading, topicId: _topicId,
}: { questions: QuestionWithOptions[] | undefined; loading: boolean; topicId: string }) {
  const questionIds = (questions ?? []).map((q) => q.id);
  const { data: attempts } = useAttemptsByQuestions(questionIds);

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)}
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="py-16 text-center text-slate-400">
        <p className="text-4xl mb-3">❓</p>
        <p className="font-medium text-slate-600">No questions yet</p>
        <p className="text-sm mt-1">Practice questions will appear here once they're added.</p>
      </div>
    );
  }

  const attempted = Object.keys(attempts ?? {}).length;
  const correct = Object.values(attempts ?? {}).filter((a) => a.is_correct).length;

  return (
    <div className="space-y-4">
      {/* Stats bar */}
      <div className="flex items-center gap-6 px-4 py-3 bg-slate-50 rounded-xl text-sm">
        <div className="text-center">
          <p className="text-lg font-bold text-slate-900">{questions.length}</p>
          <p className="text-xs text-slate-500">Questions</p>
        </div>
        <div className="w-px h-8 bg-slate-200" />
        <div className="text-center">
          <p className="text-lg font-bold text-blue-600">{attempted}</p>
          <p className="text-xs text-slate-500">Attempted</p>
        </div>
        <div className="w-px h-8 bg-slate-200" />
        <div className="text-center">
          <p className="text-lg font-bold text-emerald-600">{correct}</p>
          <p className="text-xs text-slate-500">Correct</p>
        </div>
        {attempted > 0 && (
          <>
            <div className="w-px h-8 bg-slate-200" />
            <div className="text-center">
              <p className="text-lg font-bold text-slate-700">{Math.round((correct / attempted) * 100)}%</p>
              <p className="text-xs text-slate-500">Score</p>
            </div>
          </>
        )}
      </div>

      {/* Question list */}
      <div className="space-y-2">
        {questions.map((q) => (
          <QuestionCard key={q.id} question={q} attempt={attempts?.[q.id]} questionIds={questionIds} />
        ))}
      </div>
    </div>
  );
}

// ── Notes tab ────────────────────────────────────────────────────────

function StudyNoteCard({ note }: { note: TopicNoteRow }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center gap-3 px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
      >
        <svg className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${open ? 'rotate-90' : ''}`}
          viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-sm font-semibold text-slate-800 flex-1">{note.title}</span>
      </button>
      {open && (
        <div className="px-5 py-4 border-t border-slate-100">
          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{note.content}</p>
          {note.content_ar && (
            <p className="text-sm text-slate-500 leading-relaxed whitespace-pre-wrap mt-3 border-t border-slate-100 pt-3" dir="rtl">
              {note.content_ar}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function PersonalNoteEditor({ initialContent, topicId }: { initialContent: string; topicId: string }) {
  const upsert = useUpsertStudentNote();
  const [content, setContent] = useState(initialContent);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const initialized = React.useRef(false);

  // Sync initial content from DB once
  React.useEffect(() => {
    if (!initialized.current) { setContent(initialContent); initialized.current = true; }
  }, [initialContent]);

  // Auto-save with 1.5s debounce
  React.useEffect(() => {
    if (!initialized.current) return;
    const timer = setTimeout(async () => {
      setSaveState('saving');
      try {
        await upsert.mutateAsync({ topicId, content });
        setSaveState('saved');
        setTimeout(() => setSaveState('idle'), 2000);
      } catch { setSaveState('idle'); }
    }, 1500);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content, topicId]);

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-slate-800">My Notes</h3>
        <span className={`text-xs transition-colors ${
          saveState === 'saving' ? 'text-amber-500' :
          saveState === 'saved' ? 'text-emerald-600' : 'text-slate-300'
        }`}>
          {saveState === 'saving' ? 'Saving…' : saveState === 'saved' ? 'Saved ✓' : 'Auto-saves'}
        </span>
      </div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write your notes for this topic here. Your notes are private and auto-saved."
        rows={10}
        className="w-full rounded-xl border border-slate-200 text-sm px-4 py-3 resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed text-slate-700 placeholder-slate-300"
      />
    </div>
  );
}

function NotesTab({
  topicNotes, notesLoading, studentNote, topicId,
}: { topicNotes: TopicNoteRow[] | undefined; notesLoading: boolean; studentNote: string; topicId: string }) {
  return (
    <div className="space-y-8">
      {/* Admin study notes */}
      <div>
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Study Notes</h3>
        {notesLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-xl" />)}
          </div>
        ) : (topicNotes ?? []).length === 0 ? (
          <p className="text-sm text-slate-400 italic py-4 text-center border border-dashed border-slate-200 rounded-xl">
            No study notes have been added to this topic yet.
          </p>
        ) : (
          <div className="space-y-2">
            {topicNotes!.map((note) => <StudyNoteCard key={note.id} note={note} />)}
          </div>
        )}
      </div>

      {/* Personal notes */}
      <div>
        <PersonalNoteEditor initialContent={studentNote} topicId={topicId} />
      </div>
    </div>
  );
}

// ── Flashcards tab ───────────────────────────────────────────────────

function DeckCard({ deck, subjectId, topicId }: { deck: DeckRow; subjectId: string; topicId: string }) {
  const { data: cards } = useFlashcardsByDeck(deck.id);
  const cardIds = (cards ?? []).map((c) => c.id);
  const { data: progress } = useFlashcardProgressByDeck(deck.id, cardIds);

  const total = cards?.length ?? 0;
  const known = cardIds.filter((id) => progress?.[id] === 'known').length;

  return (
    <Card className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0 text-lg">🃏</div>
        <div className="min-w-0">
          <p className="font-semibold text-slate-800 truncate">{deck.name}</p>
          {deck.description && <p className="text-xs text-slate-400 truncate">{deck.description}</p>}
          {total > 0 && (
            <p className="text-xs text-slate-500 mt-0.5">
              {known}/{total} known
              {total > 0 && (
                <span className="ml-2 text-slate-300">·</span>
              )}
              <span className="ml-2 text-slate-400">{total} card{total !== 1 ? 's' : ''}</span>
            </p>
          )}
        </div>
      </div>
      <Link to={`${ROUTES.topic(subjectId, topicId)}/flashcards/${deck.id}`} className="shrink-0">
        <Button color="primary" size="sm">Study</Button>
      </Link>
    </Card>
  );
}

function FlashcardsTab({
  decks, loading, subjectId, topicId,
}: { decks: DeckRow[] | undefined; loading: boolean; subjectId: string; topicId: string }) {
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
      </div>
    );
  }
  if (!decks || decks.length === 0) {
    return (
      <div className="py-16 text-center text-slate-400">
        <p className="text-4xl mb-3">🃏</p>
        <p className="font-medium text-slate-600">No flashcard decks yet</p>
        <p className="text-sm mt-1">Decks will appear here once they're added.</p>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {decks.map((deck) => (
        <DeckCard key={deck.id} deck={deck} subjectId={subjectId} topicId={topicId} />
      ))}
    </div>
  );
}

// ── Coming soon placeholder ─────────────────────────────────────────

function ComingSoon({ phase, label, emoji }: { phase: number; label: string; emoji: string }) {
  return (
    <div className="py-16 text-center text-slate-400">
      <p className="text-4xl mb-3">{emoji}</p>
      <p className="font-medium text-slate-600">{label}</p>
      <p className="text-sm mt-1 text-slate-400">Coming in Phase {phase}</p>
    </div>
  );
}

// ── TopicDetail ─────────────────────────────────────────────────────

export function TopicDetail() {
  const { subjectId = '', topicId = '' } = useParams<{ subjectId: string; topicId: string }>();

  const { data: topic, isLoading: topicLoading } = useTopic(topicId);
  const { data: subtopics, isLoading: subtopicsLoading } = useSubtopicsWithObjectives(topicId);
  const { data: resources, isLoading: resourcesLoading } = useResourcesByTopic(topicId);
  const { data: decks, isLoading: decksLoading } = useFlashcardDecksByTopic(topicId);
  const { data: topicNotes, isLoading: notesLoading } = useTopicNotes(topicId);
  const { data: studentNote } = useStudentNote(topicId);
  const { data: questions, isLoading: questionsLoading } = useQuestionsByTopic(topicId);
  const { data: progressMap } = useTopicProgress([topicId]);
  const upsertStatus = useUpsertTopicStatus();
  const { data: bookmarkedTopicIds } = useBookmarkedIds('topic');
  const toggleBookmark = useToggleBookmark();

  const currentStatus = progressMap?.[topicId] ?? 'not_started';
  const subject = topic?.subjects;
  const isTopicBookmarked = bookmarkedTopicIds?.has(topicId) ?? false;

  const pdfCount = (resources ?? []).filter((r) => r.type === 'pdf' || r.type === 'link').length;
  const videoCount = (resources ?? []).filter((r) => r.type === 'video').length;
  const deckCount = (decks ?? []).length;

  const handleStatusChange = async (status: 'not_started' | 'in_progress' | 'completed') => {
    try {
      await upsertStatus.mutateAsync({ topicId, status });
      toast.success(
        status === 'completed' ? 'Marked as completed!' :
        status === 'in_progress' ? 'Marked as in progress.' : 'Reset to not started.'
      );
    } catch { /* handled in hook */ }
  };

  const isLoading = topicLoading || subtopicsLoading;

  return (
    <AppShell role="student" title={topic?.name ?? 'Topic'}>
      <PageContainer
        maxWidth="xl"
        breadcrumbs={[
          { label: 'Dashboard', href: ROUTES.studentDashboard },
          { label: 'Subjects', href: ROUTES.subjects },
          subject ? { label: subject.name, href: ROUTES.subject(subjectId) } : { label: '…' },
          { label: topic?.name ?? '…' },
        ]}
      >
        {/* Topic header */}
        {topicLoading ? (
          <div className="mb-6 space-y-3">
            <Skeleton className="h-7 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        ) : topic ? (
          <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{topic.name}</h1>
              {topic.name_ar && <p className="text-sm text-slate-500 mt-0.5">{topic.name_ar}</p>}
              <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                {subject && (
                  <>
                    <span className={`w-2 h-2 rounded-full ${subject.color ?? 'bg-blue-500'} inline-block`} />
                    <span>{subject.name}</span>
                    <span>·</span>
                  </>
                )}
                <span>{topic.estimated_hours}h estimated</span>
                {(subtopics ?? []).length > 0 && <><span>·</span><span>{subtopics!.length} subtopics</span></>}
              </div>
            </div>

            {/* Status controls */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Bookmark toggle */}
              <button
                onClick={() => topic && toggleBookmark.mutate({
                  itemType: 'topic', itemId: topicId,
                  title: topic.name,
                  subtitle: subject?.name,
                  itemRoute: `/subjects/${subjectId}/topics/${topicId}`,
                  isBookmarked: isTopicBookmarked,
                })}
                disabled={toggleBookmark.isPending}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                  isTopicBookmarked
                    ? 'bg-amber-50 border-amber-300 text-amber-600'
                    : 'bg-white border-slate-200 text-slate-500 hover:border-amber-300 hover:text-amber-500'
                }`}
                aria-label={isTopicBookmarked ? 'Remove bookmark' : 'Bookmark topic'}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill={isTopicBookmarked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>
                </svg>
                {isTopicBookmarked ? 'Bookmarked' : 'Bookmark'}
              </button>
              {currentStatus === 'not_started' && (
                <Button size="sm" variant="outline" color="primary" loading={upsertStatus.isPending}
                  onClick={() => handleStatusChange('in_progress')}>
                  Start studying
                </Button>
              )}
              {currentStatus === 'in_progress' && (
                <>
                  <Button size="sm" variant="outline" color="neutral" loading={upsertStatus.isPending}
                    onClick={() => handleStatusChange('not_started')}>Reset</Button>
                  <Button size="sm" color="success" loading={upsertStatus.isPending}
                    onClick={() => handleStatusChange('completed')}>Mark complete</Button>
                </>
              )}
              {currentStatus === 'completed' && (
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1.5 text-sm font-medium text-green-600">
                    <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd"/>
                    </svg>
                    Completed
                  </span>
                  <Button size="sm" variant="ghost" color="neutral" onClick={() => handleStatusChange('in_progress')}>Revise</Button>
                </div>
              )}
            </div>
          </div>
        ) : null}

        {/* 7-tab layout */}
        <Tabs defaultTab="overview">
          <TabList className="mb-6">
            <TabTrigger value="overview">Overview</TabTrigger>
            <TabTrigger value="books" badge={pdfCount || undefined}>Books</TabTrigger>
            <TabTrigger value="videos" badge={videoCount || undefined}>Videos</TabTrigger>
            <TabTrigger value="notes">Notes</TabTrigger>
            <TabTrigger value="questions" badge={(questions ?? []).length || undefined}>Questions</TabTrigger>
            <TabTrigger value="flashcards" badge={deckCount || undefined}>Flashcards</TabTrigger>
            <TabTrigger value="activity">My Activity</TabTrigger>
          </TabList>

          {/* Overview */}
          <TabPanel value="overview">
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}
              </div>
            ) : (
              <div className="space-y-4">
                {topic?.description && (
                  <Card variant="flat" className="border border-slate-200">
                    <p className="text-sm text-slate-700 leading-relaxed">{topic.description}</p>
                  </Card>
                )}
                {(subtopics ?? []).length === 0 ? (
                  <div className="py-12 text-center text-slate-400">
                    <p className="text-3xl mb-2">📝</p>
                    <p className="font-medium text-slate-600">No subtopics yet</p>
                    <p className="text-sm mt-1">Content is being added to this topic.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {subtopics!.map((st) => <SubtopicItem key={st.id} subtopic={st} />)}
                  </div>
                )}
              </div>
            )}
          </TabPanel>

          {/* Books */}
          <TabPanel value="books">
            <BooksTab resources={resources} loading={resourcesLoading} />
          </TabPanel>

          {/* Videos */}
          <TabPanel value="videos">
            <VideosTab resources={resources} loading={resourcesLoading} />
          </TabPanel>

          {/* Placeholders */}
          <TabPanel value="notes">
            <NotesTab
              topicNotes={topicNotes} notesLoading={notesLoading}
              studentNote={studentNote?.content ?? ''} topicId={topicId}
            />
          </TabPanel>
          <TabPanel value="questions">
            <QuestionsTab questions={questions} loading={questionsLoading} topicId={topicId} />
          </TabPanel>
          <TabPanel value="flashcards">
            <FlashcardsTab decks={decks} loading={decksLoading} subjectId={subjectId} topicId={topicId} />
          </TabPanel>

          {/* My Activity */}
          <TabPanel value="activity">
            <Card variant="flat" className="border border-slate-200">
              <h3 className="text-sm font-semibold text-slate-800 mb-3">Your progress</h3>
              {currentStatus === 'not_started' ? (
                <p className="text-sm text-slate-400">You haven't started this topic yet.</p>
              ) : (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Status</span>
                    <span className={`font-medium ${currentStatus === 'completed' ? 'text-green-600' : 'text-amber-600'}`}>
                      {currentStatus === 'completed' ? 'Completed' : 'In progress'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Subtopics</span>
                    <span className="text-slate-700">{(subtopics ?? []).length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Learning objectives</span>
                    <span className="text-slate-700">
                      {(subtopics ?? []).reduce((s, st) => s + st.learning_objectives.length, 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Books & references</span>
                    <span className="text-slate-700">{pdfCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Videos</span>
                    <span className="text-slate-700">{videoCount}</span>
                  </div>
                </div>
              )}
            </Card>
          </TabPanel>
        </Tabs>
      </PageContainer>
    </AppShell>
  );
}
