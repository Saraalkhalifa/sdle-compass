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
import { Tabs, TabList, TabTrigger, TabPanel } from '@/components/ui/Tabs';
import { ROUTES } from '@/config/app';
import {
  useTopic,
  useSubtopicsWithObjectives,
  useUpsertSubtopic,
  useDeleteSubtopic,
  useUpsertLO,
  useDeleteLO,
  type SubtopicRow,
  type SubtopicWithObjectives,
  type LORow,
  type LOInsert,
  type SubtopicInsert,
} from '@/hooks/useSubjects';
import {
  useResourcesByTopic,
  useUpsertResource,
  useDeleteResource,
  type ResourceRow,
  type ResourceType,
  type ResourceInsert,
} from '@/hooks/useResources';
import {
  useQuestionsByTopic,
  useUpsertQuestion,
  useDeleteQuestion,
  type QuestionWithOptions,
  type QuestionInsert,
  type Difficulty,
  type OptionFormData,
} from '@/hooks/useQuestions';
import {
  useTopicNotes,
  useUpsertTopicNote,
  useDeleteTopicNote,
  type TopicNoteRow,
  type TopicNoteInsert,
} from '@/hooks/useNotes';
import {
  useFlashcardDecksByTopic,
  useFlashcardsByDeck,
  useUpsertDeck,
  useDeleteDeck,
  useUpsertCard,
  useDeleteCard,
  type DeckRow,
  type DeckInsert,
  type CardRow,
  type CardInsert,
} from '@/hooks/useFlashcards';

const BLOOM_LEVELS = ['knowledge', 'comprehension', 'application', 'analysis', 'synthesis', 'evaluation'] as const;
type BloomLevel = (typeof BLOOM_LEVELS)[number];

const BLOOM_COLORS: Record<BloomLevel, string> = {
  knowledge:      'bg-slate-100 text-slate-600',
  comprehension:  'bg-blue-100 text-blue-700',
  application:    'bg-emerald-100 text-emerald-700',
  analysis:       'bg-violet-100 text-violet-700',
  synthesis:      'bg-amber-100 text-amber-700',
  evaluation:     'bg-rose-100 text-rose-700',
};

// ── Subtopic form modal ──────────────────────────────────────────────

interface SubtopicFormData { name: string; name_ar: string; description: string; is_active: boolean; }
const EMPTY_SUBTOPIC: SubtopicFormData = { name: '', name_ar: '', description: '', is_active: true };

interface SubtopicModalProps { open: boolean; onClose: () => void; topicId: string; subtopic?: SubtopicRow | null; }

function SubtopicModal({ open, onClose, topicId, subtopic }: SubtopicModalProps) {
  const upsert = useUpsertSubtopic();
  const [form, setForm] = useState<SubtopicFormData>(EMPTY_SUBTOPIC);

  useEffect(() => {
    if (open) {
      setForm(subtopic
        ? { name: subtopic.name, name_ar: subtopic.name_ar, description: subtopic.description ?? '', is_active: subtopic.is_active }
        : EMPTY_SUBTOPIC);
    }
  }, [open, subtopic]);

  const handleSave = async () => {
    const payload: SubtopicInsert & { id?: string } = {
      topic_id: topicId,
      name: form.name.trim(),
      name_ar: form.name_ar.trim(),
      description: form.description.trim() || null,
      is_active: form.is_active,
      ...(subtopic ? { id: subtopic.id } : {}),
    };
    await upsert.mutateAsync(payload);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} title={subtopic ? 'Edit subtopic' : 'New subtopic'} size="md"
      footer={
        <>
          <Button variant="ghost" color="neutral" size="sm" onClick={onClose} disabled={upsert.isPending}>Cancel</Button>
          <Button size="sm" color="primary" onClick={handleSave} loading={upsert.isPending} disabled={!form.name.trim()}>
            {subtopic ? 'Save changes' : 'Create subtopic'}
          </Button>
        </>
      }
    >
      <div className="space-y-3 pt-2">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">English name *</label>
          <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Subtopic name" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Arabic name</label>
          <Input value={form.name_ar} onChange={(e) => setForm((p) => ({ ...p, name_ar: e.target.value }))} placeholder="اسم الموضوع الفرعي" dir="rtl" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Description</label>
          <textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} rows={2}
            placeholder="Optional description"
            className="w-full rounded-lg border border-slate-200 text-sm px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.is_active} onChange={(e) => setForm((p) => ({ ...p, is_active: e.target.checked }))}
            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
          <span className="text-sm text-slate-700">Active (visible to students)</span>
        </label>
      </div>
    </Dialog>
  );
}

// ── Learning objective form modal ────────────────────────────────────

interface LOFormData { text: string; text_ar: string; bloom_level: BloomLevel; }
const EMPTY_LO: LOFormData = { text: '', text_ar: '', bloom_level: 'knowledge' };

interface LOModalProps { open: boolean; onClose: () => void; topicId: string; subtopicId: string; lo?: LORow | null; }

function LOModal({ open, onClose, topicId, subtopicId, lo }: LOModalProps) {
  const upsert = useUpsertLO();
  const [form, setForm] = useState<LOFormData>(EMPTY_LO);

  useEffect(() => {
    if (open) setForm(lo ? { text: lo.text, text_ar: lo.text_ar, bloom_level: lo.bloom_level as BloomLevel } : EMPTY_LO);
  }, [open, lo]);

  const handleSave = async () => {
    const payload: LOInsert & { id?: string; topicId: string } = {
      subtopic_id: subtopicId, topicId,
      text: form.text.trim(), text_ar: form.text_ar.trim(), bloom_level: form.bloom_level,
      ...(lo ? { id: lo.id } : {}),
    };
    await upsert.mutateAsync(payload);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} title={lo ? 'Edit learning objective' : 'New learning objective'} size="md"
      footer={
        <>
          <Button variant="ghost" color="neutral" size="sm" onClick={onClose} disabled={upsert.isPending}>Cancel</Button>
          <Button size="sm" color="primary" onClick={handleSave} loading={upsert.isPending} disabled={!form.text.trim()}>
            {lo ? 'Save changes' : 'Add objective'}
          </Button>
        </>
      }
    >
      <div className="space-y-3 pt-2">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Objective text *</label>
          <textarea value={form.text} onChange={(e) => setForm((p) => ({ ...p, text: e.target.value }))} rows={2}
            placeholder="e.g. Identify the classifications of dental caries"
            className="w-full rounded-lg border border-slate-200 text-sm px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Arabic text</label>
          <textarea value={form.text_ar} onChange={(e) => setForm((p) => ({ ...p, text_ar: e.target.value }))} rows={2}
            placeholder="النص بالعربية" dir="rtl"
            className="w-full rounded-lg border border-slate-200 text-sm px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-2">Bloom's level</label>
          <div className="flex flex-wrap gap-2">
            {BLOOM_LEVELS.map((level) => (
              <button key={level} type="button" onClick={() => setForm((p) => ({ ...p, bloom_level: level }))}
                className={`text-xs px-2.5 py-1 rounded-lg font-medium capitalize transition-all ${
                  form.bloom_level === level
                    ? BLOOM_COLORS[level] + ' ring-2 ring-offset-1 ring-current'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}>
                {level}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Dialog>
  );
}

// ── Resource form modal ──────────────────────────────────────────────

interface ResourceFormData {
  type: ResourceType;
  title: string;
  title_ar: string;
  description: string;
  url: string;
  duration_mins: string;
  is_active: boolean;
}

const EMPTY_RESOURCE: ResourceFormData = {
  type: 'pdf', title: '', title_ar: '', description: '', url: '', duration_mins: '', is_active: true,
};

const RESOURCE_TYPE_LABELS: Record<ResourceType, string> = {
  pdf: 'PDF / Document',
  video: 'Video (YouTube / Vimeo)',
  link: 'External link',
};

interface ResourceModalProps { open: boolean; onClose: () => void; topicId: string; resource?: ResourceRow | null; }

function ResourceModal({ open, onClose, topicId, resource }: ResourceModalProps) {
  const upsert = useUpsertResource();
  const [form, setForm] = useState<ResourceFormData>(EMPTY_RESOURCE);

  useEffect(() => {
    if (open) {
      setForm(resource
        ? {
            type: resource.type,
            title: resource.title,
            title_ar: resource.title_ar,
            description: resource.description ?? '',
            url: resource.url,
            duration_mins: resource.duration_mins?.toString() ?? '',
            is_active: resource.is_active,
          }
        : EMPTY_RESOURCE);
    }
  }, [open, resource]);

  const handleSave = async () => {
    const payload: ResourceInsert & { id?: string } = {
      topic_id: topicId,
      type: form.type,
      title: form.title.trim(),
      title_ar: form.title_ar.trim(),
      description: form.description.trim() || null,
      url: form.url.trim(),
      duration_mins: form.duration_mins ? parseInt(form.duration_mins, 10) : null,
      is_active: form.is_active,
      ...(resource ? { id: resource.id } : {}),
    };
    await upsert.mutateAsync(payload);
    onClose();
  };

  const urlPlaceholder =
    form.type === 'video' ? 'https://www.youtube.com/watch?v=...' :
    form.type === 'pdf' ? 'https://example.com/document.pdf' :
    'https://example.com/resource';

  return (
    <Dialog open={open} onClose={onClose} title={resource ? 'Edit resource' : 'Add resource'} size="lg"
      footer={
        <>
          <Button variant="ghost" color="neutral" size="sm" onClick={onClose} disabled={upsert.isPending}>Cancel</Button>
          <Button size="sm" color="primary" onClick={handleSave} loading={upsert.isPending}
            disabled={!form.title.trim() || !form.url.trim()}>
            {resource ? 'Save changes' : 'Add resource'}
          </Button>
        </>
      }
    >
      <div className="space-y-4 pt-2">
        {/* Type selector */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-2">Resource type</label>
          <div className="grid grid-cols-3 gap-2">
            {(Object.entries(RESOURCE_TYPE_LABELS) as [ResourceType, string][]).map(([type, label]) => (
              <button key={type} type="button" onClick={() => setForm((p) => ({ ...p, type }))}
                className={`p-2.5 rounded-lg border-2 text-xs font-medium transition-all text-center ${
                  form.type === type ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-500 hover:border-slate-300'
                }`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Title *</label>
            <Input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} placeholder="Resource title" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Arabic title</label>
            <Input value={form.title_ar} onChange={(e) => setForm((p) => ({ ...p, title_ar: e.target.value }))} placeholder="العنوان بالعربية" dir="rtl" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">URL *</label>
          <Input value={form.url} onChange={(e) => setForm((p) => ({ ...p, url: e.target.value }))} placeholder={urlPlaceholder} type="url" />
          {form.type === 'video' && (
            <p className="text-xs text-slate-400 mt-1">Paste a YouTube or Vimeo URL — it will be embedded automatically.</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Description</label>
            <textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} rows={2}
              placeholder="Optional description"
              className="w-full rounded-lg border border-slate-200 text-sm px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              {form.type === 'video' ? 'Duration (minutes)' : 'Est. reading time (minutes)'}
            </label>
            <Input type="number" min="1" value={form.duration_mins}
              onChange={(e) => setForm((p) => ({ ...p, duration_mins: e.target.value }))} placeholder="e.g. 15" />
          </div>
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.is_active} onChange={(e) => setForm((p) => ({ ...p, is_active: e.target.checked }))}
            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
          <span className="text-sm text-slate-700">Active (visible to students)</span>
        </label>
      </div>
    </Dialog>
  );
}

// ── Subtopic section ─────────────────────────────────────────────────

interface SubtopicSectionProps {
  subtopic: SubtopicWithObjectives;
  topicId: string;
  onEditSubtopic: (s: SubtopicRow) => void;
  onDeleteSubtopic: (s: SubtopicRow) => void;
  onAddLO: (subtopicId: string) => void;
  onEditLO: (lo: LORow, subtopicId: string) => void;
  onDeleteLO: (lo: LORow) => void;
}

function SubtopicSection({
  subtopic, topicId: _topicId, onEditSubtopic, onDeleteSubtopic, onAddLO, onEditLO, onDeleteLO,
}: SubtopicSectionProps) {
  const [open, setOpen] = useState(true);

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3 bg-slate-50">
        <button type="button" onClick={() => setOpen((p) => !p)} className="flex items-center gap-2 flex-1 text-left min-w-0">
          <svg className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${open ? 'rotate-90' : ''}`}
            viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          <div className="min-w-0">
            <span className="text-sm font-semibold text-slate-800">{subtopic.name}</span>
            {subtopic.name_ar && <span className="text-xs text-slate-400 ml-2">{subtopic.name_ar}</span>}
          </div>
          <Badge color="neutral" size="xs" className="ml-auto shrink-0">{subtopic.learning_objectives.length} LOs</Badge>
        </button>
        <div className="flex items-center gap-1 shrink-0">
          <button type="button" onClick={() => onAddLO(subtopic.id)} title="Add LO"
            className="p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
            <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z"/>
            </svg>
          </button>
          <button type="button" onClick={() => onEditSubtopic(subtopic)} title="Edit"
            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
            <svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
            </svg>
          </button>
          <button type="button" onClick={() => onDeleteSubtopic(subtopic)} title="Delete"
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
            <svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
          </button>
        </div>
      </div>
      {open && (
        <div className="px-4 pb-3 pt-2 space-y-2">
          {subtopic.learning_objectives.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-2">
              No learning objectives yet.{' '}
              <button type="button" className="text-blue-600 hover:underline" onClick={() => onAddLO(subtopic.id)}>Add one</button>
            </p>
          ) : (
            subtopic.learning_objectives.map((lo, i) => (
              <div key={lo.id} className="flex items-start gap-2.5 group">
                <span className="text-xs text-slate-300 font-mono mt-0.5 w-4 shrink-0">{i + 1}.</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium uppercase tracking-wide shrink-0 mt-0.5 ${BLOOM_COLORS[lo.bloom_level as BloomLevel] ?? BLOOM_COLORS.knowledge}`}>
                  {lo.bloom_level.slice(0, 3)}
                </span>
                <span className="text-sm text-slate-700 flex-1 leading-snug">{lo.text}</span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button type="button" onClick={() => onEditLO(lo, subtopic.id)} title="Edit"
                    className="p-1 text-slate-400 hover:text-blue-600 rounded transition-colors">
                    <svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                    </svg>
                  </button>
                  <button type="button" onClick={() => onDeleteLO(lo)} title="Delete"
                    className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors">
                    <svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ── Question form modal ──────────────────────────────────────────────

const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  easy:   'border-emerald-400 bg-emerald-50 text-emerald-700',
  medium: 'border-amber-400   bg-amber-50   text-amber-700',
  hard:   'border-red-400     bg-red-50     text-red-700',
};

const EMPTY_OPTION: OptionFormData = { text: '', text_ar: '', is_correct: false };
const DEFAULT_OPTIONS: OptionFormData[] = [
  { text: '', text_ar: '', is_correct: true },
  { text: '', text_ar: '', is_correct: false },
  { text: '', text_ar: '', is_correct: false },
  { text: '', text_ar: '', is_correct: false },
];
const OPTION_LABELS = ['A', 'B', 'C', 'D'];

interface QuestionFormData {
  question_text: string;
  question_text_ar: string;
  explanation: string;
  explanation_ar: string;
  difficulty: Difficulty;
  is_active: boolean;
  options: OptionFormData[];
}

const EMPTY_QUESTION: QuestionFormData = {
  question_text: '', question_text_ar: '', explanation: '', explanation_ar: '',
  difficulty: 'medium', is_active: true,
  options: DEFAULT_OPTIONS.map((o) => ({ ...o })),
};

interface QuestionModalProps { open: boolean; onClose: () => void; topicId: string; question?: QuestionWithOptions | null; }

function QuestionModal({ open, onClose, topicId, question }: QuestionModalProps) {
  const upsert = useUpsertQuestion();
  const [form, setForm] = useState<QuestionFormData>(EMPTY_QUESTION);

  useEffect(() => {
    if (open) {
      if (question) {
        const opts = question.question_options.length > 0
          ? question.question_options.map((o) => ({ text: o.option_text, text_ar: o.option_text_ar, is_correct: o.is_correct }))
          : DEFAULT_OPTIONS.map((o) => ({ ...o }));
        setForm({
          question_text: question.question_text,
          question_text_ar: question.question_text_ar,
          explanation: question.explanation ?? '',
          explanation_ar: question.explanation_ar ?? '',
          difficulty: question.difficulty,
          is_active: question.is_active,
          options: opts,
        });
      } else {
        setForm({ ...EMPTY_QUESTION, options: DEFAULT_OPTIONS.map((o) => ({ ...o })) });
      }
    }
  }, [open, question]);

  const setOptionCorrect = (idx: number) => {
    setForm((p) => ({ ...p, options: p.options.map((o, i) => ({ ...o, is_correct: i === idx })) }));
  };

  const updateOption = (idx: number, field: keyof OptionFormData, value: string | boolean) => {
    setForm((p) => ({ ...p, options: p.options.map((o, i) => i === idx ? { ...o, [field]: value } : o) }));
  };

  const canSave = form.question_text.trim() && form.options.every((o) => o.text.trim()) && form.options.some((o) => o.is_correct);

  const handleSave = async () => {
    const q: QuestionInsert & { id?: string } = {
      topic_id: topicId,
      question_text: form.question_text.trim(),
      question_text_ar: form.question_text_ar.trim(),
      explanation: form.explanation.trim() || null,
      explanation_ar: form.explanation_ar.trim() || null,
      difficulty: form.difficulty,
      is_active: form.is_active,
      ...(question ? { id: question.id } : {}),
    };
    await upsert.mutateAsync({ question: q, options: form.options });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} title={question ? 'Edit question' : 'New question'} size="xl"
      footer={
        <>
          <Button variant="ghost" color="neutral" size="sm" onClick={onClose} disabled={upsert.isPending}>Cancel</Button>
          <Button size="sm" color="primary" onClick={handleSave} loading={upsert.isPending} disabled={!canSave}>
            {question ? 'Save changes' : 'Create question'}
          </Button>
        </>
      }
    >
      <div className="space-y-5 pt-2">
        {/* Question text */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Question text *</label>
            <textarea value={form.question_text} onChange={(e) => setForm((p) => ({ ...p, question_text: e.target.value }))} rows={3}
              placeholder="Which of the following best describes…?"
              className="w-full rounded-lg border border-slate-200 text-sm px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Question (Arabic)</label>
            <textarea value={form.question_text_ar} onChange={(e) => setForm((p) => ({ ...p, question_text_ar: e.target.value }))} rows={3}
              placeholder="السؤال بالعربية" dir="rtl"
              className="w-full rounded-lg border border-slate-200 text-sm px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed" />
          </div>
        </div>

        {/* Difficulty */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-2">Difficulty</label>
          <div className="flex gap-2">
            {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
              <button key={d} type="button" onClick={() => setForm((p) => ({ ...p, difficulty: d }))}
                className={`px-4 py-1.5 rounded-lg border-2 text-xs font-semibold capitalize transition-all ${
                  form.difficulty === d ? DIFFICULTY_COLORS[d] : 'border-slate-200 text-slate-400 hover:border-slate-300'
                }`}>
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Options */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-2">
            Answer options * <span className="text-slate-400 font-normal">(click the circle to mark the correct answer)</span>
          </label>
          <div className="space-y-2">
            {form.options.map((opt, i) => (
              <div key={i} className="flex items-start gap-2">
                {/* Correct radio */}
                <button type="button" onClick={() => setOptionCorrect(i)}
                  className={`mt-2.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                    opt.is_correct ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300 hover:border-emerald-400'
                  }`}>
                  {opt.is_correct && <div className="w-2 h-2 rounded-full bg-white" />}
                </button>
                <span className="mt-2.5 text-xs font-bold text-slate-400 w-4 shrink-0">{OPTION_LABELS[i]}</span>
                <div className="flex-1 grid grid-cols-2 gap-2">
                  <Input value={opt.text} onChange={(e) => updateOption(i, 'text', e.target.value)}
                    placeholder={`Option ${OPTION_LABELS[i]} (English)`} />
                  <Input value={opt.text_ar} onChange={(e) => updateOption(i, 'text_ar', e.target.value)}
                    placeholder={`الخيار ${OPTION_LABELS[i]}`} dir="rtl" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Explanation */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Explanation (shown after answer)</label>
            <textarea value={form.explanation} onChange={(e) => setForm((p) => ({ ...p, explanation: e.target.value }))} rows={3}
              placeholder="The correct answer is… because…"
              className="w-full rounded-lg border border-slate-200 text-sm px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Explanation (Arabic)</label>
            <textarea value={form.explanation_ar} onChange={(e) => setForm((p) => ({ ...p, explanation_ar: e.target.value }))} rows={3}
              placeholder="الشرح بالعربية" dir="rtl"
              className="w-full rounded-lg border border-slate-200 text-sm px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed" />
          </div>
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.is_active} onChange={(e) => setForm((p) => ({ ...p, is_active: e.target.checked }))}
            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
          <span className="text-sm text-slate-700">Active (visible to students)</span>
        </label>
      </div>
    </Dialog>
  );
}

// ── Study note form modal ─────────────────────────────────────────────

interface NoteFormData { title: string; title_ar: string; content: string; content_ar: string; is_active: boolean; }
const EMPTY_NOTE: NoteFormData = { title: '', title_ar: '', content: '', content_ar: '', is_active: true };

interface NoteModalProps { open: boolean; onClose: () => void; topicId: string; note?: TopicNoteRow | null; }

function NoteModal({ open, onClose, topicId, note }: NoteModalProps) {
  const upsert = useUpsertTopicNote();
  const [form, setForm] = useState<NoteFormData>(EMPTY_NOTE);

  useEffect(() => {
    if (open) setForm(note
      ? { title: note.title, title_ar: note.title_ar, content: note.content, content_ar: note.content_ar, is_active: note.is_active }
      : EMPTY_NOTE);
  }, [open, note]);

  const handleSave = async () => {
    const payload: TopicNoteInsert & { id?: string } = {
      topic_id: topicId, title: form.title.trim(), title_ar: form.title_ar.trim(),
      content: form.content.trim(), content_ar: form.content_ar.trim(), is_active: form.is_active,
      ...(note ? { id: note.id } : {}),
    };
    await upsert.mutateAsync(payload);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} title={note ? 'Edit study note' : 'New study note'} size="xl"
      footer={
        <>
          <Button variant="ghost" color="neutral" size="sm" onClick={onClose} disabled={upsert.isPending}>Cancel</Button>
          <Button size="sm" color="primary" onClick={handleSave} loading={upsert.isPending} disabled={!form.title.trim()}>
            {note ? 'Save changes' : 'Create note'}
          </Button>
        </>
      }
    >
      <div className="space-y-4 pt-2">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Title *</label>
            <Input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} placeholder="e.g. Classification of Dental Caries" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Arabic title</label>
            <Input value={form.title_ar} onChange={(e) => setForm((p) => ({ ...p, title_ar: e.target.value }))} placeholder="العنوان بالعربية" dir="rtl" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Content (English)</label>
          <textarea value={form.content} onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))} rows={8}
            placeholder="Write the study note content here. Line breaks are preserved."
            className="w-full rounded-lg border border-slate-200 text-sm px-3 py-2 resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Content (Arabic)</label>
          <textarea value={form.content_ar} onChange={(e) => setForm((p) => ({ ...p, content_ar: e.target.value }))} rows={4}
            placeholder="المحتوى بالعربية (اختياري)" dir="rtl"
            className="w-full rounded-lg border border-slate-200 text-sm px-3 py-2 resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed" />
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.is_active} onChange={(e) => setForm((p) => ({ ...p, is_active: e.target.checked }))}
            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
          <span className="text-sm text-slate-700">Active (visible to students)</span>
        </label>
      </div>
    </Dialog>
  );
}

// ── Deck form modal ──────────────────────────────────────────────────

interface DeckFormData { name: string; name_ar: string; description: string; is_active: boolean; }
const EMPTY_DECK: DeckFormData = { name: '', name_ar: '', description: '', is_active: true };

interface DeckModalProps { open: boolean; onClose: () => void; topicId: string; deck?: DeckRow | null; }

function DeckModal({ open, onClose, topicId, deck }: DeckModalProps) {
  const upsert = useUpsertDeck();
  const [form, setForm] = useState<DeckFormData>(EMPTY_DECK);

  useEffect(() => {
    if (open) setForm(deck
      ? { name: deck.name, name_ar: deck.name_ar, description: deck.description ?? '', is_active: deck.is_active }
      : EMPTY_DECK);
  }, [open, deck]);

  const handleSave = async () => {
    const payload: DeckInsert & { id?: string } = {
      topic_id: topicId, name: form.name.trim(), name_ar: form.name_ar.trim(),
      description: form.description.trim() || null, is_active: form.is_active,
      ...(deck ? { id: deck.id } : {}),
    };
    await upsert.mutateAsync(payload);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} title={deck ? 'Edit deck' : 'New flashcard deck'} size="md"
      footer={
        <>
          <Button variant="ghost" color="neutral" size="sm" onClick={onClose} disabled={upsert.isPending}>Cancel</Button>
          <Button size="sm" color="primary" onClick={handleSave} loading={upsert.isPending} disabled={!form.name.trim()}>
            {deck ? 'Save changes' : 'Create deck'}
          </Button>
        </>
      }
    >
      <div className="space-y-3 pt-2">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Deck name *</label>
          <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="e.g. Key terms — Dental Caries" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Arabic name</label>
          <Input value={form.name_ar} onChange={(e) => setForm((p) => ({ ...p, name_ar: e.target.value }))} placeholder="الاسم بالعربية" dir="rtl" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Description</label>
          <textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} rows={2}
            placeholder="Optional description"
            className="w-full rounded-lg border border-slate-200 text-sm px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.is_active} onChange={(e) => setForm((p) => ({ ...p, is_active: e.target.checked }))}
            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
          <span className="text-sm text-slate-700">Active (visible to students)</span>
        </label>
      </div>
    </Dialog>
  );
}

// ── Card form modal ──────────────────────────────────────────────────

interface CardFormData { front_text: string; front_text_ar: string; back_text: string; back_text_ar: string; hint: string; }
const EMPTY_CARD: CardFormData = { front_text: '', front_text_ar: '', back_text: '', back_text_ar: '', hint: '' };

interface CardModalProps { open: boolean; onClose: () => void; deckId: string; card?: CardRow | null; }

function CardModal({ open, onClose, deckId, card }: CardModalProps) {
  const upsert = useUpsertCard();
  const [form, setForm] = useState<CardFormData>(EMPTY_CARD);

  useEffect(() => {
    if (open) setForm(card
      ? { front_text: card.front_text, front_text_ar: card.front_text_ar, back_text: card.back_text, back_text_ar: card.back_text_ar, hint: card.hint ?? '' }
      : EMPTY_CARD);
  }, [open, card]);

  const handleSave = async () => {
    const payload: CardInsert & { id?: string } = {
      deck_id: deckId,
      front_text: form.front_text.trim(),
      front_text_ar: form.front_text_ar.trim(),
      back_text: form.back_text.trim(),
      back_text_ar: form.back_text_ar.trim(),
      hint: form.hint.trim() || null,
      ...(card ? { id: card.id } : {}),
    };
    await upsert.mutateAsync(payload);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} title={card ? 'Edit card' : 'New card'} size="lg"
      footer={
        <>
          <Button variant="ghost" color="neutral" size="sm" onClick={onClose} disabled={upsert.isPending}>Cancel</Button>
          <Button size="sm" color="primary" onClick={handleSave} loading={upsert.isPending}
            disabled={!form.front_text.trim() || !form.back_text.trim()}>
            {card ? 'Save changes' : 'Add card'}
          </Button>
        </>
      }
    >
      <div className="space-y-4 pt-2">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Front (question / concept) *</label>
            <textarea value={form.front_text} onChange={(e) => setForm((p) => ({ ...p, front_text: e.target.value }))} rows={3}
              placeholder="What is the enamel composed of?"
              className="w-full rounded-lg border border-slate-200 text-sm px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Front (Arabic)</label>
            <textarea value={form.front_text_ar} onChange={(e) => setForm((p) => ({ ...p, front_text_ar: e.target.value }))} rows={3}
              placeholder="السؤال بالعربية" dir="rtl"
              className="w-full rounded-lg border border-slate-200 text-sm px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Back (answer / explanation) *</label>
            <textarea value={form.back_text} onChange={(e) => setForm((p) => ({ ...p, back_text: e.target.value }))} rows={3}
              placeholder="Hydroxyapatite crystals (96% mineral by weight)…"
              className="w-full rounded-lg border border-slate-200 text-sm px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Back (Arabic)</label>
            <textarea value={form.back_text_ar} onChange={(e) => setForm((p) => ({ ...p, back_text_ar: e.target.value }))} rows={3}
              placeholder="الجواب بالعربية" dir="rtl"
              className="w-full rounded-lg border border-slate-200 text-sm px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Hint (optional)</label>
          <Input value={form.hint} onChange={(e) => setForm((p) => ({ ...p, hint: e.target.value }))} placeholder="Think about the mineral content…" />
        </div>
      </div>
    </Dialog>
  );
}

// ── Deck section (accordion) ─────────────────────────────────────────

interface DeckSectionProps {
  deck: DeckRow;
  topicId: string;
  onEditDeck: (d: DeckRow) => void;
  onDeleteDeck: (d: DeckRow) => void;
  onAddCard: (deckId: string) => void;
  onEditCard: (card: CardRow, deckId: string) => void;
  onDeleteCard: (card: CardRow, deckId: string) => void;
}

function DeckSection({ deck, topicId: _topicId, onEditDeck, onDeleteDeck, onAddCard, onEditCard, onDeleteCard }: DeckSectionProps) {
  const [open, setOpen] = useState(true);
  const { data: cards } = useFlashcardsByDeck(deck.id);
  const deleteCard = useDeleteCard();
  const [deleteCardTarget, setDeleteCardTarget] = useState<CardRow | null>(null);

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3 bg-slate-50">
        <button type="button" onClick={() => setOpen((p) => !p)} className="flex items-center gap-2 flex-1 text-left min-w-0">
          <svg className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${open ? 'rotate-90' : ''}`}
            viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-sm font-semibold text-slate-800">{deck.name}</span>
          {deck.name_ar && <span className="text-xs text-slate-400">{deck.name_ar}</span>}
          <Badge color="neutral" size="xs" className="ml-auto shrink-0">{cards?.length ?? 0} cards</Badge>
          {!deck.is_active && <Badge color="warning" size="xs">Hidden</Badge>}
        </button>
        <div className="flex items-center gap-1 shrink-0">
          <button type="button" onClick={() => onAddCard(deck.id)} title="Add card"
            className="p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
            <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z"/>
            </svg>
          </button>
          <button type="button" onClick={() => onEditDeck(deck)} title="Edit"
            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
            <svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
            </svg>
          </button>
          <button type="button" onClick={() => onDeleteDeck(deck)} title="Delete"
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
            <svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
          </button>
        </div>
      </div>
      {open && (
        <div className="px-4 pb-3 pt-2 space-y-2">
          {(!cards || cards.length === 0) ? (
            <p className="text-xs text-slate-400 italic py-2">
              No cards yet.{' '}
              <button type="button" className="text-blue-600 hover:underline" onClick={() => onAddCard(deck.id)}>Add one</button>
            </p>
          ) : (
            cards.map((card, i) => (
              <div key={card.id} className="flex items-start gap-2.5 group">
                <span className="text-xs text-slate-300 font-mono mt-0.5 w-4 shrink-0">{i + 1}.</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-700 font-medium truncate">{card.front_text}</p>
                  <p className="text-xs text-slate-400 truncate">{card.back_text}</p>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button type="button" onClick={() => onEditCard(card, deck.id)}
                    className="p-1 text-slate-400 hover:text-blue-600 rounded transition-colors">
                    <svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                    </svg>
                  </button>
                  <button type="button" onClick={() => setDeleteCardTarget(card)}
                    className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors">
                    <svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <ConfirmDialog open={!!deleteCardTarget} onClose={() => setDeleteCardTarget(null)}
        onConfirm={async () => {
          if (deleteCardTarget) { await deleteCard.mutateAsync({ id: deleteCardTarget.id, deckId: deck.id }); setDeleteCardTarget(null); }
        }}
        loading={deleteCard.isPending} title="Delete card?"
        description={`"${deleteCardTarget?.front_text}" will be permanently deleted.`}
        confirmLabel="Delete" />
    </div>
  );
}

// ── Resource type icons ──────────────────────────────────────────────

const RESOURCE_ICON: Record<ResourceType, React.ReactNode> = {
  pdf: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="1.8" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/>
    </svg>
  ),
  video: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="1.8" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z"/>
    </svg>
  ),
  link: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.8" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244"/>
    </svg>
  ),
};

// ── AdminTopicDetail page ────────────────────────────────────────────

export function AdminTopicDetail() {
  const { subjectId = '', topicId = '' } = useParams<{ subjectId: string; topicId: string }>();

  const { data: topic, isLoading: topicLoading } = useTopic(topicId);
  const { data: subtopics, isLoading: subtopicsLoading } = useSubtopicsWithObjectives(topicId);
  const { data: resources, isLoading: resourcesLoading } = useResourcesByTopic(topicId);
  const { data: decks, isLoading: decksLoading } = useFlashcardDecksByTopic(topicId);
  const { data: topicNotes, isLoading: notesLoading } = useTopicNotes(topicId);
  const deleteNote = useDeleteTopicNote();
  const { data: questions, isLoading: questionsLoading } = useQuestionsByTopic(topicId);
  const deleteQuestion = useDeleteQuestion();
  const deleteSubtopic = useDeleteSubtopic();
  const deleteLO = useDeleteLO();
  const deleteResource = useDeleteResource();
  const deleteDeck = useDeleteDeck();

  const [activeTab, setActiveTab] = useState('subtopics');

  // Subtopic state
  const [subtopicModal, setSubtopicModal] = useState(false);
  const [editingSubtopic, setEditingSubtopic] = useState<SubtopicRow | null>(null);
  const [deleteSubtopicTarget, setDeleteSubtopicTarget] = useState<SubtopicRow | null>(null);

  // LO state
  const [loModal, setLOModal] = useState(false);
  const [loSubtopicId, setLOSubtopicId] = useState('');
  const [editingLO, setEditingLO] = useState<LORow | null>(null);
  const [deleteLOTarget, setDeleteLOTarget] = useState<LORow | null>(null);

  // Resource state
  const [resourceModal, setResourceModal] = useState(false);
  const [editingResource, setEditingResource] = useState<ResourceRow | null>(null);
  const [deleteResourceTarget, setDeleteResourceTarget] = useState<ResourceRow | null>(null);

  // Question state
  const [questionModal, setQuestionModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuestionWithOptions | null>(null);
  const [deleteQuestionTarget, setDeleteQuestionTarget] = useState<QuestionWithOptions | null>(null);

  // Note state
  const [noteModal, setNoteModal] = useState(false);
  const [editingNote, setEditingNote] = useState<TopicNoteRow | null>(null);
  const [deleteNoteTarget, setDeleteNoteTarget] = useState<TopicNoteRow | null>(null);

  // Deck state
  const [deckModal, setDeckModal] = useState(false);
  const [editingDeck, setEditingDeck] = useState<DeckRow | null>(null);
  const [deleteDeckTarget, setDeleteDeckTarget] = useState<DeckRow | null>(null);

  // Card state
  const [cardModal, setCardModal] = useState(false);
  const [cardDeckId, setCardDeckId] = useState('');
  const [editingCard, setEditingCard] = useState<CardRow | null>(null);

  const openNewSubtopic = () => { setEditingSubtopic(null); setSubtopicModal(true); };
  const openEditSubtopic = (s: SubtopicRow) => { setEditingSubtopic(s); setSubtopicModal(true); };
  const closeSubtopicModal = () => { setSubtopicModal(false); setEditingSubtopic(null); };

  const openNewLO = (subtopicId: string) => { setLOSubtopicId(subtopicId); setEditingLO(null); setLOModal(true); };
  const openEditLO = (lo: LORow, subtopicId: string) => { setLOSubtopicId(subtopicId); setEditingLO(lo); setLOModal(true); };
  const closeLOModal = () => { setLOModal(false); setEditingLO(null); setLOSubtopicId(''); };

  const openNewResource = () => { setEditingResource(null); setResourceModal(true); };
  const openEditResource = (r: ResourceRow) => { setEditingResource(r); setResourceModal(true); };
  const closeResourceModal = () => { setResourceModal(false); setEditingResource(null); };

  const openNewQuestion = () => { setEditingQuestion(null); setQuestionModal(true); };
  const openEditQuestion = (q: QuestionWithOptions) => { setEditingQuestion(q); setQuestionModal(true); };
  const closeQuestionModal = () => { setQuestionModal(false); setEditingQuestion(null); };

  const openNewNote = () => { setEditingNote(null); setNoteModal(true); };
  const openEditNote = (n: TopicNoteRow) => { setEditingNote(n); setNoteModal(true); };
  const closeNoteModal = () => { setNoteModal(false); setEditingNote(null); };

  const openNewDeck = () => { setEditingDeck(null); setDeckModal(true); };
  const openEditDeck = (d: DeckRow) => { setEditingDeck(d); setDeckModal(true); };
  const closeDeckModal = () => { setDeckModal(false); setEditingDeck(null); };

  const openAddCard = (deckId: string) => { setCardDeckId(deckId); setEditingCard(null); setCardModal(true); };
  const openEditCard = (card: CardRow, deckId: string) => { setCardDeckId(deckId); setEditingCard(card); setCardModal(true); };
  const closeCardModal = () => { setCardModal(false); setEditingCard(null); setCardDeckId(''); };

  const subject = topic?.subjects;

  const PLUS_ICON = (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z"/>
    </svg>
  );

  const addButton = activeTab === 'resources' ? (
    <Button color="primary" size="sm" onClick={openNewResource} leftIcon={PLUS_ICON}>Add resource</Button>
  ) : activeTab === 'flashcards' ? (
    <Button color="primary" size="sm" onClick={openNewDeck} leftIcon={PLUS_ICON}>Add deck</Button>
  ) : activeTab === 'notes' ? (
    <Button color="primary" size="sm" onClick={openNewNote} leftIcon={PLUS_ICON}>Add note</Button>
  ) : activeTab === 'questions' ? (
    <Button color="primary" size="sm" onClick={openNewQuestion} leftIcon={PLUS_ICON}>Add question</Button>
  ) : (
    <Button color="primary" size="sm" onClick={openNewSubtopic} leftIcon={PLUS_ICON}>Add subtopic</Button>
  );

  return (
    <AppShell role="admin" title={topic?.name ?? 'Topic detail'}>
      <PageContainer
        maxWidth="xl"
        breadcrumbs={[
          { label: 'Admin', href: ROUTES.adminDashboard },
          { label: 'Subjects', href: ROUTES.adminSubjects },
          { label: subject?.name ?? '…', href: ROUTES.adminSubjectDetail(subjectId) },
          { label: topic?.name ?? '…' },
        ]}
        actions={addButton}
      >
        {/* Topic header */}
        {topicLoading ? (
          <Skeleton className="h-20 w-full rounded-xl mb-6" />
        ) : topic ? (
          <Card className="mb-6 flex items-start gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-lg font-bold text-slate-900">{topic.name}</h1>
                {topic.name_ar && <span className="text-sm text-slate-400">{topic.name_ar}</span>}
                <Badge color="neutral" size="xs">{topic.estimated_hours}h</Badge>
                {!topic.is_active && <Badge color="warning" size="xs">Inactive</Badge>}
              </div>
              {topic.description && <p className="text-sm text-slate-600 mt-1">{topic.description}</p>}
              {subject && (
                <p className="text-xs text-slate-400 mt-1">
                  Part of{' '}
                  <Link to={ROUTES.adminSubjectDetail(subjectId)} className="text-blue-600 hover:underline">
                    {subject.name}
                  </Link>
                </p>
              )}
            </div>
          </Card>
        ) : null}

        {/* Tabs */}
        <Tabs value={activeTab} onChange={setActiveTab}>
          <TabList className="mb-6">
            <TabTrigger value="subtopics"
              badge={subtopics ? subtopics.length : undefined}>
              Subtopics & LOs
            </TabTrigger>
            <TabTrigger value="resources"
              badge={resources ? resources.length : undefined}>
              Resources
            </TabTrigger>
            <TabTrigger value="flashcards"
              badge={decks ? decks.length : undefined}>
              Flashcard Decks
            </TabTrigger>
            <TabTrigger value="notes"
              badge={topicNotes ? topicNotes.length : undefined}>
              Study Notes
            </TabTrigger>
            <TabTrigger value="questions"
              badge={questions ? questions.length : undefined}>
              Questions
            </TabTrigger>
          </TabList>

          {/* Subtopics & LOs panel */}
          <TabPanel value="subtopics">
            {subtopicsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
              </div>
            ) : (subtopics ?? []).length === 0 ? (
              <div className="py-12 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
                <p className="text-3xl mb-2">📝</p>
                <p className="font-medium text-slate-600">No subtopics yet</p>
                <p className="text-sm mt-1 mb-4">Break this topic into subtopics and add learning objectives.</p>
                <Button size="sm" color="primary" onClick={openNewSubtopic}>Add first subtopic</Button>
              </div>
            ) : (
              <div className="space-y-3">
                {subtopics!.map((st) => (
                  <SubtopicSection key={st.id} subtopic={st} topicId={topicId}
                    onEditSubtopic={openEditSubtopic}
                    onDeleteSubtopic={(s) => setDeleteSubtopicTarget(s)}
                    onAddLO={openNewLO} onEditLO={openEditLO}
                    onDeleteLO={(lo) => setDeleteLOTarget(lo)}
                  />
                ))}
              </div>
            )}
          </TabPanel>

          {/* Resources panel */}
          <TabPanel value="resources">
            {resourcesLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)}
              </div>
            ) : (resources ?? []).length === 0 ? (
              <div className="py-12 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
                <p className="text-3xl mb-2">📎</p>
                <p className="font-medium text-slate-600">No resources yet</p>
                <p className="text-sm mt-1 mb-4">Add PDFs, videos, or links for students to use.</p>
                <Button size="sm" color="primary" onClick={openNewResource}>Add first resource</Button>
              </div>
            ) : (
              <Card className="divide-y divide-slate-100 overflow-hidden p-0">
                {resources!.map((r) => (
                  <div key={r.id} className="flex items-center gap-3 px-4 py-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      r.type === 'pdf' ? 'bg-red-50' : r.type === 'video' ? 'bg-violet-50' : 'bg-blue-50'
                    }`}>
                      {RESOURCE_ICON[r.type]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{r.title}</p>
                      <p className="text-xs text-slate-400 truncate">{r.url}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {r.duration_mins && (
                        <span className="text-xs text-slate-400">{r.duration_mins}m</span>
                      )}
                      <Badge color="neutral" size="xs">{r.type.toUpperCase()}</Badge>
                      {!r.is_active && <Badge color="warning" size="xs">Hidden</Badge>}
                      <button type="button" onClick={() => openEditResource(r)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                        <svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                        </svg>
                      </button>
                      <button type="button" onClick={() => setDeleteResourceTarget(r)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                        <svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </Card>
            )}
          </TabPanel>

          {/* Flashcard Decks panel */}
          <TabPanel value="flashcards">
            {decksLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
              </div>
            ) : (decks ?? []).length === 0 ? (
              <div className="py-12 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
                <p className="text-3xl mb-2">🃏</p>
                <p className="font-medium text-slate-600">No flashcard decks yet</p>
                <p className="text-sm mt-1 mb-4">Create decks to help students study key concepts.</p>
                <Button size="sm" color="primary" onClick={openNewDeck}>Add first deck</Button>
              </div>
            ) : (
              <div className="space-y-3">
                {decks!.map((deck) => (
                  <DeckSection key={deck.id} deck={deck} topicId={topicId}
                    onEditDeck={openEditDeck}
                    onDeleteDeck={(d) => setDeleteDeckTarget(d)}
                    onAddCard={openAddCard}
                    onEditCard={openEditCard}
                    onDeleteCard={(_card, _deckId) => {}}
                  />
                ))}
              </div>
            )}
          </TabPanel>

          {/* Study Notes panel */}
          <TabPanel value="notes">
            {notesLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
              </div>
            ) : (topicNotes ?? []).length === 0 ? (
              <div className="py-12 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
                <p className="text-3xl mb-2">📝</p>
                <p className="font-medium text-slate-600">No study notes yet</p>
                <p className="text-sm mt-1 mb-4">Add curated notes and summaries for students to reference.</p>
                <Button size="sm" color="primary" onClick={openNewNote}>Add first note</Button>
              </div>
            ) : (
              <div className="space-y-3">
                {topicNotes!.map((note) => (
                  <div key={note.id} className="border border-slate-200 rounded-xl overflow-hidden">
                    <div className="flex items-start gap-3 px-4 py-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800">{note.title}</p>
                        {note.title_ar && <p className="text-xs text-slate-400" dir="rtl">{note.title_ar}</p>}
                        {note.content && (
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2 whitespace-pre-wrap">{note.content}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0 ml-2">
                        {!note.is_active && <Badge color="warning" size="xs">Hidden</Badge>}
                        <button type="button" onClick={() => openEditNote(note)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                          <svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                          </svg>
                        </button>
                        <button type="button" onClick={() => setDeleteNoteTarget(note)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                          <svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabPanel>

          {/* Questions panel */}
          <TabPanel value="questions">
            {questionsLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
              </div>
            ) : (questions ?? []).length === 0 ? (
              <div className="py-12 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
                <p className="text-3xl mb-2">❓</p>
                <p className="font-medium text-slate-600">No questions yet</p>
                <p className="text-sm mt-1 mb-4">Add MCQ practice questions for students to attempt.</p>
                <Button size="sm" color="primary" onClick={openNewQuestion}>Add first question</Button>
              </div>
            ) : (
              <div className="space-y-2">
                {questions!.map((q, idx) => (
                  <div key={q.id} className="border border-slate-200 rounded-xl px-4 py-3 flex items-start gap-3">
                    <span className="text-xs text-slate-300 font-mono mt-0.5 w-5 shrink-0">{idx + 1}.</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 leading-snug">{q.question_text}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold uppercase ${
                          q.difficulty === 'easy' ? 'bg-emerald-100 text-emerald-700' :
                          q.difficulty === 'hard' ? 'bg-red-100 text-red-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>{q.difficulty}</span>
                        <span className="text-xs text-slate-400">{q.question_options.length} options</span>
                        {!q.is_active && <Badge color="warning" size="xs">Hidden</Badge>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button type="button" onClick={() => openEditQuestion(q)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                        <svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                        </svg>
                      </button>
                      <button type="button" onClick={() => setDeleteQuestionTarget(q)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                        <svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabPanel>
        </Tabs>
      </PageContainer>

      {/* Modals */}
      <SubtopicModal open={subtopicModal} onClose={closeSubtopicModal} topicId={topicId} subtopic={editingSubtopic} />

      {loSubtopicId && (
        <LOModal open={loModal} onClose={closeLOModal} topicId={topicId} subtopicId={loSubtopicId} lo={editingLO} />
      )}

      <ResourceModal open={resourceModal} onClose={closeResourceModal} topicId={topicId} resource={editingResource} />

      <QuestionModal open={questionModal} onClose={closeQuestionModal} topicId={topicId} question={editingQuestion} />

      <NoteModal open={noteModal} onClose={closeNoteModal} topicId={topicId} note={editingNote} />

      <DeckModal open={deckModal} onClose={closeDeckModal} topicId={topicId} deck={editingDeck} />

      {cardDeckId && (
        <CardModal open={cardModal} onClose={closeCardModal} deckId={cardDeckId} card={editingCard} />
      )}

      <ConfirmDialog open={!!deleteSubtopicTarget} onClose={() => setDeleteSubtopicTarget(null)}
        onConfirm={async () => {
          if (deleteSubtopicTarget) { await deleteSubtopic.mutateAsync({ subtopicId: deleteSubtopicTarget.id, topicId }); setDeleteSubtopicTarget(null); }
        }}
        loading={deleteSubtopic.isPending} title="Delete subtopic?"
        description={`"${deleteSubtopicTarget?.name}" and all its learning objectives will be permanently deleted.`}
        confirmLabel="Delete" />

      <ConfirmDialog open={!!deleteLOTarget} onClose={() => setDeleteLOTarget(null)}
        onConfirm={async () => {
          if (deleteLOTarget) { await deleteLO.mutateAsync({ loId: deleteLOTarget.id, topicId }); setDeleteLOTarget(null); }
        }}
        loading={deleteLO.isPending} title="Delete learning objective?"
        description="This learning objective will be permanently deleted."
        confirmLabel="Delete" />

      <ConfirmDialog open={!!deleteResourceTarget} onClose={() => setDeleteResourceTarget(null)}
        onConfirm={async () => {
          if (deleteResourceTarget) { await deleteResource.mutateAsync({ id: deleteResourceTarget.id, topicId }); setDeleteResourceTarget(null); }
        }}
        loading={deleteResource.isPending} title="Delete resource?"
        description={`"${deleteResourceTarget?.title}" will be permanently deleted.`}
        confirmLabel="Delete" />

      <ConfirmDialog open={!!deleteDeckTarget} onClose={() => setDeleteDeckTarget(null)}
        onConfirm={async () => {
          if (deleteDeckTarget) { await deleteDeck.mutateAsync({ id: deleteDeckTarget.id, topicId }); setDeleteDeckTarget(null); }
        }}
        loading={deleteDeck.isPending} title="Delete deck?"
        description={`"${deleteDeckTarget?.name}" and all its flashcards will be permanently deleted.`}
        confirmLabel="Delete" />

      <ConfirmDialog open={!!deleteNoteTarget} onClose={() => setDeleteNoteTarget(null)}
        onConfirm={async () => {
          if (deleteNoteTarget) { await deleteNote.mutateAsync({ id: deleteNoteTarget.id, topicId }); setDeleteNoteTarget(null); }
        }}
        loading={deleteNote.isPending} title="Delete study note?"
        description={`"${deleteNoteTarget?.title}" will be permanently deleted.`}
        confirmLabel="Delete" />

      <ConfirmDialog open={!!deleteQuestionTarget} onClose={() => setDeleteQuestionTarget(null)}
        onConfirm={async () => {
          if (deleteQuestionTarget) { await deleteQuestion.mutateAsync({ id: deleteQuestionTarget.id, topicId }); setDeleteQuestionTarget(null); }
        }}
        loading={deleteQuestion.isPending} title="Delete question?"
        description="This question and all its options will be permanently deleted."
        confirmLabel="Delete" />
    </AppShell>
  );
}
