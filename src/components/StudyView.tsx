import { useState, useCallback, useMemo } from 'react';
import { CitationItem, Movement, EtudeLineaire } from '../types/etude';
import {
  ChevronDown, ChevronRight, CheckCircle2, Quote,
  Layers, Info, MousePointerClick, BookOpen, Microscope
} from 'lucide-react';

interface StudyViewProps {
  etude: EtudeLineaire;
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

export default function StudyView({ etude }: StudyViewProps) {
  const [activeCitation, setActiveCitation] = useState<ActiveCitation | null>(null);
  const [expandedMovements, setExpandedMovements] = useState<Set<string>>(
    new Set(etude.movements.map(m => m.id))
  );

  const toggleMovement = (id: string) => {
    setExpandedMovements(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

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

  // Build word-level info for each line
  const buildWordRanges = useCallback((text: string, highlights: Highlight[]): Array<{ text: string; highlight?: Highlight }> => {
    if (highlights.length === 0) return [{ text }];

    const ranges: Array<{ text: string; highlight?: Highlight }> = [];
    let lastEnd = 0;

    // Sort highlights by start
    const sorted = [...highlights].sort((a, b) => a.start - b.start);

    for (const h of sorted) {
      if (h.start > lastEnd) {
        ranges.push({ text: text.slice(lastEnd, h.start) });
      }
      ranges.push({ text: text.slice(h.start, h.end), highlight: h });
      lastEnd = h.end;
    }

    if (lastEnd < text.length) {
      ranges.push({ text: text.slice(lastEnd) });
    }

    return ranges;
  }, []);

  const selectCitation = useCallback((item: CitationItem) => {
    const highlights: Highlight[] = [];

    // Find matching ranges in the text lines
    for (const quote of item.quotes) {
      const normalizedQuote = quote.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
      for (let lineIdx = 0; lineIdx < etude.textLines.length; lineIdx++) {
        const line = etude.textLines[lineIdx];
        const normalizedLine = line.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
        const idx = normalizedLine.indexOf(normalizedQuote);
        if (idx !== -1) {
          highlights.push({
            lineIndex: lineIdx,
            start: idx,
            end: idx + quote.length,
            text: line.slice(idx, idx + quote.length),
            color: 'active',
            citationId: item.id,
          });
        }
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
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* Left: Text panel */}
      <div className="lg:col-span-3 space-y-6">
        <div className="wood-panel paper-sheet rounded-lg overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <BookOpen size={16} className="text-amber-400" />
            </div>
            <div>
              <div className="font-semibold text-white">{etude.title}</div>
              {etude.author && <div className="text-xs text-slate-500">{etude.author}</div>}
            </div>
            {activeCitation && (
              <button
                onClick={() => setActiveCitation(null)}
                className="ml-auto text-xs text-slate-500 hover:text-white flex items-center gap-1 transition-colors"
              >
                <span className="hidden sm:inline">Réinitialiser</span>
                ✕
              </button>
            )}
          </div>

          <div className="px-5 py-4">
            {etude.textLines.map((line, lineIdx) => {
              const lineNum = lineIdx + 1;
              const lineHighlights = highlightMap[lineIdx] || [];
              const words = buildWordRanges(line, lineHighlights);

              return (
                <div
                  key={lineIdx}
                  className={`flex gap-4 py-1.5 group text-base leading-relaxed font-serif-literary ${
                    lineHighlights.length > 0 ? 'bg-indigo-950/30 rounded-lg px-2 -mx-2' : ''
                  }`}
                >
                  <span className={`text-slate-600 select-none w-6 shrink-0 pt-0.5 text-sm text-right font-sans ${
                    lineHighlights.length > 0 ? 'text-indigo-400' : ''
                  }`}>
                    {lineNum}
                  </span>
                  <span className="flex-1">
                    {words.map((w, i) =>
                      w.highlight ? (
                        <mark
                          key={i}
                          className={`
                            px-1 rounded transition-all duration-200 cursor-pointer
                            ${activeCitation ? 'bg-indigo-500/30 border-b-2 border-indigo-400 text-white' : 'bg-amber-200/20 text-amber-100'}
                          `}
                          onClick={() => {
                            if (activeCitation) {
                              // Could highlight from here too
                            }
                          }}
                        >
                          {w.text}
                        </mark>
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

        {/* Interactive instructions */}
        {activeCitation && (
          <div className="wood-panel flex items-center gap-3 px-4 py-3 border border-indigo-500/20 rounded-lg text-sm">
            <MousePointerClick size={16} className="text-indigo-400 shrink-0" />
            <span className="text-indigo-300">
              Cliquez sur un <strong>mot en surbrillance</strong> pour voir son analyse. Sélectionnez une citation dans le panneau de droite.
            </span>
          </div>
        )}
      </div>

      {/* Right: Citations panel */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Microscope size={18} className="text-indigo-400" />
          <h2 className="font-semibold text-white">Analyse littéraire</h2>
          {etude.movements.length > 0 && (
            <span className="ml-auto text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded-lg">
              {etude.movements.reduce((acc, m) => acc + m.citations.length, 0)} citations
            </span>
          )}
        </div>

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
  );
}