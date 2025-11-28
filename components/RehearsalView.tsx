import React, { useState, useEffect } from 'react';
import { Rehearsal, Song, RehearsalOption, ViewState } from '../types';
import { Button } from './Button';
import { Calendar, MapPin, Clock, CheckCircle2, Circle, Plus, Trash2, ArrowLeft, PlayCircle, Music, ChevronDown, ChevronUp, Save, Search, Pencil, Share2, Copy } from 'lucide-react';
import { subscribeToSongs, saveSong, saveRehearsal } from '../services/storageService';
import { formatSongContent } from '../services/geminiService';

interface RehearsalViewProps {
  rehearsal: Rehearsal;
  onBack: () => void;
  onUpdate: (updated: Rehearsal) => void;
  onPlaySong: (songId: string) => void;
}

export const RehearsalView: React.FC<RehearsalViewProps> = ({ rehearsal, onBack, onUpdate, onPlaySong }) => {
  const [activeTab, setActiveTab] = useState<'info' | 'setlist'>('info');
  const [availableSongs, setAvailableSongs] = useState<Song[]>([]);
  const [showAddSection, setShowAddSection] = useState(false);
  const [addMode, setAddMode] = useState<'search' | 'create'>('create');
  const [copySuccess, setCopySuccess] = useState(false);
  
  // Create Form State
  const [newSongTitle, setNewSongTitle] = useState('');
  const [newSongArtist, setNewSongArtist] = useState('');
  const [newSongContent, setNewSongContent] = useState('');
  const [isFormatting, setIsFormatting] = useState(false);

  // Expand state for accordion view
  const [expandedSongId, setExpandedSongId] = useState<string | null>(null);
  const [editingSongId, setEditingSongId] = useState<string | null>(null);

  useEffect(() => {
    // Subscribe to songs instead of one-time fetch
    const unsubscribe = subscribeToSongs((songs) => {
        setAvailableSongs(songs);
        if (songs.length > 0 && addMode === 'create') {
           // Optional: logic to suggest search
        }
    });
    return () => unsubscribe();
  }, []);

  const handleVote = async (optionId: string) => {
    const updatedOptions = rehearsal.options.map(opt => {
      if (opt.id === optionId) {
        return { ...opt, votes: opt.votes + 1 };
      }
      return opt;
    });
    const updated = { ...rehearsal, options: updatedOptions };
    // Optimistic Update
    onUpdate(updated);
  };

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

    // Async save to cloud
    await saveSong(newSong);
    
    // Add to current rehearsal
    const updatedRehearsal = { ...rehearsal, setlist: [...rehearsal.setlist, newSong.id] };
    onUpdate(updatedRehearsal);

    // Reset Form
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

     await saveSong(songToUpdate);
     
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
    if(confirm('¿Quitar esta canción del ensayo?')) {
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

  const setlistSongs = rehearsal.setlist.map(id => availableSongs.find(s => s.id === id)).filter(Boolean) as Song[];

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack} className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-full transition-colors">
          <ArrowLeft className="text-zinc-500 dark:text-zinc-400" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">{rehearsal.title}</h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">Organiza tu banda</p>
        </div>
        
        {/* Share Button */}
        <div className="ml-auto flex items-center gap-2">
            <Button variant="secondary" onClick={handleShare} className="hidden sm:flex items-center gap-2 border-brand-200 dark:border-brand-900/30 text-brand-600 dark:text-brand-400">
               {copySuccess ? <CheckCircle2 size={16} /> : <Share2 size={16} />}
               {copySuccess ? 'Copiado!' : 'Invitar'}
            </Button>
            
            <div className="flex bg-zinc-200 dark:bg-zinc-800 rounded-lg p-1 ml-2">
            <button 
                onClick={() => setActiveTab('info')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'info' ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'}`}
            >
                Detalles
            </button>
            <button 
                onClick={() => setActiveTab('setlist')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'setlist' ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'}`}
            >
                Setlist ({rehearsal.setlist.length})
            </button>
            </div>
        </div>
      </div>

      {activeTab === 'info' && (
        <div className="grid gap-4 animate-in fade-in slide-in-from-left-4">
          
          <div className="sm:hidden mb-2">
             <Button variant="secondary" onClick={handleShare} className="w-full justify-center gap-2">
               <Share2 size={16} /> Invitar a la banda
             </Button>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4 text-brand-600 dark:text-brand-400">Opciones de Fecha y Lugar</h3>
            <div className="space-y-4">
              {rehearsal.options.map(option => (
                <div key={option.id} className={`relative p-4 rounded-lg border transition-all ${rehearsal.confirmedOptionId === option.id ? 'bg-brand-50 dark:bg-brand-900/20 border-brand-200 dark:border-brand-500/50' : 'bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800'}`}>
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-zinc-900 dark:text-white font-medium">
                        <Calendar size={16} className="text-brand-500 dark:text-brand-400" />
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
                      <div className="flex flex-col items-end gap-2">
                        <div className="text-sm text-zinc-500">{option.votes} votos</div>
                         <div className="flex gap-2">
                           <Button variant="ghost" className="h-8 px-3 border border-zinc-200 dark:border-zinc-700" onClick={() => handleVote(option.id)}>
                             +1 Votar
                           </Button>
                           <Button variant="secondary" className="h-8 px-3 text-brand-600 dark:text-brand-400 border-brand-200 dark:border-brand-900/30" onClick={() => handleConfirmOption(option.id)}>
                             Confirmar
                           </Button>
                         </div>
                      </div>
                    ) : (
                      rehearsal.confirmedOptionId === option.id && (
                        <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400 bg-brand-100 dark:bg-brand-900/20 px-3 py-1 rounded-full text-xs font-bold border border-brand-200 dark:border-brand-500/20">
                          <CheckCircle2 size={14} /> CONFIRMADO
                        </div>
                      )
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'setlist' && (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Canciones del Ensayo</h3>
            <Button 
                onClick={() => {
                    setShowAddSection(!showAddSection);
                    // Reset edit state when opening add
                    setEditingSongId(null);
                    setNewSongTitle('');
                    setNewSongContent('');
                    setNewSongArtist('');
                }} 
                variant={showAddSection ? "secondary" : "primary"} 
                className="gap-2"
            >
              {showAddSection ? <ChevronUp size={18}/> : <Plus size={18} />} 
              {showAddSection ? 'Cerrar' : 'Agregar Canción'}
            </Button>
          </div>

          {/* Add / Create Section */}
          {showAddSection && (
            <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 mb-6 shadow-lg">
                <div className="flex gap-4 mb-4 border-b border-zinc-200 dark:border-zinc-800 pb-2">
                    <button 
                        onClick={() => setAddMode('create')}
                        className={`text-sm font-medium pb-2 transition-colors ${addMode === 'create' ? 'text-brand-600 dark:text-brand-400 border-b-2 border-brand-600 dark:border-brand-400' : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'}`}
                    >
                        Crear Nueva
                    </button>
                    <button 
                        onClick={() => setAddMode('search')}
                        className={`text-sm font-medium pb-2 transition-colors ${addMode === 'search' ? 'text-brand-600 dark:text-brand-400 border-b-2 border-brand-600 dark:border-brand-400' : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'}`}
                    >
                        Buscar Existente
                    </button>
                </div>

                {addMode === 'create' && (
                    <div className="space-y-4 animate-in fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <input 
                                type="text" 
                                placeholder="Título de la Canción" 
                                value={newSongTitle}
                                onChange={e => setNewSongTitle(e.target.value)}
                                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-lg p-2.5 text-zinc-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
                            />
                            <input 
                                type="text" 
                                placeholder="Artista (Opcional)" 
                                value={newSongArtist}
                                onChange={e => setNewSongArtist(e.target.value)}
                                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-lg p-2.5 text-zinc-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
                            />
                        </div>
                        <div className="relative">
                            <textarea 
                                placeholder="Pega aquí la letra y los acordes..." 
                                value={newSongContent}
                                onChange={e => setNewSongContent(e.target.value)}
                                className="w-full h-40 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-lg p-3 font-mono text-sm text-zinc-800 dark:text-zinc-300 focus:ring-2 focus:ring-brand-500 outline-none resize-y"
                            />
                            <button 
                                onClick={handleAIFormat}
                                disabled={!newSongContent || isFormatting}
                                className="absolute top-2 right-2 text-xs bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 px-2 py-1 rounded text-zinc-600 dark:text-zinc-400 transition-colors"
                            >
                                {isFormatting ? '...' : '✨ Formatear IA'}
                            </button>
                        </div>
                        <Button onClick={handleCreateAndAddSong} className="w-full justify-center gap-2">
                            <Save size={18} /> Guardar y Agregar al Ensayo
                        </Button>
                    </div>
                )}

                {addMode === 'search' && (
                    <div className="animate-in fade-in">
                         <div className="relative mb-3">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                            <input 
                                type="text" 
                                placeholder="Buscar en tu biblioteca..." 
                                className="w-full pl-9 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-lg p-2.5 text-zinc-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
                            />
                         </div>
                        <div className="max-h-48 overflow-y-auto space-y-2 pr-2 chord-scroll">
                            {availableSongs.filter(s => !rehearsal.setlist.includes(s.id)).map(song => (
                            <div key={song.id} className="flex items-center justify-between p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg group cursor-pointer border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700" onClick={() => handleAddSongToSetlist(song.id)}>
                                <div className="flex items-center gap-3">
                                <div className="bg-zinc-100 dark:bg-zinc-800 p-2 rounded text-zinc-400 group-hover:text-white group-hover:bg-brand-600 transition-colors">
                                    <Music size={16} />
                                </div>
                                <div>
                                    <div className="text-zinc-900 dark:text-white text-sm font-medium">{song.title}</div>
                                    <div className="text-zinc-500 dark:text-zinc-500 text-xs">{song.artist}</div>
                                </div>
                                </div>
                                <Plus size={16} className="text-zinc-400 group-hover:text-brand-500" />
                            </div>
                            ))}
                            {availableSongs.length === 0 && <p className="text-center text-zinc-500 text-sm py-4">No hay canciones guardadas.</p>}
                        </div>
                    </div>
                )}
            </div>
          )}

          {/* Setlist */}
          <div className="grid gap-3">
            {setlistSongs.map((song, index) => {
                const isEditing = editingSongId === song.id;
                
                if (isEditing) {
                    return (
                        <div key={song.id} className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-brand-500 ring-1 ring-brand-500 shadow-lg">
                            <h4 className="text-sm font-bold text-brand-600 mb-3">Editando: {song.title}</h4>
                            <div className="space-y-3">
                                <input 
                                    value={newSongTitle}
                                    onChange={e => setNewSongTitle(e.target.value)}
                                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded p-2 text-sm text-zinc-900 dark:text-white" 
                                    placeholder="Título"
                                />
                                <input 
                                    value={newSongArtist}
                                    onChange={e => setNewSongArtist(e.target.value)}
                                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded p-2 text-sm text-zinc-900 dark:text-white" 
                                    placeholder="Artista"
                                />
                                <textarea 
                                    value={newSongContent}
                                    onChange={e => setNewSongContent(e.target.value)}
                                    className="w-full h-32 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded p-2 text-sm font-mono text-zinc-800 dark:text-zinc-300"
                                />
                                <div className="flex justify-end gap-2">
                                    <Button variant="secondary" onClick={() => setEditingSongId(null)} className="h-8 text-sm">Cancelar</Button>
                                    <Button onClick={handleUpdateSong} className="h-8 text-sm">Guardar Cambios</Button>
                                </div>
                            </div>
                        </div>
                    );
                }

                return (
                    <div key={song.id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden transition-all shadow-sm hover:shadow-md">
                        {/* Song Header Row */}
                        <div className="p-4 flex items-center justify-between">
                            <div 
                                className="flex items-center gap-4 flex-1 cursor-pointer" 
                                onClick={() => toggleExpand(song.id)}
                            >
                                <span className="text-zinc-400 dark:text-zinc-600 font-mono text-sm w-6 text-center">{index + 1}</span>
                                <div>
                                    <h4 className="text-zinc-900 dark:text-white font-medium flex items-center gap-2">
                                        {song.title}
                                        {expandedSongId === song.id ? <ChevronUp size={14} className="text-zinc-400"/> : <ChevronDown size={14} className="text-zinc-400"/>}
                                    </h4>
                                    <p className="text-zinc-500 text-sm">{song.artist}</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <button 
                                    className="p-2 text-zinc-400 hover:text-brand-500 transition-colors"
                                    onClick={() => startEditing(song)}
                                    title="Editar contenido"
                                >
                                    <Pencil size={16} />
                                </button>
                                <button 
                                    className="p-2 text-zinc-400 hover:text-red-500 transition-colors" 
                                    onClick={() => handleRemoveSongFromSetlist(song.id)}
                                    title="Quitar del setlist"
                                >
                                    <Trash2 size={16} />
                                </button>
                                <Button variant="primary" className="gap-2 ml-2" onClick={() => onPlaySong(song.id)}>
                                    <PlayCircle size={18} /> Ver / Ensayar
                                </Button>
                            </div>
                        </div>

                        {/* Expanded Lyrics Area */}
                        {expandedSongId === song.id && (
                            <div className="border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 p-6 animate-in slide-in-from-top-2">
                                <pre className="font-mono text-sm md:text-base whitespace-pre-wrap leading-relaxed text-zinc-700 dark:text-zinc-300 overflow-x-auto">
                                    {song.content}
                                </pre>
                                <div className="mt-4 flex justify-end">
                                     <button 
                                        onClick={() => toggleExpand(song.id)} 
                                        className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                                     >
                                         Cerrar vista previa
                                     </button>
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}

            {setlistSongs.length === 0 && !showAddSection && (
               <div className="text-center py-12 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
                 <Music className="mx-auto text-zinc-300 dark:text-zinc-700 mb-2" size={32} />
                 <p className="text-zinc-500">Este ensayo aún no tiene canciones.</p>
                 <button onClick={() => setShowAddSection(true)} className="mt-2 text-brand-600 dark:text-brand-400 hover:underline font-medium">
                     + Agregar canción ahora
                 </button>
               </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};