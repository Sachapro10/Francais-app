import { Plus, Trash2, ChevronUp, ChevronDown, CheckCircle2, AlertTriangle } from 'lucide-react';
import { CitationItem } from '../types/etude';
import { findCitationRangesInPoem, getCitationQuotes, makeExcerptId } from '../utils/citationUtils';

interface ExcerptEditorProps {
  citation: CitationItem;
  textLines: string[];
  onChange: (citation: CitationItem) => void;
}

export default function ExcerptEditor({ citation, textLines, onChange }: ExcerptEditorProps) {
  const excerpts = citation.excerpts?.length
    ? citation.excerpts
    : getCitationQuotes(citation).map(text => ({ id: makeExcerptId(), text }));

  const update = (index: number, text: string) => {
    const next = excerpts.map((excerpt, excerptIndex) => excerptIndex === index ? { ...excerpt, text } : excerpt);
    onChange({ ...citation, excerpts: next, quotes: next.map(excerpt => excerpt.text).filter(Boolean), matchedRanges: undefined });
  };

  const add = () => {
    const next = [...excerpts, { id: makeExcerptId(), text: '' }];
    onChange({ ...citation, excerpts: next, quotes: next.map(excerpt => excerpt.text).filter(Boolean), matchedRanges: undefined });
  };

  const remove = (index: number) => {
    const next = excerpts.filter((_, excerptIndex) => excerptIndex !== index);
    onChange({ ...citation, excerpts: next, quotes: next.map(excerpt => excerpt.text).filter(Boolean), matchedRanges: undefined });
  };

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= excerpts.length) return;
    const next = [...excerpts];
    [next[index], next[target]] = [next[target], next[index]];
    onChange({ ...citation, excerpts: next, quotes: next.map(excerpt => excerpt.text).filter(Boolean), matchedRanges: undefined });
  };

  const syncCitationPreview = () => {
    const parts = excerpts.filter(excerpt => excerpt.text.trim()).map(excerpt => `« ${excerpt.text.trim()} »`);
    const citationText = parts.join(' / ');
    onChange({ ...citation, citation: citationText || citation.citation, quotes: excerpts.map(excerpt => excerpt.text).filter(Boolean), matchedRanges: undefined });
  };

  return (
    <div className="pl-5 space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs text-slate-500 font-medium">Extraits associés</label>
        <button type="button" onClick={add} className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"><Plus size={12} /> Ajouter</button>
      </div>
      {excerpts.map((excerpt, index) => {
        const found = excerpt.text.trim() && findCitationRangesInPoem(textLines, excerpt.text, citation.verses, citation.procede).length > 0;
        return (
          <div key={excerpt.id} className="flex items-center gap-1.5">
            {found ? <CheckCircle2 size={13} className="text-emerald-600 shrink-0" /> : <AlertTriangle size={13} className="text-amber-600 shrink-0" />}
            <input
              value={excerpt.text}
              onChange={event => update(index, event.target.value)}
              onBlur={syncCitationPreview}
              placeholder="Extrait exact du poème"
              className="paper-input min-w-0 flex-1 rounded-lg border px-3 py-1.5 text-xs"
            />
            <button type="button" onClick={() => move(index, -1)} disabled={index === 0} className="p-1 text-slate-500 disabled:opacity-30" aria-label="Monter"><ChevronUp size={13} /></button>
            <button type="button" onClick={() => move(index, 1)} disabled={index === excerpts.length - 1} className="p-1 text-slate-500 disabled:opacity-30" aria-label="Descendre"><ChevronDown size={13} /></button>
            <button type="button" onClick={() => remove(index)} className="p-1 text-slate-500 hover:text-red-500" aria-label="Supprimer"><Trash2 size={13} /></button>
          </div>
        );
      })}
      <p className="text-[11px] text-slate-500">Chaque extrait doit correspondre exactement à un passage du poème.</p>
    </div>
  );
}
