// v3.17 - Cleaned Sync Logic & Multi-User Shield | MelodIA Lab
import React, { useState, useEffect } from 'react';
import { ViewState, Song, Rehearsal, User, Setlist, Band } from './types';
import { RehearsalView } from './components/RehearsalView';
import { BandsView } from './components/BandsView';
import { SongEditor } from './components/SongEditor';
import { ChordViewer } from './components/ChordViewer';
import { LandingPage } from './components/LandingPage';
import { CreateRehearsal } from './components/CreateRehearsal';
import { SongLibrary } from './components/SongLibrary';
import { Navbar } from './components/Navbar';
import { Button } from './components/Button';
import { SongComposer } from './components/SongComposer';
import { Footer } from './components/Footer';
import { Plus, Music4, CalendarDays, Loader2, AlertCircle, Heart, Music2, ListMusic } from 'lucide-react';
import { subscribeToRehearsals, saveRehearsal, subscribeToSongs, saveSong, subscribeToSetlists, saveSetlist, getRehearsalById, getUserBands, getBandById, joinBand } from './services/storageService';
import { getCurrentUser, logout } from './services/authService';
import { SetlistEditor } from './components/SetlistEditor';
import { SetlistViewer } from './components/SetlistViewer';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { auth } from './services/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';

function AppContent() {
  const { t } = useLanguage();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [view, setView] = useState<ViewState>(ViewState.DASHBOARD);
  const [selectedRehearsal, setSelectedRehearsal] = useState<Rehearsal | null>(null);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [selectedSetlist, setSelectedSetlist] = useState<Setlist | null>(null);
  const [activePlaylist, setActivePlaylist] = useState<Song[]>([]);
  const [viewerInitialSongId, setViewerInitialSongId] = useState<string | undefined>();
  const [viewerReturnView, setViewerReturnView] = useState<ViewState>(ViewState.SONG_LIBRARY);

  const [rehearsals, setRehearsals] = useState<Rehearsal[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);
  const [setlists, setSetlists] = useState<Setlist[]>([]);
  const [isDark, setIsDark] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);
  const [isAuthSynced, setIsAuthSynced] = useState(false);
  const [pendingSharedRehearsalId, setPendingSharedRehearsalId] = useState<string | null>(null);
  const [pendingJoinBandId, setPendingJoinBandId] = useState<string | null>(null);

  // Workspaces States
  const [userBands, setUserBands] = useState<Band[]>([]);
  const [currentWorkspaceId, setCurrentWorkspaceId] = useState<string | null>(null);

  // 0. Capturar enlaces mágicos (URL)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const rid = params.get('rehearsal');
    const jid = params.get('joinBand');

    if (rid || jid) {
      if (rid) setPendingSharedRehearsalId(rid);
      if (jid) setPendingJoinBandId(jid);
      window.history.replaceState({}, '', window.location.pathname); // Limpiar URL
    }
  }, []);

  // 1. Manejo de Autenticación
  useEffect(() => {
    const localUser = getCurrentUser();
    if (localUser) setCurrentUser(localUser);

    const isDarkMode = document.documentElement.classList.contains('dark');
    setIsDark(isDarkMode);

    const unsubAuth = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        setIsAuthSynced(true);
        if (!currentWorkspaceId) setCurrentWorkspaceId(fbUser.uid);
      } else {
        setIsAuthSynced(false);
        if (!localUser) setIsLoading(false);
      }
    });

    return () => unsubAuth();
  }, []);

  // 2. Cargar Bandas (Workspaces) del usuario
  useEffect(() => {
    if (currentUser?.id && isAuthSynced) {
      getUserBands(currentUser.id).then(bands => setUserBands(bands));
    } else {
      setUserBands([]);
    }
  }, [currentUser?.id, isAuthSynced]);

  // 3. Suscripción a Datos (Basados en currentWorkspaceId)
  useEffect(() => {
    const userId = currentUser?.id;

    // Verificación estricta para evitar que Firestore reciba datos inválidos
    if (!userId || !currentWorkspaceId || !isAuthSynced) {
      return;
    }

    setIsLoading(true);
    setDbError(null);

    const unsubRehearsals = subscribeToRehearsals(
      currentWorkspaceId,
      (data) => {
        setRehearsals(data);
        setIsLoading(false);
      },
      (error: any) => {
        setIsLoading(false);
        if (error.code === 'permission-denied') setDbError(t('error_auth_title'));
      }
    );

    const unsubSongs = subscribeToSongs(
      currentWorkspaceId,
      (data) => setSongs(data),
      (err) => console.error("Error songs:", err)
    );

    const unsubSetlists = subscribeToSetlists(
      currentWorkspaceId,
      (data) => setSetlists(data),
      (err) => console.error("Error setlists:", err)
    );

    return () => {
      unsubRehearsals();
      unsubSongs();
      unsubSetlists();
    };
  }, [currentUser?.id, currentWorkspaceId, isAuthSynced, t]);

  // 4. Procesar enlace mágico compartido una vez logueado
  useEffect(() => {
    if (!isAuthSynced || !pendingSharedRehearsalId) return;

    const fetchSharedRehearsal = async () => {
      setIsLoading(true);
      const sharedRehearsal = await getRehearsalById(pendingSharedRehearsalId);
      if (sharedRehearsal) {
        setSelectedRehearsal(sharedRehearsal);
        setView(ViewState.REHEARSAL_DETAIL);
      } else {
        alert(t('error_auth_title')); // Rehearsal not found or access denied
      }
      setPendingSharedRehearsalId(null);
      setIsLoading(false);
    };

    fetchSharedRehearsal();
  }, [isAuthSynced, pendingSharedRehearsalId, t]);

  // 5. Procesar invitación a banda compartida
  useEffect(() => {
    if (!isAuthSynced || !pendingJoinBandId || !currentUser) return;

    const processJoinBand = async () => {
      setIsLoading(true);
      const band = await getBandById(pendingJoinBandId);
      if (band) {
        const isMember = band.members.some(m => m.userId === currentUser.id);
        if (!isMember) {
          await joinBand(pendingJoinBandId, currentUser.id);
          alert(`¡Te has unido exitosamente a ${band.name}!`);
          const updatedBands = await getUserBands(currentUser.id);
          setUserBands(updatedBands);
        } else {
          alert(`Ya eres miembro de ${band.name}`);
        }
        setCurrentWorkspaceId(pendingJoinBandId);
        setView(ViewState.BANDS);
      } else {
        alert("Enlace de banda inválido o no existe.");
      }
      setPendingJoinBandId(null);
      setIsLoading(false);
    };

    processJoinBand();
  }, [isAuthSynced, pendingJoinBandId, currentUser]);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    document.documentElement.classList.toggle('dark', newIsDark);
    localStorage.setItem('theme', newIsDark ? 'dark' : 'light');
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    if (!currentWorkspaceId) setCurrentWorkspaceId(user.id);
    setIsAuthSynced(true);
    setView(ViewState.DASHBOARD);
  };

  const handleLogout = async () => {
    await logout();
    setCurrentUser(null);
    setCurrentWorkspaceId(null);
    setIsAuthSynced(false);
    setView(ViewState.DASHBOARD);
  };

  const handleUpdateRehearsal = async (updated: Rehearsal) => {
    if (!currentUser?.id || !currentWorkspaceId) return;
    try {
      setSelectedRehearsal(updated);
      await saveRehearsal(updated, currentWorkspaceId, currentUser.id);
    } catch (e) {
      setDbError(t('error_auth_title'));
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
                  <h2 className="text-2xl font-black text-red-700 dark:text-red-400 mb-4 uppercase">{t('error_auth_title')}</h2>
                  <p className="text-zinc-600 dark:text-zinc-300 mb-8 text-sm leading-relaxed">{t('error_auth_desc')}</p>
                  <Button variant="secondary" onClick={handleLogout} className="gap-2 px-8">{t('error_auth_button')}</Button>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {isLoading ? (
                    <div className="col-span-full flex flex-col items-center justify-center py-20 opacity-50">
                      <Loader2 className="h-10 w-10 text-brand-500 animate-spin mb-4" />
                      <p className="text-zinc-500 font-medium">{t('loading_rehearsals')}</p>
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
                          <div className="flex items-center gap-2"><CalendarDays size={14} /><span>{rehearsal.status === 'CONFIRMED' ? t('status_confirmed') : t('status_voting')}</span></div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {view === ViewState.SONG_LIBRARY && (
            <SongLibrary
              songs={songs}
              setlists={setlists}
              onCreateNewSong={() => {
                setSelectedSong(null);
                setView(ViewState.EDIT_SONG);
              }}
              onEditSong={(song) => {
                setSelectedSong(song);
                setView(ViewState.EDIT_SONG);
              }}
              onCreateNewSetlist={() => {
                setSelectedSetlist(null);
                setView(ViewState.EDIT_SETLIST);
              }}
              onEditSetlist={(setlist) => {
                setSelectedSetlist(setlist);
                setView(ViewState.EDIT_SETLIST);
              }}
              onViewSetlist={(setlist) => {
                setSelectedSetlist(setlist);
                setViewerInitialSongId(undefined);
                setViewerReturnView(ViewState.SONG_LIBRARY);
                setView(ViewState.VIEW_SETLIST);
              }}
            />
          )}

          {view === ViewState.REHEARSAL_DETAIL && selectedRehearsal && (
            <RehearsalView currentUser={currentUser!} rehearsal={selectedRehearsal} onBack={() => setView(ViewState.DASHBOARD)} onUpdate={handleUpdateRehearsal} onPlaySong={(id) => {
              const linkedSetlist = selectedRehearsal.linkedSetlistId ? setlists.find(s => s.id === selectedRehearsal.linkedSetlistId) : null;

              if (linkedSetlist) {
                setSelectedSetlist(linkedSetlist);
              } else {
                // Generar un setlist virtual para la vista
                const virtualSetlist: Setlist = {
                  id: 'virtual-' + selectedRehearsal.id,
                  title: 'Canciones del Ensayo',
                  description: selectedRehearsal.title,
                  songs: selectedRehearsal.setlist,
                  ownerId: currentUser!.id,
                  createdAt: Date.now()
                };
                setSelectedSetlist(virtualSetlist);
              }

              setViewerInitialSongId(id);
              setViewerReturnView(ViewState.REHEARSAL_DETAIL);
              setView(ViewState.VIEW_SETLIST);
            }} />
          )}

          {view === ViewState.CREATE_REHEARSAL && (
            <CreateRehearsal onSave={async (d) => {
              if (!currentUser?.id || !currentWorkspaceId) return;
              const newR: Rehearsal = {
                id: crypto.randomUUID(),
                title: d.title,
                status: 'PROPOSED',
                options: [{ id: crypto.randomUUID(), date: d.date, time: d.time, location: d.location, voterIds: [currentUser.id] }],
                setlist: [],
                createdAt: Date.now()
              };
              await saveRehearsal(newR, currentWorkspaceId, currentUser.id);
              setView(ViewState.DASHBOARD);
            }} onCancel={() => setView(ViewState.DASHBOARD)} />
          )}

          {view === ViewState.EDIT_SONG && currentUser && currentWorkspaceId && (
            <SongEditor
              initialSong={selectedSong}
              userId={currentUser.id}
              onClose={() => setView(ViewState.SONG_LIBRARY)}
              onSave={async (newSong) => {
                await saveSong(newSong, currentWorkspaceId, currentUser.id);
                setView(ViewState.SONG_LIBRARY);
              }}
            />
          )}

          {view === ViewState.EDIT_SETLIST && currentUser && currentWorkspaceId && (
            <SetlistEditor
              initialSetlist={selectedSetlist}
              availableSongs={songs}
              onClose={() => setView(ViewState.SONG_LIBRARY)}
              onSave={async (newSetlist) => {
                await saveSetlist(newSetlist, currentWorkspaceId, currentUser.id);
                setView(ViewState.SONG_LIBRARY);
              }}
            />
          )}

          {view === ViewState.VIEW_SETLIST && selectedSetlist && (
            <SetlistViewer
              setlist={selectedSetlist}
              availableSongs={songs}
              initialSongId={viewerInitialSongId}
              onBack={() => setView(viewerReturnView)}
            />
          )}

          {view === ViewState.BANDS && currentUser && (
            <BandsView
              currentUser={currentUser}
              userBands={userBands}
              currentWorkspaceId={currentWorkspaceId!}
              onSwitchWorkspace={(id) => {
                setCurrentWorkspaceId(id);
                setView(ViewState.DASHBOARD);
              }}
              onBandCreated={(band) => {
                setUserBands(prev => [...prev, band]);
                setCurrentWorkspaceId(band.id);
                setView(ViewState.DASHBOARD);
              }}
              onBandDeleted={(bandId) => {
                setUserBands(prev => prev.filter(b => b.id !== bandId));
              }}
            />
          )}

          {view === ViewState.COMPOSER && <SongComposer onSongCreated={() => setView(ViewState.SONG_LIBRARY)} />}
        </main>
      )}
      <Footer />
    </div>
  );
}

export default function App() { return (<LanguageProvider><AppContent /></LanguageProvider>); }