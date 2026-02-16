
// v2.18 - MelodIA lab Brand Restoration & Correct Domain (.net)
import React, { useState, useEffect } from 'react';
import { ViewState, Song, Rehearsal, User } from './types';
import { RehearsalView } from './components/RehearsalView';
import { SongEditor } from './components/SongEditor';
import { ChordViewer } from './components/ChordViewer';
import { LandingPage } from './components/LandingPage';
import { CreateRehearsal } from './components/CreateRehearsal';
import { SongLibrary } from './components/SongLibrary';
import { Navbar } from './components/Navbar';
import { Button } from './components/Button';
import { SongComposer } from './components/SongComposer';
import { 
  Plus, 
  Music4, 
  CalendarDays, 
  Loader2, 
  AlertCircle, 
  Heart, 
  Music2, 
  Shield, 
  FileText, 
  BookOpen, 
  Gift,
  Wand2,
  Sparkles,
  ArrowRight,
  FlaskConical
} from 'lucide-react';
import { subscribeToRehearsals, saveRehearsal, subscribeToSongs } from './services/storageService';
import { getCurrentUser, logout } from './services/authService';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { auth } from './services/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';

function AppContent() {
  const { t } = useLanguage();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [view, setView] = useState<ViewState>(ViewState.DASHBOARD);
  const [selectedRehearsal, setSelectedRehearsal] = useState<Rehearsal | null>(null);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [activePlaylist, setActivePlaylist] = useState<Song[]>([]);
  
  const [rehearsals, setRehearsals] = useState<Rehearsal[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);
  const [isDark, setIsDark] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);
  const [isAuthSynced, setIsAuthSynced] = useState(false);

  useEffect(() => {
    const localUser = getCurrentUser();
    if (localUser) setCurrentUser(localUser);

    const isDarkMode = document.documentElement.classList.contains('dark');
    setIsDark(isDarkMode);

    const unsubAuth = onAuthStateChanged(auth, (fbUser) => {
        if (fbUser) {
            setIsAuthSynced(true);
        } else {
            setIsAuthSynced(false);
            if (!localUser) setIsLoading(false);
        }
    });

    return () => unsubAuth();
  }, []);

  useEffect(() => {
    if (!currentUser || !isAuthSynced) return;
    
    setIsLoading(true);
    setDbError(null);

    const unsubRehearsals = subscribeToRehearsals(
      (data) => {
        setRehearsals(data);
        setIsLoading(false);
        setDbError(null);
      },
      (error: any) => {
        setIsLoading(false);
        if (error.code === 'permission-denied') {
            setDbError("Tu sesión no tiene permisos suficientes.");
        }
      }
    );

    const unsubSongs = subscribeToSongs((data) => setSongs(data), () => {});

    return () => {
      unsubRehearsals();
      unsubSongs();
    };
  }, [currentUser, isAuthSynced]);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    document.documentElement.classList.toggle('dark', newIsDark);
    localStorage.setItem('theme', newIsDark ? 'dark' : 'light');
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setView(ViewState.DASHBOARD);
  };

  const handleLogout = async () => {
    await logout();
    setCurrentUser(null);
    setIsAuthSynced(false);
    setView(ViewState.DASHBOARD);
  };

  const handleUpdateRehearsal = async (updated: Rehearsal) => {
    try {
      setSelectedRehearsal(updated);
      await saveRehearsal(updated);
    } catch (e) {
      setDbError("No tienes permiso para guardar cambios.");
    }
  };

  if (view === ViewState.PLAY_MODE && selectedSong) {
    return (
      <ChordViewer 
        currentSong={selectedSong} 
        playlist={activePlaylist} 
        onSongChange={(id) => setSelectedSong(activePlaylist.find(s => s.id === id) || null)} 
        onClose={() => setView(ViewState.REHEARSAL_DETAIL)} 
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300">
      <Navbar user={currentUser} onLogout={handleLogout} isDark={isDark} toggleTheme={toggleTheme} currentView={view} onNavigate={setView} />

      {!currentUser ? (
        <LandingPage onLogin={handleLogin} />
      ) : (
        <main className="flex-1 container max-w-5xl mx-auto p-4 md:p-6">
          {view === ViewState.DASHBOARD && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">{t('dashboard_title')}</h1>
                  <p className="text-zinc-500 dark:text-zinc-400">{t('dashboard_subtitle')}</p>
                </div>
                {!dbError && (
                  <Button onClick={() => setView(ViewState.CREATE_REHEARSAL)} className="gap-2 shadow-xl shadow-brand-900/20">
                    <Plus size={20} /> {t('create_rehearsal')}
                  </Button>
                )}
              </div>

              {dbError ? (
                <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 p-10 rounded-3xl text-center shadow-2xl border-dashed max-w-2xl mx-auto">
                  <div className="bg-red-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"><AlertCircle className="text-white" size={32} /></div>
                  <h2 className="text-2xl font-black text-red-700 dark:text-red-400 mb-4 uppercase">Error de Acceso Seguro</h2>
                  <p className="text-zinc-600 dark:text-zinc-300 mb-8 text-sm leading-relaxed">Parece que Firebase no reconoce tu identidad actual. Por favor, cierra sesión y vuelve a entrar.</p>
                  <Button variant="secondary" onClick={handleLogout} className="gap-2 px-8">Sincronizar de nuevo</Button>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {isLoading ? (
                    <div className="col-span-full flex flex-col items-center justify-center py-20 opacity-50">
                      <Loader2 className="h-10 w-10 text-brand-500 animate-spin mb-4" />
                      <p className="text-zinc-500 font-medium">Cargando ensayos seguros...</p>
                    </div>
                  ) : rehearsals.length === 0 ? (
                    <div className="col-span-full py-16 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
                      <CalendarDays className="mx-auto text-zinc-400 dark:text-zinc-700 mb-4" size={48} />
                      <p className="text-zinc-500 text-lg font-bold">{t('no_rehearsals')}</p>
                      <Button variant="ghost" className="mt-4 text-brand-600 font-bold" onClick={() => setView(ViewState.CREATE_REHEARSAL)}>+ {t('create_rehearsal')}</Button>
                    </div>
                  ) : (
                    rehearsals.map(rehearsal => (
                      <div key={rehearsal.id} onClick={() => { setSelectedRehearsal(rehearsal); setView(ViewState.REHEARSAL_DETAIL); }} className="group bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-brand-500/50 hover:shadow-2xl rounded-xl p-5 cursor-pointer transition-all">
                        <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2 group-hover:text-brand-600 truncate">{rehearsal.title}</h3>
                        <div className="space-y-2 text-sm text-zinc-500 dark:text-zinc-400">
                          <div className="flex items-center gap-2"><Music4 size={14} /><span>{rehearsal.setlist.length} {t('songs_count')}</span></div>
                          <div className="flex items-center gap-2"><CalendarDays size={14} /><span>{rehearsal.status === 'CONFIRMED' ? "Confirmado" : "En votación"}</span></div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {view === ViewState.SONG_LIBRARY && (
            <SongLibrary songs={songs} onCreateNew={() => { setSelectedSong(null); setView(ViewState.EDIT_SONG); }} onEdit={(s) => { setSelectedSong(s); setView(ViewState.EDIT_SONG); }} />
          )}

          {view === ViewState.REHEARSAL_DETAIL && selectedRehearsal && (
            <RehearsalView currentUser={currentUser!} rehearsal={selectedRehearsal} onBack={() => setView(ViewState.DASHBOARD)} onUpdate={handleUpdateRehearsal} onPlaySong={(id) => { 
                const playlist = selectedRehearsal.setlist.map(sid => songs.find(s => s.id === sid)).filter(Boolean) as Song[];
                setActivePlaylist(playlist);
                setSelectedSong(playlist.find(p => p.id === id) || null);
                setView(ViewState.PLAY_MODE);
            }} />
          )}

          {view === ViewState.CREATE_REHEARSAL && (
            <CreateRehearsal onSave={async (d) => {
                const newR: Rehearsal = { id: crypto.randomUUID(), title: d.title, status: 'PROPOSED', options: [{ id: crypto.randomUUID(), date: d.date, time: d.time, location: d.location, voterIds: [currentUser.id] }], setlist: [], createdAt: Date.now() };
                await saveRehearsal(newR);
                setView(ViewState.DASHBOARD);
            }} onCancel={() => setView(ViewState.DASHBOARD)} />
          )}

          {view === ViewState.EDIT_SONG && (
            <SongEditor initialSong={selectedSong} onClose={() => setView(ViewState.SONG_LIBRARY)} onSave={() => setView(ViewState.SONG_LIBRARY)} />
          )}
          
          {view === ViewState.COMPOSER && <SongComposer onSongCreated={() => setView(ViewState.SONG_LIBRARY)} />}
        </main>
      )}

      {/* SIGNATURE FOOTER - MelodIA lab Identity Focus (v2.18) */}
      <footer className="mt-auto border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-6 pt-16 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            
            {/* Column 1: Brand & Creator */}
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <div className="bg-brand-600 p-1.5 rounded-lg text-white">
                  <Music2 size={20} />
                </div>
                <span className="text-2xl font-black dark:text-white lowercase tracking-tight">verso.</span>
              </div>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed">
                {t('tagline')}<br/>
                <span className="font-bold text-zinc-900 dark:text-zinc-100">Original de MelodIA lab.</span>
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest border border-indigo-100 dark:border-indigo-800/30">
                <FlaskConical size={12} />
                <span>Innovation by MelodIA lab</span>
              </div>
            </div>

            {/* Column 2: Navigation */}
            <div className="space-y-6">
              <h4 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Plataforma</h4>
              <ul className="space-y-4">
                <li>
                  <button onClick={() => setView(ViewState.DASHBOARD)} className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-brand-600 transition-colors flex items-center gap-2">
                    <CalendarDays size={14} /> {t('nav_rehearsals')}
                  </button>
                </li>
                <li>
                  <button onClick={() => setView(ViewState.SONG_LIBRARY)} className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-brand-600 transition-colors flex items-center gap-2">
                    <Music4 size={14} /> {t('nav_library')}
                  </button>
                </li>
                <li>
                  <button onClick={() => setView(ViewState.COMPOSER)} className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-brand-600 transition-colors flex items-center gap-2">
                    <Wand2 size={14} /> {t('nav_composer')}
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3: Legal & Resources */}
            <div className="space-y-6">
              <h4 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Recursos</h4>
              <ul className="space-y-4">
                <li>
                  <a href="#" className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-brand-600 transition-colors flex items-center gap-2">
                    <BookOpen size={14} /> {t('footer_documentation')}
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-brand-600 transition-colors flex items-center gap-2">
                    <Shield size={14} /> {t('footer_privacy')}
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-brand-600 transition-colors flex items-center gap-2">
                    <FileText size={14} /> {t('footer_terms')}
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 4: MelodIA lab Community Gift */}
            <div className="space-y-6">
              <h4 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">MelodIA lab</h4>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed italic">
                {t('footer_gift_community')}
              </p>
              <div className="pt-2">
                <a 
                  href="https://www.melodialab.net" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 text-xs font-black group hover:bg-indigo-600 dark:hover:bg-indigo-500 hover:text-white transition-all shadow-xl"
                >
                  Ir a MelodIA lab <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-zinc-100 dark:border-zinc-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium text-zinc-400">
            <p>© {new Date().getFullYear()} Verso App. {t('footer_copyright')}</p>
            <div className="flex gap-6">
              <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-tighter">
                <Sparkles size={12}/> {t('footer_free_forever')}
              </span>
              <span className="flex items-center gap-1 font-bold">
                <Heart size={12} className="text-red-500" fill="currentColor"/> 
                {t('footer_love')}
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() { return ( <LanguageProvider><AppContent /></LanguageProvider> ); }
