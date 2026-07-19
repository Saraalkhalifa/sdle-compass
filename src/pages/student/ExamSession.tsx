import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { ConfirmDialog } from '@/components/ui/Dialog';
import { ROUTES } from '@/config/app';
import {
  useMockExamWithQuestions, useExamSession, useExamAnswers,
  useSaveAnswer, useSubmitExamSession,
} from '@/hooks/useMockExams';
import type { QuestionWithOptions } from '@/hooks/useQuestions';

// ── Timer ─────────────────────────────────────────────────────────────

function formatTime(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

// ── Question panel ────────────────────────────────────────────────────

const OPTION_LABELS = ['A', 'B', 'C', 'D', 'E'];

interface QuestionPanelProps {
  question: QuestionWithOptions;
  questionNumber: number;
  totalQuestions: number;
  selectedOptionId: string | undefined;
  onSelect: (optionId: string, isCorrect: boolean) => void;
}

function QuestionPanel({ question, questionNumber, totalQuestions, selectedOptionId, onSelect }: QuestionPanelProps) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">
        Question {questionNumber} of {totalQuestions}
      </p>
      <p className="text-base font-semibold text-slate-900 leading-relaxed mb-6">
        {question.question_text}
      </p>
      <div className="space-y-3">
        {question.question_options.map((opt, i) => {
          const isSelected = selectedOptionId === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => onSelect(opt.id, opt.is_correct)}
              className={`w-full flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                isSelected
                  ? 'border-blue-500 bg-blue-50 text-blue-900'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 text-xs font-bold mt-0.5 ${
                isSelected ? 'border-blue-500 bg-blue-500 text-white' : 'border-slate-300 text-slate-400'
              }`}>
                {OPTION_LABELS[i]}
              </span>
              <span className="text-sm leading-relaxed">{opt.option_text}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Loading skeleton ──────────────────────────────────────────────────

function SessionSkeleton() {
  return (
    <div className="min-h-dvh bg-slate-50 flex flex-col">
      <div className="h-14 bg-white border-b border-slate-200 flex items-center px-6 gap-4">
        <Skeleton className="h-5 w-48 rounded" />
        <Skeleton className="h-7 w-16 rounded-full ml-auto" />
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>
      <div className="flex flex-1">
        <div className="w-52 bg-white border-r border-slate-200 p-4">
          <Skeleton className="h-4 w-28 rounded mb-3" />
          <div className="grid grid-cols-4 gap-1.5">
            {Array.from({ length: 20 }).map((_, i) => <Skeleton key={i} className="h-8 rounded-lg" />)}
          </div>
        </div>
        <div className="flex-1 p-8 max-w-2xl">
          <Skeleton className="h-4 w-28 rounded mb-4" />
          <Skeleton className="h-14 w-full rounded mb-6" />
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-14 w-full rounded-xl mb-3" />)}
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────

export function ExamSession() {
  const { examId = '', sessionId = '' } = useParams<{ examId: string; sessionId: string }>();
  const navigate = useNavigate();

  const { data: exam, isLoading: examLoading } = useMockExamWithQuestions(examId);
  const { data: session } = useExamSession(sessionId);
  const { data: savedAnswers } = useExamAnswers(sessionId);
  const saveAnswer = useSaveAnswer();
  const submitSession = useSubmitExamSession();

  const [selected, setSelected] = useState<Record<string, string>>({});
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  // Refs to avoid stale closures in timer
  const selectedRef = useRef<Record<string, string>>({});
  const submittedRef = useRef(false);
  const handleSubmitRef = useRef<(auto?: boolean) => Promise<void>>(async () => {});
  const initialized = useRef(false);

  useEffect(() => { selectedRef.current = selected; }, [selected]);

  // Sorted questions
  const questions: QuestionWithOptions[] = (exam?.mock_exam_questions ?? []).map((eq) => eq.questions);

  // Populate selected from DB once (resume support)
  useEffect(() => {
    if (!initialized.current && savedAnswers !== undefined) {
      const initial: Record<string, string> = {};
      for (const [qId, ans] of Object.entries(savedAnswers)) {
        if (ans.selected_option_id) initial[qId] = ans.selected_option_id;
      }
      setSelected(initial);
      initialized.current = true;
    }
  }, [savedAnswers]);

  // Redirect if session already submitted
  useEffect(() => {
    if (session?.submitted_at) {
      navigate(ROUTES.examResults(examId, sessionId), { replace: true });
    }
  }, [session, examId, sessionId, navigate]);

  const handleSubmit = useCallback(async (_auto = false) => {
    if (submittedRef.current || !exam || !session) return;
    submittedRef.current = true;
    setShowConfirm(false);
    const timeTakenSecs = Math.floor((Date.now() - new Date(session.started_at).getTime()) / 1000);
    const currentSelected = selectedRef.current;
    let correct = 0;
    for (const q of questions) {
      const selId = currentSelected[q.id];
      if (selId) {
        const opt = q.question_options.find((o) => o.id === selId);
        if (opt?.is_correct) correct++;
      }
    }
    const score = questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0;
    const isPassed = score >= (exam.passing_score ?? 60);
    await submitSession.mutateAsync({ sessionId, examId, score, isPassed, timeTakenSecs });
    navigate(ROUTES.examResults(examId, sessionId));
  }, [exam, session, questions, sessionId, examId, submitSession, navigate]);

  // Keep handleSubmit ref current
  useEffect(() => { handleSubmitRef.current = handleSubmit; }, [handleSubmit]);

  // Countdown timer
  useEffect(() => {
    if (!session?.started_at || !exam?.duration_mins) return;
    const endTime = new Date(session.started_at).getTime() + exam.duration_mins * 60 * 1000;
    const tick = () => {
      const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining === 0 && !submittedRef.current) handleSubmitRef.current(true);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [session?.started_at, exam?.duration_mins]);

  const handleSelect = useCallback((questionId: string, optionId: string, isCorrect: boolean) => {
    setSelected((prev) => ({ ...prev, [questionId]: optionId }));
    saveAnswer.mutate({ sessionId, questionId, selectedOptionId: optionId, isCorrect });
  }, [sessionId, saveAnswer]);

  if (examLoading) return <SessionSkeleton />;

  const currentQuestion = questions[currentIdx];
  const answeredCount = Object.keys(selected).length;
  const unanswered = questions.length - answeredCount;

  return (
    <div className="min-h-dvh bg-slate-50 flex flex-col">
      {/* Header */}
      <div className="h-14 bg-white border-b border-slate-200 flex items-center px-4 gap-3 shrink-0 sticky top-0 z-10">
        <span className="text-sm font-semibold text-slate-800 truncate flex-1 min-w-0">
          {exam?.title}
        </span>
        {timeLeft !== null && (
          <span className={`text-sm font-mono font-bold px-3 py-1 rounded-full shrink-0 ${
            timeLeft < 300 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-slate-100 text-slate-700'
          }`}>
            {formatTime(timeLeft)}
          </span>
        )}
        <Button size="sm" color="primary" onClick={() => setShowConfirm(true)} className="shrink-0">
          Submit Exam
        </Button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Question navigator sidebar */}
        <div className="w-52 bg-white border-r border-slate-200 p-4 overflow-y-auto shrink-0">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
            {answeredCount} / {questions.length} answered
          </p>
          <div className="grid grid-cols-4 gap-1.5">
            {questions.map((q, i) => {
              const isAnswered = !!selected[q.id];
              const isCurrent = i === currentIdx;
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIdx(i)}
                  className={`h-8 w-full rounded-lg text-xs font-semibold transition-all ${
                    isCurrent
                      ? 'bg-blue-600 text-white ring-2 ring-blue-300'
                      : isAnswered
                      ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
          <div className="mt-4 space-y-1.5">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <div className="w-3 h-3 rounded bg-blue-600 shrink-0" /><span>Current</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <div className="w-3 h-3 rounded bg-emerald-100 border border-emerald-300 shrink-0" /><span>Answered</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <div className="w-3 h-3 rounded bg-slate-100 border border-slate-200 shrink-0" /><span>Unanswered</span>
            </div>
          </div>
        </div>

        {/* Main question area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-2xl mx-auto">
            {questions.length === 0 ? (
              <div className="py-20 text-center text-slate-400">
                <p className="text-4xl mb-3">📋</p>
                <p className="font-medium text-slate-600">No questions in this exam yet</p>
              </div>
            ) : currentQuestion ? (
              <>
                <QuestionPanel
                  question={currentQuestion}
                  questionNumber={currentIdx + 1}
                  totalQuestions={questions.length}
                  selectedOptionId={selected[currentQuestion.id]}
                  onSelect={(optId, isCorrect) => handleSelect(currentQuestion.id, optId, isCorrect)}
                />

                {/* Prev / Next */}
                <div className="flex justify-between mt-8 pt-6 border-t border-slate-200">
                  <Button variant="outline" color="neutral" size="sm"
                    onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
                    disabled={currentIdx === 0}>
                    ← Previous
                  </Button>
                  {currentIdx < questions.length - 1 ? (
                    <Button color="primary" size="sm"
                      onClick={() => setCurrentIdx((i) => Math.min(questions.length - 1, i + 1))}>
                      Next →
                    </Button>
                  ) : (
                    <Button color="primary" size="sm" onClick={() => setShowConfirm(true)}>
                      Submit Exam
                    </Button>
                  )}
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={() => handleSubmit(false)}
        title="Submit exam?"
        description={
          unanswered > 0
            ? `You have ${unanswered} unanswered question${unanswered !== 1 ? 's' : ''}. You cannot change answers after submitting.`
            : 'Submit your answers and view your results.'
        }
        confirmLabel="Submit"
        variant="primary"
        loading={submitSession.isPending}
      />
    </div>
  );
}
