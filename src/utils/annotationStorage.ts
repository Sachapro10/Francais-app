import { CitationItem } from '../types/etude';

export interface AnnotationHighlight {
  id: string;
  lineIndex: number;
  start: number;
  end: number;
  color: 'yellow' | 'green' | 'blue' | 'pink';
  text: string;
}

export interface AnnotationNote {
  id: string;
  lineIndex: number;
  start: number;
  end: number;
  note: string;
  createdAt: number;
}

export interface AnnotationState {
  highlights: AnnotationHighlight[];
  notes: AnnotationNote[];
}

const ANNOTATION_COLORS = ['yellow', 'green', 'blue', 'pink'] as const;
const COLOR_HEX: Record<string, string> = {
  yellow: '#fbbf24',
  green: '#34d399',
  blue: '#60a5fa',
  pink: '#f472b6',
};

export function getAnnotationStorageKey(analysisId: string): string {
  return `annotations-v1-${analysisId}`;
}

export function loadAnnotations(analysisId: string): AnnotationState {
  try {
    const raw = localStorage.getItem(getAnnotationStorageKey(analysisId));
    if (!raw) return { highlights: [], notes: [] };
    const parsed = JSON.parse(raw);
    return {
      highlights: Array.isArray(parsed.highlights) ? parsed.highlights : [],
      notes: Array.isArray(parsed.notes) ? parsed.notes : [],
    };
  } catch {
    return { highlights: [], notes: [] };
  }
}

export function saveAnnotations(analysisId: string, state: AnnotationState): void {
  try {
    localStorage.setItem(getAnnotationStorageKey(analysisId), JSON.stringify(state));
  } catch {
    // Continue even when storage fails
  }
}

export function generateId(): string {
  return `ann-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function nextColor(existingHighlights: AnnotationHighlight[]): AnnotationHighlight['color'] {
  if (existingHighlights.length === 0) return 'yellow';
  const colorCounts: Record<string, number> = { yellow: 0, green: 0, blue: 0, pink: 0 };
  for (const h of existingHighlights) {
    colorCounts[h.color] = (colorCounts[h.color] || 0) + 1;
  }
  let minCount = Infinity;
  let chosen = 'yellow' as AnnotationHighlight['color'];
  for (const color of ANNOTATION_COLORS) {
    if ((colorCounts[color] || 0) < minCount) {
      minCount = colorCounts[color] || 0;
      chosen = color;
    }
  }
  return chosen;
}
