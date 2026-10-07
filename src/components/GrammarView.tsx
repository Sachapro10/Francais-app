import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import {
  BookOpen, ChevronDown, ChevronRight, Eraser,
  Check, X, AlertCircle, Sparkles, MousePointer2,
  GraduationCap, HelpCircle, FileText, Eye, EyeOff,
  ChevronUp
} from 'lucide-react';
import {
  GRAMMAR_SENTENCES, GrammarSentence,
  VALEUR_SENTENCES, ValeurSentence, VERB_VALUE_LABELS,
  EAF_GRAMMAR_TOPICS
} from '../utils/grammarData';

interface PropHighlight {
  propIndex: number;
  wordIndices: number[];
}

type PropositionStep = 'highlighting' | 'select-principale' | 'classifying' | 'complete';

const PROP_COLORS = [
  'bg-amber-400 text-amber-950 border-amber-500',
  'bg-blue-400 text-blue-950 border-blue-500',
  'bg-emerald-400 text-emerald-950 border-emerald-500',
  'bg-purple-400 text-purple-950 border-purple-500',
];

interface CollapsibleLessonProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
  badge?: string;
}

function CollapsibleLesson({ title, defaultOpen = false, children, badge }: CollapsibleLessonProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-slate-950/60 rounded-2xl border border-white/5 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-white/3 transition-colors"
      >
        <div className="flex items-center gap-3 text-sm font-semibold text-amber-300">
          <FileText size={16} />
          {title}
          {badge && (
            <span className="text-xs bg-indigo-950 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30 font-bold">
              {badge}
            </span>
          )}
        </div>
        {isOpen ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
      </button>
      {isOpen && (
        <div className="px-4 pb-4 space-y-3 animate-in slide-in-from-top-2 duration-200">
          {children}
        </div>
      )}
    </div>
  );
}

// ─── Proposition Analysis Exercise ──────────────────────────────────────────
function PropositionExercise({ sentences }: { sentences: GrammarSentence[] }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [activePropIndex, setActivePropIndex] = useState(0);
  const [highlights, setHighlights] = useState<PropHighlight[]>([]);
  const [step, setStep] = useState<PropositionStep>('highlighting');
  const [message, setMessage] = useState('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [secondaryTypes, setSecondaryTypes] = useState<Record<number, string>>({});
  const [selectedPrincipaleIndex, setSelectedPrincipaleIndex] = useState<number | null>(null);
  const [showCorrige, setShowCorrige] = useState(false);

  const isDraggingRef = useRef(false);
  const dragStartIdxRef = useRef<number | null>(null);

  const totalPages = sentences.length;
  const currentSentence = sentences[Math.min(currentPage - 1, totalPages - 1)];

  const words = useMemo(() => {
    return currentSentence.rawText.split(/\s+/).filter(w => w.length > 0);
  }, [currentSentence]);

  useEffect(() => {
    setHighlights([]);
    setActivePropIndex(0);
    setStep('highlighting');
    setMessage('');
    setIsCorrect(null);
    setSecondaryTypes({});
    setSelectedPrincipaleIndex(null);
    setShowCorrige(false);
  }, [currentPage]);

  const toggleWord = useCallback((wordIdx: number) => {
    if (step !== 'highlighting') return;
    setHighlights(prev => {
      const existing = prev.find(h => h.propIndex === activePropIndex);
      let next = prev.map(h => ({
        ...h,
        wordIndices: h.wordIndices.filter(idx => idx !== wordIdx)
      })).filter(h => h.wordIndices.length > 0);

      if (existing) {
        const inCurrent = existing.wordIndices.includes(wordIdx);
        return next.map(h => h.propIndex === activePropIndex
          ? { ...h, wordIndices: inCurrent ? h.wordIndices.filter(i => i !== wordIdx) : [...h.wordIndices, wordIdx].sort((a, b) => a - b) }
          : h
        ).filter(h => h.wordIndices.length > 0);
      } else {
        return [...next, { propIndex: activePropIndex, wordIndices: [wordIdx] }];
      }
    });
  }, [activePropIndex, step]);

  const handleMouseDown = (idx: number) => {
    if (step !== 'highlighting') return;
    isDraggingRef.current = true;
    dragStartIdxRef.current = idx;
    toggleWord(idx);
  };

  const handleMouseEnter = (idx: number) => {
    if (!isDraggingRef.current || step !== 'highlighting' || dragStartIdxRef.current === null) return;
    const start = Math.min(dragStartIdxRef.current, idx);
    const end = Math.max(dragStartIdxRef.current, idx);
    const range = Array.from({ length: end - start + 1 }, (_, i) => start + i);

    setHighlights(prev => {
      let next = prev.map(h => ({
        ...h,
        wordIndices: h.wordIndices.filter(i => !range.includes(i))
      })).filter(h => h.wordIndices.length > 0);
      const existing = next.find(h => h.propIndex === activePropIndex);
      if (existing) {
        return next.map(h => h.propIndex === activePropIndex
          ? { ...h, wordIndices: Array.from(new Set([...h.wordIndices, ...range])).sort((a, b) => a - b) }
          : h);
      }
      return [...next, { propIndex: activePropIndex, wordIndices: range }];
    });
  };

  useEffect(() => {
    const handler = () => { isDraggingRef.current = false; dragStartIdxRef.current = null; };
    window.addEventListener('mouseup', handler);
    return () => window.removeEventListener('mouseup', handler);
  }, []);

  const getWordColor = (idx: number) => {
    const hl = highlights.find(h => h.wordIndices.includes(idx));
    return hl ? PROP_COLORS[hl.propIndex] : 'text-slate-300 hover:bg-white/5';
  };

  const verifyHighlights = () => {
    const sorted = [...highlights].sort((a, b) => a.wordIndices[0] - b.wordIndices[0]);
    if (sorted.length !== currentSentence.propositions.length) {
      setIsCorrect(false);
      setMessage(`Incorrect. Il y a ${currentSentence.propositions.length} propositions dans cette phrase.`);
      return;
    }
    const allMatched = sorted.every((hl, i) => {
      const hlText = hl.wordIndices.map(idx => words[idx]).join(' ').toLowerCase().replace(/[.,;]/g, '');
      const expText = currentSentence.propositions[i].text.toLowerCase().replace(/[.,;]/g, '');
      return hlText.includes(expText) || expText.includes(hlText);
    });
    if (allMatched) {
      setIsCorrect(true);
      setMessage("Bravo ! Maintenant, identifiez la proposition principale.");
      setStep('select-principale');
    } else {
      setIsCorrect(false);
      setMessage("Le découpage n'est pas correct. Réessayez.");
    }
  };

  const verifyPrincipale = () => {
    if (selectedPrincipaleIndex === null) {
      setIsCorrect(false);
      setMessage("Sélectionnez la proposition principale.");
      return;
    }
    const sorted = [...highlights].sort((a, b) => a.wordIndices[0] - b.wordIndices[0]);
    const principaleIdx = sorted.findIndex((_, i) => currentSentence.propositions[i].type === 'Principale');
    if (principaleIdx === -1) {
      setStep('classifying');
      setIsCorrect(true);
      setMessage("Parfait ! Classifiez les propositions restantes.");
      return;
    }
    if (selectedPrincipaleIndex === sorted[principaleIdx].propIndex) {
      setIsCorrect(true);
      setMessage("Parfait ! Classifiez les propositions restantes.");
      setStep('classifying');
    } else {
      setIsCorrect(false);
      setMessage("Ce n'est pas la proposition principale. Réessayez.");
    }
  };

  const verifyClassification = () => {
    const sorted = [...highlights].sort((a, b) => a.wordIndices[0] - b.wordIndices[0]);
    const allCorrect = sorted.every((hl, i) => {
      if (hl.propIndex === selectedPrincipaleIndex && currentSentence.propositions[i].type === 'Principale') return true;
      return secondaryTypes[hl.propIndex] === currentSentence.propositions[i].type;
    });
    if (allCorrect) {
      setIsCorrect(true);
      setMessage("Parfait ! Toutes les propositions sont correctement identifiées.");
      setStep('complete');
    } else {
      setIsCorrect(false);
      setMessage("Certaines classifications sont incorrectes.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress bar */}
      <div className="flex items-center gap-4 bg-slate-800/50 p-2 rounded-2xl border border-white/5">
        <div className="flex flex-col items-end px-2">
          <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Progression</span>
          <span className="text-sm font-mono text-white">{currentPage} / {totalPages}</span>
        </div>
        <div className="w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
          <div className="h-full bg-amber-500 transition-all" style={{ width: `${(currentPage / totalPages) * 100}%` }} />
        </div>
      </div>

      {/* Sentence box */}
      <div className="wood-panel p-8 sm:p-12 rounded-3xl border border-white/10 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />
        <div className="flex items-center gap-2 mb-6 opacity-50">
          <MousePointer2 size={14} className="text-amber-400" />
          <span className="text-[10px] uppercase tracking-widest font-bold">
            {step === 'highlighting' ? 'Surlignez les propositions' : 'Découpage validé'}
          </span>
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-4 text-2xl sm:text-3xl font-serif-literary leading-relaxed">
          {words.map((word, idx) => (
            <span
              key={idx}
              onMouseDown={() => handleMouseDown(idx)}
              onMouseEnter={() => handleMouseEnter(idx)}
              className={`px-2 py-1 rounded-lg transition-all duration-200 cursor-pointer select-none border-b-2 border-transparent ${getWordColor(idx)} ${step !== 'highlighting' ? 'cursor-default' : 'hover:scale-110'}`}
            >
              {word}
            </span>
          ))}
        </div>

        {/* Feedback */}
        {message && (
          <div className="mt-8 space-y-3">
            <div className={`p-4 rounded-2xl flex items-center gap-3 ${isCorrect ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
              {isCorrect ? <Check size={18} /> : <X size={18} />}
              <p className="text-sm font-medium flex-1">{message}</p>
              {isCorrect === false && (
                <button onClick={() => setShowCorrige(!showCorrige)} className="text-xs px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 font-bold">
                  {showCorrige ? 'Masquer' : 'Corrigé'}
                </button>
              )}
            </div>
            {showCorrige && isCorrect === false && (
              <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-6 space-y-3">
                <h3 className="text-sm font-bold text-indigo-400 flex items-center gap-2"><BookOpen size={16} /> Corrigé</h3>
                <div className="space-y-2">
                  {currentSentence.propositions.map((prop, idx) => (
                    <div key={idx} className="flex items-start gap-3 text-sm">
                      <span className="text-indigo-400 font-bold shrink-0">Prop. {idx + 1}:</span>
                      <div>
                        <div className="text-slate-300 italic">« {prop.text} »</div>
                        <div className="text-emerald-400 font-bold text-xs mt-1">→ {prop.type}</div>
                      </div>
                    </div>
                  ))}
                </div>
                {currentSentence.ruleExplanation && (
                  <p className="text-xs text-slate-400 pt-2 border-t border-white/5">
                    <span className="font-bold text-amber-400">Règle :</span> {currentSentence.ruleExplanation}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Proposition selector */}
      {step === 'highlighting' && (
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Proposition active</h3>
          <div className="flex flex-wrap justify-center gap-3">
            {[0, 1, 2, 3].map(idx => (
              <button
                key={idx}
                onClick={() => setActivePropIndex(idx)}
                className={`flex items-center gap-3 px-6 py-3 rounded-xl border-2 transition-all ${activePropIndex === idx ? `${PROP_COLORS[idx]} scale-105 shadow-lg` : 'bg-slate-800/40 border-transparent text-slate-400 hover:bg-slate-800'}`}
              >
                <span className="font-bold text-sm">Proposition {idx + 1}</span>
                {highlights.find(h => h.propIndex === idx) && <Check size={14} />}
              </button>
            ))}
          </div>
          <button onClick={() => setHighlights([])} className="w-full flex items-center justify-center gap-2 py-2 text-xs text-slate-500 hover:text-red-400 transition-colors">
            <Eraser size={12} /> Réinitialiser
          </button>
          <div className="flex justify-center">
            <button onClick={verifyHighlights} className="copper-action px-10 py-4 rounded-2xl text-white font-bold text-lg shadow-xl hover:scale-105">
              Vérifier le découpage
            </button>
          </div>
        </div>
      )}

      {/* Select principale */}
      {step === 'select-principale' && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-amber-400 text-center">Quelle est la proposition principale ?</h3>
          <div className="grid gap-4">
            {[...highlights].sort((a, b) => a.wordIndices[0] - b.wordIndices[0]).map((hl, i) => (
              <button
                key={hl.propIndex}
                onClick={() => setSelectedPrincipaleIndex(hl.propIndex)}
                className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${selectedPrincipaleIndex === hl.propIndex ? 'bg-amber-500/20 border-amber-500 scale-105' : 'bg-slate-800/40 border-white/5 hover:border-amber-500/50'}`}
              >
                <div className={`px-3 py-1 rounded-lg font-bold text-xs ${PROP_COLORS[hl.propIndex]}`}>Prop. {i + 1}</div>
                <div className="flex-1 italic text-slate-300 text-sm">« {[...hl.wordIndices].sort((a, b) => a - b).map(idx => words[idx]).join(' ')} »</div>
                {selectedPrincipaleIndex === hl.propIndex && <Check size={18} className="text-amber-400" />}
              </button>
            ))}
          </div>
          <div className="flex justify-center">
            <button onClick={verifyPrincipale} className="copper-action px-10 py-4 rounded-2xl text-white font-bold text-lg">Confirmer</button>
          </div>
        </div>
      )}

      {/* Classification */}
      {step === 'classifying' && (
        <div className="space-y-4">
          {[...highlights].sort((a, b) => a.wordIndices[0] - b.wordIndices[0]).map((hl, i) => {
            const isPrinc = hl.propIndex === selectedPrincipaleIndex;
            return (
              <div key={hl.propIndex} className="flex flex-col sm:flex-row items-center gap-4 bg-slate-800/40 p-4 rounded-2xl border border-white/5">
                <div className={`px-3 py-1 rounded-lg font-bold text-xs ${PROP_COLORS[hl.propIndex]}`}>Prop. {i + 1}</div>
                <div className="flex-1 italic text-slate-300 text-sm truncate w-full">
                  « {[...hl.wordIndices].sort((a, b) => a - b).map(idx => words[idx]).join(' ')} »
                </div>
                {isPrinc ? (
                  <div className="bg-indigo-500/20 border border-indigo-500 text-indigo-400 text-xs rounded-xl px-4 py-2 font-bold">Principale</div>
                ) : (
                  <select
                    value={secondaryTypes[hl.propIndex] || ''}
                    onChange={e => setSecondaryTypes(prev => ({ ...prev, [hl.propIndex]: e.target.value }))}
                    className="bg-slate-900 border border-white/10 text-slate-200 text-xs rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-amber-500 w-full sm:w-auto"
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
          <div className="flex justify-center">
            <button onClick={verifyClassification} className="copper-action px-10 py-4 rounded-2xl text-white font-bold text-lg">Vérifier l'analyse</button>
          </div>
        </div>
      )}

      {/* Complete */}
      {step === 'complete' && (
        <div className="space-y-4">
          {[...highlights].sort((a, b) => a.wordIndices[0] - b.wordIndices[0]).map((hl, i) => {
            const isPrinc = hl.propIndex === selectedPrincipaleIndex;
            const displayType = isPrinc ? 'Principale' : secondaryTypes[hl.propIndex];
            return (
              <div key={hl.propIndex} className="flex flex-col sm:flex-row items-center gap-4 bg-slate-800/40 p-4 rounded-2xl border border-emerald-500/20">
                <div className={`px-3 py-1 rounded-lg font-bold text-xs ${PROP_COLORS[hl.propIndex]}`}>Prop. {i + 1}</div>
                <div className="flex-1 italic text-slate-300 text-sm truncate w-full">
                  « {[...hl.wordIndices].sort((a, b) => a - b).map(idx => words[idx]).join(' ')} »
                </div>
                <div className="bg-emerald-500/20 border border-emerald-500 text-emerald-400 text-xs rounded-xl px-4 py-2 font-bold">{displayType}</div>
              </div>
            );
          })}
          <div className="flex justify-center gap-3">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
              className="px-8 py-3 rounded-2xl bg-slate-800 text-slate-400 hover:text-white disabled:opacity-20">
              Précédent
            </button>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
              className="copper-action px-10 py-3 rounded-2xl text-white font-bold disabled:opacity-20">
              Phrase suivante
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Valeur du Verbe Exercise ──────────────────────────────────────────────
function ValeurVerbeExercise({ sentences }: { sentences: ValeurSentence[] }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedValue, setSelectedValue] = useState<string>('');
  const [isChecked, setIsChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const totalPages = sentences.length;
  const current = sentences[Math.min(currentPage - 1, totalPages - 1)];

  useEffect(() => {
    setSelectedValue('');
    setIsChecked(false);
    setIsCorrect(null);
  }, [currentPage]);

  const handleCheck = () => {
    if (!selectedValue) return;
    setIsCorrect(selectedValue === current.valueType);
    setIsChecked(true);
  };

  const verbValueTypes = Object.entries(VERB_VALUE_LABELS) as [typeof current.valueType, string][];

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex items-center gap-4 bg-slate-800/50 p-2 rounded-2xl border border-white/5">
        <div className="flex flex-col items-end px-2">
          <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Phrase</span>
          <span className="text-sm font-mono text-white">{currentPage} / {totalPages}</span>
        </div>
        <div className="w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
          <div className="h-full bg-amber-500 transition-all" style={{ width: `${(currentPage / totalPages) * 100}%` }} />
        </div>
      </div>

      {/* Sentence */}
      <div className="wood-panel p-8 sm:p-12 rounded-3xl border border-white/10 relative">
        <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />
        <div className="text-xs uppercase tracking-widest font-bold text-amber-400 mb-4 opacity-60">
          Identifiez la valeur du verbe :
        </div>
        <p className="text-2xl sm:text-3xl font-serif-literary text-white leading-relaxed">
          {current.rawText}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {current.verbs.map((v, i) => (
            <span key={i} className="bg-amber-500/20 text-amber-300 text-xs font-mono px-3 py-1 rounded-full border border-amber-500/30">
              {v}
            </span>
          ))}
        </div>
      </div>

      {/* Value type selector */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider text-center">
          Quelle est la valeur du verbe ?
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {verbValueTypes.map(([id, label]) => (
            <button
              key={id}
              onClick={() => { if (!isChecked) setSelectedValue(id); }}
              disabled={isChecked}
              className={`p-3 rounded-xl text-xs font-semibold transition-all border text-left ${
                isChecked
                  ? id === current.valueType
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                    : selectedValue === id
                      ? 'bg-red-500/20 border-red-500 text-red-300'
                      : 'bg-slate-900/60 border-white/5 text-slate-500'
                  : selectedValue === id
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 scale-105'
                    : 'bg-slate-900/60 border-white/5 text-slate-300 hover:bg-slate-800 hover:border-white/10'
              }`}
            >
              {label}
              {isChecked && id === current.valueType && <Check size={12} className="inline ml-2" />}
            </button>
          ))}
        </div>

        {!isChecked && (
          <div className="flex justify-center">
            <button
              onClick={handleCheck}
              disabled={!selectedValue}
              className="copper-action px-10 py-4 rounded-2xl text-white font-bold text-lg hover:scale-105 disabled:opacity-20 disabled:cursor-not-allowed"
            >
              Vérifier
            </button>
          </div>
        )}

        {/* Correct answer feedback */}
        {isChecked && (
          <div className="space-y-4 animate-in slide-in-from-top-3 duration-300">
            <div className={`p-4 rounded-2xl border flex items-center gap-3 ${isCorrect ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
              {isCorrect ? <Check size={20} /> : <X size={20} />}
              <div>
                <p className="font-bold text-sm">{isCorrect ? 'Correct !' : 'Incorrect'}</p>
                {!isCorrect && <p className="text-xs text-slate-400 mt-0.5">La réponse était : {VERB_VALUE_LABELS[current.valueType as keyof typeof VERB_VALUE_LABELS]}</p>}
              </div>
            </div>

            {/* Full analysis */}
            <div className="bg-indigo-950/40 rounded-2xl p-5 border border-indigo-500/30 space-y-2">
              <div className="flex items-center gap-2 text-sm font-bold text-amber-300">
                <BookOpen size={16} />
                Analyse complète :
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{current.answer}</p>
            </div>

            {/* Navigation */}
            <div className="flex justify-center gap-3">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                className="px-8 py-3 rounded-2xl bg-slate-800 text-slate-400 hover:text-white disabled:opacity-20">
                Précédent
              </button>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                className="copper-action px-10 py-3 rounded-2xl text-white font-bold disabled:opacity-20">
                Phrase suivante
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Grammar View ────────────────────────────────────────────────────────
export default function GrammarView() {
  const [selectedTopicId, setSelectedTopicId] = useState<string>('proposition');
  const [revealedExamples, setRevealedExamples] = useState<Set<number>>(new Set());

  const selectedTopic = useMemo(() =>
    EAF_GRAMMAR_TOPICS.find(t => t.id === selectedTopicId) || EAF_GRAMMAR_TOPICS[0],
    [selectedTopicId]
  );

  const propositionSentences = useMemo(() =>
    GRAMMAR_SENTENCES.filter(s => s.topicId === 'proposition'),
    []
  );

  const valeurSentences = useMemo(() =>
    VALEUR_SENTENCES,
    []
  );

  const handleSelectTopic = (id: string) => {
    setSelectedTopicId(id);
    setRevealedExamples(new Set());
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-700">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white font-serif-literary flex items-center gap-3">
            <Sparkles size={28} className="text-amber-400" />
            Grammaire Bac EAF
          </h2>
          <p className="text-sm text-slate-400 mt-1">Entraînement aux questions de grammaire du Bac de Français (2 points).</p>
        </div>
      </div>

      {/* Topic selector */}
      <div className="flex flex-wrap gap-3">
        {EAF_GRAMMAR_TOPICS.map(topic => {
          const isSelected = selectedTopicId === topic.id;
          return (
            <button
              key={topic.id}
              onClick={() => handleSelectTopic(topic.id)}
              className={`px-5 py-3 rounded-2xl text-sm font-bold transition-all flex items-center gap-2 ${
                isSelected
                  ? 'bg-amber-500 text-slate-950 shadow-lg scale-105'
                  : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-white/5'
              }`}
            >
              {isSelected && <Check size={16} />}
              {topic.shortName}
            </button>
          );
        })}
      </div>

      {/* Collapsible Method Lessons */}
      <div className="space-y-2">
        {EAF_GRAMMAR_TOPICS.map((topic, idx) => (
          <CollapsibleLesson
            key={topic.id}
            title={`${topic.title} — ${topic.officialTheme}`}
            badge="Méthode"
            defaultOpen={idx === 0}
          >
            <p className="text-sm text-slate-300 leading-relaxed">{topic.description}</p>

            {/* Method steps */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wide">4 étapes pour 2/2 pts :</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                {topic.methodSteps.map((step, i) => (
                  <div key={i} className="p-2.5 bg-slate-900/80 rounded-xl border border-white/5">
                    {step}
                  </div>
                ))}
              </div>
            </div>

            {/* Example questions */}
            {topic.examples.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wide">Questions type Bac & modèle de réponse :</h4>
                {topic.examples.map((ex, exIdx) => {
                  const isRevealed = revealedExamples.has(exIdx);
                  return (
                    <div key={exIdx} className="bg-slate-900/80 rounded-xl p-4 border border-white/10 space-y-2">
                      <div className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-md bg-amber-500/20 text-amber-300 text-xs flex items-center justify-center shrink-0 font-bold mt-0.5">Q{exIdx + 1}</span>
                        <p className="text-sm text-white font-medium">{ex.question}</p>
                      </div>
                      <p className="text-xs text-slate-500 italic">Phrase : « {ex.sentence} »</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-amber-400 font-medium">{ex.bareme}</span>
                        <button
                          onClick={() => setRevealedExamples(prev => {
                            const next = new Set(prev);
                            next.has(exIdx) ? next.delete(exIdx) : next.add(exIdx);
                            return next;
                          })}
                          className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-bold bg-indigo-500/10 px-3 py-1 rounded-lg transition-colors"
                        >
                          {isRevealed ? <EyeOff size={13} /> : <Eye size={13} />}
                          {isRevealed ? 'Masquer' : 'Réponse'}
                        </button>
                      </div>
                      {isRevealed && (
                        <div className="p-3 rounded-lg bg-indigo-950/50 border border-indigo-500/30 text-xs text-slate-200 leading-relaxed">
                          <span className="font-bold text-amber-300">Réponse : </span>{ex.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CollapsibleLesson>
        ))}
      </div>

      {/* Interactive Exercise based on selected topic */}
      <div className="wood-panel rounded-3xl p-6 sm:p-8 border border-white/10">
        <div className="flex items-center gap-2 mb-6 pb-4 border-b border-white/5">
          <GraduationCap size={20} className="text-amber-400" />
          <h3 className="text-lg font-bold text-white font-serif-literary">{selectedTopic.title}</h3>
        </div>

        {selectedTopicId === 'proposition' && (
          <PropositionExercise key="proposition" sentences={propositionSentences} />
        )}
        {selectedTopicId === 'valeur_verbe' && (
          <ValeurVerbeExercise key="valeur_verbe" sentences={valeurSentences} />
        )}
      </div>
    </div>
  );
}
