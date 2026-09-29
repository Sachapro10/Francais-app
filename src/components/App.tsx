import { useState, useRef, useCallback, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  BookOpen, Upload, Layers, Target, Trophy, ChevronRight,
  ChevronLeft, CheckCircle2, XCircle, HelpCircle, Eye, EyeOff,
  MousePointerClick, Sparkles, RotateCcw, List, Edit3, BarChart3, Plus, Check, CloudOff, Library, Trash2, Clock
} from 'lucide-react';
import { EtudeLineaire, CitationItem, ViewMode, Movement } from '../types/etude';
import { parseDocxFile } from '../utils/docxParser';
import { dormeurDuValEtude } from '../utils/dormeurDuVal';
import StudyView from './StudyView';
import QuizView from './QuizView';
import FlashcardView from './FlashcardView';
import EditorView from './EditorView';
import ConfettiCelebration from './ConfettiCelebration';
import PasteView from './PasteView';

interface SavedAnalysis {
  id: string;
  title: string;
  author?: string;
  savedAt: number; // ms timestamp
  etude: EtudeLineaire;
}

interface CloudAnalysis {
  id: string;
  title: string;
  author?: string;
  created_at: string;
  etude: EtudeLineaire;
}

const STORAGE_KEY = 'etude-analyses-v1';
const SUPABASE_URL = ((import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env?.VITE_SUPABASE_URL ?? 'https://bbgvmialvmvxlxdloueo.supabase.co').replace(/\/$/, '');
const SUPABASE_ANON_KEY = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env?.VITE_SUPABASE_ANON_KEY ?? '';
const SHARED_ANALYSES_ENDPOINT = `${SUPABASE_URL}/rest/v1/shared_analyses`;

function loadAnalyses(): SavedAnalysis[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SavedAnalysis[];
  } catch {
    return [];
  }
}

function saveAnalyses(list: SavedAnalysis[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export default function App({}: {}) {
  const saved = loadAnalyses();
  const latest = saved[0] ?? dormeurDuValEtude;
  const [etude, setEtude] = useState<EtudeLineaire>(latest.etude ?? latest);
  const [currentId, setCurrentId] = useState<string>(saved[0]?.id ?? 'builtin');
  const [view, setView] = useState<ViewMode>('study');
  const [fileInputKey, setFileInputKey] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showIntro, setShowIntro] = useState(false);
  const [showAnalyses, setShowAnalyses] = useState(false);
  const [cloudAnalyses, setCloudAnalyses] = useState<CloudAnalysis[]>([]);
  const [cloudStatus, setCloudStatus] = useState<'idle' | 'loading' | 'publishing' | 'ready' | 'error'>('idle');
  const [cloudMessage, setCloudMessage] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('saved');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-save current analysis on every etude change
  useEffect(() => {
    setSaveStatus('saving');
    const timeout = setTimeout(() => {
      setSaveAnalyses(prev => {
        const now = Date.now();
        const existing = prev.findIndex(a => a.id === currentId);
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = { ...updated[existing], savedAt: now, etude };
          saveAnalyses(updated);
        } else {
          const newAnalyses = [{ id: currentId, title: etude.title, author: etude.author, savedAt: now, etude }, ...prev];
          saveAnalyses(newAnalyses);
        }
        return prev; // keep reference for reactivity
      });
      setSaveStatus('saved');
    }, 600);
    return () => clearTimeout(timeout);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [etude]);

  const setSaveAnalyses = useCallback((updater: (prev: SavedAnalysis[]) => SavedAnalysis[]) => {
    setAnalysesList(updater);
  }, []);

  const [analysesList, setAnalysesList] = useState<SavedAnalysis[]>(() => loadAnalyses());

  const triggerConfetti = useCallback(() => {
    setShowConfetti(true);
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.55 },
      colors: ['#a78bfa', '#f472b6', '#34d399', '#fbbf24', '#60a5fa'],
    });
    setTimeout(() => setShowConfetti(false), 3000);
  }, []);

  const switchAnalysis = useCallback((analysis: SavedAnalysis) => {
    setEtude(analysis.etude);
    setCurrentId(analysis.id);
    setShowAnalyses(false);
    setView('study');
  }, []);

  const deleteAnalysis = useCallback((id: string) => {
    setAnalysesList(prev => {
      const next = prev.filter(a => a.id !== id);
      saveAnalyses(next);
      return next;
    });
    if (currentId === id) {
      const remaining = loadAnalyses();
      const fallback = remaining[0] ?? dormeurDuValEtude;
      setEtude(fallback.etude ?? fallback);
      setCurrentId(remaining[0]?.id ?? 'builtin');
    }
  }, [currentId]);

  const navItems: { mode: ViewMode; label: string; icon: React.ReactNode; desc: string }[] = [
    { mode: 'study', label: 'Étude', icon: <BookOpen size={18} />, desc: 'Lire et réviser' },
    { mode: 'quiz', label: 'Quiz', icon: <Target size={18} />, desc: 'Tester ses connaissances' },
    { mode: 'flashcards', label: 'Cartes', icon: <Layers size={18} />, desc: 'Mémoriser les procédés' },
    { mode: 'editor', label: 'Éditer', icon: <Edit3 size={18} />, desc: 'Modifier le contenu' },
    { mode: 'newText', label: 'Importer', icon: <Plus size={18} />, desc: 'Importer depuis un texte' },
  ];

  const handleImporterSave = useCallback((newEtude: EtudeLineaire) => {
    const id = `analysis-${Date.now()}`;
    setCurrentId(id);
    setEtude(newEtude);
    setAnalysesList(prev => {
      const updated = [{ id, title: newEtude.title, author: newEtude.author, savedAt: Date.now(), etude: newEtude }, ...prev.filter(a => a.id !== id)];
      saveAnalyses(updated);
      return updated;
    });
    setView('study');
  }, []);

  const handleStartNew = () => {
    setShowIntro(false);
    setView('newText');
  };

  const handleContinueSaved = () => {
    setShowIntro(false);
    setView('study');
  };

  const supabaseHeaders = useCallback((): HeadersInit => ({
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
  }), []);

  const loadCloudAnalyses = useCallback(async () => {
    if (!SUPABASE_ANON_KEY) {
      setCloudStatus('error');
      setCloudMessage('Ajoutez VITE_SUPABASE_ANON_KEY pour utiliser la bibliothèque cloud.');
      return;
    }
    setCloudStatus('loading');
    try {
      const response = await fetch(`${SHARED_ANALYSES_ENDPOINT}?select=id,title,author,created_at,etude&order=created_at.desc`, {
        headers: supabaseHeaders(),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      setCloudAnalyses(await response.json() as CloudAnalysis[]);
      setCloudStatus('ready');
      setCloudMessage('');
    } catch {
      setCloudStatus('error');
      setCloudMessage('La bibliothèque cloud est momentanément indisponible.');
    }
  }, [supabaseHeaders]);

  const publishCurrentAnalysis = useCallback(async () => {
    if (!SUPABASE_ANON_KEY) {
      setCloudStatus('error');
      setCloudMessage('Ajoutez VITE_SUPABASE_ANON_KEY pour publier une analyse.');
      return;
    }
    setCloudStatus('publishing');
    try {
      const response = await fetch(SHARED_ANALYSES_ENDPOINT, {
        method: 'POST',
        headers: { ...supabaseHeaders(), Prefer: 'return=minimal' },
        body: JSON.stringify({ title: etude.title, author: etude.author ?? null, etude }),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      setCloudStatus('ready');
      setCloudMessage('Analyse publiée dans la bibliothèque.');
      await loadCloudAnalyses();
    } catch {
      setCloudStatus('error');
      setCloudMessage('Publication impossible. Vérifiez la configuration Supabase.');
    }
  }, [etude, loadCloudAnalyses, supabaseHeaders]);

  const loadCloudAnalysis = useCallback((analysis: CloudAnalysis) => {
    const localId = `cloud-${analysis.id}`;
    setEtude(analysis.etude);
    setCurrentId(localId);
    setAnalysesList(previous => {
      const next = [{ id: localId, title: analysis.title, author: analysis.author, savedAt: Date.now(), etude: analysis.etude }, ...previous.filter(item => item.id !== localId)];
      saveAnalyses(next);
      return next;
    });
    setShowAnalyses(false);
    setView('study');
  }, []);

  const currentAnalysis = analysesList.find(a => a.id === currentId);
  const analysesTitle = currentAnalysis?.title ?? etude.title;
  const analysesAuthor = currentAnalysis?.author ?? etude.author;

  const formatSavedAt = (ts: number) => {
    const d = new Date(ts);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
    if (diffDays === 0) return `Aujourd'hui à ${d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
    if (diffDays === 1) return `Hier à ${d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="min-h-screen flex flex-col">
      {showConfetti && <ConfettiCelebration />}

      {/* Welcome overlay — shown only on first load with a saved study */}
      {showIntro && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm rustic-backdrop"
          onClick={handleContinueSaved}
        >
          <div className="max-w-2xl mx-auto p-8 text-center">
            <div className="text-6xl mb-6">📖</div>
            <h1 className="font-serif-literary text-4xl font-bold text-white mb-4 leading-tight">
              Étude Linéaire<br />Interactive
            </h1>
            <p className="text-slate-400 text-lg mb-8 leading-relaxed">
              Collez votre texte d'étude linéaire —<br />
              le reste est analysé automatiquement.
            </p>

            <div className="mb-8">
              <p className="text-slate-400 text-base mb-6 leading-relaxed">
                Collez votre texte d'étude linéaire —<br />
                le reste est analysé automatiquement.
              </p>
              <button
                onClick={(e) => { e.stopPropagation(); handleStartNew(); }}
                className="copper-action inline-flex items-center gap-3 px-8 py-4 text-white rounded-xl font-semibold cursor-pointer transition-all duration-200 hover:scale-[1.02]"
              >
                <Plus size={20} />
                Nouvelle analyse
                <ChevronRight size={18} />
              </button>
            </div>

            <button
              onClick={(e) => { e.stopPropagation(); setShowIntro(false); }}
              className="text-slate-500 hover:text-slate-300 text-sm transition-colors"
            >
              Utiliser l'exemple <em>Le Dormeur du val</em>
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 wood-rail backdrop-blur-xl border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button onClick={() => setShowAnalyses(true)} className="flex items-center gap-3 group">
              <div className="wood-icon w-9 h-9 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                <BookOpen size={18} className="text-white" />
              </div>
              <div className="hidden sm:block">
                <div className="text-sm font-semibold text-white leading-tight">
                  {view === 'newText' ? 'Nouvelle Étude' : analysesTitle}
                </div>
                {view !== 'newText' && analysesAuthor && (
                  <div className="text-xs text-slate-500">{analysesAuthor}</div>
                )}
              </div>
            </button>

            <div className="flex items-center gap-2">
              {/* Analyses switcher */}
              <button
                onClick={() => setShowAnalyses(true)}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-white/5 transition-all"
              >
                <Library size={14} />
                Mes analyses
                {analysesList.length > 0 && (
                  <span className="bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                    {analysesList.length}
                  </span>
                )}
              </button>

              {/* Cloud library */}
              <button
                onClick={() => { setShowAnalyses(true); void loadCloudAnalyses(); }}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                title="Ouvrir la bibliothèque partagée"
              >
                <CloudOff size={14} />
                Bibliothèque
              </button>

              {/* Save indicator */}
              <div className="hidden sm:flex items-center gap-1.5 text-xs">
                {saveStatus === 'saving' && (
                  <span className="text-slate-600">sauvegarde…</span>
                )}
                {saveStatus === 'saved' && (
                  <span className="text-emerald-500/70 flex items-center gap-1">
                    <Check size={11} />
                    Sauvegardé
                  </span>
                )}
                {saveStatus === 'idle' && (
                  <span className="text-slate-700 flex items-center gap-1">
                    <CloudOff size={11} />
                    Non sauvegardé
                  </span>
                )}
              </div>

              <nav className="wood-nav flex items-center gap-1 rounded-xl p-1">
                {navItems.map(item => (
                  <button
                    key={item.mode}
                    onClick={() => setView(item.mode)}
                    className={`wood-tab flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                      view === item.mode
                        ? 'bg-indigo-600 text-white border-b-2 border-amber-500 shadow-none'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {item.icon}
                    <span className="hidden xs:inline">{item.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        {view === 'study' && <StudyView etude={etude} />}
        {view === 'quiz' && <QuizView etude={etude} onComplete={triggerConfetti} />}
        {view === 'flashcards' && <FlashcardView etude={etude} />}
        {view === 'editor' && <EditorView etude={etude} onSave={(newEtude) => { setEtude(newEtude); }} />}
        {view === 'newText' && (
          <PasteView
            onSave={handleImporterSave}
            onCancel={() => setView('study')}
          />
        )}

        {/* Analyses switcher modal */}
        {showAnalyses && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            <div className="absolute inset-0 bg-[#3b2a21]/20 backdrop-blur-sm" onClick={() => setShowAnalyses(false)} />
            <div className="relative w-full sm:max-w-md rustic-modal rounded-t-2xl sm:rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-white/5">
                <h2 className="font-semibold text-white text-base">Mes analyses</h2>
                <button
                  onClick={() => setShowAnalyses(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <XCircle size={20} />
                </button>
              </div>

              <div className="p-3 space-y-2 max-h-80 overflow-y-auto">
                {analysesList.length === 0 && (
                  <p className="text-slate-500 text-sm text-center py-8">
                    Aucune analyse sauvegardée.
                  </p>
                )}
                {analysesList.map(analysis => (
                  <button
                    key={analysis.id}
                    onClick={() => switchAnalysis(analysis)}
                    className={`w-full flex items-start justify-between gap-3 p-3 rounded-lg transition-all text-left ${
                      analysis.id === currentId
                        ? 'bg-indigo-600/20 border border-indigo-500/40'
                        : 'bg-slate-800/50 border border-transparent hover:bg-slate-800 hover:border-white/5'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white truncate">{analysis.title}</div>
                      {analysis.author && (
                        <div className="text-xs text-slate-500 truncate">{analysis.author}</div>
                      )}
                      <div className="flex items-center gap-1 mt-1 text-xs text-slate-600">
                        <Clock size={10} />
                        {formatSavedAt(analysis.savedAt)}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {analysis.id === currentId && (
                        <span className="text-indigo-400 text-xs">Actuelle</span>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteAnalysis(analysis.id); }}
                        className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </button>
                ))}
              </div>

              <div className="p-3 border-t border-white/5 space-y-2">
                <button
                  onClick={() => void publishCurrentAnalysis()}
                  disabled={cloudStatus === 'publishing'}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border border-amber-500/40 text-amber-700 hover:bg-amber-500/10 transition-colors disabled:opacity-50"
                >
                  <Upload size={16} />
                  {cloudStatus === 'publishing' ? 'Publication…' : 'Partager cette analyse'}
                </button>
                <button
                  onClick={() => { setShowAnalyses(false); setView('newText'); }}
                  className="copper-action w-full flex items-center justify-center gap-2 px-4 py-2.5 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  <Plus size={16} />
                  Nouvelle analyse
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Shared cloud library */}
        {showAnalyses && cloudStatus !== 'idle' && (
          <div className="fixed inset-0 z-[51] flex items-end sm:items-center justify-center">
            <div className="absolute inset-0 bg-[#3b2a21]/10" onClick={() => setCloudStatus('idle')} />
            <div className="relative w-full sm:max-w-md rustic-modal rounded-t-2xl sm:rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-white/5">
                <h2 className="font-semibold text-white text-base">Bibliothèque partagée</h2>
                <button onClick={() => setCloudStatus('idle')} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"><XCircle size={20} /></button>
              </div>
              <div className="p-3 max-h-80 overflow-y-auto space-y-2">
                {cloudMessage && <p className="text-xs text-slate-500 px-1 py-2">{cloudMessage}</p>}
                {cloudStatus === 'loading' && <p className="text-sm text-slate-500 text-center py-6">Chargement…</p>}
                {cloudStatus === 'ready' && cloudAnalyses.length === 0 && <p className="text-sm text-slate-500 text-center py-6">Aucune analyse partagée.</p>}
                {cloudAnalyses.map(analysis => (
                  <button key={analysis.id} onClick={() => loadCloudAnalysis(analysis)} className="w-full text-left p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 border border-transparent hover:border-white/5 transition-all">
                    <div className="text-sm font-medium text-white truncate">{analysis.title}</div>
                    {analysis.author && <div className="text-xs text-slate-500 truncate">{analysis.author}</div>}
                    <div className="flex items-center gap-1 mt-1 text-xs text-slate-600"><Clock size={10} />{formatSavedAt(new Date(analysis.created_at).getTime())}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}