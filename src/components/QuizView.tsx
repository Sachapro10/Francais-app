import { useState, useCallback, useMemo, useRef } from 'react';
import { EtudeLineaire, CitationItem } from '../types/etude';
import {
  Target, Trophy, CheckCircle2, XCircle, HelpCircle,
  RotateCcw, ChevronRight, Lightbulb, Zap, Eye, EyeOff,
  BookOpen, Microscope
} from 'lucide-react';
import { ALL_PROCEDES } from '../utils/procedeDetector';

interface QuizViewProps {
  etude: EtudeLineaire;
  onComplete: () => void;
}

type QuizStep = 'intro' | 'playing' | 'reveal' | 'done';

interface QuizState {
  phase: QuizStep;
  currentIdx: number;
  score: number;
  total: number;
  selectedQuote: string;
  selectedProcede: string;
  isCorrect: boolean | null;
  userAnswered: boolean;
}

const QUOTE_COLOR = 'bg-amber-100/10 text-amber-200 border-amber-400/40';
const CORRECT_BG = 'bg-emerald-500/15 border-emerald-400/40';
const WRONG_BG = 'bg-red-500/15 border-red-400/40';

function QuoteInline({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className="text-amber-400">
      <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z"/>
    </svg>
  );
}

export default function QuizView({ etude, onComplete }: QuizViewProps) {
  const allCitations = useMemo(
    () => etude.movements.flatMap(m => m.citations),
    [etude.movements]
  );

  // Shuffle citations
  const shuffled = useMemo(() => {
    const s = [...allCitations];
    for (let i = s.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [s[i], s[j]] = [s[j], s[i]];
    }
    return s;
  }, [allCitations]);

  const [state, setState] = useState<QuizState>({
    phase: 'intro',
    currentIdx: 0,
    score: 0,
    total: shuffled.length,
    selectedQuote: '',
    selectedProcede: '',
    isCorrect: null,
    userAnswered: false,
  });

  const current = shuffled[state.currentIdx];
  const progress = state.total > 0 ? (state.currentIdx / state.total) * 100 : 0;

  // All unique procedes for the selector
  const allProcedes = useMemo(() => {
    const set = new Set<string>();
    allCitations.forEach(c => set.add(c.procede));
    return Array.from(set).sort();
  }, [allCitations]);

  // Build answer options for current question — always exactly 4: 3 decoys + 1 correct
  const answerOptions = useMemo(() => {
    if (!current) return [];
    const proc = current.procede;
    // Use ALL_PROCEDES as the decoy pool, excluding the correct answer
    const decoyPool = ALL_PROCEDES.filter(p => p !== proc);
    const shuffledDecoys = decoyPool.sort(() => Math.random() - 0.5);
    const decoys = shuffledDecoys.slice(0, 3);
    // Randomly place the correct answer among the decoys
    const options = [...decoys, proc].sort(() => Math.random() - 0.5);
    return options;
  }, [current]);

  // Find matching highlights in the poem — by quote text, or fall back to verse range
  const matchingHighlights = useMemo(() => {
    if (!current || etude.textLines.length === 0) return [];
    const results: { lineIdx: number; start: number; end: number; text: string }[] = [];

    for (const quote of current.quotes) {
      const nq = quote.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
      for (let i = 0; i < etude.textLines.length; i++) {
        const nl = etude.textLines[i].toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
        const idx = nl.indexOf(nq);
        if (idx !== -1) {
          results.push({ lineIdx: i, start: idx, end: idx + quote.length, text: etude.textLines[i].slice(idx, idx + quote.length) });
        }
      }
    }

    if (results.length === 0 && current.verses.length > 0) {
      for (const verseNum of current.verses) {
        const lineIdx = verseNum - 1;
        if (lineIdx >= 0 && lineIdx < etude.textLines.length) {
          results.push({ lineIdx, start: 0, end: etude.textLines[lineIdx].length, text: etude.textLines[lineIdx] });
        }
      }
    }

    return results;
  }, [current, etude.textLines]);

  const selectProcede = useCallback((proc: string) => {
    if (!current || state.userAnswered) return;
    const correct = current.procede.toLowerCase() === proc.toLowerCase();
    setState(s => ({ ...s, selectedProcede: proc, isCorrect: correct, userAnswered: true, score: correct ? s.score + 1 : s.score }));
  }, [current, state.userAnswered]);

  const nextQuestion = useCallback(() => {
    setState(s => {
      const nextIdx = s.currentIdx + 1;
      if (nextIdx >= s.total) return { ...s, phase: 'done' };
      return { ...s, currentIdx: nextIdx, selectedProcede: '', isCorrect: null, userAnswered: false };
    });
  }, []);

  const restartQuiz = useCallback(() => {
    setState({ phase: 'intro', currentIdx: 0, score: 0, total: shuffled.length, selectedQuote: '', selectedProcede: '', isCorrect: null, userAnswered: false });
  }, [shuffled.length]);

  // Build word ranges for highlighting
  const buildWordRanges = (line: string, lineIdx: number) => {
    const lineHighlights = matchingHighlights.filter(h => h.lineIdx === lineIdx);
    if (lineHighlights.length === 0) return [{ text: line }];
    const ranges: { text: string; highlight?: { start: number; end: number; text: string } }[] = [];
    let lastEnd = 0;
    const sorted = [...lineHighlights].sort((a, b) => a.start - b.start)
      .reduce<(typeof lineHighlights[0][])[]>((acc, h) => {
        if (acc.length === 0) return [[h]];
        const last = acc[acc.length - 1];
        const merged = { ...h };
        for (const prev of last) {
          if (h.start <= prev.end) {
            merged.start = Math.min(merged.start, prev.start);
            merged.end = Math.max(merged.end, prev.end);
            merged.text = line.slice(merged.start, merged.end);
            last.splice(last.indexOf(prev), 1, merged);
            return acc;
          }
        }
        last.push(merged);
        return acc;
      }, []).flat();
    for (const h of sorted) {
      if (h.start > lastEnd) ranges.push({ text: line.slice(lastEnd, h.start) });
      ranges.push({ text: line.slice(h.start, h.end), highlight: h });
      lastEnd = h.end;
    }
    if (lastEnd < line.length) ranges.push({ text: line.slice(lastEnd) });
    return ranges;
  };

  if (state.phase === 'intro') {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="max-w-lg mx-auto text-center py-10 space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-500/20 to-red-500/20 border border-amber-500/20 flex items-center justify-center mx-auto">
            <Target size={36} className="text-amber-400" />
          </div>
          <h2 className="text-3xl font-bold text-white font-serif-literary">Mode Quiz</h2>
          <p className="text-slate-400 leading-relaxed">
            Lisez la <strong className="text-slate-200">citation</strong> puis identifiez le{' '}
            <strong className="text-slate-200">procédé littéraire</strong> parmi les propositions.
            Les mots de la citation seront mis en surbrillance dans le poème.
          </p>
          <div className="inline-flex items-center gap-3 bg-slate-800/60 rounded-2xl px-5 py-3">
            <Trophy size={18} className="text-amber-400" />
            <span className="text-sm text-slate-300">{shuffled.length} questions</span>
            <span className="text-slate-600">·</span>
            <span className="text-sm text-slate-400">Score final à la fin</span>
          </div>
          <button
            onClick={() => setState(s => ({ ...s, phase: 'playing' }))}
            className="inline-flex items-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-105"
          >
            Commencer le quiz <ChevronRight size={18} />
          </button>
        </div>

        {etude.textLines.length > 0 && (
          <div className="wood-panel paper-sheet rounded-lg overflow-hidden">
            <div className="px-5 py-3 border-b border-white/5 flex items-center gap-2">
              <BookOpen size={14} className="text-amber-400" />
              <span className="text-sm font-medium text-white">{etude.title}</span>
            </div>
            <div className="px-5 py-4">
              {etude.textLines.map((line, i) => (
                <div key={i} className="flex gap-4 py-1 text-base leading-relaxed font-serif-literary text-slate-300">
                  <span className="text-slate-600 select-none w-6 shrink-0 text-right text-sm">{i + 1}</span>
                  <span>{line}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (state.phase === 'done') {
    const pct = state.total > 0 ? Math.round((state.score / state.total) * 100) : 0;
    return (
      <div className="max-w-lg mx-auto text-center py-16 space-y-6">
        <div className={`w-24 h-24 rounded-full mx-auto flex items-center justify-center ${pct >= 80 ? 'bg-emerald-500/20' : pct >= 50 ? 'bg-amber-500/20' : 'bg-red-500/20'}`}>
          <Trophy size={40} className={pct >= 80 ? 'text-emerald-400' : pct >= 50 ? 'text-amber-400' : 'text-red-400'} />
        </div>
        <h2 className="text-3xl font-bold text-white font-serif-literary">
          {pct >= 80 ? 'Excellent ! 🎉' : pct >= 50 ? 'Pas mal ! 👍' : 'À réviser 📚'}
        </h2>
        <div className="text-5xl font-bold text-white">{state.score}<span className="text-slate-500 text-3xl">/{state.total}</span></div>
        <div className="w-full max-w-xs mx-auto h-3 bg-slate-800 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-1000 ${pct >= 80 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${pct}%` }} />
        </div>
        <div className="flex gap-3 justify-center">
          <button onClick={restartQuiz} className="inline-flex items-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-all">
            <RotateCcw size={16} /> Recommencer
          </button>
          <button onClick={onComplete} className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold transition-all shadow-lg shadow-indigo-500/20">
            Célébrer ! 🎊
          </button>
        </div>
      </div>
    );
  }

  // Playing phase
  const getBtnClass = (p: string) => {
    if (!current) return 'border-white/20 bg-slate-800 text-white';
    const isSelected = state.selectedProcede === p;
    const isCorrectProc = current.procede.toLowerCase() === p.toLowerCase();

    // Before answering: all options look identical
    if (!state.userAnswered) {
      return 'border-white/20 bg-slate-800 text-white hover:border-white/40 hover:bg-slate-700';
    }

    // After answering: correct = bright green, wrong selected = red, others = dark
    if (isCorrectProc) return 'border-emerald-400 bg-emerald-600/50 text-white font-bold shadow-sm shadow-emerald-500/30';
    if (isSelected) return 'border-red-500 bg-red-600/50 text-white';
    return 'border-white/10 bg-slate-800/50 text-slate-500';
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Progress bar */}
      <div className="flex items-center gap-4">
        <div className="wood-progress-track flex-1 h-2 rounded-full overflow-hidden">
          <div className="wood-progress-fill h-full rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
        <span className="text-sm text-slate-500 shrink-0">{state.currentIdx + 1}/{state.total}</span>
        <div className="flex items-center gap-1 text-sm text-amber-400 shrink-0">
          <Trophy size={14} /><span>{state.score}</span>
        </div>
      </div>

      {/* Current movement label */}
      {current && (() => {
        const movement = etude.movements.find(m => m.citations.some(c => c.id === current.id));
        return movement ? (
          <div className="text-xs text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 rounded-lg px-3 py-1.5 inline-flex items-center gap-1.5">
            <Microscope size={12} />{movement.title}
          </div>
        ) : null;
      })()}

      {/* Poem with highlights */}
      {etude.textLines.length === 0 ? (
        <div className="wood-panel rounded-lg p-8 text-center">
          <BookOpen size={32} className="text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">Aucun texte de poème saisi.</p>
          <p className="text-slate-600 text-xs mt-1">Ajoutez le poème dans « Importer » pour voir les mots en surbrillance ici.</p>
        </div>
      ) : (
        <div className="wood-panel paper-sheet rounded-lg overflow-hidden">
          <div className="px-5 py-3 border-b border-white/5 flex items-center gap-2">
            <BookOpen size={14} className="text-amber-400" />
            <span className="text-sm font-medium text-white">{etude.title}</span>
            <span className="ml-2 text-xs px-2 py-0.5 rounded-lg bg-slate-800 text-slate-400">
              {matchingHighlights.length > 0 ? 'Repérez les mots en surbrillance' : (current?.verses.length > 0 ? 'Vers ' + current.verses.join(', ') : 'Aucune correspondance')}
            </span>
          </div>
          <div className="px-5 py-4">
            {etude.textLines.map((line, lineIdx) => {
              const words = buildWordRanges(line, lineIdx);
              return (
                <div key={lineIdx} className="flex gap-4 py-1 text-base leading-relaxed font-serif-literary">
                  <span className="text-slate-600 select-none w-6 shrink-0 text-right text-sm">{lineIdx + 1}</span>
                  <span className="flex-1">
                    {words.map((w, i) =>
                      w.highlight ? (
                        <mark key={i} className="px-1.5 py-0.5 rounded bg-amber-500/30 border border-amber-400/50 text-amber-100">{w.text}</mark>
                      ) : (
                        <span key={i}>{w.text}</span>
                      )
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Question card */}
      <div className={`wood-panel rounded-lg border transition-all duration-300 ${state.userAnswered ? (state.isCorrect ? CORRECT_BG : WRONG_BG) : ''}`}>
        <div className="p-5 space-y-4">
          {/* Citation */}
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0 mt-0.5">
              <QuoteInline size={16} />
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-slate-500 mb-1 font-semibold">Citation</div>
              <div className="text-slate-200 leading-snug">{current?.citation}</div>
            </div>
          </div>

          <div className="border-t border-white/5" />

          {/* Question */}
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0 mt-0.5">
              <HelpCircle size={16} className="text-indigo-400" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-slate-500 mb-1 font-semibold">Question</div>
              <div className="text-slate-200 font-medium">Quel est le <strong>procédé littéraire</strong> utilisé ?</div>
            </div>
          </div>

          {/* Answer options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
            {answerOptions.map((p, i) => {
              const isSelected = state.selectedProcede === p;
              const isCorrectProc = current ? current.procede.toLowerCase() === p.toLowerCase() : false;
              return (
                <button
                  key={`${p}-${i}`}
                  onClick={() => selectProcede(p)}
                  disabled={state.userAnswered}
                  className={`text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-200 ${getBtnClass(p)}`}
                >
                  <span className="flex items-center gap-2">
                    {state.userAnswered && isCorrectProc && <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />}
                    {state.userAnswered && isSelected && !isCorrectProc && <XCircle size={14} className="text-red-400 shrink-0" />}
                    {p}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Feedback */}
          {state.userAnswered && (
            <div className={`mt-2 p-4 rounded-xl border ${state.isCorrect ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
              <div className="flex items-center gap-2 mb-2">
                {state.isCorrect
                  ? <><CheckCircle2 size={18} className="text-emerald-400" /><span className="font-semibold text-emerald-300">Bonne réponse !</span></>
                  : <><XCircle size={18} className="text-red-400" /><span className="font-semibold text-red-300">Raté</span></>
                }
              </div>
              <div className="text-sm text-slate-300 leading-relaxed">
                <strong className="text-slate-100">Interprétation :</strong><br />{current?.interpretation}
              </div>
              {!state.isCorrect && (
                <div className="mt-2 text-sm text-red-300/80">
                  La bonne réponse était : <strong>{current?.procede}</strong>
                </div>
              )}
            </div>
          )}

          {/* Next button */}
          {state.userAnswered && (
            <button
              onClick={nextQuestion}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
            >
              {state.currentIdx + 1 >= state.total ? 'Voir les résultats' : 'Question suivante'}
              <ChevronRight size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}