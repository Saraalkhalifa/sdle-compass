import React, { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { ConfirmDialog } from '@/components/ui/Dialog';
import {
  useAllQuestionsAdmin,
  useToggleQuestionActive,
  useDeleteQuestion,
  type QuestionAdmin,
  type Difficulty,
} from '@/hooks/useQuestions';

const DIFF_META: Record<Difficulty, { label: string; cls: string }> = {
  easy:   { label: 'Easy',   cls: 'bg-emerald-100 text-emerald-700' },
  medium: { label: 'Medium', cls: 'bg-amber-100 text-amber-700' },
  hard:   { label: 'Hard',   cls: 'bg-red-100 text-red-700' },
};

const OPTION_LETTERS = ['A', 'B', 'C', 'D'];

interface QuestionCardProps {
  q: QuestionAdmin;
  onActivate: () => void;
  onDelete: () => void;
  activating: boolean;
}

function QuestionCard({ q, onActivate, onDelete, activating }: QuestionCardProps) {
  const [expanded, setExpanded] = useState(false);
  const diff = DIFF_META[q.difficulty as Difficulty] ?? DIFF_META.medium;
  const correctOpt = q.question_options.find(o => o.is_correct);

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 flex items-start gap-3 border-b border-slate-100">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-800 leading-snug">{q.question_text}</p>
          <div className="flex items-center gap-2 mt-1.5">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${diff.cls}`}>{diff.label}</span>
            {q.topics && (
              <span className="text-xs text-slate-400">
                {(q.topics as QuestionAdmin['topics'])?.subjects?.name ?? ''} › {q.topics.name}
              </span>
            )}
            <span className="text-xs text-slate-400 ml-auto">
              {new Date(q.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* Options (collapsible) */}
      {expanded && (
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
          <div className="space-y-1.5">
            {q.question_options.map((opt, i) => (
              <div
                key={opt.id}
                className={`flex items-start gap-2 text-sm rounded-lg px-2 py-1 ${
                  opt.is_correct ? 'bg-emerald-50 text-emerald-800 font-medium' : 'text-slate-600'
                }`}
              >
                <span className="font-semibold shrink-0 text-xs mt-0.5">{OPTION_LETTERS[i]}.</span>
                <span>{opt.option_text}</span>
                {opt.is_correct && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="ml-auto shrink-0 text-emerald-600 mt-0.5">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                )}
              </div>
            ))}
          </div>
          {q.explanation && (
            <div className="mt-2 pt-2 border-t border-slate-200">
              <p className="text-xs font-semibold text-slate-500 mb-0.5">Explanation</p>
              <p className="text-xs text-slate-600">{q.explanation}</p>
            </div>
          )}
          {!q.explanation && (
            <p className="mt-2 text-xs text-amber-600 flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 9v4m0 4h.01"/><circle cx="12" cy="12" r="10"/></svg>
              No explanation — consider adding one before activating.
            </p>
          )}
          {!correctOpt && (
            <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6m0-6l6 6"/></svg>
              No correct option marked — fix before activating.
            </p>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="px-4 py-2.5 flex items-center gap-2">
        <button
          onClick={() => setExpanded(e => !e)}
          className="text-xs text-slate-500 hover:text-slate-700 transition-colors"
        >
          {expanded ? '▲ Collapse' : '▼ Preview'}
        </button>
        <div className="flex-1" />
        <button
          onClick={onDelete}
          className="text-xs text-red-500 hover:text-red-700 px-2 py-1 rounded transition-colors"
        >
          Discard
        </button>
        <Button
          size="sm"
          onClick={onActivate}
          disabled={activating || !correctOpt}
          title={!correctOpt ? 'Set a correct option first' : ''}
        >
          {activating ? 'Activating…' : '✓ Activate'}
        </Button>
      </div>
    </div>
  );
}

export function AdminAIQueue() {
  const [delTarget, setDelTarget] = useState<QuestionAdmin | null>(null);
  const [activating, setActivating] = useState<string | null>(null);

  const { data: allQuestions, isLoading } = useAllQuestionsAdmin();
  const toggleActive = useToggleQuestionActive();
  const deleteQ = useDeleteQuestion();

  const drafts = (allQuestions ?? []).filter(q => !q.is_active);

  function activate(q: QuestionAdmin) {
    setActivating(q.id);
    toggleActive.mutate({ id: q.id, isActive: true }, {
      onSettled: () => setActivating(null),
    });
  }

  return (
    <AppShell role="admin" title="AI Review Queue">
      <PageContainer
        title="Draft Review Queue"
        description="Inactive questions waiting for review and activation"
        maxWidth="xl"
      >
        {/* Stats bar */}
        <div className="flex items-center gap-4 mb-5">
          <div className="bg-white border border-slate-200 rounded-xl px-4 py-3">
            <p className="text-2xl font-bold text-slate-900">{drafts.length}</p>
            <p className="text-xs text-slate-500">Pending review</p>
          </div>
          <div className="text-sm text-slate-500 max-w-sm">
            Review each draft question, preview its options, then activate when ready — or discard if the question needs to be rewritten.
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
          </div>
        ) : drafts.length === 0 ? (
          <div className="bg-white border border-dashed border-slate-200 rounded-xl py-16 text-center">
            <div className="w-12 h-12 mx-auto mb-3 bg-emerald-50 rounded-2xl flex items-center justify-center">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="1.75">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <p className="text-sm font-semibold text-slate-700">Queue is clear</p>
            <p className="text-xs text-slate-400 mt-1">All questions are active. Import or add new ones to see them here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {drafts.map(q => (
              <QuestionCard
                key={q.id}
                q={q}
                onActivate={() => activate(q)}
                onDelete={() => setDelTarget(q)}
                activating={activating === q.id}
              />
            ))}
          </div>
        )}

        <ConfirmDialog
          open={!!delTarget}
          onClose={() => setDelTarget(null)}
          onConfirm={() => {
            if (delTarget) {
              deleteQ.mutate({ id: delTarget.id, topicId: delTarget.topic_id }, {
                onSuccess: () => setDelTarget(null),
              });
            }
          }}
          title="Discard Question"
          description={`Permanently delete "${delTarget?.question_text.slice(0, 70)}…"?`}
          confirmLabel="Discard"
          variant="error"
        />
      </PageContainer>
    </AppShell>
  );
}
