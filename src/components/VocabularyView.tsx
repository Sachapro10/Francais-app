import { useState, useCallback, useMemo } from 'react';
import { vocabularyList, categoryLabels, VocabularyEntry } from '../data/vocabulary';
import {
  BookOpen, Eye, EyeOff, ChevronLeft, ChevronRight,
  CheckCircle2, Shuffle, Flame, Filter, Layers
} from 'lucide-react';

interface VocabularyViewProps {}

interface StudyStreak {
  current: number;
  activeDays: number;
}

const STREAK_STORAGE_KEY = 'vocabulary-study-streak-v1';

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

const CATEGORY_COLORS: Record<VocabularyEntry['category'], string> = {
  'figures-style': 'from-violet-500 to-purple-600',
  'classes-mots': 'from-teal-500 to-emerald-600',
  'termes-analyse': 'from-amber-500 to-orange-600',
};

function getCategoryGradient(cat: VocabularyEntry['category']): string {
  return CATEGORY_COLORS[cat] || 'from-indigo-500 to-purple-600';
}

export default function VocabularyView({}: VocabularyViewProps) {
  const [cards, setCards] = useState(() => {
    const shuffled = [...vocabularyList];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  });

  const [currentIdx, setCurrentIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [streakDays, setStreakDays] = useState<string[]>(readStreakDays);
  const [selectedCategory, setSelectedCategory] = useState<VocabularyEntry['category'] | 'all'>('all');
  const [knownCards, setKnownCards] = useState<Set<string>>(() => {
    try {
      const raw = localStorage.getItem('vocabulary-known-v1');
      return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
    } catch {
      return new Set();
    }
  });

  const card = cards[currentIdx];
  const streak = useMemo(() => getStreakSummary(streakDays), [streakDays]);

  const filteredCards = useMemo(() => {
    if (selectedCategory === 'all') return cards;
    return cards.filter(c => c.category === selectedCategory);
  }, [cards, selectedCategory]);

  const currentFilteredCard = filteredCards[currentIdx] || filteredCards[0];
  const effectiveCard = selectedCategory === 'all' ? card : currentFilteredCard;

  const recordStudyDay = useCallback(() => {
    const today = getDateKey();
    setStreakDays(prev => {
      if (prev.includes(today)) return prev;
      const updated = [...prev, today].slice(-366);
      try {
        localStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // Continue even when browser storage is unavailable
      }
      return updated;
    });
  }, []);

  const flip = useCallback(() => {
    setIsFlipped(flipped => !flipped);
  }, []);

  const next = useCallback(() => {
    const maxIdx = filteredCards.length - 1;
    if (selectedCategory === 'all') {
      if (currentIdx < cards.length - 1) {
        setCurrentIdx(i => i + 1);
        setIsFlipped(false);
      }
    } else {
      if (currentIdx < maxIdx) {
        setCurrentIdx(i => i + 1);
        setIsFlipped(false);
      }
    }
  }, [currentIdx, cards.length, filteredCards.length, selectedCategory]);

  const prev = useCallback(() => {
    if (currentIdx > 0) {
      setCurrentIdx(i => i - 1);
      setIsFlipped(false);
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
  }, [cards]);

  const markKnown = useCallback((known: boolean) => {
    if (effectiveCard) {
      setKnownCards(prev => {
        const nextSet = new Set(prev);
        if (known) nextSet.add(effectiveCard.id);
        else nextSet.delete(effectiveCard.id);
        try {
          localStorage.setItem('vocabulary-known-v1', JSON.stringify(Array.from(nextSet)));
        } catch {
          // Continue even when storage fails
        }
        return nextSet;
      });
    }
    recordStudyDay();
    next();
  }, [effectiveCard, next, recordStudyDay]);

  const gradient = effectiveCard ? getCategoryGradient(effectiveCard.category) : 'from-indigo-500 to-purple-600';
  const progressPct = filteredCards.length > 0 ? ((currentIdx + 1) / filteredCards.length) * 100 : 0;

  const frontCard = (
    <div className="p-8 h-full flex flex-col">
      <div className="text-center space-y-4 flex-1 flex flex-col items-center justify-center">
        <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Terme littéraire</div>
        <div className="text-4xl font-serif-literary text-ink">{effectiveCard?.word}</div>
        <div className="text-sm text-slate-500 italic">{effectiveCard?.partOfSpeech}</div>
        <div className="text-xs text-slate-400 mt-4 bg-slate-100 px-3 py-1 rounded-full">
          {effectiveCard && categoryLabels[effectiveCard.category]}
        </div>
      </div>
      <div className="text-center text-slate-500 text-sm flex items-center justify-center gap-2 mt-4">
        <Eye size={14} /> Cliquez pour voir la définition
      </div>
    </div>
  );

  const backCard = (
    <div className="p-8 h-full flex flex-col">
      <div className="text-center space-y-4 flex-1 flex flex-col items-center justify-center">
        <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Définition</div>
        <div className="text-lg text-ink leading-relaxed max-w-sm text-center">
          {effectiveCard?.definition}
        </div>
        {effectiveCard?.example && (
          <div className="text-sm text-slate-500 italic border-l-2 border-slate-300 pl-3 mt-2">
            "{effectiveCard.example}"
          </div>
        )}
      </div>
      <div className="text-center text-slate-500 text-sm flex items-center justify-center gap-2 mt-4">
        <EyeOff size={14} /> Cliquez pour voir le terme
      </div>
    </div>
  );

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="wood-icon w-10 h-10 rounded-lg flex items-center justify-center">
            <BookOpen size={20} className="text-white" />
          </div>
          <div>
            <div className="font-semibold text-ink">Vocabulaire du Bac</div>
            <div className="text-xs text-slate-500">{filteredCards.length} cartes · {knownCards.size} maîtrisées</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 px-3 py-1.5 rounded-xl" title="Jours d'étude consécutifs">
            <Flame size={13} />
            {streak.current} jour{streak.current > 1 ? 's' : ''} · {streak.activeDays}/7
          </div>
          <button
            onClick={shuffle}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 transition-all"
            title="Mélanger"
          >
            <Shuffle size={16} />
          </button>
          <div className="flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl">
            <CheckCircle2 size={12} />
            {knownCards.size}
          </div>
        </div>
      </div>

      {/* Category filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter size={14} className="text-slate-400 shrink-0" />
        <button
          onClick={() => { setSelectedCategory('all'); setCurrentIdx(0); setIsFlipped(false); }}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            selectedCategory === 'all'
              ? 'copper-action text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Toutes ({vocabularyList.length})
        </button>
        {(Object.keys(categoryLabels) as VocabularyEntry['category'][]).map(cat => (
          <button
            key={cat}
            onClick={() => { setSelectedCategory(cat); setCurrentIdx(0); setIsFlipped(false); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              selectedCategory === cat
                ? 'copper-action text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {categoryLabels[cat]} ({vocabularyList.filter(c => c.category === cat).length})
          </button>
        ))}
      </div>

      {/* Progress */}
      <div className="flex items-center gap-3">
        <button onClick={prev} disabled={currentIdx === 0} className="p-2 rounded-xl bg-slate-100 disabled:opacity-30 text-slate-600 hover:text-slate-800 transition-all">
          <ChevronLeft size={16} />
        </button>
        <div className="wood-progress-track flex-1 h-2 rounded-full overflow-hidden">
          <div className="wood-progress-fill h-full rounded-full transition-all duration-300" style={{ width: `${progressPct}%` }} />
        </div>
        <span className="text-sm text-slate-500 shrink-0">{currentIdx + 1}/{filteredCards.length}</span>
        <button onClick={next} disabled={currentIdx >= filteredCards.length - 1} className="p-2 rounded-xl bg-slate-100 disabled:opacity-30 text-slate-600 hover:text-slate-800 transition-all">
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Flashcard */}
      {effectiveCard && (
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
          aria-label={isFlipped ? 'Retourner la carte pour voir le terme' : 'Retourner la carte pour voir la définition'}
        >
          <div className="flashcard-inner">
            <div className="flashcard-face flashcard-front wood-panel rounded-lg border border-slate-200 overflow-hidden">
              {frontCard}
            </div>
            <div className="flashcard-face flashcard-back wood-panel rounded-lg border border-slate-200 overflow-hidden">
              {backCard}
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 justify-center">
        <button
          onClick={() => markKnown(false)}
          className="flex items-center gap-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg font-medium transition-all"
        >
          <CheckCircle2 size={16} className="text-red-500" /> À revoir
        </button>
        <button
          onClick={() => markKnown(true)}
          className="copper-action flex items-center gap-2 px-6 py-3 text-white rounded-lg font-semibold transition-all"
        >
          <CheckCircle2 size={16} /> Maîtrisée
        </button>
      </div>

      {/* Progress dots */}
      <div className="flex gap-1 flex-wrap">
        {filteredCards.slice(0, 50).map((c, i) => (
          <button
            key={c.id}
            onClick={() => { setCurrentIdx(i); setIsFlipped(false); }}
            className={`h-2 rounded-full transition-all duration-200 flex-1 max-w-6 ${
              i === currentIdx ? 'bg-indigo-500' :
              knownCards.has(c.id) ? 'bg-emerald-500' : 'bg-slate-200 hover:bg-slate-300'
            }`}
            title={c.word}
          />
        ))}
      </div>
    </div>
  );
}
