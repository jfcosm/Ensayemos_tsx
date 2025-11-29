import React, { useState } from 'react';
import { User, Language, ViewState } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { Mic2, LogOut, User as UserIcon, Sun, Moon, Globe, Cloud } from 'lucide-react';
import { Button } from './Button';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
  isDark: boolean;
  toggleTheme: () => void;
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  user, 
  onLogout, 
  isDark, 
  toggleTheme,
  currentView,
  onNavigate
}) => {
  const { t, language, setLanguage } = useLanguage();
  const [showLangMenu, setShowLangMenu] = useState(false);

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: 'es', label: 'Español', flag: '🇪🇸' },
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'it', label: 'Italiano', flag: '🇮🇹' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
    { code: 'ja', label: '日本語', flag: '🇯🇵' },
    { code: 'ko', label: '한국어', flag: '🇰🇷' },
    { code: 'zh', label: '中文', flag: '🇨🇳' },
    { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
  ];

  return (
    <nav className="border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md sticky top-0 z-40 transition-colors duration-300">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand */}
        <div 
          className="flex items-center gap-2 font-bold text-xl tracking-tight cursor-pointer"
          onClick={() => user && onNavigate(ViewState.DASHBOARD)}
        >
          <div className="bg-brand-600 p-1.5 rounded-lg text-white shadow-lg shadow-brand-500/30">
            <Mic2 size={20} />
          </div>
          <span className="text-zinc-900 dark:text-white">Verso</span>
        </div>
        
        {/* Controls */}
        <div className="flex items-center gap-2 md:gap-4">
          
          {user && (
            <div className="hidden md:flex gap-2 mr-2">
              <Button 
                variant="ghost" 
                className={currentView === ViewState.DASHBOARD ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white" : ""}
                onClick={() => onNavigate(ViewState.DASHBOARD)}
              >
                {t('nav_rehearsals')}
              </Button>
              <Button 
                variant="ghost" 
                className={currentView === ViewState.SONG_LIBRARY ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white" : ""}
                onClick={() => onNavigate(ViewState.SONG_LIBRARY)}
              >
                {t('nav_library')}
              </Button>
            </div>
          )}

          <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800 mx-1 hidden md:block"></div>

          {/* Status Indicator */}
          {user && (
             <div className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full border border-green-200 dark:border-green-800">
                <Cloud size={12} />
                <span>{t('status_online')}</span>
             </div>
          )}

          {/* Language Selector */}
          <div className="relative">
            <button 
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 transition-colors"
                title="Change Language"
            >
                <Globe size={20} />
            </button>
            {showLangMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl z-50 overflow-hidden">
                <div className="max-h-64 overflow-y-auto">
                    {languages.map((lang) => (
                        <button
                        key={lang.code}
                        onClick={() => { setLanguage(lang.code); setShowLangMenu(false); }}
                        className={`w-full text-left px-4 py-3 text-sm flex items-center gap-3 hover:bg-zinc-100 dark:hover:bg-zinc-800 ${language === lang.code ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-600' : ''}`}
                        >
                        <span className="text-lg">{lang.flag}</span>
                        <span>{lang.label}</span>
                        </button>
                    ))}
                </div>
                </div>
            )}
          </div>

          {/* Theme Toggle */}
          <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 transition-colors">
             {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* User Profile */}
          {user && (
             <div className="flex items-center gap-3 ml-2 border-l border-zinc-200 dark:border-zinc-800 pl-4">
               <div className="flex items-center gap-2">
                 {user.picture ? (
                   <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full border border-zinc-200 dark:border-zinc-700" />
                 ) : (
                   <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-zinc-400">
                     <UserIcon size={16} />
                   </div>
                 )}
                 <span className="hidden lg:block text-sm font-medium text-zinc-700 dark:text-zinc-300 max-w-[100px] truncate">{user.name}</span>
               </div>
               <button onClick={onLogout} className="text-zinc-500 hover:text-red-500 transition-colors p-2" title={t('logout')}>
                 <LogOut size={18} />
               </button>
             </div>
          )}
        </div>
      </div>
    </nav>
  );
};