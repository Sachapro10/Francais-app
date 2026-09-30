import { CitationItem } from '../types/etude';

export interface CitationRange {
  lineIndex: number;
  start: number;
  end: number;
}

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
export function getCitationQuotes(citation: Pick<CitationItem, 'citation' | 'quotes' | 'excerpts'>): string[] {
  const excerpts = citation.excerpts?.map(excerpt => excerpt.text.trim()).filter(Boolean) ?? [];
  if (excerpts.length > 0) return excerpts;
  const derived = deriveCitationQuotes(citation.citation);
  return derived.length > 0 ? derived : citation.quotes;
}

export function makeExcerptId(): string {
  return `excerpt-${Math.random().toString(36).slice(2, 9)}`;
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

/** Check if a term represents dashes / tirets */
export function isTiretTerm(term: string): boolean {
  const norm = normalizeCitationText(term);
  return (
    norm === 'tiret' ||
    norm === 'tirets' ||
    norm === 'les tirets' ||
    norm === 'des tirets' ||
    norm.includes('tiret') ||
    norm === 'marque du dialogue' ||
    norm === 'les tirets du dialogue'
  );
}

/** Check if a term represents a stanza/strophe description like "le deuxième quatrain" */
export function isStanzaTerm(term: string): boolean {
  const norm = normalizeCitationText(term);
  return (
    norm.includes('quatrain') ||
    norm.includes('tercet') ||
    norm.includes('strophe') ||
    norm.includes('sixain') ||
    norm.includes('distique')
  );
}

/** Resolve line indices for a stanza term */
export function getStanzaLineIndices(textLines: string[], term: string): number[] {
  const norm = normalizeCitationText(term);
  if (textLines.length === 0) return [];

  let stanzaNum = 1;
  if (norm.includes('2') || norm.includes('deuxieme') || norm.includes('second')) stanzaNum = 2;
  else if (norm.includes('3') || norm.includes('troisieme')) stanzaNum = 3;
  else if (norm.includes('4') || norm.includes('quatrieme')) stanzaNum = 4;
  else if (norm.includes('dernier')) stanzaNum = norm.includes('tercet') ? 2 : 4;

  const isTercet = norm.includes('tercet');
  const isQuatrain = norm.includes('quatrain');

  const blankLineIndices = textLines.map((l, i) => l.trim() === '' ? i : -1).filter(i => i >= 0);

  if (blankLineIndices.length > 0) {
    const blocks: number[][] = [];
    let currentBlock: number[] = [];
    for (let i = 0; i < textLines.length; i++) {
      if (textLines[i].trim() === '') {
        if (currentBlock.length > 0) {
          blocks.push(currentBlock);
          currentBlock = [];
        }
      } else {
        currentBlock.push(i);
      }
    }
    if (currentBlock.length > 0) blocks.push(currentBlock);

    if (isTercet) {
      const tercetBlocks = blocks.filter(b => b.length === 3);
      if (tercetBlocks.length >= stanzaNum) return tercetBlocks[stanzaNum - 1];
      const targetIdx = stanzaNum === 1 ? 2 : 3;
      return blocks[targetIdx] ?? blocks[blocks.length - 1] ?? [];
    }

    if (isQuatrain) {
      const quatrainBlocks = blocks.filter(b => b.length >= 4);
      if (quatrainBlocks.length >= stanzaNum) return quatrainBlocks[stanzaNum - 1];
      return blocks[stanzaNum - 1] ?? [];
    }

    return blocks[stanzaNum - 1] ?? [];
  }

  // Continuous lines (e.g. 14 lines standard sonnet)
  if (isQuatrain) {
    if (stanzaNum === 1) return [0, 1, 2, 3].filter(i => i < textLines.length);
    if (stanzaNum === 2) return [4, 5, 6, 7].filter(i => i < textLines.length);
    if (stanzaNum === 3) return [8, 9, 10, 11].filter(i => i < textLines.length);
    if (stanzaNum === 4) return [12, 13, 14, 15].filter(i => i < textLines.length);
  }

  if (isTercet) {
    if (stanzaNum === 1) return [8, 9, 10].filter(i => i < textLines.length);
    if (stanzaNum === 2) return [11, 12, 13].filter(i => i < textLines.length);
  }

  const start = (stanzaNum - 1) * 4;
  return Array.from({ length: 4 }, (_, k) => start + k).filter(i => i < textLines.length);
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

/** Find all ranges in poem for a quote (supporting literal text, tirets, and stanzas) */
export function findCitationRangesInPoem(
  textLines: string[],
  quote: string,
  itemVerses?: number[],
  procede?: string
): CitationRange[] {
  const ranges: CitationRange[] = [];
  if (!quote.trim() || textLines.length === 0) return ranges;

  const checkTirets = isTiretTerm(quote) || (procede && isTiretTerm(procede));
  if (checkTirets) {
    for (let lineIdx = 0; lineIdx < textLines.length; lineIdx++) {
      if (itemVerses && itemVerses.length > 0 && !itemVerses.includes(lineIdx + 1)) {
        continue;
      }
      const line = textLines[lineIdx];
      const dashRegex = /[-–—―]/g;
      let match: RegExpExecArray | null;
      while ((match = dashRegex.exec(line)) !== null) {
        ranges.push({ lineIndex: lineIdx, start: match.index, end: match.index + 1 });
      }
    }
    if (ranges.length > 0) return ranges;
  }

  const checkStanza = isStanzaTerm(quote) || (procede && isStanzaTerm(procede));
  if (checkStanza) {
    const stanzaIndices = getStanzaLineIndices(textLines, quote) || (procede ? getStanzaLineIndices(textLines, procede) : []);
    for (const lineIdx of stanzaIndices) {
      if (lineIdx >= 0 && lineIdx < textLines.length) {
        ranges.push({ lineIndex: lineIdx, start: 0, end: textLines[lineIdx].length });
      }
    }
    if (ranges.length > 0) return ranges;
  }

  // Standard literal text match across poem lines
  for (let lineIdx = 0; lineIdx < textLines.length; lineIdx++) {
    const line = textLines[lineIdx];
    let searchFrom = 0;
    let range = findCitationRange(line, quote, searchFrom);
    while (range) {
      ranges.push({ lineIndex: lineIdx, start: range.start, end: range.end });
      searchFrom = range.end;
      range = findCitationRange(line, quote, searchFrom);
    }
  }

  return ranges;
}
