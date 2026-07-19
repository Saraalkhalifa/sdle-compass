import React, { useState, useMemo } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { Dialog, ConfirmDialog } from '@/components/ui/Dialog';
import {
  useAllResources,
  useUpsertResource,
  useDeleteResource,
  type ResourceWithTopic,
  type ResourceType,
  type ResourceInsert,
} from '@/hooks/useResources';
import { useSubjectsList, useTopicsBySubject } from '@/hooks/useSubjects';

// ── Constants ─────────────────────────────────────────────────────────────────

const TYPE_META: Record<ResourceType, { label: string; icon: React.ReactNode; cls: string }> = {
  pdf: {
    label: 'PDF',
    cls: 'bg-red-100 text-red-700',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
        <line x1="9" y1="15" x2="15" y2="15"/>
      </svg>
    ),
  },
  video: {
    label: 'Video',
    cls: 'bg-violet-100 text-violet-700',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
      </svg>
    ),
  },
  link: {
    label: 'Link',
    cls: 'bg-blue-100 text-blue-700',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
      </svg>
    ),
  },
};

// ── Form ──────────────────────────────────────────────────────────────────────

interface ResourceForm {
  subjectId: string;
  topicId: string;
  type: ResourceType;
  title: string;
  titleAr: string;
  description: string;
  url: string;
  durationMins: string;
  displayOrder: string;
  isActive: boolean;
}

const EMPTY_FORM: ResourceForm = {
  subjectId: '', topicId: '',
  type: 'link',
  title: '', titleAr: '',
  description: '', url: '',
  durationMins: '', displayOrder: '0',
  isActive: true,
};

function ResourceModal({
  open, onClose, editing,
}: {
  open: boolean;
  onClose: () => void;
  editing: ResourceWithTopic | null;
}) {
  const [form, setForm] = useState<ResourceForm>(EMPTY_FORM);
  const { data: subjects = [] } = useSubjectsList();
  const { data: topics = [] } = useTopicsBySubject(form.subjectId);
  const upsert = useUpsertResource();

  React.useEffect(() => {
    if (!open) return;
    if (editing) {
      const subjectId = editing.topics?.subject_id ?? '';
      setForm({
        subjectId,
        topicId: editing.topic_id,
        type: editing.type,
        title: editing.title,
        titleAr: editing.title_ar,
        description: editing.description ?? '',
        url: editing.url,
        durationMins: editing.duration_mins?.toString() ?? '',
        displayOrder: editing.display_order.toString(),
        isActive: editing.is_active,
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [open, editing]);

  function set<K extends keyof ResourceForm>(k: K, v: ResourceForm[K]) {
    setForm(f => ({ ...f, [k]: v }));
  }

  function handleSubject(id: string) {
    setForm(f => ({ ...f, subjectId: id, topicId: '' }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.topicId || !form.title.trim() || !form.url.trim()) return;
    const payload: ResourceInsert & { id?: string } = {
      ...(editing ? { id: editing.id } : {}),
      topic_id: form.topicId,
      type: form.type,
      title: form.title.trim(),
      title_ar: form.titleAr.trim(),
      description: form.description.trim() || null,
      url: form.url.trim(),
      duration_mins: form.durationMins ? parseInt(form.durationMins, 10) : null,
      display_order: parseInt(form.displayOrder, 10) || 0,
      is_active: form.isActive,
    };
    upsert.mutate(payload, { onSuccess: onClose });
  }

  const inputCls = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';
  const labelCls = 'block text-xs font-semibold text-slate-600 mb-1';

  return (
    <Dialog open={open} onClose={onClose} title={editing ? 'Edit Resource' : 'Add Resource'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type selector */}
        <div>
          <label className={labelCls}>Type</label>
          <div className="flex gap-2">
            {(['pdf', 'video', 'link'] as ResourceType[]).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => set('type', t)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border-2 transition-colors ${
                  form.type === t
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-slate-200 text-slate-500 hover:border-slate-300'
                }`}
              >
                {TYPE_META[t].icon}
                {TYPE_META[t].label}
              </button>
            ))}
          </div>
        </div>

        {/* Topic picker */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Subject</label>
            <select value={form.subjectId} onChange={e => handleSubject(e.target.value)} className={inputCls} required>
              <option value="">Select subject…</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Topic</label>
            <select value={form.topicId} onChange={e => set('topicId', e.target.value)} className={inputCls} required disabled={!form.subjectId}>
              <option value="">Select topic…</option>
              {topics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
        </div>

        {/* Titles */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Title (EN)</label>
            <input value={form.title} onChange={e => set('title', e.target.value)} className={inputCls} placeholder="Resource title" required />
          </div>
          <div>
            <label className={labelCls}>Title (AR)</label>
            <input value={form.titleAr} onChange={e => set('titleAr', e.target.value)} className={inputCls} dir="rtl" placeholder="عنوان المرجع" />
          </div>
        </div>

        {/* URL */}
        <div>
          <label className={labelCls}>URL</label>
          <input
            type="url"
            value={form.url}
            onChange={e => set('url', e.target.value)}
            className={inputCls}
            placeholder={form.type === 'video' ? 'https://youtube.com/watch?v=…' : form.type === 'pdf' ? 'https://…/file.pdf' : 'https://…'}
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className={labelCls}>Description (optional)</label>
          <textarea value={form.description} onChange={e => set('description', e.target.value)} className={inputCls} rows={2} placeholder="Brief description" />
        </div>

        {/* Duration + order + active */}
        <div className="grid grid-cols-3 gap-3">
          {form.type === 'video' && (
            <div>
              <label className={labelCls}>Duration (mins)</label>
              <input type="number" min="0" value={form.durationMins} onChange={e => set('durationMins', e.target.value)} className={inputCls} placeholder="45" />
            </div>
          )}
          <div>
            <label className={labelCls}>Display Order</label>
            <input type="number" min="0" value={form.displayOrder} onChange={e => set('displayOrder', e.target.value)} className={inputCls} />
          </div>
          <div className="flex items-end pb-0.5">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={e => set('isActive', e.target.checked)}
                className="w-4 h-4 rounded accent-blue-600"
              />
              <span className="text-sm font-medium text-slate-700">Active</span>
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={upsert.isPending} disabled={!form.topicId || !form.title.trim() || !form.url.trim()}>
            {editing ? 'Save Changes' : 'Add Resource'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

// ── Row ───────────────────────────────────────────────────────────────────────

function ResourceRow({ resource: r, onEdit, onDelete }: {
  resource: ResourceWithTopic;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const meta = TYPE_META[r.type];
  const subject = r.topics?.subjects?.name;
  const topic   = r.topics?.name;

  return (
    <tr className="hover:bg-slate-50 transition-colors">
      <td className="px-4 py-3">
        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${meta.cls}`}>
          {meta.icon}
          {meta.label}
        </span>
      </td>
      <td className="px-4 py-3">
        <p className="text-sm font-semibold text-slate-800 leading-snug">{r.title}</p>
        {r.title_ar && <p className="text-xs text-slate-400 leading-snug" dir="rtl">{r.title_ar}</p>}
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
      <td className="px-4 py-3 max-w-[180px]">
        <a
          href={r.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-600 hover:underline truncate block"
          title={r.url}
        >
          {r.url.replace(/^https?:\/\//, '').slice(0, 48)}{r.url.length > 55 ? '…' : ''}
        </a>
      </td>
      {r.type === 'video' && r.duration_mins ? (
        <td className="px-4 py-3 text-xs text-slate-500">{r.duration_mins} min</td>
      ) : (
        <td className="px-4 py-3 text-xs text-slate-300">—</td>
      )}
      <td className="px-4 py-3">
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${r.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
          {r.is_active ? 'Active' : 'Hidden'}
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

export function AdminResources() {
  const [search, setSearch]           = useState('');
  const [typeFilter, setTypeFilter]   = useState<ResourceType | ''>('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [modalOpen, setModalOpen]     = useState(false);
  const [editing, setEditing]         = useState<ResourceWithTopic | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ResourceWithTopic | null>(null);

  const { data: resources = [], isLoading } = useAllResources();
  const { data: subjects = [] } = useSubjectsList();
  const deleteResource = useDeleteResource();

  const filtered = useMemo(() => {
    let list = resources;
    if (typeFilter)    list = list.filter(r => r.type === typeFilter);
    if (subjectFilter) list = list.filter(r => r.topics?.subjects?.id === subjectFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(r =>
        r.title.toLowerCase().includes(q) ||
        r.title_ar?.toLowerCase().includes(q) ||
        r.url.toLowerCase().includes(q) ||
        r.topics?.name.toLowerCase().includes(q),
      );
    }
    return list;
  }, [resources, typeFilter, subjectFilter, search]);

  function openAdd() {
    setEditing(null);
    setModalOpen(true);
  }
  function openEdit(r: ResourceWithTopic) {
    setEditing(r);
    setModalOpen(true);
  }

  const counts = useMemo(() => ({
    pdf:   resources.filter(r => r.type === 'pdf').length,
    video: resources.filter(r => r.type === 'video').length,
    link:  resources.filter(r => r.type === 'link').length,
  }), [resources]);

  return (
    <AppShell role="admin" title="Resources">
      <PageContainer
        title="Resource Library"
        description="Manage PDFs, videos, and links across all topics"
        maxWidth="2xl"
        actions={<Button onClick={openAdd} size="sm">+ Add Resource</Button>}
      >
        {/* Summary chips */}
        <div className="flex flex-wrap gap-2 mb-4">
          {(['', 'pdf', 'video', 'link'] as (ResourceType | '')[]).map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                typeFilter === t
                  ? 'bg-slate-800 text-white border-slate-800'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              {t === '' ? `All (${resources.length})` : `${TYPE_META[t].label} (${counts[t]})`}
            </button>
          ))}

          <select
            value={subjectFilter}
            onChange={e => setSubjectFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white text-slate-600 ml-auto"
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
              placeholder="Search resources…"
              className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-44"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-12" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-slate-100 rounded-xl flex items-center justify-center">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
                </svg>
              </div>
              <p className="text-sm font-semibold text-slate-700">No resources found</p>
              <p className="text-xs text-slate-400 mt-1">
                {resources.length === 0 ? 'Add your first resource above.' : 'Try adjusting your filters.'}
              </p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide w-20">Type</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Title</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Topic</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">URL</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide w-20">Duration</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide w-20">Status</th>
                  <th className="px-4 py-2.5 w-20"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(r => (
                  <ResourceRow
                    key={r.id}
                    resource={r}
                    onEdit={() => openEdit(r)}
                    onDelete={() => setDeleteTarget(r)}
                  />
                ))}
              </tbody>
            </table>
          )}
        </div>

        <p className="text-xs text-slate-400 mt-2 text-right">{filtered.length} of {resources.length} resources</p>

        <ResourceModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          editing={editing}
        />

        <ConfirmDialog
          open={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={() => {
            if (!deleteTarget) return;
            deleteResource.mutate(
              { id: deleteTarget.id, topicId: deleteTarget.topic_id },
              { onSuccess: () => setDeleteTarget(null) },
            );
          }}
          title="Delete Resource"
          description={`Delete "${deleteTarget?.title}"? This action cannot be undone.`}
          confirmLabel="Delete"
          variant="error"
          loading={deleteResource.isPending}
        />
      </PageContainer>
    </AppShell>
  );
}
