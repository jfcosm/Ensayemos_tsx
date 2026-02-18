
// v3.13 - Fixed Firebase Auth imports and enhanced state sync | MelodIA lab
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
  Wand2,
  Sparkles,
  ArrowRight,
  FlaskConical,
  Gift
} from 'lucide-react';
import { subscribeToRehearsals, saveRehearsal, subscribeToSongs } from './services/storageService';
import { getCurrentUser, logout } from './services/authService';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { auth } from './services/firebaseConfig';
// Fix: Explicit modular import for onAuthStateChanged to resolve "no exported member" error
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

    // Fix: Using onAuthStateChanged from modular firebase/auth
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
            setDbError(t('error_auth_title'));
        }
      }
    );

    const unsubSongs = subscribeToSongs((data) => setSongs(data), () => {});

    return () => {
      unsubRehearsals();
      unsubSongs();
    };
  }, [currentUser, isAuthSynced, t]);

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
  <CreateRehearsal 
    onSave={async (d) => {
      const newR: Rehearsal = { 
        id: crypto.randomUUID(), 
        title: d.title, 
        status: 'PROPOSED', 
        options: [{ 
          id: crypto.randomUUID(), 
          date: d.date, 
          time: d.time, 
          location: d.location, 
          voterIds: [currentUser.id] 
        }], 
        setlist: [], 
        createdAt: Date.now() 
      };
      
      // Guardamos y retornamos la promesa explícitamente
      const result = await saveRehearsal(newR);
      setView(ViewState.DASHBOARD);
      return result; 
    }} 
    onCancel={() => setView(ViewState.DASHBOARD)} 
  />
)}

          {view === ViewState.EDIT_SONG && (
            <SongEditor initialSong={selectedSong} onClose={() => setView(ViewState.SONG_LIBRARY)} onSave={() => setView(ViewState.SONG_LIBRARY)} />
          )}
          
          {view === ViewState.COMPOSER && <SongComposer onSongCreated={() => setView(ViewState.SONG_LIBRARY)} />}
        </main>
      )}

      {/* NEW BRANDED FOOTER - Multi-language support v3.12 */}
      <footer className="bg-black text-white pt-20 pb-12 px-6 border-t border-zinc-900">
        <div className="max-w-6xl mx-auto">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-16 mb-16">
            
            {/* Left: Brand Identity */}
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="bg-brand-600 p-2.5 rounded-2xl text-white shadow-2xl shadow-brand-600/30">
                  <Music2 size={28} strokeWidth={2.5} />
                </div>
                <span className="text-4xl font-black lowercase tracking-tighter text-white">verso.</span>
              </div>
              <p className="text-zinc-500 text-sm max-w-xs leading-relaxed font-medium">
                {t('footer_gift_community')}
              </p>
            </div>

            {/* Right: MelodIA lab branding & Pills */}
            <div className="flex flex-col md:items-end gap-8">
              <div className="md:text-right space-y-1">
                <span className="block text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">{t('footer_powered_by')}</span>
                <h2 className="text-5xl md:text-6xl font-black tracking-tighter text-white drop-shadow-[0_0_25px_rgba(255,255,255,0.25)] select-none">
                  MelodIA Lab
                </h2>
              </div>
              
              <div className="flex flex-wrap gap-4 md:justify-end">
                 <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full border border-red-950/50 bg-red-950/20 text-red-500 text-[11px] font-black uppercase tracking-widest shadow-lg shadow-red-950/10">
                    <Heart size={16} fill="currentColor" className="animate-pulse" />
                    <span>{t('footer_made_for')}</span>
                 </div>
                 <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full border border-amber-950/50 bg-amber-950/20 text-amber-500 text-[11px] font-black uppercase tracking-widest shadow-lg shadow-amber-950/10">
                    <Gift size={16} />
                    <span>{t('footer_free_forever')}</span>
                 </div>
              </div>
            </div>

          </div>

          <hr className="border-zinc-900 mb-10" />

          {/* Bottom Row: Metadata & Navigation */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] order-2 md:order-1">
              {t('footer_copyright')}
            </div>
            <div className="flex flex-wrap justify-center gap-8 md:gap-12 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] order-1 md:order-2">
              <a href="#" className="hover:text-white transition-colors duration-300">{t('footer_documentation')}</a>
              <a href="#" className="hover:text-white transition-colors duration-300">{t('footer_privacy')}</a>
              <a href="#" className="hover:text-white transition-colors duration-300">{t('footer_terms')}</a>
            </div>
          </div>

        </div>
      </footer>
    </div>
  );
}

export default function App() { return ( <LanguageProvider><AppContent /></LanguageProvider> ); }
