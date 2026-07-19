import React from 'react';
import { SelectCard, CheckCard, FieldLabel } from './shared';
import type { FormData } from './Onboarding';
import type { SubjectOption } from '@/hooks/useOnboarding';

interface Props {
  data: FormData;
  onChange: (updates: Partial<FormData>) => void;
  subjects: SubjectOption[];
}

const POSITION_OPTIONS = [
  { id: 'fresh_graduate', label: 'Just graduated — starting fresh', icon: '🎓' },
  { id: 'self_studying', label: 'Self-studying at home', icon: '📚' },
  { id: 'in_prep_course', label: 'Enrolled in a prep course', icon: '🏫' },
  { id: 'repeat_candidate', label: 'Repeating the exam', icon: '🔄' },
  { id: 'working_dentist', label: 'Working dentist, studying part-time', icon: '🦷' },
  { id: 'on_break', label: 'On a study break', icon: '⏸️' },
  { id: 'ready_to_go', label: 'Ready to go — need structure', icon: '🚀' },
];

const METHOD_OPTIONS = [
  { id: 'textbooks', label: 'Textbooks' },
  { id: 'video_lectures', label: 'Video lectures' },
  { id: 'online_courses', label: 'Online courses' },
  { id: 'question_banks', label: 'Question banks' },
  { id: 'group_study', label: 'Group study' },
  { id: 'private_tutoring', label: 'Private tutoring' },
  { id: 'none', label: 'None yet' },
];

const CONFIDENCE_LEVELS = [
  { value: 'not_started', label: 'Not started' },
  { value: 'low', label: 'Low' },
  { value: 'developing', label: 'Developing' },
  { value: 'good', label: 'Good' },
  { value: 'strong', label: 'Strong' },
  { value: 'not_sure', label: 'Not sure' },
];

export function Step2Position({ data, onChange, subjects }: Props) {
  const toggleMethod = (id: string) => {
    const methods = data.previousStudyMethods.includes(id)
      ? data.previousStudyMethods.filter((m) => m !== id)
      : [...data.previousStudyMethods, id];
    onChange({ previousStudyMethods: methods });
  };

  const setConfidence = (subjectId: string, level: string) => {
    const updated = data.subjectConfidence.filter((c) => c.subject_id !== subjectId);
    updated.push({ subject_id: subjectId, confidence_level: level });
    onChange({ subjectConfidence: updated });
  };

  const getConfidence = (subjectId: string) =>
    data.subjectConfidence.find((c) => c.subject_id === subjectId)?.confidence_level ?? 'not_started';

  return (
    <div className="space-y-8">
      {/* Current position */}
      <div>
        <FieldLabel>Where are you in your SDLE preparation?</FieldLabel>
        <div className="space-y-2">
          {POSITION_OPTIONS.map((opt) => (
            <SelectCard
              key={opt.id}
              id={opt.id}
              label={opt.label}
              icon={opt.icon}
              selected={data.currentPosition === opt.id}
              onSelect={(id) => onChange({ currentPosition: id })}
            />
          ))}
        </div>
      </div>

      {/* Previous methods */}
      <div>
        <FieldLabel helper="Select all that apply">How have you studied for the SDLE before?</FieldLabel>
        <div className="flex flex-wrap gap-2">
          {METHOD_OPTIONS.map((m) => (
            <CheckCard
              key={m.id}
              id={m.id}
              label={m.label}
              selected={data.previousStudyMethods.includes(m.id)}
              onToggle={toggleMethod}
            />
          ))}
        </div>
      </div>

      {/* Subject confidence */}
      {subjects.length > 0 && (
        <div>
          <FieldLabel helper="Be honest — this shapes your study plan">How confident are you in each subject?</FieldLabel>
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            {subjects.map((subj, idx) => (
              <div
                key={subj.id}
                className={`flex items-center gap-3 px-4 py-3 ${
                  idx < subjects.length - 1 ? 'border-b border-slate-100' : ''
                }`}
              >
                <span className="text-sm text-slate-700 flex-1 min-w-0 font-medium">{subj.name}</span>
                <select
                  value={getConfidence(subj.id)}
                  onChange={(e) => setConfidence(subj.id, e.target.value)}
                  className="text-sm rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-100 outline-none"
                >
                  {CONFIDENCE_LEVELS.map((l) => (
                    <option key={l.value} value={l.value}>{l.label}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Your answers are private and only used to personalize your plan.
          </p>
        </div>
      )}
    </div>
  );
}
