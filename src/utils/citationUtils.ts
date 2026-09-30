import { CitationItem } from '../types/etude';

/** Normalize citation text while keeping punctuation useful for poem matching. */
export function normalizeCitationText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[’‘`]/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Get the literal excerpts represented by an editor citation value.
 * Quoted excerpts are preferred; an unquoted citation is treated as one excerpt.
 */
function cleanCitationPart(part: string): string {
  return part
    .replace(/\s*\(\s*(?:v|vers|verset)\s*\.?\s*\d+(?:\s*[-–—]\s*\d+)?\s*\)/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function splitCitationParts(parts: string[]): string[] {
  return parts
    .flatMap(part => part.split(/\s*(?:\/|\+|;|•)\s*/))
    .map(cleanCitationPart)
    .filter(Boolean);
}

export function deriveCitationQuotes(citation: string): string[] {
  const quoted = Array.from(citation.matchAll(/[«“"]([^»”"]+)[»”"]/g))
    .map(match => match[1])
    .filter(Boolean);

  if (quoted.length > 0) return splitCitationParts(quoted);

  const unquoted = cleanCitationPart(citation);
  return splitCitationParts([unquoted]);
}

/** Prefer excerpts from the current display text, with legacy quote data as fallback. */
export function getCitationQuotes(citation: Pick<CitationItem, 'citation' | 'quotes'>): string[] {
  const derived = deriveCitationQuotes(citation.citation);
  return derived.length > 0 ? derived : citation.quotes;
}

function normalizedWithMap(source: string): { text: string; map: number[] } {
  let text = '';
  const map: number[] = [];
  let previousWasSpace = false;

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    if (/\s/.test(character)) {
      if (text && !previousWasSpace) {
        text += ' ';
        map.push(index);
      }
      previousWasSpace = true;
      continue;
    }

    const normalized = character
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[’‘`]/g, "'");
    for (const output of normalized) {
      text += output;
      map.push(index);
    }
    previousWasSpace = false;
  }

  while (text.endsWith(' ')) {
    text = text.slice(0, -1);
    map.pop();
  }
  return { text, map };
}

/** Find an excerpt in a poem line and return offsets in the original line. */
export function findCitationRange(line: string, quote: string, sourceOffset = 0): { start: number; end: number } | null {
  const normalizedQuote = normalizeCitationText(quote);
  if (!normalizedQuote) return null;
  const normalizedLine = normalizedWithMap(line);
  const normalizedOffset = normalizedLine.map.findIndex(index => index >= sourceOffset);
  const found = normalizedLine.text.indexOf(normalizedQuote, normalizedOffset < 0 ? normalizedLine.text.length : normalizedOffset);
  if (found < 0) return null;
  const last = found + normalizedQuote.length - 1;
  const start = normalizedLine.map[found];
  const end = (normalizedLine.map[last] ?? start) + 1;
  return { start, end };
}
