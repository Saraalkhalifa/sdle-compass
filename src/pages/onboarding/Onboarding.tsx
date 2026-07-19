import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { APP_CONFIG, ROUTES } from '@/config/app';
import { useOnboarding } from '@/hooks/useOnboarding';
import type { SubjectConfidence } from '@/hooks/useOnboarding';
import { StepHeader, StepNav } from './shared';
import { Step1Exam } from './Step1Exam';
import { Step2Position } from './Step2Position';
import { Step3Focus } from './Step3Focus';
import { Step4Availability } from './Step4Availability';
import { Step5Resources } from './Step5Resources';
import { Step6Specialty } from './Step6Specialty';
import { Step7Style } from './Step7Style';
import { Step8Review } from './Step8Review';

// ── FormData type — exported so step components can import it ─────────────────

export interface FormData {
  // Step 1 — Exam
  examBooked: boolean | null;
  examDate: string;
  examPeriod: string;
  isFirstAttempt: boolean;
  previousScore: string;
  targetScore: string;
  studyStartDate: string;
  revisionDays: number;
  // Step 2 — Position
  currentPosition: string;
  previousStudyMethods: string[];
  subjectConfidence: SubjectConfidence[];
  // Step 3 — Focus
  focusTypes: string[];
  prioritySubjectId: string;
  focusDuration: string;
  focusReasons: string[];
  // Step 4 — Availability
  mondayHours: number;
  tuesdayHours: number;
  wednesdayHours: number;
  thursdayHours: number;
  fridayHours: number;
  saturdayHours: number;
  sundayHours: number;
  preferredSessionLength: string;
  preferredStudyTime: string;
  restDay: string;
  hasWorkCommitments: boolean;
  // Step 5 — Resources
  resourceOrder: string;
  preferredFormats: string[];
  // Step 6 — Specialty
  primarySpecialty: string;
  secondarySpecialties: string[];
  enrichmentLevel: string;
  // Step 7 — Style
  studyStyle: string;
  answerPreference: string;
  explanationDetail: string;
  notificationPreferences: string[];
}

const DEFAULT: FormData = {
  examBooked: null,
  examDate: '', examPeriod: '', isFirstAttempt: true,
  previousScore: '', targetScore: '', studyStartDate: '', revisionDays: 7,
  currentPosition: '', previousStudyMethods: [], subjectConfidence: [],
  focusTypes: [], prioritySubjectId: '', focusDuration: '', focusReasons: [],
  mondayHours: 0, tuesdayHours: 0, wednesdayHours: 0, thursdayHours: 0,
  fridayHours: 0, saturdayHours: 0, sundayHours: 0,
  preferredSessionLength: '45', preferredStudyTime: 'no_preference', restDay: '', hasWorkCommitments: false,
  resourceOrder: 'mixed', preferredFormats: [],
  primarySpecialty: '', secondarySpecialties: [], enrichmentLevel: 'none',
  studyStyle: '', answerPreference: 'after_question', explanationDetail: 'detailed', notificationPreferences: [],
};

const STEP_META: Array<{ title: string; subtitle: string }> = [
  { title: 'Set up your exam timeline', subtitle: 'Help us understand when you need to be ready.' },
  { title: 'Where are you right now?', subtitle: 'Your current stage shapes how we build your plan.' },
  { title: 'What do you want to focus on?', subtitle: 'Tell us what matters most in the coming weeks.' },
  { title: 'How much time can you study?', subtitle: "We'll build a realistic plan around your schedule." },
  { title: 'How do you use study resources?', subtitle: "We'll prioritize the formats that work best for you." },
  { title: 'Your specialty interests', subtitle: "We'll tailor content and enrichment to your goals." },
  { title: 'How do you learn best?', subtitle: 'Your style shapes how content is presented to you.' },
  { title: 'Review your setup', subtitle: '' },
];

function tryParseJSON<T>(str: string | null | undefined, fallback: T): T {
  if (!str) return fallback;
  try { return JSON.parse(str) as T; } catch { return fallback; }
}

const TOTAL_STEPS = 8;

export function Onboarding() {
  const navigate = useNavigate();

  const {
    loading, initialStep,
    examSettings, currentFocus, availability, studyPrefs, specialty, subjectConfidence, subjects,
    saveExam, savePosition, saveFocus, saveAvailability, saveResources, saveSpecialty, saveStyle,
    completeOnboarding,
  } = useOnboarding();

  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<FormData>(DEFAULT);
  const [initialized, setInitialized] = useState(false);

  // Initialize form data from loaded onboarding data
  useEffect(() => {
    if (loading || initialized) return;

    setFormData({
      ...DEFAULT,
      examBooked: examSettings?.exam_booked ?? null,
      examDate: examSettings?.exam_date ?? '',
      examPeriod: examSettings?.exam_period ?? '',
      isFirstAttempt: examSettings?.is_first_attempt ?? true,
      previousScore: examSettings?.previous_score?.toString() ?? '',
      targetScore: examSettings?.target_score?.toString() ?? '',
      studyStartDate: examSettings?.study_start_date ?? '',
      revisionDays: examSettings?.revision_days ?? 7,

      currentPosition: studyPrefs?.current_position ?? '',
      previousStudyMethods: studyPrefs?.previous_study_methods ?? [],
      subjectConfidence,

      focusTypes: tryParseJSON<string[]>(currentFocus?.focus_type, []),
      prioritySubjectId: currentFocus?.priority_subject_id ?? '',
      focusDuration: currentFocus?.focus_duration ?? '',
      focusReasons: tryParseJSON<string[]>(currentFocus?.focus_reason, []),

      mondayHours: Number(availability?.monday_hours ?? 0),
      tuesdayHours: Number(availability?.tuesday_hours ?? 0),
      wednesdayHours: Number(availability?.wednesday_hours ?? 0),
      thursdayHours: Number(availability?.thursday_hours ?? 0),
      fridayHours: Number(availability?.friday_hours ?? 0),
      saturdayHours: Number(availability?.saturday_hours ?? 0),
      sundayHours: Number(availability?.sunday_hours ?? 0),
      preferredSessionLength: availability?.preferred_session_length ?? '45',
      preferredStudyTime: availability?.preferred_study_time ?? 'no_preference',
      restDay: availability?.rest_day ?? '',
      hasWorkCommitments: availability?.has_work_commitments ?? false,

      resourceOrder: studyPrefs?.resource_order ?? 'mixed',
      preferredFormats: studyPrefs?.preferred_formats ?? [],

      primarySpecialty: specialty?.primary_specialty ?? '',
      secondarySpecialties: specialty?.secondary_specialties ?? [],
      enrichmentLevel: specialty?.enrichment_level ?? 'none',

      studyStyle: studyPrefs?.study_style ?? '',
      answerPreference: studyPrefs?.answer_preference ?? 'after_question',
      explanationDetail: studyPrefs?.explanation_detail ?? 'detailed',
      notificationPreferences: studyPrefs?.notification_preferences ?? [],
    });

    setStep(initialStep);
    setInitialized(true);
  }, [loading, initialized, initialStep,
    examSettings, currentFocus, availability, studyPrefs, specialty, subjectConfidence]);

  const update = (updates: Partial<FormData>) =>
    setFormData((prev) => ({ ...prev, ...updates }));

  const handleNext = async () => {
    setSaving(true);
    try {
      const nextStep = step + 1;
      switch (step) {
        case 1:
          await saveExam({
            exam_booked: formData.examBooked,
            exam_date: formData.examDate || null,
            exam_period: formData.examPeriod || null,
            is_first_attempt: formData.isFirstAttempt,
            previous_score: formData.previousScore ? parseFloat(formData.previousScore) : null,
            target_score: formData.targetScore ? parseFloat(formData.targetScore) : null,
            study_start_date: formData.studyStartDate || null,
            revision_days: formData.revisionDays,
          }, nextStep);
          break;
        case 2:
          await savePosition(
            {
              current_position: formData.currentPosition || null,
              previous_study_methods: formData.previousStudyMethods,
            },
            formData.subjectConfidence,
            nextStep,
          );
          break;
        case 3:
          await saveFocus({
            focus_type: formData.focusTypes.length > 0 ? JSON.stringify(formData.focusTypes) : null,
            priority_subject_id: formData.prioritySubjectId || null,
            focus_duration: formData.focusDuration || null,
            focus_reason: formData.focusReasons.length > 0 ? JSON.stringify(formData.focusReasons) : null,
          }, nextStep);
          break;
        case 4:
          await saveAvailability({
            monday_hours: formData.mondayHours,
            tuesday_hours: formData.tuesdayHours,
            wednesday_hours: formData.wednesdayHours,
            thursday_hours: formData.thursdayHours,
            friday_hours: formData.fridayHours,
            saturday_hours: formData.saturdayHours,
            sunday_hours: formData.sundayHours,
            preferred_session_length: formData.preferredSessionLength,
            preferred_study_time: formData.preferredStudyTime,
            rest_day: formData.restDay || null,
            has_work_commitments: formData.hasWorkCommitments,
          }, nextStep);
          break;
        case 5:
          await saveResources({
            resource_order: formData.resourceOrder,
            preferred_formats: formData.preferredFormats,
          }, nextStep);
          break;
        case 6:
          await saveSpecialty({
            primary_specialty: formData.primarySpecialty || null,
            secondary_specialties: formData.secondarySpecialties,
            enrichment_level: formData.enrichmentLevel,
          }, nextStep);
          break;
        case 7:
          await saveStyle({
            study_style: formData.studyStyle || null,
            answer_preference: formData.answerPreference,
            explanation_detail: formData.explanationDetail,
            notification_preferences: formData.notificationPreferences,
          }, nextStep);
          break;
      }
      setStep(nextStep);
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = () => setStep((s) => s + 1);
  const handleBack = () => setStep((s) => s - 1);

  const handleSkipSetup = async () => {
    setSaving(true);
    await completeOnboarding();
    setSaving(false);
    navigate(ROUTES.studentDashboard, { replace: true });
  };

  const handleComplete = async () => {
    setSaving(true);
    await completeOnboarding();
    setSaving(false);
    navigate(ROUTES.studentDashboard, { replace: true });
  };

  const handleSaveAndFinishLater = () => {
    navigate(ROUTES.studentDashboard, { replace: true });
  };

  if (loading) {
    return (
      <div className="min-h-dvh bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin w-8 h-8 text-blue-500" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.2" strokeWidth="4"/>
            <path d="M22 12a10 10 0 00-10-10" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
          </svg>
          <p className="text-sm text-slate-500">Loading your setup…</p>
        </div>
      </div>
    );
  }

  const meta = STEP_META[step - 1];

  return (
    <div className="min-h-dvh bg-slate-50">
      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">

        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"/>
              </svg>
            </div>
            <span className="text-base font-bold text-slate-800">{APP_CONFIG.name}</span>
          </div>

          {step === 1 && (
            <button
              type="button"
              onClick={handleSkipSetup}
              disabled={saving}
              className="text-sm text-slate-400 hover:text-slate-600 transition-colors"
            >
              Skip setup
            </button>
          )}
        </div>

        {/* Step content */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
          <StepHeader
            step={step}
            total={TOTAL_STEPS}
            title={meta.title}
            subtitle={meta.subtitle || undefined}
          />

          {step === 1 && <Step1Exam data={formData} onChange={update} />}
          {step === 2 && <Step2Position data={formData} onChange={update} subjects={subjects} />}
          {step === 3 && <Step3Focus data={formData} onChange={update} subjects={subjects} />}
          {step === 4 && <Step4Availability data={formData} onChange={update} />}
          {step === 5 && <Step5Resources data={formData} onChange={update} />}
          {step === 6 && <Step6Specialty data={formData} onChange={update} />}
          {step === 7 && <Step7Style data={formData} onChange={update} />}
          {step === 8 && (
            <Step8Review data={formData} subjects={subjects} onEditStep={setStep} />
          )}

          {/* Navigation */}
          {step < 8 ? (
            <StepNav
              onBack={step > 1 ? handleBack : undefined}
              onSkip={step > 1 ? handleSkip : undefined}
              onNext={handleNext}
              loading={saving}
              nextLabel="Next"
            />
          ) : (
            <StepNav
              onBack={handleBack}
              onSkip={handleSaveAndFinishLater}
              onNext={handleComplete}
              loading={saving}
              nextLabel="Create my study plan"
              skipLabel="Save and finish later"
            />
          )}
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          Your answers are private and only used to personalize your preparation.
        </p>
      </div>
    </div>
  );
}
