import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { Database } from '@/types/database';

type ExamRow = Database['public']['Tables']['student_exam_settings']['Row'];
type ExamUpdate = Database['public']['Tables']['student_exam_settings']['Update'];
type FocusRow = Database['public']['Tables']['student_current_focus']['Row'];
type FocusUpdate = Database['public']['Tables']['student_current_focus']['Update'];
type AvailRow = Database['public']['Tables']['student_availability']['Row'];
type AvailUpdate = Database['public']['Tables']['student_availability']['Update'];
type StudyRow = Database['public']['Tables']['study_preferences']['Row'];
type StudyUpdate = Database['public']['Tables']['study_preferences']['Update'];
type SpecialtyRow = Database['public']['Tables']['specialty_preferences']['Row'];
type SpecialtyUpdate = Database['public']['Tables']['specialty_preferences']['Update'];

export interface SubjectOption { id: string; name: string; name_ar: string; }
export interface SubjectConfidence { subject_id: string; confidence_level: string; }

export interface OnboardingState {
  loading: boolean;
  initialStep: number;
  examSettings: ExamRow | null;
  currentFocus: FocusRow | null;
  availability: AvailRow | null;
  studyPrefs: StudyRow | null;
  specialty: SpecialtyRow | null;
  subjectConfidence: SubjectConfidence[];
  subjects: SubjectOption[];
}

export function useOnboarding() {
  const { session, refreshProfile } = useAuth();
  const userId = session?.user?.id;

  const [state, setState] = useState<OnboardingState>({
    loading: true,
    initialStep: 1,
    examSettings: null,
    currentFocus: null,
    availability: null,
    studyPrefs: null,
    specialty: null,
    subjectConfidence: [],
    subjects: [],
  });

  useEffect(() => {
    if (!supabase || !userId) {
      setState((s) => ({ ...s, loading: false }));
      return;
    }

    (async () => {
      const [
        { data: exam },
        { data: focus },
        { data: avail },
        { data: study },
        { data: specialty },
        { data: confidence },
        { data: progress },
        { data: subjects },
      ] = await Promise.all([
        supabase.from('student_exam_settings').select('*').eq('user_id', userId).maybeSingle(),
        supabase.from('student_current_focus').select('*').eq('user_id', userId).maybeSingle(),
        supabase.from('student_availability').select('*').eq('user_id', userId).maybeSingle(),
        supabase.from('study_preferences').select('*').eq('user_id', userId).maybeSingle(),
        supabase.from('specialty_preferences').select('*').eq('user_id', userId).maybeSingle(),
        supabase.from('subject_confidence').select('subject_id, confidence_level').eq('user_id', userId),
        supabase.from('onboarding_progress').select('*').eq('user_id', userId).maybeSingle(),
        supabase.from('subjects').select('id, name, name_ar').eq('is_active', true).order('display_order'),
      ]);

      setState({
        loading: false,
        initialStep: progress?.last_step ?? 1,
        examSettings: exam ?? null,
        currentFocus: focus ?? null,
        availability: avail ?? null,
        studyPrefs: study ?? null,
        specialty: specialty ?? null,
        subjectConfidence: (confidence ?? []).map((c) => ({
          subject_id: c.subject_id,
          confidence_level: c.confidence_level,
        })),
        subjects: Array.from(
          new Map((subjects ?? []).map((s) => [s.name, s])).values()
        ) as SubjectOption[],
      });
    })();
  }, [userId]);

  const saveExam = useCallback(async (data: ExamUpdate, nextStep: number) => {
    if (!supabase || !userId) return;
    await Promise.all([
      supabase.from('student_exam_settings').upsert({ user_id: userId, ...data }, { onConflict: 'user_id' }),
      supabase.from('onboarding_progress').upsert(
        { user_id: userId, last_step: nextStep, exam_details_done: true },
        { onConflict: 'user_id' },
      ),
    ]);
  }, [userId]);

  const savePosition = useCallback(async (
    studyData: Pick<StudyUpdate, 'current_position' | 'previous_study_methods'>,
    confidence: SubjectConfidence[],
    nextStep: number,
  ) => {
    if (!supabase || !userId) return;
    await supabase.from('study_preferences').upsert({ user_id: userId, ...studyData }, { onConflict: 'user_id' });
    // Delete then insert to avoid upsert complexity on composite unique key
    await supabase.from('subject_confidence').delete().eq('user_id', userId);
    if (confidence.length > 0) {
      await supabase.from('subject_confidence').insert(
        confidence.map((c) => ({ user_id: userId, subject_id: c.subject_id, confidence_level: c.confidence_level })),
      );
    }
    await supabase.from('onboarding_progress').upsert(
      { user_id: userId, last_step: nextStep, current_position_done: true },
      { onConflict: 'user_id' },
    );
  }, [userId]);

  const saveFocus = useCallback(async (data: FocusUpdate, nextStep: number) => {
    if (!supabase || !userId) return;
    await Promise.all([
      supabase.from('student_current_focus').upsert({ user_id: userId, ...data }, { onConflict: 'user_id' }),
      supabase.from('onboarding_progress').upsert(
        { user_id: userId, last_step: nextStep, immediate_focus_done: true },
        { onConflict: 'user_id' },
      ),
    ]);
  }, [userId]);

  const saveAvailability = useCallback(async (data: AvailUpdate, nextStep: number) => {
    if (!supabase || !userId) return;
    await Promise.all([
      supabase.from('student_availability').upsert({ user_id: userId, ...data }, { onConflict: 'user_id' }),
      supabase.from('onboarding_progress').upsert(
        { user_id: userId, last_step: nextStep, availability_done: true },
        { onConflict: 'user_id' },
      ),
    ]);
  }, [userId]);

  const saveResources = useCallback(async (
    data: Pick<StudyUpdate, 'resource_order' | 'preferred_formats'>,
    nextStep: number,
  ) => {
    if (!supabase || !userId) return;
    await Promise.all([
      supabase.from('study_preferences').upsert({ user_id: userId, ...data }, { onConflict: 'user_id' }),
      supabase.from('onboarding_progress').upsert(
        { user_id: userId, last_step: nextStep, resource_preferences_done: true },
        { onConflict: 'user_id' },
      ),
    ]);
  }, [userId]);

  const saveSpecialty = useCallback(async (data: SpecialtyUpdate, nextStep: number) => {
    if (!supabase || !userId) return;
    await Promise.all([
      supabase.from('specialty_preferences').upsert({ user_id: userId, ...data }, { onConflict: 'user_id' }),
      supabase.from('onboarding_progress').upsert(
        { user_id: userId, last_step: nextStep, specialty_preferences_done: true },
        { onConflict: 'user_id' },
      ),
    ]);
  }, [userId]);

  const saveStyle = useCallback(async (
    data: Pick<StudyUpdate, 'study_style' | 'answer_preference' | 'explanation_detail' | 'notification_preferences'>,
    nextStep: number,
  ) => {
    if (!supabase || !userId) return;
    await Promise.all([
      supabase.from('study_preferences').upsert({ user_id: userId, ...data }, { onConflict: 'user_id' }),
      supabase.from('onboarding_progress').upsert(
        { user_id: userId, last_step: nextStep, learning_preferences_done: true },
        { onConflict: 'user_id' },
      ),
    ]);
  }, [userId]);

  const completeOnboarding = useCallback(async () => {
    if (!supabase || !userId) return;
    await Promise.all([
      supabase.from('onboarding_progress').upsert(
        { user_id: userId, completed_at: new Date().toISOString() },
        { onConflict: 'user_id' },
      ),
      supabase.from('users').update({ onboarding_completed: true }).eq('id', userId),
    ]);
    await refreshProfile();
  }, [userId, refreshProfile]);

  return {
    ...state,
    saveExam,
    savePosition,
    saveFocus,
    saveAvailability,
    saveResources,
    saveSpecialty,
    saveStyle,
    completeOnboarding,
  };
}
