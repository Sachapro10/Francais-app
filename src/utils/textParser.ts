import { EtudeLineaire, Movement, CitationItem } from '../types/etude';

function cleanSpaces(text: string): string {
  return text.replace(/ /g, ' ').trim();
}

function trimLines(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map(line => cleanSpaces(line))
    .filter(line => line.length > 0);
}

function normalizeForMatch(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[’‘`]/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function extractTitle(rawLines: string[]): string {
  const first = rawLines[0] || 'Texte sans titre';
  return first.replace(/[\s–—-]+Explication[s]?\s*linéaire\s*$/i, '').trim() || first;
}

function extractMeta(rawLines: string[]) {
  const result = { quoi: '', comment: '', pourQuoi: '', problematic: '' };
  const pattern = /^\s*(Quoi|Comment|Pour\s+quoi|Probl[eé]matique)\s*\??\s*[:–—-]?\s*(.*)$/i;

  for (const line of rawLines) {
    const match = line.match(pattern);
    if (!match) continue;

    const key = normalizeForMatch(match[1]);
    const value = match[2].trim();
    if (key === 'quoi') result.quoi = value;
    else if (key === 'comment') result.comment = value;
    else if (key.startsWith('pour')) result.pourQuoi = value;
    else if (key.startsWith('problem')) result.problematic = value;
  }

  return result;
}

/**
 * These labels cover the way procédés are usually written in school notes.
 * They are deliberately ordered by length so a compound label is preferred
 * over a shorter word contained inside it (for example "Marque du dialogue"
 * before "dialogue").
 */
const PROCEDURE_MARKERS = [
  "présentatif + présent de l'indicatif",
  'presentatif + present de l indicatif',
  'deuxième personne du singulier',
  'deuxieme personne du singulier',
  'adjectifs qualificatifs',
  'référence mythologique',
  'reference mythologique',
  'marque du dialogue',
  'allitération en [v]',
  'alliteration en [v]',
  'allitération en [f]',
  'alliteration en [f]',
  'rime suffisante',
  'à la rime riche',
  'a la rime riche',
  'contre-rejets',
  'contre-rejet',
  'personnifications',
  'personnification',
  'personifications',
  'personification',
  'synesthésie',
  'synesthesie',
  'énumération',
  'enumeration',
  'ennumération',
  'ennumeration',
  'polyptote',
  'comparaison',
  'conditionnel',
  'anaphore',
  'antithèse',
  'antithese',
  'apostrophe',
  'métaphores',
  'metaphores',
  'métaphore',
  'metaphore',
  'redondance',
  'dialogue',
  'allitération',
  'alliteration',
  'présentatif',
  'presentatif',
  'gn',
].sort((a, b) => normalizeForMatch(b).length - normalizeForMatch(a).length);

function isWordBoundary(text: string, start: number, end: number): boolean {
  const isWord = (char: string | undefined) => Boolean(char && /[\p{L}\p{N}]/u.test(char));
  return !isWord(text[start - 1]) && !isWord(text[end]);
}

function normalizedWithMap(source: string): { text: string; map: number[] } {
  let text = '';
  const map: number[] = [];
  let lastWasSpace = false;

  for (let index = 0; index < source.length; index++) {
    const original = source[index];
    if (/\s/.test(original)) {
      if (text && !lastWasSpace) {
        text += ' ';
        map.push(index);
      }
      lastWasSpace = true;
      continue;
    }

    const normalized = original
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[’‘`]/g, "'");
    for (const character of normalized) {
      text += character;
      map.push(index);
    }
    lastWasSpace = false;
  }

  while (text.endsWith(' ')) {
    text = text.slice(0, -1);
    map.pop();
  }

  return { text, map };
}

function findProcedure(line: string, searchFrom = 0): { start: number; end: number } | null {
  const normalized = normalizedWithMap(line);
  let best: { start: number; end: number } | null = null;
  const minimumIndex = normalized.map.findIndex(index => index >= searchFrom);
  const fromIndex = minimumIndex === -1 ? normalized.text.length : minimumIndex;

  for (const marker of PROCEDURE_MARKERS) {
    const normalizedMarker = normalizedWithMap(marker).text;
    let from = fromIndex;
    while (from < normalized.text.length) {
      const found = normalized.text.indexOf(normalizedMarker, from);
      if (found === -1) break;
      const end = found + normalizedMarker.length;
      const needsBoundary = normalizedMarker.length <= 3;
      if (!needsBoundary || isWordBoundary(normalized.text, found, end)) {
        const startOriginal = normalized.map[found];
        const lastOriginal = normalized.map[end - 1];
        const candidate = { start: startOriginal, end: lastOriginal + 1 };
        if (!best || candidate.start < best.start || (candidate.start === best.start && candidate.end > best.end)) {
          best = candidate;
        }
        break;
      }
      from = found + 1;
    }
  }

  return best;
}

function extractVerses(line: string): number[] {
  const verses: number[] = [];
  const versePattern = /\(\s*(?:v|vers|verset)\s*\.?\s*(\d+)(?:\s*[-–—]\s*(\d+))?\s*\)/gi;

  for (const match of line.matchAll(versePattern)) {
    const start = parseInt(match[1], 10);
    const end = match[2] ? parseInt(match[2], 10) : start;
    for (let verse = start; verse <= end; verse++) {
      if (!verses.includes(verse)) verses.push(verse);
    }
  }

  return verses;
}

function stripVerseReferences(text: string): string {
  return text.replace(/\s*\(\s*(?:v|vers|verset)\s*\.?\s*\d+(?:\s*[-–—]\s*\d+)?\s*\)\s*/gi, ' ');
}

function extractQuotedParts(text: string): string[] {
  return Array.from(text.matchAll(/[«"]([^»"]+)[»"]/g), match => match[1].trim()).filter(Boolean);
}

function cleanQuote(text: string): string {
  return stripVerseReferences(text)
    .replace(/[\t]+/g, ' ')
    .replace(/^[\s/,:;–—-]+|[\s/,:;–—-]+$/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function parseCitationLine(line: string): {
  quote: string;
  quotes: string[];
  verses: number[];
  procede: string;
  interpretation: string;
} {
  const source = cleanSpaces(line);
  const verses = extractVerses(source);
  const quotedParts = extractQuotedParts(source);
  const withoutVerses = stripVerseReferences(source);

  let quote = '';
  let procede = '';
  let interpretation = '';

  // Pasting from a spreadsheet/Word table may retain tabs or wide spaces.
  // Prefer those columns when they are available and non-empty.
  const tabParts = source.split('\t').map(part => part.trim());
  const wideParts = withoutVerses.split(/\s{2,}/).map(part => part.trim()).filter(Boolean);
  const columnParts = tabParts.length >= 2 ? tabParts : wideParts;

  if (columnParts.length >= 2) {
    quote = cleanQuote(columnParts[0]);
    procede = columnParts[1].replace(/[\s:–—-]+$/, '').trim();
    interpretation = columnParts.slice(2).join(' ').trim();
  } else {
    const quoteEnd = quotedParts.length > 0
      ? withoutVerses.lastIndexOf('»') + 1
      : 0;
    const procedure = findProcedure(withoutVerses, Math.max(0, quoteEnd));

    if (procedure) {
      const before = withoutVerses.slice(0, procedure.start);
      const after = withoutVerses.slice(procedure.end);
      quote = cleanQuote(before);
      // Keep the original source text for the label, including accents.
      procede = withoutVerses.slice(procedure.start, procedure.end).trim();
      interpretation = after.replace(/^[\s:–—-]+/, '').trim();
    } else {
      quote = cleanQuote(withoutVerses);
    }
  }

  // Quoted text is the most reliable citation value, including rows with
  // several quoted fragments separated by slashes.
  if (quotedParts.length > 0) {
    quote = quotedParts.join(' / ');
  }

  return {
    quote,
    quotes: quotedParts,
    verses,
    procede,
    interpretation,
  };
}

function makeCitation(
  quote: string,
  quotes: string[],
  procede: string,
  interpretation: string,
  verses: number[],
  movementId: string,
  idx: number
): CitationItem {
  return {
    id: `citation-${movementId}-${idx + 1}`,
    citation: quote,
    procede: procede.trim(),
    interpretation: interpretation.trim(),
    verses,
    quotes,
    movementId,
  };
}

function isColumnHeader(line: string): boolean {
  const normalized = normalizeForMatch(line).replace(/\s+/g, ' ');
  return normalized === 'citation' || normalized === 'procede' || normalized === 'interpretation';
}

function isCitationStart(line: string, parsed: ReturnType<typeof parseCitationLine>): boolean {
  const trimmed = line.trim();
  // Quoted rows may have no procedé or interpretation (the last rows in a
  // pasted table are a common example), so they are always row starts.
  return /^[«"]/.test(trimmed)
    || /^les\s+tirets\b/i.test(trimmed)
    || /^tout\s+(?:le|la|les)\b/i.test(trimmed)
    || /^2(?:e|ème|eme)\s+quatrain\b/i.test(trimmed)
    || /^deux\s+derniers\s+vers\b/i.test(trimmed)
    || /^quand\s+/i.test(trimmed);
}

function parseCitationsInBlock(blockText: string, movementId: string): CitationItem[] {
  const citations: CitationItem[] = [];
  let pending: ReturnType<typeof parseCitationLine> | null = null;
  let hasStarted = false;

  const flush = () => {
    if (pending?.quote) {
      citations.push(makeCitation(
        pending.quote,
        pending.quotes,
        pending.procede,
        pending.interpretation,
        pending.verses,
        movementId,
        citations.length
      ));
    }
    pending = null;
  };

  for (const rawLine of blockText.split(/\r?\n/)) {
    const line = cleanSpaces(rawLine);
    if (!line || isColumnHeader(line)) continue;

    const parsed = parseCitationLine(line);
    const startsCitation = isCitationStart(line, parsed);

    if (!hasStarted) {
      // Ignore the repeated movement heading and any introductory text before
      // the first actual citation.
      if (!startsCitation) continue;
      hasStarted = true;
      pending = parsed;
      continue;
    }

    if (!pending) {
      pending = parsed;
      continue;
    }

    if (pending.procede && pending.interpretation) {
      if (startsCitation) {
        flush();
        pending = parsed;
      } else {
        // Long interpretations are often wrapped over several lines.
        pending.interpretation = `${pending.interpretation} ${line}`.trim();
      }
      continue;
    }

    if (!pending.procede) {
      if (startsCitation && !parsed.procede && !parsed.quote) {
        // A malformed/unsupported procedure line is still more likely to be
        // a procedure than a new citation in the vertical table format.
        pending.procede = line;
      } else if (parsed.procede && !parsed.quote) {
        // Word/Google Docs often pastes each table cell on its own line.
        // Preserve the complete cell instead of requiring a fixed vocabulary.
        // Any text after a recognized word is part of the procedure cell here;
        // the following line is the separate interpretation cell.
        pending.procede = line;
        pending.interpretation = '';
      } else if (startsCitation) {
        flush();
        pending = parsed;
      } else {
        pending.procede = line;
      }
      continue;
    }

    if (!pending.interpretation) {
      // This is the interpretation cell in the vertical table layout.
      pending.interpretation = line;
    }
  }

  flush();
  return citations;
}

function stripMovementMarker(line: string): string {
  return line.replace(/^[IVXLC]+\)\s*/, '').trim();
}

function parseMovementBlock(lines: string[], title: string, index: number): Movement | null {
  const movementId = `movement-${index + 1}`;
  const citations = parseCitationsInBlock(lines.join('\n'), movementId);
  if (citations.length === 0) return null;
  return { id: movementId, title, citations };
}

export function parseStudyText(rawText: string, poemText: string = ''): EtudeLineaire {
  const allLines = trimLines(rawText);
  const title = extractTitle(allLines);
  const meta = extractMeta(allLines);
  const textLines = trimLines(poemText);
  const movStartIdx = allLines.findIndex(line => /^mouvements?\s*:/i.test(line));

  if (movStartIdx === -1) return makeResult(title, meta, [], textLines);

  const sectionLines = allLines.slice(movStartIdx + 1);
  const outline: string[] = [];
  let bodyStart = 0;

  // First collect the movement outline. In many pasted documents the actual
  // analyses appear later under unnumbered headings.
  while (bodyStart < sectionLines.length) {
    const match = sectionLines[bodyStart].match(/^[IVXLC]+\)\s*(.+)$/);
    if (!match) break;
    outline.push(match[1].trim());
    bodyStart++;
  }

  const movements: Movement[] = [];
  const bodyLines = sectionLines.slice(bodyStart);
  const normalizedBody = bodyLines.map(line => normalizeForMatch(stripMovementMarker(line)));
  const headingIndexes = outline.map(outlineTitle => {
    const target = normalizeForMatch(outlineTitle);
    return normalizedBody.findIndex(line => line === target);
  });

  if (outline.length > 0 && headingIndexes.every(index => index >= 0)) {
    for (let i = 0; i < headingIndexes.length; i++) {
      const start = headingIndexes[i];
      const end = headingIndexes[i + 1] ?? bodyLines.length;
      const movement = parseMovementBlock(bodyLines.slice(start, end), outline[i], i);
      if (movement) movements.push(movement);
    }
  } else {
    // Fallback for documents whose body headings are numbered themselves.
    const fallbackSection = sectionLines.join('\n');
    const parts = fallbackSection.split(/\n([IVXLC]+)\)\s*/);
    for (let i = 1; i < parts.length; i += 2) {
      const rawContent = (parts[i + 1] || '').trim();
      if (!rawContent) continue;
      const cleanTitle = stripMovementMarker(rawContent.split(/\r?\n/)[0] || '') || `Partie ${movements.length + 1}`;
      const movement = parseMovementBlock(rawContent.split(/\r?\n/), cleanTitle, movements.length);
      if (movement) movements.push(movement);
    }
  }

  return makeResult(title, meta, movements, textLines);
}

function makeResult(
  title: string,
  meta: ReturnType<typeof extractMeta>,
  movements: Movement[],
  textLines: string[]
): EtudeLineaire {
  return {
    id: `study-${Date.now()}`,
    title,
    author: undefined,
    textLines,
    problematic: meta.problematic,
    metaQuoi: meta.quoi,
    metaComment: meta.comment,
    metaPourQuoi: meta.pourQuoi,
    movements,
  };
}
