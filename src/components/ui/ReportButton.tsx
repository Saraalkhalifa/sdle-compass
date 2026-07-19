import React, { useState } from 'react';
import { Dialog } from './Dialog';
import { Button } from './Button';
import { useReportError, type ErrorReportType } from '@/hooks/useErrorReports';

const TYPE_OPTS: { value: ErrorReportType; label: string }[] = [
  { value: 'wrong_answer',     label: 'Wrong answer key' },
  { value: 'typo',             label: 'Typo or unclear wording' },
  { value: 'outdated_content', label: 'Outdated content' },
  { value: 'broken_link',      label: 'Broken link or resource' },
  { value: 'other',            label: 'Other issue' },
];

interface ReportButtonProps {
  questionId?: string;
  resourceId?: string;
  className?: string;
}

export function ReportButton({ questionId, resourceId, className }: ReportButtonProps) {
  const [open, setOpen]               = useState(false);
  const [type, setType]               = useState<ErrorReportType>('wrong_answer');
  const [description, setDescription] = useState('');
  const report = useReportError();

  function handleOpen(e: React.MouseEvent) {
    e.stopPropagation();
    setOpen(true);
    setType('wrong_answer');
    setDescription('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!description.trim()) return;
    report.mutate(
      {
        type,
        description: description.trim(),
        question_id: questionId ?? null,
        resource_id: resourceId ?? null,
      },
      { onSuccess: () => setOpen(false) },
    );
  }

  return (
    <>
      <button
        onClick={handleOpen}
        title="Report an issue"
        className={`p-1 rounded transition-colors text-slate-300 hover:text-red-500 hover:bg-red-50 ${className ?? ''}`}
        aria-label="Report an issue with this question"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
          <line x1="4" y1="22" x2="4" y2="15"/>
        </svg>
      </button>

      <Dialog open={open} onClose={() => setOpen(false)} title="Report an Issue" size="sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-xs text-slate-500 -mt-1">
            Help us improve by flagging incorrect, unclear, or broken content.
          </p>

          {/* Type pills */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2">Issue type</label>
            <div className="flex flex-wrap gap-1.5">
              {TYPE_OPTS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setType(opt.value)}
                  className={`px-2.5 py-1 text-xs rounded-lg border transition-colors ${
                    type === opt.value
                      ? 'bg-red-600 text-white border-red-600'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300 bg-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              placeholder="Describe the problem briefly…"
              required
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
            <Button
              type="submit"
              size="sm"
              variant="solid"
              loading={report.isPending}
              disabled={!description.trim()}
            >
              Submit Report
            </Button>
          </div>
        </form>
      </Dialog>
    </>
  );
}
