/**
 * Central application configuration.
 * Change APP_NAME here to rename the product across the entire frontend.
 */
export const APP_CONFIG = {
  name: 'SDLE Compass',
  nameAr: 'بوصلة SDLE',
  tagline: 'Your complete guide to the Saudi Dental Licensure Examination',
  taglineAr: 'دليلك الشامل لاختبار ترخيص طب الأسنان السعودي',
  version: '0.1.0',
  supportEmail: 'support@sdlecompass.sa',
  examName: 'Saudi Dental Licensure Examination',
  examNameAr: 'اختبار ترخيص طب الأسنان السعودي',
  examAbbreviation: 'SDLE',
} as const;

export const APP_NAME = APP_CONFIG.name;

/** Routes — single source of truth for all navigation paths */
export const ROUTES = {
  home: '/',
  login: '/login',
  signup: '/signup',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
  authCallback: '/auth/callback',
  onboarding: '/onboarding',

  // Student
  studentDashboard: '/dashboard',
  studyPlan: '/study-plan',
  subjects: '/subjects',
  subject: (id: string) => `/subjects/${id}`,
  topic: (subjectId: string, topicId: string) => `/subjects/${subjectId}/topics/${topicId}`,
  flashcardStudy: (subjectId: string, topicId: string, deckId: string) => `/subjects/${subjectId}/topics/${topicId}/flashcards/${deckId}`,
  questionBank: '/questions',
  mockExams: '/mock-exams',
  examSession: (examId: string, sessionId: string) => `/mock-exams/${examId}/session/${sessionId}`,
  examResults: (examId: string, sessionId: string) => `/mock-exams/${examId}/session/${sessionId}/results`,
  aiTutor: '/ai-tutor',
  resources: '/resources',
  performance: '/performance',
  bookmarks: '/bookmarks',
  profile: '/profile',

  // Admin
  adminDashboard: '/admin',
  adminSubjects: '/admin/subjects',
  adminSubjectDetail: (id: string) => `/admin/subjects/${id}`,
  adminTopicDetail: (subjectId: string, topicId: string) => `/admin/subjects/${subjectId}/topics/${topicId}`,
  adminResources: '/admin/resources',
  adminVideos: '/admin/videos',
  adminNotes: '/admin/notes',
  adminQuestions: '/admin/questions',
  adminQuestionImports: '/admin/question-imports',
  adminAIQueue: '/admin/ai-queue',
  adminMockExams: '/admin/mock-exams',
  adminStudents: '/admin/students',
  adminErrorReports: '/admin/error-reports',
  adminUsers: '/admin/users',
  adminAnalytics: '/admin/analytics',
  adminAuditLogs: '/admin/audit-logs',
  adminSettings: '/admin/settings',
} as const;

/** Feature flags — toggles for features not yet complete */
export const FEATURES = {
  aiTutor: true,          // Phase 11 ✓
  mockExams: true,         // Phase 8 ✓
  studyPlan: true,         // Phase 10 ✓
  flashcards: true,        // Phase 5 ✓
  pdfReader: true,         // Phase 4 ✓
  videoPlayer: true,       // Phase 4 ✓
  analytics: true,         // Phase 9 ✓
  globalSearch: true,      // Phase 14 ✓
  arabicUI: true,          // Phase 16 ✓
  notifications: true,     // Phase 17 ✓
} as const;
