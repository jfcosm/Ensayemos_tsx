import React, { useState, useEffect } from 'react';
import { Rehearsal, Song, RehearsalOption, User } from '../types';
import { Button } from './Button';
import { Calendar, MapPin, Clock, CheckCircle2, Plus, Trash2, ArrowLeft, PlayCircle, Music, ChevronDown, ChevronUp, Save, Search, Pencil, Share2, ThumbsUp } from 'lucide-react';
import { subscribeToSongs, saveSong, subscribeToSetlists, getSharedSongs, getSharedSetlist } from '../services/storageService';
import { formatSongContent } from '../services/geminiService';
import { useLanguage } from '../contexts/LanguageContext';
import { Setlist } from '../types';
import { DatePicker } from './DatePicker';
import { TimePicker } from './TimePicker';

interface RehearsalViewProps {
  rehearsal: Rehearsal;
  currentUser: User;
  onBack: () => void;
  onUpdate: (updated: Rehearsal) => void;
  onPlaySong: (songId: string) => void;
}

export const RehearsalView: React.FC<RehearsalViewProps> = ({ rehearsal, currentUser, onBack, onUpdate, onPlaySong }) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'info' | 'setlist'>('info');
  const [availableSongs, setAvailableSongs] = useState<Song[]>([]);
  const [availableSetlists, setAvailableSetlists] = useState<Setlist[]>([]);

  // Cross-user shared states for magic links
  const [sharedSongs, setSharedSongs] = useState<Song[]>([]);
  const [sharedSetlist, setSharedSetlist] = useState<Setlist | null>(null);

  const [showAddSection, setShowAddSection] = useState(false);
  const [addMode, setAddMode] = useState<'search' | 'create'>('create');
  const [copySuccess, setCopySuccess] = useState(false);

  const [showProposalForm, setShowProposalForm] = useState(false);
  const [propDate, setPropDate] = useState('');
  const [propTime, setPropTime] = useState('');
  const [propLocation, setPropLocation] = useState('');

  const [newSongTitle, setNewSongTitle] = useState('');
  const [newSongArtist, setNewSongArtist] = useState('');
  const [newSongContent, setNewSongContent] = useState('');
  const [isFormatting, setIsFormatting] = useState(false);

  const [expandedSongId, setExpandedSongId] = useState<string | null>(null);
  const [editingSongId, setEditingSongId] = useState<string | null>(null);

  // FIX: Se agregó currentUser.id como primer parámetro para coincidir con la nueva firma del servicio
  useEffect(() => {
    if (!currentUser?.id) return;

    const unsubscribeSongs = subscribeToSongs(
      currentUser.id,
      (songs) => {
        setAvailableSongs(songs);
      },
      (error) => console.error("Error songs:", error)
    );

    const unsubscribeSetlists = subscribeToSetlists(
      currentUser.id,
      (setlists) => {
        setAvailableSetlists(setlists);
      },
      (error) => console.error("Error setlists:", error)
    );

    return () => {
      unsubscribeSongs();
      unsubscribeSetlists();
    };
  }, [currentUser?.id]);

  useEffect(() => {
    const fetchMissingGuestData = async () => {
      // Si el ensayo es propio, ya tenemos todo en availableSongs/availableSetlists
      if (rehearsal.createdBy === currentUser.id) return;

      let targetSongIds = rehearsal.setlist;

      if (rehearsal.linkedSetlistId && !availableSetlists.find(s => s.id === rehearsal.linkedSetlistId)) {
        const sl = await getSharedSetlist(rehearsal.linkedSetlistId);
        if (sl) {
          setSharedSetlist(sl);
          targetSongIds = sl.songs;
        }
      } else if (rehearsal.linkedSetlistId) {
        const tempSl = availableSetlists.find(s => s.id === rehearsal.linkedSetlistId);
        if (tempSl) targetSongIds = tempSl.songs;
      }

      const missingIds = targetSongIds.filter(id => !availableSongs.find(s => s.id === id));
      if (missingIds.length > 0) {
        const fetched = await getSharedSongs(missingIds);
        setSharedSongs(fetched);
      }
    };
    fetchMissingGuestData();
  }, [rehearsal, currentUser.id, availableSetlists, availableSongs]);

  const handleToggleVote = async (optionId: string) => {
    const updatedOptions = rehearsal.options.map(opt => {
      if (opt.id === optionId) {
        const currentVoters = opt.voterIds || [];
        const hasVoted = currentVoters.includes(currentUser.id);

        let newVoters;
        if (hasVoted) {
          newVoters = currentVoters.filter(id => id !== currentUser.id);
        } else {
          newVoters = [...currentVoters, currentUser.id];
        }

        return { ...opt, voterIds: newVoters };
      }
      return opt;
    });
    const updated = { ...rehearsal, options: updatedOptions };
    onUpdate(updated);
  };

  const handleProposeOption = async () => {
    if (!propDate || !propTime || !propLocation) return;

    const newOption: RehearsalOption = {
      id: crypto.randomUUID(),
      date: propDate,
      time: propTime,
      location: propLocation,
      voterIds: [currentUser.id]
    };

    const updated = { ...rehearsal, options: [...rehearsal.options, newOption] };
    onUpdate(updated);
    setShowProposalForm(false);
    setPropDate('');
    setPropTime('');
    setPropLocation('');
  }

  const handleConfirmOption = async (optionId: string) => {
    const updated = { ...rehearsal, status: 'CONFIRMED' as const, confirmedOptionId: optionId };
    onUpdate(updated);
  };

  const handleAddSongToSetlist = async (songId: string) => {
    if (rehearsal.setlist.includes(songId)) return;
    const updated = { ...rehearsal, setlist: [...rehearsal.setlist, songId] };
    onUpdate(updated);
    setShowAddSection(false);
  };

  const handleCreateAndAddSong = async () => {
    if (!newSongTitle) return alert("El título es obligatorio");

    const newSong: Song = {
      id: crypto.randomUUID(),
      title: newSongTitle,
      artist: newSongArtist || 'Artista Desconocido',
      content: newSongContent
    };

    await saveSong(newSong, currentUser.id);

    const updatedRehearsal = { ...rehearsal, setlist: [...rehearsal.setlist, newSong.id] };
    onUpdate(updatedRehearsal);

    setNewSongTitle('');
    setNewSongArtist('');
    setNewSongContent('');
    setShowAddSection(false);
  };

  const handleUpdateSong = async () => {
    if (!editingSongId || !newSongTitle) return;

    const songToUpdate: Song = {
      id: editingSongId,
      title: newSongTitle,
      artist: newSongArtist,
      content: newSongContent
    };

    await saveSong(songToUpdate, currentUser.id);

    setEditingSongId(null);
    setNewSongTitle('');
    setNewSongArtist('');
    setNewSongContent('');
    setShowAddSection(false);
  };

  const startEditing = (song: Song) => {
    setEditingSongId(song.id);
    setNewSongTitle(song.title);
    setNewSongArtist(song.artist);
    setNewSongContent(song.content);
  };

  const handleAIFormat = async () => {
    if (!newSongContent) return;
    setIsFormatting(true);
    const formatted = await formatSongContent(newSongContent);
    setNewSongContent(formatted);
    setIsFormatting(false);
  };

  const handleRemoveSongFromSetlist = async (songId: string) => {
    if (confirm('¿Quitar esta canción del ensayo?')) {
      const updated = { ...rehearsal, setlist: rehearsal.setlist.filter(id => id !== songId) };
      onUpdate(updated);
    }
  };

  const toggleExpand = (songId: string) => {
    setExpandedSongId(expandedSongId === songId ? null : songId);
  };

  const handleShare = () => {
    const url = `${window.location.origin}/?rehearsal=${rehearsal.id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  const activeSetlistId = rehearsal.linkedSetlistId;
  const activeSetlist = availableSetlists.find(s => s.id === activeSetlistId) || sharedSetlist;
  const displayedSongIds = activeSetlist ? activeSetlist.songs : rehearsal.setlist;

  const allKnownSongs = [...availableSongs, ...sharedSongs];
  const setlistSongs = displayedSongIds.map(id => allKnownSongs.find(s => s.id === id)).filter(Boolean) as Song[];

  const handleLinkSetlist = (setlistId: string) => {
    onUpdate({ ...rehearsal, linkedSetlistId: setlistId, setlist: [] }); // Clear individual setlist to avoid conflicts
  };

  const handleUnlinkSetlist = () => {
    onUpdate({ ...rehearsal, linkedSetlistId: undefined });
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-start gap-3 w-full md:w-auto min-w-0">
          <button onClick={onBack} className="p-2 mt-1 -ml-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-full transition-colors flex-shrink-0">
            <ArrowLeft className="text-zinc-500 dark:text-zinc-400" />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white break-words">{rehearsal.title}</h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm">Verso.</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <Button variant="secondary" onClick={handleShare} className="flex-1 md:flex-none justify-center items-center gap-2 whitespace-nowrap min-w-fit">
            {copySuccess ? <CheckCircle2 size={16} /> : <Share2 size={16} />}
            {copySuccess ? t('btn_copied') : t('btn_invite')}
          </Button>

          <div className="flex bg-zinc-200 dark:bg-zinc-800 rounded-lg p-1 flex-1 md:flex-none overflow-x-auto min-w-fit">
            <button
              onClick={() => setActiveTab('info')}
              className={`flex-1 md:flex-none whitespace-nowrap px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'info' ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white' : 'text-zinc-500 dark:text-zinc-400'}`}
            >
              {t('tab_details')}
            </button>
            <button
              onClick={() => setActiveTab('setlist')}
              className={`flex-1 md:flex-none whitespace-nowrap px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'setlist' ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white' : 'text-zinc-500 dark:text-zinc-400'}`}
            >
              {t('tab_setlist')} ({displayedSongIds.length})
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'info' && (
        <div className="grid gap-4 animate-in fade-in slide-in-from-left-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-brand-600 dark:text-brand-400">{t('section_options')}</h3>
              <Button variant="ghost" className="text-sm gap-2" onClick={() => setShowProposalForm(!showProposalForm)}>
                <Plus size={16} /> {t('propose_option')}
              </Button>
            </div>

            {showProposalForm && (
              <div className="mb-6 bg-zinc-50 dark:bg-zinc-950 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
                <h4 className="text-sm font-bold text-zinc-900 dark:text-white mb-3">{t('propose_new_title')}</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                  <DatePicker value={propDate} onChange={setPropDate} className="[&>button]:py-2 [&>button]:bg-white dark:[&>button]:bg-zinc-900" />
                  <TimePicker value={propTime} onChange={setPropTime} className="[&>select]:py-2 [&>select]:bg-white dark:[&>select]:bg-zinc-900" />
                  <input type="text" placeholder={t('field_location')} value={propLocation} onChange={e => setPropLocation(e.target.value)} className="p-2 rounded border dark:bg-zinc-900" />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" onClick={() => setShowProposalForm(false)} className="text-xs">{t('cancel')}</Button>
                  <Button onClick={handleProposeOption} className="text-xs">{t('save')}</Button>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {rehearsal.options.map(option => {
                const voters = option.voterIds || [];
                const hasVoted = voters.includes(currentUser.id);
                const voteCount = voters.length;

                return (
                  <div key={option.id} className={`p-4 rounded-lg border ${rehearsal.confirmedOptionId === option.id ? 'bg-brand-50 dark:bg-brand-900/20 border-brand-200' : 'bg-zinc-50 dark:bg-zinc-950 border-zinc-200'}`}>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-zinc-900 dark:text-white font-medium">
                          <Calendar size={16} className="text-brand-500" />
                          {new Date(option.date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 text-sm">
                          <Clock size={16} />
                          {option.time}
                        </div>
                        <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 text-sm">
                          <MapPin size={16} />
                          {option.location}
                        </div>
                      </div>

                      {rehearsal.status !== 'CONFIRMED' ? (
                        <div className="flex flex-col items-end gap-3 w-full md:w-auto">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-zinc-500">{voteCount} {t('votes_label')}</span>
                          </div>
                          <div className="flex gap-2 w-full md:w-auto">
                            <Button
                              variant={hasVoted ? "primary" : "secondary"}
                              className="flex-1 md:flex-none text-sm"
                              onClick={() => handleToggleVote(option.id)}
                            >
                              {hasVoted ? <CheckCircle2 size={16} className="mr-2" /> : <ThumbsUp size={16} className="mr-2" />}
                              {hasVoted ? t('vote_leave') : t('vote_join')}
                            </Button>
                            {voteCount > 0 && (
                              <Button variant="secondary" className="text-sm" onClick={() => handleConfirmOption(option.id)}>
                                {t('confirm_option')}
                              </Button>
                            )}
                          </div>
                        </div>
                      ) : (
                        rehearsal.confirmedOptionId === option.id && (
                          <div className="flex items-center gap-2 text-brand-600 bg-brand-100 px-3 py-1 rounded-full text-xs font-bold">
                            <CheckCircle2 size={14} /> {t('status_confirmed')}
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )
      }

      {
        activeTab === 'setlist' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4">

            {/* Linked Setlist Banner */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-xl shadow-sm mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-1">Repertorio Activo</h3>
                {activeSetlist ? (
                  <div>
                    <p className="font-bold text-lg text-brand-600 dark:text-brand-400 capitalize">{activeSetlist.title}</p>
                    <p className="text-sm text-zinc-500">{activeSetlist.description || 'Setlist de la Biblioteca'}</p>
                  </div>
                ) : (
                  <p className="font-bold text-lg text-zinc-900 dark:text-white capitalize">Canciones Sueltas (Personalizado)</p>
                )}
              </div>

              <div className="w-full md:w-auto flex items-center gap-2">
                {!activeSetlist ? (
                  <select
                    onChange={(e) => {
                      if (e.target.value) handleLinkSetlist(e.target.value);
                    }}
                    className="bg-zinc-100 dark:bg-zinc-800 border-none text-sm p-2 rounded-lg text-zinc-700 dark:text-zinc-300 outline-none w-full cursor-pointer"
                  >
                    <option value="">+ Asociar Setlist de Biblioteca</option>
                    {availableSetlists.map(s => (
                      <option key={s.id} value={s.id}>{s.title} ({s.songs.length} canciones)</option>
                    ))}
                  </select>
                ) : (
                  <Button variant="secondary" onClick={handleUnlinkSetlist} className="w-full md:w-auto text-xs py-1.5 h-auto border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">
                    Desvincular Setlist
                  </Button>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center mt-8">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Canciones del Ensayo</h3>
              {!activeSetlist && (
                <Button
                  onClick={() => setShowAddSection(!showAddSection)}
                  variant={showAddSection ? "secondary" : "primary"}
                  className="gap-2"
                >
                  {showAddSection ? <ChevronUp size={18} /> : <Plus size={18} />}
                  {showAddSection ? 'Cerrar' : 'Agregar Canción'}
                </Button>
              )}
            </div>

            {showAddSection && !activeSetlist && (
              <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 mb-6">
                <div className="flex gap-4 mb-4 border-b border-zinc-200 dark:border-zinc-800 pb-2">
                  <button
                    onClick={() => setAddMode('create')}
                    className={`text-sm font-medium pb-2 ${addMode === 'create' ? 'text-brand-600 border-b-2 border-brand-600' : 'text-zinc-500'}`}
                  >
                    Crear Nueva
                  </button>
                  <button
                    onClick={() => setAddMode('search')}
                    className={`text-sm font-medium pb-2 ${addMode === 'search' ? 'text-brand-600 border-b-2 border-brand-600' : 'text-zinc-500'}`}
                  >
                    Buscar Existente
                  </button>
                </div>

                {addMode === 'create' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input type="text" placeholder="Título" value={newSongTitle} onChange={e => setNewSongTitle(e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-950 border p-2.5 rounded-lg" />
                      <input type="text" placeholder="Artista" value={newSongArtist} onChange={e => setNewSongArtist(e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-950 border p-2.5 rounded-lg" />
                    </div>
                    <textarea placeholder="Letra y acordes..." value={newSongContent} onChange={e => setNewSongContent(e.target.value)} className="w-full h-40 bg-zinc-50 dark:bg-zinc-950 border p-3 rounded-lg font-mono" />
                    <Button onClick={handleCreateAndAddSong} className="w-full gap-2">
                      <Save size={18} /> Guardar y Agregar
                    </Button>
                  </div>
                )}

                {addMode === 'search' && (
                  <div>
                    <div className="relative mb-3">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                      <input type="text" placeholder="Buscar..." className="w-full pl-9 bg-zinc-50 dark:bg-zinc-950 border p-2.5 rounded-lg" />
                    </div>
                    <div className="max-h-48 overflow-y-auto space-y-2">
                      {availableSongs.filter(s => !rehearsal.setlist.includes(s.id)).map(song => (
                        <div key={song.id} className="flex items-center justify-between p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg cursor-pointer" onClick={() => handleAddSongToSetlist(song.id)}>
                          <div className="flex items-center gap-3">
                            <Music size={16} className="text-zinc-400" />
                            <div>
                              <div className="text-zinc-900 dark:text-white text-sm font-medium">{song.title}</div>
                              <div className="text-zinc-500 text-xs">{song.artist}</div>
                            </div>
                          </div>
                          <Plus size={16} className="text-zinc-400" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="grid gap-3">
              {setlistSongs.map((song, index) => {
                const isEditing = editingSongId === song.id;

                if (isEditing) {
                  return (
                    <div key={song.id} className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-brand-500 shadow-lg">
                      <h4 className="text-sm font-bold text-brand-600 mb-3">Editando: {song.title}</h4>
                      <div className="space-y-3">
                        <input value={newSongTitle} onChange={e => setNewSongTitle(e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-950 border p-2 rounded text-sm" />
                        <input value={newSongArtist} onChange={e => setNewSongArtist(e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-950 border p-2 rounded text-sm" />
                        <textarea value={newSongContent} onChange={e => setNewSongContent(e.target.value)} className="w-full h-32 bg-zinc-50 dark:bg-zinc-950 border p-2 rounded text-sm font-mono" />
                        <div className="flex justify-end gap-2">
                          <Button variant="secondary" onClick={() => setEditingSongId(null)} className="h-8">Cancelar</Button>
                          <Button onClick={handleUpdateSong} className="h-8">Guardar</Button>
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={song.id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                    <div className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1 cursor-pointer" onClick={() => toggleExpand(song.id)}>
                        <span className="text-zinc-400 font-mono text-sm w-6 text-center">{index + 1}</span>
                        <div>
                          <h4 className="text-zinc-900 dark:text-white font-medium flex items-center gap-2">
                            {song.title}
                            {expandedSongId === song.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </h4>
                          <p className="text-zinc-500 text-sm">{song.artist}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button className="p-2 text-zinc-400 hover:text-brand-500" onClick={() => startEditing(song)}><Pencil size={16} /></button>
                        <button className="p-2 text-zinc-400 hover:text-red-500" onClick={() => handleRemoveSongFromSetlist(song.id)}><Trash2 size={16} /></button>
                        <Button variant="primary" className="gap-2 ml-2" onClick={() => onPlaySong(song.id)}>
                          <PlayCircle size={18} /> Ver / Ensayar
                        </Button>
                      </div>
                    </div>

                    {expandedSongId === song.id && (
                      <div className="border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 p-6">
                        <pre className="font-mono text-sm whitespace-pre-wrap leading-relaxed text-zinc-700 dark:text-zinc-300">
                          {song.content}
                        </pre>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )
      }
    </div >
  );
};