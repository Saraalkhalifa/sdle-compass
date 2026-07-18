import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES, APP_CONFIG } from '@/config/app';
import { Button } from '@/components/ui/Button';

export function NotFound() {
  return (
    <div className="min-h-dvh bg-slate-50 flex flex-col items-center justify-center px-4 py-12 text-center">
      <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-6">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" aria-hidden="true">
          <path strokeLinecap="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
      </div>
      <h1 className="text-3xl font-bold text-slate-900 mb-2">Page not found</h1>
      <p className="text-slate-500 max-w-sm mb-8">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="flex items-center gap-3">
        <Button onClick={() => window.history.back()} variant="outline">Go back</Button>
        <Link to={ROUTES.studentDashboard}>
          <Button>Return to dashboard</Button>
        </Link>
      </div>
      <p className="text-xs text-slate-400 mt-12">{APP_CONFIG.name}</p>
    </div>
  );
}
