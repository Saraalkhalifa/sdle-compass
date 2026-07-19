import React, { useState, useMemo } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { PageContainer } from '@/components/layout/PageContainer';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  useAllErrorReports,
  useUpdateErrorReport,
  type ErrorReportAdmin,
  type ErrorReportStatus,
} from '@/hooks/useErrorReports';

// ── Helpers ───────────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<string, string> = {
  wrong_answer:     'Wrong Answer',
  broken_link:      'Broken Link',
  typo:             'Typo',
  outdated_content: 'Outdated',
  other:            'Other',
};

const TYPE_CLS: Record<string, string> = {
  wrong_answer:     'bg-red-100 text-red-700',
  broken_link:      'bg-orange-100 text-orange-700',
  typo:             'bg-amber-100 text-amber-700',
  outdated_content: 'bg-blue-100 text-blue-700',
  other:            'bg-slate-100 text-slate-600',
};

const STATUS_META: Record<ErrorReportStatus, { label: string; cls: string }> = {
  open:       { label: 'Open',       cls: 'bg-red-100 text-red-700' },
  in_review:  { label: 'In Review',  cls: 'bg-amber-100 text-amber-700' },
  resolved:   { label: 'Resolved',   cls: 'bg-emerald-100 text-emerald-700' },
  dismissed:  { label: 'Dismissed',  cls: 'bg-slate-100 text-slate-500' },
};

function fmtDate(s: string) {
  return new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const ALL_STATUSES: (ErrorReportStatus | '')[] = ['', 'open', 'in_review', 'resolved', 'dismissed'];

// ── Row ───────────────────────────────────────────────────────────────────────

function ReportRow({ report: r, onStatusChange, isPending }: {
  report: ErrorReportAdmin;
  onStatusChange: (status: ErrorReportStatus) => void;
  isPending: boolean;
}) {
  const statusMeta = STATUS_META[r.status];
  const typeCls    = TYPE_CLS[r.type] ?? TYPE_CLS.other;
  const typeLabel  = TYPE_LABELS[r.type] ?? r.type;

  return (
    <tr className="hover:bg-slate-50 transition-colors align-top">
      <td className="px-4 py-3">
        <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${typeCls}`}>
          {typeLabel}
        </span>
      </td>
      <td className="px-4 py-3 max-w-xs">
        <p className="text-sm text-slate-800 line-clamp-2">{r.description}</p>
        {r.questions?.question_text && (
          <p className="text-xs text-slate-400 mt-0.5 line-clamp-1 italic">
            Q: {r.questions.question_text}
          </p>
        )}
      </td>
      <td className="px-4 py-3 text-xs text-slate-500">
        <p className="font-medium text-slate-700">{r.users?.full_name ?? '—'}</p>
        <p className="text-slate-400">{r.users?.email ?? ''}</p>
      </td>
      <td className="px-4 py-3 text-xs text-slate-400">{fmtDate(r.created_at)}</td>
      <td className="px-4 py-3">
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusMeta.cls}`}>
          {statusMeta.label}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1 flex-wrap">
          {r.status === 'open' && (
            <button
              onClick={() => onStatusChange('in_review')}
              disabled={isPending}
              className="text-xs px-2 py-1 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors disabled:opacity-50"
            >
              Mark reviewing
            </button>
          )}
          {(r.status === 'open' || r.status === 'in_review') && (
            <>
              <button
                onClick={() => onStatusChange('resolved')}
                disabled={isPending}
                className="text-xs px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors disabled:opacity-50"
              >
                Resolve
              </button>
              <button
                onClick={() => onStatusChange('dismissed')}
                disabled={isPending}
                className="text-xs px-2 py-1 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors disabled:opacity-50"
              >
                Dismiss
              </button>
            </>
          )}
          {(r.status === 'resolved' || r.status === 'dismissed') && (
            <button
              onClick={() => onStatusChange('open')}
              disabled={isPending}
              className="text-xs px-2 py-1 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors disabled:opacity-50"
            >
              Reopen
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function AdminErrorReports() {
  const [statusFilter, setStatusFilter] = useState<ErrorReportStatus | ''>('open');
  const [updating, setUpdating] = useState<string | null>(null);

  const { data: reports = [], isLoading, isError } = useAllErrorReports();
  const updateReport = useUpdateErrorReport();

  const counts = useMemo(() => {
    const map: Record<string, number> = { '': reports.length };
    for (const s of ['open', 'in_review', 'resolved', 'dismissed'] as ErrorReportStatus[]) {
      map[s] = reports.filter(r => r.status === s).length;
    }
    return map;
  }, [reports]);

  const filtered = useMemo(() => {
    if (!statusFilter) return reports;
    return reports.filter(r => r.status === statusFilter);
  }, [reports, statusFilter]);

  function handleStatus(report: ErrorReportAdmin, status: ErrorReportStatus) {
    setUpdating(report.id);
    updateReport.mutate(
      { id: report.id, status },
      { onSettled: () => setUpdating(null) },
    );
  }

  // ── Loading / error states ─────────────────────────────────────────────────

  if (isError) {
    return (
      <AppShell role="admin" title="Error Reports">
        <PageContainer title="Error Reports" description="Student-submitted content issues" maxWidth="2xl">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
            <p className="text-sm font-semibold text-amber-800">Table not yet created</p>
            <p className="text-xs text-amber-700 mt-1">
              Run <code className="font-mono bg-white px-1 rounded border border-amber-200">012_error_reports.sql</code> in the Supabase SQL Editor to enable this feature.
            </p>
          </div>
        </PageContainer>
      </AppShell>
    );
  }

  return (
    <AppShell role="admin" title="Error Reports">
      <PageContainer
        title="Error Reports"
        description="Student-submitted content issues and correction requests"
        maxWidth="2xl"
      >
        {/* Status tabs */}
        <div className="flex gap-1 mb-5 flex-wrap">
          {ALL_STATUSES.map(s => {
            const label  = s === '' ? 'All' : STATUS_META[s as ErrorReportStatus].label;
            const count  = counts[s] ?? 0;
            const isActive = statusFilter === s;
            return (
              <button
                key={s}
                onClick={() => setStatusFilter(s as ErrorReportStatus | '')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                  isActive
                    ? 'bg-slate-800 text-white border-slate-800'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                {label}
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] leading-none ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Table */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-emerald-50 rounded-xl flex items-center justify-center">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
              </div>
              <p className="text-sm font-semibold text-slate-700">
                {reports.length === 0 ? 'No reports yet' : `No ${statusFilter.replace('_', ' ')} reports`}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {reports.length === 0
                  ? "When students flag content issues, they'll appear here."
                  : 'All clear in this category.'}
              </p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide w-28">Type</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Description</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Reporter</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide w-28">Date</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide w-24">Status</th>
                  <th className="px-4 py-2.5 w-40"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(r => (
                  <ReportRow
                    key={r.id}
                    report={r}
                    onStatusChange={status => handleStatus(r, status)}
                    isPending={updating === r.id && updateReport.isPending}
                  />
                ))}
              </tbody>
            </table>
          )}
        </div>

        <p className="text-xs text-slate-400 mt-2 text-right">
          {filtered.length} of {reports.length} reports
        </p>
      </PageContainer>
    </AppShell>
  );
}
