import React, { useState } from 'react';
import { User, Language, ViewState } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { Mic2, LogOut, User as UserIcon, Sun, Moon, Globe, Cloud, Wand2, Music2, Menu, X } from 'lucide-react';
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleMobileNav = (v: ViewState) => {
    onNavigate(v);
    setIsMobileMenuOpen(false);
  };

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
    { code: 'gu', label: 'ગુજરાતી', flag: '🇮🇳' },
    { code: 'ta', label: 'தமிழ்', flag: '🇮🇳' },
    { code: 'uk', label: 'Українська', flag: '🇺🇦' },
    { code: 'sv', label: 'Svenska', flag: '🇸🇪' },
    { code: 'fi', label: 'Suomi', flag: '🇫🇮' },
    { code: 'nl', label: 'Nederlands', flag: '🇳🇱' },
    { code: 'is', label: 'Íslenska', flag: '🇮🇸' },
    { code: 'arn', label: 'Mapudungun', flag: '🇨🇱' },
    { code: 'pl', label: 'Polski', flag: '🇵🇱' },
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
            <Music2 size={20} strokeWidth={2.5} />
          </div>
          <span className="text-zinc-900 dark:text-white font-sans font-extrabold tracking-tight lowercase text-2xl">verso.</span>
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
              <Button
                variant="ghost"
                className={`gap-2 ${currentView === ViewState.COMPOSER ? "bg-zinc-100 dark:bg-zinc-800 text-brand-600 dark:text-brand-400" : ""}`}
                onClick={() => onNavigate(ViewState.COMPOSER)}
              >
                <Wand2 size={16} />
                {t('nav_composer')}
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

          {/* Controls - Desktop Only */}
          <div className="hidden md:flex items-center gap-2">
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

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 shadow-xl overflow-y-auto max-h-[calc(100vh-4rem)]">
          <div className="p-4 flex flex-col gap-4">
            {user && (
              <>
                <div className="flex items-center gap-3 pb-4 border-b border-zinc-100 dark:border-zinc-900">
                  {user.picture ? (
                    <img src={user.picture} alt={user.name} className="w-10 h-10 rounded-full border border-zinc-200 dark:border-zinc-700" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-zinc-400">
                      <UserIcon size={20} />
                    </div>
                  )}
                  <span className="font-semibold text-zinc-900 dark:text-white">{user.name}</span>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handleMobileNav(ViewState.DASHBOARD)}
                    className={`text-left px-4 py-3 rounded-xl font-medium ${currentView === ViewState.DASHBOARD ? 'bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-white' : 'text-zinc-600 dark:text-zinc-400'}`}
                  >
                    {t('nav_rehearsals')}
                  </button>
                  <button
                    onClick={() => handleMobileNav(ViewState.SONG_LIBRARY)}
                    className={`text-left px-4 py-3 rounded-xl font-medium ${currentView === ViewState.SONG_LIBRARY ? 'bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-white' : 'text-zinc-600 dark:text-zinc-400'}`}
                  >
                    {t('nav_library')}
                  </button>
                  <button
                    onClick={() => handleMobileNav(ViewState.COMPOSER)}
                    className={`text-left flex gap-3 px-4 py-3 rounded-xl font-medium ${currentView === ViewState.COMPOSER ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-600' : 'text-zinc-600 dark:text-zinc-400'}`}
                  >
                    <Wand2 size={20} />
                    {t('nav_composer')}
                  </button>
                </div>
              </>
            )}

            <div className="h-px bg-zinc-100 dark:bg-zinc-900 my-2"></div>

            {/* Language Selection Grid */}
            <div className="grid grid-cols-2 gap-2">
              {languages.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => { setLanguage(lang.code); setIsMobileMenuOpen(false); }}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${language === lang.code ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900'}`}
                >
                  <span className="text-lg">{lang.flag}</span>
                  <span className="truncate">{lang.label}</span>
                </button>
              ))}
            </div>

            <div className="h-px bg-zinc-100 dark:bg-zinc-900 my-2"></div>

            <div className="flex flex-col gap-2 pb-4">
              <button
                onClick={() => { toggleTheme(); setIsMobileMenuOpen(false); }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-600 dark:text-zinc-400"
              >
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
                {isDark ? 'Modo Claro' : 'Modo Oscuro'}
              </button>
              {user && (
                <button
                  onClick={() => { onLogout(); setIsMobileMenuOpen(false); }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 dark:text-red-400"
                >
                  <LogOut size={20} />
                  {t('logout')}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};