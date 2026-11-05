import { useState, useEffect } from 'react';
import { Plus, Trash2, ChevronUp, ChevronDown, CheckCircle2, AlertTriangle, X, Highlighter } from 'lucide-react';
import { CitationItem, CitationExcerpt } from '../types/etude';
import { findCitationRangesInPoem, getCitationQuotes, makeExcerptId } from '../utils/citationUtils';

interface ExcerptEditorProps {
  citation: CitationItem;
  textLines: string[];
  onChange: (citation: CitationItem) => void;
}

export default function ExcerptEditor({ citation, textLines, onChange }: ExcerptEditorProps) {
  const [highlightingExcerpt, setHighlightingExcerpt] = useState<string | null>(null);
  const [pendingPosition, setPendingPosition] = useState<{
    excerptId: string;
    text: string;
    lineIndex: number;
    start: number;
    end: number;
  } | null>(null);

  // Excerpts: prefer citation.excerpts (stable IDs from parent), otherwise derive
  // from citation text. Use useState so derived excerpts keep STABLE IDs across
  // re-renders — without this, makeExcerptId() generates new random IDs every
  // render, which broke highlight saving (excerpt ID wouldn't match on validate).
  const [excerpts, setExcerpts] = useState<CitationExcerpt[]>(() => {
    if (citation.excerpts?.length) return citation.excerpts;
    return getCitationQuotes(citation).map(text => ({ id: makeExcerptId(), text }));
  });

  // Re-sync when the parent saves excerpts back to citation.excerpts
  useEffect(() => {
    if (citation.excerpts?.length) {
      setExcerpts(citation.excerpts);
    }
  }, [citation.excerpts]);

  // Build a single excerpt with new text/positions
  const buildExcerpt = (
    baseExcerpts: CitationExcerpt[],
    overrideIndex: number,
    text: string,
    lineIndex?: number,
    start?: number,
    end?: number
  ): CitationExcerpt[] =>
    baseExcerpts.map((ex, i) => {
      if (i !== overrideIndex) return ex;
      return {
        ...ex,
        text,
        lineIndex: lineIndex !== undefined ? lineIndex : ex.lineIndex,
        start: start !== undefined ? start : ex.start,
        end: end !== undefined ? end : ex.end,
      };
    });

  // Called when user types in the excerpt input — just update the text
  const updateExcerptText = (index: number, text: string) => {
    const next = buildExcerpt(excerpts, index, text);
    onChange({ ...citation, excerpts: next, quotes: next.map(e => e.text).filter(Boolean), matchedRanges: undefined });
  };

  // Add a new empty excerpt
  const add = () => {
    const next = [...excerpts, { id: makeExcerptId(), text: '' }];
    onChange({ ...citation, excerpts: next, quotes: next.map(e => e.text).filter(Boolean), matchedRanges: undefined });
  };

  // Remove an excerpt
  const remove = (index: number) => {
    const next = excerpts.filter((_, i) => i !== index);
    onChange({ ...citation, excerpts: next, quotes: next.map(e => e.text).filter(Boolean), matchedRanges: undefined });
  };

  // Move an excerpt up/down
  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= excerpts.length) return;
    const next = [...excerpts];
    [next[index], next[target]] = [next[target], next[index]];
    onChange({ ...citation, excerpts: next, quotes: next.map(e => e.text).filter(Boolean), matchedRanges: undefined });
  };

  // === Manual highlight flow ===

  // Called when user clicks "surligner manuellement" on an excerpt
  const startHighlighting = (excerptId: string) => {
    setHighlightingExcerpt(excerptId);
    setPendingPosition(null); // reset any previous pending position
  };

  // Called when user selects text in the poem modal
  const handleTextSelection = () => {
    if (!highlightingExcerpt) return;

    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;

    const originalText = selection.toString();
    const trimmedText = originalText.trim();
    if (!trimmedText) return;

    const range = selection.getRangeAt(0);
    const container = range.commonAncestorContainer;
    const lineElement = container.parentElement?.closest('[data-poem-line]') as HTMLElement | null;

    if (!lineElement) return;

    const lineIndex = parseInt(lineElement.dataset.poemLine || '0', 10);
    if (textLines[lineIndex] === undefined) return;

    // Find the text content element (span WITHOUT the line number)
    const textContentElement = lineElement.querySelector('[data-poem-line-text]') as HTMLElement | null;
    if (!textContentElement) return;

    // Calculate offsets relative to the text-only element (excludes line number)
    const preSelectionRange = document.createRange();
    preSelectionRange.selectNodeContents(textContentElement);
    preSelectionRange.setEnd(range.startContainer, range.startOffset);
    const start = preSelectionRange.toString().length;
    const end = start + originalText.length; // Use originalText.length, NOT trimmed!

    // Store pending position — do NOT call onChange yet
    setPendingPosition({
      excerptId: highlightingExcerpt,
      text: trimmedText,
      lineIndex,
      start,
      end,
    });
  };

  // Called when user clicks "Valider le surlignage"
  const validateHighlight = () => {
    if (!pendingPosition) {
      setHighlightingExcerpt(null);
      return;
    }

    const excerptIndex = excerpts.findIndex(e => e.id === pendingPosition.excerptId);
    if (excerptIndex >= 0) {
      const next = buildExcerpt(
        excerpts,
        excerptIndex,
        pendingPosition.text,
        pendingPosition.lineIndex,
        pendingPosition.start,
        pendingPosition.end
      );
      onChange({ ...citation, excerpts: next, quotes: next.map(e => e.text).filter(Boolean), matchedRanges: undefined });
    }

    // Always reset state after validation
    setPendingPosition(null);
    setHighlightingExcerpt(null);
  };

  // Called when user clicks "Annuler" or X
  const cancelHighlight = () => {
    setPendingPosition(null);
    setHighlightingExcerpt(null);
  };

  // === Render excerpts ===

  const foundRangesByExcerpt: Record<string, ReturnType<typeof findCitationRangesInPoem>> = {};
  excerpts.forEach(excerpt => {
    if (excerpt.text.trim()) {
      foundRangesByExcerpt[excerpt.id] = findCitationRangesInPoem(
        textLines,
        excerpt.text,
        citation.verses,
        citation.procede
      );
    }
  });

  return (
    <div className="pl-5 space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs text-slate-500 font-medium">Extraits associés</label>
        <button type="button" onClick={add} className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
          <Plus size={12} /> Ajouter
        </button>
      </div>

      {excerpts.map((excerpt, index) => {
        const autoRanges = foundRangesByExcerpt[excerpt.id] || [];
        const hasManualPos = excerpt.lineIndex !== undefined && excerpt.start !== undefined && excerpt.end !== undefined;
        const found = autoRanges.length > 0 || hasManualPos;
        const isHighlighting = highlightingExcerpt === excerpt.id;
        const pendingExcerpt = pendingPosition?.excerptId === excerpt.id;

        return (
          <div key={excerpt.id} className="space-y-1">
            <div className="flex items-center gap-1.5">
              {found ? (
                <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle size={13} className="text-amber-600 shrink-0" />
              )}
              <button
                type="button"
                onClick={() => startHighlighting(excerpt.id)}
                className="p-0.5 rounded hover:bg-amber-500/10 transition-colors"
                title={found ? "Resurligner manuellement" : "Cliquer pour surligner manuellement dans le poème"}
              >
                <Highlighter size={13} className="text-amber-500 shrink-0" />
              </button>
              <input
                value={excerpt.text}
                onChange={e => updateExcerptText(index, e.target.value)}
                placeholder="Extrait exact du poème"
                className="paper-input min-w-0 flex-1 rounded-lg border px-3 py-1.5 text-xs"
              />
              <button type="button" onClick={() => move(index, -1)} disabled={index === 0} className="p-1 text-slate-500 disabled:opacity-30" aria-label="Monter"><ChevronUp size={13} /></button>
              <button type="button" onClick={() => move(index, 1)} disabled={index === excerpts.length - 1} className="p-1 text-slate-500 disabled:opacity-30" aria-label="Descendre"><ChevronDown size={13} /></button>
              <button type="button" onClick={() => remove(index)} className="p-1 text-slate-500 hover:text-red-500" aria-label="Supprimer"><Trash2 size={13} /></button>
            </div>

            {hasManualPos && (
              <div className="ml-5 text-[10px] text-amber-600 flex items-center gap-1">
                <Highlighter size={10} />
                <span>
                  Surlignage manuel: vers {excerpt.lineIndex! + 1}
                  {` (car. ${excerpt.start}-${excerpt.end})`}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const autoRange = autoRanges[0];
                    if (autoRange) {
                      // Revert to the original text from auto-detection
                      const originalText = textLines[autoRange.lineIndex].substring(autoRange.start, autoRange.end);
                      const next = buildExcerpt(excerpts, index, originalText, autoRange.lineIndex, autoRange.start, autoRange.end);
                      onChange({ ...citation, excerpts: next, quotes: next.map(e => e.text).filter(Boolean), matchedRanges: undefined });
                    }
                    // Reset manual highlighting state
                    setPendingPosition(null);
                  }}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-700 transition-colors"
                >
                  Réinitialiser surlignage
                </button>
              </div>
            )}

            {pendingExcerpt && (
              <div className="ml-5 text-[10px] text-amber-500 flex items-center gap-1 animate-pulse">
                <Highlighter size={10} />
                <span>Position en attente de validation…</span>
              </div>
            )}
          </div>
        );
      })}

      {/* Manual highlight selection modal */}
      {highlightingExcerpt && (() => {
        const excerpt = excerpts.find(e => e.id === highlightingExcerpt);
        const pending = pendingPosition?.excerptId === highlightingExcerpt ? pendingPosition : null;
        return (
          <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#3b2a21]/50 backdrop-blur-sm p-4">
            <div className="rustic-modal rounded-2xl p-5 max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-amber-400">
                  <Highlighter size={16} />
                  <span className="font-medium text-white">Surligner manuellement</span>
                </div>
                <button
                  onClick={cancelHighlight}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-700 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <p className="text-xs text-slate-400 mb-3">
                Sélectionnez le texte correspondant à «&nbsp;{excerpt?.text || 'cet extrait'}&nbsp;» dans le poème ci-dessous.
              </p>

              <div
                className="flex-1 overflow-y-auto bg-slate-900/60 rounded-lg p-4 font-serif-literary text-base leading-relaxed"
                onMouseUp={handleTextSelection}
              >
                {textLines.map((line, lineIdx) => (
                  <div
                    key={lineIdx}
                    data-poem-line={lineIdx}
                    className="flex gap-4 py-1.5 cursor-text hover:bg-amber-500/5 px-2 rounded transition-colors"
                  >
                    <span className="text-slate-600 select-none w-6 shrink-0 text-right text-sm">
                      {lineIdx + 1}
                    </span>
                    <span className="flex-1 text-slate-200" data-poem-line-text>
                      {pending?.lineIndex === lineIdx ? (
                        <>
                          {line.slice(0, pending.start)}
                          <mark className="bg-amber-400/50 text-white rounded px-0.5">
                            {line.slice(pending.start, pending.end)}
                          </mark>
                          {line.slice(pending.end)}
                        </>
                      ) : (
                        line
                      )}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-3 flex items-center justify-between text-xs">
                <span className="text-slate-500">Cliquez et glissez pour sélectionner</span>
                <div className="flex gap-2">
                  <button
                    onClick={cancelHighlight}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={validateHighlight}
                    disabled={!pending}
                    className="px-3 py-1.5 rounded-lg copper-action text-white hover:opacity-90 transition-colors disabled:opacity-50"
                  >
                    Valider le surlignage
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
