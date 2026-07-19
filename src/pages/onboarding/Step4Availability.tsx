import React from 'react';
import { FieldLabel } from './shared';
import type { FormData } from './Onboarding';

interface Props {
  data: FormData;
  onChange: (updates: Partial<FormData>) => void;
}

const DAYS: Array<{ key: keyof FormData; label: string }> = [
  { key: 'mondayHours', label: 'Monday' },
  { key: 'tuesdayHours', label: 'Tuesday' },
  { key: 'wednesdayHours', label: 'Wednesday' },
  { key: 'thursdayHours', label: 'Thursday' },
  { key: 'fridayHours', label: 'Friday' },
  { key: 'saturdayHours', label: 'Saturday' },
  { key: 'sundayHours', label: 'Sunday' },
];

const HOUR_OPTIONS = [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 5, 6, 8];

const SESSION_LENGTH_OPTIONS = [
  { value: '30', label: '30 min' },
  { value: '45', label: '45 min' },
  { value: '60', label: '1 hour' },
  { value: '90', label: '1.5 hours' },
  { value: '120', label: '2 hours' },
];

const STUDY_TIME_OPTIONS = [
  { value: 'early_morning', label: 'Early morning (before 8 AM)' },
  { value: 'morning', label: 'Morning (8 AM – 12 PM)' },
  { value: 'afternoon', label: 'Afternoon (12 PM – 5 PM)' },
  { value: 'evening', label: 'Evening (5 PM – 10 PM)' },
  { value: 'late_night', label: 'Late night (after 10 PM)' },
  { value: 'no_preference', label: 'No preference' },
];

const REST_DAY_OPTIONS = [
  { value: '', label: 'No rest day' },
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' },
];

export function Step4Availability({ data, onChange }: Props) {
  const totalHours = DAYS.reduce((sum, d) => sum + (Number(data[d.key]) || 0), 0);

  return (
    <div className="space-y-8">
      {/* Weekly hours */}
      <div>
        <FieldLabel helper={`Total: ${totalHours} hours/week`}>
          How many hours can you study each day?
        </FieldLabel>
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          {DAYS.map((day, idx) => (
            <div
              key={day.key}
              className={`flex items-center gap-4 px-4 py-3 ${
                idx < DAYS.length - 1 ? 'border-b border-slate-100' : ''
              }`}
            >
              <span className="text-sm font-medium text-slate-700 w-24 shrink-0">{day.label}</span>
              <input
                type="range"
                min={0} max={8} step={0.5}
                value={Number(data[day.key]) || 0}
                onChange={(e) => onChange({ [day.key]: parseFloat(e.target.value) } as Partial<FormData>)}
                className="flex-1 h-1.5 accent-blue-600"
              />
              <span className="text-sm text-slate-600 w-16 text-right shrink-0">
                {Number(data[day.key]) || 0} {Number(data[day.key]) === 1 ? 'hr' : 'hrs'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Session length */}
      <div>
        <FieldLabel>Preferred study session length</FieldLabel>
        <div className="flex gap-2 flex-wrap">
          {SESSION_LENGTH_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange({ preferredSessionLength: opt.value })}
              className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all ${
                data.preferredSessionLength === opt.value
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Preferred study time */}
      <div>
        <FieldLabel>When do you prefer to study?</FieldLabel>
        <select
          value={data.preferredStudyTime}
          onChange={(e) => onChange({ preferredStudyTime: e.target.value })}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
        >
          {STUDY_TIME_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Rest day */}
      <div>
        <FieldLabel helper="No tasks will be scheduled on this day">Rest day (optional)</FieldLabel>
        <select
          value={data.restDay}
          onChange={(e) => onChange({ restDay: e.target.value })}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
        >
          {REST_DAY_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Work commitments */}
      <label className="flex items-center gap-3 cursor-pointer select-none p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors">
        <input
          type="checkbox"
          checked={data.hasWorkCommitments}
          onChange={(e) => onChange({ hasWorkCommitments: e.target.checked })}
          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
        />
        <div>
          <p className="text-sm font-medium text-slate-700">I have work or clinic commitments</p>
          <p className="text-xs text-slate-400 mt-0.5">Your plan will account for busier days</p>
        </div>
      </label>
    </div>
  );
}
