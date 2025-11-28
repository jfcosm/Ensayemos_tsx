import React from 'react';
import { Song } from '../types';
import { ChevronDown, ArrowLeft } from 'lucide-react';

interface ChordViewerProps {
  currentSong: Song;
  playlist: Song[];
  onSongChange: (songId: string) => void;
  onClose: () => void;
}

export const ChordViewer: React.FC<ChordViewerProps> = ({ currentSong, playlist, onSongChange, onClose }) => {
  return (
    <div className="fixed inset-0 bg-white dark:bg-zinc-950 z-50 flex flex-col transition-colors duration-300">
      {/* Sticky Header with Dropdown */}
      <div className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 p-4 shadow-xl z-10 flex items-center justify-between shrink-0">
        <button onClick={onClose} className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-full transition-colors">
          <ArrowLeft className="text-zinc-500 dark:text-zinc-400" />
        </button>
        
        <div className="relative group max-w-xs md:max-w-md w-full mx-4">
           <select 
             className="w-full appearance-none bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white py-2 px-4 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium truncate cursor-pointer shadow-sm"
             value={currentSong.id}
             onChange={(e) => onSongChange(e.target.value)}
           >
             {playlist.map(s => (
               <option key={s.id} value={s.id}>{s.title} - {s.artist}</option>
             ))}
           </select>
           <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" size={16} />
        </div>

        <div className="w-10"></div> {/* Spacer for balance */}
      </div>

      {/* Scrollable Lyric/Chord Area */}
      <div className="flex-1 overflow-y-auto chord-scroll bg-white dark:bg-zinc-950">
        <div className="max-w-3xl mx-auto p-4 md:p-8 min-h-full">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">{currentSong.title}</h1>
            <p className="text-brand-600 dark:text-brand-400 text-lg">{currentSong.artist}</p>
          </div>
          
          <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-xl p-6 md:p-10 border border-zinc-200 dark:border-zinc-800 shadow-2xl">
            <pre className="font-mono text-base md:text-lg whitespace-pre-wrap leading-relaxed text-zinc-800 dark:text-zinc-200 overflow-x-auto">
              {currentSong.content}
            </pre>
          </div>
          
          <div className="h-20"></div> {/* Bottom padding for scrolling comfort */}
        </div>
      </div>
    </div>
  );
};