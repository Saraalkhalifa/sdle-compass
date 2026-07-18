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

  // Student
  studentDashboard: '/dashboard',
  studyPlan: '/study-plan',
  subjects: '/subjects',
  subject: (id: string) => `/subjects/${id}`,
  topic: (subjectId: string, topicId: string) => `/subjects/${subjectId}/topics/${topicId}`,
  questionBank: '/questions',
  mockExams: '/mock-exams',
  aiTutor: '/ai-tutor',
  resources: '/resources',
  performance: '/performance',
  bookmarks: '/bookmarks',
  profile: '/profile',

  // Admin
  adminDashboard: '/admin',
  adminSubjects: '/admin/subjects',
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
  aiTutor: false,         // Phase 11
  mockExams: false,        // Phase 8
  studyPlan: false,        // Phase 10
  flashcards: false,       // Phase 5
  pdfReader: false,        // Phase 4
  videoPlayer: false,      // Phase 4
  analytics: false,        // Phase 9
  globalSearch: false,     // Phase 14
  arabicUI: false,         // Phase 16
  notifications: false,    // Phase 17
} as const;
