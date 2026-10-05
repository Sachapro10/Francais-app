export interface CitationExcerpt {
  id: string;
  text: string;
  verses?: number[];
}

export interface CitationItem {
  id: string;
  citation: string;
  procede: string;
  interpretation: string;
  verses: number[];
  quotes: string[];
  excerpts?: CitationExcerpt[];
  movementId?: string;
  matchedRanges?: {
    excerptId?: string;
    lineIndex: number;
    start: number;
    end: number;
    matchText: string;
  }[];
}

export type ReviewRating = 'again' | 'hard' | 'good' | 'easy';

export interface SrsState {
  itemKey: string;
  box: number;
  intervalDays: number;
  dueAt: number;
  lastReviewedAt?: number;
  repetitions: number;
  lapses: number;
  ease: number;
}

export interface ReviewEvent {
  id: string;
  analysisId: string;
  itemKey: string;
  citationId: string;
  movementId?: string;
  procede?: string;
  mode: 'quiz-identify' | 'quiz-locate' | 'quiz-grammar' | 'flashcard';
  rating: ReviewRating;
  correct: boolean;
  selectedAnswer?: string;
  expectedAnswer?: string;
  createdAt: number;
}

export type QualitySeverity = 'info' | 'warning' | 'error';

export interface QualityWarning {
  code: string;
  severity: QualitySeverity;
  message: string;
  movementId?: string;
  citationId?: string;
  field?: string;
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

export type ViewMode = 'study' | 'quiz' | 'flashcards' | 'weakPoints' | 'editor' | 'newText' | 'grammar';
