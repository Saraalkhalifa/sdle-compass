import React, { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/Button';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useSubjectsList, useTopicsBySubject } from '@/hooks/useSubjects';

// ── Import parser ─────────────────────────────────────────────────────────────

interface ParsedQuestion {
  questionText: string;
  options: string[];
  correctIdx: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface ParseError { line: number; message: string; }

interface ParseResult {
  questions: ParsedQuestion[];
  errors: ParseError[];
}

const OPTION_RE = /^([ABCD])[.)]\s+(.+)$/i;
const CORRECT_RE = /^CORRECT:\s*([ABCD])/i;
const DIFFICULTY_RE = /^DIFFICULTY:\s*(easy|medium|hard)/i;
const EXPLANATION_RE = /^EXPLANATION:\s*(.+)/i;

function parseImport(raw: string): ParseResult {
  const questions: ParsedQuestion[] = [];
  const errors: ParseError[] = [];
  const blocks = raw.split(/\n---+\n/).map(b => b.trim()).filter(Boolean);

  blocks.forEach((block, bi) => {
    const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
    let questionText = '';
    const options: string[] = [];
    let correctIdx = -1;
    let explanation = '';
    let difficulty: 'easy' | 'medium' | 'hard' = 'medium';

    for (let li = 0; li < lines.length; li++) {
      const line = lines[li];
      const globalLine = bi * 20 + li + 1;

      if (line.startsWith('Q:')) {
        questionText = line.replace(/^Q:\s*/, '').trim();
      } else if (CORRECT_RE.test(line)) {
        const m = CORRECT_RE.exec(line)!;
        correctIdx = ['A','B','C','D'].indexOf(m[1].toUpperCase());
      } else if (DIFFICULTY_RE.test(line)) {
        const m = DIFFICULTY_RE.exec(line)!;
        difficulty = m[1].toLowerCase() as 'easy' | 'medium' | 'hard';
      } else if (EXPLANATION_RE.test(line)) {
        const m = EXPLANATION_RE.exec(line)!;
        explanation = m[1].trim();
      } else if (OPTION_RE.test(line)) {
        const m = OPTION_RE.exec(line)!;
        const idx = ['A','B','C','D'].indexOf(m[1].toUpperCase());
        options[idx] = m[2].trim();
      } else if (line.startsWith('TOPIC:') || line.startsWith('//')) {
        // skip — topic is set at page level
      } else {
        errors.push({ line: globalLine, message: `Unrecognised line: "${line}"` });
      }
    }

    if (!questionText) {
      errors.push({ line: bi * 20 + 1, message: `Block ${bi + 1}: missing Q: line` });
      return;
    }
    if (options.filter(Boolean).length < 2) {
      errors.push({ line: bi * 20 + 1, message: `Block ${bi + 1}: need at least 2 options (A–D)` });
      return;
    }
    if (correctIdx < 0) {
      errors.push({ line: bi * 20 + 1, message: `Block ${bi + 1}: missing CORRECT: line` });
      return;
    }

    questions.push({ questionText, options, correctIdx, explanation, difficulty });
  });

  return { questions, errors };
}

// ── Bulk insert mutation ──────────────────────────────────────────────────────

function useBulkInsert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ topicId, questions }: { topicId: string; questions: ParsedQuestion[] }) => {
      if (!supabase) throw new Error('Supabase not configured');
      for (const q of questions) {
        const { data, error } = await supabase
          .from('questions')
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .insert({ topic_id: topicId, question_text: q.questionText, difficulty: q.difficulty, explanation: q.explanation || null } as any)
          .select('id')
          .single();
        if (error) throw error;
        const qId = (data as { id: string }).id;
        const opts = q.options.map((text, i) => ({
          question_id: qId,
          option_text: text ?? '',
          is_correct: i === q.correctIdx,
          display_order: i,
        }));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: optErr } = await supabase.from('question_options').insert(opts as any);
        if (optErr) throw optErr;
      }
    },
    onSuccess: (_, { questions }) => {
      queryClient.invalidateQueries({ queryKey: ['all-questions-admin'] });
      queryClient.invalidateQueries({ queryKey: ['all-questions-for-bank'] });
      toast.success(`${questions.length} question${questions.length !== 1 ? 's' : ''} imported.`);
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

// ── Page ──────────────────────────────────────────────────────────────────────

const FORMAT_EXAMPLE = `Q: Which of the following is the primary buffer system in blood?
A. Bicarbonate-carbonic acid system
B. Phosphate buffer system
C. Protein buffer system
D. Haemoglobin buffer system
CORRECT: A
DIFFICULTY: medium
EXPLANATION: The bicarbonate-carbonic acid system is the most important extracellular buffer.

---

Q: The Streptococcus mutans is primarily responsible for:
A. Periodontal disease
B. Dental caries
C. Oral candidiasis
D. Aphthous ulcers
CORRECT: B
DIFFICULTY: easy`;

export function AdminQuestionImports() {
  const [subjectId, setSubjectId] = useState('');
  const [topicId, setTopicId]     = useState('');
  const [raw, setRaw]             = useState('');
  const [result, setResult]       = useState<ParseResult | null>(null);
  const [imported, setImported]   = useState(false);

  const { data: subjects } = useSubjectsList();
  const { data: topics }   = useTopicsBySubject(subjectId);
  const bulkInsert = useBulkInsert();

  function handleParse() {
    const r = parseImport(raw);
    setResult(r);
    setImported(false);
  }

  function handleImport() {
    if (!topicId || !result) return;
    bulkInsert.mutate({ topicId, questions: result.questions }, {
      onSuccess: () => { setImported(true); setResult(null); setRaw(''); },
    });
  }

  return (
    <AppShell role="admin" title="Question Imports">
      <PageContainer title="Bulk Question Import" description="Paste questions in structured format to import them in bulk" maxWidth="2xl">

        {/* Format reference */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-5">
          <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">Expected Format</p>
          <pre className="text-xs text-slate-500 font-mono whitespace-pre-wrap leading-relaxed">{FORMAT_EXAMPLE}</pre>
          <p className="text-xs text-slate-400 mt-2">
            Separate multiple questions with a line of <code className="bg-slate-200 px-1 rounded">---</code>.
            CORRECT must be A, B, C, or D. DIFFICULTY defaults to <em>medium</em> if omitted.
          </p>
        </div>

        {/* Topic picker */}
        <div className="flex gap-3 mb-4 flex-wrap items-end">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Subject</label>
            <select
              value={subjectId}
              onChange={e => { setSubjectId(e.target.value); setTopicId(''); }}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select subject…</option>
              {subjects?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Topic <span className="text-red-500">*</span></label>
            <select
              value={topicId}
              onChange={e => setTopicId(e.target.value)}
              disabled={!subjectId}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-40"
            >
              <option value="">Select topic…</option>
              {topics?.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
        </div>

        {/* Text input */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-slate-600 mb-1">Paste Questions</label>
          <textarea
            value={raw}
            onChange={e => { setRaw(e.target.value); setResult(null); setImported(false); }}
            rows={16}
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-mono resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            placeholder={FORMAT_EXAMPLE}
          />
        </div>

        <div className="flex items-center gap-3 mb-6">
          <Button type="button" variant="outline" onClick={handleParse} disabled={!raw.trim()}>
            Preview Parse
          </Button>
          {result && result.questions.length > 0 && (
            <Button
              type="button"
              onClick={handleImport}
              disabled={!topicId || bulkInsert.isPending}
            >
              {bulkInsert.isPending ? 'Importing…' : `Import ${result.questions.length} Question${result.questions.length !== 1 ? 's' : ''}`}
            </Button>
          )}
          {imported && (
            <p className="text-sm text-emerald-600 font-medium">✓ Import successful</p>
          )}
        </div>

        {/* Parse results */}
        {result && (
          <div className="space-y-4">
            {result.errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-sm font-semibold text-red-700 mb-2">Parse warnings ({result.errors.length})</p>
                <ul className="text-xs text-red-600 space-y-1">
                  {result.errors.map((e, i) => (
                    <li key={i}>Line ~{e.line}: {e.message}</li>
                  ))}
                </ul>
              </div>
            )}

            {result.questions.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
                  <p className="text-sm font-semibold text-slate-700">
                    {result.questions.length} question{result.questions.length !== 1 ? 's' : ''} parsed
                    {!topicId && <span className="ml-2 text-amber-600 text-xs">(select a topic above to import)</span>}
                  </p>
                </div>
                <div className="divide-y divide-slate-100">
                  {result.questions.map((q, i) => (
                    <div key={i} className="px-4 py-3">
                      <div className="flex items-start gap-2 mb-2">
                        <span className="text-xs font-bold text-slate-400 mt-0.5 shrink-0">Q{i + 1}</span>
                        <p className="text-sm text-slate-800 font-medium">{q.questionText}</p>
                        <span className={`ml-auto shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full ${
                          q.difficulty === 'easy' ? 'bg-emerald-100 text-emerald-700' :
                          q.difficulty === 'hard' ? 'bg-red-100 text-red-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>{q.difficulty}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-1 ml-5">
                        {q.options.map((opt, oi) => opt ? (
                          <div key={oi} className={`flex items-start gap-1.5 text-xs ${oi === q.correctIdx ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
                            <span>{['A','B','C','D'][oi]}.</span>
                            <span>{opt}</span>
                            {oi === q.correctIdx && <span className="ml-auto">✓</span>}
                          </div>
                        ) : null)}
                      </div>
                      {q.explanation && (
                        <p className="text-xs text-slate-400 mt-1.5 ml-5 italic">{q.explanation}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.questions.length === 0 && result.errors.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-8">No questions detected. Check the format.</p>
            )}
          </div>
        )}
      </PageContainer>
    </AppShell>
  );
}
