import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ROUTES } from '@/config/app';
import type { UserRole } from '@/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
}

function FullPageLoader() {
  return (
    <div className="min-h-dvh flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
          <svg className="animate-spin" width="22" height="22" viewBox="0 0 24 24" fill="none" aria-label="Loading">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4"/>
            <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
        </div>
        <p className="text-sm text-slate-500">Loading…</p>
      </div>
    </div>
  );
}

function NotConfigured() {
  return (
    <div className="min-h-dvh flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md text-center">
        <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="1.5" aria-hidden="true">
            <path strokeLinecap="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"/>
            <circle cx="12" cy="12" r="2.25"/>
          </svg>
        </div>
        <h1 className="text-xl font-bold text-slate-900 mb-2">Supabase Not Configured</h1>
        <p className="text-sm text-slate-600 leading-relaxed mb-5">
          SDLE Compass requires a Supabase project to run. Create a <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">.env</code> file
          at the project root with your Supabase credentials.
        </p>
        <div className="text-left bg-slate-800 text-slate-200 rounded-xl p-4 text-xs font-mono leading-loose">
          <p className="text-slate-400"># .env</p>
          <p>VITE_SUPABASE_URL=https://your-project.supabase.co</p>
          <p>VITE_SUPABASE_ANON_KEY=your-anon-key</p>
        </div>
        <p className="text-xs text-slate-400 mt-4">
          See <code className="text-xs">docs/ARCHITECTURE.md</code> for full setup instructions.
        </p>
      </div>
    </div>
  );
}

/** Shown when a user tries to access a route they don't have permission for */
function Forbidden() {
  return (
    <div className="min-h-dvh flex items-center justify-center bg-slate-50 px-4">
      <div className="text-center">
        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="1.5" aria-hidden="true">
            <path strokeLinecap="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/>
          </svg>
        </div>
        <h1 className="text-xl font-bold text-slate-900 mb-2">Access denied</h1>
        <p className="text-sm text-slate-500 mb-6">You don't have permission to view this page.</p>
        <a href={ROUTES.studentDashboard} className="text-sm text-blue-600 hover:underline">
          Go to your dashboard
        </a>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function ProtectedRoute({ children, requiredRoles }: ProtectedRouteProps) {
  const { isLoading, isAuthenticated, isConfigured, profile } = useAuth();
  const location = useLocation();

  if (!isConfigured) return <NotConfigured />;

  if (isLoading) return <FullPageLoader />;

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.login} state={{ from: location }} replace />;
  }

  if (requiredRoles && profile && !requiredRoles.includes(profile.role)) {
    return <Forbidden />;
  }

  // Redirect students who haven't completed onboarding (unless they're already there)
  if (
    !requiredRoles &&
    profile?.role === 'student' &&
    profile.onboarding_completed === false &&
    location.pathname !== ROUTES.onboarding
  ) {
    return <Navigate to={ROUTES.onboarding} replace />;
  }

  return <>{children}</>;
}

/** Guard for admin-only pages */
export function AdminRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requiredRoles={['admin', 'main_admin', 'editor', 'reviewer']}>
      {children}
    </ProtectedRoute>
  );
}

/** Guard that redirects authenticated users away (e.g., login page) */
export function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const { isLoading, isAuthenticated, isConfigured, profile } = useAuth();

  if (!isConfigured || isLoading) return null;

  if (isAuthenticated) {
    if (profile?.role === 'admin' || profile?.role === 'main_admin') {
      return <Navigate to={ROUTES.adminDashboard} replace />;
    }
    // Students who haven't completed onboarding → send to onboarding
    if (profile?.role === 'student' && profile.onboarding_completed === false) {
      return <Navigate to={ROUTES.onboarding} replace />;
    }
    return <Navigate to={ROUTES.studentDashboard} replace />;
  }

  return <>{children}</>;
}
