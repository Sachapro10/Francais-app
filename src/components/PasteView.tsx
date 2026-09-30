import { useState, useEffect, useCallback, useMemo } from 'react';
import { Clipboard, Eye, EyeOff, ArrowRight, BookOpen, Target, Layers, Wand2, RefreshCw } from 'lucide-react';
import { EtudeLineaire } from '../types/etude';
import { parseStudyText } from '../utils/textParser';
import { checkEtudeQuality } from '../utils/qualityChecks';
import QualityWarnings from './QualityWarnings';

interface PasteViewProps {
  onSave: (etude: EtudeLineaire) => void;
  onCancel: () => void;
}

const PLACEHOLDER = `Collez ici votre texte d'étude linéaire.

Format attendu :

Le Buffet – Explication linéaire

Quoi ? – Description d'un buffet
Comment ? – Tragique, Réaliste, Fantastique
Pour quoi ? – Métaphore de la vieillesse / memento mori
Problématique : Comment la description réaliste et fantastique du buffet cache-t-elle une métaphore tragique de la vieillesse ?

Mouvements :
I) Description réaliste et fantastique d'un buffet
II) Dialogue tragique entre le poète et le buffet

I) Description réelle et fantastique d'un buffet
« Large » (v.1) / « sculpté » (v.1) / « sombre » (v.1) / « vieux » (v.2) / « ouvert » (v.3)	Adjectifs qualificatifs	Description réaliste de l'extérieur du buffet
« C'est » (v.1) / « est » (v.3)	Présentatif + présent de l'indicatif	Le présent a ici une valeur de description
« Sobre » (v.1) / « ombre » (v.3)	À la rime riche	Ambiguïté mystérieux = description fantastique

II) Dialogue tragique entre le poète et le buffet
Les tirets	Marque du dialogue	Rupture à la volta avec la fin de la description
« Trouverait » (v.9)	Conditionnel	Basculement dans l'imaginaire / irréel
...`;

const CATEGORY_COLORS: Record<string, string> = {
  Semantique: 'bg-violet-500/20 text-violet-300',
  Phonetique: 'bg-amber-500/20 text-amber-300',
  Syntagmatique: 'bg-blue-500/20 text-blue-300',
  Morphosyntaxe: 'bg-emerald-500/20 text-emerald-300',
  Reference: 'bg-pink-500/20 text-pink-300',
  Composition: 'bg-cyan-500/20 text-cyan-300',
  Autre: 'bg-slate-500/20 text-slate-300',
};

const PROCEDE_SHORTLIST = [
  'Adjectifs qualificatifs', 'Comparaison', 'Métaphore', 'Personnification',
  'Métonymie', 'Synecdoque', 'Champ lexical', 'Allitération', 'Assonance',
  'Anaphore', 'Énumération', 'Hyperbole', 'Antithèse', 'Gradation',
  'Polyptote', 'Présentatif', 'Présent de l\'indicatif', 'Conditionnel',
  'Apostrophe', 'Dialogue', 'Redondance', 'Synesthésie', 'Référence mythologique',
  'Rime riche', 'À la rime', 'Contre-rejet', 'GN', 'Valeur des temps',
];

function getCategoryColor(procede: string): string {
  const proc = procede.toLowerCase();
  if (proc.includes('champ lexical')) return CATEGORY_COLORS.Semantique;
  if (proc.includes('comparaison')) return CATEGORY_COLORS.Semantique;
  if (proc.includes('métaphore')) return CATEGORY_COLORS.Semantique;
  if (proc.includes('personnifi')) return CATEGORY_COLORS.Semantique;
  if (proc.includes('alliteration') || proc.includes('assonance') || proc.includes('rime')) return CATEGORY_COLORS.Phonetique;
  if (proc.includes('anaphore') || proc.includes('énumération') || proc.includes('gradation')) return CATEGORY_COLORS.Syntagmatique;
  if (proc.includes('adjectif') || proc.includes('gn') || proc.includes('conditionnel') || proc.includes('présent')) return CATEGORY_COLORS.Morphosyntaxe;
  if (proc.includes('mytholog') || proc.includes('allégor')) return CATEGORY_COLORS.Reference;
  if (proc.includes('polyptote') || proc.includes('antithèse')) return CATEGORY_COLORS.Composition;
  return CATEGORY_COLORS.Autre;
}

function truncate(str: string, max: number): string {
  return str.length > max ? str.substring(0, max) + '…' : str;
}

export default function PasteView({ onSave, onCancel }: PasteViewProps) {
  const [rawText, setRawText] = useState('');
  const [poemText, setPoemText] = useState('');
  const [preview, setPreview] = useState<EtudeLineaire | null>(null);
  const [showPreview, setShowPreview] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Auto-parse when text changes (debounced)
  useEffect(() => {
    if (!rawText.trim()) {
      setPreview(null);
      setError(null);
      return;
    }
    const timeout = setTimeout(() => {
      try {
        const parsed = parseStudyText(rawText, poemText);
        if (parsed.movements.length === 0) {
          setError('Aucun mouvement détecté. Vérifiez le format (utilisez I), II), etc. pour les mouvements).');
          setPreview(parsed);
        } else {
          setError(null);
          setPreview(parsed);
        }
      } catch (e) {
        setError('Erreur de parsing : ' + (e instanceof Error ? e.message : 'inconnu'));
        setPreview(null);
      }
    }, 600);
    return () => clearTimeout(timeout);
  }, [rawText, poemText]);

  const handleSave = useCallback(() => {
    if (!preview) return;
    onSave(preview);
  }, [preview, onSave]);

  const qualityWarnings = useMemo(() => preview ? checkEtudeQuality(preview) : [], [preview]);

  const citationCount = preview?.movements.reduce((acc, m) => acc + m.citations.length, 0) ?? 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6 rustic-workbench">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="wood-icon w-10 h-10 rounded-lg flex items-center justify-center">
            <Clipboard size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Importer une étude</h2>
            <p className="text-xs text-slate-500">Collez le texte complet — mouvements, citations, procédés</p>
          </div>
        </div>
        <button onClick={onCancel} className="text-slate-500 hover:text-white text-sm">
          Annuler
        </button>
      </div>

      {/* Poem text box */}
      <div className="wood-panel rounded-lg p-4 space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
            <BookOpen size={14} />
            Texte du poème
          </label>
          <span className="text-xs text-slate-600">Collez le poème vers par vers</span>
        </div>
        <textarea
          value={poemText}
          onChange={e => setPoemText(e.target.value)}
          placeholder={"C'est un litière où je trouve, par exemple,\nUn vieux bouleau fort beau, de mauvaise grâce…"}
          className="paper-input w-full h-32 border rounded-lg px-4 py-3 text-sm text-slate-200 font-serif-literary leading-relaxed resize-none focus:outline-none placeholder-slate-700"
        />
        {poemText.trim() && (
          <div className="flex flex-wrap gap-1">
            {poemText.split('\n').filter(l => l.trim()).map((line, i) => (
              <span key={i} className="text-xs bg-slate-700/50 text-slate-400 px-2 py-0.5 rounded">
                v.{i + 1}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Meta info bar */}
      {preview && (
        <div className="wood-panel rounded-lg p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                <BookOpen size={14} className="text-indigo-300" />
              </div>
              <div>
                <div className="text-xs text-slate-500">Titre</div>
                <div className="text-sm font-medium text-white">{preview.title}</div>
              </div>
            </div>
            {preview.problematic && (
              <div className="flex items-center gap-2 border-l border-white/10 pl-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                  <Target size={14} className="text-amber-300" />
                </div>
                <div>
                  <div className="text-xs text-slate-500">Problématique</div>
                  <div className="text-sm text-slate-200">{truncate(preview.problematic, 60)}</div>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2 border-l border-white/10 pl-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <Layers size={14} className="text-emerald-300" />
              </div>
              <div>
                <div className="text-xs text-slate-500">Mouvements</div>
                <div className="text-sm text-white">{preview.movements.length}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 border-l border-white/10 pl-3">
              <div className="w-8 h-8 rounded-lg bg-pink-500/20 flex items-center justify-center">
                <Clipboard size={14} className="text-pink-300" />
              </div>
              <div>
                <div className="text-xs text-slate-500">Citations</div>
                <div className="text-sm text-white">{citationCount}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {preview && qualityWarnings.length > 0 && (
        <QualityWarnings warnings={qualityWarnings} compact />
      )}

      {/* Error banner */}
      {error && (
        <div className="wood-panel border border-red-500/20 rounded-lg p-3 text-sm text-red-300 flex items-start gap-2">
          <RefreshCw size={14} className="mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      {/* Main split view */}
      <div className={`grid gap-6 ${showPreview && preview ? 'lg:grid-cols-2' : 'grid-cols-1'}`}>
        {/* Left: textarea */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <Clipboard size={14} />
              Texte à importer
            </label>
            {rawText && (
              <button
                onClick={() => { setRawText(''); setPreview(null); }}
                className="text-xs text-slate-500 hover:text-white flex items-center gap-1"
              >
                <RefreshCw size={12} /> Effacer
              </button>
            )}
          </div>
          <textarea
            value={rawText}
            onChange={e => setRawText(e.target.value)}
            placeholder={PLACEHOLDER}
            className="paper-input w-full h-[500px] border rounded-lg px-4 py-3 text-sm text-slate-200 font-mono leading-relaxed resize-none focus:outline-none placeholder-slate-700 focus:placeholder-slate-600"
            spellCheck={false}
          />
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-600">
              {rawText ? `${rawText.length} caractères` : 'Collez votre texte ci-dessus'}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowPreview(p => !p)}
                className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-white px-2 py-1 rounded-lg hover:bg-white/5 transition-colors"
              >
                {showPreview ? <EyeOff size={12} /> : <Eye size={12} />}
                {showPreview ? 'Masquer apercu' : 'Apercu'}
              </button>
              <button
                onClick={handleSave}
                disabled={!preview || preview.movements.length === 0}
                className="copper-action flex items-center gap-1.5 px-4 py-2 disabled:bg-slate-700 disabled:text-slate-500 text-white text-sm rounded-lg font-medium transition-all disabled:cursor-not-allowed"
              >
                <ArrowRight size={14} />
                Importer cette étude
              </button>
            </div>
          </div>
        </div>

        {/* Right: live preview */}
        {showPreview && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <Eye size={14} />
                Aperçu détecté
              </label>
              {!preview && rawText && (
                <span className="text-xs text-slate-600 animate-pulse">Analyse en cours…</span>
              )}
            </div>

            <div className="wood-panel rounded-lg overflow-hidden h-[500px] overflow-y-auto">
              {!preview && !error && (
                <div className="flex flex-col items-center justify-center h-full text-slate-600">
                  <Clipboard size={32} className="mb-3 opacity-40" />
                  <p className="text-sm">Collez votre texte pour voir l'apercu</p>
                </div>
              )}

              {preview && preview.movements.length === 0 && !error && (
                <div className="flex flex-col items-center justify-center h-full text-slate-600 p-6 text-center">
                  <Wand2 size={32} className="mb-3 opacity-40" />
                  <p className="text-sm font-medium text-slate-400 mb-1">Aucun mouvement détecté</p>
                  <p className="text-xs">Vérifiez que les mouvements sont formatés avec I), II), etc.</p>
                </div>
              )}

              {preview && (
                <div className="p-4 space-y-4">
                  {/* Title & meta */}
                  <div>
                    <h3 className="font-serif-literary text-lg font-bold text-white mb-1">
                      {preview.title}
                    </h3>
                    {preview.problematic && (
                      <p className="text-xs text-indigo-300 bg-indigo-500/10 rounded-lg px-3 py-2 border border-indigo-500/20">
                        {preview.problematic}
                      </p>
                    )}
                    {preview.metaQuoi && (
                      <p className="text-xs text-slate-400 mt-1">
                        <span className="text-slate-600">Quoi?</span> {preview.metaQuoi}
                      </p>
                    )}
                    {preview.metaComment && (
                      <p className="text-xs text-slate-400">
                        <span className="text-slate-600">Comment?</span> {preview.metaComment}
                      </p>
                    )}
                    {preview.metaPourQuoi && (
                      <p className="text-xs text-slate-400">
                        <span className="text-slate-600">Pour quoi?</span> {preview.metaPourQuoi}
                      </p>
                    )}
                  </div>

                  {/* Movements */}
                  {preview.movements.map((movement, mi) => (
                    <div key={movement.id} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
                          {['I', 'II', 'III', 'IV', 'V', 'VI'][mi] || `M${mi + 1}`}
                        </span>
                        <span className="text-sm font-medium text-white">{movement.title}</span>
                        <span className="text-xs text-slate-600 ml-auto">{movement.citations.length} cit.</span>
                      </div>

                      {/* Citation rows */}
                      <div className="space-y-1.5 ml-4 border-l border-white/5 pl-3">
                        {movement.citations.slice(0, 8).map(c => (
                          <div key={c.id} className="text-xs">
                            <div className="flex items-start gap-2">
                              <span className="text-slate-500 shrink-0 mt-0.5 font-mono">"</span>
                              <div className="flex-1 min-w-0">
                                <div className="text-slate-200 leading-snug">
                                  {truncate(c.citation, 50)}
                                </div>
                                <div className="flex flex-wrap items-center gap-1 mt-0.5">
                                  {c.verses.length > 0 && (
                                    <span className="text-[10px] bg-amber-500/15 text-amber-400 px-1 rounded">
                                      v.{c.verses.join(',')}
                                    </span>
                                  )}
                                  {c.procede && (
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded border ${getCategoryColor(c.procede)} border-white/5`}>
                                      {truncate(c.procede, 30)}
                                    </span>
                                  )}
                                </div>
                                {c.interpretation && (
                                  <div className="text-slate-500 mt-0.5 leading-snug">
                                    {truncate(c.interpretation, 60)}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                        {movement.citations.length > 8 && (
                          <p className="text-[10px] text-slate-600 pl-2">
                            +{movement.citations.length - 8} autres citations…
                          </p>
                        )}
                      </div>
                    </div>
                  ))}

                  {preview.movements.length > 0 && (
                    <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                      <span className="text-xs text-slate-500">
                        {citationCount} citations détectées
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(
                          preview.movements
                            .flatMap(m => m.citations.map(c => c.procede))
                            .filter(Boolean)
                            .reduce((acc, p) => { acc[p!] = (acc[p!] || 0) + 1; return acc; }, {} as Record<string, number>)
                        )
                          .sort((a, b) => b[1] - a[1])
                          .slice(0, 6)
                          .map(([proc, count]) => (
                            <span key={proc} className={`text-[10px] px-1.5 py-0.5 rounded border ${getCategoryColor(proc)} border-white/5`}>
                              {proc} ({count})
                            </span>
                          ))
                        }
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Procedé palette quick-add */}
      {preview && preview.movements.some(m => m.citations.some(c => !c.procede)) && (
        <div className="wood-panel border border-amber-500/20 rounded-lg p-4">
          <p className="text-xs font-medium text-amber-300 mb-2 flex items-center gap-1.5">
            <Wand2 size={12} />
            Procédés les plus courants — cliqué pour les ajouter aux citations vides
          </p>
          <div className="flex flex-wrap gap-1.5">
            {PROCEDE_SHORTLIST.map(proc => (
              <button
                key={proc}
                className="text-xs bg-slate-800/60 hover:bg-slate-700 text-slate-300 hover:text-white px-2.5 py-1 rounded-lg border border-white/5 hover:border-white/20 transition-all"
              >
                {proc}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}