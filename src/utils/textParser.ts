import { EtudeLineaire, Movement, CitationItem } from '../types/etude';

function trimLines(text: string): string[] {
  return text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
}

function extractTitle(rawLines: string[]): string {
  const first = rawLines[0] || 'Texte sans titre';
  return first.replace(/[\s–—-]+Explication[s]?\s*linéaire\s*$/i, '').trim() || first;
}

function extractMeta(rawLines: string[]) {
  const result = { quoi: '', comment: '', pourQuoi: '', problematic: '' };
  const pattern = /^([Qq]uoi|[Cc]omment|[Pp]our quoi|[Pp]robl[eé]matique)\s*[:–—]?\s*(.*)/;
  for (const line of rawLines) {
    const m = line.match(pattern);
    if (!m) break;
    const key = m[1].toLowerCase();
    const val = m[2].trim();
    if (key.startsWith('quoi')) result.quoi = val;
    else if (key.startsWith('comment')) result.comment = val;
    else if (key.startsWith('pour')) result.pourQuoi = val;
    else if (key.startsWith('prob')) result.problematic = val;
  }
  return result;
}

function parseCitationsInBlock(
  blockText: string,
  movementId: string
): CitationItem[] {
  const citations: CitationItem[] = [];
  const blockLines = trimLines(blockText);

  let pendingQuote = '';
  let pendingQuotes: string[] = [];
  let pendingVerses: number[] = [];
  let pendingProcede = '';
  let pendingInterpr = '';
  let rowStarted = false;

  for (const line of blockLines) {
    // Skip the movement title line
    if (/^[IVXLC]+\)\s/.test(line)) continue;

    // Empty line → flush and reset
    if (line === '') {
      if (rowStarted && pendingQuote) {
        citations.push(makeCitation(pendingQuote, pendingQuotes, pendingProcede, pendingInterpr, pendingVerses, movementId, citations.length));
      }
      pendingQuote = pendingProcede = pendingInterpr = '';
      pendingQuotes = [];
      pendingVerses = [];
      rowStarted = false;
      continue;
    }

    // Does this look like a citation line? (starts with a quote mark)
    if (/^[«"']/.test(line)) {
      if (rowStarted && pendingQuote) {
        citations.push(makeCitation(pendingQuote, pendingQuotes, pendingProcede, pendingInterpr, pendingVerses, movementId, citations.length));
      }
      const parsed = parseCitationLine(line);
      pendingQuote = parsed.quote;
      pendingQuotes = parsed.quotes;
      pendingVerses = parsed.verses;
      pendingProcede = parsed.procede;
      pendingInterpr = parsed.interpretation;
      rowStarted = true;
    } else if (rowStarted) {
      // Continuation of current row — it's the interpretation
      pendingInterpr += (pendingInterpr ? ' ' : '') + line;
    } else {
      // Orphan line before any quote — treat as interpretation continuation
      pendingInterpr += (pendingInterpr ? ' ' : '') + line;
      rowStarted = true;
    }
  }

  if (rowStarted && pendingQuote) {
    citations.push(makeCitation(pendingQuote, pendingQuotes, pendingProcede, pendingInterpr, pendingVerses, movementId, citations.length));
  }

  return citations;
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

function parseCitationLine(line: string): {
  quote: string;
  quotes: string[];
  verses: number[];
  procede: string;
  interpretation: string;
} {
  const verses: number[] = [];

  // Extract verse numbers: (v.1), (v.1-3), (vers 5)
  for (const m of line.matchAll(/\(?\s*(?:v\.?|vers|verset)\s*(\d+)(?:\s*[-–—]\s*(\d+))?\s*\)/gi)) {
    const start = parseInt(m[1]);
    const end = m[2] ? parseInt(m[2]) : start;
    for (let v = start; v <= end; v++) {
      if (!verses.includes(v)) verses.push(v);
    }
  }

  // Strip verse refs and surrounding whitespace, but preserve tabs inside the line
  const stripped = line.replace(/\s*\([^)]*\)\s*/g, ' ').replace(/\s{2,}/g, '  ').trim();

  let quote = stripped;
  let procede = '';
  let interpretation = '';

  // Find interpretation start: look for text after the last verse reference
  // The interpretation starts after the last ")" from verse refs
  const lastVerseParen = stripped.search(/\)\s*$/m);
  let interpStart = stripped.length;

  if (lastVerseParen !== -1) {
    const afterVerse = stripped.substring(lastVerseParen + 1).trim();
    if (afterVerse.length > 0) {
      interpStart = lastVerseParen + 1;
    }
  }

  // Split on tab or double-space for the three parts
  // Format: "quote part  « text » (v.1)  Procede  Interpretation"
  const tabParts = stripped.split('\t');
  if (tabParts.length >= 2) {
    // [0] = quote part (before first tab)
    // [1] = procede
    // [2] = interpretation
    const beforeFirstTab = tabParts[0].trim();
    // The quote is everything before verse refs, or just before the tab
    quote = beforeFirstTab.replace(/\s*\([^)]*\)\s*/g, '').trim();
    procede = (tabParts[1] || '').trim();
    interpretation = (tabParts[2] || '').trim();
  } else {
    // Fallback: split on double-space
    const spParts = stripped.split(/\s{2,}/);
    if (spParts.length >= 2) {
      quote = spParts[0].replace(/\s*\([^)]*\)\s*/g, '').trim();
      procede = (spParts[1] || '').trim();
      interpretation = (spParts.slice(2).join('  ')).trim();
    } else {
      // Only quote, no procedé detected
      quote = stripped.replace(/\s*\([^)]*\)\s*/g, '').trim();
    }
  }

  // Clean up quote: extract content between « » or " "
  const extractedQuotes: string[] = [];
  for (const m of quote.matchAll(/[«"]([^»""]+)[»""]/g)) {
    extractedQuotes.push(m[1].trim());
  }
  if (extractedQuotes.length > 0) {
    quote = extractedQuotes.join(' / ');
  }

  return { quote, quotes: extractedQuotes, verses, procede, interpretation };
}

export function parseStudyText(rawText: string, poemText: string = ''): EtudeLineaire {
  const allLines = trimLines(rawText);

  const title = extractTitle(allLines);
  const meta = extractMeta(allLines);

  // Extract poem lines
  const textLines = trimLines(poemText);

  // Find "Mouvements :" header
  const movStartIdx = allLines.findIndex(l => /^mouvements?\s*:/i.test(l));
  if (movStartIdx === -1) {
    return makeResult(title, meta, [], textLines);
  }

  // Get everything from "Mouvements :" onward
  const movSection = allLines.slice(movStartIdx).join('\n');

  // Split on Roman numeral markers that appear at the start of a line
  // Use split() not lookahead — this removes the marker from each part
  const parts = movSection.split(/\n([IVXLC]+)\)\s*/);
  // parts[0] = "Mouvements :"
  // parts[1] = numeral, parts[2] = content, parts[3] = numeral, parts[4] = content, ...

  const movements: Movement[] = [];

  // Process pairs: parts[i] = numeral, parts[i+1] = content (for i odd)
  for (let i = 1; i < parts.length; i += 2) {
    const numeral = parts[i] || `M${(i + 1) / 2}`;
    const rawContent = (parts[i + 1] || '').trim();

    // Skip empty blocks (toc entries have no content)
    if (!rawContent) continue;

    const contentLines = trimLines(rawContent);

    // Skip entries that are just a title with no citation lines
    const quoteLines = contentLines.filter(l => /^[«"']/.test(l));
    if (quoteLines.length === 0) continue;

    const titleLine = contentLines[0] || '';
    const cleanTitle = titleLine.replace(/^[IVXLC]+\)\s*/, '').trim();

    // Skip duplicate titles (repeats in toc)
    if (movements.some(m => m.title === cleanTitle)) continue;

    const movementTitle = cleanTitle || `Partie ${movements.length + 1}`;
    const movementId = `movement-${movements.length + 1}`;
    const citations = parseCitationsInBlock(rawContent, movementId);

    movements.push({ id: movementId, title: movementTitle, citations });
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