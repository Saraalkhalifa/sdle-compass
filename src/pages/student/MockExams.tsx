import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ROUTES } from '@/config/app';
import {
  useMockExams, useLatestExamSession, useStartExamSession,
  type ExamRow, type ExamWithCount,
} from '@/hooks/useMockExams';

// ── Exam card ─────────────────────────────────────────────────────────

function ClockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
      <circle cx="10" cy="10" r="8" /><path strokeLinecap="round" d="M10 6v4l2.5 2.5" />
    </svg>
  );
}

interface ExamCardProps {
  exam: ExamWithCount;
  onStart: () => void;
  loading: boolean;
}

function ExamCard({ exam, onStart, loading }: ExamCardProps) {
  const { data: latestSession } = useLatestExamSession(exam.id);
  const navigate = useNavigate();
  const qCount = (exam.mock_exam_questions[0] as unknown as { count: number } | undefined)?.count ?? 0;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-slate-900">{exam.title}</h3>
          {exam.description && (
            <p className="text-sm text-slate-500 mt-1 line-clamp-2">{exam.description}</p>
          )}
          <div className="flex flex-wrap gap-4 mt-3 text-sm text-slate-500">
            <span className="flex items-center gap-1.5"><ClockIcon />{exam.duration_mins} min</span>
            <span>{qCount} question{qCount !== 1 ? 's' : ''}</span>
            <span>Pass: {exam.passing_score}%</span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          {latestSession?.submitted_at ? (
            <>
              <span className={`text-sm font-semibold ${latestSession.is_passed ? 'text-emerald-600' : 'text-red-500'}`}>
                {latestSession.score}%&nbsp;&nbsp;{latestSession.is_passed ? '✓ Passed' : '✗ Failed'}
              </span>
              <div className="flex gap-2">
                <Link to={ROUTES.examResults(exam.id, latestSession.id)}>
                  <Button size="sm" variant="outline" color="neutral">Review</Button>
                </Link>
                <Button size="sm" color="primary" onClick={onStart} loading={loading}>Retake</Button>
              </div>
            </>
          ) : latestSession && !latestSession.submitted_at ? (
            <Button size="sm" color="primary"
              onClick={() => navigate(ROUTES.examSession(exam.id, latestSession.id))}>
              Continue →
            </Button>
          ) : (
            <Button size="sm" color="primary" onClick={onStart} loading={loading}>Start Exam</Button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────

export function MockExams() {
  const navigate = useNavigate();
  const { data: exams, isLoading } = useMockExams();
  const startSession = useStartExamSession();

  async function handleStart(examId: string) {
    const sessionId = await startSession.mutateAsync(examId);
    navigate(ROUTES.examSession(examId, sessionId));
  }

  return (
    <AppShell role="student" title="Mock Exams">
      <PageContainer
        title="Mock Exams"
        description="Timed practice exams to prepare for the SDLE"
        maxWidth="xl"
      >
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}
          </div>
        ) : !exams?.length ? (
          <div className="bg-white border border-slate-200 rounded-xl">
            <EmptyState
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              }
              title="No exams available yet"
              description="Mock exams will appear here once your admin publishes them."
            />
          </div>
        ) : (
          <div className="space-y-4">
            {exams.map((exam) => (
              <ExamCard
                key={exam.id}
                exam={exam}
                onStart={() => handleStart(exam.id)}
                loading={startSession.isPending}
              />
            ))}
          </div>
        )}
      </PageContainer>
    </AppShell>
  );
}
