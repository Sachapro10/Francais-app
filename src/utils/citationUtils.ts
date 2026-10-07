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

/** Check if a term describes verses (e.g. "2 derniers vers", "1er vers", "quatrain") */
export function isVerseDescriptionTerm(term: string): boolean {
  const norm = normalizeCitationText(term);
  if (!norm) return false;
  return (
    isStanzaTerm(term) ||
    norm.includes('vers') ||
    norm.includes('verset') ||
    norm.includes('dernier') ||
    norm.includes('premier') ||
    norm.includes('1er')
  );
}

/** Resolve line indices for verse or stanza description terms */
export function getVerseDescriptionLineIndices(textLines: string[], term: string): number[] {
  const norm = normalizeCitationText(term);
  if (textLines.length === 0 || !norm) return [];
  const totalLines = textLines.length;

  if (isStanzaTerm(term)) {
    return getStanzaLineIndices(textLines, term);
  }

  if (norm.includes('dernier')) {
    let count = 1;
    if (norm.includes('2') || norm.includes('deux')) count = 2;
    else if (norm.includes('3') || norm.includes('trois')) count = 3;
    else if (norm.includes('4') || norm.includes('quatre')) count = 4;
    else if (norm.includes('derniers')) count = 2;

    const startIdx = Math.max(0, totalLines - count);
    const indices: number[] = [];
    for (let i = startIdx; i < totalLines; i++) {
      indices.push(i);
    }
    return indices;
  }

  if (norm.includes('premier') || norm.includes('1er')) {
    let count = 1;
    if (norm.includes('2') || norm.includes('deux')) count = 2;
    else if (norm.includes('3') || norm.includes('trois')) count = 3;
    else if (norm.includes('4') || norm.includes('quatre')) count = 4;

    const endIdx = Math.min(totalLines, count);
    const indices: number[] = [];
    for (let i = 0; i < endIdx; i++) {
      indices.push(i);
    }
    return indices;
  }

  if (norm.includes('2eme') || norm.includes('2e') || norm.includes('deuxieme') || norm.includes('second')) {
    if (totalLines >= 2) return [1];
  }
  if (norm.includes('3eme') || norm.includes('3e') || norm.includes('troisieme')) {
    if (totalLines >= 3) return [2];
  }
  if (norm.includes('4eme') || norm.includes('4e') || norm.includes('quatrieme')) {
    if (totalLines >= 4) return [3];
  }

  const singleVerseMatch = norm.match(/(?:vers|verset)\s*(\d+)/);
  if (singleVerseMatch) {
    const vNum = parseInt(singleVerseMatch[1], 10);
    const idx = vNum - 1;
    if (idx >= 0 && idx < totalLines) return [idx];
  }

  return [];
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

  const startsWithWordChar = /[a-z0-9]/i.test(normalizedQuote[0]);
  const endsWithWordChar = /[a-z0-9]/i.test(normalizedQuote[normalizedQuote.length - 1]);

  let searchPos = sourceOffset;
  let normalizedOffset = normalizedLine.map.findIndex(index => index >= searchPos);
  if (normalizedOffset < 0) normalizedOffset = normalizedLine.text.length;

  while (searchPos < line.length) {
    const found = normalizedLine.text.indexOf(normalizedQuote, normalizedOffset);
    if (found < 0) return null;

    const beforeChar = found > 0 ? normalizedLine.text[found - 1] : '';
    const afterIndex = found + normalizedQuote.length;
    const afterChar = afterIndex < normalizedLine.text.length ? normalizedLine.text[afterIndex] : '';

    const validStart = !startsWithWordChar || !beforeChar || !/[a-z0-9]/i.test(beforeChar);
    const validEnd = !endsWithWordChar || !afterChar || !/[a-z0-9]/i.test(afterChar);

    const last = found + normalizedQuote.length - 1;
    const start = normalizedLine.map[found];
    const end = (normalizedLine.map[last] ?? start) + 1;

    if (validStart && validEnd) {
      return { start, end };
    }

    normalizedOffset = found + 1;
    if (normalizedOffset >= normalizedLine.text.length) return null;
    searchPos = normalizedLine.map[normalizedOffset] ?? (line.length + 1);
  }

  return null;
}

export function parseVersesInput(input: string): number[] {
  const verses: number[] = [];
  const parts = input.split(/[,;]/);
  for (const part of parts) {
    const rangeMatch = part.match(/(\d+)\s*[-–—]\s*(\d+)/);
    if (rangeMatch) {
      const start = parseInt(rangeMatch[1], 10);
      const end = parseInt(rangeMatch[2], 10);
      for (let v = Math.min(start, end); v <= Math.max(start, end); v++) {
        if (!verses.includes(v)) verses.push(v);
      }
    } else {
      const single = parseInt(part.trim(), 10);
      if (!isNaN(single) && !verses.includes(single)) {
        verses.push(single);
      }
    }
  }
  return verses.sort((a, b) => a - b);
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

  const checkVerseDesc = isVerseDescriptionTerm(quote) || (procede && isVerseDescriptionTerm(procede));
  if (checkVerseDesc) {
    const descIndices = getVerseDescriptionLineIndices(textLines, quote);
    const finalDescIndices = descIndices.length > 0
      ? descIndices
      : (procede ? getVerseDescriptionLineIndices(textLines, procede) : []);

    for (const lineIdx of finalDescIndices) {
      if (lineIdx >= 0 && lineIdx < textLines.length) {
        if (itemVerses && itemVerses.length > 0) {
          const verseNum = lineIdx + 1;
          const minV = Math.min(...itemVerses);
          const maxV = Math.max(...itemVerses);
          if (!itemVerses.includes(verseNum) && (verseNum < minV || verseNum > maxV)) {
            continue;
          }
        }
        ranges.push({ lineIndex: lineIdx, start: 0, end: textLines[lineIdx].length });
      }
    }
    if (ranges.length > 0) return ranges;
  }

  // Standard literal text match across poem lines
  const searchLines = (lineIndices: number[]) => {
    for (const lineIdx of lineIndices) {
      if (lineIdx < 0 || lineIdx >= textLines.length) continue;
      const line = textLines[lineIdx];
      let searchFrom = 0;
      let range = findCitationRange(line, quote, searchFrom);
      while (range) {
        ranges.push({ lineIndex: lineIdx, start: range.start, end: range.end });
        searchFrom = range.end;
        range = findCitationRange(line, quote, searchFrom);
      }
    }
  };

  if (itemVerses && itemVerses.length > 0) {
    // Pass 1: exact verses listed in itemVerses
    const exactLineIndices = itemVerses
      .map(v => v - 1)
      .filter(i => i >= 0 && i < textLines.length);

    searchLines(exactLineIndices);

    // Pass 2: fallback to any verse between min and max verse range if no match on exact verses
    if (ranges.length === 0 && itemVerses.length >= 2) {
      const minV = Math.min(...itemVerses);
      const maxV = Math.max(...itemVerses);
      const rangeLineIndices: number[] = [];
      for (let v = minV; v <= maxV; v++) {
        const idx = v - 1;
        if (idx >= 0 && idx < textLines.length && !exactLineIndices.includes(idx)) {
          rangeLineIndices.push(idx);
        }
      }
      if (rangeLineIndices.length > 0) {
        searchLines(rangeLineIndices);
      }
    }
  } else {
    // No itemVerses specified: search all lines
    const allIndices = Array.from({ length: textLines.length }, (_, i) => i);
    searchLines(allIndices);
  }

  return ranges;
}
