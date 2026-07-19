import React from 'react';
import { Link } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { PageContainer } from '@/components/layout/PageContainer';
import { Skeleton } from '@/components/ui/Skeleton';
import { ROUTES } from '@/config/app';
import {
  usePerformanceSummary,
  useQuestionAccuracyByTopic,
  useExamHistory,
  useFlashcardProgressCounts,
  useTopicProgressSummary,
  type TopicAccuracy,
  type ExamHistoryRow,
} from '@/hooks/usePerformance';

// ── Stat card ─────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  colorClass?: string;
  icon: React.ReactNode;
}

function StatCard({ label, value, sub, colorClass = 'text-slate-900', icon }: StatCardProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-start gap-4">
      <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 shrink-0">
        {icon}
      </div>
      <div>
        <p className={`text-2xl font-bold ${colorClass}`}>{value}</p>
        <p className="text-sm text-slate-500 mt-0.5">{label}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ── Section wrapper ───────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100">
        <h2 className="text-sm font-semibold text-slate-700">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function EmptyHint({ text }: { text: string }) {
  return <p className="text-sm text-slate-400 italic py-4 text-center">{text}</p>;
}

// ── Question accuracy bars ────────────────────────────────────────────

function TopicBar({ topic }: { topic: TopicAccuracy }) {
  const color =
    topic.accuracy >= 70 ? 'bg-emerald-500' :
    topic.accuracy >= 50 ? 'bg-amber-400' :
    'bg-red-400';

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-slate-700 truncate">{topic.name}</span>
        <span className="text-xs text-slate-500 shrink-0">
          {topic.accuracy}% ({topic.correct}/{topic.total})
        </span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${topic.accuracy}%` }}
        />
      </div>
    </div>
  );
}

function AccuracySection({ topics }: { topics: TopicAccuracy[] }) {
  if (topics.length === 0) {
    return <EmptyHint text="Answer questions in a topic to see your accuracy stats here." />;
  }
  return (
    <div className="space-y-4">
      <div className="flex gap-4 text-xs text-slate-500 flex-wrap">
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />≥70% Good</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />50–69% Fair</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block" />&lt;50% Needs work</span>
      </div>
      <div className="space-y-3">
        {topics.map((t) => <TopicBar key={t.id} topic={t} />)}
      </div>
    </div>
  );
}

// ── Exam history table ────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatDuration(secs: number) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}m ${s.toString().padStart(2, '0')}s`;
}

function ExamHistorySection({ sessions }: { sessions: ExamHistoryRow[] }) {
  if (sessions.length === 0) {
    return <EmptyHint text="Complete a mock exam to see your history here." />;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs text-slate-400 uppercase tracking-wide border-b border-slate-100">
            <th className="text-left pb-2 font-semibold">Exam</th>
            <th className="text-left pb-2 font-semibold">Date</th>
            <th className="text-right pb-2 font-semibold">Score</th>
            <th className="text-right pb-2 font-semibold">Time</th>
            <th className="text-right pb-2 font-semibold">Result</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {sessions.map((s) => (
            <tr key={s.id} className="hover:bg-slate-50 transition-colors">
              <td className="py-3 pr-4">
                <Link
                  to={ROUTES.examResults(s.exam_id, s.id)}
                  className="text-blue-600 hover:underline font-medium"
                >
                  {s.mock_exams?.title ?? 'Exam'}
                </Link>
              </td>
              <td className="py-3 pr-4 text-slate-500">{formatDate(s.created_at)}</td>
              <td className="py-3 pr-4 text-right font-semibold text-slate-800">{s.score ?? '—'}%</td>
              <td className="py-3 pr-4 text-right text-slate-500">
                {s.time_taken_secs != null ? formatDuration(s.time_taken_secs) : '—'}
              </td>
              <td className="py-3 text-right">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  s.is_passed ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'
                }`}>
                  {s.is_passed ? 'Passed' : 'Failed'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Flashcard progress ────────────────────────────────────────────────

function FlashcardSection({ counts }: { counts: { new: number; learning: number; known: number } }) {
  const total = counts.new + counts.learning + counts.known;
  if (total === 0) {
    return <EmptyHint text="Study flashcards to see your progress here." />;
  }
  const knownPct = Math.round((counts.known / total) * 100);
  const learningPct = Math.round((counts.learning / total) * 100);
  const newPct = 100 - knownPct - learningPct;

  return (
    <div className="space-y-4">
      {/* Stacked bar */}
      <div className="h-5 flex rounded-full overflow-hidden gap-0.5">
        {counts.known > 0 && (
          <div className="bg-emerald-500 transition-all duration-700" style={{ width: `${knownPct}%` }} />
        )}
        {counts.learning > 0 && (
          <div className="bg-amber-400 transition-all duration-700" style={{ width: `${learningPct}%` }} />
        )}
        {counts.new > 0 && (
          <div className="bg-slate-200 transition-all duration-700" style={{ width: `${newPct}%` }} />
        )}
      </div>

      {/* Legend */}
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center p-3 bg-emerald-50 rounded-xl">
          <p className="text-2xl font-bold text-emerald-600">{counts.known}</p>
          <p className="text-xs text-emerald-700 mt-0.5 font-medium">Known</p>
        </div>
        <div className="text-center p-3 bg-amber-50 rounded-xl">
          <p className="text-2xl font-bold text-amber-600">{counts.learning}</p>
          <p className="text-xs text-amber-700 mt-0.5 font-medium">Learning</p>
        </div>
        <div className="text-center p-3 bg-slate-50 rounded-xl">
          <p className="text-2xl font-bold text-slate-500">{counts.new}</p>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">New</p>
        </div>
      </div>
      <p className="text-xs text-slate-400 text-center">{total} cards reviewed total</p>
    </div>
  );
}

// ── Topic progress ────────────────────────────────────────────────────

const STATUS_STYLE = {
  completed:   { label: 'Completed',   cls: 'bg-emerald-100 text-emerald-700' },
  in_progress: { label: 'In progress', cls: 'bg-blue-100 text-blue-700' },
  not_started: { label: 'Not started', cls: 'bg-slate-100 text-slate-500' },
} as const;

function TopicProgressSection({ topics }: {
  topics: Array<{ status: 'not_started' | 'in_progress' | 'completed'; topics: { id: string; name: string; subjects: { id: string; name: string } } }>;
}) {
  const active = topics.filter((t) => t.status !== 'not_started');
  if (active.length === 0) {
    return <EmptyHint text="Visit a topic to start tracking your progress." />;
  }

  const completed = active.filter((t) => t.status === 'completed');
  const inProgress = active.filter((t) => t.status === 'in_progress');

  return (
    <div className="space-y-4">
      <div className="flex gap-4 text-sm text-slate-600">
        <span className="font-semibold text-emerald-600">{completed.length} completed</span>
        <span className="text-slate-300">|</span>
        <span className="font-semibold text-blue-600">{inProgress.length} in progress</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {[...inProgress, ...completed].map((t) => {
          const { label, cls } = STATUS_STYLE[t.status];
          return (
            <span key={t.topics.id} className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${cls}`}>
              {t.status === 'completed' ? '✓' : '◐'} {t.topics.name}
            </span>
          );
        })}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────

export function Performance() {
  const { data: summary, isLoading: sumLoading } = usePerformanceSummary();
  const { data: topicAccuracy, isLoading: accLoading } = useQuestionAccuracyByTopic();
  const { data: examHistory, isLoading: examLoading } = useExamHistory();
  const { data: flashCounts, isLoading: flashLoading } = useFlashcardProgressCounts();
  const { data: topicProgress, isLoading: topicLoading } = useTopicProgressSummary();

  const anyLoading = sumLoading || accLoading || examLoading || flashLoading || topicLoading;

  return (
    <AppShell role="student" title="Performance">
      <PageContainer
        title="Performance"
        description="Track your progress across all study activities"
        maxWidth="xl"
      >
        {anyLoading ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
            </div>
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Summary stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard
                label="Questions Attempted"
                value={summary?.totalAttempts ?? 0}
                sub={`${summary?.correctAttempts ?? 0} correct`}
                icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><circle cx="12" cy="12" r="10"/><path strokeLinecap="round" d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3m.08 4h.01"/></svg>}
              />
              <StatCard
                label="Overall Accuracy"
                value={`${summary?.accuracy ?? 0}%`}
                colorClass={
                  (summary?.accuracy ?? 0) >= 70 ? 'text-emerald-600' :
                  (summary?.accuracy ?? 0) >= 50 ? 'text-amber-600' :
                  'text-slate-900'
                }
                icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path strokeLinecap="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}
              />
              <StatCard
                label="Exams Completed"
                value={summary?.examsCompleted ?? 0}
                sub={summary?.examsCompleted ? `Avg score: ${summary.avgExamScore}%` : undefined}
                icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path strokeLinecap="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>}
              />
              <StatCard
                label="Flashcards Known"
                value={summary?.knownCards ?? 0}
                sub={summary?.totalCards ? `of ${summary.totalCards} studied` : undefined}
                colorClass="text-emerald-600"
                icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><rect x="2" y="5" width="20" height="14" rx="2"/><path strokeLinecap="round" d="M2 10h20"/></svg>}
              />
            </div>

            {/* Question accuracy by topic */}
            <Section title="Question Bank Accuracy by Topic">
              <AccuracySection topics={topicAccuracy ?? []} />
            </Section>

            {/* Exam history */}
            <Section title="Exam History">
              <ExamHistorySection sessions={examHistory ?? []} />
            </Section>

            {/* Two-column: flashcard + topic progress */}
            <div className="grid md:grid-cols-2 gap-4">
              <Section title="Flashcard Progress">
                <FlashcardSection counts={flashCounts ?? { new: 0, learning: 0, known: 0 }} />
              </Section>
              <Section title="Topic Progress">
                <TopicProgressSection topics={topicProgress ?? []} />
              </Section>
            </div>
          </div>
        )}
      </PageContainer>
    </AppShell>
  );
}
