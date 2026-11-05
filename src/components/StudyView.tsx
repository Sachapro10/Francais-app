import { useState, useCallback, useMemo, useEffect } from 'react';
import { CitationItem, Movement, EtudeLineaire } from '../types/etude';
import { findCitationRangesInPoem, getCitationQuotes } from '../utils/citationUtils';
import FicheRevisionModal from './FicheRevisionModal';
import {
  AnnotationHighlight, AnnotationNote, AnnotationState,
  loadAnnotations, saveAnnotations, generateId, nextColor
} from '../utils/annotationStorage';
import {
  ChevronDown, ChevronRight, Quote,
  Layers, MousePointerClick, BookOpen, Microscope, Printer,
  Highlighter, X, Check, StickyNote, Trash2
} from 'lucide-react';

interface StudyViewProps {
  etude: EtudeLineaire;
  analysisId?: string;
}

interface Highlight {
  lineIndex: number;
  start: number;
  end: number;
  text: string;
  color: string;
  citationId?: string;
}

interface ActiveCitation {
  item: CitationItem;
  highlights: Highlight[];
}

export default function StudyView({ etude, analysisId = 'default' }: StudyViewProps) {
  const [activeCitation, setActiveCitation] = useState<ActiveCitation | null>(null);
  const [showFicheModal, setShowFicheModal] = useState(false);
  const [expandedMovements, setExpandedMovements] = useState<Set<string>>(
    new Set(etude.movements.map(m => m.id))
  );
  const [annotationMode, setAnnotationMode] = useState(false);
  const [annotations, setAnnotations] = useState<AnnotationState>(() => loadAnnotations(analysisId));
  const [selectedColor, setSelectedColor] = useState<AnnotationHighlight['color']>('yellow');
  const [noteModal, setNoteModal] = useState<{ highlight: AnnotationHighlight; noteText: string } | null>(null);

  // Save annotations when they change
  useEffect(() => {
    saveAnnotations(analysisId, annotations);
  }, [annotations, analysisId]);

  const toggleMovement = (id: string) => {
    setExpandedMovements(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Handle text selection for annotation
  const handleTextSelection = useCallback(() => {
    if (!annotationMode) return;
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;

    const text = selection.toString().trim();
    if (!text) return;

    // Find the line index and character offsets
    const range = selection.getRangeAt(0);
    const container = range.commonAncestorContainer;
    const lineElement = container.parentElement?.closest('[data-line-index]') as HTMLElement | null;

    if (!lineElement) return;

    const lineIndex = parseInt(lineElement.dataset.lineIndex || '0', 10);
    const lineText = etude.textLines[lineIndex];
    if (!lineText) return;

    // Find the text content element (the span that holds the actual poem text, not the line number)
    const textContentElement = lineElement.querySelector('[data-line-text]') as HTMLElement | null;
    if (!textContentElement) return;

    // Calculate character offsets relative to the text content only
    const preSelectionRange = document.createRange();
    preSelectionRange.selectNodeContents(textContentElement);
    preSelectionRange.setEnd(range.startContainer, range.startOffset);
    const start = preSelectionRange.toString().length;
    const end = start + text.length;

    // Add highlight
    const newHighlight: AnnotationHighlight = {
      id: generateId(),
      lineIndex,
      start,
      end,
      color: selectedColor,
      text,
    };

    setAnnotations(prev => ({
      ...prev,
      highlights: [...prev.highlights, newHighlight],
    }));

    selection.removeAllRanges();
  }, [annotationMode, selectedColor, etude.textLines]);

  const deleteHighlight = useCallback((id: string) => {
    setAnnotations(prev => ({
      highlights: prev.highlights.filter(h => h.id !== id),
      notes: prev.notes.filter(n => n.id !== id),
    }));
    setNoteModal(null);
  }, []);

  const openNoteModal = useCallback((highlight: AnnotationHighlight) => {
    const existingNote = annotations.notes.find(n => n.id === highlight.id);
    setNoteModal({
      highlight,
      noteText: existingNote?.note || '',
    });
  }, [annotations.notes]);

  const saveNote = useCallback(() => {
    if (!noteModal) return;
    const { highlight, noteText } = noteModal;

    setAnnotations(prev => {
      const filteredNotes = prev.notes.filter(n => n.id !== highlight.id);
      if (noteText.trim()) {
        return {
          ...prev,
          notes: [...filteredNotes, {
            id: highlight.id,
            lineIndex: highlight.lineIndex,
            start: highlight.start,
            end: highlight.end,
            note: noteText.trim(),
            createdAt: Date.now(),
          }],
        };
      }
      return { ...prev, notes: filteredNotes };
    });
    setNoteModal(null);
  }, [noteModal]);

  // Build highlight map from active citation
  const highlightMap = useMemo(() => {
    if (!activeCitation) return {};
    const map: Record<number, Highlight[]> = {};
    for (const h of activeCitation.highlights) {
      if (!map[h.lineIndex]) map[h.lineIndex] = [];
      map[h.lineIndex].push(h);
    }
    return map;
  }, [activeCitation]);

  // Build annotation highlight map
  const annotationHighlightMap = useMemo(() => {
    const map: Record<number, AnnotationHighlight[]> = {};
    for (const h of annotations.highlights) {
      if (!map[h.lineIndex]) map[h.lineIndex] = [];
      map[h.lineIndex].push(h);
    }
    return map;
  }, [annotations.highlights]);

  // Build word-level info for each line (combines citation highlights + annotation highlights)
  const buildWordRanges = useCallback((text: string, highlights: Highlight[], annHighlights: AnnotationHighlight[]): Array<{ text: string; highlight?: Highlight; annotation?: AnnotationHighlight }> => {
    const allRanges: Array<{ text: string; highlight?: Highlight; annotation?: AnnotationHighlight }> = [];

    // Collect all boundary points
    const boundaries = new Set<number>();
    boundaries.add(0);
    boundaries.add(text.length);

    for (const h of highlights) {
      boundaries.add(h.start);
      boundaries.add(h.end);
    }
    for (const ah of annHighlights) {
      boundaries.add(ah.start);
      boundaries.add(ah.end);
    }

    const sorted = Array.from(boundaries).sort((a, b) => a - b);

    for (let i = 0; i < sorted.length - 1; i++) {
      const start = sorted[i];
      const end = sorted[i + 1];
      const sliceText = text.slice(start, end);

      const citHighlight = highlights.find(h => h.start <= start && h.end >= end);
      const annHighlight = annHighlights.find(ah => ah.start <= start && ah.end >= end);

      allRanges.push({
        text: sliceText,
        highlight: citHighlight,
        annotation: annHighlight,
      });
    }

    return allRanges;
  }, []);

  const selectCitation = useCallback((item: CitationItem) => {
    const highlights: Highlight[] = [];

    // Add manual highlight positions from excerpts (set via editor's manual highlight)
    for (const excerpt of item.excerpts ?? []) {
      if (excerpt.lineIndex !== undefined && excerpt.start !== undefined && excerpt.end !== undefined) {
        const line = etude.textLines[excerpt.lineIndex];
        highlights.push({
          lineIndex: excerpt.lineIndex,
          start: excerpt.start,
          end: excerpt.end,
          text: line ? line.slice(excerpt.start, excerpt.end) : excerpt.text,
          color: 'active',
          citationId: item.id,
        });
      }
    }

    // Find every occurrence of every excerpt in the current poem text. Derive
    // excerpts from the edited display value so old parsed `quotes` cannot
    // leave highlights stale.
    for (const quote of getCitationQuotes(item)) {
      const ranges = findCitationRangesInPoem(etude.textLines, quote, item.verses, item.procede);
      for (const r of ranges) {
        // Skip if we already have a manual highlight at this position
        if (highlights.some(h => h.lineIndex === r.lineIndex && h.start === r.start && h.end === r.end)) {
          continue;
        }
        const line = etude.textLines[r.lineIndex];
        highlights.push({
          lineIndex: r.lineIndex,
          start: r.start,
          end: r.end,
          text: line ? line.slice(r.start, r.end) : '',
          color: 'active',
          citationId: item.id,
        });
      }
    }

    setActiveCitation({ item, highlights });
  }, [etude.textLines]);

  const procedesColor: Record<string, string> = {
    'Champ lexical': 'text-emerald-400',
    'Métaphore': 'text-yellow-400',
    'Comparaison': 'text-amber-400',
    'Personnification': 'text-pink-400',
    'Antithèse': 'text-rose-400',
    'Répétition': 'text-red-400',
    'Allitération': 'text-orange-400',
    'Assonance': 'text-amber-300',
    'Rime': 'text-violet-400',
    'Présentatif': 'text-cyan-400',
    'Ponctuation': 'text-blue-400',
    'Énumération': 'text-teal-400',
    'Apostrophe': 'text-fuchsia-400',
    'Euphémisme': 'text-indigo-400',
    'Hypallage': 'text-sky-400',
    'Subordonnée': 'text-amber-500',
    'Rejet': 'text-lime-400',
    'Référence': 'text-green-400',
  };

  const getProcedeColor = (proc: string): string => {
    for (const [key, color] of Object.entries(procedesColor)) {
      if (proc.toLowerCase().includes(key.toLowerCase())) return color;
    }
    return 'text-indigo-300';
  };

  return (
    <div className="study-dashboard grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-6 min-h-0 lg:h-full">
      {/* Left: Text panel */}
      <div className="lg:col-span-3 min-h-0 flex flex-col gap-4 lg:overflow-y-auto study-scroll-panel">
        <div className="wood-panel paper-sheet rounded-lg overflow-hidden shrink-0">
          <div className="px-5 py-4 border-b border-white/5 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <BookOpen size={16} className="text-amber-400" />
            </div>
            <div>
              <div className="font-semibold text-white">{etude.title}</div>
              {etude.author && <div className="text-xs text-slate-500">{etude.author}</div>}
            </div>
            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={() => setAnnotationMode(!annotationMode)}
                className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all font-medium ${
                  annotationMode
                    ? 'text-white bg-indigo-600 border-indigo-500'
                    : 'text-indigo-300 hover:text-white bg-indigo-500/10 hover:bg-indigo-500/20 border-indigo-500/20'
                }`}
                title="Mode annotation"
              >
                <Highlighter size={14} />
                <span className="hidden sm:inline">Annoter</span>
              </button>
              <button
                onClick={() => setShowFicheModal(true)}
                className="flex items-center gap-1.5 text-xs text-amber-300 hover:text-white bg-amber-500/10 hover:bg-amber-500/20 px-3 py-1.5 rounded-lg border border-amber-500/20 transition-all font-medium"
                title="Générer et imprimer la fiche de révision"
              >
                <Printer size={14} />
                <span className="hidden sm:inline">Fiche PDF / Imprimer</span>
              </button>
              {activeCitation && (
                <button
                  onClick={() => setActiveCitation(null)}
                  className="text-xs text-slate-500 hover:text-white flex items-center gap-1 transition-colors px-2 py-1"
                >
                  <span className="hidden sm:inline">Réinitialiser</span>
                  ✕
                </button>
              )}
            </div>
          </div>

          <div className="study-poem-content px-5 py-4 lg:max-h-[calc(100dvh-10.5rem)] lg:overflow-y-auto study-scroll-panel">
            {etude.textLines.map((line, lineIdx) => {
              const lineNum = lineIdx + 1;
              const lineHighlights = highlightMap[lineIdx] || [];
              const lineAnnotations = annotationHighlightMap[lineIdx] || [];
              const words = buildWordRanges(line, lineHighlights, lineAnnotations);

              return (
                <div
                  key={lineIdx}
                  data-line-index={lineIdx}
                  className={`flex gap-4 py-1.5 group text-base leading-relaxed font-serif-literary ${
                    lineHighlights.length > 0 || lineAnnotations.length > 0 ? 'bg-indigo-950/30 rounded-lg px-2 -mx-2' : ''
                  } ${annotationMode ? 'cursor-text' : ''}`}
                  onMouseUp={handleTextSelection}
                >
                  <span className={`text-slate-600 select-none w-6 shrink-0 pt-0.5 text-sm text-right font-sans ${
                    lineHighlights.length > 0 ? 'text-indigo-400' : ''
                  }`}>
                    {lineNum}
                  </span>
                  <span className="flex-1" data-line-text>
                    {words.map((w, i) => {
                      const isAnnotation = !!w.annotation;
                      const annColor = w.annotation?.color || 'yellow';

                      if (isAnnotation) {
                        const hasNote = annotations.notes.some(n => n.id === w.annotation!.id);
                        return (
                          <mark
                            key={i}
                            className={`px-1 rounded transition-all duration-200 cursor-pointer border-b-2 ${
                              annColor === 'yellow' ? 'bg-yellow-100/60 border-yellow-400 text-ink' :
                              annColor === 'green' ? 'bg-emerald-100/60 border-emerald-400 text-ink' :
                              annColor === 'blue' ? 'bg-blue-100/60 border-blue-400 text-ink' :
                              'bg-pink-100/60 border-pink-400 text-ink'
                            } ${hasNote ? 'italic' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (w.annotation && annotationMode) {
                                openNoteModal(w.annotation);
                              }
                            }}
                            title={hasNote ? annotations.notes.find(n => n.id === w.annotation!.id)?.note : 'Cliquez pour ajouter une note'}
                          >
                            {w.text}
                          </mark>
                        );
                      }

                      if (w.highlight) {
                        return (
                          <mark
                            key={i}
                            className={`
                              px-1 rounded transition-all duration-200 cursor-pointer
                              ${activeCitation ? 'bg-indigo-500/30 border-b-2 border-indigo-400 text-white' : 'bg-amber-200/20 text-amber-100'}
                            `}
                          >
                            {w.text}
                          </mark>
                        );
                      }

                      return <span key={i}>{w.text}</span>;
                    })}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Annotation mode instructions */}
        {annotationMode && (
          <div className="wood-panel flex flex-col gap-3 px-4 py-3 border border-indigo-500/20 rounded-lg text-sm">
            <div className="flex items-center gap-3">
              <Highlighter size={16} className="text-indigo-400 shrink-0" />
              <span className="text-indigo-300">
                <strong>Mode annotation</strong> — Sélectionnez du texte pour le surligner, ou cliquez sur un surlignage pour ajouter une note.
              </span>
              <button
                onClick={() => setAnnotationMode(false)}
                className="ml-auto text-slate-500 hover:text-slate-700 p-1 rounded"
                aria-label="Fermer le mode annotation"
              >
                <X size={14} />
              </button>
            </div>
            {/* Color picker */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Couleur :</span>
              {(['yellow', 'green', 'blue', 'pink'] as const).map(color => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`w-6 h-6 rounded-full border-2 transition-all ${
                    selectedColor === color ? 'border-indigo-600 scale-110' : 'border-transparent'
                  } ${
                    color === 'yellow' ? 'bg-yellow-400' :
                    color === 'green' ? 'bg-emerald-400' :
                    color === 'blue' ? 'bg-blue-400' :
                    'bg-pink-400'
                  }`}
                  title={`Surligner en ${color}`}
                  aria-label={`Couleur ${color}`}
                />
              ))}
              {annotations.highlights.length > 0 && (
                <span className="ml-auto text-xs text-slate-500">
                  {annotations.highlights.length} surlignage{annotations.highlights.length > 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Interactive instructions */}
        {activeCitation && !annotationMode && (
          <div className="wood-panel flex items-center gap-3 px-4 py-3 border border-indigo-500/20 rounded-lg text-sm">
            <MousePointerClick size={16} className="text-indigo-400 shrink-0" />
            <span className="text-indigo-300">
              Cliquez sur un <strong>mot en surbrillance</strong> pour voir son analyse. Sélectionnez une citation dans le panneau de droite.
            </span>
          </div>
        )}
      </div>

      {/* Right: Citations panel */}
      <div className="lg:col-span-2 min-h-0 flex flex-col gap-4 lg:overflow-y-auto study-scroll-panel">
        <div className="flex items-center gap-2 mb-0 shrink-0">
          <Microscope size={18} className="text-indigo-400" />
          <h2 className="font-semibold text-white">Analyse littéraire</h2>
          {etude.movements.length > 0 && (
            <span className="ml-auto text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded-lg">
              {etude.movements.reduce((acc, m) => acc + m.citations.length, 0)} citations
            </span>
          )}
        </div>

        <div className="space-y-4">
        {etude.movements.map(movement => {
          const isExpanded = expandedMovements.has(movement.id);
          return (
            <div key={movement.id} className="wood-panel border border-white/6 rounded-sm overflow-hidden">
              <button
                onClick={() => toggleMovement(movement.id)}
                className="wood-rail w-full flex items-center gap-3 px-4 py-3 hover:bg-white/3 transition-colors"
              >
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                  isExpanded ? 'bg-indigo-600 rotate-0' : 'bg-slate-700'
                }`}>
                  {isExpanded ? <ChevronDown size={14} className="text-white" /> : <ChevronRight size={14} className="text-slate-400" />}
                </div>
                <Layers size={16} className="text-indigo-400" />
                <span className="font-medium text-sm text-slate-200 text-left flex-1">{movement.title}</span>
                <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded-lg">
                  {movement.citations.length}
                </span>
              </button>

              {isExpanded && (
                <div className="border-t border-white/5">
                  {movement.citations.map(citation => {
                    const isActive = activeCitation?.item.id === citation.id;
                    return (
                      <button
                        key={citation.id}
                        onClick={() => selectCitation(citation)}
                        className={`annotation-slip w-full text-left px-4 py-3 border-b border-white/3 last:border-b-0 transition-all duration-150 ${
                          isActive
                            ? 'bg-indigo-950/50 border-l-2 border-l-indigo-500'
                            : 'hover:bg-white/3'
                        }`}
                      >
                        <div className="flex items-start gap-2 mb-1">
                          <Quote size={12} className="text-slate-500 mt-1 shrink-0" />
                          <span className="text-sm text-slate-300 leading-snug line-clamp-2">
                            {citation.citation}
                          </span>
                        </div>
                        <div className={`text-xs font-medium ml-4 ${getProcedeColor(citation.procede)}`}>
                          {citation.procede}
                        </div>
                        {isActive && (
                          <div className="mt-2 ml-4 text-xs text-slate-400 leading-relaxed border-l-2 border-slate-700 pl-3">
                            {citation.interpretation}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
        </div>
      </div>

      {showFicheModal && (
        <FicheRevisionModal etude={etude} onClose={() => setShowFicheModal(false)} />
      )}

      {/* Note modal for annotations */}
      {noteModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[#3b2a21]/20 p-4 backdrop-blur-sm sm:p-8">
          <div className="rustic-modal my-4 w-full max-w-md rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-ink text-lg">Ajouter une note</h3>
              <button
                onClick={() => setNoteModal(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                aria-label="Fermer"
              >
                <X size={18} />
              </button>
            </div>
            <div className="mb-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="text-xs text-slate-500 mb-1">Texte surligné</div>
              <div className="text-sm text-ink italic">"{noteModal.highlight.text}"</div>
            </div>
            <textarea
              value={noteModal.noteText}
              onChange={e => setNoteModal(prev => prev ? { ...prev, noteText: e.target.value } : null)}
              placeholder="Écrivez votre note ici..."
              className="paper-input w-full h-24 p-3 text-sm resize-none"
              autoFocus
            />
            <div className="flex items-center gap-2 mt-4">
              <button
                onClick={saveNote}
                className="copper-action flex items-center gap-2 px-4 py-2 text-white rounded-lg text-sm font-medium"
              >
                <Check size={14} /> Enregistrer
              </button>
              <button
                onClick={() => setNoteModal(null)}
                className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800"
              >
                Annuler
              </button>
              <button
                onClick={() => deleteHighlight(noteModal.highlight.id)}
                className="ml-auto text-sm text-red-500 hover:text-red-700 flex items-center gap-1"
              >
                <Trash2 size={13} /> Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}