import JSZip from 'jszip';
import { EtudeLineaire, Movement, CitationItem } from '../types/etude';

export function extractVersesAndQuotes(citationText: string): { verses: number[]; quotes: string[] } {
  const verses: number[] = [];
  const quotes: string[] = [];

  // Match (v.1), (v.1-4), (v.7-9), (l.3), etc.
  const verseRegex = /\((?:v|l|vers|lignes?)\.?\s*(\d+)(?:\s*[-–—]\s*(\d+))?\)/gi;
  let verseMatch;
  while ((verseMatch = verseRegex.exec(citationText)) !== null) {
    const start = parseInt(verseMatch[1], 10);
    const end = verseMatch[2] ? parseInt(verseMatch[2], 10) : start;
    for (let i = start; i <= end; i++) {
      if (!verses.includes(i)) verses.push(i);
    }
  }

  // Match French quotes « ... » or standard quotes "..."
  const quoteRegex = /[«"']([^»"']{2,})[»"']/g;
  let quoteMatch;
  while ((quoteMatch = quoteRegex.exec(citationText)) !== null) {
    const q = quoteMatch[1].trim();
    if (q && !quotes.includes(q)) {
      quotes.push(q);
    }
  }

  return { verses, quotes };
}

export async function parseDocxFile(file: File): Promise<EtudeLineaire> {
  const zip = await JSZip.loadAsync(file);
  const docXmlStr = await zip.file('word/document.xml')?.async('text');

  if (!docXmlStr) {
    throw new Error("Impossible de lire le fichier document.xml dans le .docx");
  }

  let title = file.name.replace(/\.docx$/i, '');
  const rawTextParagraphs: string[] = [];
  const movements: Movement[] = [];
  let currentMovement: Movement | null = null;

  const bodyMatch = docXmlStr.match(/<w:body[^>]*>([\s\S]*?)<\/w:body>/);
  if (!bodyMatch) {
    throw new Error("Format de document Word non valide (corps introuvable)");
  }

  const bodyXml = bodyMatch[1];
  const elementRegex = /<(w:p|w:tbl)[^>]*>([\s\S]*?)<\/\1>/g;
  let match;

  while ((match = elementRegex.exec(bodyXml)) !== null) {
    const tag = match[1];
    const content = match[2];

    if (tag === 'w:p') {
      const text = (content.match(/<w:t[^>]*>([\s\S]*?)<\/w:t>/g) || [])
        .map(t => t.replace(/<[^>]+>/g, ''))
        .join('')
        .trim();

      if (text) {
        // If title hasn't been set or matches title pattern
        if (movements.length === 0 && !currentMovement && (text.toLowerCase().includes('explication') || text.toLowerCase().includes('étude') || text.toLowerCase().includes('tableau'))) {
          title = text;
        } else if (!text.toLowerCase().includes('citation') && !text.toLowerCase().includes('procédé')) {
          // Check if this looks like a section/movement title
          if (text.length < 120 && (text.toLowerCase().startsWith('tableau') || text.toLowerCase().startsWith('axe') || text.toLowerCase().startsWith('mouvement') || text.toLowerCase().startsWith('partie') || text.toUpperCase() === text)) {
            currentMovement = {
              id: 'm_' + Math.random().toString(36).substring(2, 9),
              title: text,
              citations: []
            };
            movements.push(currentMovement);
          } else {
            // Might be a paragraph of the literary text itself!
            rawTextParagraphs.push(text);
          }
        }
      }
    } else if (tag === 'w:tbl') {
      // If we encounter a table without an active movement heading, create a default one
      if (!currentMovement) {
        currentMovement = {
          id: 'm_' + Math.random().toString(36).substring(2, 9),
          title: `Axe / Mouvement ${movements.length + 1}`,
          citations: []
        };
        movements.push(currentMovement);
      }

      const trRegex = /<w:tr[^>]*>([\s\S]*?)<\/w:tr>/g;
      let trMatch;

      while ((trMatch = trRegex.exec(content)) !== null) {
        const rowContent = trMatch[1];
        const tcRegex = /<w:tc[^>]*>([\s\S]*?)<\/w:tc>/g;
        let tcMatch;
        const rowCells: string[] = [];

        while ((tcMatch = tcRegex.exec(rowContent)) !== null) {
          const cellContent = tcMatch[1];
          const cellText = (cellContent.match(/<w:t[^>]*>([\s\S]*?)<\/w:t>/g) || [])
            .map(t => t.replace(/<[^>]+>/g, ''))
            .join(' ')
            .trim();
          rowCells.push(cellText);
        }

        if (rowCells.length >= 2) {
          const c0 = (rowCells[0] || '').toLowerCase();
          const c1 = (rowCells[1] || '').toLowerCase();

          // Skip header row
          if (c0.includes('citation') || c1.includes('procéd')) {
            continue;
          }

          const citationRaw = rowCells[0] || '';
          const procedeRaw = rowCells[1] || '';
          const interpRaw = rowCells[2] || '';

          if (citationRaw || procedeRaw) {
            const { verses, quotes } = extractVersesAndQuotes(citationRaw);
            currentMovement.citations.push({
              id: 'c_' + Math.random().toString(36).substring(2, 9),
              citation: citationRaw,
              procede: procedeRaw,
              interpretation: interpRaw,
              verses,
              quotes,
              movementId: currentMovement.id
            });
          }
        }
      }
    }
  }

  // Filter out empty movements
  const validMovements = movements.filter(m => m.citations.length > 0);

  return {
    title: title || file.name,
    author: '',
    textLines: rawTextParagraphs.length > 0 ? rawTextParagraphs : [],
    movements: validMovements
  };
}
