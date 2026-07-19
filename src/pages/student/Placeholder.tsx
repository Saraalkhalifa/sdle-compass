import React from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { PageContainer } from '@/components/layout/PageContainer';
import { EmptyState } from '@/components/ui/EmptyState';

interface PlaceholderPageProps {
  title: string;
  description?: string;
  phase?: number;
}

export function PlaceholderPage({ title, description, phase }: PlaceholderPageProps) {
  return (
    <AppShell role="student" title={title}>
      <PageContainer title={title} maxWidth="xl">
        <div className="bg-white border border-slate-200 rounded-xl">
          <EmptyState
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            }
            title={`${title} — Coming Soon`}
            description={
              description ??
              (phase
                ? `This feature will be available in Phase ${phase} of development.`
                : 'This feature is under development and will be available soon.')
            }
          />
        </div>
      </PageContainer>
    </AppShell>
  );
}

