import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Music4, Heart, Gift } from 'lucide-react';

export const Footer: React.FC = () => {
    const { t } = useLanguage();

    return (
        <footer className="w-full bg-[#0a0a0a] border-t border-red-900/30 pt-16 pb-8 px-6 text-zinc-400 mt-auto">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 mb-16">
                    {/* Left Section: Logo and Gift Text */}
                    <div className="space-y-4 max-w-sm">
                        <div className="flex items-center gap-3">
                            <div className="bg-red-600 rounded-xl p-2.5 flex items-center justify-center transform hover:scale-105 transition-transform cursor-pointer shadow-lg shadow-red-900/20">
                                <Music4 className="text-white" size={24} />
                            </div>
                            <span className="text-3xl font-black tracking-tight text-white">verso.</span>
                        </div>
                        <p className="text-sm font-medium leading-relaxed text-zinc-500">
                            {t('footer_gift_community')}
                        </p>
                    </div>

                    {/* Right Section: Powered by Melodia Lab */}
                    <div className="flex flex-col items-start md:items-end gap-3 text-left md:text-right">
                        <span className="text-[10px] font-black tracking-widest uppercase text-zinc-600">
                            {t('footer_powered_by')}
                        </span>
                        
                        <div className="relative group cursor-pointer">
                            <div className="absolute -inset-4 bg-red-600/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                            <h2 className="relative text-4xl md:text-5xl font-black text-white tracking-tight drop-shadow-[0_0_15px_rgba(220,38,38,0.5)]">
                                MelodIA Lab<span className="text-red-500">.</span>
                            </h2>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 mt-2">
                            <div className="flex items-center gap-2 px-4 py-2 bg-red-950/40 border border-red-900/30 rounded-full text-xs font-bold text-red-400">
                                <Heart size={14} className="fill-red-500/50" />
                                <span>{t('footer_made_for')}</span>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-amber-950/40 border border-amber-900/30 rounded-full text-xs font-bold text-amber-500">
                                <Gift size={14} />
                                <span>{t('footer_free_forever')}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Section: Links & Copyright */}
                <div className="border-t border-zinc-900 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-[10px] font-bold tracking-widest uppercase text-zinc-600">
                        {t('footer_copyright')}
                    </p>
                    
                    <div className="flex items-center gap-8">
                        <a href="#" className="text-[10px] font-bold tracking-widest uppercase text-zinc-600 hover:text-white transition-colors">
                            {t('footer_documentation')}
                        </a>
                        <a href="#" className="text-[10px] font-bold tracking-widest uppercase text-zinc-600 hover:text-white transition-colors">
                            {t('footer_privacy')}
                        </a>
                        <a href="#" className="text-[10px] font-bold tracking-widest uppercase text-zinc-600 hover:text-white transition-colors">
                            {t('footer_terms')}
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};
