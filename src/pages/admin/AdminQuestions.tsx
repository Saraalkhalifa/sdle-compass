import React, { useState, useMemo } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { Dialog, ConfirmDialog } from '@/components/ui/Dialog';
import {
  useAllQuestionsAdmin,
  useUpsertQuestion,
  useDeleteQuestion,
  useToggleQuestionActive,
  type QuestionAdmin,
  type QuestionInsert,
  type OptionFormData,
  type Difficulty,
} from '@/hooks/useQuestions';
import { useSubjectsList, useTopicsBySubject } from '@/hooks/useSubjects';

// ── Constants ─────────────────────────────────────────────────────────────────

const DIFF_META: Record<Difficulty, { label: string; cls: string }> = {
  easy:   { label: 'Easy',   cls: 'bg-emerald-100 text-emerald-700' },
  medium: { label: 'Medium', cls: 'bg-amber-100 text-amber-700' },
  hard:   { label: 'Hard',   cls: 'bg-red-100 text-red-700' },
};

const OPTION_LETTERS = ['A', 'B', 'C', 'D'] as const;

// ── Question form modal ───────────────────────────────────────────────────────

interface QuestionForm {
  subjectId: string;
  topicId: string;
  questionText: string;
  questionTextAr: string;
  difficulty: Difficulty;
  isActive: boolean;
  explanation: string;
  explanationAr: string;
  options: OptionFormData[];
  correctIdx: number;
}

const EMPTY_FORM: QuestionForm = {
  subjectId: '', topicId: '',
  questionText: '', questionTextAr: '',
  difficulty: 'medium', isActive: true,
  explanation: '', explanationAr: '',
  options: Array.from({ length: 4 }, () => ({ text: '', text_ar: '', is_correct: false })),
  correctIdx: 0,
};

function toForm(q: QuestionAdmin): QuestionForm {
  const opts = q.question_options;
  const correctIdx = opts.findIndex(o => o.is_correct);
  return {
    subjectId: q.topics?.subject_id ?? '',
    topicId: q.topic_id,
    questionText: q.question_text,
    questionTextAr: q.question_text_ar ?? '',
    difficulty: q.difficulty as Difficulty,
    isActive: q.is_active,
    explanation: q.explanation ?? '',
    explanationAr: q.explanation_ar ?? '',
    options: Array.from({ length: 4 }, (_, i) => ({
      text:       opts[i]?.option_text    ?? '',
      text_ar:    opts[i]?.option_text_ar ?? '',
      is_correct: i === correctIdx,
    })),
    correctIdx: correctIdx >= 0 ? correctIdx : 0,
  };
}

interface QuestionModalProps {
  open: boolean;
  onClose: () => void;
  editing: QuestionAdmin | null;
}

function QuestionModal({ open, onClose, editing }: QuestionModalProps) {
  const [form, setForm] = useState<QuestionForm>(() => editing ? toForm(editing) : EMPTY_FORM);
  const upsert = useUpsertQuestion();

  const { data: subjects } = useSubjectsList();
  const { data: topics } = useTopicsBySubject(form.subjectId);

  // Reset form when editing changes
  React.useEffect(() => {
    setForm(editing ? toForm(editing) : EMPTY_FORM);
  }, [editing, open]);

  function setOpt(idx: number, field: keyof OptionFormData, value: string | boolean) {
    setForm(f => ({
      ...f,
      options: f.options.map((o, i) => i === idx ? { ...o, [field]: value } : o),
    }));
  }

  function setCorrect(idx: number) {
    setForm(f => ({
      ...f,
      correctIdx: idx,
      options: f.options.map((o, i) => ({ ...o, is_correct: i === idx })),
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.topicId) return;
    const question: QuestionInsert & { id?: string } = {
      ...(editing ? { id: editing.id } : {}),
      topic_id: form.topicId,
      question_text: form.questionText.trim(),
      question_text_ar: form.questionTextAr.trim(),
      difficulty: form.difficulty,
      is_active: form.isActive,
      explanation: form.explanation.trim() || null,
      explanation_ar: form.explanationAr.trim() || null,
    };
    upsert.mutate({ question, options: form.options }, {
      onSuccess: () => { onClose(); },
    });
  }

  const canSave =
    form.topicId &&
    form.questionText.trim() &&
    form.options.every(o => o.text.trim()) &&
    form.options.some(o => o.is_correct);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={editing ? 'Edit Question' : 'Add Question'}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Topic picker */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Subject</label>
            <select
              value={form.subjectId}
              onChange={e => setForm(f => ({ ...f, subjectId: e.target.value, topicId: '' }))}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select subject…</option>
              {subjects?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Topic <span className="text-red-500">*</span></label>
            <select
              value={form.topicId}
              onChange={e => setForm(f => ({ ...f, topicId: e.target.value }))}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!form.subjectId}
            >
              <option value="">Select topic…</option>
              {topics?.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
        </div>

        {/* Question text */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Question (EN) <span className="text-red-500">*</span></label>
            <textarea
              rows={3}
              value={form.questionText}
              onChange={e => setForm(f => ({ ...f, questionText: e.target.value }))}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter question in English…"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Question (AR)</label>
            <textarea
              rows={3}
              dir="rtl"
              value={form.questionTextAr}
              onChange={e => setForm(f => ({ ...f, questionTextAr: e.target.value }))}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 font-arabic"
              placeholder="أدخل السؤال بالعربية…"
            />
          </div>
        </div>

        {/* Options */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-slate-600">Answer Options <span className="text-red-500">*</span></label>
            <span className="text-xs text-slate-400">Mark one as correct</span>
          </div>
          <div className="space-y-2">
            {form.options.map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCorrect(i)}
                  className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                    opt.is_correct
                      ? 'border-emerald-500 bg-emerald-500 text-white'
                      : 'border-slate-300 text-slate-400 hover:border-emerald-400'
                  }`}
                  title="Mark as correct"
                >
                  {OPTION_LETTERS[i]}
                </button>
                <input
                  type="text"
                  value={opt.text}
                  onChange={e => setOpt(i, 'text', e.target.value)}
                  placeholder={`Option ${OPTION_LETTERS[i]} (EN)…`}
                  className="flex-1 border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  dir="rtl"
                  value={opt.text_ar}
                  onChange={e => setOpt(i, 'text_ar', e.target.value)}
                  placeholder="(AR)…"
                  className="w-36 border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Difficulty + active */}
        <div className="flex items-center gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Difficulty</label>
            <div className="flex gap-1">
              {(['easy', 'medium', 'hard'] as Difficulty[]).map(d => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, difficulty: d }))}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                    form.difficulty === d
                      ? `${DIFF_META[d].cls} border-transparent`
                      : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {DIFF_META[d].label}
                </button>
              ))}
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer ml-auto">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
              className="w-4 h-4 rounded accent-blue-600"
            />
            <span className="text-sm text-slate-700">Active (visible to students)</span>
          </label>
        </div>

        {/* Explanation */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Explanation (EN)</label>
            <textarea
              rows={2}
              value={form.explanation}
              onChange={e => setForm(f => ({ ...f, explanation: e.target.value }))}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Optional explanation…"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Explanation (AR)</label>
            <textarea
              rows={2}
              dir="rtl"
              value={form.explanationAr}
              onChange={e => setForm(f => ({ ...f, explanationAr: e.target.value }))}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="شرح اختياري…"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={!canSave || upsert.isPending}>
            {upsert.isPending ? 'Saving…' : (editing ? 'Save Changes' : 'Add Question')}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export function AdminQuestions() {
  const [subjectFilter, setSubjectFilter] = useState('');
  const [topicFilter, setTopicFilter]     = useState('');
  const [diffFilter, setDiffFilter]       = useState<Difficulty | ''>('');
  const [showInactive, setShowInactive]   = useState(false);
  const [search, setSearch]               = useState('');
  const [modalOpen, setModalOpen]         = useState(false);
  const [editing, setEditing]             = useState<QuestionAdmin | null>(null);
  const [delTarget, setDelTarget]         = useState<QuestionAdmin | null>(null);

  const { data: questions, isLoading } = useAllQuestionsAdmin();
  const { data: subjects }              = useSubjectsList();
  const { data: filterTopics }         = useTopicsBySubject(subjectFilter);
  const deleteQ    = useDeleteQuestion();
  const toggleActive = useToggleQuestionActive();

  const filtered = useMemo(() => {
    let list = questions ?? [];
    if (!showInactive) list = list.filter(q => q.is_active);
    if (subjectFilter) list = list.filter(q => q.topics?.subject_id === subjectFilter);
    if (topicFilter)   list = list.filter(q => q.topic_id === topicFilter);
    if (diffFilter)    list = list.filter(q => q.difficulty === diffFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(r => r.question_text.toLowerCase().includes(q));
    }
    return list;
  }, [questions, showInactive, subjectFilter, topicFilter, diffFilter, search]);

  const total  = questions?.length ?? 0;
  const active = questions?.filter(q => q.is_active).length ?? 0;
  const draft  = total - active;

  return (
    <AppShell role="admin" title="Questions">
      <PageContainer title="Question Bank" description="Manage all SDLE examination questions" maxWidth="2xl">

        {/* Stats */}
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-5">
          {[
            { label: 'Total', value: total,  cls: 'text-slate-900' },
            { label: 'Active', value: active, cls: 'text-emerald-700' },
            { label: 'Draft', value: draft,  cls: 'text-amber-700' },
          ].map(s => (
            <div key={s.label} className="bg-white border border-slate-200 rounded-xl p-3">
              <p className={`text-xl font-bold ${s.cls}`}>{s.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
            </div>
          ))}
          <Button onClick={() => { setEditing(null); setModalOpen(true); }} className="sm:self-end">
            + Add Question
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <div className="relative">
            <svg width="13" height="13" className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            <input
              type="search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search questions…"
              className="pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
            />
          </div>

          <select
            value={subjectFilter}
            onChange={e => { setSubjectFilter(e.target.value); setTopicFilter(''); }}
            className="px-2.5 py-1.5 text-sm border border-slate-200 rounded-lg bg-white"
          >
            <option value="">All subjects</option>
            {subjects?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>

          <select
            value={topicFilter}
            onChange={e => setTopicFilter(e.target.value)}
            disabled={!subjectFilter}
            className="px-2.5 py-1.5 text-sm border border-slate-200 rounded-lg bg-white disabled:opacity-40"
          >
            <option value="">All topics</option>
            {filterTopics?.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>

          <div className="flex gap-1">
            {(['', 'easy', 'medium', 'hard'] as const).map(d => (
              <button
                key={d}
                onClick={() => setDiffFilter(d as Difficulty | '')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  diffFilter === d
                    ? 'bg-slate-800 text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                {d === '' ? 'All' : DIFF_META[d as Difficulty].label}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-1.5 text-sm text-slate-600 cursor-pointer ml-auto">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={e => setShowInactive(e.target.checked)}
              className="accent-blue-600"
            />
            Show drafts
          </label>
        </div>

        {/* Count */}
        {!isLoading && (
          <p className="text-xs text-slate-400 mb-3">
            {filtered.length === total ? `${total} questions` : `${filtered.length} of ${total}`}
          </p>
        )}

        {/* Table */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-10" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-sm font-semibold text-slate-700">No questions found</p>
              <p className="text-xs text-slate-400 mt-1">Adjust your filters or add a new question.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide w-[45%]">Question</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Topic</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Diff.</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Opts</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                  <th className="px-4 py-2.5 w-24"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(q => {
                  const diff = DIFF_META[q.difficulty as Difficulty];
                  return (
                    <tr key={q.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 max-w-0">
                        <p className="text-slate-800 truncate text-sm" title={q.question_text}>
                          {q.question_text}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-xs text-slate-400">{(q.topics as QuestionAdmin['topics'])?.subjects?.name}</p>
                          <p className="text-xs text-slate-700 font-medium">{q.topics?.name}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${diff.cls}`}>
                          {diff.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {q.question_options.length}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleActive.mutate({ id: q.id, isActive: !q.is_active })}
                          className={`text-xs font-semibold px-2 py-0.5 rounded-full cursor-pointer transition-colors ${
                            q.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                          }`}
                          title={q.is_active ? 'Click to deactivate' : 'Click to activate'}
                        >
                          {q.is_active ? 'Active' : 'Draft'}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 justify-end">
                          <button
                            onClick={() => { setEditing(q); setModalOpen(true); }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Edit"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                          </button>
                          <button
                            onClick={() => setDelTarget(q)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path strokeLinecap="round" d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path strokeLinecap="round" d="M10 11v6m4-6v6"/><path strokeLinecap="round" d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Modals */}
        <QuestionModal
          open={modalOpen}
          onClose={() => { setModalOpen(false); setEditing(null); }}
          editing={editing}
        />

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
          title="Delete Question"
          description={`Delete "${delTarget?.question_text.slice(0, 60)}…"? This cannot be undone and will remove all student attempts.`}
          confirmLabel="Delete"
          variant="error"
        />
      </PageContainer>
    </AppShell>
  );
}
