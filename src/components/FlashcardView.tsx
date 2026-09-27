import { useState, useMemo, useCallback } from 'react';
import { EtudeLineaire, CitationItem } from '../types/etude';
import {
  Layers, Eye, EyeOff, ChevronLeft, ChevronRight,
  CheckCircle2, RotateCcw, Shuffle
} from 'lucide-react';

interface FlashcardViewProps {
  etude: EtudeLineaire;
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

export default function FlashcardView({ etude }: FlashcardViewProps) {
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
  const [knownCards, setKnownCards] = useState<Set<string>>(new Set());

  const card = cards[currentIdx];

  const flip = useCallback(() => setIsFlipped(f => !f), []);

  const next = useCallback(() => {
    if (currentIdx < cards.length - 1) {
      setCurrentIdx(i => i + 1);
      setIsFlipped(false);
    }
  }, [currentIdx, cards.length]);

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
    setKnownCards(prev => {
      const next = new Set(prev);
      if (known && card) next.add(card.id);
      else if (card) next.delete(card.id);
      return next;
    });
    next();
  }, [card, next]);

  const gradient = card ? getProcedeGradient(card.procede) : 'from-indigo-500 to-purple-600';
  const progressPct = cards.length > 0 ? ((currentIdx + 1) / cards.length) * 100 : 0;

  const frontCard = (
    <div className="p-8 h-full flex flex-col">
      <div className="text-center space-y-6 flex-1 flex flex-col items-center justify-center">
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
        <Eye size={14} /> Cliquez pour retourner
      </div>
    </div>
  );

  const backCard = (
    <div className="p-8 h-full flex flex-col">
      <div className="text-center space-y-6 flex-1 flex flex-col items-center justify-center">
        <div className="text-3xl">[proc]</div>
        <div className={`text-lg font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
          {card?.procede}
        </div>
        <div className="text-slate-300 leading-relaxed max-w-sm text-sm text-center">
          {card?.interpretation}
        </div>
      </div>
      <div className="text-center text-slate-500 text-sm flex items-center justify-center gap-2 mt-4">
        <EyeOff size={14} /> Cliquez pour retourner
      </div>
    </div>
  );

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
            <Layers size={20} className="text-white" />
          </div>
          <div>
            <div className="font-semibold text-white">Cartes Memoire</div>
            <div className="text-xs text-slate-500">{cards.length} cartes</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
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
        <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-indigo-500 rounded-full transition-all duration-300" style={{ width: `${progressPct}%` }} />
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
          className="relative min-h-[340px] cursor-pointer select-none"
        >
          <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${gradient} opacity-10`} />
          <div className={`relative h-full rounded-2xl border border-white/10 bg-slate-900/80 backdrop-blur overflow-hidden transition-all duration-300 ${isFlipped ? 'shadow-2xl shadow-indigo-500/20' : ''}`}>
            {!isFlipped ? frontCard : backCard}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 justify-center">
        <button
          onClick={() => markKnown(false)}
          className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium transition-all"
        >
          <RotateCcw size={16} className="text-red-400" /> A revoir
        </button>
        <button
          onClick={() => markKnown(true)}
          className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold transition-all shadow-lg shadow-emerald-500/20"
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
