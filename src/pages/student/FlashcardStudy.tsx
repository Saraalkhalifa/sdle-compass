import React, { useState, useCallback, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { ROUTES } from '@/config/app';
import { useFlashcardsByDeck, useUpsertFlashcardProgress, type CardRow, type FlashcardStatus } from '@/hooks/useFlashcards';

// ── Flip card ────────────────────────────────────────────────────────

interface FlipCardProps {
  card: CardRow;
  isFlipped: boolean;
  onFlip: () => void;
}

function FlipCard({ card, isFlipped, onFlip }: FlipCardProps) {
  return (
    <div
      onClick={onFlip}
      style={{ perspective: '1200px' }}
      className="cursor-pointer select-none"
      role="button"
      aria-label={isFlipped ? 'Flip to question' : 'Tap to reveal answer'}
    >
      <div
        style={{
          position: 'relative',
          height: '280px',
          transformStyle: 'preserve-3d',
          transition: 'transform 0.45s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* Front */}
        <div
          style={{ backfaceVisibility: 'hidden', position: 'absolute', inset: 0 }}
          className="rounded-2xl bg-white border-2 border-slate-200 shadow-sm flex flex-col items-center justify-center p-8 gap-4"
        >
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">Question</span>
          <p className="text-xl font-semibold text-slate-900 text-center leading-relaxed">{card.front_text}</p>
          {card.hint && (
            <p className="text-xs text-slate-400 italic text-center">Hint: {card.hint}</p>
          )}
          <span className="text-xs text-slate-300 mt-2">Tap to reveal answer</span>
        </div>

        {/* Back */}
        <div
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', position: 'absolute', inset: 0 }}
          className="rounded-2xl bg-blue-50 border-2 border-blue-200 shadow-sm flex flex-col items-center justify-center p-8 gap-4"
        >
          <span className="text-xs font-semibold uppercase tracking-widest text-blue-400">Answer</span>
          <p className="text-xl font-semibold text-slate-900 text-center leading-relaxed">{card.back_text}</p>
          {card.back_text_ar && (
            <p className="text-sm text-slate-500 text-center" dir="rtl">{card.back_text_ar}</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ── End screen ───────────────────────────────────────────────────────

interface EndScreenProps {
  total: number;
  known: number;
  onStudyAgain: () => void;
  topicPath: string;
  subjectId: string;
  topicId: string;
}

function EndScreen({ total, known, onStudyAgain, subjectId, topicId }: EndScreenProps) {
  const learning = total - known;
  const percent = Math.round((known / total) * 100);

  return (
    <div className="flex flex-col items-center justify-center gap-6 py-12 text-center">
      <div className="text-6xl">{percent >= 80 ? '🎉' : percent >= 50 ? '👍' : '📚'}</div>
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Session complete!</h2>
        <p className="text-slate-500 mt-1">{total} cards reviewed</p>
      </div>

      <div className="flex gap-6">
        <div className="text-center">
          <p className="text-3xl font-bold text-emerald-600">{known}</p>
          <p className="text-sm text-slate-500 mt-0.5">Got it</p>
        </div>
        <div className="w-px bg-slate-200" />
        <div className="text-center">
          <p className="text-3xl font-bold text-amber-600">{learning}</p>
          <p className="text-sm text-slate-500 mt-0.5">Still learning</p>
        </div>
      </div>

      {/* Progress ring */}
      <div className="relative w-24 h-24">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="42" fill="none" stroke="#e2e8f0" strokeWidth="10" />
          <circle cx="50" cy="50" r="42" fill="none" stroke="#10b981" strokeWidth="10"
            strokeDasharray={`${2 * Math.PI * 42}`}
            strokeDashoffset={`${2 * Math.PI * 42 * (1 - percent / 100)}`}
            strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold text-slate-900">{percent}%</span>
        </div>
      </div>

      <div className="flex gap-3 flex-wrap justify-center">
        <Button color="primary" onClick={onStudyAgain}>Study again</Button>
        <Link to={ROUTES.topic(subjectId, topicId)}>
          <Button variant="outline" color="neutral">Back to topic</Button>
        </Link>
      </div>
    </div>
  );
}

// ── Main study page ──────────────────────────────────────────────────

export function FlashcardStudy() {
  const { subjectId = '', topicId = '', deckId = '' } = useParams<{
    subjectId: string; topicId: string; deckId: string;
  }>();
  const navigate = useNavigate();

  const { data: cards, isLoading } = useFlashcardsByDeck(deckId);
  const upsertProgress = useUpsertFlashcardProgress();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [results, setResults] = useState<Record<string, FlashcardStatus>>({});
  const [isDone, setIsDone] = useState(false);

  const activeCards = cards?.filter((c) => c.is_active) ?? [];
  const card = activeCards[currentIndex];

  const handleFlip = useCallback(() => setIsFlipped((f) => !f), []);

  const handleAnswer = useCallback(
    (status: FlashcardStatus) => {
      if (!card) return;
      setResults((prev) => ({ ...prev, [card.id]: status }));
      upsertProgress.mutate({ flashcardId: card.id, status, deckId });

      if (currentIndex + 1 >= activeCards.length) {
        setIsDone(true);
      } else {
        setCurrentIndex((i) => i + 1);
        setIsFlipped(false);
      }
    },
    [card, currentIndex, activeCards.length, deckId, upsertProgress],
  );

  const handleStudyAgain = useCallback(() => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setResults({});
    setIsDone(false);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (isDone || !card) return;
      if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); handleFlip(); }
      if (isFlipped) {
        if (e.key === 'ArrowLeft' || e.key === '1') handleAnswer('learning');
        if (e.key === 'ArrowRight' || e.key === '2') handleAnswer('known');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isDone, card, isFlipped, handleFlip, handleAnswer]);

  const knownCount = Object.values(results).filter((s) => s === 'known').length;

  return (
    <AppShell role="student" title="Flashcard study">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Back link */}
        <Link to={ROUTES.topic(subjectId, topicId)}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-6 group">
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"
            className="group-hover:-translate-x-0.5 transition-transform">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to topic
        </Link>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-48 rounded-lg" />
            <Skeleton className="h-72 w-full rounded-2xl" />
          </div>
        ) : activeCards.length === 0 ? (
          <div className="py-20 text-center text-slate-400">
            <p className="text-3xl mb-3">🃏</p>
            <p className="font-medium text-slate-600">No cards in this deck yet</p>
            <button onClick={() => navigate(-1)} className="mt-4 text-blue-600 hover:underline text-sm">Go back</button>
          </div>
        ) : isDone ? (
          <EndScreen
            total={activeCards.length} known={knownCount}
            onStudyAgain={handleStudyAgain}
            topicPath={ROUTES.topic(subjectId, topicId)}
            subjectId={subjectId} topicId={topicId}
          />
        ) : (
          <>
            {/* Progress bar */}
            <div className="mb-6">
              <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                <span>Card {currentIndex + 1} of {activeCards.length}</span>
                <span className="text-emerald-600 font-medium">{knownCount} known</span>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                  style={{ width: `${((currentIndex) / activeCards.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Flip card */}
            <FlipCard card={card} isFlipped={isFlipped} onFlip={handleFlip} />

            {/* Action buttons */}
            <div className="mt-6">
              {!isFlipped ? (
                <div className="text-center">
                  <Button color="primary" size="lg" onClick={handleFlip} className="w-full max-w-xs">
                    Reveal answer
                  </Button>
                  <p className="text-xs text-slate-400 mt-2">or press Space / Enter</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleAnswer('learning')}
                    className="flex flex-col items-center gap-1 px-4 py-4 rounded-xl border-2 border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 hover:border-amber-300 transition-all font-semibold"
                  >
                    <span className="text-xl">🔄</span>
                    <span className="text-sm">Still learning</span>
                    <span className="text-xs opacity-60">← or press 1</span>
                  </button>
                  <button
                    onClick={() => handleAnswer('known')}
                    className="flex flex-col items-center gap-1 px-4 py-4 rounded-xl border-2 border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300 transition-all font-semibold"
                  >
                    <span className="text-xl">✓</span>
                    <span className="text-sm">Got it!</span>
                    <span className="text-xs opacity-60">→ or press 2</span>
                  </button>
                </div>
              )}
            </div>

            {/* Mini dot trail */}
            <div className="flex justify-center gap-1 mt-6 flex-wrap">
              {activeCards.map((c, i) => {
                const r = results[c.id];
                return (
                  <div key={c.id} className={`w-2 h-2 rounded-full transition-colors ${
                    i === currentIndex ? 'bg-blue-500 scale-125' :
                    r === 'known' ? 'bg-emerald-400' :
                    r === 'learning' ? 'bg-amber-400' :
                    'bg-slate-200'
                  }`} />
                );
              })}
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
