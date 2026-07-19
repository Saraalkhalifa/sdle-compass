import React from 'react';
import { RadioGroup, CheckCard, FieldLabel } from './shared';
import type { FormData } from './Onboarding';

interface Props {
  data: FormData;
  onChange: (updates: Partial<FormData>) => void;
}

const SPECIALTIES = [
  { value: 'restorative', label: 'Restorative Dentistry' },
  { value: 'oral_medicine', label: 'Oral Medicine' },
  { value: 'oral_surgery', label: 'Oral Surgery' },
  { value: 'pedodontics', label: 'Pedodontics (Pediatric Dentistry)' },
  { value: 'orthodontics', label: 'Orthodontics' },
  { value: 'periodontics', label: 'Periodontics' },
  { value: 'prosthodontics', label: 'Prosthodontics' },
  { value: 'endodontics', label: 'Endodontics' },
  { value: 'oral_pathology', label: 'Oral Pathology' },
  { value: 'community_dentistry', label: 'Community Dentistry' },
  { value: 'dental_materials', label: 'Dental Materials' },
];

const ENRICHMENT_OPTIONS = [
  { value: 'none', label: 'None', description: 'Focus entirely on core SDLE content' },
  { value: 'light', label: 'Light', description: 'Occasional specialty highlights when relevant' },
  { value: 'moderate', label: 'Moderate', description: 'Specialty context integrated throughout' },
  { value: 'advanced', label: 'Advanced', description: 'Deep specialty focus alongside SDLE prep' },
];

export function Step6Specialty({ data, onChange }: Props) {
  const toggleSecondary = (value: string) => {
    if (data.secondarySpecialties.includes(value)) {
      onChange({ secondarySpecialties: data.secondarySpecialties.filter((s) => s !== value) });
    } else if (data.secondarySpecialties.length < 2) {
      onChange({ secondarySpecialties: [...data.secondarySpecialties, value] });
    }
  };

  const secondaryOptions = SPECIALTIES.filter((s) => s.value !== data.primarySpecialty);

  return (
    <div className="space-y-8">
      {/* Primary specialty */}
      <div>
        <FieldLabel helper="This is the field you're most interested in or planning to specialize in">
          What is your primary dental specialty interest? (optional)
        </FieldLabel>
        <select
          value={data.primarySpecialty}
          onChange={(e) => {
            const val = e.target.value;
            onChange({
              primarySpecialty: val,
              secondarySpecialties: data.secondarySpecialties.filter((s) => s !== val),
            });
          }}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
        >
          <option value="">No specific specialty</option>
          {SPECIALTIES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      {/* Secondary specialties */}
      <div>
        <FieldLabel helper="Pick up to 2 secondary interests">Any secondary specialty interests? (optional)</FieldLabel>
        <div className="flex flex-wrap gap-2">
          {secondaryOptions.map((s) => (
            <CheckCard
              key={s.value}
              id={s.value}
              label={s.label}
              selected={data.secondarySpecialties.includes(s.value)}
              onToggle={toggleSecondary}
            />
          ))}
        </div>
        {data.secondarySpecialties.length >= 2 && (
          <p className="text-xs text-slate-400 mt-2">Maximum 2 secondary interests selected</p>
        )}
      </div>

      {/* Enrichment level */}
      <div>
        <FieldLabel helper="How much should specialty content feature in your study materials?">
          Specialty enrichment level
        </FieldLabel>
        <RadioGroup
          value={data.enrichmentLevel}
          onChange={(v) => onChange({ enrichmentLevel: v })}
          options={ENRICHMENT_OPTIONS}
        />
      </div>
    </div>
  );
}
