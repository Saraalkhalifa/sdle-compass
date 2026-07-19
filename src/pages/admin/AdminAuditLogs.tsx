import React from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { PageContainer } from '@/components/layout/PageContainer';

const EVENT_TYPES = [
  {
    icon: '🔐',
    color: 'bg-blue-50 border-blue-100',
    label: 'Auth events',
    desc: 'User sign-in, sign-out, password resets, and failed login attempts.',
    examples: ['student signed in', 'password reset requested', 'failed login (3 attempts)'],
  },
  {
    icon: '✏️',
    color: 'bg-violet-50 border-violet-100',
    label: 'Content changes',
    desc: 'Questions added, edited, or deleted; resources and notes updated.',
    examples: ['question #128 activated', 'resource "ECG Basics.pdf" added', 'note deleted in Cardiology'],
  },
  {
    icon: '👤',
    color: 'bg-amber-50 border-amber-100',
    label: 'Account actions',
    desc: 'Student accounts suspended, activated, or role changes.',
    examples: ['student suspended: user@example.com', 'account reactivated', 'role changed to editor'],
  },
  {
    icon: '🤖',
    color: 'bg-emerald-50 border-emerald-100',
    label: 'AI & system',
    desc: 'AI Tutor usage, bulk imports, exam session completions.',
    examples: ['bulk import: 42 questions added', 'AI session started', 'mock exam published'],
  },
];

export function AdminAuditLogs() {
  return (
    <AppShell role="admin" title="Audit Logs">
      <PageContainer
        title="Audit Logs"
        description="Tamper-evident log of all admin and system events"
        maxWidth="xl"
      >
        <div className="bg-white border border-dashed border-slate-200 rounded-xl py-12 px-6">
          {/* Icon */}
          <div className="w-14 h-14 mx-auto mb-4 bg-slate-100 rounded-2xl flex items-center justify-center">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
          </div>

          <p className="text-center text-base font-semibold text-slate-800">Audit logging coming soon</p>
          <p className="text-center text-sm text-slate-400 mt-1.5 max-w-sm mx-auto">
            When enabled, every admin action and system event will be recorded here with a full timestamp and actor trail.
          </p>

          {/* Event type grid */}
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {EVENT_TYPES.map(evt => (
              <div key={evt.label} className={`rounded-xl p-4 border ${evt.color}`}>
                <p className="text-lg mb-1">{evt.icon}</p>
                <p className="text-sm font-semibold text-slate-800">{evt.label}</p>
                <p className="text-xs text-slate-500 mt-0.5 mb-2 leading-relaxed">{evt.desc}</p>
                <ul className="space-y-0.5">
                  {evt.examples.map(ex => (
                    <li key={ex} className="flex items-center gap-1.5 text-xs text-slate-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" />
                      <span className="font-mono">{ex}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Implementation note */}
          <div className="mt-8 max-w-lg mx-auto bg-slate-50 border border-slate-200 rounded-xl p-4">
            <p className="text-xs font-semibold text-slate-600 mb-1">Implementation note</p>
            <p className="text-xs text-slate-500 leading-relaxed">
              Audit logs require a dedicated <code className="font-mono bg-white px-1 rounded border border-slate-200">audit_events</code> table with RLS restricted to <code className="font-mono bg-white px-1 rounded border border-slate-200">main_admin</code>. Events are written server-side via Edge Functions to prevent client-side spoofing.
            </p>
          </div>
        </div>
      </PageContainer>
    </AppShell>
  );
}
