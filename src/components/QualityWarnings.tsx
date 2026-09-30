import { AlertTriangle, Info, XCircle } from 'lucide-react';
import { QualityWarning } from '../types/etude';

interface QualityWarningsProps {
  warnings: QualityWarning[];
  compact?: boolean;
}

export default function QualityWarnings({ warnings, compact = false }: QualityWarningsProps) {
  if (warnings.length === 0) return null;
  const errors = warnings.filter(warning => warning.severity === 'error').length;
  const warningCount = warnings.filter(warning => warning.severity === 'warning').length;
  return (
    <div className="wood-panel rounded-lg border border-amber-500/30 p-4 space-y-3" role="status">
      <div className="flex items-center gap-2 text-sm font-semibold text-amber-700">
        {errors > 0 ? <XCircle size={16} /> : <AlertTriangle size={16} />}
        {errors > 0 ? `${errors} problème${errors > 1 ? 's' : ''} bloquant${errors > 1 ? 's' : ''}` : `${warningCount} point${warningCount > 1 ? 's' : ''} à vérifier`}
      </div>
      <ul className={`space-y-1.5 ${compact ? 'max-h-32 overflow-y-auto' : ''}`}>
        {warnings.map((warning, index) => (
          <li key={`${warning.code}-${warning.citationId ?? warning.movementId ?? index}`} className="flex items-start gap-2 text-xs text-slate-600">
            {warning.severity === 'info' ? <Info size={13} className="mt-0.5 shrink-0 text-slate-500" /> : <AlertTriangle size={13} className="mt-0.5 shrink-0 text-amber-600" />}
            <span>{warning.message}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
