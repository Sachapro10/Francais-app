import { useState, useMemo } from 'react';
import { vocabularyTerms, vocabularyCategories, VocabularyTerm } from '../data/vocabulary';

type CategoryFilter = 'all' | VocabularyTerm['category'];

interface FlashcardProps {
  front: React.ReactNode;
  back: React.ReactNode;
  isFlipped: boolean;
  onFlip: () => void;
}

function Flashcard({ front, back, isFlipped, onFlip }: FlashcardProps) {
  return (
    <div
      onClick={onFlip}
      className="flashcard-wrapper"
      style={{ perspective: '1000px', cursor: 'pointer' }}
    >
      <div
        className="flashcard-inner"
        style={{
          position: 'relative',
          width: '100%',
          minHeight: '200px',
          transition: 'transform 0.6s',
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        <div
          className="flashcard-front"
          style={{
            position: 'absolute',
            inset: 0,
            backfaceVisibility: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {front}
        </div>
        <div
          className="flashcard-back"
          style={{
            position: 'absolute',
            inset: 0,
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {back}
        </div>
      </div>
    </div>
  );
}

interface VocabularyProgress {
  learned: string[];
  lastReviewed: Record<string, number>;
}

function loadProgress(): VocabularyProgress {
  try {
    const raw = localStorage.getItem('vocabulary-progress');
    if (!raw) return { learned: [], lastReviewed: {} };
    const parsed = JSON.parse(raw);
    return {
      learned: Array.isArray(parsed.learned) ? parsed.learned : [],
      lastReviewed: parsed.lastReviewed ?? {},
    };
  } catch {
    return { learned: [], lastReviewed: {} };
  }
}

function saveProgress(progress: VocabularyProgress): void {
  try {
    localStorage.setItem('vocabulary-progress', JSON.stringify(progress));
  } catch {
    // Continue even when storage fails
  }
}

export default function VocabularyView() {
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [progress, setProgress] = useState<VocabularyProgress>(loadProgress);
  const [studyMode, setStudyMode] = useState<'all' | 'unlearned'>('all');

  const filteredTerms = useMemo(() => {
    let terms = vocabularyTerms;
    if (categoryFilter !== 'all') {
      terms = terms.filter(t => t.category === categoryFilter);
    }
    if (studyMode === 'unlearned') {
      terms = terms.filter(t => !progress.learned.includes(t.id));
    }
    return terms;
  }, [categoryFilter, studyMode, progress.learned]);

  const currentTerm = filteredTerms[currentIndex] || null;

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex(i => (i + 1) % filteredTerms.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex(i => (i - 1 + filteredTerms.length) % filteredTerms.length);
  };

  const handleMarkLearned = () => {
    if (!currentTerm) return;
    const newLearned = progress.learned.includes(currentTerm.id)
      ? progress.learned.filter(id => id !== currentTerm.id)
      : [...progress.learned, currentTerm.id];
    const newProgress: VocabularyProgress = {
      ...progress,
      learned: newLearned,
      lastReviewed: { ...progress.lastReviewed, [currentTerm.id]: Date.now() },
    };
    setProgress(newProgress);
    saveProgress(newProgress);
  };

  const handleShuffle = () => {
    setIsFlipped(false);
    setCurrentIndex(Math.floor(Math.random() * filteredTerms.length));
  };

  const categoryName = (cat: VocabularyTerm['category']) =>
    vocabularyCategories.find(c => c.id === cat)?.name ?? cat;

  const totalLearned = progress.learned.length;
  const totalTerms = vocabularyTerms.length;

  return (
    <div className="vocabulary-view">
      <header className="vocabulary-header">
        <h2>Vocabulaire littéraire</h2>
        <div className="progress-stats">
          <span className="progress-text">
            {totalLearned} / {totalTerms} termes appris
          </span>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${(totalLearned / totalTerms) * 100}%` }}
            />
          </div>
        </div>
      </header>

      <div className="vocabulary-filters">
        <div className="filter-group">
          <label>Catégorie :</label>
          <select
            value={categoryFilter}
            onChange={e => { setCategoryFilter(e.target.value as CategoryFilter); setCurrentIndex(0); setIsFlipped(false); }}
          >
            <option value="all">Toutes</option>
            {vocabularyCategories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name} ({cat.count})</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Mode :</label>
          <select
            value={studyMode}
            onChange={e => { setStudyMode(e.target.value as 'all' | 'unlearned'); setCurrentIndex(0); setIsFlipped(false); }}
          >
            <option value="all">Tous les termes</option>
            <option value="unlearned">Non appris uniquement</option>
          </select>
        </div>
      </div>

      {filteredTerms.length === 0 ? (
        <div className="empty-state">
          <p>Tous les termes de cette catégorie ont été appris !</p>
          <button onClick={() => setStudyMode('all')} className="btn-secondary">
            Revoir tous les termes
          </button>
        </div>
      ) : (
        <>
          <div className="flashcard-container">
            <Flashcard
              front={
                <div className="vocab-front">
                  <span className="vocab-category">{categoryName(currentTerm!.category)}</span>
                  <h3 className="vocab-term">{currentTerm!.term}</h3>
                </div>
              }
              back={
                <div className="vocab-back">
                  <p className="vocab-definition">{currentTerm!.definition}</p>
                  {currentTerm!.example && (
                    <p className="vocab-example">Exemple : {currentTerm!.example}</p>
                  )}
                </div>
              }
              isFlipped={isFlipped}
              onFlip={() => setIsFlipped(f => !f)}
            />
          </div>

          <div className="flashcard-counter">
            {currentIndex + 1} / {filteredTerms.length}
          </div>

          <div className="flashcard-actions">
            <button onClick={handlePrev} className="btn-nav" title="Précédent">
              ←
            </button>
            <button
              onClick={handleMarkLearned}
              className={progress.learned.includes(currentTerm?.id ?? '') ? 'btn-learned' : 'btn-learn'}
            >
              {progress.learned.includes(currentTerm?.id ?? '') ? '✓ Appris' : 'Marquer appris'}
            </button>
            <button onClick={handleShuffle} className="btn-secondary" title="Aléatoire">
              🎲
            </button>
            <button onClick={handleNext} className="btn-nav" title="Suivant">
              →
            </button>
          </div>
        </>
      )}

      <style>{`
        .vocabulary-view {
          max-width: 800px;
          margin: 0 auto;
          padding: 1.5rem;
        }
        .vocabulary-header {
          text-align: center;
          margin-bottom: 2rem;
        }
        .vocabulary-header h2 {
          margin: 0 0 1rem 0;
          font-size: 1.75rem;
        }
        .progress-stats {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }
        .progress-text {
          font-size: 0.9rem;
          color: var(--text-muted, #6b7280);
        }
        .progress-bar {
          width: 200px;
          height: 8px;
          background: var(--bg-secondary, #e5e7eb);
          border-radius: 4px;
          overflow: hidden;
        }
        .progress-fill {
          height: 100%;
          background: var(--accent-color, #10b981);
          transition: width 0.3s ease;
        }
        .vocabulary-filters {
          display: flex;
          gap: 1.5rem;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          justify-content: center;
        }
        .filter-group {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .filter-group label {
          font-size: 0.9rem;
          font-weight: 500;
        }
        .filter-group select {
          padding: 0.4rem 0.8rem;
          border-radius: 6px;
          border: 1px solid var(--border-color, #d1d5db);
          background: var(--bg-primary, #fff);
          font-size: 0.9rem;
        }
        .flashcard-container {
          perspective: 1000px;
          margin-bottom: 1rem;
        }
        .flashcard-counter {
          text-align: center;
          font-size: 0.85rem;
          color: var(--text-muted, #6b7280);
          margin-bottom: 1rem;
        }
        .vocab-front {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          padding: 2rem;
        }
        .vocab-category {
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--accent-color, #6366f1);
          background: var(--bg-secondary, #f3f4f6);
          padding: 0.25rem 0.75rem;
          border-radius: 999px;
        }
        .vocab-term {
          font-size: 1.75rem;
          margin: 0;
        }
        .vocab-back {
          padding: 2rem;
        }
        .vocab-definition {
          font-size: 1.1rem;
          line-height: 1.6;
          margin: 0 0 1rem 0;
        }
        .vocab-example {
          font-style: italic;
          color: var(--text-muted, #6b7280);
          margin: 0;
          padding-left: 1rem;
          border-left: 3px solid var(--accent-color, #6366f1);
        }
        .flashcard-actions {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 0.75rem;
        }
        .btn-nav {
          padding: 0.5rem 1rem;
          border-radius: 8px;
          border: 1px solid var(--border-color, #d1d5db);
          background: var(--bg-primary, #fff);
          cursor: pointer;
          font-size: 1.25rem;
          transition: all 0.2s;
        }
        .btn-nav:hover {
          background: var(--bg-secondary, #f3f4f6);
        }
        .btn-learn {
          padding: 0.5rem 1rem;
          border-radius: 8px;
          border: none;
          background: var(--accent-color, #10b981);
          color: white;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
        }
        .btn-learn:hover {
          opacity: 0.9;
        }
        .btn-learned {
          padding: 0.5rem 1rem;
          border-radius: 8px;
          border: 2px solid var(--accent-color, #10b981);
          background: transparent;
          color: var(--accent-color, #10b981);
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
        }
        .btn-secondary {
          padding: 0.5rem 1rem;
          border-radius: 8px;
          border: 1px solid var(--border-color, #d1d5db);
          background: var(--bg-primary, #fff);
          cursor: pointer;
          font-size: 1rem;
          transition: all 0.2s;
        }
        .btn-secondary:hover {
          background: var(--bg-secondary, #f3f4f6);
        }
        .empty-state {
          text-align: center;
          padding: 3rem;
        }
        .empty-state p {
          font-size: 1.1rem;
          margin-bottom: 1.5rem;
        }
      `}</style>
    </div>
  );
}
