import React from 'react';
import { Link } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { ROUTES } from '@/config/app';
import { useAdminDashboardCounts } from '@/hooks/useAdminStats';

// ── Stat card ─────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
  icon: React.ReactNode;
  loading?: boolean;
  href?: string;
}

function StatCard({ label, value, sub, color = 'bg-blue-50', icon, loading, href }: StatCardProps) {
  const inner = (
    <Card className={href ? 'hover:border-blue-300 transition-colors' : ''}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          {loading ? (
            <Skeleton className="h-8 w-16 mt-1" />
          ) : (
            <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
          )}
          {sub && !loading && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
        </div>
        <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center shrink-0`}>
          {icon}
        </div>
      </div>
    </Card>
  );
  return href ? <Link to={href}>{inner}</Link> : inner;
}

// ── Review queue (hardcoded — links to real admin pages) ──────────────────────

const REVIEW_QUEUE = [
  { type: 'Question',  title: 'Composite restoration failure modes — AI generated',  time: 'Draft',   status: 'ai_generated',   href: ROUTES.adminAIQueue },
  { type: 'Question',  title: 'Periodontics scaling depth — imported from PDF',       time: 'Draft',   status: 'awaiting_review', href: ROUTES.adminAIQueue },
  { type: 'Error',     title: 'Student reported incorrect answer',                    time: 'Open',    status: 'open',            href: ROUTES.adminErrorReports },
  { type: 'Resource',  title: 'Endodontics PDF awaiting publication',                 time: 'Hidden',  status: 'awaiting_review', href: ROUTES.adminResources },
];

// ── Page ──────────────────────────────────────────────────────────────────────

export function AdminDashboard() {
  const { data: counts, isLoading } = useAdminDashboardCounts();

  return (
    <AppShell role="admin" title="Admin Overview">
      <PageContainer title="Admin Overview" maxWidth="xl">
        <div className="space-y-6">

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Active Students"
              value={counts?.activeStudents ?? 0}
              sub={counts ? `${counts.activeStudents} accounts` : undefined}
              color="bg-blue-50"
              loading={isLoading}
              href={ROUTES.adminStudents}
              icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.75"><path strokeLinecap="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"/></svg>}
            />
            <StatCard
              label="Published Questions"
              value={counts?.publishedQuestions ?? 0}
              sub={counts ? `${counts.draftQuestions} drafts` : undefined}
              color="bg-emerald-50"
              loading={isLoading}
              href={ROUTES.adminQuestions}
              icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="1.75"><circle cx="12" cy="12" r="10"/><path strokeLinecap="round" d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><path strokeLinecap="round" d="M12 17h.01"/></svg>}
            />
            <StatCard
              label="AI Review Queue"
              value={counts?.draftQuestions ?? 0}
              sub="draft questions"
              color="bg-amber-50"
              loading={isLoading}
              href={ROUTES.adminAIQueue}
              icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="1.75"><path strokeLinecap="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}
            />
            <StatCard
              label="Open Error Reports"
              value={counts?.openErrorReports ?? 0}
              sub="student-flagged issues"
              color="bg-red-50"
              loading={isLoading}
              href={ROUTES.adminErrorReports}
              icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="1.75"><path strokeLinecap="round" d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>}
            />
          </div>

          {/* Review queue + quick links */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

            {/* Review queue */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <div>
                  <CardTitle>Attention Needed</CardTitle>
                  <CardDescription>Items pending admin action</CardDescription>
                </div>
                <Link to={ROUTES.adminAIQueue}>
                  <Button variant="outline" size="sm">View AI queue</Button>
                </Link>
              </CardHeader>

              <div className="divide-y divide-slate-100">
                {REVIEW_QUEUE.map((item, i) => (
                  <Link
                    key={i}
                    to={item.href}
                    className="py-3 flex items-start gap-3 hover:bg-slate-50 transition-colors -mx-5 px-5 block"
                  >
                    <Badge
                      color={
                        item.type === 'Error' ? 'error' :
                        item.type === 'Question' ? 'primary' : 'info'
                      }
                      size="xs"
                    >
                      {item.type}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-800 truncate">{item.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{item.time}</p>
                    </div>
                    <Badge
                      color={
                        item.status === 'ai_generated' ? 'info' :
                        item.status === 'open' ? 'error' : 'warning'
                      }
                      size="xs"
                    >
                      {item.status.replace('_', ' ')}
                    </Badge>
                  </Link>
                ))}
              </div>
            </Card>

            {/* Quick actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <div className="space-y-2">
                {[
                  { label: 'Add Subject',       href: ROUTES.adminSubjects,         color: 'text-blue-700 bg-blue-50 hover:bg-blue-100' },
                  { label: 'Upload Resource',   href: ROUTES.adminResources,        color: 'text-violet-700 bg-violet-50 hover:bg-violet-100' },
                  { label: 'Add Study Note',    href: ROUTES.adminNotes,            color: 'text-teal-700 bg-teal-50 hover:bg-teal-100' },
                  { label: 'Create Question',   href: ROUTES.adminQuestions,        color: 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100' },
                  { label: 'Import Questions',  href: ROUTES.adminQuestionImports,  color: 'text-amber-700 bg-amber-50 hover:bg-amber-100' },
                  { label: 'Review AI Queue',   href: ROUTES.adminAIQueue,          color: 'text-cyan-700 bg-cyan-50 hover:bg-cyan-100' },
                ].map((action) => (
                  <Link
                    key={action.label}
                    to={action.href}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${action.color}`}
                  >
                    {action.label}
                  </Link>
                ))}
              </div>
            </Card>
          </div>

          {/* Platform health */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                href: ROUTES.adminAnalytics,
                icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="1.75"><path strokeLinecap="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z"/></svg>,
                color: 'bg-indigo-50',
                label: 'View Analytics',
                sub: 'Accuracy, pass rate, signups',
              },
              {
                href: ROUTES.adminStudents,
                icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0891b2" strokeWidth="1.75"><path strokeLinecap="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"/></svg>,
                color: 'bg-cyan-50',
                label: 'Manage Students',
                sub: 'Suspend, activate, search',
              },
              {
                href: ROUTES.adminSettings,
                icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="1.75"><path strokeLinecap="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"/><circle cx="12" cy="12" r="2.25"/></svg>,
                color: 'bg-slate-50',
                label: 'Platform Settings',
                sub: 'Config, feature flags, routes',
              },
            ].map(card => (
              <Link
                key={card.href}
                to={card.href}
                className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3 hover:border-blue-300 transition-colors"
              >
                <div className={`w-10 h-10 ${card.color} rounded-xl flex items-center justify-center shrink-0`}>
                  {card.icon}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800">{card.label}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{card.sub}</p>
                </div>
              </Link>
            ))}
          </div>

        </div>
      </PageContainer>
    </AppShell>
  );
}
