import React from 'react';
import { Link } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { APP_CONFIG, ROUTES } from '@/config/app';

const SUBJECTS_PREVIEW = [
  { name: 'Restorative Dentistry',   color: 'bg-blue-500',   weight: 20, progress: 45 },
  { name: 'Endodontics',             color: 'bg-teal-500',   weight: 15, progress: 60 },
  { name: 'Periodontics',            color: 'bg-emerald-500',weight: 15, progress: 30 },
  { name: 'Prosthodontics',          color: 'bg-violet-500', weight: 12, progress: 20 },
  { name: 'Oral Surgery',            color: 'bg-rose-500',   weight: 10, progress: 55 },
  { name: 'Oral Medicine & Pathology',color: 'bg-amber-500', weight: 8,  progress: 15 },
];

const TODAY_TASKS = [
  { type: 'Read',     label: 'Restorative: Composite materials — Chapter 4', done: true  },
  { type: 'Watch',    label: 'Endodontics: Root canal preparation video',     done: false },
  { type: 'Practice', label: 'Answer 20 Periodontics questions',              done: false },
  { type: 'Review',   label: 'Review 12 flashcards due today',               done: false },
];

function ExamCountdown() {
  const examDate = new Date('2025-04-01');
  const now = new Date();
  const daysLeft = Math.ceil((examDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <Card className="bg-gradient-to-br from-blue-600 to-blue-800 border-0 text-white">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-blue-200 text-sm font-medium">{APP_CONFIG.examAbbreviation} Examination</p>
          <p className="text-4xl font-bold mt-1 tabular-nums">{Math.max(0, daysLeft)}</p>
          <p className="text-blue-200 text-sm mt-0.5">days remaining</p>
        </div>
        <div className="text-right">
          <p className="text-blue-200 text-xs">Set your exam date</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2 border-white/40 text-white hover:bg-white/10 hover:border-white/60"
          >
            Update
          </Button>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-white/20 grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-2xl font-bold">38%</p>
          <p className="text-blue-200 text-xs mt-0.5">Syllabus done</p>
        </div>
        <div>
          <p className="text-2xl font-bold">72%</p>
          <p className="text-blue-200 text-xs mt-0.5">Accuracy</p>
        </div>
        <div>
          <p className="text-2xl font-bold">5</p>
          <p className="text-blue-200 text-xs mt-0.5">Day streak</p>
        </div>
      </div>
    </Card>
  );
}

function TodayTasks() {
  const completed = TODAY_TASKS.filter((t) => t.done).length;
  const typeBadge: Record<string, 'primary' | 'info' | 'success' | 'warning'> = {
    Read: 'primary', Watch: 'info', Practice: 'success', Review: 'warning',
  };

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Today's Tasks</CardTitle>
          <CardDescription>{completed}/{TODAY_TASKS.length} completed</CardDescription>
        </div>
        <Badge color={completed === TODAY_TASKS.length ? 'success' : 'primary'} size="sm">
          {completed === TODAY_TASKS.length ? 'Done!' : 'In progress'}
        </Badge>
      </CardHeader>

      <div className="w-full bg-slate-100 rounded-full h-1.5 mb-4">
        <div
          className="bg-blue-500 h-1.5 rounded-full transition-all"
          style={{ width: `${(completed / TODAY_TASKS.length) * 100}%` }}
        />
      </div>

      <ul className="space-y-2.5">
        {TODAY_TASKS.map((task, i) => (
          <li key={i} className="flex items-start gap-3">
            <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
              task.done ? 'bg-green-500 border-green-500' : 'border-slate-300'
            }`}>
              {task.done && (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
                </svg>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge color={typeBadge[task.type] ?? 'neutral'} size="xs">{task.type}</Badge>
                <span className={`text-sm ${task.done ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                  {task.label}
                </span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function SubjectProgress() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Subject Progress</CardTitle>
        <Link to={ROUTES.subjects} className="text-sm text-blue-600 hover:underline">View all</Link>
      </CardHeader>

      <div className="space-y-3">
        {SUBJECTS_PREVIEW.map((subject) => (
          <div key={subject.name}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2 min-w-0">
                <div className={`w-2.5 h-2.5 rounded-full ${subject.color} flex-shrink-0`} />
                <span className="text-sm text-slate-700 truncate">{subject.name}</span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-xs text-slate-400">{subject.weight}%</span>
                <span className="text-xs font-semibold text-slate-700 w-8 text-right">{subject.progress}%</span>
              </div>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5">
              <div
                className={`${subject.color} h-1.5 rounded-full transition-all`}
                style={{ width: `${subject.progress}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function QuickActions() {
  const actions = [
    {
      label: 'Continue Studying',
      description: 'Pick up where you left off',
      href: ROUTES.subjects,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
          <path strokeLinecap="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"/>
        </svg>
      ),
      color: 'bg-blue-50 text-blue-700 hover:bg-blue-100',
    },
    {
      label: 'Practice Questions',
      description: '20 random questions',
      href: ROUTES.questionBank,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
          <circle cx="12" cy="12" r="10"/>
          <path strokeLinecap="round" d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/>
          <path strokeLinecap="round" d="M12 17h.01"/>
        </svg>
      ),
      color: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
    },
    {
      label: 'Browse Resources',
      description: 'Books, videos, and notes',
      href: ROUTES.resources,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
          <path strokeLinecap="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"/>
        </svg>
      ),
      color: 'bg-violet-50 text-violet-700 hover:bg-violet-100',
    },
    {
      label: 'My Performance',
      description: 'Scores and weak topics',
      href: ROUTES.performance,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
          <path strokeLinecap="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"/>
        </svg>
      ),
      color: 'bg-amber-50 text-amber-700 hover:bg-amber-100',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {actions.map((action) => (
        <Link
          key={action.label}
          to={action.href}
          className={`flex flex-col items-center gap-2 p-4 rounded-xl text-center transition-colors ${action.color}`}
        >
          <span aria-hidden="true">{action.icon}</span>
          <div>
            <p className="text-sm font-semibold leading-snug">{action.label}</p>
            <p className="text-xs opacity-70 mt-0.5">{action.description}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}

export function StudentDashboard() {
  return (
    <AppShell role="student" showSearch>
      <PageContainer title="Dashboard" maxWidth="xl">
        <div className="space-y-5">

          {/* Exam countdown */}
          <ExamCountdown />

          {/* Quick actions */}
          <QuickActions />

          {/* Two-column grid: tasks + subjects */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <TodayTasks />
            <SubjectProgress />
          </div>

          {/* Continue learning banner */}
          <Card variant="flat" className="border border-blue-100 bg-blue-50/50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" aria-hidden="true">
                  <path strokeLinecap="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z"/>
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900">Continue: Endodontics — Root Canal Anatomy</p>
                <p className="text-xs text-slate-500 mt-0.5">Last visited 2 hours ago · Chapter 3 · 40% complete</p>
              </div>
              <Button size="sm" variant="solid">Continue</Button>
            </div>
          </Card>

        </div>
      </PageContainer>
    </AppShell>
  );
}
