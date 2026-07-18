import React from 'react';
import { cn } from '@/lib/utils';
import { Breadcrumbs } from '@/components/ui';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageContainerProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

const maxWidthMap = {
  sm:   'max-w-2xl',
  md:   'max-w-4xl',
  lg:   'max-w-5xl',
  xl:   'max-w-6xl',
  '2xl':'max-w-7xl',
  full: 'max-w-none',
};

export function PageContainer({
  children,
  title,
  description,
  breadcrumbs,
  actions,
  className,
  maxWidth = 'xl',
}: PageContainerProps) {
  return (
    <main
      className={cn('flex-1 px-4 md:px-6 py-5 pb-24 lg:pb-6', className)}
      id="main-content"
    >
      <div className={cn('mx-auto w-full', maxWidthMap[maxWidth])}>
        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <Breadcrumbs items={breadcrumbs} className="mb-3" />
        )}

        {/* Page header */}
        {(title || actions) && (
          <div className="flex items-start justify-between gap-4 mb-6">
            {title && (
              <div>
                <h1 className="text-xl font-bold text-slate-900">{title}</h1>
                {description && (
                  <p className="text-sm text-slate-500 mt-0.5">{description}</p>
                )}
              </div>
            )}
            {actions && (
              <div className="flex items-center gap-2 flex-shrink-0">
                {actions}
              </div>
            )}
          </div>
        )}

        {/* Page content */}
        {children}
      </div>
    </main>
  );
}
