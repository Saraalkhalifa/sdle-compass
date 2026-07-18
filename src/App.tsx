import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { ROUTES } from '@/config/app';

// Auth pages
import { Login } from '@/pages/auth/Login';
import { Signup } from '@/pages/auth/Signup';
import { ForgotPassword } from '@/pages/auth/ForgotPassword';

// Student pages
import { StudentDashboard } from '@/pages/student/Dashboard';
import { Subjects } from '@/pages/student/Subjects';
import {
  StudyPlan,
  QuestionBank,
  MockExams,
  AITutor,
  Resources,
  Performance,
  Bookmarks,
  Profile,
} from '@/pages/student/Placeholder';

// Admin pages
import { AdminDashboard } from '@/pages/admin/Dashboard';

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
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public routes */}
            <Route path={ROUTES.home}          element={<Navigate to={ROUTES.login} replace />} />
            <Route path={ROUTES.login}         element={<Login />} />
            <Route path={ROUTES.signup}        element={<Signup />} />
            <Route path={ROUTES.forgotPassword}element={<ForgotPassword />} />

            {/* Student routes */}
            <Route path={ROUTES.studentDashboard} element={<StudentDashboard />} />
            <Route path={ROUTES.studyPlan}         element={<StudyPlan />} />
            <Route path={ROUTES.subjects}          element={<Subjects />} />
            <Route path={`${ROUTES.subjects}/:id`} element={<Subjects />} />
            <Route path={ROUTES.questionBank}      element={<QuestionBank />} />
            <Route path={ROUTES.mockExams}         element={<MockExams />} />
            <Route path={ROUTES.aiTutor}           element={<AITutor />} />
            <Route path={ROUTES.resources}         element={<Resources />} />
            <Route path={ROUTES.performance}       element={<Performance />} />
            <Route path={ROUTES.bookmarks}         element={<Bookmarks />} />
            <Route path={ROUTES.profile}           element={<Profile />} />

            {/* Admin routes */}
            <Route path={ROUTES.adminDashboard} element={<AdminDashboard />} />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
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
