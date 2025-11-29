import React, { useEffect, useState, useRef } from 'react';
import { User } from '../types';
import { handleGoogleCredential, loginAsDemoUser } from '../services/authService';
import { useLanguage } from '../contexts/LanguageContext';
import { Mic2, Music2, Calendar, Users, Cloud } from 'lucide-react';
import { Button } from './Button';

declare global {
  interface Window {
    google: any;
  }
}

interface LandingPageProps {
  onLogin: (user: User) => void;
}

const getGoogleClientId = () => {
  let cid = null;
  try {
    // @ts-ignore
    if (import.meta && import.meta.env && import.meta.env.VITE_GOOGLE_CLIENT_ID) {
      // @ts-ignore
      cid = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    }
  } catch (e) {}

  if (!cid) {
    try {
      if (typeof process !== 'undefined' && process.env && process.env.REACT_APP_GOOGLE_CLIENT_ID) {
        cid = process.env.REACT_APP_GOOGLE_CLIENT_ID;
      }
    } catch (e) {}
  }
  return cid ? String(cid).trim() : null;
};

export const LandingPage: React.FC<LandingPageProps> = ({ onLogin }) => {
  const [error, setError] = useState<string | null>(null);
  const { t } = useLanguage();
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
  const [configError, setConfigError] = useState<string | null>(null);
  const retryCount = useRef(0);

  useEffect(() => {
    const clientId = getGoogleClientId();

    if (!clientId) {
      console.warn("Google Client ID missing.");
      setConfigError("Falta configurar VITE_GOOGLE_CLIENT_ID en Vercel.");
    } else {
      console.log(`[DEBUG] Google Client ID loaded: ${clientId.substring(0, 10)}...`);
    }

    const initializeGoogleAuth = () => {
      if (window.google && clientId) {
        try {
          window.google.accounts.id.initialize({
            client_id: clientId,
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
              setIsGoogleLoaded(true);
          }
        } catch (e) {
          console.error("Google Auth Error:", e);
        }
      } else {
        if (retryCount.current < 20) {
          retryCount.current++;
          setTimeout(initializeGoogleAuth, 300);
        }
      }
    };

    initializeGoogleAuth();
    
  }, [onLogin, t]);

  const handleDemoLogin = () => {
    const user = loginAsDemoUser();
    onLogin(user);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 animate-in fade-in duration-700 mt-8 md:mt-0">
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
                <div className="flex justify-center h-12 mb-4 min-h-[48px]">
                    <div id="googleSignInDiv"></div>
                    {!isGoogleLoaded && !configError && (
                      <div className="flex items-center text-sm text-zinc-400 italic"></div>
                    )}
                    {configError && (
                      <p className="text-xs text-red-500 bg-red-50 dark:bg-red-900/10 p-2 rounded border border-red-200">{configError}</p>
                    )}
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
    </div>
  );
};