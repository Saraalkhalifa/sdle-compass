import React from 'react';
import { SelectCard, CheckCard, FieldLabel } from './shared';
import type { FormData } from './Onboarding';
import type { SubjectOption } from '@/hooks/useOnboarding';

interface Props {
  data: FormData;
  onChange: (updates: Partial<FormData>) => void;
  subjects: SubjectOption[];
}

const FOCUS_TYPE_OPTIONS = [
  { id: 'foundation', label: 'Build a comprehensive foundation', description: 'Cover all subjects systematically', icon: '🏗️' },
  { id: 'weak_subjects', label: 'Target my weak subjects', description: 'Focus on areas needing the most work', icon: '🎯' },
  { id: 'exam_practice', label: 'Intensive exam practice', description: 'Master question techniques and timing', icon: '📝' },
  { id: 'review', label: 'Review and consolidate', description: 'Reinforce what I already know', icon: '🔁' },
];

const DURATION_OPTIONS = [
  { value: '1_2_weeks', label: '1–2 weeks' },
  { value: '3_4_weeks', label: '3–4 weeks' },
  { value: '1_2_months', label: '1–2 months' },
  { value: '3_months_plus', label: '3+ months' },
  { value: 'until_exam', label: 'Until the exam' },
];

const REASON_OPTIONS = [
  { id: 'weakest_area', label: "It's my weakest area" },
  { id: 'exam_weight', label: 'Highest exam weight' },
  { id: 'prev_feedback', label: 'Previous exam feedback' },
  { id: 'personal_interest', label: 'Personal interest' },
  { id: 'advisor_rec', label: 'Advisor recommendation' },
];

export function Step3Focus({ data, onChange, subjects }: Props) {
  const toggleFocusType = (id: string) => {
    const types = data.focusTypes.includes(id)
      ? data.focusTypes.filter((t) => t !== id)
      : [...data.focusTypes, id];
    onChange({ focusTypes: types });
  };

  const toggleReason = (id: string) => {
    const reasons = data.focusReasons.includes(id)
      ? data.focusReasons.filter((r) => r !== id)
      : [...data.focusReasons, id];
    onChange({ focusReasons: reasons });
  };

  return (
    <div className="space-y-8">
      {/* Focus type */}
      <div>
        <FieldLabel helper="Select all that apply">What is your immediate study focus?</FieldLabel>
        <div className="space-y-2">
          {FOCUS_TYPE_OPTIONS.map((opt) => (
            <SelectCard
              key={opt.id}
              id={opt.id}
              label={opt.label}
              description={opt.description}
              icon={opt.icon}
              selected={data.focusTypes.includes(opt.id)}
              onSelect={toggleFocusType}
            />
          ))}
        </div>
      </div>

      {/* Priority subject */}
      <div>
        <FieldLabel>Which subject is your top priority right now? (optional)</FieldLabel>
        <select
          value={data.prioritySubjectId}
          onChange={(e) => onChange({ prioritySubjectId: e.target.value })}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
        >
          <option value="">No specific priority</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      {/* Focus duration */}
      <div>
        <FieldLabel>How long do you want to maintain this focus?</FieldLabel>
        <select
          value={data.focusDuration}
          onChange={(e) => onChange({ focusDuration: e.target.value })}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
        >
          <option value="">Select a duration</option>
          {DURATION_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Focus reason */}
      <div>
        <FieldLabel helper="Select all that apply">Why this focus? (optional)</FieldLabel>
        <div className="flex flex-wrap gap-2">
          {REASON_OPTIONS.map((r) => (
            <CheckCard
              key={r.id}
              id={r.id}
              label={r.label}
              selected={data.focusReasons.includes(r.id)}
              onToggle={toggleReason}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
