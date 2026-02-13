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
import { Plus, Music4, CalendarDays, Loader2, Heart, Gift } from 'lucide-react';
import { subscribeToRehearsals, saveRehearsal, deleteRehearsal, subscribeToSongs } from './services/storageService';
import { getCurrentUser, logout } from './services/authService';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';

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

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
    const isDarkMode = document.documentElement.classList.contains('dark');
    setIsDark(isDarkMode);
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    
    setIsLoading(true);

    const unsubRehearsals = subscribeToRehearsals((data) => {
      setRehearsals(data);
      setIsLoading(false);
      
      if (selectedRehearsal) {
        const updatedCurrent = data.find(r => r.id === selectedRehearsal.id);
        if (updatedCurrent) {
          setSelectedRehearsal(updatedCurrent);
        }
      }
    });

    const unsubSongs = subscribeToSongs((data) => {
      setSongs(data);
    });

    return () => {
      unsubRehearsals();
      unsubSongs();
    };
  }, [currentUser, selectedRehearsal?.id]);

  useEffect(() => {
    if (!currentUser) return;

    const params = new URLSearchParams(window.location.search);
    const linkedRehearsalId = params.get('rehearsal');

    if (linkedRehearsalId && rehearsals.length > 0) {
      const target = rehearsals.find(r => r.id === linkedRehearsalId);
      if (target) {
        setSelectedRehearsal(target);
        setView(ViewState.REHEARSAL_DETAIL);
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
  }, [currentUser, rehearsals]);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    if (newIsDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setView(ViewState.DASHBOARD);
  };

  const handleLogout = () => {
    logout();
    setCurrentUser(null);
    setView(ViewState.DASHBOARD);
  };

  const handleCreateRehearsalClick = () => {
    setView(ViewState.CREATE_REHEARSAL);
  };

  const handleSaveNewRehearsal = async (data: { title: string; date: string; time: string; location: string }) => {
    const newRehearsal: Rehearsal = {
      id: crypto.randomUUID(),
      title: data.title,
      status: 'PROPOSED',
      options: [
        { 
          id: crypto.randomUUID(), 
          date: data.date, 
          time: data.time, 
          location: data.location, 
          voterIds: currentUser ? [currentUser.id] : [] 
        }
      ],
      setlist: [],
      createdAt: Date.now()
    };
    
    await saveRehearsal(newRehearsal);
    setSelectedRehearsal(newRehearsal);
    setView(ViewState.REHEARSAL_DETAIL);
  };

  const handleOpenRehearsal = (rehearsal: Rehearsal) => {
    setSelectedRehearsal(rehearsal);
    setView(ViewState.REHEARSAL_DETAIL);
  };

  const handleUpdateRehearsal = async (updated: Rehearsal) => {
    setSelectedRehearsal(updated);
    await saveRehearsal(updated);
  };

  const handleDeleteRehearsal = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if(confirm('¿Eliminar este ensayo?')) {
      await deleteRehearsal(id);
    }
  };

  const startPlayMode = (songId: string) => {
    if (!selectedRehearsal) return;
    
    const playlist = selectedRehearsal.setlist
      .map(id => songs.find(s => s.id === id))
      .filter(Boolean) as Song[];
    
    setActivePlaylist(playlist);
    setSelectedSong(playlist.find(s => s.id === songId) || null);
    setView(ViewState.PLAY_MODE);
  };

  const changeSongInPlayMode = (songId: string) => {
    const song = activePlaylist.find(s => s.id === songId);
    if(song) setSelectedSong(song);
  };

  const handleSongLibraryEdit = (song: Song) => {
    setSelectedSong(song);
    setView(ViewState.EDIT_SONG);
  };

  const handleCloseSongEditor = () => {
    setView(ViewState.SONG_LIBRARY);
  };

  if (view === ViewState.PLAY_MODE && selectedSong) {
    return (
      <ChordViewer 
        currentSong={selectedSong} 
        playlist={activePlaylist} 
        onSongChange={changeSongInPlayMode} 
        onClose={() => setView(ViewState.REHEARSAL_DETAIL)} 
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300">
      
      <Navbar 
        user={currentUser}
        onLogout={handleLogout}
        isDark={isDark}
        toggleTheme={toggleTheme}
        currentView={view}
        onNavigate={setView}
      />

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
                <Button onClick={handleCreateRehearsalClick} className="gap-2 shadow-xl shadow-brand-900/20">
                  <Plus size={20} />
                  {t('create_rehearsal')}
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {isLoading ? (
                  <div className="col-span-full flex flex-col items-center justify-center py-20 opacity-50">
                    <Loader2 className="h-10 w-10 text-brand-500 animate-spin mb-4" />
                    <p className="text-zinc-500">...</p>
                  </div>
                ) : rehearsals.length === 0 ? (
                  <div className="col-span-full py-16 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
                    <CalendarDays className="mx-auto text-zinc-400 dark:text-zinc-700 mb-4" size={48} />
                    <p className="text-zinc-500 dark:text-zinc-500 text-lg">{t('no_rehearsals')}</p>
                    <p className="text-zinc-400 text-sm mt-1">{t('no_rehearsals_sub')}</p>
                    <Button variant="ghost" className="mt-4 text-brand-600 dark:text-brand-400" onClick={handleCreateRehearsalClick}>{t('create_rehearsal')}</Button>
                  </div>
                ) : (
                  rehearsals.map(rehearsal => (
                    <div 
                      key={rehearsal.id} 
                      onClick={() => handleOpenRehearsal(rehearsal)}
                      className="group bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-brand-500/50 hover:shadow-2xl hover:shadow-brand-900/10 rounded-xl p-5 cursor-pointer transition-all duration-300 relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        <button onClick={(e) => handleDeleteRehearsal(e, rehearsal.id)} className="text-zinc-400 hover:text-red-500 transition-colors bg-white dark:bg-zinc-900 rounded-full p-1 shadow-sm">
                          <span className="sr-only">Borrar</span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                        </button>
                      </div>
                      
                      <div className="flex items-start justify-between mb-4">
                        <div className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                          rehearsal.status === 'CONFIRMED' 
                          ? 'bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-500/20' 
                          : 'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20'
                        }`}>
                          {rehearsal.status === 'CONFIRMED' ? t('status_confirmed') : t('status_voting')}
                        </div>
                        <span className="text-zinc-500 text-xs font-mono">
                          {new Date(rehearsal.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2 group-hover:text-brand-600 dark:group-hover:text-brand-300 transition-colors truncate">{rehearsal.title}</h3>
                      
                      <div className="space-y-2 text-sm text-zinc-500 dark:text-zinc-400">
                        <div className="flex items-center gap-2">
                          <Music4 size={14} />
                          <span>{rehearsal.setlist.length} {t('songs_count')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CalendarDays size={14} />
                          <span>
                            {rehearsal.status === 'CONFIRMED' 
                              ? new Date(rehearsal.options.find(o => o.id === rehearsal.confirmedOptionId)?.date || '').toLocaleDateString()
                              : `${rehearsal.options.length} ${t('options_count')}`}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {view === ViewState.SONG_LIBRARY && (
            <SongLibrary 
              songs={songs}
              onCreateNew={() => { setSelectedSong(null); setView(ViewState.EDIT_SONG); }}
              onEdit={handleSongLibraryEdit}
            />
          )}

          {view === ViewState.COMPOSER && (
            <SongComposer onSongCreated={() => setView(ViewState.SONG_LIBRARY)} />
          )}

          {view === ViewState.CREATE_REHEARSAL && (
            <CreateRehearsal 
              onSave={handleSaveNewRehearsal} 
              onCancel={() => setView(ViewState.DASHBOARD)} 
            />
          )}

          {view === ViewState.REHEARSAL_DETAIL && selectedRehearsal && (
            <RehearsalView 
              currentUser={currentUser!}
              rehearsal={selectedRehearsal} 
              onBack={() => setView(ViewState.DASHBOARD)} 
              onUpdate={handleUpdateRehearsal}
              onPlaySong={startPlayMode}
            />
          )}

          {view === ViewState.EDIT_SONG && (
            <div className="h-[calc(100vh-140px)]">
              <SongEditor 
                initialSong={selectedSong} 
                onClose={handleCloseSongEditor}
                onSave={handleCloseSongEditor}
              />
            </div>
          )}

        </main>
      )}

      {/* Striking Footer */}
      <footer className="relative mt-auto border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 transition-colors duration-300">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-brand-500 to-transparent opacity-50"></div>
        
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="space-y-4 text-center md:text-left">
              <div className="inline-flex items-center gap-2">
                 <div className="bg-brand-600 p-2 rounded-xl text-white shadow-xl shadow-brand-500/20">
                   <Music4 size={24} />
                 </div>
                 <span className="text-2xl font-extrabold tracking-tight lowercase text-zinc-900 dark:text-white">verso.</span>
              </div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto md:mx-0 leading-relaxed font-medium">
                {t('footer_gift_community')}
              </p>
            </div>

            <div className="flex flex-col items-center gap-6 md:items-end">
              <div className="flex flex-col items-center md:items-end gap-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-600">
                  {t('footer_powered_by')}
                </span>
                <a 
                  href="https://www.melodialab.net" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="group relative"
                >
                  <div className="absolute -inset-2 bg-gradient-to-r from-brand-600 to-brand-400 rounded-lg blur opacity-10 group-hover:opacity-40 transition duration-500"></div>
                  <div className="relative text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-zinc-900 to-zinc-700 dark:from-white dark:to-zinc-300 group-hover:from-brand-600 group-hover:to-brand-400 transition-all duration-300">
                    MelodIA La♭
                  </div>
                </a>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-1.5 text-xs font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/20 px-3 py-1.5 rounded-full border border-brand-200 dark:border-brand-500/20">
                  <Heart size={14} fill="currentColor" />
                  <span>{t('footer_made_for')}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-3 py-1.5 rounded-full border border-amber-200 dark:border-amber-500/20">
                  <Gift size={14} />
                  <span>{t('footer_free_forever')}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-zinc-100 dark:border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-600">
            <p>© {new Date().getFullYear()} VERSO APP</p>
            <div className="flex gap-8">
              <a href="#" className="hover:text-brand-500 transition-colors">{t('footer_documentation')}</a>
              <a href="#" className="hover:text-brand-500 transition-colors">{t('footer_privacy')}</a>
              <a href="#" className="hover:text-brand-500 transition-colors">{t('footer_terms')}</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}