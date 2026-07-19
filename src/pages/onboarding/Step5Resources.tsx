import React from 'react';
import { SelectCard, CheckCard, FieldLabel } from './shared';
import type { FormData } from './Onboarding';

interface Props {
  data: FormData;
  onChange: (updates: Partial<FormData>) => void;
}

const RESOURCE_ORDER_OPTIONS = [
  {
    id: 'resources_first',
    label: 'Study resources first, then practice',
    description: 'Read the theory, then reinforce with questions',
    icon: '📖',
  },
  {
    id: 'practice_first',
    label: 'Practice questions first, then review',
    description: 'Identify gaps through testing, then fill them',
    icon: '✏️',
  },
  {
    id: 'mixed',
    label: 'Mix both throughout',
    description: 'Alternate between reading and practicing',
    icon: '🔀',
  },
];

const FORMAT_OPTIONS = [
  { id: 'pdf_books', label: 'PDF textbooks' },
  { id: 'video_lectures', label: 'Video lectures' },
  { id: 'quick_notes', label: 'Quick notes / summaries' },
  { id: 'practice_questions', label: 'Practice questions' },
  { id: 'visual_diagrams', label: 'Visual diagrams' },
  { id: 'audio_summaries', label: 'Audio summaries' },
];

export function Step5Resources({ data, onChange }: Props) {
  const toggleFormat = (id: string) => {
    const formats = data.preferredFormats.includes(id)
      ? data.preferredFormats.filter((f) => f !== id)
      : [...data.preferredFormats, id];
    onChange({ preferredFormats: formats });
  };

  return (
    <div className="space-y-8">
      {/* Resource order */}
      <div>
        <FieldLabel>How would you like to use study resources?</FieldLabel>
        <div className="space-y-2">
          {RESOURCE_ORDER_OPTIONS.map((opt) => (
            <SelectCard
              key={opt.id}
              id={opt.id}
              label={opt.label}
              description={opt.description}
              icon={opt.icon}
              selected={data.resourceOrder === opt.id}
              onSelect={(id) => onChange({ resourceOrder: id })}
            />
          ))}
        </div>
      </div>

      {/* Preferred formats */}
      <div>
        <FieldLabel helper="Select all that work for you">Which formats do you learn best from?</FieldLabel>
        <div className="flex flex-wrap gap-2">
          {FORMAT_OPTIONS.map((f) => (
            <CheckCard
              key={f.id}
              id={f.id}
              label={f.label}
              selected={data.preferredFormats.includes(f.id)}
              onToggle={toggleFormat}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
