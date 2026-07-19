import React, { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Dialog, ConfirmDialog } from '@/components/ui/Dialog';
import {
  useAllMockExams, useMockExamWithQuestions, useUpsertMockExam, useDeleteMockExam,
  useAddExamQuestion, useRemoveExamQuestion,
  type ExamRow, type ExamInsert, type ExamWithCount,
} from '@/hooks/useMockExams';
import { useAllQuestions, type QuestionWithTopic } from '@/hooks/useQuestions';

// ── Exam modal ────────────────────────────────────────────────────────

interface ExamForm {
  title: string;
  title_ar: string;
  description: string;
  duration_mins: number;
  passing_score: number;
  is_active: boolean;
}

const DEFAULT_FORM: ExamForm = {
  title: '', title_ar: '', description: '', duration_mins: 60, passing_score: 60, is_active: true,
};

function toForm(exam: ExamRow): ExamForm {
  return {
    title: exam.title,
    title_ar: exam.title_ar,
    description: exam.description ?? '',
    duration_mins: exam.duration_mins,
    passing_score: exam.passing_score,
    is_active: exam.is_active,
  };
}

interface ExamModalProps {
  open: boolean;
  onClose: () => void;
  editing: ExamRow | null;
}

function ExamModal({ open, onClose, editing }: ExamModalProps) {
  const [form, setForm] = useState<ExamForm>(editing ? toForm(editing) : DEFAULT_FORM);
  const upsert = useUpsertMockExam();

  React.useEffect(() => {
    setForm(editing ? toForm(editing) : DEFAULT_FORM);
  }, [editing, open]);

  function patch(key: keyof ExamForm, value: string | number | boolean) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSave() {
    const payload: ExamInsert & { id?: string } = {
      ...(editing ? { id: editing.id } : {}),
      title: form.title.trim(),
      title_ar: form.title_ar.trim(),
      description: form.description.trim() || null,
      duration_mins: form.duration_mins,
      passing_score: form.passing_score,
      is_active: form.is_active,
    };
    await upsert.mutateAsync(payload);
    onClose();
  }

  const canSave = form.title.trim().length > 0;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={editing ? 'Edit Exam' : 'Create Exam'}
      size="md"
      footer={
        <>
          <Button variant="ghost" color="neutral" size="sm" onClick={onClose}>Cancel</Button>
          <Button color="primary" size="sm" disabled={!canSave} loading={upsert.isPending} onClick={handleSave}>
            {editing ? 'Save Changes' : 'Create Exam'}
          </Button>
        </>
      }
    >
      <div className="space-y-4 py-1">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Title (EN) *</label>
            <input
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.title}
              onChange={(e) => patch('title', e.target.value)}
              placeholder="Dental Anatomy Mock Exam"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Title (AR)</label>
            <input
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              dir="rtl"
              value={form.title_ar}
              onChange={(e) => patch('title_ar', e.target.value)}
              placeholder="اختبار تشريح الأسنان"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Description</label>
          <textarea
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={2}
            value={form.description}
            onChange={(e) => patch('description', e.target.value)}
            placeholder="Optional description visible to students"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Duration (minutes)</label>
            <input
              type="number" min={5} max={360}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.duration_mins}
              onChange={(e) => patch('duration_mins', Number(e.target.value))}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Passing Score (%)</label>
            <input
              type="number" min={1} max={100}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.passing_score}
              onChange={(e) => patch('passing_score', Number(e.target.value))}
            />
          </div>
        </div>

        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(e) => patch('is_active', e.target.checked)}
            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-slate-700">Active (visible to students)</span>
        </label>
      </div>
    </Dialog>
  );
}

// ── Question manager modal ────────────────────────────────────────────

interface QuestionManagerProps {
  open: boolean;
  onClose: () => void;
  exam: ExamWithCount;
}

function QuestionManager({ open, onClose, exam }: QuestionManagerProps) {
  const [search, setSearch] = useState('');
  const { data: examDetail, isLoading: detailLoading } = useMockExamWithQuestions(exam.id);
  const { data: allQuestions, isLoading: allQLoading } = useAllQuestions();
  const addQuestion = useAddExamQuestion();
  const removeQuestion = useRemoveExamQuestion();

  const addedIds = new Set(examDetail?.mock_exam_questions.map((eq) => eq.question_id) ?? []);

  const available = (allQuestions ?? []).filter((q) => {
    if (addedIds.has(q.id)) return false;
    if (!search.trim()) return true;
    return q.question_text.toLowerCase().includes(search.toLowerCase());
  });

  // Group available by topic
  const byTopic = new Map<string, { topicName: string; questions: QuestionWithTopic[] }>();
  for (const q of available) {
    const tId = q.topics?.id ?? '__none__';
    const tName = q.topics?.name ?? 'No Topic';
    if (!byTopic.has(tId)) byTopic.set(tId, { topicName: tName, questions: [] });
    byTopic.get(tId)!.questions.push(q);
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={`Manage Questions — ${exam.title}`}
      size="xl"
      footer={<Button variant="ghost" color="neutral" size="sm" onClick={onClose}>Close</Button>}
    >
      <div className="space-y-5 py-1">
        {/* Current questions */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">
            Current Questions ({examDetail?.mock_exam_questions.length ?? 0})
          </h3>
          {detailLoading ? (
            <div className="space-y-2">
              {[1, 2].map((i) => <Skeleton key={i} className="h-10 rounded-lg" />)}
            </div>
          ) : !examDetail?.mock_exam_questions.length ? (
            <p className="text-sm text-slate-400 italic py-2">No questions added yet.</p>
          ) : (
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {examDetail.mock_exam_questions.map((eq, i) => (
                <div key={eq.id} className="flex items-center gap-3 px-3 py-2 bg-slate-50 rounded-lg">
                  <span className="text-xs font-semibold text-slate-400 shrink-0 w-5">{i + 1}</span>
                  <p className="text-sm text-slate-700 flex-1 truncate">{eq.questions.question_text}</p>
                  <button
                    onClick={() => removeQuestion.mutate({ id: eq.id, examId: exam.id })}
                    className="shrink-0 text-xs text-red-500 hover:text-red-700 font-medium transition-colors"
                    disabled={removeQuestion.isPending}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-slate-100" />

        {/* Question bank */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">
            Add from Question Bank
          </h3>
          <input
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
            placeholder="Search questions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {allQLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 rounded-lg" />)}
            </div>
          ) : byTopic.size === 0 ? (
            <p className="text-sm text-slate-400 italic py-2">
              {search ? 'No matching questions.' : 'All available questions have been added.'}
            </p>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {Array.from(byTopic.entries()).map(([tId, { topicName, questions: tqs }]) => (
                <div key={tId}>
                  <p className="text-xs font-semibold text-slate-500 mb-1.5">{topicName}</p>
                  <div className="space-y-1">
                    {tqs.map((q) => (
                      <div key={q.id} className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 rounded-lg group">
                        <p className="text-sm text-slate-700 flex-1 truncate">{q.question_text}</p>
                        <button
                          onClick={() => addQuestion.mutate({
                            examId: exam.id,
                            questionId: q.id,
                            displayOrder: (examDetail?.mock_exam_questions.length ?? 0),
                          })}
                          className="shrink-0 text-xs text-blue-600 hover:text-blue-800 font-semibold opacity-0 group-hover:opacity-100 transition-opacity"
                          disabled={addQuestion.isPending}
                        >
                          + Add
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Dialog>
  );
}

// ── Exam card ─────────────────────────────────────────────────────────

interface ExamCardProps {
  exam: ExamWithCount;
  onEdit: () => void;
  onDelete: () => void;
  onManageQuestions: () => void;
}

function ExamCard({ exam, onEdit, onDelete, onManageQuestions }: ExamCardProps) {
  const qCount = (exam.mock_exam_questions[0] as unknown as { count: number } | undefined)?.count ?? 0;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-semibold text-slate-900">{exam.title}</h3>
            {!exam.is_active && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">Inactive</span>
            )}
          </div>
          {exam.description && (
            <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{exam.description}</p>
          )}
          <div className="flex flex-wrap gap-3 mt-2 text-xs text-slate-500">
            <span>{exam.duration_mins} min</span>
            <span className="font-semibold text-blue-600">{qCount} question{qCount !== 1 ? 's' : ''}</span>
            <span>Pass: {exam.passing_score}%</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <Button size="sm" variant="outline" color="neutral" onClick={onManageQuestions}>
            Questions
          </Button>
          <Button size="sm" variant="ghost" color="neutral" onClick={onEdit}>Edit</Button>
          <Button size="sm" variant="ghost" color="error" onClick={onDelete}>Delete</Button>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────

export function AdminMockExams() {
  const { data: exams, isLoading } = useAllMockExams();
  const deleteExam = useDeleteMockExam();

  const [examModal, setExamModal] = useState(false);
  const [editingExam, setEditingExam] = useState<ExamRow | null>(null);
  const [managingExam, setManagingExam] = useState<ExamWithCount | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  function openCreate() { setEditingExam(null); setExamModal(true); }
  function openEdit(exam: ExamRow) { setEditingExam(exam); setExamModal(true); }

  return (
    <AppShell role="admin" title="Mock Exams">
      <PageContainer
        title="Mock Exams"
        description="Create timed practice exams from your question bank"
        maxWidth="xl"
        actions={
          <Button color="primary" size="sm" onClick={openCreate}>+ Create Exam</Button>
        }
      >
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
          </div>
        ) : !exams?.length ? (
          <div className="bg-white border border-slate-200 rounded-xl">
            <EmptyState
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              }
              title="No exams yet"
              description="Create your first mock exam and add questions from the question bank."
              action={{ label: '+ Create Exam', onClick: openCreate }}
            />
          </div>
        ) : (
          <div className="space-y-3">
            {exams.map((exam) => (
              <ExamCard
                key={exam.id}
                exam={exam}
                onEdit={() => openEdit(exam)}
                onDelete={() => setConfirmDeleteId(exam.id)}
                onManageQuestions={() => setManagingExam(exam)}
              />
            ))}
          </div>
        )}
      </PageContainer>

      <ExamModal
        open={examModal}
        onClose={() => setExamModal(false)}
        editing={editingExam}
      />

      {managingExam && (
        <QuestionManager
          open={!!managingExam}
          onClose={() => setManagingExam(null)}
          exam={managingExam}
        />
      )}

      <ConfirmDialog
        open={!!confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={() => {
          if (confirmDeleteId) deleteExam.mutate(confirmDeleteId);
          setConfirmDeleteId(null);
        }}
        title="Delete exam?"
        description="This will permanently delete the exam and all student sessions and answers. This cannot be undone."
        confirmLabel="Delete"
        variant="error"
        loading={deleteExam.isPending}
      />
    </AppShell>
  );
}
