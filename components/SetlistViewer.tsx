import React, { useState, useEffect } from 'react';
import { Setlist, Song } from '../types';
import { ArrowLeft, Music } from 'lucide-react';

interface SetlistViewerProps {
    setlist: Setlist;
    availableSongs: Song[];
    initialSongId?: string;
    onBack: () => void;
}

export const SetlistViewer: React.FC<SetlistViewerProps> = ({ setlist, availableSongs, initialSongId, onBack }) => {
    // Inicializamos con la primera canción del setlist (si la hay) o con la canción inicial
    const [selectedSongId, setSelectedSongId] = useState<string>(
        initialSongId || (setlist.songs.length > 0 ? setlist.songs[0] : '')
    );

    // Mapear los IDs a objetos Song reales filtrando los no encontrados
    const setlistSongs = setlist.songs
        .map(id => availableSongs.find(s => s.id === id))
        .filter(Boolean) as Song[];

    const activeSong = setlistSongs.find(s => s.id === selectedSongId);

    // Si el setlist cambia, resetear la selección o aplicar el initialSongId
    useEffect(() => {
        if (initialSongId && setlist.songs.includes(initialSongId)) {
            setSelectedSongId(initialSongId);
        } else if (setlist.songs.length > 0 && !setlist.songs.includes(selectedSongId)) {
            setSelectedSongId(setlist.songs[0]);
        }
    }, [setlist, selectedSongId, initialSongId]);

    return (
        <div className="fixed inset-0 z-50 bg-white dark:bg-zinc-950 flex flex-col animate-in fade-in duration-300">

            {/* Header Sticky con Selector */}
            <div className="flex-none bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 p-4 shadow-sm">
                <div className="max-w-4xl mx-auto flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors flex-shrink-0"
                        title="Volver"
                    >
                        <ArrowLeft className="text-zinc-600 dark:text-zinc-300" />
                    </button>

                    <div className="flex-1">
                        <div className="relative">
                            <select
                                value={selectedSongId}
                                onChange={(e) => setSelectedSongId(e.target.value)}
                                className="w-full appearance-none bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white font-bold text-lg md:text-xl py-3 pl-4 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer transition-colors"
                                style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: `right 0.5rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.5em 1.5em` }}
                            >
                                {setlistSongs.map((song, index) => (
                                    <option key={song.id} value={song.id}>
                                        {index + 1}. {song.title} {song.artist ? `- ${song.artist}` : ''}
                                    </option>
                                ))}
                                {setlistSongs.length === 0 && (
                                    <option value="" disabled>El setlist está vacío</option>
                                )}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Área de Visualización (Letras/Acordes) */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 chord-scroll">
                <div className="max-w-4xl mx-auto">
                    {activeSong ? (
                        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 md:p-10 shadow-sm min-h-full">
                            <h2 className="text-3xl font-black text-zinc-900 dark:text-white mb-2">{activeSong.title}</h2>
                            <h3 className="text-lg text-brand-600 dark:text-brand-400 font-medium mb-8">{activeSong.artist || 'Artista Desconocido'}</h3>

                            <div
                                className="font-mono text-[15px] sm:text-base leading-relaxed whitespace-pre-wrap text-zinc-800 dark:text-zinc-300"
                                dangerouslySetInnerHTML={{
                                    __html: activeSong.content.replace(
                                        /\[(.*?)\]/g,
                                        '<span class="text-brand-600 dark:text-brand-400 font-bold">[$1]</span>'
                                    )
                                }}
                            />
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-[50vh] text-zinc-500">
                            <Music size={64} className="opacity-20 mb-4" />
                            <p className="text-lg font-medium">No hay canciones para mostrar</p>
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
};
