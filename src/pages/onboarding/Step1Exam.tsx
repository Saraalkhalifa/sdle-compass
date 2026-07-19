import React from 'react';
import { SelectCard, FieldLabel } from './shared';
import type { FormData } from './Onboarding';

interface Props {
  data: FormData;
  onChange: (updates: Partial<FormData>) => void;
}

const EXAM_BOOKED_OPTIONS = [
  { id: 'booked', label: 'Yes, I have a date booked', icon: '📅', value: true as boolean | null },
  { id: 'planning', label: 'Not yet — planning to book soon', icon: '🎯', value: false as boolean | null },
  { id: 'exploring', label: "I'm still exploring", icon: '🔍', value: null as boolean | null },
];

const EXAM_PERIOD_OPTIONS = [
  { value: 'within_1_month', label: 'Within 1 month' },
  { value: 'within_2_3_months', label: 'In 2–3 months' },
  { value: 'within_4_6_months', label: 'In 4–6 months' },
  { value: 'more_than_6_months', label: 'More than 6 months away' },
  { value: 'not_sure', label: 'Not sure yet' },
];

const REVISION_DAY_OPTIONS = [3, 5, 7, 10, 14, 21];

export function Step1Exam({ data, onChange }: Props) {
  const selectedBookedId = EXAM_BOOKED_OPTIONS.find((o) =>
    o.value === data.examBooked,
  )?.id ?? '';

  const handleBookedSelect = (id: string) => {
    const opt = EXAM_BOOKED_OPTIONS.find((o) => o.id === id);
    if (opt) onChange({ examBooked: opt.value, examDate: '', examPeriod: '' });
  };

  return (
    <div className="space-y-6">
      {/* Exam booked? */}
      <div>
        <FieldLabel>Have you booked your SDLE exam?</FieldLabel>
        <div className="space-y-2">
          {EXAM_BOOKED_OPTIONS.map((opt) => (
            <SelectCard
              key={opt.id}
              id={opt.id}
              label={opt.label}
              icon={opt.icon}
              selected={selectedBookedId === opt.id}
              onSelect={handleBookedSelect}
            />
          ))}
        </div>
      </div>

      {/* Conditional: exam date or period */}
      {data.examBooked === true && (
        <div>
          <FieldLabel>Exam date</FieldLabel>
          <input
            type="date"
            value={data.examDate}
            onChange={(e) => onChange({ examDate: e.target.value })}
            min={new Date().toISOString().split('T')[0]}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
          />
        </div>
      )}

      {data.examBooked !== true && selectedBookedId !== '' && (
        <div>
          <FieldLabel>When do you plan to sit the exam?</FieldLabel>
          <select
            value={data.examPeriod}
            onChange={(e) => onChange({ examPeriod: e.target.value })}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
          >
            <option value="">Select a timeframe</option>
            {EXAM_PERIOD_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      )}

      {/* First attempt */}
      <label className="flex items-center gap-3 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={data.isFirstAttempt}
          onChange={(e) => onChange({ isFirstAttempt: e.target.checked, previousScore: '' })}
          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
        />
        <span className="text-sm font-medium text-slate-700">This is my first SDLE attempt</span>
      </label>

      {!data.isFirstAttempt && (
        <div>
          <FieldLabel helper="Between 0 and 100">Previous exam score</FieldLabel>
          <input
            type="number"
            value={data.previousScore}
            onChange={(e) => onChange({ previousScore: e.target.value })}
            min={0} max={100} step={0.5}
            placeholder="e.g. 58"
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
          />
        </div>
      )}

      {/* Target score */}
      <div>
        <FieldLabel helper="The SDLE passing mark is typically 60%">Target score (optional)</FieldLabel>
        <input
          type="number"
          value={data.targetScore}
          onChange={(e) => onChange({ targetScore: e.target.value })}
          min={50} max={100} step={0.5}
          placeholder="e.g. 75"
          className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
        />
      </div>

      {/* Study start date */}
      <div>
        <FieldLabel helper="Leave blank to start today">Planned study start date (optional)</FieldLabel>
        <input
          type="date"
          value={data.studyStartDate}
          onChange={(e) => onChange({ studyStartDate: e.target.value })}
          className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
        />
      </div>

      {/* Revision days */}
      <div>
        <FieldLabel helper="Days of pure revision before the exam (no new content)">Revision period before exam</FieldLabel>
        <div className="flex gap-2 flex-wrap">
          {REVISION_DAY_OPTIONS.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => onChange({ revisionDays: d })}
              className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all ${
                data.revisionDays === d
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              {d} days
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
