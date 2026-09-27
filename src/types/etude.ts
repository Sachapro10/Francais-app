export interface CitationItem {
  id: string;
  citation: string;
  procede: string;
  interpretation: string;
  verses: number[];
  quotes: string[];
  movementId?: string;
  matchedRanges?: {
    lineIndex: number;
    start: number;
    end: number;
    matchText: string;
  }[];
}

export interface Movement {
  id: string;
  title: string;
  citations: CitationItem[];
}

export interface EtudeLineaire {
  id?: string;
  title: string;
  author?: string;
  textLines: string[];
  /** Parsed from pasted text */
  problematic?: string;
  metaQuoi?: string;
  metaComment?: string;
  metaPourQuoi?: string;
  movements: Movement[];
}

export interface MatchHighlight {
  citationId: string;
  lineIndex: number;
  start: number;
  end: number;
  text: string;
  procede: string;
  interpretation: string;
}

export type ViewMode = 'study' | 'quiz' | 'flashcards' | 'editor' | 'newText';
