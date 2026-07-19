import React from 'react';
import { SelectCard, CheckCard, RadioGroup, FieldLabel } from './shared';
import type { FormData } from './Onboarding';

interface Props {
  data: FormData;
  onChange: (updates: Partial<FormData>) => void;
}

const STUDY_STYLE_OPTIONS = [
  {
    id: 'structured',
    label: 'Structured',
    description: 'Strict daily plan — same time, same topics each day',
    icon: '📋',
  },
  {
    id: 'flexible',
    label: 'Flexible',
    description: 'Loose framework — I adjust based on how I feel',
    icon: '🌊',
  },
  {
    id: 'sprint',
    label: 'Sprint',
    description: 'Intense bursts of focus followed by proper breaks',
    icon: '⚡',
  },
  {
    id: 'steady',
    label: 'Steady',
    description: 'Consistent daily sessions, same pace throughout',
    icon: '🐢',
  },
];

const ANSWER_OPTIONS = [
  { value: 'after_question', label: 'After each question', description: 'Instant feedback as I go' },
  { value: 'after_quiz', label: 'After the full quiz', description: 'Review all at the end (exam simulation)' },
];

const EXPLANATION_OPTIONS = [
  { value: 'brief', label: 'Brief', description: 'Key teaching point only' },
  { value: 'detailed', label: 'Detailed', description: 'Full explanation with reasoning' },
  { value: 'comprehensive', label: 'Comprehensive', description: 'All references, sources, and differentials' },
];

const NOTIFICATION_OPTIONS = [
  { id: 'daily_reminders', label: 'Daily study reminders' },
  { id: 'weekly_report', label: 'Weekly progress report' },
  { id: 'exam_countdown', label: 'Exam countdown alerts' },
  { id: 'achievements', label: 'Achievement milestones' },
];

export function Step7Style({ data, onChange }: Props) {
  const toggleNotification = (id: string) => {
    const prefs = data.notificationPreferences.includes(id)
      ? data.notificationPreferences.filter((n) => n !== id)
      : [...data.notificationPreferences, id];
    onChange({ notificationPreferences: prefs });
  };

  return (
    <div className="space-y-8">
      {/* Study style */}
      <div>
        <FieldLabel>How do you study best?</FieldLabel>
        <div className="space-y-2">
          {STUDY_STYLE_OPTIONS.map((opt) => (
            <SelectCard
              key={opt.id}
              id={opt.id}
              label={opt.label}
              description={opt.description}
              icon={opt.icon}
              selected={data.studyStyle === opt.id}
              onSelect={(id) => onChange({ studyStyle: id })}
            />
          ))}
        </div>
      </div>

      {/* Answer preference */}
      <div>
        <FieldLabel>When do you want to see answers?</FieldLabel>
        <RadioGroup
          value={data.answerPreference}
          onChange={(v) => onChange({ answerPreference: v })}
          options={ANSWER_OPTIONS}
        />
      </div>

      {/* Explanation detail */}
      <div>
        <FieldLabel>How much detail in explanations?</FieldLabel>
        <RadioGroup
          value={data.explanationDetail}
          onChange={(v) => onChange({ explanationDetail: v })}
          options={EXPLANATION_OPTIONS}
        />
      </div>

      {/* Notifications */}
      <div>
        <FieldLabel helper="You can update these anytime in settings">
          Notification preferences (optional)
        </FieldLabel>
        <div className="flex flex-wrap gap-2">
          {NOTIFICATION_OPTIONS.map((n) => (
            <CheckCard
              key={n.id}
              id={n.id}
              label={n.label}
              selected={data.notificationPreferences.includes(n.id)}
              onToggle={toggleNotification}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
