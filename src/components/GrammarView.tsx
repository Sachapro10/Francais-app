import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { BookOpen, ChevronLeft, ChevronRight, Eraser, Trash2, MousePointerClick, Highlighter, Eye, EyeOff, Check, X, AlertCircle } from 'lucide-react';
import { GRAMMAR_SENTENCES, GrammarSentence } from '../utils/grammarData';

interface Highlight {
  id: string;
  startOffset: number;
  endOffset: number;
  text: string;
}

interface SentenceHighlight {
  sentenceId: number;
  highlights: Highlight[];
}

type SelectionMode = 'click' | 'drag';
type VerificationStep = 'highlighting' | 'verified' | 'classifying' | 'complete';

const ITEMS_PER_PAGE = 1;
const TOTAL_PAGES = GRAMMAR_SENTENCES.length;

const PROP_TYPE_COLORS: Record<string, string> = {
  'Principale': 'bg-amber-500/30 text-amber-700 border-amber-400/50',
  'Subordonnée relative': 'bg-blue-500/30 text-blue-700 border-blue-400/50',
  'Subordonnée conjonctive': 'bg-emerald-500/30 text-emerald-700 border-emerald-400/50',
  'Subordonnée participiale': 'bg-orange-500/30 text-orange-700 border-orange-400/50',
  'Subordonnée infinitive': 'bg-purple-500/30 text-purple-700 border-purple-400/50',
  'Indépendante': 'bg-slate-500/30 text-slate-700 border-slate-400/50',
  'Subordonnée interrogative indirecte': 'bg-pink-500/30 text-pink-700 border-pink-400/50',
};

// Citation highlight color - consistent for all marked citations
const CITATION_HIGHLIGHT_COLOR = 'bg-amber-200 text-amber-900 border-amber-400';

export default function GrammarView() {
  const [currentPage, setCurrentPage] = useState(1);
  const [mode, setMode] = useState<SelectionMode>('drag');
  const [allHighlights, setAllHighlights] = useState<SentenceHighlight[]>([]);
  const [selectionStart, setSelectionStart] = useState<{ sentenceId: number; offset: number } | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<{ sentenceId: number; offset: number } | null>(null);
  const [verificationStep, setVerificationStep] = useState<VerificationStep>('highlighting');
  const [verificationMessage, setVerificationMessage] = useState<string>('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [principaleChoice, setPrincipaleChoice] = useState<string | null>(null);
  const [secondaryTypes, setSecondaryTypes] = useState<Record<string, string>>({});
  const dragStartRef = useRef<{ sentenceId: number; wordIndex: number } | null>(null);
  const isDraggingRef = useRef(false);

  const currentSentences = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return GRAMMAR_SENTENCES.slice(start, start + ITEMS_PER_PAGE);
  }, [currentPage]);

  const currentSentence = currentSentences[0];

  // Reset state when changing pages
  useEffect(() => {
    setAllHighlights([]);
    setVerificationStep('highlighting');
    setVerificationMessage('');
    setIsCorrect(null);
    setPrincipaleChoice(null);
    setSecondaryTypes({});
  }, [currentPage]);

  const getHighlightsForSentence = useCallback((sentenceId: number): Highlight[] => {
    return allHighlights.find(h => h.sentenceId === sentenceId)?.highlights ?? [];
  }, [allHighlights]);

  const getSentenceText = useCallback((sentence: GrammarSentence): string => {
    return sentence.rawText;
  }, []);

  const getWordRanges = useCallback((text: string, highlights: Highlight[]) => {
    // Split by spaces to get words only (no space tokens)
    const words = text.split(/\s+/).filter(word => word.length > 0);

    if (highlights.length === 0) {
      return words.map((word, i) => ({
        text: word,
        index: i,
        highlightId: undefined as string | undefined
      }));
    }

    const sorted = [...highlights].sort((a, b) => a.startOffset - b.startOffset);
    const ranges: { text: string; index: number; highlightId?: string }[] = [];

    // Calculate word positions in original text
    let currentPos = 0;
    words.forEach((word, wordIndex) => {
      // Find where this word starts in the original text
      const wordStart = text.indexOf(word, currentPos);
      const wordEnd = wordStart + word.length;

      const h = sorted.find(hl =>
        (wordStart >= hl.startOffset && wordStart < hl.endOffset) ||
        (wordEnd > hl.startOffset && wordEnd <= hl.endOffset) ||
        (hl.startOffset >= wordStart && hl.startOffset < wordEnd)
      );

      ranges.push({
        text: word,
        index: wordIndex,
        highlightId: h?.id
      });

      currentPos = wordEnd;
    });

    return ranges;
  }, []);

  const handleMouseDown = useCallback((sentenceId: number, wordIndex: number, event: React.MouseEvent) => {
    if (mode !== 'drag') return;
    event.preventDefault();
    isDraggingRef.current = true;
    dragStartRef.current = { sentenceId, wordIndex };
    setSelectionStart({ sentenceId, offset: wordIndex });
    setSelectionEnd({ sentenceId, offset: wordIndex });
  }, [mode]);

  const handleMouseEnter = useCallback((sentenceId: number, wordIndex: number) => {
    if (mode !== 'drag' || !isDraggingRef.current || !dragStartRef.current) return;
    if (dragStartRef.current.sentenceId !== sentenceId) return;
    setSelectionEnd({ sentenceId, offset: wordIndex });
  }, [mode]);

  const handleMouseUp = useCallback((sentenceId: number) => {
    if (mode !== 'drag') return;
    if (!isDraggingRef.current || !dragStartRef.current || !selectionStart || !selectionEnd) {
      isDraggingRef.current = false;
      setSelectionStart(null);
      setSelectionEnd(null);
      return;
    }

    const startWord = Math.min(selectionStart.offset, selectionEnd.offset);
    const endWord = Math.max(selectionStart.offset, selectionEnd.offset);

    const sentence = GRAMMAR_SENTENCES.find(s => s.id === sentenceId);
    if (!sentence) return;

    const sentenceText = sentence.rawText;
    const words = sentenceText.split(' ');
    let startOffset = 0;
    for (let i = 0; i < startWord; i++) {
      startOffset += words[i].length + 1;
    }
    let endOffset = 0;
    for (let i = 0; i <= endWord; i++) {
      endOffset += words[i].length + 1;
    }
    endOffset = Math.min(endOffset, sentenceText.length);

    const newHighlight: Highlight = {
      id: `h_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      startOffset,
      endOffset,
      text: sentenceText.slice(startOffset, endOffset).trim(),
    };

    setAllHighlights(prev => {
      const existing = prev.find(h => h.sentenceId === sentenceId);
      if (existing) {
        return prev.map(h => h.sentenceId === sentenceId
          ? { ...h, highlights: [...h.highlights.filter(hl => hl.id !== newHighlight.id), newHighlight] }
          : h
        );
      }
      return [...prev, { sentenceId, highlights: [newHighlight] }];
    });

    isDraggingRef.current = false;
    setSelectionStart(null);
    setSelectionEnd(null);
  }, [mode, selectionStart, selectionEnd]);

  useEffect(() => {
    const handleGlobalMouseUp = (e: MouseEvent) => {
      if (isDraggingRef.current && dragStartRef.current) {
        handleMouseUp(dragStartRef.current.sentenceId);
      }
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, [handleMouseUp]);

  const removeHighlight = useCallback((sentenceId: number, highlightId: string) => {
    setAllHighlights(prev =>
      prev.map(h => h.sentenceId === sentenceId
        ? { ...h, highlights: h.highlights.filter(hl => hl.id !== highlightId) }
        : h
      ).filter(h => h.highlights.length > 0)
    );
  }, []);

  const clearAllHighlights = useCallback((sentenceId: number) => {
    setAllHighlights(prev => prev.filter(h => h.sentenceId !== sentenceId));
  }, []);

  const clearAll = useCallback(() => {
    setAllHighlights([]);
    setVerificationStep('highlighting');
    setVerificationMessage('');
    setIsCorrect(null);
    setPrincipaleChoice(null);
    setSecondaryTypes({});
  }, []);

  const getDragSelectionRange = useCallback((): { start: number; end: number } | null => {
    if (!selectionStart || !selectionEnd) return null;
    if (selectionStart.sentenceId !== selectionEnd.sentenceId) return null;
    return { start: Math.min(selectionStart.offset, selectionEnd.offset), end: Math.max(selectionStart.offset, selectionEnd.offset) };
  }, [selectionStart, selectionEnd]);

  const verifyHighlights = useCallback(() => {
    if (!currentSentence) return;

    const highlights = getHighlightsForSentence(currentSentence.id);
    const expectedCount = currentSentence.propositions.length;

    if (highlights.length !== expectedCount) {
      setIsCorrect(false);
      setVerificationMessage(`Incorrect. Il y a ${expectedCount} proposition${expectedCount > 1 ? 's' : ''} dans cette phrase.`);
      return;
    }

    // Check if each highlight matches a proposition (allowing some flexibility in exact text match)
    const matched = highlights.every(hl => {
      return currentSentence.propositions.some(prop => {
        const hlNormalized = hl.text.trim().toLowerCase();
        const propNormalized = prop.text.trim().toLowerCase();
        return hlNormalized === propNormalized ||
               propNormalized.includes(hlNormalized) ||
               hlNormalized.includes(propNormalized);
      });
    });

    if (matched) {
      setIsCorrect(true);
      setVerificationMessage('Correct ! Maintenant, identifiez quelle proposition est la principale.');
      setVerificationStep('verified');
    } else {
      setIsCorrect(false);
      setVerificationMessage('Les propositions surlignées ne correspondent pas exactement. Réessayez.');
    }
  }, [currentSentence, getHighlightsForSentence]);

  const selectPrincipale = useCallback((highlightId: string) => {
    if (verificationStep !== 'verified') return;

    const highlights = getHighlightsForSentence(currentSentence.id);
    const selectedHighlight = highlights.find(h => h.id === highlightId);
    if (!selectedHighlight) return;

    const principaleProp = currentSentence.propositions.find(p => p.type === 'Principale');
    if (!principaleProp) {
      setVerificationMessage('Cette phrase n\'a pas de proposition principale.');
      setVerificationStep('complete');
      return;
    }

    const hlNormalized = selectedHighlight.text.trim().toLowerCase();
    const propNormalized = principaleProp.text.trim().toLowerCase();
    const isCorrectChoice = hlNormalized === propNormalized ||
                           propNormalized.includes(hlNormalized) ||
                           hlNormalized.includes(propNormalized);

    if (isCorrectChoice) {
      setPrincipaleChoice(highlightId);
      setVerificationMessage('Correct ! Maintenant, classifiez les autres propositions.');
      setVerificationStep('classifying');
    } else {
      setVerificationMessage('Incorrect. Cette proposition n\'est pas la principale. Réessayez.');
    }
  }, [verificationStep, currentSentence, getHighlightsForSentence]);

  const classifySecondary = useCallback((highlightId: string, type: string) => {
    setSecondaryTypes(prev => ({ ...prev, [highlightId]: type }));
  }, []);

  const verifyClassification = useCallback(() => {
    const highlights = getHighlightsForSentence(currentSentence.id);
    const secondaryHighlights = highlights.filter(h => h.id !== principaleChoice);

    let allCorrect = true;
    for (const hl of secondaryHighlights) {
      const userType = secondaryTypes[hl.id];
      if (!userType) {
        allCorrect = false;
        break;
      }

      const matchingProp = currentSentence.propositions.find(prop => {
        const hlNormalized = hl.text.trim().toLowerCase();
        const propNormalized = prop.text.trim().toLowerCase();
        return hlNormalized === propNormalized ||
               propNormalized.includes(hlNormalized) ||
               hlNormalized.includes(propNormalized);
      });

      if (!matchingProp || matchingProp.type !== userType) {
        allCorrect = false;
        break;
      }
    }

    if (allCorrect) {
      setVerificationMessage('Parfait ! Toutes les classifications sont correctes.');
      setVerificationStep('complete');
    } else {
      setVerificationMessage('Certaines classifications sont incorrectes. Vérifiez vos réponses.');
    }
  }, [currentSentence, getHighlightsForSentence, principaleChoice, secondaryTypes]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white font-serif-literary flex items-center gap-2">
            <BookOpen size={22} className="text-amber-400" />
            Révision de Grammaire
          </h2>
          <p className="text-xs text-slate-500 mt-1">Identifiez et classifiez les propositions</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="wood-panel p-4 rounded-xl">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-slate-400">Phrase {currentPage} sur {TOTAL_PAGES}</span>
          <span className="text-xs text-slate-400">{Math.round((currentPage / TOTAL_PAGES) * 100)}%</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2">
          <div
            className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentPage / TOTAL_PAGES) * 100}%` }}
          />
        </div>
      </div>

      {/* Instructions based on step */}
      <div className="wood-panel p-4 rounded-xl">
        <div className="flex items-start gap-3">
          <AlertCircle size={18} className="text-amber-400 mt-0.5 shrink-0" />
          <div className="text-sm text-slate-300">
            {verificationStep === 'highlighting' && (
              <p>
                <strong className="text-white">Étape 1 :</strong> Surlignez toutes les propositions de cette phrase en glissant sur les mots, puis cliquez sur <strong className="text-amber-400">Vérifier</strong>.
              </p>
            )}
            {verificationStep === 'verified' && (
              <p>
                <strong className="text-white">Étape 2 :</strong> Cliquez sur la proposition qui est la <strong className="text-amber-400">principale</strong>.
              </p>
            )}
            {verificationStep === 'classifying' && (
              <p>
                <strong className="text-white">Étape 3 :</strong> Sélectionnez le type de chaque proposition secondaire, puis cliquez sur <strong className="text-amber-400">Vérifier la classification</strong>.
              </p>
            )}
            {verificationStep === 'complete' && (
              <p>
                <strong className="text-emerald-400">Exercice terminé !</strong> Passez à la phrase suivante.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Verification message */}
      {verificationMessage && (
        <div className={`wood-panel p-4 rounded-xl border-2 animate-[soft-pop_0.3s_ease-out] ${
          isCorrect === true ? 'border-emerald-500/50 bg-emerald-500/10' :
          isCorrect === false ? 'border-red-500/50 bg-red-500/10' :
          'border-amber-500/50 bg-amber-500/10'
        }`}>
          <div className="flex items-center gap-2">
            {isCorrect === true && <Check size={18} className="text-emerald-400 animate-[soft-pop_0.2s_ease-out]" />}
            {isCorrect === false && <X size={18} className="text-red-400 animate-[soft-pop_0.2s_ease-out]" />}
            {isCorrect === null && <AlertCircle size={18} className="text-amber-400 animate-[soft-pop_0.2s_ease-out]" />}
            <p className={`text-sm font-medium ${
              isCorrect === true ? 'text-emerald-300' :
              isCorrect === false ? 'text-red-300' :
              'text-amber-300'
            }`}>
              {verificationMessage}
            </p>
          </div>
        </div>
      )}

      {/* Main sentence display */}
      {currentSentence && (
        <div className="wood-panel p-8 rounded-xl border border-white/5 space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4 min-w-0 flex-1">
              <span className="bg-slate-700 text-slate-400 text-sm font-mono w-12 h-12 rounded-lg flex items-center justify-center shrink-0">
                {currentSentence.id}
              </span>
              <div className="flex-1">
                <span className="text-slate-200 leading-relaxed text-2xl font-serif-literary break-words block">
                  {(() => {
                    const highlights = getHighlightsForSentence(currentSentence.id);
                    const wordRanges = getWordRanges(getSentenceText(currentSentence), highlights);
                    const dragRange = mode === 'drag' && selectionStart?.sentenceId === currentSentence.id && selectionEnd?.sentenceId === currentSentence.id
                      ? getDragSelectionRange()
                      : null;

                    return wordRanges.map((item, idx) => {
                      const isSelected = dragRange && item.index >= dragRange.start && item.index <= dragRange.end;
                      const isHighlighted = !!item.highlightId;
                      const isPrincipale = item.highlightId === principaleChoice;
                      const highlightColor = isPrincipale
                        ? 'bg-emerald-300/90 text-emerald-950 rounded-sm px-1'
                        : isHighlighted
                        ? 'bg-amber-200/80 text-amber-950 rounded-sm px-1'
                        : '';

                      return (
                        <span key={`${item.index}-${idx}`}>
                          <span
                            className={`
                              inline-block py-0.5 transition-all duration-200 ease-out
                              ${highlightColor}
                              ${isSelected ? 'bg-indigo-400/50 text-white rounded-sm px-1 scale-105' : ''}
                              ${verificationStep === 'highlighting' && mode === 'drag' && !isHighlighted ? 'cursor-crosshair select-none hover:bg-white/5' : 'select-text'}
                              ${verificationStep === 'verified' && isHighlighted ? 'cursor-pointer hover:ring-2 hover:ring-emerald-400 hover:scale-105 active:scale-95' : ''}
                              ${isHighlighted && !isPrincipale ? 'animate-[highlight_0.4s_ease-out]' : ''}
                              ${isPrincipale ? 'animate-[principale_0.5s_ease-out] shadow-lg shadow-emerald-500/20' : ''}
                            `}
                            onMouseDown={(e) => {
                              if (verificationStep === 'highlighting') {
                                handleMouseDown(currentSentence.id, item.index, e);
                              }
                            }}
                            onMouseEnter={() => {
                              if (verificationStep === 'highlighting') {
                                handleMouseEnter(currentSentence.id, item.index);
                              }
                            }}
                            onMouseUp={() => {
                              if (verificationStep === 'highlighting') {
                                handleMouseUp(currentSentence.id);
                              }
                            }}
                            onClick={() => {
                              if (verificationStep === 'verified' && item.highlightId) {
                                selectPrincipale(item.highlightId);
                              }
                            }}
                          >
                            {item.text}
                          </span>
                          {idx < wordRanges.length - 1 && ' '}
                        </span>
                      );
                    });
                  })()}
                </span>
              </div>
            </div>
            {verificationStep === 'highlighting' && (
              <button
                onClick={() => clearAllHighlights(currentSentence.id)}
                className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all shrink-0"
                title="Effacer tous les surlignages"
              >
                <Eraser size={14} />
                Effacer
              </button>
            )}
          </div>

          {/* Show highlighted propositions */}
          {(() => {
            const highlights = getHighlightsForSentence(currentSentence.id);
            if (highlights.length === 0) return null;

            return (
              <div className="space-y-3 pt-4 border-t border-white/5 animate-[soft-pop_0.3s_ease-out]">
                <p className="text-xs text-slate-500 font-semibold">Propositions surlignées :</p>
                <div className="space-y-2">
                  {highlights.map((hl, idx) => {
                    const isPrincipale = hl.id === principaleChoice;
                    const userType = secondaryTypes[hl.id];

                    return (
                      <div
                        key={hl.id}
                        className="flex items-center gap-3 animate-[soft-pop_0.3s_ease-out]"
                        style={{ animationDelay: `${idx * 50}ms` }}
                      >
                        <button
                          onClick={() => {
                            if (verificationStep === 'verified') {
                              selectPrincipale(hl.id);
                            }
                          }}
                          disabled={verificationStep !== 'verified'}
                          className={`flex-1 inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm border transition-all duration-300 ease-out ${
                            isPrincipale
                              ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300 shadow-lg'
                              : verificationStep === 'verified'
                              ? 'bg-amber-500/20 border-amber-400/50 text-amber-300 hover:bg-amber-500/30 hover:border-amber-400 cursor-pointer hover:shadow-md'
                              : 'bg-amber-500/20 border-amber-400/50 text-amber-300 cursor-default'
                          } ${verificationStep === 'verified' && !isPrincipale ? 'hover:scale-[1.02] hover:-translate-y-0.5' : ''} ${isPrincipale ? 'scale-[1.02]' : ''}`}
                        >
                          {isPrincipale && <Check size={14} className="text-emerald-400 animate-[soft-pop_0.2s_ease-out]" />}
                          «&nbsp;{hl.text}&nbsp;»
                        </button>

                        {verificationStep === 'classifying' && !isPrincipale && (
                          <select
                            value={userType || ''}
                            onChange={(e) => classifySecondary(hl.id, e.target.value)}
                            className="px-3 py-2 rounded-lg bg-slate-700 text-slate-300 text-sm border border-slate-600 focus:border-indigo-500 focus:outline-none transition-all duration-200 hover:border-indigo-400"
                          >
                            <option value="">-- Choisir le type --</option>
                            <option value="Indépendante">Indépendante</option>
                            <option value="Subordonnée relative">Subordonnée relative</option>
                            <option value="Subordonnée conjonctive">Subordonnée conjonctive</option>
                            <option value="Subordonnée complétive">Subordonnée complétive</option>
                            <option value="Subordonnée circonstancielle">Subordonnée circonstancielle</option>
                            <option value="Subordonnée participiale">Subordonnée participiale</option>
                            <option value="Subordonnée infinitive">Subordonnée infinitive</option>
                            <option value="Subordonnée interrogative indirecte">Subordonnée interrogative indirecte</option>
                            <option value="Subordonnée temporelle">Subordonnée temporelle</option>
                            <option value="Subordonnée causale">Subordonnée causale</option>
                            <option value="Subordonnée finale">Subordonnée finale</option>
                            <option value="Subordonnée concessive">Subordonnée concessive</option>
                            <option value="Subordonnée conditionnelle">Subordonnée conditionnelle</option>
                            <option value="Subordonnée comparative">Subordonnée comparative</option>
                            <option value="Subordonnée consécutive">Subordonnée consécutive</option>
                          </select>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* Action buttons */}
          <div className="flex items-center justify-center gap-3 pt-4">
            {verificationStep === 'highlighting' && (
              <button
                onClick={verifyHighlights}
                disabled={getHighlightsForSentence(currentSentence.id).length === 0}
                className="copper-action flex items-center gap-2 px-6 py-3 rounded-lg text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-lg"
              >
                <Check size={18} />
                Vérifier
              </button>
            )}

            {verificationStep === 'classifying' && (
              <button
                onClick={verifyClassification}
                disabled={
                  getHighlightsForSentence(currentSentence.id).filter(h => h.id !== principaleChoice).length !==
                  Object.keys(secondaryTypes).length
                }
                className="copper-action flex items-center gap-2 px-6 py-3 rounded-lg text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-lg"
              >
                <Check size={18} />
                Vérifier la classification
              </button>
            )}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          className="flex items-center gap-2 px-4 py-3 rounded-lg bg-slate-700 text-slate-300 hover:text-white hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm font-medium"
        >
          <ChevronLeft size={18} />
          Phrase précédente
        </button>

        <span className="text-sm text-slate-400">
          {currentPage} / {TOTAL_PAGES}
        </span>

        <button
          onClick={() => setCurrentPage(p => Math.min(TOTAL_PAGES, p + 1))}
          disabled={currentPage === TOTAL_PAGES}
          className="flex items-center gap-2 px-4 py-3 rounded-lg bg-slate-700 text-slate-300 hover:text-white hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm font-medium"
        >
          Phrase suivante
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}