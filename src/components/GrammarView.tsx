import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import {
  BookOpen, ChevronLeft, ChevronRight, Eraser,
  Check, X, AlertCircle, Sparkles, MousePointer2,
  GraduationCap, HelpCircle, Layers, FileText, Eye, EyeOff
} from 'lucide-react';
import { GRAMMAR_SENTENCES, GrammarSentence, EAF_GRAMMAR_TOPICS } from '../utils/grammarData';

interface PropHighlight {
  propIndex: number;
  wordIndices: number[];
}

type VerificationStep = 'highlighting' | 'select-principale' | 'classifying' | 'complete';

const PROP_COLORS = [
  'bg-amber-400 text-amber-950 border-amber-500',
  'bg-blue-400 text-blue-950 border-blue-500',
  'bg-emerald-400 text-emerald-950 border-emerald-500',
  'bg-purple-400 text-purple-950 border-purple-500',
];

export default function GrammarView() {
  const [selectedTopicId, setSelectedTopicId] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [activePropIndex, setActivePropIndex] = useState(0);
  const [highlights, setHighlights] = useState<PropHighlight[]>([]);
  const [verificationStep, setVerificationStep] = useState<VerificationStep>('highlighting');
  const [verificationMessage, setVerificationMessage] = useState<string>('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [secondaryTypes, setSecondaryTypes] = useState<Record<number, string>>({});
  const [selectedPrincipaleIndex, setSelectedPrincipaleIndex] = useState<number | null>(null);
  const [showCorrige, setShowCorrige] = useState(false);
  const [revealedExamples, setRevealedExamples] = useState<Set<number>>(new Set());

  const isDraggingRef = useRef(false);
  const dragStartIdxRef = useRef<number | null>(null);

  // Active topic object if any
  const selectedTopic = useMemo(() => {
    return EAF_GRAMMAR_TOPICS.find(t => t.id === selectedTopicId) || null;
  }, [selectedTopicId]);

  // Filtered sentences based on selected topic
  const filteredSentences = useMemo(() => {
    if (selectedTopicId === 'all') return GRAMMAR_SENTENCES;
    const match = GRAMMAR_SENTENCES.filter(s => s.topicId === selectedTopicId);
    return match.length > 0 ? match : GRAMMAR_SENTENCES;
  }, [selectedTopicId]);

  const totalPages = filteredSentences.length;

  const currentSentence = useMemo(() => {
    const idx = Math.min(currentPage - 1, totalPages - 1);
    return filteredSentences[Math.max(0, idx)] || GRAMMAR_SENTENCES[0];
  }, [currentPage, filteredSentences, totalPages]);

  const words = useMemo(() => {
    return currentSentence.rawText.split(/\s+/).filter(w => w.length > 0);
  }, [currentSentence]);

  // Reset page when topic changes
  const handleSelectTopic = (topicId: string) => {
    setSelectedTopicId(topicId);
    setCurrentPage(1);
    setRevealedExamples(new Set());
  };

  // Reset state when changing pages
  useEffect(() => {
    setHighlights([]);
    setActivePropIndex(0);
    setVerificationStep('highlighting');
    setVerificationMessage('');
    setIsCorrect(null);
    setSecondaryTypes({});
    setSelectedPrincipaleIndex(null);
    setShowCorrige(false);
  }, [currentPage, selectedTopicId]);

  const toggleWord = useCallback((wordIdx: number) => {
    if (verificationStep !== 'highlighting') return;

    setHighlights(prev => {
      const existingProp = prev.find(h => h.propIndex === activePropIndex);

      // Remove word from any other proposition it might be in
      let next = prev.map(h => ({
        ...h,
        wordIndices: h.wordIndices.filter(idx => idx !== wordIdx)
      })).filter(h => h.wordIndices.length > 0);

      if (existingProp) {
        const isAlreadyInCurrent = existingProp.wordIndices.includes(wordIdx);
        return next.map(h => h.propIndex === activePropIndex
          ? {
              ...h,
              wordIndices: isAlreadyInCurrent
                ? h.wordIndices.filter(idx => idx !== wordIdx)
                : [...h.wordIndices, wordIdx].sort((a, b) => a - b)
            }
          : h
        ).filter(h => h.wordIndices.length > 0);
      } else {
        return [...next, { propIndex: activePropIndex, wordIndices: [wordIdx] }];
      }
    });
  }, [activePropIndex, verificationStep]);

  const handleMouseDown = (idx: number) => {
    if (verificationStep !== 'highlighting') return;
    isDraggingRef.current = true;
    dragStartIdxRef.current = idx;
    toggleWord(idx);
  };

  const handleMouseEnter = (idx: number) => {
    if (!isDraggingRef.current || verificationStep !== 'highlighting' || dragStartIdxRef.current === null) return;

    // Add all words between start and current
    const start = Math.min(dragStartIdxRef.current, idx);
    const end = Math.max(dragStartIdxRef.current, idx);

    setHighlights(prev => {
      const newRange = Array.from({ length: end - start + 1 }, (_, i) => start + i);

      // Remove these words from all other propositions
      let next = prev.map(h => ({
        ...h,
        wordIndices: h.wordIndices.filter(wIdx => !newRange.includes(wIdx))
      })).filter(h => h.wordIndices.length > 0);

      const existingProp = next.find(h => h.propIndex === activePropIndex);
      if (existingProp) {
        return next.map(h => h.propIndex === activePropIndex
          ? {
              ...h,
              wordIndices: Array.from(new Set([...h.wordIndices, ...newRange])).sort((a, b) => a - b)
            }
          : h
        );
      } else {
        return [...next, { propIndex: activePropIndex, wordIndices: newRange }];
      }
    });
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      isDraggingRef.current = false;
      dragStartIdxRef.current = null;
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  const getWordColor = (idx: number) => {
    const highlight = highlights.find(h => h.wordIndices.includes(idx));
    if (highlight) return PROP_COLORS[highlight.propIndex];
    return 'text-slate-300 hover:bg-white/5';
  };

  const verifyHighlights = () => {
    const expectedCount = currentSentence.propositions.length;
    const actualCount = highlights.length;

    if (actualCount === 0) {
      setIsCorrect(false);
      setVerificationMessage("Surlignez au moins une proposition.");
      return;
    }

    // Sort highlights by their first word index to match data order
    const sortedHighlights = [...highlights].sort((a, b) => a.wordIndices[0] - b.wordIndices[0]);

    if (actualCount !== expectedCount) {
      setIsCorrect(false);
      setVerificationMessage(`Incorrect. Il y a ${expectedCount} propositions dans cette phrase.`);
      return;
    }

    // Verification logic: check if word subsets match
    const allMatched = sortedHighlights.every((hl, i) => {
      const hlText = hl.wordIndices.map(idx => words[idx]).join(' ').toLowerCase().replace(/[.,;]/g, '');
      const expectedText = currentSentence.propositions[i].text.toLowerCase().replace(/[.,;]/g, '');
      return hlText.includes(expectedText) || expectedText.includes(hlText);
    });

    if (allMatched) {
      setIsCorrect(true);
      setVerificationMessage("Bravo ! Maintenant, identifiez la proposition principale.");
      setVerificationStep('select-principale');
    } else {
      setIsCorrect(false);
      setVerificationMessage("Le découpage n'est pas tout à fait correct. Réessayez.");
    }
  };

  const verifyPrincipale = () => {
    if (selectedPrincipaleIndex === null) {
      setIsCorrect(false);
      setVerificationMessage("Sélectionnez la proposition principale.");
      return;
    }

    // Find which proposition is the Principale in the expected data
    const sortedHighlights = [...highlights].sort((a, b) => a.wordIndices[0] - b.wordIndices[0]);
    const principaleIndex = sortedHighlights.findIndex((_, i) =>
      currentSentence.propositions[i].type === 'Principale'
    );

    if (principaleIndex === -1) {
      // No Principale in this sentence, move to classifying anyway
      setVerificationStep('classifying');
      setIsCorrect(true);
      setVerificationMessage("Parfait ! Maintenant classifiez les autres propositions.");
      return;
    }

    const expectedPrincipalePropIndex = sortedHighlights[principaleIndex].propIndex;

    if (selectedPrincipaleIndex === expectedPrincipalePropIndex) {
      setIsCorrect(true);
      setVerificationMessage("Parfait ! Maintenant classifiez les autres propositions.");
      setVerificationStep('classifying');
    } else {
      setIsCorrect(false);
      setVerificationMessage("Ce n'est pas la proposition principale. Réessayez.");
    }
  };

  const verifyClassification = () => {
    const sortedHighlights = [...highlights].sort((a, b) => a.wordIndices[0] - b.wordIndices[0]);
    let allCorrect = true;

    for (let i = 0; i < sortedHighlights.length; i++) {
      const propIndex = sortedHighlights[i].propIndex;
      const expectedType = currentSentence.propositions[i].type;

      // Skip the selected Principale
      if (propIndex === selectedPrincipaleIndex && expectedType === 'Principale') {
        continue;
      }

      const userType = secondaryTypes[propIndex];

      if (userType !== expectedType) {
        allCorrect = false;
        break;
      }
    }

    if (allCorrect) {
      setIsCorrect(true);
      setVerificationMessage("Parfait ! Toutes les propositions sont correctement identifiées.");
      setVerificationStep('complete');
    } else {
      setIsCorrect(false);
      setVerificationMessage("Certaines classifications sont incorrectes.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white font-serif-literary flex items-center gap-3">
            <Sparkles size={28} className="text-amber-400 animate-pulse" />
            Grammaire Bac EAF (2 points)
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Entraînement aux 7 questions officielles de grammaire pour l'oral du Bac de Français.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-slate-800/50 p-2 rounded-2xl border border-white/5">
          <div className="flex flex-col items-end px-2">
            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Progression</span>
            <span className="text-sm font-mono text-white">{currentPage} / {totalPages}</span>
          </div>
          <div className="w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 transition-all duration-1000 ease-out"
              style={{ width: `${(currentPage / totalPages) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* 7 Official EAF Topics Selector Bar */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
          <GraduationCap size={16} />
          Les 7 Thèmes Officiels EAF du Bac :
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleSelectTopic('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              selectedTopicId === 'all'
                ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-white/5'
            }`}
          >
            Tous les exercices
          </button>
          {EAF_GRAMMAR_TOPICS.map(topic => {
            const isSelected = selectedTopicId === topic.id;
            return (
              <button
                key={topic.id}
                onClick={() => handleSelectTopic(topic.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-lg border border-indigo-400'
                    : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-white/5'
                }`}
              >
                {topic.shortName}
              </button>
            );
          })}
        </div>
      </div>

      {/* Official EAF Theme Method & Sample Question Sheet if topic selected */}
      {selectedTopic && (
        <div className="bg-slate-900/90 border border-indigo-500/30 rounded-3xl p-6 sm:p-8 space-y-6 animate-in slide-in-from-top-4 duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-amber-400">
                Fiche Méthode Officielle EAF — {selectedTopic.officialTheme}
              </span>
              <h3 className="text-xl font-bold text-white font-serif-literary mt-0.5">
                {selectedTopic.title}
              </h3>
            </div>
            <span className="text-xs bg-indigo-950 text-indigo-300 px-3 py-1 rounded-full border border-indigo-500/30 font-semibold self-start sm:self-auto">
              Question de Grammaire (2 pts)
            </span>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed">
            {selectedTopic.description}
          </p>

          {/* Method Steps for 2 pts */}
          <div className="space-y-3 bg-slate-950/60 p-4 rounded-2xl border border-white/5">
            <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wide flex items-center gap-2">
              <FileText size={15} /> Méthode de réponse à l'oral (4 étapes pour 2/2 pts) :
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
              {selectedTopic.methodSteps.map((step, idx) => (
                <div key={idx} className="p-2.5 bg-slate-900/80 rounded-xl border border-white/5">
                  {step}
                </div>
              ))}
            </div>
          </div>

          {/* Official EAF Exam Questions & Rédigé Answer */}
          {selectedTopic.examples.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wide flex items-center gap-2">
                <HelpCircle size={15} /> Question Type Bac & Modèle de Réponse Rédigée :
              </h4>

              <div className="space-y-4">
                {selectedTopic.examples.map((ex, exIdx) => {
                  const isRevealed = revealedExamples.has(exIdx);
                  return (
                    <div key={exIdx} className="bg-slate-950/80 rounded-2xl p-4 sm:p-5 border border-white/10 space-y-3">
                      <div className="text-sm font-semibold text-white flex items-start gap-2">
                        <span className="w-5 h-5 rounded-md bg-amber-500/20 text-amber-300 text-xs flex items-center justify-center shrink-0 mt-0.5 font-bold">
                          Q{exIdx + 1}
                        </span>
                        <span>{ex.question}</span>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-1 border-t border-white/5">
                        <span className="text-amber-400 font-medium">Barème EAF : {ex.bareme}</span>
                        <button
                          onClick={() => {
                            setRevealedExamples(prev => {
                              const next = new Set(prev);
                              if (next.has(exIdx)) next.delete(exIdx);
                              else next.add(exIdx);
                              return next;
                            });
                          }}
                          className="flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 font-bold bg-indigo-500/10 hover:bg-indigo-500/20 px-3 py-1 rounded-lg transition-colors"
                        >
                          {isRevealed ? <EyeOff size={14} /> : <Eye size={14} />}
                          <span>{isRevealed ? 'Masquer la réponse' : 'Voir la réponse rédigée'}</span>
                        </button>
                      </div>

                      {isRevealed && (
                        <div className="mt-3 p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-xs text-slate-200 leading-relaxed animate-in fade-in duration-300">
                          <div className="font-bold text-amber-300 mb-1">Réponse orale rédigée (2 pts) :</div>
                          {ex.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Study Area */}
      <div className="space-y-6">
          {/* Sentence Box */}
          <div className="wood-panel p-8 sm:p-12 rounded-3xl border border-white/10 relative overflow-hidden group shadow-2xl">
            <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />

            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-6 opacity-50">
                <MousePointer2 size={14} className="text-indigo-400" />
                <span className="text-[10px] uppercase tracking-widest font-bold">
                  {verificationStep === 'highlighting' ? 'Surlignez les mots' : 'Découpage validé'}
                </span>
              </div>

              <div className="flex flex-wrap gap-x-3 gap-y-4 text-2xl sm:text-3xl font-serif-literary leading-relaxed">
                {words.map((word, idx) => (
                  <span
                    key={idx}
                    onMouseDown={() => handleMouseDown(idx)}
                    onMouseEnter={() => handleMouseEnter(idx)}
                    className={`
                      px-2 py-1 rounded-lg transition-all duration-200 cursor-pointer select-none border-b-2 border-transparent
                      ${getWordColor(idx)}
                      ${verificationStep !== 'highlighting' ? 'cursor-default' : 'hover:scale-110'}
                    `}
                  >
                    {word}
                  </span>
                ))}
              </div>
            </div>

            {/* Verification Overlay/Message */}
            {verificationMessage && (
              <div className="mt-8 space-y-4">
                <div className={`
                  p-4 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-2 duration-300
                  ${isCorrect === true ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                    isCorrect === false ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                    'bg-amber-500/10 text-amber-400 border border-amber-500/20'}
                `}>
                  {isCorrect === true ? <Check size={18} /> : isCorrect === false ? <X size={18} /> : <AlertCircle size={18} />}
                  <p className="text-sm font-medium flex-1">{verificationMessage}</p>
                  {isCorrect === false && (
                    <button
                      onClick={() => setShowCorrige(!showCorrige)}
                      className="text-xs px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 transition-colors font-bold"
                    >
                      {showCorrige ? 'Masquer' : 'Voir le corrigé'}
                    </button>
                  )}
                </div>

                {/* Corrigé Section */}
                {showCorrige && isCorrect === false && (
                  <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-6 space-y-4 animate-in slide-in-from-top-2 duration-300">
                    <h3 className="text-sm font-bold text-indigo-400 flex items-center gap-2">
                      <BookOpen size={16} />
                      Corrigé
                    </h3>

                    <div className="space-y-3">
                      <div className="text-xs text-slate-400">
                        <span className="font-bold">Phrase :</span> {currentSentence.bracketedText}
                      </div>

                      <div className="space-y-2">
                        {currentSentence.propositions.map((prop, idx) => (
                          <div key={idx} className="flex items-start gap-3 text-sm">
                            <span className="text-indigo-400 font-bold shrink-0">Prop. {idx + 1}:</span>
                            <div className="flex-1">
                              <div className="text-slate-300 italic">« {prop.text} »</div>
                              <div className="text-emerald-400 font-bold text-xs mt-1">→ {prop.type}</div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {currentSentence.ruleExplanation && (
                        <div className="pt-3 border-t border-white/5">
                          <p className="text-xs text-slate-400">
                            <span className="font-bold text-amber-400">Règle :</span> {currentSentence.ruleExplanation}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Proposition Selector Buttons */}
          {verificationStep === 'highlighting' && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Choix de la proposition</h3>
              <div className="flex flex-wrap justify-center gap-3">
                {[0, 1, 2, 3].map(idx => (
                  <button
                    key={idx}
                    onClick={() => setActivePropIndex(idx)}
                    className={`
                      flex items-center justify-between gap-3 px-6 py-3 rounded-xl border-2 transition-all duration-300
                      ${activePropIndex === idx
                        ? `${PROP_COLORS[idx]} scale-105 shadow-lg`
                        : 'bg-slate-800/40 border-transparent text-slate-400 hover:bg-slate-800 hover:text-slate-200'}
                    `}
                  >
                    <span className="font-bold text-sm">Proposition {idx + 1}</span>
                    {highlights.find(h => h.propIndex === idx) && <Check size={14} />}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setHighlights([])}
                className="w-full flex items-center justify-center gap-2 py-2 text-xs text-slate-500 hover:text-red-400 transition-colors"
              >
                <Eraser size={12} /> Réinitialiser tout
              </button>
            </div>
          )}

          {/* Select Principale Step */}
          {verificationStep === 'select-principale' && (
            <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
              <h3 className="text-sm font-bold text-indigo-400 text-center">Quelle est la proposition principale ?</h3>
              <div className="grid gap-4">
                {[...highlights].sort((a, b) => a.wordIndices[0] - b.wordIndices[0]).map((hl, i) => (
                  <button
                    key={hl.propIndex}
                    onClick={() => setSelectedPrincipaleIndex(hl.propIndex)}
                    className={`flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-300 ${
                      selectedPrincipaleIndex === hl.propIndex
                        ? 'bg-indigo-500/20 border-indigo-500 scale-105'
                        : 'bg-slate-800/40 border-white/5 hover:border-indigo-500/50'
                    }`}
                  >
                    <div className={`px-3 py-1 rounded-lg font-bold text-xs shrink-0 ${PROP_COLORS[hl.propIndex]}`}>
                      Prop. {i + 1}
                    </div>
                    <div className="flex-1 italic text-slate-300 text-sm w-full">
                      « {hl.wordIndices.map(idx => words[idx]).join(' ')} »
                    </div>
                    {selectedPrincipaleIndex === hl.propIndex && (
                      <Check size={18} className="text-indigo-400" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Classification Area */}
          {verificationStep === 'classifying' && (
            <div className="grid gap-4 animate-in slide-in-from-bottom-4 duration-500">
              {[...highlights].sort((a, b) => a.wordIndices[0] - b.wordIndices[0]).map((hl, i) => {
                const isPrincipale = hl.propIndex === selectedPrincipaleIndex;
                return (
                  <div key={hl.propIndex} className="flex flex-col sm:flex-row items-center gap-4 bg-slate-800/40 p-4 rounded-2xl border border-white/5">
                    <div className={`px-3 py-1 rounded-lg font-bold text-xs shrink-0 ${PROP_COLORS[hl.propIndex]}`}>
                      Prop. {i + 1}
                    </div>
                    <div className="flex-1 italic text-slate-300 text-sm truncate w-full">
                      « {hl.wordIndices.map(idx => words[idx]).join(' ')} »
                    </div>
                    {isPrincipale ? (
                      <div className="bg-indigo-500/20 border border-indigo-500 text-indigo-400 text-xs rounded-xl px-4 py-2 font-bold">
                        Principale
                      </div>
                    ) : (
                      <select
                        value={secondaryTypes[hl.propIndex] || ''}
                        onChange={(e) => setSecondaryTypes(prev => ({ ...prev, [hl.propIndex]: e.target.value }))}
                        className="bg-slate-900 border border-white/10 text-slate-200 text-xs rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500 transition-all w-full sm:w-auto"
                      >
                        <option value="">Type de proposition</option>
                        <option value="Subordonnée relative">Subordonnée relative</option>
                        <option value="Subordonnée complétive">Subordonnée complétive</option>
                        <option value="Subordonnée circonstancielle">Subordonnée circonstancielle</option>
                        <option value="Juxtaposées">Juxtaposées</option>
                        <option value="Coordonnées">Coordonnées</option>
                      </select>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Complete Step - Show Final Result */}
          {verificationStep === 'complete' && (
            <div className="grid gap-4 animate-in slide-in-from-bottom-4 duration-500">
              {[...highlights].sort((a, b) => a.wordIndices[0] - b.wordIndices[0]).map((hl, i) => {
                const isPrincipale = hl.propIndex === selectedPrincipaleIndex;
                const displayType = isPrincipale ? 'Principale' : secondaryTypes[hl.propIndex];
                return (
                  <div key={hl.propIndex} className="flex flex-col sm:flex-row items-center gap-4 bg-slate-800/40 p-4 rounded-2xl border border-emerald-500/20">
                    <div className={`px-3 py-1 rounded-lg font-bold text-xs shrink-0 ${PROP_COLORS[hl.propIndex]}`}>
                      Prop. {i + 1}
                    </div>
                    <div className="flex-1 italic text-slate-300 text-sm truncate w-full">
                      « {hl.wordIndices.map(idx => words[idx]).join(' ')} »
                    </div>
                    <div className="bg-emerald-500/20 border border-emerald-500 text-emerald-400 text-xs rounded-xl px-4 py-2 font-bold">
                      {displayType}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Action Button */}
          <div className="flex justify-center pt-4">
            {verificationStep === 'highlighting' && (
              <button
                onClick={verifyHighlights}
                className="copper-action px-10 py-4 rounded-2xl text-white font-bold text-lg shadow-xl hover:scale-105 active:scale-95 transition-all"
              >
                Vérifier le découpage
              </button>
            )}
            {verificationStep === 'select-principale' && (
              <button
                onClick={verifyPrincipale}
                className="copper-action px-10 py-4 rounded-2xl text-white font-bold text-lg shadow-xl hover:scale-105 active:scale-95 transition-all"
              >
                Confirmer la principale
              </button>
            )}
            {verificationStep === 'classifying' && (
              <button
                onClick={verifyClassification}
                className="copper-action px-10 py-4 rounded-2xl text-white font-bold text-lg shadow-xl hover:scale-105 active:scale-95 transition-all"
              >
                Vérifier l'analyse
              </button>
            )}
            {verificationStep === 'complete' && (
              <div className="flex gap-3">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-8 py-4 rounded-2xl bg-slate-800 text-slate-400 hover:text-white transition-all disabled:opacity-20"
                >
                  Précédent
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.min(TOTAL_PAGES, p + 1))}
                  disabled={currentPage === TOTAL_PAGES}
                  className="copper-action px-10 py-4 rounded-2xl text-white font-bold transition-all disabled:opacity-20"
                >
                  Phrase suivante
                </button>
              </div>
            )}
          </div>
      </div>

      {/* Footer Navigation */}
      <div className="flex justify-between items-center pt-8 border-t border-white/5 opacity-50">
        <button
          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          className="flex items-center gap-2 text-xs hover:text-white transition-colors"
          disabled={currentPage === 1}
        >
          <ChevronLeft size={14} /> Phrase précédente
        </button>
        <span className="text-[10px] font-mono tracking-widest">GRAMMAR_ENGINE_V2</span>
        <button
          onClick={() => setCurrentPage(p => Math.min(TOTAL_PAGES, p + 1))}
          className="flex items-center gap-2 text-xs hover:text-white transition-colors"
          disabled={currentPage === TOTAL_PAGES}
        >
          Phrase suivante <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
