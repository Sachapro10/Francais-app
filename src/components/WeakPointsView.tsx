import { useMemo } from 'react';
import { Target, Layers, CheckCircle2, RotateCcw, Flame, BarChart3, AlertCircle } from 'lucide-react';
import { EtudeLineaire } from '../types/etude';
import { getCitationReviewStats, getSrsState, isDue, loadReviewStore } from '../utils/reviewStorage';
import { getProcedeCategory } from '../utils/procedeDetector';

interface WeakPointsViewProps {
  analysisId: string;
  etude: EtudeLineaire;
  onStartReview: () => void;
}

export default function WeakPointsView({ analysisId, etude, onStartReview }: WeakPointsViewProps) {
  const allCitations = useMemo(() => etude.movements.flatMap(m => m.citations), [etude.movements]);
  const stats = useMemo(() => getCitationReviewStats(analysisId, allCitations), [analysisId, allCitations]);

  const dueCitations = useMemo(() => stats.filter(stat => isDue(stat.state)), [stats]);
  const weakCitations = useMemo(() => [...stats].sort((a, b) => (a.accuracy - b.accuracy) || (b.attempts - a.attempts)).filter(stat => stat.attempts > 0 || isDue(stat.state)).slice(0, 5), [stats]);

  const procedeGrouped = useMemo(() => {
    const map = new Map<string, { total: number; correct: number; count: number }>();
    stats.forEach(stat => {
      const cat = getProcedeCategory(stat.citation.procede);
      const prev = map.get(cat) ?? { total: 0, correct: 0, count: 0 };
      map.set(cat, { total: prev.total + stat.attempts, correct: prev.correct + stat.correct, count: prev.count + 1 });
    });
    return Array.from(map.entries()).map(([category, value]) => ({
      category,
      accuracy: value.total ? value.correct / value.total : 0,
      attempts: value.total,
    })).sort((a, b) => a.accuracy - b.accuracy);
  }, [stats]);

  const masteredCount = stats.filter(stat => stat.state.box >= 4).length;
  const reviewedCount = stats.filter(stat => stat.attempts > 0).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white font-serif-literary flex items-center gap-2">
            <BarChart3 size={22} className="text-amber-400" /> Tableau de révision
          </h2>
          <p className="text-xs text-slate-500">Points faibles, cartes à revoir et progression de l’étude</p>
        </div>
        <button onClick={onStartReview} className="copper-action flex items-center justify-center gap-2 px-5 py-2.5 text-white rounded-xl font-medium">
          <RotateCcw size={16} /> Réviser mes erreurs ({dueCitations.length})
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="wood-panel p-4 rounded-xl border border-amber-500/20 text-center">
          <div className="text-xs text-slate-500 mb-1">À revoir aujourd’hui</div>
          <div className="text-3xl font-bold text-amber-600">{dueCitations.length}</div>
        </div>
        <div className="wood-panel p-4 rounded-xl border border-emerald-500/20 text-center">
          <div className="text-xs text-slate-500 mb-1">Citations maîtrisées</div>
          <div className="text-3xl font-bold text-emerald-600">{masteredCount}/{allCitations.length}</div>
        </div>
        <div className="wood-panel p-4 rounded-xl border border-indigo-500/20 text-center">
          <div className="text-xs text-slate-500 mb-1">Citations déjà révisées</div>
          <div className="text-3xl font-bold text-indigo-600">{reviewedCount}/{allCitations.length}</div>
        </div>
        <div className="wood-panel p-4 rounded-xl border border-white/10 text-center">
          <div className="text-xs text-slate-500 mb-1">Taux de réussite</div>
          <div className="text-3xl font-bold text-white">
            {stats.reduce((acc, s) => acc + s.attempts, 0)
              ? `${Math.round((stats.reduce((acc, s) => acc + s.correct, 0) / stats.reduce((acc, s) => acc + s.attempts, 0)) * 100)}%`
              : '—'}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="wood-panel p-4 rounded-xl border border-white/10 space-y-3">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <AlertCircle size={15} className="text-red-400" /> Citations à renforcer
          </h3>
          <div className="space-y-2">
            {weakCitations.length === 0 && <p className="text-xs text-slate-500 py-4 text-center">Aucune révision enregistrée.</p>}
            {weakCitations.map(stat => (
              <div key={stat.citation.id} className="p-3 rounded-lg bg-slate-800/50 border border-white/5 space-y-1">
                <div className="text-xs font-medium text-slate-200 line-clamp-1">« {stat.citation.citation} »</div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span className="text-amber-400 font-semibold">{stat.citation.procede}</span>
                  <span>{stat.attempts ? `${Math.round(stat.accuracy * 100)}% de réussite` : 'Jamais vue'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="wood-panel p-4 rounded-xl border border-white/10 space-y-3">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Layers size={15} className="text-indigo-400" /> Performance par catégorie
          </h3>
          <div className="space-y-3">
            {procedeGrouped.map(item => (
              <div key={item.category} className="space-y-1">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>{item.category}</span>
                  <span>{item.attempts ? `${Math.round(item.accuracy * 100)}% (${item.attempts} révisions)` : 'Non révisé'}</span>
                </div>
                <div className="wood-progress-track h-2 rounded-full overflow-hidden">
                  <div className="wood-progress-fill h-full rounded-full transition-all" style={{ width: `${item.attempts ? Math.round(item.accuracy * 100) : 0}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
