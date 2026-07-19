import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
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
  useSubject,
  useTopicsBySubject,
  useUpsertTopic,
  useDeleteTopic,
  type TopicRow,
  type TopicInsert,
} from '@/hooks/useSubjects';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

// ── Topic form modal ─────────────────────────────────────────────────

interface TopicFormData {
  name: string;
  name_ar: string;
  description: string;
  description_ar: string;
  estimated_hours: string;
  is_active: boolean;
}

const EMPTY_TOPIC: TopicFormData = {
  name: '', name_ar: '', description: '', description_ar: '',
  estimated_hours: '1', is_active: true,
};

interface TopicModalProps {
  open: boolean;
  onClose: () => void;
  subjectId: string;
  topic?: TopicRow | null;
}

function TopicModal({ open, onClose, subjectId, topic }: TopicModalProps) {
  const upsert = useUpsertTopic();
  const [form, setForm] = useState<TopicFormData>(EMPTY_TOPIC);

  useEffect(() => {
    if (open) {
      setForm(
        topic
          ? {
              name: topic.name,
              name_ar: topic.name_ar,
              description: topic.description ?? '',
              description_ar: topic.description_ar ?? '',
              estimated_hours: String(topic.estimated_hours),
              is_active: topic.is_active,
            }
          : EMPTY_TOPIC,
      );
    }
  }, [open, topic]);

  const update = (field: keyof TopicFormData, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    const payload: TopicInsert & { id?: string } = {
      subject_id: subjectId,
      name: form.name.trim(),
      name_ar: form.name_ar.trim(),
      description: form.description.trim() || null,
      description_ar: form.description_ar.trim(),
      estimated_hours: parseFloat(form.estimated_hours) || 1,
      is_active: form.is_active,
      ...(topic ? { id: topic.id } : {}),
    };
    await upsert.mutateAsync(payload);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={topic ? 'Edit topic' : 'New topic'}
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
            {topic ? 'Save changes' : 'Create topic'}
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
              placeholder="Cavity preparation"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Arabic name</label>
            <Input
              value={form.name_ar}
              onChange={(e) => update('name_ar', e.target.value)}
              placeholder="تحضير التجاويف"
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
              rows={3}
              placeholder="What this topic covers"
              className="w-full rounded-lg border border-slate-200 text-sm px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Arabic description</label>
            <textarea
              value={form.description_ar}
              onChange={(e) => update('description_ar', e.target.value)}
              rows={3}
              placeholder="وصف الموضوع بالعربية"
              dir="rtl"
              className="w-full rounded-lg border border-slate-200 text-sm px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Estimated study hours</label>
            <Input
              type="number"
              min="0.5"
              max="100"
              step="0.5"
              value={form.estimated_hours}
              onChange={(e) => update('estimated_hours', e.target.value)}
              placeholder="1"
            />
          </div>
          <div className="flex items-end pb-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => update('is_active', e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-slate-700">Active (visible to students)</span>
            </label>
          </div>
        </div>
      </div>
    </Dialog>
  );
}

// ── Inline active toggle ─────────────────────────────────────────────

function ActiveToggle({ topic }: { topic: TopicRow }) {
  const upsert = useUpsertTopic();
  return (
    <button
      type="button"
      title={topic.is_active ? 'Deactivate' : 'Activate'}
      onClick={() => upsert.mutate({ ...topic, is_active: !topic.is_active })}
      disabled={upsert.isPending}
      className={`w-8 h-4 rounded-full transition-colors relative ${topic.is_active ? 'bg-green-400' : 'bg-slate-200'}`}
    >
      <span
        className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-all ${topic.is_active ? 'left-4' : 'left-0.5'}`}
      />
    </button>
  );
}

// ── Reorder helper ───────────────────────────────────────────────────

async function reorderTopics(orderedIds: string[]) {
  if (!supabase) return;
  try {
    await Promise.all(
      orderedIds.map((id, i) =>
        supabase!.from('topics').update({ display_order: i + 1 }).eq('id', id),
      ),
    );
  } catch {
    toast.error('Failed to reorder topics.');
  }
}

// ── AdminSubjectDetail page ──────────────────────────────────────────

export function AdminSubjectDetail() {
  const { subjectId = '' } = useParams<{ subjectId: string }>();

  const { data: subject, isLoading: subjectLoading } = useSubject(subjectId);
  const { data: topics, isLoading: topicsLoading, refetch: refetchTopics } = useTopicsBySubject(subjectId);
  const deleteTopic = useDeleteTopic();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<TopicRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TopicRow | null>(null);
  const [reordering, setReordering] = useState(false);

  const openCreate = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (t: TopicRow) => { setEditing(t); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditing(null); };

  const move = async (index: number, dir: -1 | 1) => {
    if (!topics) return;
    const ids = topics.map((t) => t.id);
    const newIndex = index + dir;
    if (newIndex < 0 || newIndex >= ids.length) return;
    [ids[index], ids[newIndex]] = [ids[newIndex], ids[index]];
    setReordering(true);
    await reorderTopics(ids);
    await refetchTopics();
    setReordering(false);
  };

  return (
    <AppShell role="admin" title={subject?.name ?? 'Subject detail'}>
      <PageContainer
        maxWidth="xl"
        breadcrumbs={[
          { label: 'Admin', href: ROUTES.adminDashboard },
          { label: 'Subjects', href: ROUTES.adminSubjects },
          { label: subject?.name ?? '…' },
        ]}
        actions={
          <Button color="primary" size="sm" onClick={openCreate} leftIcon={
            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z"/>
            </svg>
          }>
            Add topic
          </Button>
        }
      >
        {/* Subject card */}
        {subjectLoading ? (
          <Skeleton className="h-24 w-full rounded-xl mb-6" />
        ) : subject ? (
          <Card className="mb-6 flex items-start gap-4">
            <div
              className={`w-14 h-14 ${subject.color ?? 'bg-blue-500'} rounded-xl flex items-center justify-center text-2xl flex-shrink-0`}
            >
              {subject.icon ?? '📚'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-lg font-bold text-slate-900">{subject.name}</h1>
                {subject.name_ar && <span className="text-sm text-slate-400">{subject.name_ar}</span>}
                <Badge color="neutral" size="xs">{subject.exam_weight}% of exam</Badge>
                {!subject.is_active && <Badge color="warning" size="xs">Inactive</Badge>}
              </div>
              {subject.description && (
                <p className="text-sm text-slate-600 mt-1">{subject.description}</p>
              )}
            </div>
            <Link
              to={ROUTES.adminSubjects}
              className="text-xs text-blue-600 hover:underline shrink-0"
            >
              ← All subjects
            </Link>
          </Card>
        ) : null}

        {/* Topics list */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-slate-800">
            Topics
            {topics && <span className="ml-2 text-slate-400 font-normal text-sm">({topics.length})</span>}
          </h2>
        </div>

        {topicsLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 rounded-xl" />
            ))}
          </div>
        ) : (
          <Card className="divide-y divide-slate-100 overflow-hidden p-0">
            {(topics ?? []).length === 0 && (
              <div className="py-12 text-center text-slate-400">
                <p className="text-3xl mb-2">📝</p>
                <p className="font-medium text-slate-600">No topics yet</p>
                <Button size="sm" color="primary" onClick={openCreate} className="mt-3">
                  Add first topic
                </Button>
              </div>
            )}

            {(topics ?? []).map((topic, index) => (
              <div key={topic.id} className="grid grid-cols-[2rem_1fr_5rem_4rem_5rem_6rem] gap-3 items-center px-4 py-3">
                {/* Reorder */}
                <div className="flex flex-col gap-0.5">
                  <button
                    type="button"
                    onClick={() => move(index, -1)}
                    disabled={index === 0 || reordering}
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
                    disabled={index === (topics?.length ?? 0) - 1 || reordering}
                    className="p-0.5 text-slate-300 hover:text-slate-600 disabled:opacity-20"
                    aria-label="Move down"
                  >
                    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 8l5 5 5-5" />
                    </svg>
                  </button>
                </div>

                {/* Name */}
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{topic.name}</p>
                  {topic.name_ar && (
                    <p className="text-xs text-slate-400 truncate">{topic.name_ar}</p>
                  )}
                </div>

                {/* Hours */}
                <div className="text-xs text-slate-500 text-center">{topic.estimated_hours}h</div>

                {/* Active toggle */}
                <div className="flex justify-center">
                  <ActiveToggle topic={topic} />
                </div>

                {/* Subtopics link */}
                <Link
                  to={ROUTES.adminTopicDetail(subjectId, topic.id)}
                  className="text-xs text-blue-600 hover:underline font-medium text-center"
                >
                  Subtopics →
                </Link>

                {/* Actions */}
                <div className="flex items-center gap-1 justify-end">
                  <button
                    type="button"
                    onClick={() => openEdit(topic)}
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    aria-label="Edit topic"
                  >
                    <svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(topic)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    aria-label="Delete topic"
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

      <TopicModal open={modalOpen} onClose={closeModal} subjectId={subjectId} topic={editing} />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (deleteTarget) {
            await deleteTopic.mutateAsync({ topicId: deleteTarget.id, subjectId });
            setDeleteTarget(null);
          }
        }}
        loading={deleteTopic.isPending}
        title="Delete topic?"
        description={`"${deleteTarget?.name}" and all its subtopics and learning objectives will be permanently deleted.`}
        confirmLabel="Delete"
      />
    </AppShell>
  );
}
