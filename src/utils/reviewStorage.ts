import { CitationItem, ReviewEvent, ReviewRating, SrsState } from '../types/etude';

const STORAGE_KEY = 'etude-review-v1';
const VERSION = 1;
const INTERVALS = [0, 1, 3, 7, 14, 30];

export interface ReviewStore {
  version: number;
  srs: Record<string, SrsState>;
  events: ReviewEvent[];
}

export function getItemKey(analysisId: string, citationId: string): string {
  return `${analysisId}:${citationId}`;
}

export function loadReviewStore(): ReviewStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { version: VERSION, srs: {}, events: [] };
    const parsed = JSON.parse(raw) as Partial<ReviewStore>;
    return {
      version: VERSION,
      srs: parsed.srs && typeof parsed.srs === 'object' ? parsed.srs : {},
      events: Array.isArray(parsed.events) ? parsed.events : [],
    };
  } catch {
    return { version: VERSION, srs: {}, events: [] };
  }
}

function saveReviewStore(store: ReviewStore): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // Continue the revision session when storage is unavailable.
  }
}

export function getInitialSrs(itemKey: string, now = Date.now()): SrsState {
  return { itemKey, box: 0, intervalDays: 0, dueAt: now, repetitions: 0, lapses: 0, ease: 2.5 };
}

export function getSrsState(itemKey: string, store = loadReviewStore()): SrsState {
  return store.srs[itemKey] ?? getInitialSrs(itemKey);
}

export function isDue(state: SrsState, now = Date.now()): boolean {
  return state.dueAt <= now;
}

export function scheduleReview(previous: SrsState, rating: ReviewRating, now = Date.now()): SrsState {
  if (rating === 'again') {
    return { ...previous, box: 0, intervalDays: 0, dueAt: now + 10 * 60 * 1000, lastReviewedAt: now, repetitions: previous.repetitions + 1, lapses: previous.lapses + 1 };
  }

  const step = rating === 'easy' ? 2 : rating === 'good' ? 1 : 0;
  const box = Math.min(5, Math.max(1, previous.box + step));
  const intervalDays = rating === 'hard'
    ? 1
    : INTERVALS[Math.min(INTERVALS.length - 1, box)] || 1;
  return {
    ...previous,
    box,
    intervalDays,
    dueAt: now + intervalDays * 24 * 60 * 60 * 1000,
    lastReviewedAt: now,
    repetitions: previous.repetitions + 1,
  };
}

export function recordReview(event: Omit<ReviewEvent, 'id' | 'itemKey' | 'createdAt'> & { itemKey?: string }, rating: ReviewRating = event.correct ? 'good' : 'again'): ReviewStore {
  const store = loadReviewStore();
  const itemKey = event.itemKey ?? getItemKey(event.analysisId, event.citationId);
  const previous = store.srs[itemKey] ?? getInitialSrs(itemKey);
  const next = scheduleReview(previous, rating);
  const reviewEvent: ReviewEvent = {
    ...event,
    id: `review-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    itemKey,
    rating,
    createdAt: Date.now(),
  };
  const updated: ReviewStore = {
    version: VERSION,
    srs: { ...store.srs, [itemKey]: next },
    events: [...store.events, reviewEvent].slice(-2000),
  };
  saveReviewStore(updated);
  return updated;
}

export function removeAnalysisReviews(analysisId: string): void {
  const store = loadReviewStore();
  const prefix = `${analysisId}:`;
  const srs = Object.fromEntries(Object.entries(store.srs).filter(([key]) => !key.startsWith(prefix)));
  saveReviewStore({ ...store, srs, events: store.events.filter(event => event.analysisId !== analysisId) });
}

export function getCitationReviewStats(analysisId: string, citations: CitationItem[]) {
  const store = loadReviewStore();
  return citations.map(citation => {
    const itemKey = getItemKey(analysisId, citation.id);
    const events = store.events.filter(event => event.itemKey === itemKey);
    const correct = events.filter(event => event.correct).length;
    const state = store.srs[itemKey] ?? getInitialSrs(itemKey);
    return { citation, state, events, attempts: events.length, correct, incorrect: events.length - correct, accuracy: events.length ? correct / events.length : 0 };
  });
}
