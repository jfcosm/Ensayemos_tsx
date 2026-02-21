import React, { useState } from 'react';
import { Song, Setlist } from '../types';
import { Button } from './Button';
import { useLanguage } from '../contexts/LanguageContext';
import { X, Search, Plus, Trash2, Save, Music } from 'lucide-react';

interface SetlistEditorProps {
    initialSetlist: Setlist | null;
    availableSongs: Song[];
    onClose: () => void;
    onSave: (setlist: Setlist) => void;
}

export const SetlistEditor: React.FC<SetlistEditorProps> = ({ initialSetlist, availableSongs, onClose, onSave }) => {
    const { t } = useLanguage();
    const [title, setTitle] = useState(initialSetlist?.title || '');
    const [description, setDescription] = useState(initialSetlist?.description || '');
    const [selectedSongIds, setSelectedSongIds] = useState<string[]>(initialSetlist?.songs || []);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const filteredSongs = availableSongs.filter(s =>
        s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.artist.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const toggleSong = (songId: string) => {
        if (selectedSongIds.includes(songId)) {
            setSelectedSongIds(prev => prev.filter(id => id !== songId));
        } else {
            setSelectedSongIds(prev => [...prev, songId]);
        }
    };

    const handleSave = () => {
        if (!title.trim()) {
            alert('Por favor, ingresa un título para el setlist.');
            return;
        }

        setIsSaving(true);
        const newSetlist: Setlist = {
            id: initialSetlist?.id || crypto.randomUUID(),
            title,
            description,
            songs: selectedSongIds,
            ownerId: initialSetlist?.ownerId || '', // Managed by parent on save
            createdAt: initialSetlist?.createdAt || Date.now()
        };

        // Fire and forget (Firebase handles offline cache, updates UI snapshot instantly)
        onSave(newSetlist);

        // Let it show the spinner for a tiny fraction just for feedback, then close
        setTimeout(() => {
            setIsSaving(false);
            onClose();
        }, 150);
    };

    const selectedSongsList = selectedSongIds.map(id => availableSongs.find(s => s.id === id)).filter(Boolean) as Song[];

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-zinc-900 w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-zinc-50 dark:bg-zinc-900">
                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
                        {initialSetlist ? 'Editar Setlist' : 'Nuevo Setlist'}
                    </h2>
                    <button onClick={onClose} className="p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-full transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    <div className="grid md:grid-cols-2 gap-8">

                        {/* Info and Selected Songs Column */}
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Nombre del Setlist</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Ej. Show en vivo, Acústico, Covers..."
                                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-zinc-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Descripción (Opcional)</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Detalles sobre este repertorio..."
                                    rows={3}
                                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-zinc-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none resize-none"
                                />
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-bold text-zinc-900 dark:text-white">Canciones agregadas ({selectedSongIds.length})</h3>
                                </div>

                                <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 min-h-[200px] overflow-y-auto max-h-[300px]">
                                    {selectedSongsList.length === 0 ? (
                                        <div className="h-full flex flex-col items-center justify-center text-zinc-400 py-8">
                                            <Music size={32} className="mb-2 opacity-50" />
                                            <p className="text-sm">No hay canciones en este setlist aún.</p>
                                            <p className="text-xs text-zinc-500 mt-1">Busca y agrega canciones desde el panel derecho.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {selectedSongsList.map((song, index) => (
                                                <div key={`selected-${song.id}`} className="flex items-center justify-between bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3 rounded-lg shadow-sm">
                                                    <div className="flex items-center gap-3 overflow-hidden">
                                                        <span className="text-xs font-mono text-zinc-400 w-5">{index + 1}.</span>
                                                        <div className="truncate">
                                                            <p className="font-medium text-sm text-zinc-900 dark:text-white truncate">{song.title}</p>
                                                            <p className="text-xs text-zinc-500 truncate">{song.artist}</p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => toggleSong(song.id)}
                                                        className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Song Picker Column */}
                        <div className="flex flex-col h-full border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-900">
                            <div className="p-4 bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800">
                                <h3 className="font-bold text-zinc-900 dark:text-white mb-3 flex items-center gap-2">
                                    <Search size={18} className="text-brand-500" />
                                    Buscar en Biblioteca
                                </h3>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Buscar canción o artista..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-3 pr-10 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2.5 text-sm text-zinc-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
                                    />
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-zinc-50/50 dark:bg-zinc-950/50 max-h-[400px]">
                                {filteredSongs.length > 0 ? (
                                    filteredSongs.map(song => {
                                        const isSelected = selectedSongIds.includes(song.id);
                                        return (
                                            <div
                                                key={`picker-${song.id}`}
                                                onClick={() => toggleSong(song.id)}
                                                className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all border ${isSelected
                                                    ? 'bg-brand-50 dark:bg-brand-900/20 border-brand-200 dark:border-brand-800'
                                                    : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-brand-300'
                                                    }`}
                                            >
                                                <div className="truncate pr-4">
                                                    <p className={`font-medium text-sm truncate ${isSelected ? 'text-brand-700 dark:text-brand-300' : 'text-zinc-900 dark:text-white'}`}>
                                                        {song.title}
                                                    </p>
                                                    <p className="text-xs text-zinc-500 truncate">{song.artist}</p>
                                                </div>
                                                <div>
                                                    {isSelected ? (
                                                        <div className="bg-brand-500 text-white p-1 rounded-md">
                                                            <Trash2 size={14} />
                                                        </div>
                                                    ) : (
                                                        <div className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-brand-100 dark:hover:bg-brand-900 p-1 rounded-md transition-colors">
                                                            <Plus size={14} />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <p className="text-center text-zinc-500 text-sm py-4">No se encontraron canciones.</p>
                                )}
                            </div>
                        </div>

                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex justify-end gap-3">
                    <Button variant="ghost" onClick={onClose} disabled={isSaving}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSave} className="gap-2 px-6" isLoading={isSaving}>
                        {!isSaving && <Save size={18} />}
                        {isSaving ? 'Guardando...' : 'Guardar Setlist'}
                    </Button>
                </div>
            </div>
        </div>
    );
};
