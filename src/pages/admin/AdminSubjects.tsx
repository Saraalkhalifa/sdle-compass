import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { Dialog, ConfirmDialog } from '@/components/ui/Dialog';
import { ROUTES } from '@/config/app';
import {
  useSubjectsList,
  useUpsertSubject,
  useDeleteSubject,
  useReorderSubjects,
  type SubjectRow,
  type SubjectInsert,
} from '@/hooks/useSubjects';

// ── Subject form modal ───────────────────────────────────────────────

interface SubjectFormData {
  name: string;
  name_ar: string;
  description: string;
  description_ar: string;
  icon: string;
  color: string;
  exam_weight: string;
  is_active: boolean;
}

const EMPTY_FORM: SubjectFormData = {
  name: '', name_ar: '', description: '', description_ar: '',
  icon: '📚', color: 'bg-blue-500', exam_weight: '0', is_active: true,
};

const COLOR_OPTIONS = [
  'bg-blue-500', 'bg-teal-500', 'bg-emerald-500', 'bg-violet-500',
  'bg-rose-500', 'bg-amber-500', 'bg-pink-500', 'bg-indigo-500',
  'bg-cyan-500', 'bg-lime-500', 'bg-orange-500', 'bg-red-500',
  'bg-slate-500', 'bg-yellow-500', 'bg-stone-500',
];

interface SubjectModalProps {
  open: boolean;
  onClose: () => void;
  subject?: SubjectRow | null;
}

function SubjectModal({ open, onClose, subject }: SubjectModalProps) {
  const upsert = useUpsertSubject();
  const [form, setForm] = useState<SubjectFormData>(
    subject
      ? {
          name: subject.name,
          name_ar: subject.name_ar,
          description: subject.description ?? '',
          description_ar: subject.description_ar ?? '',
          icon: subject.icon ?? '📚',
          color: subject.color ?? 'bg-blue-500',
          exam_weight: String(subject.exam_weight),
          is_active: subject.is_active,
        }
      : EMPTY_FORM,
  );

  const update = (field: keyof SubjectFormData, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    const payload: SubjectInsert & { id?: string } = {
      name: form.name.trim(),
      name_ar: form.name_ar.trim(),
      description: form.description.trim() || null,
      description_ar: form.description_ar.trim() || null,
      icon: form.icon.trim(),
      color: form.color,
      exam_weight: parseFloat(form.exam_weight) || 0,
      is_active: form.is_active,
      ...(subject ? { id: subject.id } : {}),
    };
    await upsert.mutateAsync(payload);
    onClose();
  };

  // Reset form when subject changes
  React.useEffect(() => {
    if (open) {
      setForm(
        subject
          ? {
              name: subject.name,
              name_ar: subject.name_ar,
              description: subject.description ?? '',
              description_ar: subject.description_ar ?? '',
              icon: subject.icon ?? '📚',
              color: subject.color ?? 'bg-blue-500',
              exam_weight: String(subject.exam_weight),
              is_active: subject.is_active,
            }
          : EMPTY_FORM,
      );
    }
  }, [open, subject]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={subject ? 'Edit subject' : 'New subject'}
      size="lg"
      footer={
        <>
          <Button variant="ghost" color="neutral" size="sm" onClick={onClose} disabled={upsert.isPending}>
            Cancel
          </Button>
          <Button
            size="sm"
            color="primary"
            onClick={handleSave}
            loading={upsert.isPending}
            disabled={!form.name.trim()}
          >
            {subject ? 'Save changes' : 'Create subject'}
          </Button>
        </>
      }
    >
      <div className="space-y-4 pt-2">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">English name *</label>
            <Input
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              placeholder="Restorative Dentistry"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Arabic name</label>
            <Input
              value={form.name_ar}
              onChange={(e) => update('name_ar', e.target.value)}
              placeholder="طب الأسنان التحفظي"
              dir="rtl"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
              rows={2}
              placeholder="Brief overview of this subject"
              className="w-full rounded-lg border border-slate-200 text-sm px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Arabic description</label>
            <textarea
              value={form.description_ar}
              onChange={(e) => update('description_ar', e.target.value)}
              rows={2}
              placeholder="نظرة عامة عن هذه المادة"
              dir="rtl"
              className="w-full rounded-lg border border-slate-200 text-sm px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Icon (emoji)</label>
            <Input
              value={form.icon}
              onChange={(e) => update('icon', e.target.value)}
              placeholder="📚"
              className="text-center text-xl"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Exam weight (%)</label>
            <Input
              type="number"
              min="0"
              max="100"
              value={form.exam_weight}
              onChange={(e) => update('exam_weight', e.target.value)}
              placeholder="0"
            />
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 cursor-pointer pb-2">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => update('is_active', e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-slate-700">Active</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-2">Color</label>
          <div className="flex flex-wrap gap-2">
            {COLOR_OPTIONS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => update('color', c)}
                className={`w-7 h-7 rounded-lg ${c} transition-transform ${form.color === c ? 'ring-2 ring-offset-2 ring-blue-600 scale-110' : 'hover:scale-105'}`}
                title={c}
              />
            ))}
          </div>
        </div>
      </div>
    </Dialog>
  );
}

// ── AdminSubjects page ───────────────────────────────────────────────

export function AdminSubjects() {
  const { data: subjects, isLoading } = useSubjectsList();
  const deleteSubject = useDeleteSubject();
  const reorder = useReorderSubjects();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<SubjectRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SubjectRow | null>(null);

  const openCreate = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (s: SubjectRow) => { setEditing(s); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditing(null); };

  const move = (index: number, dir: -1 | 1) => {
    if (!subjects) return;
    const ids = subjects.map((s) => s.id);
    const newIndex = index + dir;
    if (newIndex < 0 || newIndex >= ids.length) return;
    [ids[index], ids[newIndex]] = [ids[newIndex], ids[index]];
    reorder.mutate(ids);
  };

  return (
    <AppShell role="admin" title="Subjects & Curriculum">
      <PageContainer
        title="Subjects & Curriculum"
        description="Manage examination subjects, ordering, and weights"
        maxWidth="xl"
        actions={
          <Button color="primary" size="sm" onClick={openCreate} leftIcon={
            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z"/>
            </svg>
          }>
            Add subject
          </Button>
        }
      >
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        ) : (
          <Card className="divide-y divide-slate-100 overflow-hidden p-0">
            {/* Table header */}
            <div className="grid grid-cols-[2rem_3rem_1fr_6rem_5rem_6rem_7rem] gap-3 px-4 py-2 bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wide">
              <span></span>
              <span>Icon</span>
              <span>Name</span>
              <span className="text-center">Weight</span>
              <span className="text-center">Active</span>
              <span></span>
              <span></span>
            </div>

            {(subjects ?? []).length === 0 && (
              <div className="py-12 text-center text-slate-400">
                <p className="text-3xl mb-2">📚</p>
                <p className="font-medium text-slate-600">No subjects yet</p>
                <Button size="sm" color="primary" onClick={openCreate} className="mt-3">
                  Add first subject
                </Button>
              </div>
            )}

            {(subjects ?? []).map((subject, index) => (
              <div
                key={subject.id}
                className="grid grid-cols-[2rem_3rem_1fr_6rem_5rem_6rem_7rem] gap-3 items-center px-4 py-3"
              >
                {/* Reorder */}
                <div className="flex flex-col gap-0.5">
                  <button
                    type="button"
                    onClick={() => move(index, -1)}
                    disabled={index === 0 || reorder.isPending}
                    className="p-0.5 text-slate-300 hover:text-slate-600 disabled:opacity-20"
                    aria-label="Move up"
                  >
                    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12l5-5 5 5" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => move(index, 1)}
                    disabled={index === (subjects?.length ?? 0) - 1 || reorder.isPending}
                    className="p-0.5 text-slate-300 hover:text-slate-600 disabled:opacity-20"
                    aria-label="Move down"
                  >
                    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 8l5 5 5-5" />
                    </svg>
                  </button>
                </div>

                {/* Icon */}
                <div
                  className={`w-9 h-9 ${subject.color ?? 'bg-blue-500'} rounded-lg flex items-center justify-center text-lg`}
                >
                  {subject.icon ?? '📚'}
                </div>

                {/* Name */}
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{subject.name}</p>
                  <p className="text-xs text-slate-400 truncate">{subject.name_ar}</p>
                </div>

                {/* Weight */}
                <div className="text-center">
                  <Badge color="neutral" size="xs">{subject.exam_weight}%</Badge>
                </div>

                {/* Active toggle */}
                <div className="text-center">
                  <span
                    className={`inline-block w-2.5 h-2.5 rounded-full ${subject.is_active ? 'bg-green-500' : 'bg-slate-300'}`}
                  />
                </div>

                {/* Manage topics link */}
                <Link
                  to={ROUTES.adminSubjectDetail(subject.id)}
                  className="text-xs text-blue-600 hover:underline font-medium text-center"
                >
                  Topics →
                </Link>

                {/* Actions */}
                <div className="flex items-center gap-1 justify-end">
                  <button
                    type="button"
                    onClick={() => openEdit(subject)}
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    aria-label="Edit subject"
                  >
                    <svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(subject)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    aria-label="Delete subject"
                  >
                    <svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </Card>
        )}
      </PageContainer>

      <SubjectModal open={modalOpen} onClose={closeModal} subject={editing} />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (deleteTarget) {
            await deleteSubject.mutateAsync(deleteTarget.id);
            setDeleteTarget(null);
          }
        }}
        loading={deleteSubject.isPending}
        title="Delete subject?"
        description={`"${deleteTarget?.name}" and all its topics will be permanently deleted.`}
        confirmLabel="Delete"
      />
    </AppShell>
  );
}
