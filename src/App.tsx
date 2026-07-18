import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { ROUTES } from '@/config/app';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute, AdminRoute, PublicOnlyRoute } from '@/components/auth/ProtectedRoute';

// Auth pages
import { Login } from '@/pages/auth/Login';
import { Signup } from '@/pages/auth/Signup';
import { ForgotPassword } from '@/pages/auth/ForgotPassword';
import { ResetPassword } from '@/pages/auth/ResetPassword';
import { AuthCallback } from '@/pages/auth/AuthCallback';

// Student pages
import { StudentDashboard } from '@/pages/student/Dashboard';
import { Subjects } from '@/pages/student/Subjects';
import { ProfilePage } from '@/pages/student/Profile';
import {
  StudyPlan,
  QuestionBank,
  MockExams,
  AITutor,
  Resources,
  Performance,
  Bookmarks,
} from '@/pages/student/Placeholder';

// Admin pages
import { AdminDashboard } from '@/pages/admin/Dashboard';
import { AdminUsers } from '@/pages/admin/Users';

// 404
import { NotFound } from '@/pages/NotFound';

// ── Query Client ──────────────────────────────────────────────────────────────
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 min
      retry: 2,
    },
  },
});

// ── Loading fallback ──────────────────────────────────────────────────────────
function PageLoader() {
  return (
    <div className="min-h-dvh flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center animate-pulse">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"/>
          </svg>
        </div>
        <p className="text-sm text-slate-500">Loading…</p>
      </div>
    </div>
  );
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public-only routes (redirect to dashboard if already logged in) */}
              <Route path={ROUTES.home}           element={<Navigate to={ROUTES.login} replace />} />
              <Route path={ROUTES.login}          element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
              <Route path={ROUTES.signup}         element={<PublicOnlyRoute><Signup /></PublicOnlyRoute>} />
              <Route path={ROUTES.forgotPassword} element={<PublicOnlyRoute><ForgotPassword /></PublicOnlyRoute>} />

              {/* Auth utility routes (accessible regardless of auth state) */}
              <Route path={ROUTES.resetPassword}  element={<ResetPassword />} />
              <Route path={ROUTES.authCallback}   element={<AuthCallback />} />

              {/* Student routes */}
              <Route path={ROUTES.studentDashboard} element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />
              <Route path={ROUTES.studyPlan}         element={<ProtectedRoute><StudyPlan /></ProtectedRoute>} />
              <Route path={ROUTES.subjects}          element={<ProtectedRoute><Subjects /></ProtectedRoute>} />
              <Route path={`${ROUTES.subjects}/:id`} element={<ProtectedRoute><Subjects /></ProtectedRoute>} />
              <Route path={ROUTES.questionBank}      element={<ProtectedRoute><QuestionBank /></ProtectedRoute>} />
              <Route path={ROUTES.mockExams}         element={<ProtectedRoute><MockExams /></ProtectedRoute>} />
              <Route path={ROUTES.aiTutor}           element={<ProtectedRoute><AITutor /></ProtectedRoute>} />
              <Route path={ROUTES.resources}         element={<ProtectedRoute><Resources /></ProtectedRoute>} />
              <Route path={ROUTES.performance}       element={<ProtectedRoute><Performance /></ProtectedRoute>} />
              <Route path={ROUTES.bookmarks}         element={<ProtectedRoute><Bookmarks /></ProtectedRoute>} />
              <Route path={ROUTES.profile}           element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

              {/* Admin routes */}
              <Route path={ROUTES.adminDashboard} element={<AdminRoute><AdminDashboard /></AdminRoute>} />
              <Route path={ROUTES.adminUsers}     element={<AdminRoute><AdminUsers /></AdminRoute>} />

              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </BrowserRouter>

      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          className: 'font-sans text-sm',
          duration: 4000,
        }}
        richColors
      />
    </QueryClientProvider>
  );
}
