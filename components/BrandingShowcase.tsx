import React from 'react';
import { Mic2, Music2, ArrowRight } from 'lucide-react';

export const BrandingShowcase: React.FC = () => {
  return (
    <div className="w-full mb-8 animate-in slide-in-from-top-4 duration-700">
      <div className="bg-gradient-to-r from-zinc-100 to-zinc-200 dark:from-zinc-900 dark:to-zinc-950 p-1 rounded-2xl border border-zinc-200 dark:border-zinc-800">
        <div className="flex flex-col md:flex-row gap-1">
          
          {/* Option A: ANSAI */}
          <div className="flex-1 bg-white dark:bg-black rounded-xl p-6 md:p-8 relative overflow-hidden group hover:ring-2 ring-blue-500/50 transition-all cursor-pointer">
            <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">OPCIÓN A</div>
            <div className="flex flex-col items-center justify-center space-y-4 py-6">
              <div className="flex items-center gap-2">
                <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2.5 rounded-lg shadow-lg shadow-blue-500/20">
                  <Mic2 className="text-white" size={24} />
                </div>
                <span className="text-3xl font-sans font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400">
                  Ansai
                </span>
              </div>
              <p className="text-xs font-sans text-zinc-400 uppercase tracking-widest text-center">The Sync App</p>
              <div className="mt-4 flex gap-2">
                 <div className="h-1 w-8 bg-blue-500 rounded-full"></div>
                 <div className="h-1 w-2 bg-zinc-200 dark:bg-zinc-800 rounded-full"></div>
              </div>
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm text-zinc-500">Estilo: Tech, Moderno, SaaS.</p>
            </div>
          </div>

          {/* Option B: VERSO */}
          <div className="flex-1 bg-zinc-50 dark:bg-zinc-900 rounded-xl p-6 md:p-8 relative overflow-hidden group hover:ring-2 ring-red-500/50 transition-all cursor-pointer">
             <div className="absolute top-0 right-0 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">OPCIÓN B</div>
            <div className="flex flex-col items-center justify-center space-y-4 py-6">
              <div className="flex items-center gap-3 border-b-2 border-red-600 pb-2 px-4">
                <Music2 className="text-zinc-900 dark:text-white" size={28} strokeWidth={1.5} />
                <span className="text-3xl font-serif italic font-medium text-zinc-900 dark:text-white">
                  Verso.
                </span>
              </div>
              <p className="text-xs font-serif text-zinc-500 text-center italic">Donde la música ocurre.</p>
               <div className="mt-4 flex gap-2">
                 <div className="h-1.5 w-1.5 bg-red-600 rounded-full"></div>
                 <div className="h-1.5 w-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full"></div>
                 <div className="h-1.5 w-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full"></div>
              </div>
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm text-zinc-500">Estilo: Editorial, Clásico, Artístico.</p>
            </div>
          </div>

        </div>
        <div className="text-center py-2 text-xs text-zinc-400">
          Visualización de conceptos de marca (Solo visible para admin)
        </div>
      </div>
    </div>
  );
};