import React from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { PageContainer } from '@/components/layout/PageContainer';
import { APP_CONFIG, FEATURES, ROUTES } from '@/config/app';

// ── Section wrapper ───────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div className="px-5 py-3 border-b border-slate-100 bg-slate-50">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{title}</h3>
      </div>
      <div className="divide-y divide-slate-100">{children}</div>
    </div>
  );
}

function Row({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between px-5 py-3 gap-4">
      <span className="text-sm text-slate-500 shrink-0">{label}</span>
      <span className={`text-sm font-medium text-slate-800 text-right ${mono ? 'font-mono text-xs bg-slate-100 px-2 py-0.5 rounded' : ''}`}>
        {value}
      </span>
    </div>
  );
}

function FeatureRow({ label, enabled, note }: { label: string; enabled: boolean; note?: string }) {
  return (
    <div className="flex items-center justify-between px-5 py-3 gap-4">
      <div className="min-w-0">
        <span className="text-sm text-slate-700 font-medium">{label}</span>
        {note && <span className="ml-2 text-xs text-slate-400">{note}</span>}
      </div>
      <span className={`shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full ${enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
        {enabled ? 'Enabled' : 'Disabled'}
      </span>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function AdminSettings() {
  return (
    <AppShell role="admin" title="Settings">
      <PageContainer
        title="Platform Settings"
        description="Configuration overview for SDLE Compass"
        maxWidth="xl"
      >
        <div className="space-y-5">

          {/* App identity */}
          <Section title="Application Identity">
            <Row label="Product name"     value={APP_CONFIG.name} />
            <Row label="Arabic name"      value={APP_CONFIG.nameAr} />
            <Row label="Exam name"        value={APP_CONFIG.examName} />
            <Row label="Abbreviation"     value={APP_CONFIG.examAbbreviation} />
            <Row label="Support email"    value={APP_CONFIG.supportEmail} />
            <Row label="Version"          value={APP_CONFIG.version} mono />
          </Section>

          {/* Feature flags */}
          <Section title="Feature Flags">
            <FeatureRow label="AI Tutor"        enabled={FEATURES.aiTutor}       note="Phase 11" />
            <FeatureRow label="Mock Exams"       enabled={FEATURES.mockExams}      note="Phase 8" />
            <FeatureRow label="Study Plan"       enabled={FEATURES.studyPlan}      note="Phase 10" />
            <FeatureRow label="Flashcards"       enabled={FEATURES.flashcards}     note="Phase 5" />
            <FeatureRow label="PDF Reader"       enabled={FEATURES.pdfReader}      note="Phase 4" />
            <FeatureRow label="Video Player"     enabled={FEATURES.videoPlayer}    note="Phase 4" />
            <FeatureRow label="Analytics"        enabled={FEATURES.analytics}      note="Phase 9" />
            <FeatureRow label="Global Search"    enabled={FEATURES.globalSearch}   note="Phase 14" />
            <FeatureRow label="Arabic UI (RTL)"  enabled={FEATURES.arabicUI}       note="Phase 16" />
            <FeatureRow label="Notifications"    enabled={FEATURES.notifications}  note="Phase 17" />
          </Section>

          {/* Route map */}
          <Section title="Route Registry">
            {(Object.entries(ROUTES) as [string, string | ((...args: string[]) => string)][])
              .filter(([, v]) => typeof v === 'string')
              .map(([key, path]) => (
                <Row key={key} label={key} value={path as string} mono />
              ))}
          </Section>

          {/* Supabase */}
          <Section title="Backend">
            <Row label="Provider"       value="Supabase (PostgreSQL + GoTrue)" />
            <Row label="Project ref"    value="bzyamwzrzpabsmrfbapv" mono />
            <Row label="Region"         value="ap-southeast-1 (Singapore)" />
            <Row label="Auth provider"  value="Email / Magic link" />
            <Row label="Realtime"       value="postgres_changes (notifications)" />
            <Row label="Edge Functions" value="ai-tutor (Anthropic claude-3-5-haiku)" />
            <Row label="RLS"            value="Enabled on all tables" />
          </Section>

          {/* Pending items */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
            <p className="text-sm font-semibold text-amber-800 mb-3">Pending setup</p>
            <ul className="space-y-2">
              {[
                { label: 'Run migrations', detail: '011_notifications.sql in Supabase SQL Editor' },
                { label: 'Deploy Edge Function', detail: 'supabase functions deploy ai-tutor --project-ref bzyamwzrzpabsmrfbapv' },
                { label: 'Set Anthropic secret', detail: 'supabase secrets set ANTHROPIC_API_KEY=… --project-ref bzyamwzrzpabsmrfbapv' },
                { label: 'Error reports table', detail: 'DB table + RLS for student-submitted content flags' },
                { label: 'Audit logs table', detail: 'audit_events table with server-side writes via Edge Function' },
              ].map(item => (
                <li key={item.label} className="flex items-start gap-2">
                  <span className="mt-0.5 w-4 h-4 border-2 border-amber-400 rounded shrink-0" />
                  <div>
                    <span className="text-sm font-medium text-amber-900">{item.label}</span>
                    <p className="text-xs text-amber-700 mt-0.5 font-mono">{item.detail}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </PageContainer>
    </AppShell>
  );
}
