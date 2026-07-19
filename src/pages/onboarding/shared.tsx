import React from 'react';

// ── SelectCard (single-select large card) ─────────────────────────────────────

interface SelectCardProps {
  id: string;
  label: string;
  description?: string;
  icon?: string;
  selected: boolean;
  onSelect: (id: string) => void;
}

export function SelectCard({ id, label, description, icon, selected, onSelect }: SelectCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(id)}
      className={`w-full text-left px-4 py-3.5 rounded-xl border-2 transition-all flex items-center gap-3 ${
        selected
          ? 'border-blue-500 bg-blue-50'
          : 'border-slate-200 bg-white hover:border-slate-300'
      }`}
      aria-pressed={selected}
    >
      {icon && <span className="text-xl shrink-0">{icon}</span>}
      <div className="flex-1 min-w-0">
        <p className={`font-medium text-sm leading-snug ${selected ? 'text-blue-900' : 'text-slate-800'}`}>
          {label}
        </p>
        {description && (
          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{description}</p>
        )}
      </div>
      <div className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ml-1 ${
        selected ? 'border-blue-500 bg-blue-500' : 'border-slate-300'
      }`}>
        {selected && (
          <svg width="8" height="8" viewBox="0 0 10 10" fill="none" aria-hidden="true">
            <path d="M1.5 5l2.5 2.5 5-5" stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </div>
    </button>
  );
}

// ── CheckCard (multi-select pill) ─────────────────────────────────────────────

interface CheckCardProps {
  id: string;
  label: string;
  selected: boolean;
  onToggle: (id: string) => void;
}

export function CheckCard({ id, label, selected, onToggle }: CheckCardProps) {
  return (
    <button
      type="button"
      onClick={() => onToggle(id)}
      aria-pressed={selected}
      className={`px-3.5 py-2 rounded-full text-sm border transition-all ${
        selected
          ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
      }`}
    >
      {selected && <span className="mr-1 text-blue-500">✓</span>}
      {label}
    </button>
  );
}

// ── RadioGroup ────────────────────────────────────────────────────────────────

export interface RadioOption { value: string; label: string; description?: string; }

interface RadioGroupProps {
  value: string;
  onChange: (v: string) => void;
  options: RadioOption[];
}

export function RadioGroup({ value, onChange, options }: RadioGroupProps) {
  return (
    <div className="space-y-2">
      {options.map((opt) => (
        <label
          key={opt.value}
          className={`flex items-start gap-3 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all ${
            value === opt.value
              ? 'border-blue-500 bg-blue-50'
              : 'border-slate-200 hover:border-slate-300 bg-white'
          }`}
        >
          <input
            type="radio"
            checked={value === opt.value}
            onChange={() => onChange(opt.value)}
            className="mt-0.5 text-blue-600 border-slate-300 focus:ring-blue-500 shrink-0"
          />
          <div>
            <p className={`text-sm font-medium leading-snug ${value === opt.value ? 'text-blue-900' : 'text-slate-800'}`}>
              {opt.label}
            </p>
            {opt.description && <p className="text-xs text-slate-500 mt-0.5">{opt.description}</p>}
          </div>
        </label>
      ))}
    </div>
  );
}

// ── StepHeader ────────────────────────────────────────────────────────────────

interface StepHeaderProps {
  step: number;
  total: number;
  title: string;
  subtitle?: string;
}

export function StepHeader({ step, total, title, subtitle }: StepHeaderProps) {
  const progress = Math.round((step / total) * 100);
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-slate-500 tracking-wide uppercase">
          Step {step} of {total}
        </span>
        <span className="text-xs text-slate-400">{progress}%</span>
      </div>
      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-6">
        <div
          className="h-full bg-blue-500 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
      <h2 className="text-xl font-bold text-slate-900 leading-snug">{title}</h2>
      {subtitle && <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">{subtitle}</p>}
    </div>
  );
}

// ── StepNav ───────────────────────────────────────────────────────────────────

interface StepNavProps {
  onBack?: () => void;
  onSkip?: () => void;
  onNext: () => void;
  loading?: boolean;
  nextLabel?: string;
  skipLabel?: string;
  canNext?: boolean;
}

export function StepNav({
  onBack,
  onSkip,
  onNext,
  loading,
  nextLabel = 'Next',
  skipLabel = 'Skip for now',
  canNext = true,
}: StepNavProps) {
  return (
    <div className={`flex items-center mt-8 ${onBack ? 'justify-between' : 'justify-end'}`}>
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5"/>
          </svg>
          Back
        </button>
      )}

      <div className="flex items-center gap-3">
        {onSkip && (
          <button
            type="button"
            onClick={onSkip}
            className="text-sm text-slate-400 hover:text-slate-600 transition-colors px-1"
          >
            {skipLabel}
          </button>
        )}
        <button
          type="button"
          onClick={onNext}
          disabled={!canNext || loading}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="4"/>
              <path d="M22 12a10 10 0 00-10-10" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
            </svg>
          ) : null}
          {nextLabel}
          {!loading && (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/>
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

// ── FieldLabel ────────────────────────────────────────────────────────────────

export function FieldLabel({ children, helper }: { children: React.ReactNode; helper?: string }) {
  return (
    <div className="mb-2">
      <p className="text-sm font-semibold text-slate-800">{children}</p>
      {helper && <p className="text-xs text-slate-400 mt-0.5">{helper}</p>}
    </div>
  );
}
