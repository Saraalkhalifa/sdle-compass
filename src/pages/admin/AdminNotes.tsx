import React, { useState, useMemo } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { Dialog, ConfirmDialog } from '@/components/ui/Dialog';
import {
  useAllTopicNotesAdmin,
  useUpsertTopicNote,
  useDeleteTopicNote,
  type TopicNoteWithTopic,
  type TopicNoteInsert,
} from '@/hooks/useNotes';
import { useSubjectsList, useTopicsBySubject } from '@/hooks/useSubjects';

// ── Form ──────────────────────────────────────────────────────────────────────

interface NoteForm {
  subjectId: string;
  topicId: string;
  title: string;
  titleAr: string;
  content: string;
  contentAr: string;
  displayOrder: string;
  isActive: boolean;
}

const EMPTY_FORM: NoteForm = {
  subjectId: '', topicId: '',
  title: '', titleAr: '',
  content: '', contentAr: '',
  displayOrder: '0', isActive: true,
};

function NoteModal({ open, onClose, editing }: {
  open: boolean;
  onClose: () => void;
  editing: TopicNoteWithTopic | null;
}) {
  const [form, setForm] = useState<NoteForm>(EMPTY_FORM);
  const [tab, setTab] = useState<'en' | 'ar'>('en');
  const { data: subjects = [] } = useSubjectsList();
  const { data: topics = [] } = useTopicsBySubject(form.subjectId);
  const upsert = useUpsertTopicNote();

  React.useEffect(() => {
    if (!open) return;
    if (editing) {
      setForm({
        subjectId: editing.topics?.subject_id ?? '',
        topicId: editing.topic_id,
        title: editing.title,
        titleAr: editing.title_ar,
        content: editing.content,
        contentAr: editing.content_ar,
        displayOrder: editing.display_order.toString(),
        isActive: editing.is_active,
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setTab('en');
  }, [open, editing]);

  function set<K extends keyof NoteForm>(k: K, v: NoteForm[K]) {
    setForm(f => ({ ...f, [k]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.topicId || !form.title.trim()) return;
    const payload: TopicNoteInsert & { id?: string } = {
      ...(editing ? { id: editing.id } : {}),
      topic_id: form.topicId,
      title: form.title.trim(),
      title_ar: form.titleAr.trim(),
      content: form.content.trim(),
      content_ar: form.contentAr.trim(),
      display_order: parseInt(form.displayOrder, 10) || 0,
      is_active: form.isActive,
    };
    upsert.mutate(payload, { onSuccess: onClose });
  }

  const inputCls = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';
  const labelCls = 'block text-xs font-semibold text-slate-600 mb-1';

  return (
    <Dialog open={open} onClose={onClose} title={editing ? 'Edit Study Note' : 'Add Study Note'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Topic picker */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Subject</label>
            <select
              value={form.subjectId}
              onChange={e => setForm(f => ({ ...f, subjectId: e.target.value, topicId: '' }))}
              className={inputCls}
              required
            >
              <option value="">Select subject…</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Topic</label>
            <select
              value={form.topicId}
              onChange={e => set('topicId', e.target.value)}
              className={inputCls}
              required
              disabled={!form.subjectId}
            >
              <option value="">Select topic…</option>
              {topics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
        </div>

        {/* Language tab */}
        <div>
          <div className="flex gap-1 mb-3 border-b border-slate-200">
            {(['en', 'ar'] as const).map(l => (
              <button
                key={l}
                type="button"
                onClick={() => setTab(l)}
                className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors -mb-px ${
                  tab === l ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                {l === 'en' ? 'English' : 'Arabic (AR)'}
              </button>
            ))}
          </div>

          {tab === 'en' ? (
            <div className="space-y-3">
              <div>
                <label className={labelCls}>Title (EN)</label>
                <input value={form.title} onChange={e => set('title', e.target.value)} className={inputCls} placeholder="Note title" required />
              </div>
              <div>
                <label className={labelCls}>Content (EN)</label>
                <textarea
                  value={form.content}
                  onChange={e => set('content', e.target.value)}
                  className={inputCls}
                  rows={6}
                  placeholder="Study note content — supports markdown…"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className={labelCls}>Title (AR)</label>
                <input value={form.titleAr} onChange={e => set('titleAr', e.target.value)} className={inputCls} dir="rtl" placeholder="عنوان الملاحظة" />
              </div>
              <div>
                <label className={labelCls}>Content (AR)</label>
                <textarea
                  value={form.contentAr}
                  onChange={e => set('contentAr', e.target.value)}
                  className={inputCls}
                  dir="rtl"
                  rows={6}
                  placeholder="محتوى ملاحظة الدراسة…"
                />
              </div>
            </div>
          )}
        </div>

        {/* Order + active */}
        <div className="flex items-center gap-4">
          <div className="w-36">
            <label className={labelCls}>Display Order</label>
            <input type="number" min="0" value={form.displayOrder} onChange={e => set('displayOrder', e.target.value)} className={inputCls} />
          </div>
          <label className="flex items-center gap-2 cursor-pointer select-none mt-4">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={e => set('isActive', e.target.checked)}
              className="w-4 h-4 rounded accent-blue-600"
            />
            <span className="text-sm font-medium text-slate-700">Visible to students</span>
          </label>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={upsert.isPending} disabled={!form.topicId || !form.title.trim()}>
            {editing ? 'Save Changes' : 'Add Note'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

// ── Row ───────────────────────────────────────────────────────────────────────

function NoteRow({ note: n, onEdit, onDelete }: {
  note: TopicNoteWithTopic;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const subject = n.topics?.subjects?.name;
  const topic   = n.topics?.name;
  const preview = n.content.slice(0, 90) + (n.content.length > 90 ? '…' : '');

  return (
    <tr className="hover:bg-slate-50 transition-colors">
      <td className="px-4 py-3">
        <p className="text-sm font-semibold text-slate-800">{n.title}</p>
        {n.title_ar && <p className="text-xs text-slate-400" dir="rtl">{n.title_ar}</p>}
      </td>
      <td className="px-4 py-3 text-xs text-slate-500">
        {subject && topic ? (
          <span className="flex items-center gap-1">
            <span className="font-medium text-slate-600">{subject}</span>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
            {topic}
          </span>
        ) : '—'}
      </td>
      <td className="px-4 py-3 text-xs text-slate-400 max-w-xs">
        <span className="line-clamp-2 leading-relaxed">{preview || <em className="text-slate-300">No content</em>}</span>
      </td>
      <td className="px-4 py-3 text-center text-xs text-slate-400">{n.display_order}</td>
      <td className="px-4 py-3">
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${n.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
          {n.is_active ? 'Visible' : 'Hidden'}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1 justify-end">
          <button onClick={onEdit} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button onClick={onDelete} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6m4-6v6"/><path d="M9 6V4h6v2"/></svg>
          </button>
        </div>
      </td>
    </tr>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function AdminNotes() {
  const [search, setSearch]             = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [modalOpen, setModalOpen]       = useState(false);
  const [editing, setEditing]           = useState<TopicNoteWithTopic | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TopicNoteWithTopic | null>(null);

  const { data: notes = [], isLoading } = useAllTopicNotesAdmin();
  const { data: subjects = [] } = useSubjectsList();
  const deleteNote = useDeleteTopicNote();

  const filtered = useMemo(() => {
    let list = notes;
    if (subjectFilter) list = list.filter(n => n.topics?.subjects?.id === subjectFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(n =>
        n.title.toLowerCase().includes(q) ||
        n.title_ar?.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q),
      );
    }
    return list;
  }, [notes, subjectFilter, search]);

  function openAdd() {
    setEditing(null);
    setModalOpen(true);
  }

  return (
    <AppShell role="admin" title="Study Notes">
      <PageContainer
        title="Study Notes"
        description="Admin-authored study notes and summaries for each topic"
        maxWidth="2xl"
        actions={<Button onClick={openAdd} size="sm">+ Add Note</Button>}
      >
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <select
            value={subjectFilter}
            onChange={e => setSubjectFilter(e.target.value)}
            className="px-2.5 py-1.5 text-sm border border-slate-200 rounded-lg bg-white"
          >
            <option value="">All subjects</option>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>

          <div className="relative">
            <svg width="12" height="12" className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            <input
              type="search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search notes…"
              className="pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
            />
          </div>

          <p className="text-xs text-slate-400 ml-auto">
            {filtered.length} of {notes.length} notes
          </p>
        </div>

        {/* Table */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-14" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-slate-100 rounded-xl flex items-center justify-center">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
              </div>
              <p className="text-sm font-semibold text-slate-700">No study notes found</p>
              <p className="text-xs text-slate-400 mt-1">
                {notes.length === 0 ? 'Add your first study note above.' : 'Try adjusting your filters.'}
              </p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Title</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Topic</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Preview</th>
                  <th className="text-center px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide w-16">Order</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide w-20">Status</th>
                  <th className="px-4 py-2.5 w-20"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(n => (
                  <NoteRow
                    key={n.id}
                    note={n}
                    onEdit={() => { setEditing(n); setModalOpen(true); }}
                    onDelete={() => setDeleteTarget(n)}
                  />
                ))}
              </tbody>
            </table>
          )}
        </div>

        <NoteModal open={modalOpen} onClose={() => setModalOpen(false)} editing={editing} />

        <ConfirmDialog
          open={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={() => {
            if (!deleteTarget) return;
            deleteNote.mutate(
              { id: deleteTarget.id, topicId: deleteTarget.topic_id },
              { onSuccess: () => setDeleteTarget(null) },
            );
          }}
          title="Delete Study Note"
          description={`Delete "${deleteTarget?.title}"? This will remove it from all students' topic views.`}
          confirmLabel="Delete"
          variant="error"
          loading={deleteNote.isPending}
        />
      </PageContainer>
    </AppShell>
  );
}
