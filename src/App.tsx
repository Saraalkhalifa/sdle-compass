import React, { Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { ROUTES } from '@/config/app';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { LanguageProvider, useLanguage } from '@/contexts/LanguageContext';
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
import { SubjectDetail } from '@/pages/student/SubjectDetail';
import { TopicDetail } from '@/pages/student/TopicDetail';
import { FlashcardStudy } from '@/pages/student/FlashcardStudy';
import { MockExams } from '@/pages/student/MockExams';
import { ExamSession } from '@/pages/student/ExamSession';
import { ExamResults } from '@/pages/student/ExamResults';
import { Performance } from '@/pages/student/Performance';
import { StudyPlan } from '@/pages/student/StudyPlan';
import { AITutor } from '@/pages/student/AITutor';
import { QuestionBank } from '@/pages/student/QuestionBank';
import { Bookmarks } from '@/pages/student/Bookmarks';
import { Resources } from '@/pages/student/Resources';
import { ProfilePage } from '@/pages/student/Profile';

// Onboarding
import { Onboarding } from '@/pages/onboarding/Onboarding';

// Admin pages
import { AdminDashboard } from '@/pages/admin/Dashboard';
import { AdminUsers } from '@/pages/admin/Users';
import { AdminSubjects } from '@/pages/admin/AdminSubjects';
import { AdminSubjectDetail } from '@/pages/admin/AdminSubjectDetail';
import { AdminTopicDetail } from '@/pages/admin/AdminTopicDetail';
import { AdminMockExams } from '@/pages/admin/AdminMockExams';
import { AdminQuestions } from '@/pages/admin/AdminQuestions';
import { AdminQuestionImports } from '@/pages/admin/AdminQuestionImports';
import { AdminAIQueue } from '@/pages/admin/AdminAIQueue';
import { AdminStudents } from '@/pages/admin/AdminStudents';
import { AdminAnalytics } from '@/pages/admin/AdminAnalytics';
import { AdminErrorReports } from '@/pages/admin/AdminErrorReports';
import { AdminResources } from '@/pages/admin/AdminResources';
import { AdminNotes } from '@/pages/admin/AdminNotes';
import { AdminVideos } from '@/pages/admin/AdminVideos';
import { AdminAuditLogs } from '@/pages/admin/AdminAuditLogs';
import { AdminSettings } from '@/pages/admin/AdminSettings';

// Public pages
import { LandingPage } from '@/pages/public/LandingPage';

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

// Syncs profile.preferred_language → LanguageContext (once, on first login if no localStorage value)
function LanguageSyncer() {
  const { profile } = useAuth();
  const { setLang } = useLanguage();
  useEffect(() => {
    if (!profile) return;
    try {
      const stored = localStorage.getItem('sdle-lang');
      if (!stored) setLang(profile.preferred_language);
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.preferred_language]);
  return null;
}

export function App() {
  return (
    <LanguageProvider>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <AuthProvider>
          <LanguageSyncer />
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public-only routes (redirect to dashboard if already logged in) */}
              <Route path={ROUTES.home}           element={<LandingPage />} />
              <Route path={ROUTES.login}          element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
              <Route path={ROUTES.signup}         element={<PublicOnlyRoute><Signup /></PublicOnlyRoute>} />
              <Route path={ROUTES.forgotPassword} element={<PublicOnlyRoute><ForgotPassword /></PublicOnlyRoute>} />

              {/* Auth utility routes (accessible regardless of auth state) */}
              <Route path={ROUTES.resetPassword}  element={<ResetPassword />} />
              <Route path={ROUTES.authCallback}   element={<AuthCallback />} />

              {/* Onboarding */}
              <Route path={ROUTES.onboarding} element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />

              {/* Student routes */}
              <Route path={ROUTES.studentDashboard}                                       element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />
              <Route path={ROUTES.studyPlan}                                              element={<ProtectedRoute><StudyPlan /></ProtectedRoute>} />
              <Route path={ROUTES.subjects}                                               element={<ProtectedRoute><Subjects /></ProtectedRoute>} />
              <Route path="/subjects/:subjectId"                                          element={<ProtectedRoute><SubjectDetail /></ProtectedRoute>} />
              <Route path="/subjects/:subjectId/topics/:topicId"                         element={<ProtectedRoute><TopicDetail /></ProtectedRoute>} />
              <Route path="/subjects/:subjectId/topics/:topicId/flashcards/:deckId"     element={<ProtectedRoute><FlashcardStudy /></ProtectedRoute>} />
              <Route path={ROUTES.questionBank}      element={<ProtectedRoute><QuestionBank /></ProtectedRoute>} />
              <Route path={ROUTES.mockExams}         element={<ProtectedRoute><MockExams /></ProtectedRoute>} />
              <Route path="/mock-exams/:examId/session/:sessionId"         element={<ProtectedRoute><ExamSession /></ProtectedRoute>} />
              <Route path="/mock-exams/:examId/session/:sessionId/results" element={<ProtectedRoute><ExamResults /></ProtectedRoute>} />
              <Route path={ROUTES.aiTutor}           element={<ProtectedRoute><AITutor /></ProtectedRoute>} />
              <Route path={ROUTES.resources}         element={<ProtectedRoute><Resources /></ProtectedRoute>} />
              <Route path={ROUTES.performance}       element={<ProtectedRoute><Performance /></ProtectedRoute>} />
              <Route path={ROUTES.bookmarks}         element={<ProtectedRoute><Bookmarks /></ProtectedRoute>} />
              <Route path={ROUTES.profile}           element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

              {/* Admin routes */}
              <Route path={ROUTES.adminDashboard}                               element={<AdminRoute><AdminDashboard /></AdminRoute>} />
              <Route path={ROUTES.adminUsers}                                   element={<AdminRoute><AdminUsers /></AdminRoute>} />
              <Route path={ROUTES.adminSubjects}                                element={<AdminRoute><AdminSubjects /></AdminRoute>} />
              <Route path="/admin/subjects/:subjectId"                          element={<AdminRoute><AdminSubjectDetail /></AdminRoute>} />
              <Route path="/admin/subjects/:subjectId/topics/:topicId"          element={<AdminRoute><AdminTopicDetail /></AdminRoute>} />
              <Route path={ROUTES.adminMockExams}                              element={<AdminRoute><AdminMockExams /></AdminRoute>} />
              <Route path={ROUTES.adminQuestions}                             element={<AdminRoute><AdminQuestions /></AdminRoute>} />
              <Route path={ROUTES.adminQuestionImports}                       element={<AdminRoute><AdminQuestionImports /></AdminRoute>} />
              <Route path={ROUTES.adminAIQueue}                               element={<AdminRoute><AdminAIQueue /></AdminRoute>} />
              <Route path={ROUTES.adminStudents}                             element={<AdminRoute><AdminStudents /></AdminRoute>} />
              <Route path={ROUTES.adminAnalytics}                            element={<AdminRoute><AdminAnalytics /></AdminRoute>} />
              <Route path={ROUTES.adminErrorReports}                         element={<AdminRoute><AdminErrorReports /></AdminRoute>} />
              <Route path={ROUTES.adminResources}                            element={<AdminRoute><AdminResources /></AdminRoute>} />
              <Route path={ROUTES.adminNotes}                                element={<AdminRoute><AdminNotes /></AdminRoute>} />
              <Route path={ROUTES.adminVideos}                               element={<AdminRoute><AdminVideos /></AdminRoute>} />
              <Route path={ROUTES.adminAuditLogs}                            element={<AdminRoute><AdminAuditLogs /></AdminRoute>} />
              <Route path={ROUTES.adminSettings}                             element={<AdminRoute><AdminSettings /></AdminRoute>} />

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
    </LanguageProvider>
  );
}
