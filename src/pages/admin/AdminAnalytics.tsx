import React from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { PageContainer } from '@/components/layout/PageContainer';
import { Skeleton } from '@/components/ui/Skeleton';
import { usePlatformStats } from '@/hooks/useAdminStats';

// ── Mini components ───────────────────────────────────────────────────────────

function StatCard({ label, value, sub, color = 'bg-blue-50', iconColor = 'text-blue-600', icon }: {
  label: string; value: string | number; sub?: string;
  color?: string; iconColor?: string; icon: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-4">
      <div className={`w-11 h-11 ${color} ${iconColor} rounded-xl flex items-center justify-center shrink-0`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-2xl font-bold text-slate-900 leading-tight">{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function HorizBar({ label, value, max, cls }: { label: string; value: number; max: number; cls: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between text-xs text-slate-600 mb-1 font-medium">
        <span>{label}</span>
        <span className="text-slate-400">{value} <span className="text-slate-300">({pct}%)</span></span>
      </div>
      <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full ${cls} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function Sparkline({ data }: { data: { date: string; count: number }[] }) {
  const max = Math.max(...data.map(d => d.count), 1);
  const H = 48;
  const W = 4;
  const GAP = 2;
  const totalW = data.length * (W + GAP) - GAP;

  const pts = data.map((d, i) => {
    const x = i * (W + GAP);
    const barH = Math.max(Math.round((d.count / max) * H), d.count > 0 ? 3 : 1);
    const y = H - barH;
    return { x, y, barH, count: d.count, date: d.date };
  });

  return (
    <svg width={totalW} height={H + 2} className="overflow-visible" aria-label="Signup trend">
      {pts.map((p, i) => (
        <g key={i}>
          <rect
            x={p.x} y={p.y} width={W} height={p.barH}
            className={p.count > 0 ? 'fill-blue-500' : 'fill-slate-100'}
            rx="1"
          />
        </g>
      ))}
    </svg>
  );
}

// ── Icons ─────────────────────────────────────────────────────────────────────

const icons = {
  students: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path strokeLinecap="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"/></svg>,
  questions: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><circle cx="12" cy="12" r="10"/><path strokeLinecap="round" d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><path strokeLinecap="round" d="M12 17h.01"/></svg>,
  accuracy: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path strokeLinecap="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>,
  exams: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path strokeLinecap="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>,
};

// ── Page ──────────────────────────────────────────────────────────────────────

function pct(n: number, d: number) {
  return d > 0 ? `${Math.round((n / d) * 100)}%` : '—';
}

export function AdminAnalytics() {
  const { data: stats, isLoading } = usePlatformStats();

  const totalQ = stats ? stats.byDifficulty.easy + stats.byDifficulty.medium + stats.byDifficulty.hard : 0;
  const peakSignup = stats ? Math.max(...stats.recentSignups.map(d => d.count)) : 0;
  const totalSignups30d = stats?.recentSignups.reduce((s, d) => s + d.count, 0) ?? 0;

  return (
    <AppShell role="admin" title="Analytics">
      <PageContainer title="Platform Analytics" description="Aggregated metrics across all students and content" maxWidth="2xl">

        {/* Top stats */}
        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            <StatCard
              label="Total Students"
              value={stats?.totalStudents ?? 0}
              sub={`${stats?.activeStudents ?? 0} active`}
              color="bg-blue-50" iconColor="text-blue-600"
              icon={icons.students}
            />
            <StatCard
              label="Published Questions"
              value={stats?.activeQuestions ?? 0}
              sub={`${stats?.totalQuestions ?? 0} total incl. drafts`}
              color="bg-violet-50" iconColor="text-violet-600"
              icon={icons.questions}
            />
            <StatCard
              label="Overall Accuracy"
              value={stats ? `${stats.accuracy}%` : '—'}
              sub={`${(stats?.totalAttempts ?? 0).toLocaleString()} attempts`}
              color="bg-emerald-50" iconColor="text-emerald-600"
              icon={icons.accuracy}
            />
            <StatCard
              label="Exam Pass Rate"
              value={stats ? `${stats.passRate}%` : '—'}
              sub={`${stats?.totalExamSessions ?? 0} sessions`}
              color="bg-amber-50" iconColor="text-amber-600"
              icon={icons.exams}
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">

          {/* Question difficulty distribution */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-4">Question Difficulty Breakdown</h3>
            {isLoading ? (
              <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-6" />)}</div>
            ) : (
              <div className="space-y-4">
                <HorizBar label="Easy"   value={stats?.byDifficulty.easy   ?? 0} max={totalQ} cls="bg-emerald-400" />
                <HorizBar label="Medium" value={stats?.byDifficulty.medium ?? 0} max={totalQ} cls="bg-amber-400" />
                <HorizBar label="Hard"   value={stats?.byDifficulty.hard   ?? 0} max={totalQ} cls="bg-red-400" />
              </div>
            )}
          </div>

          {/* Student onboarding funnel */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-4">Student Setup Funnel</h3>
            {isLoading ? (
              <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-6" />)}</div>
            ) : (
              <div className="space-y-4">
                <HorizBar label="Registered"       value={stats?.totalStudents ?? 0} max={stats?.totalStudents ?? 1} cls="bg-blue-400" />
                <HorizBar label="Account Active"   value={stats?.activeStudents ?? 0} max={stats?.totalStudents ?? 1} cls="bg-blue-500" />
                <HorizBar label="Setup Complete"   value={stats?.onboardingDone ?? 0} max={stats?.totalStudents ?? 1} cls="bg-violet-500" />
                <HorizBar label="Exam Date Set"    value={stats?.examDateSet ?? 0}    max={stats?.totalStudents ?? 1} cls="bg-violet-600" />
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Language split */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-4">Language Preference</h3>
            {isLoading ? <Skeleton className="h-24" /> : (
              <div className="space-y-4">
                <HorizBar
                  label="English (EN)"
                  value={(stats?.totalStudents ?? 0) - (stats?.arabicStudents ?? 0)}
                  max={stats?.totalStudents ?? 1}
                  cls="bg-slate-400"
                />
                <HorizBar
                  label="Arabic (AR)"
                  value={stats?.arabicStudents ?? 0}
                  max={stats?.totalStudents ?? 1}
                  cls="bg-emerald-500"
                />
              </div>
            )}
            {!isLoading && stats && (
              <div className="mt-4 pt-4 border-t border-slate-100 flex gap-4 text-center">
                <div className="flex-1">
                  <p className="text-lg font-bold text-slate-800">
                    {pct((stats.totalStudents - stats.arabicStudents), stats.totalStudents)}
                  </p>
                  <p className="text-xs text-slate-400">EN</p>
                </div>
                <div className="flex-1">
                  <p className="text-lg font-bold text-slate-800">
                    {pct(stats.arabicStudents, stats.totalStudents)}
                  </p>
                  <p className="text-xs text-slate-400">AR</p>
                </div>
              </div>
            )}
          </div>

          {/* Question attempt overview */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-4">Question Attempts</h3>
            {isLoading ? <Skeleton className="h-24" /> : (
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-sm text-slate-600">Total attempts</span>
                  <span className="text-sm font-semibold text-slate-900">{(stats?.totalAttempts ?? 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-sm text-slate-600">Correct answers</span>
                  <span className="text-sm font-semibold text-emerald-700">{(stats?.correctAttempts ?? 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-sm text-slate-600">Incorrect answers</span>
                  <span className="text-sm font-semibold text-red-600">
                    {((stats?.totalAttempts ?? 0) - (stats?.correctAttempts ?? 0)).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-sm text-slate-600">Overall accuracy</span>
                  <span className="text-sm font-bold text-slate-900">{stats?.accuracy ?? 0}%</span>
                </div>
              </div>
            )}
          </div>

          {/* Signup trend — last 30 days */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-1">New Signups</h3>
            <p className="text-xs text-slate-400 mb-4">Last 30 days • {totalSignups30d} total</p>
            {isLoading ? <Skeleton className="h-14" /> : (
              <div>
                <div className="overflow-x-auto">
                  {stats && <Sparkline data={stats.recentSignups} />}
                </div>
                <div className="flex justify-between text-[10px] text-slate-300 mt-1">
                  <span>{stats?.recentSignups[0]?.date.slice(5) ?? ''}</span>
                  <span>today</span>
                </div>
                {peakSignup > 0 && (
                  <p className="text-xs text-slate-400 mt-2">Peak: {peakSignup} in a day</p>
                )}
              </div>
            )}
          </div>
        </div>

      </PageContainer>
    </AppShell>
  );
}
