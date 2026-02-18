import React, { useState, useEffect } from 'react';
import { Song } from '../types';
import { Button } from './Button';
import { Save, Wand2, X, Music2 } from 'lucide-react';
import { saveSong } from '../services/storageService';
import { formatSongContent } from '../services/geminiService';

interface SongEditorProps {
  initialSong?: Song | null;
  onClose: () => void;
  onSave: () => void;
}

export const SongEditor: React.FC<SongEditorProps> = ({ initialSong, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [content, setContent] = useState('');
  const [isFormatting, setIsFormatting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (initialSong) {
      setTitle(initialSong.title);
      setArtist(initialSong.artist);
      setContent(initialSong.content);
    }
  }, [initialSong]);

  const handleSave = async () => {
    if (!title) return alert('El título es obligatorio');
    
    setIsSaving(true);
    const newSong: Song = {
      id: initialSong?.id || crypto.randomUUID(),
      title,
      artist,
      content
    };
    
    // FLUJO DE RESPUESTA INMEDIATA:
    // Disparamos el guardado pero NO esperamos el await si la red está lenta
    saveSong(newSong); 
    
    // Limpiamos estados y cerramos la vista de inmediato
    setIsSaving(false);
    onSave(); 
  };

  const handleAIFormat = async () => {
    if (!content) return;
    setIsFormatting(true);
    const formatted = await formatSongContent(content);
    setContent(formatted);
    setIsFormatting(false);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 backdrop-blur-sm">
        <h2 className="text-xl font-bold flex items-center gap-2 text-zinc-900 dark:text-white">
          <Music2 className="text-brand-500 dark:text-brand-400" />
          {initialSong ? 'Editar Canción' : 'Nueva Canción'}
        </h2>
        <Button variant="ghost" onClick={onClose}><X size={20} /></Button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Título</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-2 text-zinc-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
              placeholder="Ej: De Música Ligera"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Artista</label>
            <input 
              type="text" 
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-2 text-zinc-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
              placeholder="Ej: Soda Stereo"
            />
          </div>
        </div>

        <div className="space-y-2 h-[calc(100%-120px)] flex flex-col">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Letra y Acordes</label>
            <button 
              onClick={handleAIFormat}
              disabled={isFormatting || !content}
              className="text-xs flex items-center gap-1.5 text-brand-600 dark:text-brand-300 hover:text-brand-500 transition-colors disabled:opacity-50"
            >
              <Wand2 size={14} />
              {isFormatting ? 'Formateando con IA...' : 'Limpiar y Formatear (IA)'}
            </button>
          </div>
          <textarea 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="flex-1 w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 font-mono text-sm leading-relaxed text-zinc-800 dark:text-zinc-300 focus:ring-2 focus:ring-brand-500 outline-none resize-none"
            placeholder="Copia y pega la letra y acordes..."
          />
        </div>
      </div>

      <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex justify-end gap-3">
        <Button variant="secondary" onClick={onClose} disabled={isSaving}>Cancelar</Button>
        <Button onClick={handleSave} className="flex items-center gap-2" isLoading={isSaving}>
          <Save size={18} />
          Guardar Canción
        </Button>
      </div>
    </div>
  );
};