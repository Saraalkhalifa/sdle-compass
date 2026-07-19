import React, { useState, useMemo } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { PageContainer } from '@/components/layout/PageContainer';
import { Skeleton } from '@/components/ui/Skeleton';
import { ConfirmDialog } from '@/components/ui/Dialog';
import { useAllStudents, useUpdateAccountStatus, type StudentRow } from '@/hooks/useAdminStats';
import type { AccountStatus } from '@/types/database';

// ── Helpers ───────────────────────────────────────────────────────────────────

function initials(name: string): string {
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
}

function fmtDate(d: string | null): string {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const STATUS_META: Record<AccountStatus, { label: string; cls: string }> = {
  active:    { label: 'Active',    cls: 'bg-emerald-100 text-emerald-700' },
  pending:   { label: 'Pending',   cls: 'bg-amber-100 text-amber-700' },
  suspended: { label: 'Suspended', cls: 'bg-red-100 text-red-700' },
  deleted:   { label: 'Deleted',   cls: 'bg-slate-100 text-slate-500' },
};

// ── Row ───────────────────────────────────────────────────────────────────────

interface RowProps {
  student: StudentRow;
  onSuspend: () => void;
  onActivate: () => void;
}

function StudentRow({ student: s, onSuspend, onActivate }: RowProps) {
  const statusMeta = STATUS_META[s.account_status] ?? STATUS_META.pending;

  return (
    <tr className="hover:bg-slate-50 transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
            style={{ backgroundColor: s.avatar_color ?? '#2563eb' }}
          >
            {initials(s.full_name)}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate">{s.full_name}</p>
            <p className="text-xs text-slate-400 truncate">{s.email}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-slate-600">{fmtDate(s.exam_date)}</td>
      <td className="px-4 py-3">
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
          s.onboarding_completed ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'
        }`}>
          {s.onboarding_completed ? 'Done' : 'Pending'}
        </span>
      </td>
      <td className="px-4 py-3">
        <span className="text-xs text-slate-400">{s.preferred_language.toUpperCase()}</span>
      </td>
      <td className="px-4 py-3">
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusMeta.cls}`}>
          {statusMeta.label}
        </span>
      </td>
      <td className="px-4 py-3 text-xs text-slate-400">{fmtDate(s.created_at)}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1 justify-end">
          {s.account_status === 'active' ? (
            <button
              onClick={onSuspend}
              className="text-xs text-amber-600 hover:text-amber-800 px-2 py-1 rounded-lg hover:bg-amber-50 transition-colors"
            >
              Suspend
            </button>
          ) : s.account_status === 'suspended' ? (
            <button
              onClick={onActivate}
              className="text-xs text-emerald-600 hover:text-emerald-800 px-2 py-1 rounded-lg hover:bg-emerald-50 transition-colors"
            >
              Activate
            </button>
          ) : null}
        </div>
      </td>
    </tr>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function AdminStudents() {
  const [search, setSearch]               = useState('');
  const [statusFilter, setStatusFilter]   = useState<AccountStatus | ''>('');
  const [langFilter, setLangFilter]       = useState<'en' | 'ar' | ''>('');
  const [confirmTarget, setConfirmTarget] = useState<{ student: StudentRow; action: 'suspend' | 'activate' } | null>(null);

  const { data: students, isLoading } = useAllStudents();
  const updateStatus = useUpdateAccountStatus();

  const filtered = useMemo(() => {
    let list = students ?? [];
    if (statusFilter) list = list.filter(s => s.account_status === statusFilter);
    if (langFilter)   list = list.filter(s => s.preferred_language === langFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(s => s.full_name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q));
    }
    return list;
  }, [students, statusFilter, langFilter, search]);

  const total       = students?.length ?? 0;
  const active      = students?.filter(s => s.account_status === 'active').length ?? 0;
  const onboarded   = students?.filter(s => s.onboarding_completed).length ?? 0;
  const examDateSet = students?.filter(s => s.exam_date).length ?? 0;

  return (
    <AppShell role="admin" title="Students">
      <PageContainer title="Student Management" description="View and manage all registered students" maxWidth="2xl">

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          {[
            { label: 'Total Students',    value: total,      cls: 'text-slate-900' },
            { label: 'Active Accounts',   value: active,     cls: 'text-emerald-700' },
            { label: 'Setup Complete',    value: onboarded,  cls: 'text-blue-700' },
            { label: 'Exam Date Set',     value: examDateSet, cls: 'text-violet-700' },
          ].map(s => (
            <div key={s.label} className="bg-white border border-slate-200 rounded-xl p-4">
              <p className={`text-2xl font-bold ${s.cls}`}>{isLoading ? '—' : s.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <div className="relative">
            <svg width="13" height="13" className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            <input
              type="search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search name or email…"
              className="pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-52"
            />
          </div>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as AccountStatus | '')}
            className="px-2.5 py-1.5 text-sm border border-slate-200 rounded-lg bg-white"
          >
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
          </select>

          <div className="flex gap-1">
            {(['', 'en', 'ar'] as const).map(l => (
              <button
                key={l}
                onClick={() => setLangFilter(l)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  langFilter === l
                    ? 'bg-slate-800 text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                {l === '' ? 'All' : l.toUpperCase()}
              </button>
            ))}
          </div>

          <p className="text-xs text-slate-400 ml-auto">
            {filtered.length} of {total} students
          </p>
        </div>

        {/* Table */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-12" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-sm font-semibold text-slate-700">No students found</p>
              <p className="text-xs text-slate-400 mt-1">
                {total === 0 ? 'No students have registered yet.' : 'Try adjusting your filters.'}
              </p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Student</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Exam Date</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Setup</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Lang</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Joined</th>
                  <th className="px-4 py-2.5 w-20"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(s => (
                  <StudentRow
                    key={s.id}
                    student={s}
                    onSuspend={() => setConfirmTarget({ student: s, action: 'suspend' })}
                    onActivate={() => setConfirmTarget({ student: s, action: 'activate' })}
                  />
                ))}
              </tbody>
            </table>
          )}
        </div>

        <ConfirmDialog
          open={!!confirmTarget}
          onClose={() => setConfirmTarget(null)}
          onConfirm={() => {
            if (!confirmTarget) return;
            const newStatus: AccountStatus = confirmTarget.action === 'suspend' ? 'suspended' : 'active';
            updateStatus.mutate(
              { id: confirmTarget.student.id, status: newStatus },
              { onSuccess: () => setConfirmTarget(null) },
            );
          }}
          title={confirmTarget?.action === 'suspend' ? 'Suspend Student' : 'Activate Student'}
          description={
            confirmTarget?.action === 'suspend'
              ? `Suspend ${confirmTarget?.student.full_name}? They will lose access until reactivated.`
              : `Restore access for ${confirmTarget?.student.full_name}?`
          }
          confirmLabel={confirmTarget?.action === 'suspend' ? 'Suspend' : 'Activate'}
          variant={confirmTarget?.action === 'suspend' ? 'warning' : 'primary'}
          loading={updateStatus.isPending}
        />
      </PageContainer>
    </AppShell>
  );
}
