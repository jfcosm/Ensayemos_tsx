import React, { useEffect, useState, useRef } from 'react';
import { User } from '../types';
import { handleGoogleCredential } from '../services/authService';
import { useLanguage } from '../contexts/LanguageContext';
import { Mic2, Music2, Calendar, Users, Cloud, PlayCircle, CheckCircle2 } from 'lucide-react';
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

  return (
    <div className="flex-1 flex flex-col items-center p-4 md:p-8 animate-in fade-in duration-700 overflow-x-hidden">
      
      {/* Hero Section */}
      <div className="max-w-6xl w-full grid md:grid-cols-2 gap-12 lg:gap-20 items-center min-h-[600px]">
        
        {/* Left: Content & Login */}
        <div className="space-y-8 text-center md:text-left order-2 md:order-1">
          <div className="space-y-4">
            <div className="inline-flex items-center justify-center md:justify-start gap-2 text-brand-600 dark:text-brand-500 font-bold text-xl md:text-2xl">
                <Mic2 size={28} />
                <span>{t('app_name')}</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight text-zinc-900 dark:text-white">
              {t('tagline').split('.')[0]}.<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-brand-400 dark:from-brand-500 dark:to-brand-300">
                {t('tagline').split('.')[1] || "Master it."}
              </span>
            </h1>
            <p className="text-lg text-zinc-600 dark:text-zinc-300 max-w-lg mx-auto md:mx-0">
               {t('tour_subtitle')}
            </p>
          </div>

          <div className="space-y-4 max-w-sm mx-auto md:mx-0">
              {/* Login Box */}
              <div className="bg-white dark:bg-zinc-900/50 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl backdrop-blur-sm relative z-10">
                <div className="flex justify-center h-12 mb-2 min-h-[48px]">
                    <div id="googleSignInDiv"></div>
                    {!isGoogleLoaded && !configError && (
                      <div className="flex items-center text-sm text-zinc-400 italic"></div>
                    )}
                    {configError && (
                      <p className="text-xs text-red-500 bg-red-50 dark:bg-red-900/10 p-2 rounded border border-red-200">{configError}</p>
                    )}
                </div>
                
                {error && (
                  <p className="mt-3 text-red-500 text-xs text-center">{error}</p>
                )}
                <p className="text-xs text-center text-zinc-400 mt-4">
                  {t('footer_copyright')}
                </p>
              </div>
          </div>
        </div>

        {/* Right: 3D App Mockup */}
        <div className="order-1 md:order-2 relative group perspective-1000">
            <div className="absolute inset-0 bg-brand-500/20 blur-3xl rounded-full transform scale-75 group-hover:scale-90 transition-transform duration-700"></div>
            <div className="relative bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden transform md:rotate-y-[-10deg] md:rotate-x-[5deg] transition-transform duration-500 hover:rotate-0 max-w-md mx-auto">
                {/* Fake Window Header */}
                <div className="bg-zinc-100 dark:bg-zinc-900/50 p-3 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                  <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
                  </div>
                  <div className="text-[10px] font-mono text-zinc-400 bg-white dark:bg-zinc-800 px-2 py-0.5 rounded-md border border-zinc-200 dark:border-zinc-700">
                    verso.app
                  </div>
                </div>

                {/* Fake App Content */}
                <div className="p-6 space-y-5">
                  <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-bold text-zinc-900 dark:text-white">{t('tour_mockup_header')}</h3>
                        <div className="text-sm text-zinc-500 dark:text-zinc-400 flex items-center gap-1 mt-1">
                            <Users size={12} /> The Rolling Stones
                        </div>
                      </div>
                      <div className="bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-green-200 dark:border-green-800">
                        ONLINE
                      </div>
                  </div>

                  {/* Fake Voting Card */}
                  <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-100 dark:border-zinc-800 p-3 flex justify-between items-center shadow-sm">
                      <div className="flex gap-3 items-center">
                        <div className="bg-white dark:bg-zinc-800 p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 text-brand-500">
                            <Calendar size={18} />
                        </div>
                        <div>
                            <div className="text-sm font-semibold text-zinc-900 dark:text-white">{t('tour_mockup_date')}</div>
                            <div className="text-xs text-zinc-500">{t('tour_mockup_location')}</div>
                        </div>
                      </div>
                      <div className="flex -space-x-2">
                        <div className="w-6 h-6 rounded-full bg-zinc-300 dark:bg-zinc-700 border-2 border-white dark:border-zinc-900"></div>
                        <div className="w-6 h-6 rounded-full bg-zinc-400 dark:bg-zinc-600 border-2 border-white dark:border-zinc-900"></div>
                        <div className="w-6 h-6 rounded-full bg-brand-500 border-2 border-white dark:border-zinc-900 flex items-center justify-center text-[8px] text-white font-bold">3</div>
                      </div>
                  </div>

                  {/* Fake Setlist */}
                  <div>
                      <div className="text-xs font-bold text-zinc-400 mb-2 uppercase tracking-wider">{t('tour_mockup_setlist')}</div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-2 rounded-lg bg-brand-50 dark:bg-brand-900/10 border border-brand-100 dark:border-brand-500/20">
                            <div className="flex items-center gap-3">
                              <span className="font-mono text-xs text-brand-400">01</span>
                              <span className="text-sm font-medium text-brand-900 dark:text-brand-100">Paint It Black</span>
                            </div>
                            <div className="flex items-center gap-1 bg-brand-200 dark:bg-brand-800 text-brand-800 dark:text-brand-200 text-[10px] px-1.5 py-0.5 rounded">
                              <PlayCircle size={10} /> {t('tour_mockup_playing')}
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-900 border border-transparent">
                            <div className="flex items-center gap-3">
                              <span className="font-mono text-xs text-zinc-400">02</span>
                              <span className="text-sm text-zinc-600 dark:text-zinc-300">Gimme Shelter</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-900 border border-transparent">
                            <div className="flex items-center gap-3">
                              <span className="font-mono text-xs text-zinc-400">03</span>
                              <span className="text-sm text-zinc-600 dark:text-zinc-300">Sympathy for the Devil</span>
                            </div>
                            <CheckCircle2 size={14} className="text-green-500" />
                        </div>
                      </div>
                  </div>
                </div>
            </div>
        </div>

      </div>

      {/* Features Section - Below fold */}
      <div className="w-full max-w-6xl mt-20 mb-10">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-brand-100 dark:bg-brand-900/30 p-3 rounded-xl text-brand-600 dark:text-brand-400 w-fit mb-4">
                  <Users size={24} />
              </div>
              <h3 className="font-bold text-lg text-zinc-900 dark:text-white mb-2">{t('feature_vote_title')}</h3>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed">{t('feature_vote_desc')}</p>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-xl text-blue-600 dark:text-blue-400 w-fit mb-4">
                  <Cloud size={24} />
              </div>
              <h3 className="font-bold text-lg text-zinc-900 dark:text-white mb-2">{t('feature_sync_title')}</h3>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed">{t('feature_sync_desc')}</p>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-xl text-purple-600 dark:text-purple-400 w-fit mb-4">
                  <Calendar size={24} />
              </div>
              <h3 className="font-bold text-lg text-zinc-900 dark:text-white mb-2">{t('feature_setlist_title')}</h3>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed">{t('feature_setlist_desc')}</p>
            </div>
          </div>
      </div>

    </div>
  );
};