import React, { useState, useEffect } from 'react';
import { ViewState, Song, Rehearsal, User } from './types';
import { RehearsalView } from './components/RehearsalView';
import { SongEditor } from './components/SongEditor';
import { ChordViewer } from './components/ChordViewer';
import { LoginView } from './components/LoginView';
import { CreateRehearsal } from './components/CreateRehearsal';
import { Button } from './components/Button';
import { Plus, Music4, CalendarDays, Mic2, LogOut, User as UserIcon, Sun, Moon, Loader2 } from 'lucide-react';
import { subscribeToRehearsals, saveRehearsal, deleteRehearsal, subscribeToSongs } from './services/storageService';
import { getCurrentUser, logout } from './services/authService';

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [view, setView] = useState<ViewState>(ViewState.DASHBOARD);
  const [selectedRehearsal, setSelectedRehearsal] = useState<Rehearsal | null>(null);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [activePlaylist, setActivePlaylist] = useState<Song[]>([]);
  
  const [rehearsals, setRehearsals] = useState<Rehearsal[]>([]);
  const [songs, setSongs] = useState<Song[]>([]); // Global song state
  const [isDark, setIsDark] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // Initial Auth Check
  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
    const isDarkMode = document.documentElement.classList.contains('dark');
    setIsDark(isDarkMode);
  }, []);

  // Data Subscriptions (Real-time)
  useEffect(() => {
    if (!currentUser) return;
    
    setIsLoading(true);

    // Listen to Rehearsals
    const unsubRehearsals = subscribeToRehearsals((data) => {
      setRehearsals(data);
      setIsLoading(false); // Data arrived
      
      // Update selected rehearsal in real-time if open
      if (selectedRehearsal) {
        const updatedCurrent = data.find(r => r.id === selectedRehearsal.id);
        if (updatedCurrent) {
          setSelectedRehearsal(updatedCurrent);
        }
      }
    });

    // Listen to Songs
    const unsubSongs = subscribeToSongs((data) => {
      setSongs(data);
    });

    return () => {
      unsubRehearsals();
      unsubSongs();
    };
  }, [currentUser, selectedRehearsal?.id]);

  // Deep Linking Logic (Handle URL params)
  useEffect(() => {
    if (!currentUser) return;

    const params = new URLSearchParams(window.location.search);
    const linkedRehearsalId = params.get('rehearsal');

    if (linkedRehearsalId && rehearsals.length > 0) {
      const target = rehearsals.find(r => r.id === linkedRehearsalId);
      if (target) {
        setSelectedRehearsal(target);
        setView(ViewState.REHEARSAL_DETAIL);
        // Clean URL
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
  }, [currentUser, rehearsals]);


  // --- Handlers ---

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
          votes: 1 
        }
      ],
      setlist: [],
      createdAt: Date.now()
    };
    
    // Optimistic update handled by subscription, but we set view immediately
    await saveRehearsal(newRehearsal);
    setSelectedRehearsal(newRehearsal);
    setView(ViewState.REHEARSAL_DETAIL);
  };

  const handleOpenRehearsal = (rehearsal: Rehearsal) => {
    setSelectedRehearsal(rehearsal);
    setView(ViewState.REHEARSAL_DETAIL);
  };

  const handleUpdateRehearsal = async (updated: Rehearsal) => {
    // We optimistically update local state, but the real source of truth is Firestore subscription
    setSelectedRehearsal(updated);
    // Actually save
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
    
    // Map setlist IDs to full Song objects from global state
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

  const handleCloseSongEditor = () => {
    setView(ViewState.DASHBOARD);
  };

  // --- Render ---

  if (!currentUser) {
    return (
      <>
        <div className="absolute top-4 right-4 z-50">
           <button onClick={toggleTheme} className="p-2 rounded-full bg-white dark:bg-zinc-800 shadow-md border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300">
             {isDark ? <Sun size={20} /> : <Moon size={20} />}
           </button>
        </div>
        <LoginView onLogin={handleLogin} />
      </>
    );
  }

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
      {/* Global Navigation */}
      <nav className="border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div 
            className="flex items-center gap-2 font-bold text-xl tracking-tight cursor-pointer"
            onClick={() => setView(ViewState.DASHBOARD)}
          >
            <div className="bg-brand-600 p-1.5 rounded-lg text-white shadow-lg shadow-brand-500/30">
              <Mic2 size={20} />
            </div>
            <span className="text-zinc-900 dark:text-white">Ensaye<span className="text-brand-600 dark:text-brand-500">mos!</span></span>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
            <div className="hidden md:flex gap-2">
              <Button 
                variant="ghost" 
                className={view === ViewState.DASHBOARD ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white" : ""}
                onClick={() => setView(ViewState.DASHBOARD)}
              >
                Ensayos
              </Button>
              <Button 
                variant="ghost" 
                className={view === ViewState.EDIT_SONG ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white" : ""}
                onClick={() => { setSelectedSong(null); setView(ViewState.EDIT_SONG); }}
              >
                Biblioteca
              </Button>
            </div>

            <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800 mx-1"></div>

            <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 transition-colors">
               {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <div className="flex items-center gap-3">
               <div className="flex items-center gap-2">
                 {currentUser.picture ? (
                   <img src={currentUser.picture} alt={currentUser.name} className="w-8 h-8 rounded-full border border-zinc-200 dark:border-zinc-700" />
                 ) : (
                   <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-zinc-400">
                     <UserIcon size={16} />
                   </div>
                 )}
                 <span className="hidden md:block text-sm font-medium text-zinc-700 dark:text-zinc-300 max-w-[100px] truncate">{currentUser.name}</span>
               </div>
               <button onClick={handleLogout} className="text-zinc-500 hover:text-red-500 transition-colors p-2" title="Cerrar Sesión">
                 <LogOut size={18} />
               </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 container max-w-5xl mx-auto p-4 md:p-6">
        
        {view === ViewState.DASHBOARD && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">Próximos Ensayos</h1>
                <p className="text-zinc-500 dark:text-zinc-400">Organiza y vota las fechas de tus próximos encuentros.</p>
              </div>
              <Button onClick={handleCreateRehearsalClick} className="gap-2 shadow-xl shadow-brand-900/20">
                <Plus size={20} />
                Crear Ensayo
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {isLoading ? (
                 <div className="col-span-full flex flex-col items-center justify-center py-20 opacity-50">
                   <Loader2 className="h-10 w-10 text-brand-500 animate-spin mb-4" />
                   <p className="text-zinc-500">Sincronizando con la banda...</p>
                 </div>
              ) : rehearsals.length === 0 ? (
                <div className="col-span-full py-16 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
                  <CalendarDays className="mx-auto text-zinc-400 dark:text-zinc-700 mb-4" size={48} />
                  <p className="text-zinc-500 dark:text-zinc-500 text-lg">No hay ensayos programados.</p>
                  <p className="text-zinc-400 text-sm mt-1">Sincronizado con la nube ☁️</p>
                  <Button variant="ghost" className="mt-4 text-brand-600 dark:text-brand-400" onClick={handleCreateRehearsalClick}>Comienza creando uno</Button>
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
                        {rehearsal.status === 'CONFIRMED' ? 'CONFIRMADO' : 'EN VOTACIÓN'}
                      </div>
                      <span className="text-zinc-500 text-xs font-mono">
                        {new Date(rehearsal.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2 group-hover:text-brand-600 dark:group-hover:text-brand-300 transition-colors truncate">{rehearsal.title}</h3>
                    
                    <div className="space-y-2 text-sm text-zinc-500 dark:text-zinc-400">
                      <div className="flex items-center gap-2">
                        <Music4 size={14} />
                        <span>{rehearsal.setlist.length} canciones</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CalendarDays size={14} />
                        <span>
                          {rehearsal.status === 'CONFIRMED' 
                            ? new Date(rehearsal.options.find(o => o.id === rehearsal.confirmedOptionId)?.date || '').toLocaleDateString()
                            : `${rehearsal.options.length} opciones propuestas`}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {view === ViewState.CREATE_REHEARSAL && (
          <CreateRehearsal 
            onSave={handleSaveNewRehearsal} 
            onCancel={() => setView(ViewState.DASHBOARD)} 
          />
        )}

        {view === ViewState.REHEARSAL_DETAIL && selectedRehearsal && (
          <RehearsalView 
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
    </div>
  );
}

export default App;