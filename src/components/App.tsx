import { useState, useRef, useCallback, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  BookOpen, Upload, Layers, Target, Trophy, ChevronRight,
  ChevronLeft, CheckCircle2, XCircle, HelpCircle, Eye, EyeOff,
  MousePointerClick, Sparkles, RotateCcw, List, Edit3, BarChart3, Plus, Check, CloudOff, Library, Trash2, Clock, Search, Download, FolderOpen
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
  const [showIntro, setShowIntro] = useState(true);
  const [showAnalyses, setShowAnalyses] = useState(false);
  const [startupChoice, setStartupChoice] = useState<'cloud' | 'new' | 'local' | null>(saved.length === 0 ? null : 'local');
  const [cloudSearch, setCloudSearch] = useState('');
  const [libraryTab, setLibraryTab] = useState<'local' | 'shared'>('local');
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
    setShowIntro(false);
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
    setShowIntro(false);
    setShowAnalyses(false);
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

  const openLibrary = useCallback((tab: 'local' | 'shared') => {
    setLibraryTab(tab);
    setShowAnalyses(true);
    if (tab === 'shared') void loadCloudAnalyses();
  }, [loadCloudAnalyses]);

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
    setShowIntro(false);
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
  const filteredCloudAnalyses = cloudAnalyses.filter(analysis => {
    const query = cloudSearch.trim().toLocaleLowerCase();
    return !query || `${analysis.title} ${analysis.author ?? ''}`.toLocaleLowerCase().includes(query);
  });

  const formatSavedAt = (ts: number) => {
    const d = new Date(ts);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
    if (diffDays === 0) return `Aujourd'hui à ${d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
    if (diffDays === 1) return `Hier à ${d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="app-shell min-h-screen flex flex-col overflow-x-hidden">
      {showConfetti && <ConfettiCelebration />}

      {showIntro && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[#3b2a21]/20 p-4 backdrop-blur-sm sm:p-8">
          <div className="rustic-modal my-4 w-full max-w-4xl rounded-2xl p-6 sm:my-10 sm:p-8">
            <div className="mx-auto max-w-2xl text-center">
              <div className="wood-icon mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"><BookOpen size={26} className="text-white" /></div>
              <h1 className="font-serif-literary text-3xl font-bold text-white sm:text-4xl">Votre espace d’étude</h1>
              <p className="mt-2 text-sm text-slate-500 sm:text-base">Choisissez comment commencer votre prochaine analyse.</p>
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <button onClick={(e) => { e.stopPropagation(); setStartupChoice('cloud'); setLibraryTab('shared'); void loadCloudAnalyses(); }} className={`wood-panel rounded-2xl border p-5 text-left transition-all hover:-translate-y-1 hover:border-amber-500/50 ${startupChoice === 'cloud' ? 'border-amber-500/50' : ''}`}>
                <Download size={22} className="mb-4 text-amber-600" />
                <h2 className="font-semibold text-white">Télécharger du cloud</h2>
                <p className="mt-2 text-sm text-slate-500">Parcourez les analyses partagées et recherchez un titre ou un auteur.</p>
              </button>
              <button onClick={(e) => { e.stopPropagation(); setStartupChoice('new'); handleStartNew(); }} className="copper-action rounded-2xl p-5 text-left text-white transition-all hover:-translate-y-1">
                <Plus size={22} className="mb-4" />
                <h2 className="font-semibold">Créer une nouvelle étude</h2>
                <p className="mt-2 text-sm text-white/75">Importez votre poème et votre étude linéaire.</p>
              </button>
              <button onClick={(e) => { e.stopPropagation(); setStartupChoice('local'); setLibraryTab('local'); setShowIntro(false); setShowAnalyses(true); }} className="wood-panel rounded-2xl border p-5 text-left transition-all hover:-translate-y-1 hover:border-amber-500/50">
                <FolderOpen size={22} className="mb-4 text-emerald-700" />
                <h2 className="font-semibold text-white">Charger depuis le local</h2>
                <p className="mt-2 text-sm text-slate-500">Ouvrez une analyse déjà sauvegardée sur cet appareil.</p>
              </button>
            </div>
            {startupChoice === 'cloud' && (
              <div className="mt-6 border-t border-white/10 pt-5">
                <div className="relative mb-3">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input value={cloudSearch} onChange={event => setCloudSearch(event.target.value)} placeholder="Rechercher une analyse…" className="paper-input w-full rounded-lg border py-2.5 pl-9 pr-3 text-sm" autoFocus />
                </div>
                <div className="max-h-56 space-y-2 overflow-y-auto">
                  {cloudStatus === 'loading' && <p className="py-6 text-center text-sm text-slate-500">Chargement des analyses…</p>}
                  {cloudStatus === 'error' && <p className="py-6 text-center text-sm text-red-600">{cloudMessage}</p>}
                  {cloudStatus === 'ready' && filteredCloudAnalyses.length === 0 && <p className="py-6 text-center text-sm text-slate-500">Aucune analyse trouvée.</p>}
                  {filteredCloudAnalyses.map(analysis => (
                    <button key={analysis.id} onClick={() => loadCloudAnalysis(analysis)} className="w-full rounded-lg border border-white/10 bg-white/5 p-3 text-left hover:bg-white/10">
                      <div className="text-sm font-medium text-white">{analysis.title}</div>
                      {analysis.author && <div className="text-xs text-slate-500">par {analysis.author}</div>}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {saved.length > 0 && startupChoice === null && <p className="mt-6 text-center text-xs text-slate-500">Vous avez {saved.length} analyse{saved.length > 1 ? 's' : ''} locale{saved.length > 1 ? 's' : ''} disponible{saved.length > 1 ? 's' : ''}.</p>}
          </div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 wood-rail backdrop-blur-xl border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 min-w-0">
            <button onClick={() => openLibrary('local')} className="flex items-center gap-3 group min-w-0 text-left">
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
                onClick={() => openLibrary('local')}
                className="flex items-center gap-2 px-2 sm:px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                aria-label="Ouvrir mes analyses"
              >
                <Library size={14} />
                <span className="hidden sm:inline">Mes analyses</span>
                {analysesList.length > 0 && (
                  <span className="bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                    {analysesList.length}
                  </span>
                )}
              </button>

              {/* Cloud library */}
              <button
                onClick={() => openLibrary('shared')}
                className="flex items-center gap-2 px-2 sm:px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                title="Ouvrir la bibliothèque partagée"
                aria-label="Ouvrir la bibliothèque partagée"
              >
                <CloudOff size={14} />
                <span className="hidden sm:inline">Bibliothèque</span>
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
      <main className={`app-main flex-1 min-h-0 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-3 sm:py-4 ${view === 'study' ? 'study-main' : ''}`}>
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

        {showAnalyses && (
          <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center overflow-y-auto p-3 sm:p-6">
            <div className="absolute inset-0 bg-[#3b2a21]/20 backdrop-blur-sm" onClick={() => setShowAnalyses(false)} />
            <div className="relative w-full sm:max-w-lg max-h-[calc(100dvh-1.5rem)] sm:max-h-[min(760px,calc(100dvh-3rem))] rustic-modal rounded-2xl overflow-hidden flex flex-col my-0 sm:mt-0">
              <div className="flex items-center justify-between p-4 border-b border-white/5 shrink-0">
                <h2 className="font-semibold text-white text-base">Bibliothèque</h2>
                <button onClick={() => setShowAnalyses(false)} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors" aria-label="Fermer la bibliothèque"><XCircle size={20} /></button>
              </div>

              <div className="grid grid-cols-2 gap-2 p-3 border-b border-white/5 shrink-0">
                <button onClick={() => setLibraryTab('local')} className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${libraryTab === 'local' ? 'copper-action text-white' : 'text-slate-500 hover:bg-white/5 hover:text-white'}`}>
                  <Library size={15} /> Mes analyses
                </button>
                <button onClick={() => { setLibraryTab('shared'); void loadCloudAnalyses(); }} className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${libraryTab === 'shared' ? 'copper-action text-white' : 'text-slate-500 hover:bg-white/5 hover:text-white'}`}>
                  <CloudOff size={15} /> Partagée
                </button>
              </div>

              <div className="library-content min-h-0 flex-1 p-3 space-y-2 overflow-y-auto">
                {libraryTab === 'shared' ? (
                  <>
                    <p className="text-xs text-slate-500 px-1 pb-1">Découvrez les analyses publiées par la communauté.</p>
                    {cloudMessage && <p className="text-xs text-slate-500 px-1 py-2">{cloudMessage}</p>}
                    {cloudStatus === 'loading' && <p className="text-sm text-slate-500 text-center py-6">Chargement…</p>}
                    {cloudStatus === 'ready' && cloudAnalyses.length === 0 && <p className="text-sm text-slate-500 text-center py-6">Aucune analyse partagée pour le moment.</p>}
                    {cloudAnalyses.map(analysis => (
                      <button key={analysis.id} onClick={() => loadCloudAnalysis(analysis)} className="w-full text-left p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 border border-transparent hover:border-white/5 transition-all">
                        <div className="text-sm font-medium text-white truncate">{analysis.title}</div>
                        {analysis.author && <div className="text-xs text-slate-500 truncate">par {analysis.author}</div>}
                        <div className="flex items-center gap-1 mt-1 text-xs text-slate-600"><Clock size={10} />{formatSavedAt(new Date(analysis.created_at).getTime())}</div>
                      </button>
                    ))}
                  </>
                ) : (
                  <>
                    {analysesList.length === 0 && <p className="text-slate-500 text-sm text-center py-8">Aucune analyse sauvegardée.</p>}
                    {analysesList.map(analysis => (
                      <button key={analysis.id} onClick={() => switchAnalysis(analysis)} className={`w-full flex items-start justify-between gap-3 p-3 rounded-lg transition-all text-left ${analysis.id === currentId ? 'bg-indigo-600/20 border border-indigo-500/40' : 'bg-slate-800/50 border border-transparent hover:bg-slate-800 hover:border-white/5'}`}>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-white truncate">{analysis.title}</div>
                          {analysis.author && <div className="text-xs text-slate-500 truncate">{analysis.author}</div>}
                          <div className="flex items-center gap-1 mt-1 text-xs text-slate-600"><Clock size={10} />{formatSavedAt(analysis.savedAt)}</div>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {analysis.id === currentId && <span className="text-indigo-400 text-xs">Actuelle</span>}
                          <span onClick={(e) => { e.stopPropagation(); deleteAnalysis(analysis.id); }} role="button" tabIndex={0} className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-colors" title="Supprimer" aria-label={`Supprimer ${analysis.title}`}><Trash2 size={14} /></span>
                        </div>
                      </button>
                    ))}
                  </>
                )}
              </div>

              <div className="p-3 border-t border-white/5 shrink-0 space-y-2">
                {libraryTab === 'shared' && (
                  <button onClick={() => void publishCurrentAnalysis()} disabled={cloudStatus === 'publishing'} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border border-amber-500/40 text-amber-700 hover:bg-amber-500/10 transition-colors disabled:opacity-50">
                    <Upload size={16} /> {cloudStatus === 'publishing' ? 'Publication…' : 'Publier cette analyse'}
                  </button>
                )}
                <button onClick={() => { setShowAnalyses(false); setView('newText'); }} className="copper-action w-full flex items-center justify-center gap-2 px-4 py-2.5 text-white rounded-lg text-sm font-medium transition-colors">
                  <Plus size={16} /> Nouvelle analyse
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}