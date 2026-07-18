import React from 'react';
import { Link } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/config/app';

interface StatCardProps {
  label: string;
  value: string | number;
  change?: string;
  color?: string;
  icon: React.ReactNode;
}

function StatCard({ label, value, change, color = 'bg-blue-50', icon }: StatCardProps) {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
          {change && <p className="text-xs text-slate-400 mt-1">{change}</p>}
        </div>
        <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center`}>
          {icon}
        </div>
      </div>
    </Card>
  );
}

const REVIEW_QUEUE = [
  { type: 'Question',  title: 'Composite restoration failure modes — AI generated',   time: '2h ago',  status: 'ai_generated' },
  { type: 'Resource',  title: 'Endodontics PDF upload awaiting review',               time: '4h ago',  status: 'awaiting_review' },
  { type: 'Question',  title: 'Periodontics scaling depth — imported from PDF',        time: '1d ago',  status: 'awaiting_review' },
  { type: 'Error',     title: 'Student reported incorrect answer in Q#4821',          time: '3h ago',  status: 'open' },
];

export function AdminDashboard() {
  return (
    <AppShell role="admin" title="Admin Overview">
      <PageContainer title="Admin Overview" maxWidth="xl">
        <div className="space-y-6">

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Active Students"
              value="1,284"
              change="+23 this week"
              color="bg-blue-50"
              icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.75"><path strokeLinecap="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"/></svg>}
            />
            <StatCard
              label="Published Questions"
              value="4,821"
              change="186 pending review"
              color="bg-emerald-50"
              icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="1.75"><circle cx="12" cy="12" r="10"/><path strokeLinecap="round" d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><path strokeLinecap="round" d="M12 17h.01"/></svg>}
            />
            <StatCard
              label="Awaiting Review"
              value="47"
              change="12 high priority"
              color="bg-amber-50"
              icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="1.75"><path strokeLinecap="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}
            />
            <StatCard
              label="Error Reports"
              value="9"
              change="3 unresolved"
              color="bg-red-50"
              icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="1.75"><path strokeLinecap="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/></svg>}
            />
          </div>

          {/* Review queue + quick links */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

            {/* Review queue */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <div>
                  <CardTitle>Review Queue</CardTitle>
                  <CardDescription>Items needing attention</CardDescription>
                </div>
                <Link to={ROUTES.adminAIQueue}>
                  <Button variant="outline" size="sm">View all</Button>
                </Link>
              </CardHeader>

              <div className="divide-y divide-slate-100">
                {REVIEW_QUEUE.map((item, i) => (
                  <div key={i} className="py-3 flex items-start gap-3">
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
                  </div>
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
                  { label: 'Add Subject',       href: ROUTES.adminSubjects,   color: 'text-blue-700 bg-blue-50 hover:bg-blue-100' },
                  { label: 'Upload Resource',   href: ROUTES.adminResources,  color: 'text-violet-700 bg-violet-50 hover:bg-violet-100' },
                  { label: 'Create Question',   href: ROUTES.adminQuestions,  color: 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100' },
                  { label: 'Import Questions',  href: ROUTES.adminQuestionImports, color: 'text-amber-700 bg-amber-50 hover:bg-amber-100' },
                  { label: 'Generate with AI',  href: ROUTES.adminAIQueue,    color: 'text-cyan-700 bg-cyan-50 hover:bg-cyan-100' },
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

          {/* Content coverage notice */}
          <Card variant="flat" className="border border-amber-100 bg-amber-50/60">
            <div className="flex items-start gap-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="1.75" className="flex-shrink-0 mt-0.5" aria-hidden="true">
                <path strokeLinecap="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/>
              </svg>
              <div>
                <p className="text-sm font-semibold text-amber-900">Topics with no resources</p>
                <p className="text-xs text-amber-700 mt-0.5">
                  8 subtopics have no learning resources attached. Students studying these areas will see empty content.
                  <Link to={ROUTES.adminSubjects} className="ml-1 underline font-medium">Review now</Link>
                </p>
              </div>
            </div>
          </Card>

        </div>
      </PageContainer>
    </AppShell>
  );
}
