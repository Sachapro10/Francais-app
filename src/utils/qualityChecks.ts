import { EtudeLineaire, QualityWarning } from '../types/etude';
import { findCitationRangesInPoem, getCitationQuotes } from './citationUtils';

export function checkEtudeQuality(etude: EtudeLineaire): QualityWarning[] {
  const warnings: QualityWarning[] = [];
  const seenCitationIds = new Set<string>();
  const seenMovementIds = new Set<string>();

  if (!etude.title.trim() || /^texte sans titre$/i.test(etude.title.trim())) {
    warnings.push({ code: 'missing-title', severity: 'warning', message: 'Le titre de l’étude est vide ou générique.', field: 'title' });
  }
  if (etude.textLines.length === 0) warnings.push({ code: 'missing-poem', severity: 'error', message: 'Le texte du poème est vide.', field: 'textLines' });
  if (etude.movements.length === 0) warnings.push({ code: 'missing-movements', severity: 'error', message: 'Aucun mouvement n’a été détecté.', field: 'movements' });

  for (const movement of etude.movements) {
    if (seenMovementIds.has(movement.id)) warnings.push({ code: 'duplicate-movement-id', severity: 'warning', message: `Le mouvement « ${movement.title} » utilise un identifiant déjà présent.`, movementId: movement.id });
    seenMovementIds.add(movement.id);
    if (movement.citations.length === 0) warnings.push({ code: 'empty-movement', severity: 'warning', message: `Le mouvement « ${movement.title} » ne contient aucune citation.`, movementId: movement.id });

    for (const citation of movement.citations) {
      const location = { movementId: movement.id, citationId: citation.id };
      if (seenCitationIds.has(citation.id)) warnings.push({ ...location, code: 'duplicate-citation-id', severity: 'error', message: `La citation « ${citation.citation || 'sans texte'} » a un identifiant dupliqué.` });
      seenCitationIds.add(citation.id);
      if (!citation.citation.trim()) warnings.push({ ...location, code: 'missing-citation', severity: 'error', message: 'Le texte de la citation est vide.', field: 'citation' });
      if (!citation.procede.trim()) warnings.push({ ...location, code: 'missing-procede', severity: 'warning', message: 'Le procédé est vide.', field: 'procede' });
      if (!citation.interpretation.trim()) warnings.push({ ...location, code: 'missing-interpretation', severity: 'warning', message: 'L’interprétation est vide.', field: 'interpretation' });

      const quotes = getCitationQuotes(citation);
      if (quotes.length === 0) warnings.push({ ...location, code: 'missing-excerpt', severity: 'error', message: 'Aucun extrait associé à cette citation.', field: 'quotes' });
      const seenQuotes = new Set<string>();
      for (const quote of quotes) {
        const normalized = quote.toLocaleLowerCase().trim();
        if (seenQuotes.has(normalized)) warnings.push({ ...location, code: 'duplicate-excerpt', severity: 'warning', message: `L’extrait « ${quote} » est présent plusieurs fois.` });
        seenQuotes.add(normalized);
        if (etude.textLines.length > 0 && findCitationRangesInPoem(etude.textLines, quote, citation.verses, citation.procede).length === 0) {
          warnings.push({ ...location, code: 'unmatched-excerpt', severity: 'warning', message: `L’extrait « ${quote} » est introuvable dans le poème.` });
        }
      }
      for (const verse of citation.verses || []) {
        if (!Number.isInteger(verse) || verse < 1 || verse > etude.textLines.length) warnings.push({ ...location, code: 'invalid-verse', severity: 'warning', message: `Le vers ${verse} ne correspond pas au texte du poème.` });
      }
    }
  }
  return warnings;
}
