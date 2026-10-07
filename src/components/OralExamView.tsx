import { useState, useEffect, useRef, useMemo } from 'react';
import { EtudeLineaire, CitationItem } from '../types/etude';
import {
  Mic, Play, Pause, RotateCcw, ChevronRight, ChevronLeft,
  Eye, EyeOff, BookOpen, Layers, CheckCircle2, Trophy, Clock,
  Sparkles, Target, Award, GraduationCap, HelpCircle, FileText
} from 'lucide-react';
import { findCitationRangesInPoem, getCitationQuotes } from '../utils/citationUtils';
import { EAF_GRAMMAR_TOPICS, EafGrammarTopic } from '../utils/grammarData';

interface OralExamViewProps {
  etude: EtudeLineaire;
  onComplete?: () => void;
}

type OralStage = 'intro' | 'reading' | 'presentation' | 'explication' | 'conclusion' | 'grammar' | 'completed';

export default function OralExamView({ etude, onComplete }: OralExamViewProps) {
  const [stage, setStage] = useState<OralStage>('intro');
  const [secondsLeft, setSecondsLeft] = useState(12 * 60); // 12 minutes total
  const [isActive, setIsActive] = useState(false);
  const [currentMovementIdx, setCurrentMovementIdx] = useState(0);
  const [currentCitationIdx, setCurrentCitationIdx] = useState(0);
  const [hideInterpretations, setHideInterpretations] = useState(true);
  const [revealedCitations, setRevealedCitations] = useState<Set<string>>(new Set());
  const [rating, setRating] = useState<number | null>(null);

  // EAF Grammar stage state
  const [selectedGrammarTopicId, setSelectedGrammarTopicId] = useState<string>('negation');
  const [showGrammarAnswer, setShowGrammarAnswer] = useState<boolean>(false);

  const activeGrammarTopic = useMemo(() => {
    return EAF_GRAMMAR_TOPICS.find(t => t.id === selectedGrammarTopicId) || EAF_GRAMMAR_TOPICS[0];
  }, [selectedGrammarTopicId]);

  const totalCitations = useMemo(() => {
    return etude.movements.reduce((acc, m) => acc + m.citations.length, 0);
  }, [etude.movements]);

  // Flattened list of citations with movement titles for easy navigation
  const allCitations = useMemo(() => {
    const list: { citation: CitationItem; movementTitle: string; movementIdx: number; citationIdx: number }[] = [];
    etude.movements.forEach((m, mIdx) => {
      m.citations.forEach((c, cIdx) => {
        list.push({ citation: c, movementTitle: m.title, movementIdx: mIdx, citationIdx: cIdx });
      });
    });
    return list;
  }, [etude.movements]);

  const activeFlatIdx = useMemo(() => {
    let count = 0;
    for (let i = 0; i < currentMovementIdx; i++) {
      count += etude.movements[i]?.citations.length || 0;
    }
    return count + currentCitationIdx;
  }, [currentMovementIdx, currentCitationIdx, etude.movements]);

  // Timer effect
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isActive && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft(prev => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0 && isActive) {
      setIsActive(false);
      setStage('completed');
      if (onComplete) onComplete();
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, secondsLeft, onComplete]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setSecondsLeft(12 * 60);
    setStage('intro');
    setCurrentMovementIdx(0);
    setCurrentCitationIdx(0);
    setRevealedCitations(new Set());
    setRating(null);
  };

  const startOralExam = () => {
    setStage('reading');
    setIsActive(true);
  };

  const formatTime = (totalSec: number) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const toggleReveal = (citationId: string) => {
    setRevealedCitations(prev => {
      const next = new Set(prev);
      if (next.has(citationId)) next.delete(citationId);
      else next.add(citationId);
      return next;
    });
  };

  const currentCitationItem = etude.movements[currentMovementIdx]?.citations[currentCitationIdx];

  // Highlights for poem text
  const currentHighlights = useMemo(() => {
    if (!currentCitationItem || stage !== 'explication') return [];
    const highlights: { lineIndex: number; start: number; end: number }[] = [];
    for (const quote of getCitationQuotes(currentCitationItem)) {
      const ranges = findCitationRangesInPoem(etude.textLines, quote, currentCitationItem.verses, currentCitationItem.procede);
      highlights.push(...ranges);
    }
    return highlights;
  }, [currentCitationItem, stage, etude.textLines]);

  const highlightedLinesSet = useMemo(() => {
    return new Set(currentHighlights.map(h => h.lineIndex));
  }, [currentHighlights]);

  const nextStep = () => {
    if (stage === 'reading') {
      setStage('presentation');
    } else if (stage === 'presentation') {
      setStage('explication');
      setCurrentMovementIdx(0);
      setCurrentCitationIdx(0);
    } else if (stage === 'explication') {
      if (activeFlatIdx < allCitations.length - 1) {
        const nextFlat = allCitations[activeFlatIdx + 1];
        setCurrentMovementIdx(nextFlat.movementIdx);
        setCurrentCitationIdx(nextFlat.citationIdx);
      } else {
        setStage('conclusion');
      }
    } else if (stage === 'conclusion') {
      // Pick a random grammar question when entering grammar stage
      const randomTopic = EAF_GRAMMAR_TOPICS[Math.floor(Math.random() * EAF_GRAMMAR_TOPICS.length)];
      setSelectedGrammarTopicId(randomTopic.id);
      setShowGrammarAnswer(false);
      setStage('grammar');
    } else if (stage === 'grammar') {
      setStage('completed');
      setIsActive(false);
      if (onComplete) onComplete();
    }
  };

  const prevStep = () => {
    if (stage === 'grammar') {
      setStage('conclusion');
    } else if (stage === 'conclusion') {
      setStage('explication');
      const lastFlat = allCitations[allCitations.length - 1];
      if (lastFlat) {
        setCurrentMovementIdx(lastFlat.movementIdx);
        setCurrentCitationIdx(lastFlat.citationIdx);
      }
    } else if (stage === 'explication') {
      if (activeFlatIdx > 0) {
        const prevFlat = allCitations[activeFlatIdx - 1];
        setCurrentMovementIdx(prevFlat.movementIdx);
        setCurrentCitationIdx(prevFlat.citationIdx);
      } else {
        setStage('presentation');
      }
    } else if (stage === 'presentation') {
      setStage('reading');
    } else if (stage === 'reading') {
      setStage('intro');
      setIsActive(false);
    }
  };

  return (
    <div className="oral-exam-view max-w-6xl mx-auto space-y-6 rustic-workbench">
      {/* Top Banner & Timer Bar */}
      <div className="wood-panel paper-sheet rounded-xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 border border-amber-500/20">
        <div className="flex items-center gap-3">
          <div className="wood-icon w-11 h-11 rounded-xl flex items-center justify-center bg-amber-600/20 border border-amber-500/30">
            <Mic size={22} className="text-amber-400" />
          </div>
          <div>
            <h1 className="font-serif-literary text-xl font-bold text-white flex items-center gap-2">
              Oral de Français EAF
              <span className="text-xs bg-amber-500/20 text-amber-300 font-sans font-medium px-2 py-0.5 rounded-full border border-amber-500/30">
                12 minutes
              </span>
            </h1>
            <p className="text-xs text-slate-400">Simulation de l’explication linéaire orale du Bac</p>
          </div>
        </div>

        {/* Stopwatch timer */}
        <div className="flex items-center gap-3 bg-slate-900/80 px-4 py-2 rounded-xl border border-white/10 ml-auto">
          <Clock size={18} className={secondsLeft < 120 ? 'text-red-400 animate-pulse' : 'text-amber-400'} />
          <span className={`font-mono text-xl font-bold ${secondsLeft < 120 ? 'text-red-400' : 'text-white'}`}>
            {formatTime(secondsLeft)}
          </span>
          <button
            onClick={toggleTimer}
            className={`p-2 rounded-lg transition-all ${
              isActive
                ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30'
                : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
            }`}
            title={isActive ? 'Pause' : 'Démarrer'}
          >
            {isActive ? <Pause size={16} /> : <Play size={16} />}
          </button>
          <button
            onClick={resetTimer}
            className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
            title="Réinitialiser"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      {/* Progress Phases Bar */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 sm:gap-2 text-center text-xs font-medium">
        {[
          { id: 'reading', label: '1. Lecture', time: '~1 min 30' },
          { id: 'presentation', label: '2. Intro', time: '~1 min 30' },
          { id: 'explication', label: '3. Explication', time: '~6 min 30' },
          { id: 'conclusion', label: '4. Conclusion', time: '~1 min 00' },
          { id: 'grammar', label: '5. Grammaire', time: '2 pts' },
          { id: 'completed', label: '6. Bilan', time: 'Fin' },
        ].map((p) => {
          const stageOrder = ['intro', 'reading', 'presentation', 'explication', 'conclusion', 'grammar', 'completed'];
          const isCurrent = stage === p.id;
          const isPast = stageOrder.indexOf(stage) > stageOrder.indexOf(p.id);

          return (
            <div
              key={p.id}
              className={`p-2 rounded-lg border transition-all ${
                isCurrent
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-200'
                  : isPast
                  ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-400'
                  : 'bg-slate-900/40 border-white/5 text-slate-500'
              }`}
            >
              <div className="truncate font-semibold">{p.label}</div>
              <div className="text-[10px] opacity-75">{p.time}</div>
            </div>
          );
        })}
      </div>

      {/* Stage Content */}
      {stage === 'intro' && (
        <div className="wood-panel paper-sheet rounded-xl p-6 sm:p-8 text-center space-y-6 max-w-2xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto">
            <Mic size={32} className="text-amber-400" />
          </div>
          <div>
            <h2 className="text-2xl font-serif-literary font-bold text-white mb-2">
              Prêt pour votre oral de Français ?
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed max-w-md mx-auto">
              Simulez la première partie de l’épreuve orale (12 minutes) : lecture expressive, introduction, explication linéaire mouvement par mouvement, et conclusion.
            </p>
          </div>

          <div className="bg-slate-900/60 p-4 rounded-xl border border-white/5 text-left text-xs text-slate-400 space-y-2 max-w-md mx-auto">
            <div className="font-semibold text-slate-200 flex items-center gap-1.5">
              <Sparkles size={14} className="text-amber-400" /> Recommandations pour l’oral :
            </div>
            <ul className="list-disc list-inside space-y-1">
              <li>Parlez distinctement à un rythme régulier (environ 120 mots/min).</li>
              <li>Utilisez le mode masqué pour tester votre mémoire sur les interprétations.</li>
              <li>Annoncez clairement chaque mouvement et chaque procédé.</li>
            </ul>
          </div>

          <button
            onClick={startOralExam}
            className="copper-action px-8 py-3.5 rounded-xl font-semibold text-white hover:scale-105 transition-all shadow-lg flex items-center justify-center gap-2 mx-auto"
          >
            <Play size={18} />
            Démarrer le chrono & l’oral
          </button>
        </div>
      )}

      {stage === 'reading' && (
        <div className="wood-panel paper-sheet rounded-xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div>
              <span className="text-xs text-amber-400 font-semibold uppercase tracking-wider">Étape 1 / 4</span>
              <h2 className="text-xl font-serif-literary font-bold text-white">Lecture à haute voix (1 min 30)</h2>
            </div>
            <button
              onClick={nextStep}
              className="copper-action px-4 py-2 rounded-lg text-sm font-medium text-white flex items-center gap-1.5 hover:scale-105 transition-all"
            >
              Étape suivante <ChevronRight size={16} />
            </button>
          </div>

          <p className="text-xs text-slate-400">
            Lisez le texte de manière expressive en respectant la ponctuation, le rythme et les coupes poétiques.
          </p>

          <div className="bg-slate-950/60 p-6 rounded-xl border border-white/5 space-y-2 max-h-[50dvh] overflow-y-auto font-serif-literary text-lg leading-relaxed">
            {etude.textLines.map((line, idx) => (
              <div key={idx} className="flex items-start gap-4">
                <span className="text-xs text-slate-600 font-sans w-6 text-right select-none pt-1">{idx + 1}</span>
                <span className="text-slate-200">{line}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {stage === 'presentation' && (
        <div className="wood-panel paper-sheet rounded-xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div>
              <span className="text-xs text-amber-400 font-semibold uppercase tracking-wider">Étape 2 / 4</span>
              <h2 className="text-xl font-serif-literary font-bold text-white">Introduction & Problématique (1 min 30)</h2>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={prevStep} className="px-3 py-2 rounded-lg text-xs bg-slate-800 text-slate-300 hover:bg-slate-700">Retour</button>
              <button onClick={nextStep} className="copper-action px-4 py-2 rounded-lg text-sm font-medium text-white flex items-center gap-1.5 hover:scale-105 transition-all">
                Lancer l’explication <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-900/60 p-5 rounded-xl border border-white/5 space-y-4">
              <h3 className="text-sm font-semibold text-amber-300 flex items-center gap-2">
                <BookOpen size={16} /> Présentation du texte & Auteur
              </h3>
              <div className="space-y-2 text-sm text-slate-300">
                <div><strong>Titre :</strong> {etude.title}</div>
                {etude.author && <div><strong>Auteur :</strong> {etude.author}</div>}
              </div>

              {etude.problematic && (
                <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/20 text-xs text-amber-200">
                  <div className="font-semibold mb-1">Problématique :</div>
                  {etude.problematic}
                </div>
              )}
            </div>

            <div className="bg-slate-900/60 p-5 rounded-xl border border-white/5 space-y-4">
              <h3 className="text-sm font-semibold text-amber-300 flex items-center gap-2">
                <Layers size={16} /> Découpage en Mouvements ({etude.movements.length})
              </h3>
              <div className="space-y-2">
                {etude.movements.map((m, idx) => (
                  <div key={m.id} className="p-2.5 rounded-lg bg-slate-800/60 border border-white/5 text-xs flex items-center gap-2 text-slate-200">
                    <span className="w-5 h-5 rounded bg-indigo-600 text-white font-bold flex items-center justify-center text-[10px]">
                      {idx + 1}
                    </span>
                    <span className="font-medium flex-1">{m.title}</span>
                    <span className="text-slate-500">{m.citations.length} citations</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {stage === 'explication' && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left: Poem text with active citation line highlight */}
          <div className="lg:col-span-3 wood-panel paper-sheet rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <span className="text-xs font-semibold text-slate-400">Texte du poème</span>
              <span className="text-xs text-amber-400">
                Citation {activeFlatIdx + 1} / {allCitations.length}
              </span>
            </div>

            <div className="space-y-1.5 max-h-[calc(100dvh-16rem)] overflow-y-auto pr-2 font-serif-literary text-base leading-relaxed">
              {etude.textLines.map((line, lineIdx) => {
                const isHighlighted = highlightedLinesSet.has(lineIdx);
                return (
                  <div
                    key={lineIdx}
                    className={`flex items-start gap-3 py-1 px-2 rounded-lg transition-all ${
                      isHighlighted ? 'bg-indigo-950/60 border-l-4 border-indigo-400 text-white' : 'text-slate-300'
                    }`}
                  >
                    <span className={`text-xs w-6 text-right font-sans shrink-0 pt-0.5 ${isHighlighted ? 'text-indigo-400 font-bold' : 'text-slate-600'}`}>
                      {lineIdx + 1}
                    </span>
                    <span className="flex-1">{line}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Active Citation Card & Oral Practice Controls */}
          <div className="lg:col-span-2 wood-panel paper-sheet rounded-xl p-5 flex flex-col justify-between space-y-5">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <span className="text-xs text-amber-400 font-semibold">
                  Mouvement {currentMovementIdx + 1} : {etude.movements[currentMovementIdx]?.title}
                </span>
                <button
                  onClick={() => setHideInterpretations(!hideInterpretations)}
                  className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors"
                >
                  {hideInterpretations ? <EyeOff size={14} /> : <Eye size={14} />}
                  <span>{hideInterpretations ? 'Mode Masqué' : 'Visible'}</span>
                </button>
              </div>

              {currentCitationItem && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-slate-900/80 border border-indigo-500/30 space-y-2">
                    <div className="text-xs font-medium text-slate-400 flex items-center justify-between">
                      <span>Citation :</span>
                      {currentCitationItem.verses?.length > 0 && (
                        <span className="text-indigo-400 font-sans">
                          Vers {currentCitationItem.verses.join(', ')}
                        </span>
                      )}
                    </div>
                    <blockquote className="text-base font-serif-literary font-medium text-white italic border-l-2 border-indigo-400 pl-3">
                      {currentCitationItem.citation}
                    </blockquote>
                    <div className="text-xs font-semibold text-amber-300 pt-1">
                      Procédé : {currentCitationItem.procede}
                    </div>
                  </div>

                  {/* Interpretation Box with Blur / Reveal option */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-400">Interprétation littéraire :</span>
                      {hideInterpretations && (
                        <button
                          onClick={() => toggleReveal(currentCitationItem.id)}
                          className="text-xs text-indigo-400 hover:underline flex items-center gap-1"
                        >
                          {revealedCitations.has(currentCitationItem.id) ? 'Masquer' : 'Révéler la réponse'}
                        </button>
                      )}
                    </div>

                    <div
                      className={`p-4 rounded-xl border text-sm leading-relaxed transition-all ${
                        hideInterpretations && !revealedCitations.has(currentCitationItem.id)
                          ? 'bg-slate-900/40 border-white/5 text-slate-600 blur-sm select-none cursor-pointer'
                          : 'bg-slate-900/90 border-white/10 text-slate-200'
                      }`}
                      onClick={() => {
                        if (hideInterpretations) toggleReveal(currentCitationItem.id);
                      }}
                    >
                      {currentCitationItem.interpretation}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation buttons */}
            <div className="pt-4 border-t border-white/5 flex items-center justify-between gap-3">
              <button
                onClick={prevStep}
                className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 text-xs font-semibold flex items-center gap-1 transition-all"
              >
                <ChevronLeft size={16} /> Précédent
              </button>
              <button
                onClick={nextStep}
                className="copper-action px-5 py-2.5 rounded-xl text-xs font-bold text-white flex items-center gap-1 hover:scale-105 transition-all shadow-md"
              >
                Suivant <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {stage === 'conclusion' && (
        <div className="wood-panel paper-sheet rounded-xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div>
              <span className="text-xs text-amber-400 font-semibold uppercase tracking-wider">Étape 4 / 5</span>
              <h2 className="text-xl font-serif-literary font-bold text-white">Conclusion & Ouverture (1 min 00)</h2>
            </div>
            <button
              onClick={nextStep}
              className="copper-action px-5 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center gap-1.5 hover:scale-105 transition-all"
            >
              Question de Grammaire (2 pts) <ChevronRight size={16} />
            </button>
          </div>

          <div className="bg-slate-900/60 p-6 rounded-xl border border-white/5 space-y-4 max-w-2xl mx-auto">
            <h3 className="text-sm font-semibold text-amber-300 flex items-center gap-2">
              <Target size={16} /> Synthèse pour la conclusion
            </h3>
            <ul className="list-disc list-inside space-y-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
              <li>Résumez brièvement comment votre explication a répondu à la problématique.</li>
              <li>Rappelez l’intérêt principal du texte (l’enjeu poétique, dramatique ou argumentatif).</li>
              <li>Proposez une <strong>ouverture</strong> (autre texte du parcours, résonance artistique ou culturelle).</li>
            </ul>
          </div>
        </div>
      )}

      {stage === 'grammar' && (
        <div className="wood-panel paper-sheet rounded-xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/5 pb-4 gap-3">
            <div>
              <span className="text-xs text-amber-400 font-semibold uppercase tracking-wider">Étape 5 / 5</span>
              <h2 className="text-xl font-serif-literary font-bold text-white flex items-center gap-2">
                Question de Grammaire EAF (2 points sur 20)
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={prevStep} className="px-3 py-2 rounded-lg text-xs bg-slate-800 text-slate-300 hover:bg-slate-700">Retour</button>
              <button
                onClick={nextStep}
                className="copper-action px-5 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center gap-1.5 hover:scale-105 transition-all"
              >
                Terminer l’oral <CheckCircle2 size={16} />
              </button>
            </div>
          </div>

          {/* Theme selector pills for oral question */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Choisissez ou tirez au sort une des 7 questions officielles :</span>
              <button
                onClick={() => {
                  const randomTopic = EAF_GRAMMAR_TOPICS[Math.floor(Math.random() * EAF_GRAMMAR_TOPICS.length)];
                  setSelectedGrammarTopicId(randomTopic.id);
                  setShowGrammarAnswer(false);
                }}
                className="text-amber-400 hover:underline font-bold flex items-center gap-1"
              >
                <Sparkles size={13} /> Tirer au sort
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {EAF_GRAMMAR_TOPICS.map(t => (
                <button
                  key={t.id}
                  onClick={() => {
                    setSelectedGrammarTopicId(t.id);
                    setShowGrammarAnswer(false);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    selectedGrammarTopicId === t.id
                      ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                      : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border border-white/5'
                  }`}
                >
                  {t.shortName}
                </button>
              ))}
            </div>
          </div>

          {/* Active EAF Grammar Question Card */}
          <div className="bg-slate-900/80 rounded-2xl p-6 border border-amber-500/30 space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <GraduationCap size={18} className="text-amber-400" />
                <h3 className="font-bold text-white text-base font-serif-literary">
                  {activeGrammarTopic.title}
                </h3>
              </div>
              <span className="text-xs bg-amber-500/20 text-amber-300 font-bold px-2.5 py-1 rounded-full border border-amber-500/30">
                2 points
              </span>
            </div>

            {/* First Example Question */}
            {activeGrammarTopic.examples.length > 0 && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-950/80 border border-white/10 space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Consigne de l’examinateur :</span>
                  <p className="text-base text-white font-serif-literary font-medium">
                    « {activeGrammarTopic.examples[0].question} »
                  </p>
                  <p className="text-xs text-slate-400 italic">
                    Phrase support : « {activeGrammarTopic.examples[0].sentence} »
                  </p>
                </div>

                {/* Response Method Steps */}
                <div className="bg-slate-950/60 p-4 rounded-xl border border-white/5 space-y-2">
                  <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <FileText size={14} /> Structure de votre réponse orale (2-3 min) :
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                    {activeGrammarTopic.methodSteps.map((step, idx) => (
                      <div key={idx} className="p-2 bg-slate-900/60 rounded-lg border border-white/5">
                        {step}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Reveal Model Answer Button & Answer Box */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-medium">Corrigé type & Barème :</span>
                    <button
                      onClick={() => setShowGrammarAnswer(!showGrammarAnswer)}
                      className="flex items-center gap-1.5 text-xs text-amber-300 hover:text-white font-bold bg-amber-500/20 hover:bg-amber-500/30 px-3 py-1.5 rounded-lg border border-amber-500/30 transition-all"
                    >
                      {showGrammarAnswer ? <EyeOff size={14} /> : <Eye size={14} />}
                      <span>{showGrammarAnswer ? 'Masquer la réponse' : 'Révéler la réponse rédigée (2 pts)'}</span>
                    </button>
                  </div>

                  {showGrammarAnswer && (
                    <div className="p-4 rounded-xl bg-indigo-950/60 border border-indigo-500/30 space-y-2 text-xs text-slate-200 leading-relaxed animate-in fade-in duration-300">
                      <div className="font-bold text-amber-300">Modèle de réponse attendu à l’oral :</div>
                      <p>{activeGrammarTopic.examples[0].answer}</p>
                      <div className="text-amber-400 font-medium pt-1 border-t border-white/10">
                        {activeGrammarTopic.examples[0].bareme}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {stage === 'completed' && (
        <div className="wood-panel paper-sheet rounded-xl p-8 text-center space-y-6 max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400">
            <Trophy size={36} />
          </div>
          <div>
            <h2 className="text-2xl font-serif-literary font-bold text-white mb-1">
              Simulation d’oral terminée !
            </h2>
            <p className="text-xs text-slate-400">
              Temps écoulé : {formatTime(12 * 60 - secondsLeft)} sur 12:00
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <p className="text-xs font-semibold text-slate-300">Évaluez votre prestation :</p>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className={`w-10 h-10 rounded-xl font-bold text-sm transition-all ${
                    rating === star
                      ? 'bg-amber-500 text-slate-950 scale-110 shadow-lg'
                      : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  {star}★
                </button>
              ))}
            </div>
            {rating && (
              <p className="text-xs text-amber-300 font-medium">
                {rating >= 4 ? 'Bravo ! Prestation fluide et structurée.' : 'Entraînement enregistré. Recommencez pour gagner en aisance.'}
              </p>
            )}
          </div>

          <div className="flex items-center justify-center gap-3 pt-4">
            <button
              onClick={resetTimer}
              className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 text-xs font-semibold"
            >
              Recommencer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
