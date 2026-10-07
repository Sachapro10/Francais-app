import { EtudeLineaire } from '../types/etude';
import { Printer, X, BookOpen, Layers, Sparkles, Download } from 'lucide-react';

interface FicheRevisionModalProps {
  etude: EtudeLineaire;
  onClose: () => void;
}

export default function FicheRevisionModal({ etude, onClose }: FicheRevisionModalProps) {
  const handlePrint = () => {
    window.print();
  };

  const totalCitations = etude.movements.reduce((acc, m) => acc + m.citations.length, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/70 backdrop-blur-sm print:p-0 print:bg-white print:static print:inset-auto">
      <div className="relative w-full max-w-4xl max-h-[calc(100dvh-2rem)] flex flex-col rustic-modal rounded-2xl overflow-hidden print:max-w-none print:max-h-none print:rounded-none print:shadow-none print:border-none print:bg-white print:text-slate-900">

        {/* Header bar (Hidden on Print) */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 wood-rail print:hidden">
          <div className="flex items-center gap-2 text-white font-semibold">
            <BookOpen size={18} className="text-amber-400" />
            <span>Fiche de Révision EAF — {etude.title}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="copper-action px-4 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 hover:scale-105 transition-all shadow-md"
            >
              <Printer size={15} />
              Imprimer / Exporter PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Fermer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Fiche Revision Sheet Body */}
        <div className="print-fiche-content flex-1 overflow-y-auto p-6 sm:p-8 space-y-8 bg-slate-950 text-slate-100 print:bg-white print:text-slate-900 print:p-0 print:overflow-visible">

          {/* Sheet Banner */}
          <div className="border-b-2 border-amber-500/40 pb-5 print:border-amber-600">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs uppercase tracking-wider font-bold text-amber-400 print:text-amber-700">
                  Fiche de Révision — Bac de Français (EAF)
                </span>
                <h1 className="font-serif-literary text-3xl font-bold text-white print:text-slate-900 mt-1">
                  {etude.title}
                </h1>
                {etude.author && (
                  <p className="text-sm text-slate-400 print:text-slate-600 mt-0.5">
                    {etude.author}
                  </p>
                )}
              </div>
              <div className="text-right text-xs text-slate-500 print:text-slate-500">
                <div>{etude.movements.length} Mouvements</div>
                <div>{totalCitations} Citations</div>
              </div>
            </div>

            {etude.problematic && (
              <div className="mt-4 p-3 bg-amber-500/10 rounded-lg border border-amber-500/30 text-xs text-amber-200 print:bg-amber-50 print:border-amber-300 print:text-amber-900">
                <span className="font-bold">Problématique :</span> {etude.problematic}
              </div>
            )}
          </div>

          {/* Section 1: Poem / Text */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-amber-400 print:text-slate-900 uppercase tracking-wide flex items-center gap-2 border-b border-white/10 pb-1 print:border-slate-300">
              <BookOpen size={16} /> Texte de l’étude
            </h2>
            <div className="bg-slate-900/60 p-4 sm:p-5 rounded-xl border border-white/5 font-serif-literary text-sm leading-relaxed space-y-1 print:bg-white print:border-slate-200 print:text-slate-900">
              {etude.textLines.map((line, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <span className="text-xs text-slate-600 print:text-slate-400 font-sans w-6 text-right shrink-0 pt-0.5 select-none">
                    {idx + 1}
                  </span>
                  <span className="flex-1">{line}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Complete Linear Analysis */}
          <div className="space-y-4 print:page-break-before-always">
            <h2 className="text-sm font-bold text-amber-400 print:text-slate-900 uppercase tracking-wide flex items-center gap-2 border-b border-white/10 pb-1 print:border-slate-300">
              <Layers size={16} /> Explication Linéaire par Mouvements
            </h2>

            <div className="space-y-6">
              {etude.movements.map((movement, mIdx) => (
                <div
                  key={movement.id}
                  className="bg-slate-900/40 rounded-xl border border-white/5 overflow-hidden print:bg-white print:border-slate-300 print:break-inside-avoid"
                >
                  <div className="bg-indigo-950/40 px-4 py-2.5 border-b border-white/5 print:bg-slate-100 print:border-slate-300 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-indigo-600 text-white font-bold text-xs flex items-center justify-center print:bg-slate-800">
                      {mIdx + 1}
                    </span>
                    <h3 className="font-semibold text-sm text-white print:text-slate-900">
                      {movement.title}
                    </h3>
                  </div>

                  <div className="divide-y divide-white/5 print:divide-slate-200">
                    {movement.citations.map((c, cIdx) => (
                      <div key={c.id} className="p-4 space-y-1.5 text-xs">
                        <div className="flex items-start justify-between gap-3">
                          <blockquote className="font-serif-literary font-medium text-slate-200 print:text-slate-900 italic text-sm">
                            « {c.citation} »
                          </blockquote>
                          {c.verses && c.verses.length > 0 && (
                            <span className="text-[11px] font-mono text-indigo-400 print:text-indigo-700 bg-indigo-950/60 print:bg-indigo-50 px-2 py-0.5 rounded shrink-0">
                              v. {c.verses.join(', ')}
                            </span>
                          )}
                        </div>

                        <div className="font-semibold text-amber-300 print:text-amber-800">
                          Procédé : {c.procede}
                        </div>

                        <p className="text-slate-400 print:text-slate-700 leading-relaxed pt-0.5">
                          {c.interpretation}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sheet Footer */}
          <div className="border-t border-white/10 pt-4 text-center text-xs text-slate-500 print:text-slate-400 print:border-slate-300">
            Fiche générée avec l’Application Épreuves Anticipées de Français (EAF)
          </div>
        </div>
      </div>
    </div>
  );
}
