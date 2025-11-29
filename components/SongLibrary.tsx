import React, { useState } from 'react';
import { Song } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from './Button';
import { Search, Music, Plus, Pencil, Trash2 } from 'lucide-react';
import { deleteSong } from '../services/storageService';

interface SongLibraryProps {
  songs: Song[];
  onCreateNew: () => void;
  onEdit: (song: Song) => void;
}

export const SongLibrary: React.FC<SongLibraryProps> = ({ songs, onCreateNew, onEdit }) => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSongs = songs.filter(s => 
    s.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.artist.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('¿Estás seguro de que quieres eliminar esta canción de la biblioteca?')) {
      await deleteSong(id);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">{t('library_title')}</h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">{t('library_subtitle')}</p>
        </div>
        <Button onClick={onCreateNew} className="gap-2">
          <Plus size={18} />
          {t('new_song')}
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
        <input 
          type="text" 
          placeholder={t('search_placeholder')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-zinc-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none shadow-sm"
        />
      </div>

      <div className="grid gap-3">
        {filteredSongs.length > 0 ? (
          filteredSongs.map(song => (
            <div 
              key={song.id} 
              onClick={() => onEdit(song)}
              className="group bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-xl flex items-center justify-between hover:border-brand-500/50 hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="bg-zinc-100 dark:bg-zinc-800 p-3 rounded-lg text-zinc-400 group-hover:text-brand-500 group-hover:bg-brand-50 dark:group-hover:bg-brand-900/20 transition-colors">
                  <Music size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-zinc-900 dark:text-white">{song.title}</h3>
                  <p className="text-sm text-zinc-500">{song.artist || 'Artista Desconocido'}</p>
                </div>
              </div>
              
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={(e) => { e.stopPropagation(); onEdit(song); }}
                  className="p-2 text-zinc-400 hover:text-brand-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                  title="Editar"
                >
                  <Pencil size={18} />
                </button>
                <button 
                  onClick={(e) => handleDelete(e, song.id)}
                  className="p-2 text-zinc-400 hover:text-red-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                  title="Eliminar"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-zinc-500">
            <Music className="mx-auto mb-3 opacity-20" size={48} />
            <p>{t('no_songs_found')}</p>
          </div>
        )}
      </div>
    </div>
  );
};