import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: 'sm' | 'md' | 'lg' | 'full';
}

export function Skeleton({ className, width, height, rounded = 'md' }: SkeletonProps) {
  const roundedMap = { sm: 'rounded', md: 'rounded-lg', lg: 'rounded-xl', full: 'rounded-full' };
  return (
    <div
      className={cn('animate-shimmer', roundedMap[rounded], className)}
      style={{ width, height: height ?? '1rem' }}
      aria-hidden="true"
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 shadow-sm">
      <div className="flex items-center gap-3">
        <Skeleton width={40} height={40} rounded="lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="w-3/4" height={14} />
          <Skeleton className="w-1/2" height={12} />
        </div>
      </div>
      <Skeleton className="w-full" height={10} />
      <Skeleton className="w-5/6" height={10} />
      <Skeleton className="w-2/3" height={10} />
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-2">
      <div className="flex gap-4 pb-2 border-b border-slate-200">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="flex-1" height={12} />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 py-2">
          {Array.from({ length: cols }).map((_, j) => (
            <Skeleton key={j} className="flex-1" height={12} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={i === lines - 1 ? 'w-3/4' : 'w-full'}
          height={12}
        />
      ))}
    </div>
  );
}
