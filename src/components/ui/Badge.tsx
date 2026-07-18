import React from 'react';
import { cn } from '@/lib/utils';
import type { ColorVariant, SizeVariant } from '@/types';

interface BadgeProps {
  children: React.ReactNode;
  color?: ColorVariant;
  size?: Extract<SizeVariant, 'xs' | 'sm' | 'md'>;
  dot?: boolean;
  className?: string;
}

const colorMap: Record<ColorVariant, string> = {
  primary:   'bg-blue-100 text-blue-700 ring-blue-200/60',
  secondary: 'bg-slate-100 text-slate-600 ring-slate-200/60',
  success:   'bg-green-100 text-green-700 ring-green-200/60',
  warning:   'bg-amber-100 text-amber-700 ring-amber-200/60',
  error:     'bg-red-100 text-red-700 ring-red-200/60',
  info:      'bg-cyan-100 text-cyan-700 ring-cyan-200/60',
  neutral:   'bg-slate-100 text-slate-500 ring-slate-200/60',
};

const dotColorMap: Record<ColorVariant, string> = {
  primary:   'bg-blue-500',
  secondary: 'bg-slate-500',
  success:   'bg-green-500',
  warning:   'bg-amber-500',
  error:     'bg-red-500',
  info:      'bg-cyan-500',
  neutral:   'bg-slate-400',
};

const sizeMap = {
  xs: 'text-xs px-2 py-0.5 gap-1',
  sm: 'text-xs px-2.5 py-0.5 gap-1',
  md: 'text-sm px-3 py-1 gap-1.5',
};

export function Badge({ children, color = 'neutral', size = 'sm', dot = false, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full ring-1 ring-inset',
        colorMap[color],
        sizeMap[size],
        className,
      )}
    >
      {dot && (
        <span
          className={cn('h-1.5 w-1.5 rounded-full flex-shrink-0', dotColorMap[color])}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}

/** Convenience wrappers for question/resource status badges */
export function StatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { label: string; color: ColorVariant }> = {
    draft:             { label: 'Draft',            color: 'neutral' },
    processing:        { label: 'Processing',       color: 'info' },
    ai_generated:      { label: 'AI Generated',     color: 'info' },
    ai_processed:      { label: 'AI Processed',     color: 'info' },
    awaiting_review:   { label: 'Awaiting Review',  color: 'warning' },
    changes_requested: { label: 'Changes Needed',   color: 'warning' },
    approved:          { label: 'Approved',         color: 'success' },
    published:         { label: 'Published',        color: 'success' },
    suspended:         { label: 'Suspended',        color: 'error' },
    archived:          { label: 'Archived',         color: 'neutral' },
    processing_failed: { label: 'Failed',           color: 'error' },
  };

  const cfg = statusConfig[status] ?? { label: status, color: 'neutral' as ColorVariant };

  return (
    <Badge color={cfg.color} dot size="sm">
      {cfg.label}
    </Badge>
  );
}

export function DifficultyBadge({ level }: { level: 1 | 2 | 3 | 4 | 5 }) {
  const cfg: Record<number, { label: string; color: ColorVariant }> = {
    1: { label: 'Very Easy', color: 'success' },
    2: { label: 'Easy',      color: 'success' },
    3: { label: 'Medium',    color: 'warning' },
    4: { label: 'Hard',      color: 'error' },
    5: { label: 'Very Hard', color: 'error' },
  };
  const { label, color } = cfg[level] ?? { label: 'Unknown', color: 'neutral' as ColorVariant };
  return <Badge color={color} size="sm">{label}</Badge>;
}

export function RoleBadge({ role }: { role: string }) {
  const cfg: Record<string, { label: string; color: ColorVariant }> = {
    student:    { label: 'Student',           color: 'primary' },
    editor:     { label: 'Content Editor',    color: 'info' },
    reviewer:   { label: 'Clinical Reviewer', color: 'warning' },
    admin:      { label: 'Administrator',     color: 'error' },
    main_admin: { label: 'Main Admin',        color: 'error' },
  };
  const { label, color } = cfg[role] ?? { label: role, color: 'neutral' as ColorVariant };
  return <Badge color={color} size="sm">{label}</Badge>;
}
