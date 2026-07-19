/**
 * Supabase database type definitions.
 * Generated manually — replace with `supabase gen types` output when convenient.
 */
export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          role: UserRole;
          account_status: AccountStatus;
          preferred_language: 'en' | 'ar';
          university: string | null;
          graduation_year: number | null;
          exam_date: string | null;
          weekly_hours: number | null;
          previous_attempt: boolean;
          avatar_color: string;
          onboarding_completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name: string;
          role?: UserRole;
          account_status?: AccountStatus;
          preferred_language?: 'en' | 'ar';
          university?: string | null;
          graduation_year?: number | null;
          exam_date?: string | null;
          weekly_hours?: number | null;
          previous_attempt?: boolean;
          avatar_color?: string;
          onboarding_completed?: boolean;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          role?: UserRole;
          account_status?: AccountStatus;
          preferred_language?: 'en' | 'ar';
          university?: string | null;
          graduation_year?: number | null;
          exam_date?: string | null;
          weekly_hours?: number | null;
          previous_attempt?: boolean;
          avatar_color?: string;
          onboarding_completed?: boolean;
        };
        Relationships: [];
      };
      student_exam_settings: {
        Row: {
          id: string; user_id: string; exam_booked: boolean | null;
          exam_date: string | null; exam_period: string | null;
          is_first_attempt: boolean; previous_score: number | null;
          target_score: number | null; study_start_date: string | null;
          revision_days: number; created_at: string; updated_at: string;
        };
        Insert: {
          user_id: string; exam_booked?: boolean | null; exam_date?: string | null;
          exam_period?: string | null; is_first_attempt?: boolean;
          previous_score?: number | null; target_score?: number | null;
          study_start_date?: string | null; revision_days?: number;
        };
        Update: {
          exam_booked?: boolean | null; exam_date?: string | null;
          exam_period?: string | null; is_first_attempt?: boolean;
          previous_score?: number | null; target_score?: number | null;
          study_start_date?: string | null; revision_days?: number;
        };
        Relationships: [];
      };
      student_current_focus: {
        Row: {
          id: string; user_id: string; focus_type: string | null;
          priority_subject_id: string | null; focus_duration: string | null;
          focus_reason: string | null; created_at: string; updated_at: string;
        };
        Insert: {
          user_id: string; focus_type?: string | null;
          priority_subject_id?: string | null; focus_duration?: string | null;
          focus_reason?: string | null;
        };
        Update: {
          focus_type?: string | null; priority_subject_id?: string | null;
          focus_duration?: string | null; focus_reason?: string | null;
        };
        Relationships: [];
      };
      student_availability: {
        Row: {
          id: string; user_id: string;
          monday_hours: number; tuesday_hours: number; wednesday_hours: number;
          thursday_hours: number; friday_hours: number; saturday_hours: number; sunday_hours: number;
          preferred_session_length: string; preferred_study_time: string;
          rest_day: string | null; has_work_commitments: boolean;
          created_at: string; updated_at: string;
        };
        Insert: {
          user_id: string;
          monday_hours?: number; tuesday_hours?: number; wednesday_hours?: number;
          thursday_hours?: number; friday_hours?: number; saturday_hours?: number; sunday_hours?: number;
          preferred_session_length?: string; preferred_study_time?: string;
          rest_day?: string | null; has_work_commitments?: boolean;
        };
        Update: {
          monday_hours?: number; tuesday_hours?: number; wednesday_hours?: number;
          thursday_hours?: number; friday_hours?: number; saturday_hours?: number; sunday_hours?: number;
          preferred_session_length?: string; preferred_study_time?: string;
          rest_day?: string | null; has_work_commitments?: boolean;
        };
        Relationships: [];
      };
      study_preferences: {
        Row: {
          id: string; user_id: string; current_position: string | null;
          previous_study_methods: string[]; study_style: string | null;
          resource_order: string; preferred_formats: string[];
          answer_preference: string; explanation_detail: string;
          notification_preferences: string[]; created_at: string; updated_at: string;
        };
        Insert: {
          user_id: string; current_position?: string | null;
          previous_study_methods?: string[]; study_style?: string | null;
          resource_order?: string; preferred_formats?: string[];
          answer_preference?: string; explanation_detail?: string;
          notification_preferences?: string[];
        };
        Update: {
          current_position?: string | null; previous_study_methods?: string[];
          study_style?: string | null; resource_order?: string;
          preferred_formats?: string[]; answer_preference?: string;
          explanation_detail?: string; notification_preferences?: string[];
        };
        Relationships: [];
      };
      specialty_preferences: {
        Row: {
          id: string; user_id: string; primary_specialty: string | null;
          secondary_specialties: string[]; enrichment_level: string;
          created_at: string; updated_at: string;
        };
        Insert: {
          user_id: string; primary_specialty?: string | null;
          secondary_specialties?: string[]; enrichment_level?: string;
        };
        Update: {
          primary_specialty?: string | null; secondary_specialties?: string[];
          enrichment_level?: string;
        };
        Relationships: [];
      };
      subject_confidence: {
        Row: {
          id: string; user_id: string; subject_id: string;
          confidence_level: string; created_at: string; updated_at: string;
        };
        Insert: { user_id: string; subject_id: string; confidence_level?: string; };
        Update: { confidence_level?: string; };
        Relationships: [];
      };
      subjects: {
        Row: {
          id: string; name: string; name_ar: string;
          description: string | null; description_ar: string | null;
          icon: string | null; color: string | null;
          exam_weight: number; display_order: number;
          is_active: boolean; created_by: string | null;
          created_at: string; updated_at: string;
        };
        Insert: {
          name: string; name_ar: string;
          description?: string | null; description_ar?: string | null;
          icon?: string | null; color?: string | null;
          exam_weight?: number; display_order?: number; is_active?: boolean;
        };
        Update: {
          name?: string; name_ar?: string;
          description?: string | null; description_ar?: string | null;
          icon?: string | null; color?: string | null;
          exam_weight?: number; display_order?: number; is_active?: boolean;
        };
        Relationships: [];
      };
      topics: {
        Row: {
          id: string; subject_id: string; name: string; name_ar: string;
          description: string | null; description_ar: string;
          display_order: number; estimated_hours: number;
          is_active: boolean; created_at: string; updated_at: string;
        };
        Insert: {
          subject_id: string; name: string; name_ar?: string;
          description?: string | null; description_ar?: string;
          display_order?: number; estimated_hours?: number; is_active?: boolean;
        };
        Update: {
          name?: string; name_ar?: string;
          description?: string | null; description_ar?: string;
          display_order?: number; estimated_hours?: number; is_active?: boolean;
        };
        Relationships: [];
      };
      subtopics: {
        Row: {
          id: string; topic_id: string; name: string; name_ar: string;
          description: string | null; display_order: number;
          is_active: boolean; created_at: string; updated_at: string;
        };
        Insert: {
          topic_id: string; name: string; name_ar?: string;
          description?: string | null; display_order?: number; is_active?: boolean;
        };
        Update: {
          name?: string; name_ar?: string;
          description?: string | null; display_order?: number; is_active?: boolean;
        };
        Relationships: [];
      };
      learning_objectives: {
        Row: {
          id: string; subtopic_id: string; text: string; text_ar: string;
          bloom_level: string; display_order: number;
          created_at: string; updated_at: string;
        };
        Insert: {
          subtopic_id: string; text: string; text_ar?: string;
          bloom_level?: string; display_order?: number;
        };
        Update: {
          text?: string; text_ar?: string;
          bloom_level?: string; display_order?: number;
        };
        Relationships: [];
      };
      student_topic_progress: {
        Row: {
          id: string; user_id: string; topic_id: string;
          status: 'not_started' | 'in_progress' | 'completed';
          last_studied_at: string | null;
          created_at: string; updated_at: string;
        };
        Insert: {
          user_id: string; topic_id: string;
          status?: 'not_started' | 'in_progress' | 'completed';
          last_studied_at?: string | null;
        };
        Update: {
          status?: 'not_started' | 'in_progress' | 'completed';
          last_studied_at?: string | null;
        };
        Relationships: [];
      };
      resources: {
        Row: {
          id: string; topic_id: string; type: 'pdf' | 'video' | 'link';
          title: string; title_ar: string; description: string | null;
          url: string; duration_mins: number | null;
          display_order: number; is_active: boolean;
          created_by: string | null; created_at: string; updated_at: string;
        };
        Insert: {
          topic_id: string; type: 'pdf' | 'video' | 'link';
          title: string; title_ar?: string; description?: string | null;
          url: string; duration_mins?: number | null;
          display_order?: number; is_active?: boolean; created_by?: string | null;
        };
        Update: {
          type?: 'pdf' | 'video' | 'link'; title?: string; title_ar?: string;
          description?: string | null; url?: string; duration_mins?: number | null;
          display_order?: number; is_active?: boolean;
        };
        Relationships: [];
      };
      flashcard_decks: {
        Row: {
          id: string; topic_id: string; name: string; name_ar: string;
          description: string | null; display_order: number;
          is_active: boolean; created_by: string | null; created_at: string; updated_at: string;
        };
        Insert: {
          topic_id: string; name: string; name_ar?: string;
          description?: string | null; display_order?: number; is_active?: boolean; created_by?: string | null;
        };
        Update: {
          name?: string; name_ar?: string; description?: string | null;
          display_order?: number; is_active?: boolean;
        };
        Relationships: [];
      };
      flashcards: {
        Row: {
          id: string; deck_id: string;
          front_text: string; front_text_ar: string;
          back_text: string; back_text_ar: string;
          hint: string | null; display_order: number;
          is_active: boolean; created_at: string; updated_at: string;
        };
        Insert: {
          deck_id: string; front_text: string; front_text_ar?: string;
          back_text: string; back_text_ar?: string;
          hint?: string | null; display_order?: number; is_active?: boolean;
        };
        Update: {
          front_text?: string; front_text_ar?: string;
          back_text?: string; back_text_ar?: string;
          hint?: string | null; display_order?: number; is_active?: boolean;
        };
        Relationships: [];
      };
      student_flashcard_progress: {
        Row: {
          id: string; user_id: string; flashcard_id: string;
          status: 'new' | 'learning' | 'known';
          review_count: number; last_reviewed_at: string | null;
          created_at: string; updated_at: string;
        };
        Insert: {
          user_id: string; flashcard_id: string;
          status?: 'new' | 'learning' | 'known';
          review_count?: number; last_reviewed_at?: string | null;
        };
        Update: {
          status?: 'new' | 'learning' | 'known';
          review_count?: number; last_reviewed_at?: string | null;
        };
        Relationships: [];
      };
      questions: {
        Row: {
          id: string; topic_id: string; question_text: string; question_text_ar: string;
          explanation: string | null; explanation_ar: string | null;
          difficulty: 'easy' | 'medium' | 'hard';
          display_order: number; is_active: boolean;
          created_by: string | null; created_at: string; updated_at: string;
        };
        Insert: {
          topic_id: string; question_text: string; question_text_ar?: string;
          explanation?: string | null; explanation_ar?: string | null;
          difficulty?: 'easy' | 'medium' | 'hard';
          display_order?: number; is_active?: boolean; created_by?: string | null;
        };
        Update: {
          question_text?: string; question_text_ar?: string;
          explanation?: string | null; explanation_ar?: string | null;
          difficulty?: 'easy' | 'medium' | 'hard';
          display_order?: number; is_active?: boolean;
        };
        Relationships: [];
      };
      question_options: {
        Row: {
          id: string; question_id: string; option_text: string; option_text_ar: string;
          is_correct: boolean; display_order: number; created_at: string;
        };
        Insert: {
          question_id: string; option_text: string; option_text_ar?: string;
          is_correct?: boolean; display_order?: number;
        };
        Update: {
          option_text?: string; option_text_ar?: string; is_correct?: boolean; display_order?: number;
        };
        Relationships: [];
      };
      student_question_attempts: {
        Row: {
          id: string; user_id: string; question_id: string;
          selected_option_id: string | null; is_correct: boolean; created_at: string;
        };
        Insert: {
          user_id: string; question_id: string;
          selected_option_id?: string | null; is_correct?: boolean;
        };
        Update: { is_correct?: boolean; };
        Relationships: [];
      };
      topic_notes: {
        Row: {
          id: string; topic_id: string; title: string; title_ar: string;
          content: string; content_ar: string; display_order: number;
          is_active: boolean; created_by: string | null; created_at: string; updated_at: string;
        };
        Insert: {
          topic_id: string; title: string; title_ar?: string;
          content?: string; content_ar?: string;
          display_order?: number; is_active?: boolean; created_by?: string | null;
        };
        Update: {
          title?: string; title_ar?: string; content?: string; content_ar?: string;
          display_order?: number; is_active?: boolean;
        };
        Relationships: [];
      };
      student_notes: {
        Row: {
          id: string; user_id: string; topic_id: string; content: string;
          created_at: string; updated_at: string;
        };
        Insert: { user_id: string; topic_id: string; content?: string; };
        Update: { content?: string; };
        Relationships: [];
      };
      mock_exams: {
        Row: {
          id: string; title: string; title_ar: string;
          description: string | null; description_ar: string | null;
          duration_mins: number; passing_score: number;
          is_active: boolean; created_by: string | null; created_at: string; updated_at: string;
        };
        Insert: {
          title: string; title_ar?: string;
          description?: string | null; description_ar?: string | null;
          duration_mins?: number; passing_score?: number; is_active?: boolean; created_by?: string | null;
        };
        Update: {
          title?: string; title_ar?: string;
          description?: string | null; description_ar?: string | null;
          duration_mins?: number; passing_score?: number; is_active?: boolean;
        };
        Relationships: [];
      };
      mock_exam_questions: {
        Row: { id: string; exam_id: string; question_id: string; display_order: number; };
        Insert: { exam_id: string; question_id: string; display_order?: number; };
        Update: { display_order?: number; };
        Relationships: [];
      };
      student_exam_sessions: {
        Row: {
          id: string; user_id: string; exam_id: string;
          started_at: string; submitted_at: string | null;
          score: number | null; is_passed: boolean | null; time_taken_secs: number | null;
          created_at: string;
        };
        Insert: {
          user_id: string; exam_id: string; started_at?: string;
          submitted_at?: string | null; score?: number | null;
          is_passed?: boolean | null; time_taken_secs?: number | null;
        };
        Update: {
          submitted_at?: string | null; score?: number | null;
          is_passed?: boolean | null; time_taken_secs?: number | null;
        };
        Relationships: [];
      };
      student_exam_answers: {
        Row: {
          id: string; session_id: string; question_id: string;
          selected_option_id: string | null; is_correct: boolean; created_at: string;
        };
        Insert: {
          session_id: string; question_id: string;
          selected_option_id?: string | null; is_correct?: boolean;
        };
        Update: { selected_option_id?: string | null; is_correct?: boolean; };
        Relationships: [];
      };
      student_bookmarks: {
        Row: {
          id: string; user_id: string;
          item_type: 'question' | 'topic' | 'flashcard_deck';
          item_id: string; title: string; subtitle: string | null;
          item_route: string | null; created_at: string;
        };
        Insert: {
          user_id: string;
          item_type: 'question' | 'topic' | 'flashcard_deck';
          item_id: string; title: string; subtitle?: string | null;
          item_route?: string | null;
        };
        Update: { title?: string; subtitle?: string | null; item_route?: string | null; };
        Relationships: [];
      };
      ai_conversations: {
        Row: {
          id: string; user_id: string; title: string;
          created_at: string; updated_at: string;
        };
        Insert: { user_id: string; title?: string; };
        Update: { title?: string; updated_at?: string; };
        Relationships: [];
      };
      ai_messages: {
        Row: {
          id: string; conversation_id: string;
          role: 'user' | 'assistant'; content: string; created_at: string;
        };
        Insert: {
          conversation_id: string; role: 'user' | 'assistant'; content: string;
        };
        Update: { content?: string; };
        Relationships: [];
      };
      study_sessions: {
        Row: {
          id: string; user_id: string;
          topic_id: string | null; subject_id: string | null;
          session_type: 'study' | 'review' | 'mock_exam' | 'break';
          scheduled_date: string; duration_mins: number; title: string;
          is_completed: boolean; completed_at: string | null;
          created_at: string; updated_at: string;
        };
        Insert: {
          user_id: string;
          topic_id?: string | null; subject_id?: string | null;
          session_type?: 'study' | 'review' | 'mock_exam' | 'break';
          scheduled_date: string; duration_mins?: number; title: string;
          is_completed?: boolean; completed_at?: string | null;
        };
        Update: {
          topic_id?: string | null; subject_id?: string | null;
          session_type?: 'study' | 'review' | 'mock_exam' | 'break';
          scheduled_date?: string; duration_mins?: number; title?: string;
          is_completed?: boolean; completed_at?: string | null;
        };
        Relationships: [];
      };
      notifications: {
        Row: {
          id: string; user_id: string;
          type: 'exam_result' | 'study_reminder' | 'ai_response' | 'system' | 'achievement';
          title: string; title_ar: string | null;
          body: string | null; body_ar: string | null;
          href: string | null;
          is_read: boolean; created_at: string;
        };
        Insert: {
          user_id: string;
          type?: 'exam_result' | 'study_reminder' | 'ai_response' | 'system' | 'achievement';
          title: string; title_ar?: string | null;
          body?: string | null; body_ar?: string | null;
          href?: string | null; is_read?: boolean;
        };
        Update: { is_read?: boolean; };
        Relationships: [];
      };
      error_reports: {
        Row: {
          id: string; user_id: string;
          question_id: string | null; resource_id: string | null;
          type: 'wrong_answer' | 'broken_link' | 'typo' | 'outdated_content' | 'other';
          description: string;
          status: 'open' | 'in_review' | 'resolved' | 'dismissed';
          admin_notes: string | null; created_at: string; resolved_at: string | null;
        };
        Insert: {
          user_id: string;
          question_id?: string | null; resource_id?: string | null;
          type?: 'wrong_answer' | 'broken_link' | 'typo' | 'outdated_content' | 'other';
          description: string;
          status?: 'open' | 'in_review' | 'resolved' | 'dismissed';
          admin_notes?: string | null;
        };
        Update: {
          status?: 'open' | 'in_review' | 'resolved' | 'dismissed';
          admin_notes?: string | null; resolved_at?: string | null;
        };
        Relationships: [];
      };
      onboarding_progress: {
        Row: {
          id: string; user_id: string; last_step: number;
          exam_details_done: boolean; current_position_done: boolean;
          immediate_focus_done: boolean; availability_done: boolean;
          resource_preferences_done: boolean; specialty_preferences_done: boolean;
          learning_preferences_done: boolean; completed_at: string | null;
          created_at: string; updated_at: string;
        };
        Insert: {
          user_id: string; last_step?: number;
          exam_details_done?: boolean; current_position_done?: boolean;
          immediate_focus_done?: boolean; availability_done?: boolean;
          resource_preferences_done?: boolean; specialty_preferences_done?: boolean;
          learning_preferences_done?: boolean; completed_at?: string | null;
        };
        Update: {
          last_step?: number;
          exam_details_done?: boolean; current_position_done?: boolean;
          immediate_focus_done?: boolean; availability_done?: boolean;
          resource_preferences_done?: boolean; specialty_preferences_done?: boolean;
          learning_preferences_done?: boolean; completed_at?: string | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, { Args: Record<string, never>; Returns: never }>;
    Enums: {
      user_role: UserRole;
      account_status: AccountStatus;
    };
  };
}

export type UserRole = 'student' | 'editor' | 'reviewer' | 'admin' | 'main_admin';
export type AccountStatus = 'pending' | 'active' | 'suspended' | 'deleted';
