import React from 'react';
import type { FormData } from './Onboarding';
import type { SubjectOption } from '@/hooks/useOnboarding';

interface Props {
  data: FormData;
  subjects: SubjectOption[];
  onEditStep: (step: number) => void;
}

interface SectionProps {
  title: string;
  step: number;
  onEdit: (step: number) => void;
  children: React.ReactNode;
}

function Section({ title, step, onEdit, children }: SectionProps) {
  return (
    <div className="p-4 rounded-xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
        <button
          type="button"
          onClick={() => onEdit(step)}
          className="text-xs text-blue-600 hover:underline font-medium"
        >
          Edit
        </button>
      </div>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div className="flex gap-2 text-sm">
      <span className="text-slate-500 shrink-0">{label}:</span>
      <span className="text-slate-800 font-medium">{value}</span>
    </div>
  );
}

const EXAM_PERIOD_LABELS: Record<string, string> = {
  within_1_month: 'Within 1 month',
  within_2_3_months: 'In 2–3 months',
  within_4_6_months: 'In 4–6 months',
  more_than_6_months: 'More than 6 months',
  not_sure: 'Not sure yet',
};

const POSITION_LABELS: Record<string, string> = {
  fresh_graduate: 'Just graduated — starting fresh',
  self_studying: 'Self-studying at home',
  in_prep_course: 'Enrolled in a prep course',
  repeat_candidate: 'Repeating the exam',
  working_dentist: 'Working dentist, studying part-time',
  on_break: 'On a study break',
  ready_to_go: 'Ready to go — need structure',
};

const STYLE_LABELS: Record<string, string> = {
  structured: 'Structured', flexible: 'Flexible', sprint: 'Sprint', steady: 'Steady',
};

const RESOURCE_ORDER_LABELS: Record<string, string> = {
  resources_first: 'Resources first, then practice',
  practice_first: 'Practice first, then review',
  mixed: 'Mix both',
};

export function Step8Review({ data, subjects, onEditStep }: Props) {
  const totalHoursPerWeek = [
    data.mondayHours, data.tuesdayHours, data.wednesdayHours,
    data.thursdayHours, data.fridayHours, data.saturdayHours, data.sundayHours,
  ].reduce((a, b) => a + b, 0);

  const prioritySubject = subjects.find((s) => s.id === data.prioritySubjectId)?.name;

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500 -mt-2 mb-2">
        Review your choices below. You can edit any section before creating your plan.
      </p>

      <Section title="Exam details" step={1} onEdit={onEditStep}>
        <Row
          label="Exam"
          value={
            data.examBooked
              ? data.examDate ? `Booked — ${data.examDate}` : 'Booked'
              : data.examPeriod
                ? EXAM_PERIOD_LABELS[data.examPeriod] ?? data.examPeriod
                : undefined
          }
        />
        <Row label="Attempt" value={data.isFirstAttempt ? 'First attempt' : `Repeat (prev: ${data.previousScore || '—'})`}/>
        <Row label="Target score" value={data.targetScore ? `${data.targetScore}%` : undefined}/>
        <Row label="Revision days" value={`${data.revisionDays} days`}/>
      </Section>

      <Section title="Your background" step={2} onEdit={onEditStep}>
        <Row label="Position" value={data.currentPosition ? POSITION_LABELS[data.currentPosition] : undefined}/>
        <Row
          label="Prior methods"
          value={data.previousStudyMethods.length > 0 ? data.previousStudyMethods.join(', ') : undefined}
        />
        <Row
          label="Subjects rated"
          value={data.subjectConfidence.length > 0 ? `${data.subjectConfidence.length} subjects` : undefined}
        />
      </Section>

      <Section title="Immediate focus" step={3} onEdit={onEditStep}>
        <Row
          label="Focus"
          value={data.focusTypes.length > 0 ? data.focusTypes.join(', ') : undefined}
        />
        <Row label="Priority subject" value={prioritySubject}/>
        <Row label="Duration" value={data.focusDuration || undefined}/>
      </Section>

      <Section title="Availability" step={4} onEdit={onEditStep}>
        <Row label="Weekly hours" value={totalHoursPerWeek > 0 ? `${totalHoursPerWeek} hrs/week` : undefined}/>
        <Row label="Session length" value={data.preferredSessionLength ? `${data.preferredSessionLength} min` : undefined}/>
        <Row
          label="Preferred time"
          value={data.preferredStudyTime !== 'no_preference' ? data.preferredStudyTime.replace(/_/g, ' ') : undefined}
        />
        <Row label="Work commitments" value={data.hasWorkCommitments ? 'Yes' : undefined}/>
      </Section>

      <Section title="Resources" step={5} onEdit={onEditStep}>
        <Row label="Approach" value={RESOURCE_ORDER_LABELS[data.resourceOrder]}/>
        <Row
          label="Formats"
          value={data.preferredFormats.length > 0 ? data.preferredFormats.join(', ') : undefined}
        />
      </Section>

      <Section title="Learning style" step={7} onEdit={onEditStep}>
        <Row label="Study style" value={data.studyStyle ? STYLE_LABELS[data.studyStyle] : undefined}/>
        <Row label="Answers" value={data.answerPreference === 'after_question' ? 'After each question' : 'After full quiz'}/>
        <Row label="Explanations" value={data.explanationDetail}/>
      </Section>
    </div>
  );
}
