
// v2.11 - Enhanced Firestore Rule Debugging
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
import { Plus, Music4, CalendarDays, Loader2, AlertCircle, RefreshCw, Heart, Gift, ExternalLink } from 'lucide-react';
import { subscribeToRehearsals, saveRehearsal, deleteRehearsal, subscribeToSongs } from './services/storageService';
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

    // Watch for REAL Firebase Auth state
    const unsubAuth = onAuthStateChanged(auth, (fbUser) => {
        console.log("Firebase Auth State Changed:", fbUser ? "Logged In" : "Logged Out");
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
    // CRITICAL: ONLY subscribe if Firebase Auth confirms we are logged in
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
        console.error("Firestore Error:", error.code, error.message);
        if (error.code === 'permission-denied') {
            setDbError("PERMISOS_DENEGADOS");
        } else {
            setDbError(error.message);
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
    setDbError(null);
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

              {dbError === "PERMISOS_DENEGADOS" ? (
                <div className="bg-white dark:bg-zinc-900 border-2 border-red-500/30 p-10 rounded-3xl text-center shadow-2xl max-w-2xl mx-auto border-dashed">
                  <div className="bg-red-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-500/20">
                    <AlertCircle className="text-white" size={32} />
                  </div>
                  <h2 className="text-2xl font-black text-zinc-900 dark:text-white mb-4 uppercase tracking-tight">Acceso Bloqueado por Firebase</h2>
                  
                  <div className="text-left bg-zinc-50 dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 mb-8 space-y-4">
                    <p className="text-zinc-600 dark:text-zinc-300 text-sm md:text-base leading-relaxed">
                        Tu aplicación está intentando conectar, pero tu base de datos en la <b>Nube de Firebase</b> tiene las puertas cerradas.
                    </p>
                    <div className="space-y-2">
                        <p className="text-xs font-bold text-brand-600 uppercase tracking-widest">Solución obligatoria:</p>
                        <ol className="text-sm text-zinc-500 dark:text-zinc-400 list-decimal list-inside space-y-2">
                            <li>Entra a la <a href="https://console.firebase.google.com/" target="_blank" className="underline font-bold text-zinc-700 dark:text-zinc-200 inline-flex items-center gap-1">Consola de Firebase <ExternalLink size={12}/></a></li>
                            <li>Ve a <b>Firestore Database</b> &gt; pestaña <b>Rules</b>.</li>
                            <li>Cambia <code className="bg-zinc-200 dark:bg-zinc-800 px-1">allow read, write: if false;</code> por <code className="bg-zinc-200 dark:bg-zinc-800 px-1 text-green-600">allow read, write: if request.auth != null;</code></li>
                            <li>Dale al botón azul de <b>Publicar (Publish)</b>.</li>
                        </ol>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button variant="primary" onClick={() => window.location.reload()} className="gap-2 px-8">
                      <RefreshCw size={20} />
                      Ya publiqué las reglas, reintentar
                    </Button>
                    <Button variant="ghost" onClick={handleLogout} className="text-zinc-500 text-xs">
                      Cerrar sesión
                    </Button>
                  </div>
                </div>
              ) : dbError ? (
                 <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 p-6 rounded-xl text-red-600">
                    <p className="font-bold">Error inesperado:</p>
                    <p className="text-sm">{dbError}</p>
                 </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {isLoading ? (
                    <div className="col-span-full flex flex-col items-center justify-center py-20 opacity-50">
                      <Loader2 className="h-10 w-10 text-brand-500 animate-spin mb-4" />
                      <p className="text-zinc-500 font-medium">Conectando con la Nube...</p>
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

      <footer className="mt-auto border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-8 text-center">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
                <Music4 className="text-brand-600" size={24} />
                <span className="text-xl font-bold dark:text-white">verso.</span>
            </div>
            <div className="flex gap-4 text-xs font-bold uppercase tracking-widest text-zinc-400">
                <span>Made with <Heart className="inline text-red-500 mx-1" size={14} fill="currentColor" /> for Musicians</span>
                <span>•</span>
                <span>{new Date().getFullYear()} Verso App</span>
            </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() { return ( <LanguageProvider><AppContent /></LanguageProvider> ); }
