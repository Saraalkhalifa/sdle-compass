import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { Skeleton } from '@/components/ui/Skeleton';
import { ROUTES } from '@/config/app';
import { useMockExamWithQuestions, useExamSession, useExamAnswers } from '@/hooks/useMockExams';

// ── Helpers ───────────────────────────────────────────────────────────

function formatTime(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}m ${s.toString().padStart(2, '0')}s`;
}

const OPTION_LABELS = ['A', 'B', 'C', 'D', 'E'];

// ── Score ring ────────────────────────────────────────────────────────

function ScoreRing({ score, size = 96 }: { score: number; size?: number }) {
  const r = 42;
  const circ = 2 * Math.PI * r;
  const isPassing = score >= 60;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#e2e8f0" strokeWidth="10" />
        <circle
          cx="50" cy="50" r={r} fill="none"
          stroke={isPassing ? '#10b981' : '#ef4444'}
          strokeWidth="10"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - score / 100)}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-bold text-slate-900">{score}%</span>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────

export function ExamResults() {
  const { examId = '', sessionId = '' } = useParams<{ examId: string; sessionId: string }>();

  const { data: exam, isLoading: examLoading } = useMockExamWithQuestions(examId);
  const { data: session, isLoading: sessionLoading } = useExamSession(sessionId);
  const { data: answers, isLoading: answersLoading } = useExamAnswers(sessionId);

  const isLoading = examLoading || sessionLoading || answersLoading;

  const questions = exam?.mock_exam_questions.map((eq) => eq.questions) ?? [];
  const correctCount = Object.values(answers ?? {}).filter((a) => a.is_correct).length;
  const score = session?.score ?? 0;
  const isPassed = session?.is_passed ?? false;

  return (
    <AppShell role="student" title="Exam Results">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Back link */}
        <Link
          to={ROUTES.mockExams}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-6 group"
        >
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"
            className="group-hover:-translate-x-0.5 transition-transform">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Mock Exams
        </Link>

        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-8 w-64 rounded" />
            <Skeleton className="h-40 w-full rounded-xl" />
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
        ) : (
          <>
            <h1 className="text-xl font-bold text-slate-900 mb-6">{exam?.title}</h1>

            {/* Score summary card */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <ScoreRing score={score} size={112} />
                <div className="flex-1 space-y-3 text-center sm:text-left">
                  <div>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold ${
                      isPassed ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {isPassed ? '✓ Passed' : '✗ Failed'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600 justify-center sm:justify-start">
                    <span><strong className="text-slate-900">{correctCount}</strong> correct</span>
                    <span><strong className="text-slate-900">{questions.length - correctCount}</strong> wrong</span>
                    <span><strong className="text-slate-900">{questions.length}</strong> total</span>
                    {session?.time_taken_secs != null && (
                      <span>Time: <strong className="text-slate-900">{formatTime(session.time_taken_secs)}</strong></span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400">Passing score: {exam?.passing_score}%</p>
                </div>
              </div>
            </div>

            {/* Question review */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100">
                <h2 className="text-sm font-semibold text-slate-700">Question Review</h2>
              </div>
              <div className="divide-y divide-slate-100">
                {questions.map((q, i) => {
                  const answer = answers?.[q.id];
                  const selectedId = answer?.selected_option_id;
                  const wasCorrect = answer?.is_correct ?? false;

                  return (
                    <div key={q.id} className="p-5">
                      <div className="flex items-start gap-2 mb-3">
                        <span className={`mt-0.5 shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                          wasCorrect ? 'bg-emerald-100 text-emerald-700' : selectedId ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-400'
                        }`}>
                          {wasCorrect ? '✓' : selectedId ? '✗' : '–'}
                        </span>
                        <p className="text-sm font-medium text-slate-800 leading-relaxed">
                          <span className="text-slate-400 mr-1">Q{i + 1}.</span>
                          {q.question_text}
                        </p>
                      </div>

                      <div className="ml-7 space-y-1.5">
                        {q.question_options.map((opt, oi) => {
                          const isCorrectOpt = opt.is_correct;
                          const isStudentPick = opt.id === selectedId;

                          let cls = 'text-slate-500';
                          let prefix = OPTION_LABELS[oi];
                          if (isCorrectOpt && isStudentPick) cls = 'text-emerald-700 font-semibold';
                          else if (isCorrectOpt) cls = 'text-emerald-600 font-semibold';
                          else if (isStudentPick) cls = 'text-red-500 line-through';

                          return (
                            <div key={opt.id} className={`text-sm flex items-start gap-2 ${cls}`}>
                              <span className="shrink-0 w-4">{prefix})</span>
                              <span>{opt.option_text}</span>
                              {isCorrectOpt && (
                                <span className="shrink-0 text-emerald-600 text-xs font-bold">✓ correct</span>
                              )}
                              {isStudentPick && !isCorrectOpt && (
                                <span className="shrink-0 text-red-500 text-xs">your answer</span>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {q.explanation && (
                        <div className="ml-7 mt-3 px-3 py-2 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-800 leading-relaxed">
                          <span className="font-semibold">Explanation: </span>{q.explanation}
                        </div>
                      )}

                      {!selectedId && (
                        <p className="ml-7 mt-2 text-xs text-slate-400 italic">Not answered</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex gap-3 justify-center">
              <Link to={ROUTES.mockExams}>
                <button className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                  Back to Exams
                </button>
              </Link>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
