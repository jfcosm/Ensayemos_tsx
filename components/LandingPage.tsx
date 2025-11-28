import React, { useEffect, useState } from 'react';
import { User, Language } from '../types';
import { handleGoogleCredential, loginAsDemoUser } from '../services/authService';
import { useLanguage } from '../contexts/LanguageContext';
import { Mic2, Music2, Calendar, Users, Cloud, Globe } from 'lucide-react';
import { Button } from './Button';

declare global {
  interface Window {
    google: any;
  }
}

interface LandingPageProps {
  onLogin: (user: User) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLogin }) => {
  const [error, setError] = useState<string | null>(null);
  const { t, language, setLanguage } = useLanguage();
  const [showLangMenu, setShowLangMenu] = useState(false);

  useEffect(() => {
    const CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID_HERE";

    if (window.google) {
      try {
        window.google.accounts.id.initialize({
          client_id: CLIENT_ID,
          callback: (response: any) => {
            if (response.credential) {
              const user = handleGoogleCredential(response.credential);
              if (user) {
                onLogin(user);
              } else {
                setError(t('login_error'));
              }
            }
          },
        });

        const btnDiv = document.getElementById('googleSignInDiv');
        if (btnDiv) {
            window.google.accounts.id.renderButton(
                btnDiv,
                { theme: 'outline', size: 'large', width: '280' }
            );
        }
      } catch (e) {
        console.error("Google Auth Error:", e);
      }
    }
  }, [onLogin, t]);

  const handleDemoLogin = () => {
    const user = loginAsDemoUser();
    onLogin(user);
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
  ];

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors duration-500">
      
      {/* Navbar / Language Selector */}
      <nav className="p-4 flex justify-end container mx-auto">
        <div className="relative">
          <button 
            onClick={() => setShowLangMenu(!showLangMenu)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-brand-500 transition-colors"
          >
            <Globe size={18} className="text-zinc-500" />
            <span className="text-sm font-medium uppercase">{language}</span>
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
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 animate-in fade-in duration-700">
        <div className="max-w-4xl w-full grid md:grid-cols-2 gap-12 items-center">
          
          {/* Left: Content */}
          <div className="space-y-8 text-center md:text-left order-2 md:order-1">
            <div className="space-y-4">
              <div className="inline-flex items-center justify-center md:justify-start gap-2 text-brand-600 dark:text-brand-500 font-bold text-xl md:text-2xl">
                 <Mic2 size={28} />
                 <span>{t('app_name')}</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
                {t('tagline').split('.')[0]}.<br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-brand-400 dark:from-brand-500 dark:to-brand-300">
                  {t('tagline').split('.')[1] || "Master it."}
                </span>
              </h1>
            </div>

            <div className="space-y-4 max-w-sm mx-auto md:mx-0">
               {/* Login Box */}
               <div className="bg-white dark:bg-zinc-900/50 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl backdrop-blur-sm">
                  <div className="flex justify-center h-12 mb-4">
                     <div id="googleSignInDiv"></div>
                  </div>
                  
                  <div className="relative mb-4">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-zinc-200 dark:border-zinc-800" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white dark:bg-zinc-900 px-2 text-zinc-500">Demo</span>
                    </div>
                  </div>

                  <Button onClick={handleDemoLogin} variant="secondary" className="w-full justify-center gap-2">
                    <Music2 size={18} />
                    {t('demo_button')}
                  </Button>
                  
                  {error && (
                    <p className="mt-3 text-red-500 text-xs text-center">{error}</p>
                  )}
               </div>
            </div>
          </div>

          {/* Right: Features Visualization */}
          <div className="order-1 md:order-2 grid gap-6">
             <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-lg flex items-start gap-4 transform md:translate-x-4">
                <div className="bg-brand-100 dark:bg-brand-900/30 p-3 rounded-xl text-brand-600 dark:text-brand-400">
                    <Users size={24} />
                </div>
                <div>
                    <h3 className="font-bold text-lg mb-1">{t('feature_vote_title')}</h3>
                    <p className="text-zinc-500 text-sm">{t('feature_vote_desc')}</p>
                </div>
             </div>

             <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-lg flex items-start gap-4 transform md:-translate-x-4">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-xl text-blue-600 dark:text-blue-400">
                    <Cloud size={24} />
                </div>
                <div>
                    <h3 className="font-bold text-lg mb-1">{t('feature_sync_title')}</h3>
                    <p className="text-zinc-500 text-sm">{t('feature_sync_desc')}</p>
                </div>
             </div>

             <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-lg flex items-start gap-4 transform md:translate-x-4">
                <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-xl text-purple-600 dark:text-purple-400">
                    <Calendar size={24} />
                </div>
                <div>
                    <h3 className="font-bold text-lg mb-1">{t('feature_setlist_title')}</h3>
                    <p className="text-zinc-500 text-sm">{t('feature_setlist_desc')}</p>
                </div>
             </div>
          </div>

        </div>
      </main>

      <footer className="p-6 text-center text-zinc-400 text-sm">
        <p>© {new Date().getFullYear()} {t('app_name')} {t('footer_copyright')}</p>
      </footer>
    </div>
  );
};