import { useState, useCallback, useRef } from 'react';
import { EtudeLineaire, Movement, CitationItem } from '../types/etude';
import { detectProcede, ALL_PROCEDES } from '../utils/procedeDetector';
import {
  Plus, Trash2, Save, ChevronDown, ChevronRight, ChevronLeft, Layers,
  BookOpen, AlertCircle, Sparkles, Wand2, ChevronUp,
  RotateCcw, Eye, EyeOff, Info, X, CheckCircle2, GripVertical
} from 'lucide-react';

interface NewTextFormProps {
  onSave: (etude: EtudeLineaire) => void;
  onCancel: () => void;
}

function generateId() {
  return 'id_' + Math.random().toString(36).substring(2, 11);
}

const STEPS = [
  { id: 'info', label: 'Informations' },
  { id: 'text', label: 'Texte' },
  { id: 'movements', label: 'Mouvements' },
];

export default function NewTextForm({ onSave, onCancel }: NewTextFormProps) {
  const [step, setStep] = useState('info');
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [problematic, setProblematic] = useState('');
  const [movements, setMovements] = useState<Movement[]>([]);
  const [textLines, setTextLines] = useState<string[]>([]);
  const [autoDetectEnabled, setAutoDetectEnabled] = useState(true);
  const [draggedItem, setDraggedItem] = useState<{ mvIdx: number; ciIdx: number } | null>(null);

  // --- Text lines ---
  const updateTextLines = (raw: string) => {
    const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);
    setTextLines(lines);
  };

  // --- Movements ---
  const addMovement = () => {
    setMovements(prev => [...prev, {
      id: generateId(),
      title: `Mouvement ${prev.length + 1}`,
      citations: [],
    }]);
  };

  const removeMovement = (id: string) => {
    setMovements(prev => prev.filter(m => m.id !== id));
  };

  const updateMovementTitle = (id: string, title: string) => {
    setMovements(prev => prev.map(m => m.id === id ? { ...m, title } : m));
  };

  // --- Citations ---
  const addCitation = (movementId: string) => {
    setMovements(prev => prev.map(m =>
      m.id === movementId ? {
        ...m,
        citations: [...m.citations, {
          id: generateId(),
          citation: '',
          procede: '',
          interpretation: '',
          verses: [],
          quotes: [],
          movementId,
        }]
      } : m
    ));
  };

  const removeCitation = (movementId: string, citationId: string) => {
    setMovements(prev => prev.map(m =>
      m.id === movementId ? {
        ...m, citations: m.citations.filter(c => c.id !== citationId)
      } : m
    ));
  };

  const updateCitation = (movementId: string, citationId: string, field: keyof CitationItem, value: string | number[]) => {
    setMovements(prev => prev.map(m =>
      m.id === movementId ? {
        ...m,
        citations: m.citations.map(c =>
          c.id === citationId ? { ...c, [field]: value } : c
        ),
      } : m
    ));
  };

  const autoDetectProcede = useCallback((movementId: string, citationId: string, rawProcede: string) => {
    const { detected, confidence } = detectProcede(rawProcede);
    updateCitation(movementId, citationId, 'procede', detected);
    return { detected, confidence };
  }, []);

  const handleProcedeChange = (movementId: string, citationId: string, rawValue: string) => {
    if (!autoDetectEnabled) {
      updateCitation(movementId, citationId, 'procede', rawValue);
      return;
    }
    const { detected } = autoDetectProcede(movementId, citationId, rawValue);
    return detected;
  };

  // --- Drag & Drop reorder ---
  const handleDragStart = (mvIdx: number, ciIdx: number) => {
    setDraggedItem({ mvIdx, ciIdx });
  };
  const handleDragOver = (e: React.DragEvent, mvIdx: number, ciIdx: number) => {
    e.preventDefault();
    if (!draggedItem || draggedItem.mvIdx !== mvIdx) return;
    setMovements(prev => {
      const mv = prev[mvIdx];
      const from = draggedItem.ciIdx;
      const to = ciIdx;
      if (from === to) return prev;
      const newCitations = [...mv.citations];
      const [moved] = newCitations.splice(from, 1);
      newCitations.splice(to, 0, moved);
      return prev.map((m, i) => i === mvIdx ? { ...m, citations: newCitations } : m);
    });
    setDraggedItem({ mvIdx, ciIdx });
  };
  const handleDragEnd = () => setDraggedItem(null);

  const canProceed = {
    info: !!title.trim(),
    text: textLines.length > 0,
    movements: movements.length > 0 && movements.every(m => m.citations.length > 0),
  };

  const handleSave = () => {
    const etude: EtudeLineaire = {
      title: title.trim(),
      author: author.trim() || undefined,
      textLines,
      movements: movements.map(m => ({
        ...m,
        citations: m.citations.map(c => {
          // Extract verses from citation text like (v.1) / (v.5-9)
          const verses: number[] = [];
          const verseMatches = [...(c.citation || '').matchAll(/\(v\.?\s*(\d+)(?:\s*[-–—]\s*(\d+))?\)/gi)];
          for (const match of verseMatches) {
            const start = parseInt(match[1], 10);
            const end = match[2] ? parseInt(match[2], 10) : start;
            for (let v = start; v <= end; v++) {
              if (!verses.includes(v)) verses.push(v);
            }
          }
          // Extract quotes from « » or " "
          const quotes: string[] = [];
          const quoteMatches = [...(c.citation || '').matchAll(/[«"]([^»"]{2,})[»"]/g)];
          for (const match of quoteMatches) {
            const q = match[1].trim();
            if (q && !quotes.includes(q)) quotes.push(q);
          }
          return { ...c, verses, quotes };
        }),
      })),
    };
    onSave(etude);
  };

  const stepIndex = STEPS.findIndex(s => s.id === step);

  return (
    <div className="max-w-4xl mx-auto space-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center">
            <Plus size={20} className="text-white" />
          </div>
          <div>
            <div className="font-bold text-white">Creer une nouvelle etude</div>
            <div className="text-xs text-slate-500">Ajoutez votre texte, vos mouvements et citations</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onCancel} className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors">
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={!Object.values(canProceed).every(Boolean)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 text-white text-sm rounded-xl font-semibold transition-all disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20"
          >
            <Save size={14} /> Enregistrer
          </button>
        </div>
      </div>

      {/* Step progress */}
      <div className="flex items-center gap-0">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center">
            <button
              onClick={() => setStep(s.id)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all rounded-lg ${
                step === s.id ? 'bg-indigo-600 text-white' :
                i < stepIndex ? 'text-indigo-400 bg-indigo-950/40' :
                'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
              }`}
            >
              <span className={`w-5 h-5 rounded-full text-xs flex items-center justify-center ${
                step === s.id ? 'bg-white/20' :
                i < stepIndex ? 'bg-indigo-600' : 'bg-slate-700'
              }`}>
                {i < stepIndex ? <CheckCircle2 size={10} /> : i + 1}
              </span>
              {s.label}
            </button>
            {i < STEPS.length - 1 && (
              <ChevronRight size={16} className="text-slate-700 mx-1" />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Info */}
      {step === 'info' && (
        <div className="bg-slate-900/60 border border-white/8 rounded-2xl p-6 space-5">
          <div className="flex items-center gap-2 mb-4">
            <Info size={16} className="text-indigo-400" />
            <h3 className="font-semibold text-white">Informations de l'oeuvre</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="block text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1.5">
                Titre de l'etude *
              </label>
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="ex: Le Buffet - Explication lineaire"
                className="w-full bg-slate-800/60 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500/60 transition-colors placeholder:text-slate-600"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1.5">
                Auteur (facultatif)
              </label>
              <input
                value={author}
                onChange={e => setAuthor(e.target.value)}
                placeholder="ex: Arthur Rimbaud"
                className="w-full bg-slate-800/60 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500/60 transition-colors placeholder:text-slate-600"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1.5">
                Problematique (facultatif)
              </label>
              <input
                value={problematic}
                onChange={e => setProblematic(e.target.value)}
                placeholder="Comment... ? En quoi... ?"
                className="w-full bg-slate-800/60 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500/60 transition-colors placeholder:text-slate-600"
              />
            </div>
          </div>

          <div className="mt-4 p-4 bg-slate-800/40 rounded-xl border border-white/5 text-sm text-slate-400 leading-relaxed">
            <strong className="text-slate-300">Quoi ?</strong> Description du texte<br />
            <strong className="text-slate-300">Comment ?</strong> Genres et tons (tragique, realiste, fantastique)<br />
            <strong className="text-slate-300">Pour quoi ?</strong> Themes et intentions<br />
            <strong className="text-slate-300">Problematique</strong> La question que l'analyse doit resoudre
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => setStep('text')}
              disabled={!canProceed.info}
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 text-white text-sm rounded-xl font-semibold transition-all disabled:cursor-not-allowed"
            >
              Suivant: Texte <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Text */}
      {step === 'text' && (
        <div className="bg-slate-900/60 border border-white/8 rounded-2xl p-6 space-5">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen size={16} className="text-amber-400" />
            <h3 className="font-semibold text-white">Le texte litteraire</h3>
          </div>
          <p className="text-sm text-slate-500 -mt-2">
            Entrez chaque vers ou chaque ligne sur une nouvelle ligne. Numeros de vers et guillemets seront ajoutes automatiquement.
          </p>

          <div>
            <label className="block text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1.5">
              Texte * ({textLines.length} lignes)
            </label>
            <textarea
              value={textLines.join('\n')}
              onChange={e => updateTextLines(e.target.value)}
              placeholder={"C'est un trou de verdure ou chante une riviere,\nAccrochant follement aux herbes des haillons\nD'argent ; ou le soleil, de la montagne fiere,\nLuit : c'est un petit val qui mousse de rayons."}
              rows={14}
              className="w-full bg-slate-800/60 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-['Playfair_Display'] leading-8 focus:outline-none focus:border-indigo-500/60 transition-colors resize-none placeholder:text-slate-700 placeholder:text-sm placeholder:font-['Plus_Jakarta_Sans']"
            />
          </div>

          {textLines.length > 0 && (
            <div className="bg-amber-950/20 border border-amber-500/20 rounded-xl p-4">
              <div className="text-xs font-semibold text-amber-400 mb-2 uppercase tracking-wider">Apercu numerote</div>
              <div className="space-y-1">
                {textLines.slice(0, 20).map((line, i) => (
                  <div key={i} className="flex gap-3 text-sm text-slate-300 font-['Playfair_Display'] leading-relaxed">
                    <span className="text-slate-600 select-none w-4 text-right">{i + 1}</span>
                    <span>{line}</span>
                  </div>
                ))}
                {textLines.length > 20 && (
                  <div className="text-xs text-slate-600 pt-1">... et {textLines.length - 20} autres lignes</div>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-between">
            <button onClick={() => setStep('info')} className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-400 hover:text-white transition-colors">
              <ChevronLeft size={14} /> Retour
            </button>
            <button
              onClick={() => setStep('movements')}
              disabled={!canProceed.text}
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 text-white text-sm rounded-xl font-semibold transition-all disabled:cursor-not-allowed"
            >
              Suivant: Mouvements <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Movements */}
      {step === 'movements' && (
        <div className="space-5">
          {/* Auto-detect toggle */}
          <div className="flex items-center gap-3 p-4 bg-slate-900/60 border border-white/8 rounded-2xl">
            <button
              onClick={() => setAutoDetectEnabled(!autoDetectEnabled)}
              className={`w-10 h-6 rounded-full transition-colors relative ${autoDetectEnabled ? 'bg-indigo-600' : 'bg-slate-700'}`}
              style={{ width: '2.5rem', height: '1.5rem', borderRadius: '9999px', padding: '2px' }}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${autoDetectEnabled ? 'translate-x-5' : 'translate-x-0'}`}
                style={{ width: '1.25rem', height: '1.25rem', borderRadius: '9999px' }}
              />
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-2 text-sm font-medium text-white">
                <Wand2 size={14} className={autoDetectEnabled ? 'text-indigo-400' : 'text-slate-600'} />
                Detection automatique des procedes
              </div>
              <div className="text-xs text-slate-500">Quand active, les termes entres seront normalises automatiquement (Champ lexical, Metaphore, etc.)</div>
            </div>
            {autoDetectEnabled && (
              <div className="text-xs px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg">
                Activee
              </div>
            )}
          </div>

          {/* Movements */}
          <div className="space-4">
            {movements.length === 0 && (
              <div className="text-center py-16 bg-slate-900/40 border border-dashed border-slate-700 rounded-2xl">
                <div className="text-4xl mb-3">📝</div>
                <div className="text-slate-400 mb-1 font-medium">Aucun mouvement</div>
                <div className="text-sm text-slate-600 mb-4">Ajoutez vos mouvements et citations</div>
                <button onClick={addMovement} className="flex items-center gap-2 mx-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-xl font-medium transition-all">
                  <Plus size={14} /> Ajouter un mouvement
                </button>
              </div>
            )}

            {movements.map((movement, mvIdx) => (
              <MovementEditor
                key={movement.id}
                movement={movement}
                mvIdx={mvIdx}
                textLines={textLines}
                autoDetectEnabled={autoDetectEnabled}
                onUpdateTitle={t => updateMovementTitle(movement.id, t)}
                onAddCitation={() => addCitation(movement.id)}
                onRemoveCitation={cId => removeCitation(movement.id, cId)}
                onUpdateCitation={(cId, field, val) => updateCitation(movement.id, cId, field, val)}
                onRemove={() => removeMovement(movement.id)}
                onProcedeChange={(cId, val) => handleProcedeChange(movement.id, cId, val)}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
                draggedItem={draggedItem}
              />
            ))}

            {movements.length > 0 && (
              <button
                onClick={addMovement}
                className="w-full flex items-center justify-center gap-2 py-3 border border-dashed border-slate-700 hover:border-indigo-500/50 hover:bg-indigo-500/5 text-slate-500 hover:text-indigo-400 text-sm rounded-xl transition-all"
              >
                <Plus size={14} /> Ajouter un autre mouvement
              </button>
            )}
          </div>

          <div className="flex justify-between">
            <button onClick={() => setStep('text')} className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-400 hover:text-white transition-colors">
              <ChevronLeft size={14} /> Retour
            </button>
            <button
              onClick={handleSave}
              disabled={!canProceed.movements}
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 text-white text-sm rounded-xl font-semibold transition-all disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20"
            >
              <Save size={14} /> Enregistrer l'etude
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Movement Editor sub-component ---
interface MovementEditorProps {
  movement: Movement;
  mvIdx: number;
  textLines: string[];
  autoDetectEnabled: boolean;
  onUpdateTitle: (t: string) => void;
  onAddCitation: () => void;
  onRemoveCitation: (cId: string) => void;
  onUpdateCitation: (cId: string, field: keyof CitationItem, value: string | number[]) => void;
  onRemove: () => void;
  onProcedeChange: (cId: string, val: string) => string | undefined;
  onDragStart: (mvIdx: number, ciIdx: number) => void;
  onDragOver: (e: React.DragEvent, mvIdx: number, ciIdx: number) => void;
  onDragEnd: () => void;
  draggedItem: { mvIdx: number; ciIdx: number } | null;
}

function MovementEditor({ movement, mvIdx, textLines, autoDetectEnabled, onUpdateTitle, onAddCitation, onRemoveCitation, onUpdateCitation, onRemove, onProcedeChange, onDragStart, onDragOver, onDragEnd, draggedItem }: MovementEditorProps) {
  const [expanded, setExpanded] = useState(true);
  const procedeInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const handleProcedeInput = (cId: string, rawValue: string) => {
    if (!autoDetectEnabled) {
      onUpdateCitation(cId, 'procede', rawValue);
      return;
    }
    const { detected, confidence } = detectProcede(rawValue);
    onUpdateCitation(cId, 'procede', detected);
    // If confidence is low, show suggestion
    if (confidence < 0.3 && rawValue.length > 3) {
      // Return suggestion
      return detected;
    }
  };

  const handleProcedeKeyDown = (e: React.KeyboardEvent, cId: string, rawValue: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const { detected } = detectProcede(rawValue);
      onUpdateCitation(cId, 'procede', detected);
    }
  };

  return (
    <div className="bg-slate-900/60 border border-white/8 rounded-2xl overflow-hidden">
      {/* Movement header */}
      <div className="flex items-center gap-3 px-5 py-3 border-b border-white/5">
        <button onClick={() => setExpanded(!expanded)} className="text-slate-400 hover:text-white transition-colors">
          {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>
        <Layers size={14} className="text-indigo-400 shrink-0" />
        <input
          value={movement.title}
          onChange={e => onUpdateTitle(e.target.value)}
          className="flex-1 bg-transparent text-sm font-semibold text-white focus:outline-none border-b border-transparent focus:border-indigo-500/60 pb-0.5 transition-colors"
        />
        <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded-lg">
          {movement.citations.length} citations
        </span>
        <button onClick={onRemove} className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-all">
          <Trash2 size={14} />
        </button>
      </div>

      {expanded && (
        <div>
          {movement.citations.length === 0 && (
            <div className="text-center py-8 px-4 text-sm text-slate-600">
              Aucune citation. Ajoutez-en une ci-dessous.
            </div>
          )}

          {movement.citations.map((citation, ciIdx) => (
            <CitationRow
              key={citation.id}
              citation={citation}
              ciIdx={ciIdx}
              mvIdx={mvIdx}
              textLines={textLines}
              autoDetectEnabled={autoDetectEnabled}
              isDragging={draggedItem?.mvIdx === mvIdx && draggedItem?.ciIdx === ciIdx}
              onUpdateCitation={onUpdateCitation}
              onRemoveCitation={onRemoveCitation}
              onProcedeChange={onProcedeChange}
              onDragStart={onDragStart}
              onDragOver={onDragOver}
              onDragEnd={onDragEnd}
              procInputRef={el => { procedeInputRefs.current[citation.id] = el; }}
            />
          ))}

          <button
            onClick={onAddCitation}
            className="w-full flex items-center justify-center gap-2 py-2.5 text-sm text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/5 transition-all border-t border-white/5"
          >
            <Plus size={14} /> Ajouter une citation
          </button>
        </div>
      )}
    </div>
  );
}

// --- Citation Row sub-component ---
interface CitationRowProps {
  citation: CitationItem;
  ciIdx: number;
  mvIdx: number;
  textLines: string[];
  autoDetectEnabled: boolean;
  isDragging: boolean;
  onUpdateCitation: (cId: string, field: keyof CitationItem, value: string | number[]) => void;
  onRemoveCitation: (cId: string) => void;
  onProcedeChange: (cId: string, val: string) => string | undefined;
  onDragStart: (mvIdx: number, ciIdx: number) => void;
  onDragOver: (e: React.DragEvent, mvIdx: number, ciIdx: number) => void;
  onDragEnd: () => void;
  procInputRef: (el: HTMLInputElement | null) => void;
}

function CitationRow({ citation, ciIdx, mvIdx, textLines, autoDetectEnabled, isDragging, onUpdateCitation, onRemoveCitation, onProcedeChange, onDragStart, onDragOver, onDragEnd, procInputRef }: CitationRowProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [procedeInput, setProcedeInput] = useState(citation.procede || '');
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredProcedes = ALL_PROCEDES.filter(p =>
    p.toLowerCase().includes(procedeInput.toLowerCase())
  ).slice(0, 8);

  const handleProcedeInputChange = (val: string) => {
    setProcedeInput(val);
    setShowSuggestions(val.length > 0 && filteredProcedes.length > 0);
    const detected = onProcedeChange(citation.id, val);
    // Auto-close suggestions if detection is confident
    if (detected && detected !== val) {
      setShowSuggestions(false);
    }
  };

  const selectProcede = (proc: string) => {
    setProcedeInput(proc);
    onUpdateCitation(citation.id, 'procede', proc);
    setShowSuggestions(false);
    inputRef.current?.blur();
  };

  return (
    <div
      draggable
      onDragStart={() => onDragStart(mvIdx, ciIdx)}
      onDragOver={e => onDragOver(e, mvIdx, ciIdx)}
      onDragEnd={onDragEnd}
      className={`px-5 py-3 border-b border-white/5 last:border-b-0 group transition-colors ${
        isDragging ? 'bg-indigo-950/40 opacity-60' : 'hover:bg-white/[0.02]'
      }`}
    >
      <div className="flex items-start gap-2">
        {/* Drag handle */}
        <div className="mt-2.5 text-slate-700 hover:text-slate-400 cursor-grab active:cursor-grabbing shrink-0">
          <GripVertical size={14} />
        </div>

        <div className="flex-1 space-y-2.5">
          {/* Citation + Vers */}
          <div>
            <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1">Citation</div>
            <textarea
              value={citation.citation}
              onChange={e => onUpdateCitation(citation.id, 'citation', e.target.value)}
              placeholder="ex: « C'est un trou de verdure » (v.1)"
              rows={2}
              className="w-full bg-slate-800/60 border border-white/8 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50 resize-none placeholder:text-slate-700"
            />
          </div>

          {/* Procede */}
          <div className="relative">
            <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1 flex items-center gap-2">
              Procede
              {autoDetectEnabled && (
                <span className="inline-flex items-center gap-0.5 text-[10px] text-indigo-500 bg-indigo-500/10 px-1.5 py-0.5 rounded">
                  <Wand2 size={8} /> auto
                </span>
              )}
            </div>
            <input
              ref={el => { inputRef.current = el; procInputRef(el); }}
              value={procedeInput}
              onChange={e => handleProcedeInputChange(e.target.value)}
              onFocus={() => { if (procedeInput.length > 0) setShowSuggestions(true); }}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (filteredProcedes[0]) selectProcede(filteredProcedes[0]); } }}
              placeholder="ex: Champ lexical de la nature"
              className="w-full bg-slate-800/60 border border-white/8 focus:border-indigo-500/50 rounded-lg px-3 py-2 text-sm text-indigo-200 focus:outline-none transition-colors placeholder:text-slate-700"
            />

            {/* Suggestions dropdown */}
            {showSuggestions && filteredProcedes.length > 0 && (
              <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-slate-800 border border-white/10 rounded-xl shadow-xl overflow-hidden max-h-48 overflow-y-auto">
                {filteredProcedes.map(proc => {
                  const { confidence } = detectProcede(procedeInput);
                  return (
                    <button
                      key={proc}
                      onMouseDown={() => selectProcede(proc)}
                      className="w-full text-left px-3 py-2 text-sm text-slate-200 hover:bg-indigo-600/40 hover:text-white transition-colors flex items-center justify-between"
                    >
                      <span>{proc}</span>
                      {autoDetectEnabled && (
                        <span className="text-xs text-slate-500">Auto-detecte</span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Interpretation */}
          <div>
            <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1">Interpretation</div>
            <textarea
              value={citation.interpretation}
              onChange={e => onUpdateCitation(citation.id, 'interpretation', e.target.value)}
              placeholder="Expliquez l'effet produit par ce procede..."
              rows={2}
              className="w-full bg-slate-800/60 border border-white/8 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-indigo-500/50 resize-none placeholder:text-slate-700"
            />
          </div>
        </div>

        {/* Remove button */}
        <button
          onClick={() => onRemoveCitation(citation.id)}
          className="mt-2.5 p-1.5 rounded-lg text-slate-700 hover:text-red-400 hover:bg-red-500/10 transition-all shrink-0 opacity-0 group-hover:opacity-100"
          title="Supprimer"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}