import { useState, useMemo } from 'react';
import { EtudeLineaire, CitationItem, Movement } from '../types/etude';
import { deriveCitationQuotes, parseVersesInput } from '../utils/citationUtils';
import { checkEtudeQuality } from '../utils/qualityChecks';
import QualityWarnings from './QualityWarnings';
import ExcerptEditor from './ExcerptEditor';
import {
  Edit3, Plus, Trash2, Save, ChevronDown, ChevronRight,
  Layers, Quote, CheckCircle2
} from 'lucide-react';

interface EditorViewProps {
  etude: EtudeLineaire;
  onSave: (e: EtudeLineaire) => void;
}

export default function EditorView({ etude, onSave }: EditorViewProps) {
  const [local, setLocal] = useState<EtudeLineaire>(JSON.parse(JSON.stringify(etude)));
  const [saved, setSaved] = useState(false);
  const [expandedMovements, setExpandedMovements] = useState<Set<string>>(
    new Set(local.movements.map(m => m.id))
  );

  const qualityWarnings = useMemo(() => checkEtudeQuality(local), [local]);

  const toggleMovement = (id: string) => {
    setExpandedMovements(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const updateTitle = (v: string) => setLocal(l => ({ ...l, title: v }));
  const updateTextLines = (v: string) => setLocal(l => ({ ...l, textLines: v.split('\n').filter(l => l.trim()) }));

  const addMovement = () => {
    const newMovement: Movement = {
      id: 'm_' + Math.random().toString(36).substring(2, 9),
      title: 'Nouveau mouvement',
      citations: [],
    };
    setLocal(l => ({ ...l, movements: [...l.movements, newMovement] }));
    setExpandedMovements(prev => new Set([...prev, newMovement.id]));
  };

  const removeMovement = (id: string) => {
    setLocal(l => ({ ...l, movements: l.movements.filter(m => m.id !== id) }));
  };

  const updateMovementTitle = (id: string, title: string) => {
    setLocal(l => ({
      ...l,
      movements: l.movements.map(m => m.id === id ? { ...m, title } : m),
    }));
  };

  const addCitation = (movementId: string) => {
    const newCitation: CitationItem = {
      id: 'c_' + Math.random().toString(36).substring(2, 9),
      citation: 'Nouvelle citation',
      procede: 'Procédé',
      interpretation: 'Interprétation',
      verses: [],
      quotes: [],
      movementId,
    };
    setLocal(l => ({
      ...l,
      movements: l.movements.map(m =>
        m.id === movementId ? { ...m, citations: [...m.citations, newCitation] } : m
      ),
    }));
  };

  const removeCitation = (movementId: string, citationId: string) => {
    setLocal(l => ({
      ...l,
      movements: l.movements.map(m =>
        m.id === movementId ? { ...m, citations: m.citations.filter(c => c.id !== citationId) } : m
      ),
    }));
  };

  const updateCitationObject = (movementId: string, citationId: string, updatedCitation: CitationItem) => {
    setLocal(l => ({
      ...l,
      movements: l.movements.map(m =>
        m.id === movementId
          ? {
              ...m,
              citations: m.citations.map(c => c.id === citationId ? updatedCitation : c),
            }
          : m
      ),
    }));
  };

  const updateCitation = (movementId: string, citationId: string, field: keyof CitationItem, value: string) => {
    setLocal(l => ({
      ...l,
      movements: l.movements.map(m =>
        m.id === movementId
          ? {
              ...m,
              citations: m.citations.map(c =>
                c.id === citationId
                  ? field === 'citation'
                    ? { ...c, citation: value, quotes: deriveCitationQuotes(value), matchedRanges: undefined }
                    : { ...c, [field]: field === 'verses' ? parseVersesInput(value) : value }
                  : c
              ),
            }
          : m
      ),
    }));
  };

  const save = () => {
    onSave(local);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 rustic-workbench">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="wood-icon w-10 h-10 rounded-lg flex items-center justify-center">
            <Edit3 size={20} className="text-white" />
          </div>
          <div>
            <div className="font-semibold text-white">Éditeur</div>
            <div className="text-xs text-slate-500">Modifier le contenu</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {saved && (
            <div className="flex items-center gap-2 text-emerald-400 text-sm bg-emerald-500/10 px-3 py-1.5 rounded-xl animate-pulse">
              <CheckCircle2 size={14} /> Sauvegardé
            </div>
          )}
          <button
            onClick={save}
            className="copper-action flex items-center gap-2 px-4 py-2 text-white rounded-lg font-medium transition-all"
          >
            <Save size={16} /> Enregistrer
          </button>
        </div>
      </div>

      <QualityWarnings warnings={qualityWarnings} />

      {/* Meta fields */}
      <div className="wood-panel rounded-lg p-5 space-y-4">
        <div>
          <label className="block text-xs uppercase tracking-wider text-slate-500 mb-1.5 font-semibold">Titre de l'étude</label>
          <input
            value={local.title}
            onChange={e => updateTitle(e.target.value)}
            className="paper-input w-full border rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wider text-slate-500 mb-1.5 font-semibold">Auteur (optionnel)</label>
          <input
            value={local.author || ''}
            onChange={e => setLocal(l => ({ ...l, author: e.target.value }))}
            placeholder="Arthur Rimbaud"
            className="paper-input w-full border rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none transition-colors placeholder:text-slate-600"
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wider text-slate-500 mb-1.5 font-semibold">Texte littéraire (un vers par ligne)</label>
          <textarea
            value={local.textLines.join('\n')}
            onChange={e => updateTextLines(e.target.value)}
            rows={8}
            className="paper-input w-full border rounded-lg px-4 py-2.5 text-white text-sm font-serif-literary focus:outline-none transition-colors resize-none"
          />
        </div>
      </div>

      {/* Movements */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <Layers size={16} className="text-indigo-400" />
            Mouvements / Axes
          </h3>
          <button
            onClick={addMovement}
            className="flex items-center gap-1.5 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            <Plus size={14} /> Ajouter un mouvement
          </button>
        </div>

        {local.movements.map(movement => {
          const isExpanded = expandedMovements.has(movement.id);
          return (
            <div key={movement.id} className="wood-panel border border-white/6 rounded-lg overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5">
                <button onClick={() => toggleMovement(movement.id)} className="text-slate-400 hover:text-white">
                  {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>
                <Layers size={14} className="text-indigo-400" />
                <input
                  value={movement.title}
                  onChange={e => updateMovementTitle(movement.id, e.target.value)}
                  className="flex-1 bg-transparent text-sm font-medium text-white focus:outline-none border-b border-transparent focus:border-indigo-500/60 transition-colors pb-0.5"
                />
                <span className="text-xs text-slate-500">{movement.citations.length}</span>
                <button
                  onClick={() => removeMovement(movement.id)}
                  className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              {isExpanded && (
                <div className="divide-y divide-white/5">
                  {movement.citations.map(citation => (
                    <div key={citation.id} className="px-4 py-3 space-y-2.5">
                      <div className="flex items-start gap-2">
                        <Quote size={12} className="text-slate-600 mt-2.5 shrink-0" />
                        <textarea
                          value={citation.citation}
                          onChange={e => updateCitation(movement.id, citation.id, 'citation', e.target.value)}
                          rows={2}
                          className="flex-1 bg-slate-800/60 border border-white/6 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50 resize-none"
                        />
                        <button
                          onClick={() => removeCitation(movement.id, citation.id)}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-all shrink-0 mt-1"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2 pl-5">
                        <div>
                          <label className="text-xs text-slate-500 font-medium">Procédé</label>
                          <input
                            value={citation.procede}
                            onChange={e => updateCitation(movement.id, citation.id, 'procede', e.target.value)}
                            className="w-full bg-slate-800/60 border border-white/6 rounded-lg px-3 py-1.5 text-sm text-indigo-200 focus:outline-none focus:border-indigo-500/50"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-slate-500 font-medium">Vers</label>
                          <input
                            value={(citation.verses || []).join(', ')}
                            onChange={e => updateCitation(movement.id, citation.id, 'verses', e.target.value)}
                            placeholder="1, 2, 3"
                            className="w-full bg-slate-800/60 border border-white/6 rounded-lg px-3 py-1.5 text-sm text-slate-300 focus:outline-none focus:border-indigo-500/50"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="text-xs text-slate-500 font-medium">Interprétation</label>
                          <textarea
                            value={citation.interpretation}
                            onChange={e => updateCitation(movement.id, citation.id, 'interpretation', e.target.value)}
                            rows={2}
                            className="w-full bg-slate-800/60 border border-white/6 rounded-lg px-3 py-1.5 text-sm text-slate-300 focus:outline-none focus:border-indigo-500/50 resize-none"
                          />
                        </div>
                      </div>
                      <ExcerptEditor
                        citation={citation}
                        textLines={local.textLines}
                        onChange={nextCitation => updateCitationObject(movement.id, citation.id, nextCitation)}
                      />
                    </div>
                  ))}
                  <button
                    onClick={() => addCitation(movement.id)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 text-sm text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/5 transition-all"
                  >
                    <Plus size={14} /> Ajouter une citation
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}