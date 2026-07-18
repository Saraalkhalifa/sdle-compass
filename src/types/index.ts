import type { UserRole, AccountStatus } from './database';

export type { UserRole, AccountStatus };

// ── User / Auth ───────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  account_status: AccountStatus;
  preferred_language: 'en' | 'ar';
  university?: string;
  graduation_year?: number;
  exam_date?: string;
  weekly_hours?: number;
  previous_attempt: boolean;
  avatar_color: string;
  created_at: string;
}

// ── Curriculum ────────────────────────────────────────────────────────────────

export interface Subject {
  id: string;
  name: string;
  name_ar: string;
  description: string;
  description_ar: string;
  icon: string;
  color: string;
  exam_weight: number;       // Percentage, configurable
  display_order: number;
  is_active: boolean;
  topic_count?: number;
  question_count?: number;
  created_at: string;
  updated_at: string;
}

export interface Topic {
  id: string;
  subject_id: string;
  name: string;
  name_ar: string;
  description?: string;
  display_order: number;
  estimated_hours: number;
  is_active: boolean;
  subtopic_count?: number;
  created_at: string;
}

export interface Subtopic {
  id: string;
  topic_id: string;
  name: string;
  name_ar: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export interface LearningObjective {
  id: string;
  subtopic_id: string;
  text: string;
  text_ar: string;
  bloom_level: 'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate' | 'create';
  display_order: number;
  created_at: string;
}

// ── Resources ─────────────────────────────────────────────────────────────────

export type ResourceType =
  | 'pdf_book'
  | 'book_reference'
  | 'guideline'
  | 'lecture_notes'
  | 'presentation'
  | 'video_upload'
  | 'video_link'
  | 'audio'
  | 'website'
  | 'image'
  | 'transcript';

export type ResourceStatus =
  | 'draft'
  | 'processing'
  | 'ai_processed'
  | 'awaiting_review'
  | 'changes_requested'
  | 'approved'
  | 'published'
  | 'archived'
  | 'processing_failed';

export interface Resource {
  id: string;
  title: string;
  title_ar?: string;
  description?: string;
  resource_type: ResourceType;
  status: ResourceStatus;
  subject_id: string;
  topic_id?: string;
  author?: string;
  edition?: string;
  publication_year?: number;
  language: 'en' | 'ar' | 'both';
  copyright_status: 'licensed' | 'open_access' | 'admin_created' | 'citation_only' | 'restricted';
  file_url?: string;
  external_url?: string;
  duration_seconds?: number;
  page_count?: number;
  uploaded_by: string;
  reviewed_by?: string;
  last_reviewed_at?: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

// ── Questions ─────────────────────────────────────────────────────────────────

export type QuestionType = 'single_best_answer' | 'clinical_scenario' | 'image_based' | 'true_false';
export type QuestionStatus =
  | 'draft'
  | 'ai_generated'
  | 'awaiting_review'
  | 'changes_requested'
  | 'approved'
  | 'published'
  | 'suspended'
  | 'archived';
export type DifficultyLevel = 1 | 2 | 3 | 4 | 5;

export interface Question {
  id: string;
  stem: string;
  stem_ar?: string;
  question_type: QuestionType;
  difficulty: DifficultyLevel;
  subject_id: string;
  topic_id?: string;
  subtopic_id?: string;
  learning_objective_id?: string;
  status: QuestionStatus;
  is_clinical_scenario: boolean;
  image_url?: string;
  explanation: string;
  source_book?: string;
  source_chapter?: string;
  source_page?: string;
  author_id: string;
  reviewer_id?: string;
  reviewed_at?: string;
  tags: string[];
  version: number;
  created_at: string;
  updated_at: string;
  options?: QuestionOption[];
}

export interface QuestionOption {
  id: string;
  question_id: string;
  text: string;
  text_ar?: string;
  is_correct: boolean;
  explanation?: string;
  display_order: number;
}

// ── Quiz ──────────────────────────────────────────────────────────────────────

export type QuizMode = 'study' | 'exam' | 'custom';

export interface QuizAttempt {
  id: string;
  user_id: string;
  quiz_mode: QuizMode;
  subject_id?: string;
  total_questions: number;
  correct_answers: number;
  score_percentage: number;
  time_spent_seconds: number;
  completed_at: string;
  created_at: string;
  responses?: QuizResponse[];
}

export interface QuizResponse {
  id: string;
  attempt_id: string;
  question_id: string;
  selected_option_id: string;
  is_correct: boolean;
  time_spent_seconds: number;
  confidence_level?: 1 | 2 | 3;
  is_flagged: boolean;
  created_at: string;
}

// ── Reports ───────────────────────────────────────────────────────────────────

export type ReportType =
  | 'incorrect_answer'
  | 'unclear_explanation'
  | 'incorrect_citation'
  | 'broken_link'
  | 'outdated_content'
  | 'typo'
  | 'duplicate_question'
  | 'missing_image'
  | 'ai_concern'
  | 'other';

export type ReportStatus = 'open' | 'reviewing' | 'resolved' | 'dismissed';
export type ReportSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface ContentReport {
  id: string;
  reporter_id: string;
  report_type: ReportType;
  severity: ReportSeverity;
  status: ReportStatus;
  content_type: 'question' | 'resource' | 'note' | 'video' | 'ai_response';
  content_id: string;
  comment: string;
  resolution_note?: string;
  assigned_to?: string;
  resolved_at?: string;
  created_at: string;
}

// ── Navigation ────────────────────────────────────────────────────────────────

export interface NavItem {
  label: string;
  labelAr?: string;
  href: string;
  icon: string;
  badge?: number | string;
  isActive?: boolean;
  children?: NavItem[];
  requiredRole?: UserRole[];
  comingSoon?: boolean;
}

// ── UI Utilities ──────────────────────────────────────────────────────────────

export type ColorVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'neutral';
export type SizeVariant = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type ButtonVariant = 'solid' | 'outline' | 'ghost' | 'link';
