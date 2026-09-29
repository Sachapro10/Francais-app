import { useState, useCallback, useMemo } from 'react';
import { EtudeLineaire, CitationItem } from '../types/etude';
import {
  Target, Trophy, CheckCircle2, XCircle, HelpCircle,
  RotateCcw, ChevronRight, BookOpen, Microscope, Tag
} from 'lucide-react';
import { ALL_PROCEDES } from '../utils/procedeDetector';

interface QuizViewProps {
  etude: EtudeLineaire;
  onComplete: () => void;
}

type QuizStep = 'intro' | 'playing' | 'done';
type QuizMode = 'identify' | 'locate';

interface QuizState {
  phase: QuizStep;
  currentIdx: number;
  score: number;
  total: number;
  selectedProcede: string;
  isCorrect: boolean | null;
  userAnswered: boolean;
  mode: QuizMode;
  selectedText: string;
  selectionValidated: boolean;
  selectionError: string;
  matchedCitation: CitationItem | null;
}

const CORRECT_BG = 'bg-emerald-500/15 border-emerald-400/40';
const WRONG_BG = 'bg-red-500/15 border-red-400/40';

function QuoteInline({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className="text-amber-400">
      <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z" />
    </svg>
  );
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export default function QuizView({ etude, onComplete }: QuizViewProps) {
  const allCitations = useMemo(
    () => etude.movements.flatMap(movement => movement.citations),
    [etude.movements]
  );

  const shuffled = useMemo(() => {
    const citations = [...allCitations];
    for (let i = citations.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [citations[i], citations[j]] = [citations[j], citations[i]];
    }
    return citations;
  }, [allCitations]);

  const allProcedes = useMemo(
    () => [...ALL_PROCEDES].sort((a, b) => a.localeCompare(b, 'fr')),
    []
  );

  const [state, setState] = useState<QuizState>({
    phase: 'intro',
    currentIdx: 0,
    score: 0,
    total: shuffled.length,
    selectedProcede: '',
    isCorrect: null,
    userAnswered: false,
    mode: 'identify',
    selectedText: '',
    selectionValidated: false,
    selectionError: '',
    matchedCitation: null,
  });

  const current = shuffled[state.currentIdx];
  const progress = state.total > 0 ? (state.currentIdx / state.total) * 100 : 0;

  const resetQuestion = useCallback((index = 0) => {
    setState(previous => ({
      ...previous,
      currentIdx: index,
      selectedProcede: '',
      isCorrect: null,
      userAnswered: false,
      selectedText: '',
      selectionValidated: false,
      selectionError: '',
      matchedCitation: null,
    }));
  }, []);

  const chooseCitation = useCallback((index: number) => {
    if (state.mode !== 'identify' || state.userAnswered) return;
    resetQuestion(index);
  }, [resetQuestion, state.mode, state.userAnswered]);

  const startQuiz = useCallback((mode: QuizMode) => {
    setState(previous => ({
      ...previous,
      phase: 'playing',
      mode,
      currentIdx: 0,
      selectedProcede: '',
      isCorrect: null,
      userAnswered: false,
      selectedText: '',
      selectionValidated: false,
      selectionError: '',
      matchedCitation: null,
    }));
  }, []);

  const validateLocateAnswer = useCallback((selectedText: string, procede: string) => {
    const selected = normalize(selectedText);
    if (!selected) return null;

    return allCitations.find(citation => {
      const quoteMatches = citation.quotes
        .map(normalize)
        .filter(Boolean)
        .some(quote => selected === quote || selected.includes(quote) || quote.includes(selected));
      const procedeMatches = normalize(citation.procede) === normalize(procede);
      return quoteMatches && procedeMatches;
    }) ?? null;
  }, [allCitations]);

  const validateTextSelection = useCallback(() => {
    if (state.mode !== 'locate' || state.userAnswered || state.selectionValidated) return;
    const selectedText = window.getSelection()?.toString().trim() ?? '';
    if (!selectedText) return;

    const selected = normalize(selectedText);
    const citationMatch = allCitations.some(citation => citation.quotes
      .map(normalize)
      .filter(Boolean)
      .some(quote => selected === quote));

    if (!citationMatch) {
      setState(previous => ({
        ...previous,
        selectedText,
        selectionError: 'Cette sélection ne correspond pas à une citation enregistrée. Sélectionnez le texte exact d’une citation.',
      }));
      return;
    }

    setState(previous => ({
      ...previous,
      selectedText,
      selectionValidated: true,
      selectionError: '',
      selectedProcede: '',
    }));
    window.getSelection()?.removeAllRanges();
  }, [state.mode, state.userAnswered, state.selectionValidated, allCitations]);

  const submitLocate = useCallback((procede: string) => {
    if (state.mode !== 'locate' || state.userAnswered || !state.selectionValidated || !state.selectedText) return;

    const matchedCitation = validateLocateAnswer(state.selectedText, procede);
    setState(previous => ({
      ...previous,
      selectedProcede: procede,
      matchedCitation,
      isCorrect: matchedCitation !== null,
      userAnswered: true,
      score: matchedCitation ? previous.score + 1 : previous.score,
    }));
  }, [state.mode, state.userAnswered, state.selectionValidated, state.selectedText, validateLocateAnswer]);

  const submitIdentify = useCallback((procede: string) => {
    if (!current || state.mode !== 'identify' || state.userAnswered) return;
    const correct = normalize(current.procede) === normalize(procede);
    setState(previous => ({
      ...previous,
      selectedProcede: procede,
      isCorrect: correct,
      userAnswered: true,
      score: correct ? previous.score + 1 : previous.score,
    }));
  }, [current, state.mode, state.userAnswered]);

  const nextQuestion = useCallback(() => {
    setState(previous => {
      const nextIndex = previous.currentIdx + 1;
      if (nextIndex >= previous.total) return { ...previous, phase: 'done' };
      return {
        ...previous,
        currentIdx: nextIndex,
        selectedProcede: '',
        isCorrect: null,
        userAnswered: false,
        selectedText: '',
        selectionValidated: false,
        selectionError: '',
        matchedCitation: null,
      };
    });
  }, []);

  const restartQuiz = useCallback(() => {
    setState({
      phase: 'intro',
      currentIdx: 0,
      score: 0,
      total: shuffled.length,
      selectedProcede: '',
      isCorrect: null,
      userAnswered: false,
      mode: 'identify',
      selectedText: '',
      selectionValidated: false,
      selectionError: '',
      matchedCitation: null,
    });
  }, [shuffled.length]);

  if (state.phase === 'intro') {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="max-w-lg mx-auto text-center py-10 space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-500/20 to-red-500/20 border border-amber-500/20 flex items-center justify-center mx-auto">
            <Target size={36} className="text-amber-400" />
          </div>
          <h2 className="text-3xl font-bold text-white font-serif-literary">Mode Quiz</h2>
          <p className="text-slate-400 leading-relaxed">
            Choisissez l'un des deux modes d'entraînement.
          </p>
          <div className="inline-flex items-center gap-3 bg-slate-800/60 rounded-2xl px-5 py-3">
            <Trophy size={18} className="text-amber-400" />
            <span className="text-sm text-slate-300">{shuffled.length} questions</span>
            <span className="text-slate-600">·</span>
            <span className="text-sm text-slate-400">Score final à la fin</span>
          </div>
          <div className="grid sm:grid-cols-2 gap-3 text-left">
            <button
              onClick={() => startQuiz('identify')}
              disabled={shuffled.length === 0}
              className="wood-panel p-4 rounded-xl border text-left hover:border-amber-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center gap-2 mb-2">
                <Tag size={16} className="text-indigo-400" />
                <div className="font-semibold text-white text-sm">Identifier le procédé</div>
              </div>
              <div className="text-xs text-slate-500">Choisissez une citation, puis trouvez son procédé parmi toute la liste.</div>
            </button>
            <button
              onClick={() => startQuiz('locate')}
              disabled={etude.textLines.length === 0 || shuffled.length === 0}
              className="wood-panel p-4 rounded-xl border text-left hover:border-amber-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center gap-2 mb-2">
                <BookOpen size={16} className="text-emerald-400" />
                <div className="font-semibold text-white text-sm">Trouver dans le poème</div>
              </div>
              <div className="text-xs text-slate-500">Surlignez n'importe quelle citation dans le poème et choisissez son procédé.</div>
            </button>
          </div>
        </div>

        {etude.textLines.length > 0 && (
          <div className="wood-panel paper-sheet rounded-lg overflow-hidden">
            <div className="px-5 py-3 border-b border-white/5 flex items-center gap-2">
              <BookOpen size={14} className="text-amber-400" />
              <span className="text-sm font-medium text-white">{etude.title}</span>
            </div>
            <div className="px-5 py-4">
              {etude.textLines.map((line, index) => (
                <div key={index} className="flex gap-4 py-1 text-base leading-relaxed font-serif-literary text-slate-300">
                  <span className="text-slate-600 select-none w-6 shrink-0 text-right text-sm">{index + 1}</span>
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
      <div className="max-w-2xl mx-auto space-y-6 py-8">
        <div className="text-center space-y-4">
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
        </div>
        <div className="flex gap-3 justify-center pt-2">
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

  const getButtonClass = (procede: string) => {
    if (!state.userAnswered) return 'border-white/20 bg-slate-800 text-white hover:border-white/40 hover:bg-slate-700';
    const isCorrect = state.mode === 'identify'
      ? normalize(current?.procede ?? '') === normalize(procede)
      : state.matchedCitation !== null && normalize(state.matchedCitation.procede) === normalize(procede);
    if (isCorrect) return 'border-emerald-400 bg-emerald-600/50 text-white font-bold shadow-sm shadow-emerald-500/30';
    if (state.selectedProcede === procede) return 'border-red-500 bg-red-600/50 text-white';
    return 'border-white/10 bg-slate-800/50 text-slate-500';
  };

  const movement = current
    ? etude.movements.find(item => item.citations.some(citation => citation.id === current.id))
    : undefined;

  const renderPoemLine = (line: string) => {
    if (state.mode !== 'locate' || !state.selectionValidated || !state.selectedText) return line;
    const start = line.indexOf(state.selectedText);
    if (start < 0) return line;
    const end = start + state.selectedText.length;
    return (
      <>
        {line.slice(0, start)}
        <mark className="rounded bg-amber-300/70 px-1 text-[#34271f] ring-2 ring-amber-500/50">
          {line.slice(start, end)}
        </mark>
        {line.slice(end)}
      </>
    );
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <div className="wood-progress-track flex-1 h-2 rounded-full overflow-hidden">
          <div className="wood-progress-fill h-full rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
        <span className="text-sm text-slate-500 shrink-0">{state.currentIdx + 1}/{state.total}</span>
        <div className="flex items-center gap-1 text-sm text-amber-400 shrink-0"><Trophy size={14} /><span>{state.score}</span></div>
      </div>

      {state.mode === 'identify' ? (
        <div className="wood-panel paper-sheet rounded-lg p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold shrink-0">Choisir une citation</div>
            <select
              value={state.currentIdx}
              onChange={event => chooseCitation(Number(event.target.value))}
              disabled={state.userAnswered}
              className="paper-input w-full sm:flex-1 rounded-lg px-3 py-2 text-sm"
              aria-label="Choisir une citation à analyser"
            >
              {shuffled.map((citation, index) => {
                const citationMovement = etude.movements.find(item => item.citations.some(entry => entry.id === citation.id));
                return <option key={citation.id} value={index}>{citationMovement ? `${citationMovement.title} — ` : ''}{citation.citation}</option>;
              })}
            </select>
          </div>
          <p className="text-xs text-slate-500">Choisissez librement une citation, puis identifiez son procédé parmi toute la liste.</p>
        </div>
      ) : (
        <div className="wood-panel paper-sheet rounded-lg p-4 space-y-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-white"><BookOpen size={15} className="text-amber-400" /> Trouver une citation dans le poème</div>
          <p className="text-xs text-slate-500">Surlignez n'importe quelle citation dans le texte, choisissez son procédé, puis validez.</p>
        </div>
      )}

      {state.mode === 'identify' && movement && (
        <div className="text-xs text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 rounded-lg px-3 py-1.5 inline-flex items-center gap-1.5">
          <Microscope size={12} />{movement.title}
        </div>
      )}

      {state.mode === 'locate' && (
        <div className="wood-panel paper-sheet rounded-lg overflow-hidden">
          <div className="px-5 py-3 border-b border-white/5 flex items-center gap-2">
            <BookOpen size={14} className="text-amber-400" />
            <span className="text-sm font-medium text-white">{etude.title}</span>
            <span className="ml-auto text-xs text-slate-500">Texte sélectionnable</span>
          </div>
          <div className="px-5 py-4">
            {etude.textLines.map((line, index) => (
              <div key={index} className="flex gap-4 py-1 text-base leading-relaxed font-serif-literary select-text">
                <span className="text-slate-600 select-none w-6 shrink-0 text-right text-sm">{index + 1}</span>
                <span className="flex-1">{renderPoemLine(line)}</span>
              </div>
            ))}
            <div className="mt-4 border-t border-white/5 pt-4 flex flex-col sm:flex-row sm:items-center gap-3">
              <button
                onClick={validateTextSelection}
                disabled={state.selectionValidated}
                className="copper-action px-4 py-2 rounded-lg text-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {state.selectionValidated ? 'Texte validé' : 'Valider le texte sélectionné'}
              </button>
              <span className={`text-xs ${state.selectionError ? 'text-red-600' : 'text-slate-500'}`}>
                {state.selectionError || (state.selectionValidated ? 'Choisissez maintenant un procédé.' : 'Surlignez d’abord une citation, puis cliquez sur le bouton.')}
              </span>
            </div>
            {state.selectionValidated && (
              <div className="mt-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-700">
                Citation validée : « {state.selectedText} »
              </div>
            )}
          </div>
        </div>
      )}

      <div className={`wood-panel rounded-lg border transition-all duration-300 ${state.userAnswered ? (state.isCorrect ? CORRECT_BG : WRONG_BG) : ''}`}>
        <div className="p-5 space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0 mt-0.5"><QuoteInline size={16} /></div>
            <div>
              <div className="text-xs uppercase tracking-wider text-slate-500 mb-1 font-semibold">{state.mode === 'identify' ? 'Citation' : 'Votre sélection'}</div>
              <div className="text-slate-200 leading-snug">
                {state.mode === 'identify'
                  ? current?.citation
                  : state.selectedText
                    ? `« ${state.selectedText} »`
                    : 'Surlignez une citation dans le poème'}
              </div>
            </div>
          </div>

          <div className="border-t border-white/5" />
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0 mt-0.5"><HelpCircle size={16} className="text-indigo-400" /></div>
            <div>
              <div className="text-xs uppercase tracking-wider text-slate-500 mb-1 font-semibold">Question</div>
              <div className="text-slate-200 font-medium">Quel est le <strong>procédé littéraire</strong> utilisé ?</div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
            {allProcedes.map(procede => (
              <button
                key={procede}
                onClick={() => state.mode === 'identify' ? submitIdentify(procede) : submitLocate(procede)}
                disabled={state.userAnswered || (state.mode === 'locate' && !state.selectionValidated)}
                className={`text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-200 ${getButtonClass(procede)}`}
              >
                <span className="flex items-center gap-2">
                  {state.userAnswered && getButtonClass(procede).includes('emerald') && <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />}
                  {state.userAnswered && state.selectedProcede === procede && !getButtonClass(procede).includes('emerald') && <XCircle size={14} className="text-red-400 shrink-0" />}
                  {procede}
                </span>
              </button>
            ))}
          </div>

          {state.mode === 'locate' && !state.selectionValidated && !state.userAnswered && (
            <div className="text-xs text-slate-500">Les procédés seront cliquables après validation du texte sélectionné.</div>
          )}

          {state.mode === 'locate' && state.selectionValidated && !state.userAnswered && (
            <div className="text-xs text-slate-500">Cliquez sur un procédé pour obtenir immédiatement le résultat.</div>
          )}

          {state.userAnswered && (
            <div className={`mt-2 p-4 rounded-xl border ${state.isCorrect ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
              <div className="flex items-center gap-2 mb-2">
                {state.isCorrect
                  ? <><CheckCircle2 size={18} className="text-emerald-400" /><span className="font-semibold text-emerald-300">Bonne réponse !</span></>
                  : <><XCircle size={18} className="text-red-400" /><span className="font-semibold text-red-300">Raté</span></>}
              </div>
              {state.mode === 'locate' && state.matchedCitation && (
                <div className="text-sm text-slate-300 mb-2">Citation reconnue : « {state.matchedCitation.citation} »</div>
              )}
              <div className="text-sm text-slate-300 leading-relaxed">
                <strong className="text-slate-100">Interprétation :</strong><br />
                {state.mode === 'identify' ? current?.interpretation : state.matchedCitation?.interpretation ?? 'Aucune correspondance trouvée dans cette analyse.'}
              </div>
              {!state.isCorrect && (
                <div className="mt-2 text-sm text-red-300/80">
                  {state.mode === 'identify'
                    ? <>La bonne réponse était : <strong>{current?.procede}</strong></>
                    : 'La sélection et le procédé choisis ne correspondent à aucune citation de cette analyse.'}
                </div>
              )}
            </div>
          )}

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
