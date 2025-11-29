import React, { useState } from 'react';
import { Button } from './Button';
import { useLanguage } from '../contexts/LanguageContext';
import { Wand2, Save, Music, Zap, Sliders, Type } from 'lucide-react';
import { generateSongFromParams } from '../services/geminiService';
import { saveSong } from '../services/storageService';
import { Song } from '../types';

interface SongComposerProps {
    onSongCreated: () => void;
}

export const SongComposer: React.FC<SongComposerProps> = ({ onSongCreated }) => {
    const { t } = useLanguage();
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedContent, setGeneratedContent] = useState('');
    
    // Parameters matching the Armonix screenshot structure
    const [selectedKey, setSelectedKey] = useState('C');
    const [selectedScale, setSelectedScale] = useState('Mayor');
    const [selectedStyle, setSelectedStyle] = useState('Pop');
    const [selectedMood, setSelectedMood] = useState('Feliz');
    const [selectedSpeed, setSelectedSpeed] = useState('Moderado');
    const [selectedComplexity, setSelectedComplexity] = useState('Básico');
    const [topics, setTopics] = useState('');

    const keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const scales = ['Mayor', 'Menor'];
    const styles = ['Pop', 'Rock', 'Ballad', 'Jazz', 'Reggae', 'Lofi', 'Country', 'Techno', 'Electropop', 'Alternative', 'Heavy Metal', 'Blues', 'K Pop', 'Ost'];
    const moods = ['Feliz', 'Triste', 'Melancólico', 'Enérgico', 'Relajado', 'Épico', 'Meditación', 'Concentración'];
    const speeds = ['Lento', 'Moderado', 'Rápido'];
    const complexities = ['Básico', 'Intermedio', 'Avanzado'];

    const handleGenerate = async () => {
        setIsGenerating(true);
        const result = await generateSongFromParams({
            key: selectedKey,
            scale: selectedScale,
            style: selectedStyle,
            mood: selectedMood,
            speed: selectedSpeed,
            complexity: selectedComplexity,
            topics: topics
        });
        setGeneratedContent(result);
        setIsGenerating(false);
    };

    const handleSaveToLibrary = async () => {
        if (!generatedContent) return;
        const titleMatch = generatedContent.match(/Title:\s*(.*)/i) || generatedContent.split('\n')[0];
        const title = Array.isArray(titleMatch) ? titleMatch[1] : titleMatch.replace(/\[.*?\]/g, '').trim();
        
        const newSong: Song = {
            id: crypto.randomUUID(),
            title: title || 'Composición IA',
            artist: 'Verso AI (Armonix)',
            content: generatedContent,
            key: `${selectedKey} ${selectedScale}`
        };

        await saveSong(newSong);
        alert('Canción guardada en la biblioteca');
        onSongCreated();
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 pb-20">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">{t('composer_title')}</h1>
                <p className="text-zinc-500 dark:text-zinc-400">{t('composer_subtitle')}</p>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 md:p-8 shadow-xl">
                
                {/* KEY SECTION */}
                <div className="mb-8">
                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">{t('comp_key')}</label>
                    <div className="flex gap-4">
                        <select 
                            value={selectedKey} 
                            onChange={(e) => setSelectedKey(e.target.value)}
                            className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-lg p-3 text-lg font-bold text-zinc-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none w-32"
                        >
                            {keys.map(k => <option key={k} value={k}>{k}</option>)}
                        </select>
                        <select 
                            value={selectedScale} 
                            onChange={(e) => setSelectedScale(e.target.value)}
                            className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-lg p-3 text-lg font-bold text-zinc-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none w-40"
                        >
                            {scales.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                </div>

                {/* STYLE SECTION */}
                <div className="mb-8">
                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">{t('comp_style')}</label>
                    <div className="flex flex-wrap gap-2">
                        {styles.map(style => (
                            <button
                                key={style}
                                onClick={() => setSelectedStyle(style)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                    selectedStyle === style 
                                    ? 'bg-brand-600 text-white shadow-md shadow-brand-500/30 transform scale-105' 
                                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                                }`}
                            >
                                {style}
                            </button>
                        ))}
                    </div>
                </div>

                {/* MOOD SECTION */}
                <div className="mb-8">
                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">{t('comp_mood')}</label>
                    <div className="flex flex-wrap gap-2">
                        {moods.map(mood => (
                            <button
                                key={mood}
                                onClick={() => setSelectedMood(mood)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                    selectedMood === mood 
                                    ? 'bg-brand-500 text-white shadow-md shadow-brand-500/30 transform scale-105' 
                                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                                }`}
                            >
                                {mood}
                            </button>
                        ))}
                    </div>
                </div>

                {/* SPEED & COMPLEXITY GRID */}
                <div className="grid md:grid-cols-2 gap-8 mb-8">
                    <div>
                        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">{t('comp_speed')}</label>
                        <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg">
                            {speeds.map(speed => (
                                <button
                                    key={speed}
                                    onClick={() => setSelectedSpeed(speed)}
                                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                                        selectedSpeed === speed
                                        ? 'bg-white dark:bg-zinc-600 text-brand-600 dark:text-white shadow-sm'
                                        : 'text-zinc-500 dark:text-zinc-400'
                                    }`}
                                >
                                    {speed}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">{t('comp_complexity')}</label>
                        <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg">
                            {complexities.map(comp => (
                                <button
                                    key={comp}
                                    onClick={() => setSelectedComplexity(comp)}
                                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                                        selectedComplexity === comp
                                        ? 'bg-amber-500 text-white shadow-sm'
                                        : 'text-zinc-500 dark:text-zinc-400'
                                    }`}
                                >
                                    {comp}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* TOPICS INPUT (NEW) */}
                <div className="mb-8">
                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">{t('comp_topics')}</label>
                    <div className="relative">
                        <Type className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                        <input 
                            type="text" 
                            value={topics}
                            onChange={(e) => setTopics(e.target.value)}
                            placeholder={t('comp_topics_placeholder')}
                            className="w-full pl-10 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-lg p-3 text-zinc-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
                        />
                    </div>
                </div>

                <Button 
                    onClick={handleGenerate} 
                    className="w-full py-4 text-lg font-bold shadow-xl shadow-brand-500/20"
                    isLoading={isGenerating}
                >
                    <Wand2 className="mr-2" />
                    {t('comp_generate')}
                </Button>

                {/* Powered By Footer */}
                <div className="mt-4 text-center">
                    <p className="text-xs text-zinc-400">
                        {t('comp_powered_by')} <a href="https://www.armonix.app" target="_blank" rel="noopener noreferrer" className="font-bold text-brand-500 hover:underline">Armonix.app</a>
                    </p>
                </div>

            </div>

            {/* RESULT SECTION */}
            {generatedContent && (
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 md:p-8 shadow-xl animate-in slide-in-from-bottom-8">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Resultado:</h3>
                        <Button onClick={handleSaveToLibrary} variant="secondary" className="gap-2">
                            <Save size={18} />
                            {t('comp_save_library')}
                        </Button>
                    </div>
                    <div className="bg-zinc-50 dark:bg-zinc-950 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 font-mono text-sm md:text-base leading-relaxed whitespace-pre-wrap text-zinc-800 dark:text-zinc-300">
                        {generatedContent}
                    </div>
                </div>
            )}
        </div>
    );
};