import { useState, useMemo, useCallback, useEffect } from 'react';
import { EtudeLineaire, CitationItem } from '../types/etude';
import { recordReview, getItemKey, loadReviewStore } from '../utils/reviewStorage';
import {
  Layers, Eye, EyeOff, ChevronLeft, ChevronRight,
  CheckCircle2, RotateCcw, Shuffle, Flame
} from 'lucide-react';

interface FlashcardViewProps {
  etude: EtudeLineaire;
  analysisId?: string;
}

interface StudyStreak {
  current: number;
  activeDays: number;
}

const STREAK_STORAGE_KEY = 'etude-study-streak-v1';

function getDateKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function offsetDateKey(days: number): string {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + days);
  return getDateKey(date);
}

function getStreakSummary(days: string[]): StudyStreak {
  const uniqueDays = new Set(days);
  const startOffset = uniqueDays.has(getDateKey()) ? 0 : -1;
  let current = 0;
  while (uniqueDays.has(offsetDateKey(startOffset - current))) {
    current += 1;
  }

  const activeDays = Array.from({ length: 7 }, (_, index) =>
    uniqueDays.has(offsetDateKey(-index))
  ).filter(Boolean).length;

  return { current, activeDays };
}

function readStreakDays(): string[] {
  try {
    const raw = localStorage.getItem(STREAK_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((day): day is string => typeof day === 'string') : [];
  } catch {
    return [];
  }
}

const PROCEDE_COLORS: Record<string, string> = {
  'Champ lexical': 'from-emerald-500 to-teal-600',
  'Métaphore': 'from-yellow-500 to-amber-600',
  'Comparaison': 'from-amber-500 to-orange-600',
  'Personnification': 'from-pink-500 to-rose-600',
  'Antithèse': 'from-rose-500 to-red-600',
  'Répétition': 'from-red-500 to-red-700',
  'Allitération': 'from-orange-500 to-orange-700',
  'Assonance': 'from-lime-500 to-green-600',
  'Rime': 'from-violet-500 to-purple-600',
  'Présentatif': 'from-cyan-500 to-blue-600',
  'Ponctuation': 'from-blue-500 to-indigo-600',
  'Énumération': 'from-teal-500 to-emerald-600',
  'Apostrophe': 'from-fuchsia-500 to-pink-600',
  'Euphémisme': 'from-indigo-500 to-blue-700',
};

function getProcedeGradient(proc: string): string {
  for (const [key, gradient] of Object.entries(PROCEDE_COLORS)) {
    if (proc.toLowerCase().includes(key.toLowerCase())) return gradient;
  }
  return 'from-indigo-500 to-purple-600';
}

export default function FlashcardView({ etude, analysisId }: FlashcardViewProps) {
  const currentAnalysisId = analysisId || etude.id || 'default';
  const allCitations = useMemo(
    () => etude.movements.flatMap(m => m.citations),
    [etude.movements]
  );

  const [cards, setCards] = useState(() => {
    const shuffled = [...allCitations];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  });

  const [currentIdx, setCurrentIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isInterpretationRevealed, setIsInterpretationRevealed] = useState(false);
  const [knownCards, setKnownCards] = useState<Set<string>>(() => {
    const store = loadReviewStore();
    const set = new Set<string>();
    allCitations.forEach(c => {
      const key = getItemKey(currentAnalysisId, c.id);
      const state = store.srs[key];
      if (state && state.box >= 3) {
        set.add(c.id);
      }
    });
    return set;
  });
  const [streakDays, setStreakDays] = useState<string[]>(readStreakDays);

  const card = cards[currentIdx];
  const streak = useMemo(() => getStreakSummary(streakDays), [streakDays]);

  const recordStudyDay = useCallback(() => {
    const today = getDateKey();
    setStreakDays(previous => {
      if (previous.includes(today)) return previous;
      const updated = [...previous, today].slice(-366);
      try {
        localStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // Continue the session even when browser storage is unavailable.
      }
      return updated;
    });
  }, []);

  useEffect(() => {
    recordStudyDay();
  }, [recordStudyDay]);

  const flip = useCallback(() => {
    setIsFlipped(flipped => !flipped);
    setIsInterpretationRevealed(false);
  }, []);

  const next = useCallback(() => {
    if (currentIdx < cards.length - 1) {
      setCurrentIdx(i => i + 1);
      setIsFlipped(false);
      setIsInterpretationRevealed(false);
    }
  }, [currentIdx, cards.length]);

  const prev = useCallback(() => {
    if (currentIdx > 0) {
      setCurrentIdx(i => i - 1);
      setIsFlipped(false);
      setIsInterpretationRevealed(false);
    }
  }, [currentIdx]);

  const shuffle = useCallback(() => {
    const shuffled = [...cards];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setCards(shuffled);
    setCurrentIdx(0);
    setIsFlipped(false);
    setIsInterpretationRevealed(false);
  }, [cards]);

  const markKnown = useCallback((known: boolean) => {
    if (card) {
      recordReview({
        analysisId: currentAnalysisId,
        citationId: card.id,
        movementId: card.movementId,
        procede: card.procede,
        mode: 'flashcard',
        correct: known,
        rating: known ? 'good' : 'again',
      });
    }
    setKnownCards(prev => {
      const nextSet = new Set(prev);
      if (known && card) nextSet.add(card.id);
      else if (card) nextSet.delete(card.id);
      return nextSet;
    });
    recordStudyDay();
    next();
  }, [card, next, recordStudyDay, currentAnalysisId]);

  const gradient = card ? getProcedeGradient(card.procede) : 'from-indigo-500 to-purple-600';
  const progressPct = cards.length > 0 ? ((currentIdx + 1) / cards.length) * 100 : 0;

  const frontCard = (
    <div className="p-8 h-full flex flex-col">
      <div className="text-center space-y-6 flex-1 flex flex-col items-center justify-center">
        <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Citation</div>
        <div className="text-3xl">[cite]</div>
        <blockquote className="text-lg text-slate-100 leading-relaxed max-w-sm">
          {card?.citation}
        </blockquote>
        {card?.verses && card.verses.length > 0 && (
          <div className="text-sm text-slate-500 italic">
            Vers {card.verses.join(', ')}
          </div>
        )}
      </div>
      <div className="text-center text-slate-500 text-sm flex items-center justify-center gap-2 mt-4">
        <Eye size={14} /> Cliquez pour voir le proc&#233;d&#233;
      </div>
    </div>
  );

  const backCard = (
    <div className="p-8 h-full flex flex-col">
      <div className="text-center space-y-6 flex-1 flex flex-col items-center justify-center">
        <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Proc&#233;d&#233; &#224; m&#233;moriser</div>
        <div className="text-3xl">[proc]</div>
        <div className="flashcard-procede text-xl font-bold text-[#a95f43]">
          {card?.procede}
        </div>
        {isInterpretationRevealed ? (
          <div className="max-w-sm space-y-3">
            <div className="text-slate-300 leading-relaxed text-sm text-center">
              {card?.interpretation}
            </div>
            <button
              type="button"
              onClick={event => {
                event.stopPropagation();
                setIsInterpretationRevealed(false);
              }}
              className="text-xs text-slate-500 hover:text-slate-700 underline underline-offset-2"
            >
              Masquer l&#8217;interpr&#233;tation
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={event => {
              event.stopPropagation();
              setIsInterpretationRevealed(true);
            }}
            className="copper-action px-4 py-2 rounded-lg text-white text-sm font-medium"
          >
            Voir l&#8217;interpr&#233;tation
          </button>
        )}
      </div>
      <div className="text-center text-slate-500 text-sm flex items-center justify-center gap-2 mt-4">
        <EyeOff size={14} /> Cliquez pour voir la citation
      </div>
    </div>
  );

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="wood-icon w-10 h-10 rounded-lg flex items-center justify-center">
            <Layers size={20} className="text-white" />
          </div>
          <div>
            <div className="font-semibold text-white">Cartes Memoire</div>
            <div className="text-xs text-slate-500">{cards.length} cartes</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-amber-600 bg-amber-500/10 px-3 py-1.5 rounded-xl" title="Jours d'étude consécutifs">
            <Flame size={13} />
            {streak.current} jour{streak.current > 1 ? 's' : ''} · {streak.activeDays}/7 cette semaine
          </div>
          <button
            onClick={shuffle}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
            title="Melanger"
          >
            <Shuffle size={16} />
          </button>
          <div className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl">
            <CheckCircle2 size={12} />
            {knownCards.size} maitrisees
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-3">
        <button onClick={prev} disabled={currentIdx === 0} className="p-2 rounded-xl bg-slate-800 disabled:opacity-30 text-slate-400 hover:text-white transition-all">
          <ChevronLeft size={16} />
        </button>
        <div className="wood-progress-track flex-1 h-2 rounded-full overflow-hidden">
          <div className="wood-progress-fill h-full rounded-full transition-all duration-300" style={{ width: `${progressPct}%` }} />
        </div>
        <span className="text-sm text-slate-500 shrink-0">{currentIdx + 1}/{cards.length}</span>
        <button onClick={next} disabled={currentIdx === cards.length - 1} className="p-2 rounded-xl bg-slate-800 disabled:opacity-30 text-slate-400 hover:text-white transition-all">
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Flashcard */}
      {card && (
        <div
          onClick={flip}
          className={`flashcard-stage relative min-h-[340px] cursor-pointer select-none ${isFlipped ? 'is-flipped' : ''}`}
          role="button"
          tabIndex={0}
          onKeyDown={event => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              flip();
            }
          }}
          aria-label={isFlipped ? 'Retourner la carte pour voir la citation' : 'Retourner la carte pour voir le proc&#233;d&#233;'}
        >
          <div className="flashcard-inner">
            <div className="flashcard-face flashcard-front wood-panel rounded-lg border border-white/10 overflow-hidden">
              {frontCard}
            </div>
            <div className="flashcard-face flashcard-back wood-panel rounded-lg border border-white/10 overflow-hidden">
              {backCard}
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 justify-center">
        <button
          onClick={() => markKnown(false)}
          className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium transition-all"
        >
          <RotateCcw size={16} className="text-red-400" /> A revoir
        </button>
        <button
          onClick={() => markKnown(true)}
          className="copper-action flex items-center gap-2 px-6 py-3 text-white rounded-lg font-semibold transition-all"
        >
          <CheckCircle2 size={16} /> Maitrisee
        </button>
      </div>

      {/* Progress dots */}
      <div className="flex gap-1 flex-wrap">
        {cards.map((c, i) => (
          <button
            key={c.id}
            onClick={() => { setCurrentIdx(i); setIsFlipped(false); }}
            className={`h-2 rounded-full transition-all duration-200 flex-1 max-w-6 ${
              i === currentIdx ? 'bg-indigo-500' :
              knownCards.has(c.id) ? 'bg-emerald-500' : 'bg-slate-700 hover:bg-slate-600'
            }`}
            title={c.procede}
          />
        ))}
      </div>
    </div>
  );
}
