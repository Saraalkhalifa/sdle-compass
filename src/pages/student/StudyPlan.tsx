import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { AppShell } from '@/components/layout/AppShell';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { Dialog, ConfirmDialog } from '@/components/ui/Dialog';
import { ROUTES } from '@/config/app';
import {
  useWeekSessions,
  useMarkSessionComplete,
  useCreateStudySession,
  useDeleteStudySession,
  useGenerateWeeklyPlan,
  type StudySessionWithRefs,
} from '@/hooks/useStudyPlan';

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtDuration(mins: number): string {
  if (mins < 60) return `${mins} min`;
  if (mins % 60 === 0) return `${mins / 60} hr`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

function fmtDayLabel(date: Date, isToday: boolean, isTomorrow: boolean): string {
  if (isToday) return 'Today';
  if (isTomorrow) return 'Tomorrow';
  return date.toLocaleDateString('en-US', { weekday: 'long' });
}

function fmtDateSub(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

interface DayGroup {
  date: string;
  dateObj: Date;
  label: string;
  sub: string;
  isToday: boolean;
  sessions: StudySessionWithRefs[];
}

function buildWeek(sessions: StudySessionWithRefs[]): DayGroup[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const groups: DayGroup[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    groups.push({
      date: dateStr,
      dateObj: d,
      label: fmtDayLabel(d, i === 0, i === 1),
      sub: fmtDateSub(d),
      isToday: i === 0,
      sessions: sessions.filter(s => s.scheduled_date === dateStr),
    });
  }
  return groups;
}

// ── Type colours ──────────────────────────────────────────────────────────────

const TYPE_META = {
  study:     { dot: 'bg-blue-500',   badge: 'bg-blue-50 text-blue-700 border-blue-100',   label: 'Study'     },
  review:    { dot: 'bg-amber-400',  badge: 'bg-amber-50 text-amber-700 border-amber-100', label: 'Review'    },
  mock_exam: { dot: 'bg-purple-500', badge: 'bg-purple-50 text-purple-700 border-purple-100', label: 'Mock Exam' },
  break:     { dot: 'bg-slate-300',  badge: 'bg-slate-50 text-slate-500 border-slate-200', label: 'Break'     },
} as const;

// ── Session card ──────────────────────────────────────────────────────────────

interface SessionCardProps {
  session: StudySessionWithRefs;
  onToggle: () => void;
  onDelete: () => void;
  isToggling: boolean;
  isDeleting: boolean;
}

function SessionCard({ session, onToggle, onDelete, isToggling, isDeleting }: SessionCardProps) {
  const meta = TYPE_META[session.session_type as keyof typeof TYPE_META] ?? TYPE_META.study;
  const done = session.is_completed;

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
      done ? 'bg-white border-slate-200 opacity-70' : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
    }`}>
      {/* Complete toggle */}
      <button
        onClick={onToggle}
        disabled={isToggling}
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
          done
            ? 'bg-emerald-500 border-emerald-500 text-white'
            : 'border-slate-300 hover:border-emerald-400'
        }`}
        aria-label={done ? 'Mark incomplete' : 'Mark complete'}
      >
        {done && (
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 6l3 3 5-5" />
          </svg>
        )}
      </button>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <span className={`w-2 h-2 rounded-full shrink-0 ${meta.dot}`} />
          <span className={`text-sm font-medium truncate ${done ? 'line-through text-slate-400' : 'text-slate-800'}`}>
            {session.title}
          </span>
        </div>
        <div className="flex items-center gap-3 mt-0.5">
          <span className={`text-xs px-1.5 py-px rounded border font-medium ${meta.badge}`}>{meta.label}</span>
          <span className="text-xs text-slate-400">{fmtDuration(session.duration_mins)}</span>
          {session.topics && session.subject_id && (
            <Link
              to={ROUTES.topic(session.subject_id, session.topic_id!)}
              className="text-xs text-blue-500 hover:underline truncate"
            >
              {session.topics.name}
            </Link>
          )}
        </div>
      </div>

      {/* Delete */}
      <button
        onClick={onDelete}
        disabled={isDeleting}
        className="shrink-0 p-1 text-slate-300 hover:text-red-400 transition-colors rounded"
        aria-label="Delete session"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
        </svg>
      </button>
    </div>
  );
}

// ── Day section ───────────────────────────────────────────────────────────────

interface DaySectionProps {
  day: DayGroup;
  onToggle: (id: string, undo: boolean) => void;
  onDelete: (id: string) => void;
  togglingId: string | null;
  deletingId: string | null;
}

function DaySection({ day, onToggle, onDelete, togglingId, deletingId }: DaySectionProps) {
  const done = day.sessions.filter(s => s.is_completed).length;
  const total = day.sessions.length;

  return (
    <div>
      <div className={`flex items-center gap-2 mb-2 pb-1 border-b ${day.isToday ? 'border-blue-100' : 'border-slate-100'}`}>
        <h3 className={`text-sm font-semibold ${day.isToday ? 'text-blue-700' : 'text-slate-700'}`}>
          {day.label}
        </h3>
        <span className="text-xs text-slate-400">{day.sub}</span>
        {total > 0 && (
          <span className={`ml-auto text-xs font-medium ${done === total ? 'text-emerald-600' : 'text-slate-400'}`}>
            {done}/{total} done
          </span>
        )}
      </div>

      {total === 0 ? (
        <div className="text-sm text-slate-400 px-4 py-3 bg-slate-50 rounded-xl border border-dashed border-slate-200">
          No sessions scheduled
        </div>
      ) : (
        <div className="space-y-2">
          {day.sessions.map(s => (
            <SessionCard
              key={s.id}
              session={s}
              onToggle={() => onToggle(s.id, s.is_completed)}
              onDelete={() => onDelete(s.id)}
              isToggling={togglingId === s.id}
              isDeleting={deletingId === s.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Add session form ──────────────────────────────────────────────────────────

const DURATIONS = [30, 45, 60, 90, 120] as const;
const TYPES = [
  { value: 'study',     label: 'Study' },
  { value: 'review',    label: 'Review' },
  { value: 'mock_exam', label: 'Mock Exam' },
  { value: 'break',     label: 'Break' },
] as const;

function todayISO() {
  return new Date().toISOString().split('T')[0];
}

interface AddForm {
  title: string;
  scheduled_date: string;
  duration_mins: number;
  session_type: 'study' | 'review' | 'mock_exam' | 'break';
}

const DEFAULT_FORM: AddForm = {
  title: '',
  scheduled_date: todayISO(),
  duration_mins: 60,
  session_type: 'study',
};

// ── Page ──────────────────────────────────────────────────────────────────────

export function StudyPlan() {
  const [showGenerate, setShowGenerate] = useState(false);
  const [showAdd, setShowAdd]         = useState(false);
  const [addForm, setAddForm]         = useState<AddForm>(DEFAULT_FORM);
  const [togglingId, setTogglingId]   = useState<string | null>(null);
  const [deletingId, setDeletingId]   = useState<string | null>(null);

  const { data: sessions, isLoading } = useWeekSessions();
  const generatePlan  = useGenerateWeeklyPlan();
  const createSession = useCreateStudySession();
  const markComplete  = useMarkSessionComplete();
  const deleteSession = useDeleteStudySession();

  const days = buildWeek(sessions ?? []);
  const totalSessions = (sessions ?? []).length;
  const completedSessions = (sessions ?? []).filter(s => s.is_completed).length;

  async function handleGenerate() {
    setShowGenerate(false);
    try {
      const count = await generatePlan.mutateAsync();
      toast.success(`Generated ${count} sessions for the next 7 days`);
    } catch {
      toast.error('Failed to generate plan');
    }
  }

  async function handleToggle(id: string, undo: boolean) {
    setTogglingId(id);
    try {
      await markComplete.mutateAsync({ id, undo });
    } catch {
      toast.error('Failed to update session');
    } finally {
      setTogglingId(null);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await deleteSession.mutateAsync(id);
    } catch {
      toast.error('Failed to delete session');
    } finally {
      setDeletingId(null);
    }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!addForm.title.trim()) return;
    try {
      await createSession.mutateAsync(addForm);
      toast.success('Session added');
      setShowAdd(false);
      setAddForm(DEFAULT_FORM);
    } catch {
      toast.error('Failed to add session');
    }
  }

  return (
    <AppShell role="student" title="Study Plan">
      <PageContainer
        title="Study Plan"
        description="Your personalised 7-day study schedule"
        maxWidth="2xl"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowGenerate(true)}
              disabled={generatePlan.isPending}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5">
                <path d="M12 3v1m0 16v1M4.22 4.22l.7.7m12.17 12.17.7.7M3 12h1m16 0h1M4.22 19.78l.7-.7M18.36 5.64l.7-.7"/>
                <circle cx="12" cy="12" r="4"/>
              </svg>
              {generatePlan.isPending ? 'Generating…' : 'Generate Plan'}
            </Button>
            <Button size="sm" onClick={() => { setAddForm(DEFAULT_FORM); setShowAdd(true); }}>
              + Add Session
            </Button>
          </div>
        }
      >
        {/* Progress summary */}
        {totalSessions > 0 && (
          <div className="bg-white border border-slate-200 rounded-xl px-5 py-4 mb-4 flex items-center gap-6">
            <div>
              <p className="text-2xl font-bold text-slate-900">{completedSessions}<span className="text-slate-400 text-lg font-normal">/{totalSessions}</span></p>
              <p className="text-xs text-slate-500 mt-0.5">This week</p>
            </div>
            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                style={{ width: totalSessions > 0 ? `${Math.round((completedSessions / totalSessions) * 100)}%` : '0%' }}
              />
            </div>
            <span className="text-sm font-semibold text-emerald-600 shrink-0">
              {totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0}%
            </span>
          </div>
        )}

        {/* Week view */}
        {isLoading ? (
          <div className="space-y-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-5 w-32 rounded" />
                <Skeleton className="h-16 rounded-xl" />
                <Skeleton className="h-16 rounded-xl" />
              </div>
            ))}
          </div>
        ) : totalSessions === 0 ? (
          <div className="bg-white border border-dashed border-slate-200 rounded-xl p-12 text-center">
            <div className="w-14 h-14 mx-auto mb-4 bg-blue-50 rounded-2xl flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2"/>
                <path d="M16 2v4M8 2v4M3 10h18"/>
                <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01"/>
              </svg>
            </div>
            <h3 className="text-base font-semibold text-slate-700 mb-1">No sessions planned</h3>
            <p className="text-sm text-slate-500 mb-6 max-w-xs mx-auto">
              Generate a personalised plan based on your study schedule, or add sessions manually.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Button onClick={() => setShowGenerate(true)} disabled={generatePlan.isPending}>
                {generatePlan.isPending ? 'Generating…' : 'Generate My Plan'}
              </Button>
              <Button variant="outline" onClick={() => { setAddForm(DEFAULT_FORM); setShowAdd(true); }}>
                Add Session
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {days.map(day => (
              <DaySection
                key={day.date}
                day={day}
                onToggle={handleToggle}
                onDelete={handleDelete}
                togglingId={togglingId}
                deletingId={deletingId}
              />
            ))}
          </div>
        )}
      </PageContainer>

      {/* Generate confirm */}
      <ConfirmDialog
        open={showGenerate}
        onClose={() => setShowGenerate(false)}
        onConfirm={handleGenerate}
        title="Generate Study Plan"
        description={
          totalSessions > 0
            ? "This will replace your existing unfinished sessions for the next 7 days with a new plan based on your availability and subject confidence. Completed sessions are kept."
            : "Generate a personalised 7-day study plan based on your availability and subject confidence from onboarding."
        }
        confirmLabel="Generate"
        variant="primary"
      />

      {/* Add session modal */}
      <Dialog
        open={showAdd}
        onClose={() => setShowAdd(false)}
        title="Add Study Session"
      >
        <form onSubmit={handleAdd} className="space-y-4 pt-1">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
            <input
              type="text"
              value={addForm.title}
              onChange={e => setAddForm(f => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Dental Anatomy Review"
              required
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
              <input
                type="date"
                value={addForm.scheduled_date}
                onChange={e => setAddForm(f => ({ ...f, scheduled_date: e.target.value }))}
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Duration</label>
              <select
                value={addForm.duration_mins}
                onChange={e => setAddForm(f => ({ ...f, duration_mins: Number(e.target.value) }))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {DURATIONS.map(d => (
                  <option key={d} value={d}>{fmtDuration(d)}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
            <div className="flex gap-2 flex-wrap">
              {TYPES.map(t => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setAddForm(f => ({ ...f, session_type: t.value }))}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                    addForm.session_type === t.value
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setShowAdd(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createSession.isPending}>
              {createSession.isPending ? 'Adding…' : 'Add Session'}
            </Button>
          </div>
        </form>
      </Dialog>
    </AppShell>
  );
}
