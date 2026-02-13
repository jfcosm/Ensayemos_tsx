// v2.3 - Removed Guest Access (Google Auth only)
import React, { useEffect, useState, useRef } from 'react';
import { User } from '../types';
import { handleGoogleCredential } from '../services/authService';
import { useLanguage } from '../contexts/LanguageContext';
import { Music2, Calendar, Users, Cloud, PlayCircle, CheckCircle2 } from 'lucide-react';

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
  const retryCount = useRef(0);

  useEffect(() => {
    const clientId = getGoogleClientId();

    if (!clientId) {
      console.warn("Google Client ID missing.");
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
    <div className="flex-1 flex flex-col items-center p-4 md:p-8 animate-in fade-in duration-700 overflow-x-hidden relative">
      
      {/* --- BACKGROUND ANIMATION (LED EQ EFFECT) --- */}
      <style>{`
        @keyframes eq-bounce {
          0%, 100% { transform: scaleY(0.3); opacity: 0.1; }
          50% { transform: scaleY(1); opacity: 0.4; }
        }
        .led-column {
          animation: eq-bounce infinite ease-in-out;
          transform-origin: bottom;
        }
      `}</style>
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 select-none">
        <div className="flex justify-center items-end gap-4 md:gap-12 h-full w-full opacity-30 dark:opacity-40 max-w-7xl mx-auto px-10">
            <div className="led-column w-16 md:w-32 h-[60%] bg-gradient-to-t from-red-600 via-brand-500 to-transparent blur-[40px] rounded-t-full" style={{ animationDuration: '3s', animationDelay: '0s' }}></div>
            <div className="led-column w-16 md:w-32 h-[80%] bg-gradient-to-t from-red-700 via-brand-600 to-transparent blur-[50px] rounded-t-full" style={{ animationDuration: '4.2s', animationDelay: '1s' }}></div>
            <div className="led-column w-20 md:w-40 h-[90%] bg-gradient-to-t from-brand-800 via-red-500 to-transparent blur-[60px] rounded-t-full" style={{ animationDuration: '5s', animationDelay: '0.5s' }}></div>
            <div className="led-column w-16 md:w-32 h-[75%] bg-gradient-to-t from-red-700 via-brand-600 to-transparent blur-[50px] rounded-t-full" style={{ animationDuration: '3.5s', animationDelay: '2s' }}></div>
            <div className="led-column w-16 md:w-32 h-[50%] bg-gradient-to-t from-red-600 via-brand-500 to-transparent blur-[40px] rounded-t-full" style={{ animationDuration: '4.5s', animationDelay: '1.5s' }}></div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-zinc-50 dark:from-zinc-950 to-transparent"></div>
      </div>

      {/* Hero Section */}
      <div className="relative z-10 max-w-6xl w-full grid md:grid-cols-2 gap-12 lg:gap-20 items-center min-h-[600px]">
        
        {/* Left: Content & Login */}
        <div className="space-y-8 text-center md:text-left order-2 md:order-1">
          <div className="space-y-4">
            <div className="inline-flex items-center justify-center md:justify-start gap-2 text-brand-600 dark:text-brand-500 font-bold text-xl md:text-2xl">
                <Music2 size={28} strokeWidth={2.5} />
                <span className="font-sans font-extrabold tracking-tight lowercase text-zinc-900 dark:text-white">verso.</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight text-zinc-900 dark:text-white font-sans">
              {t('tagline').split('.')[0]}.<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-brand-400 dark:from-brand-500 dark:to-brand-300">
                {t('tagline').split('.')[1] || "Master it."}
              </span>
            </h1>
            <p className="text-lg text-zinc-600 dark:text-zinc-300 max-w-lg mx-auto md:mx-0 font-sans">
               {t('tour_subtitle')}
            </p>
          </div>

          <div className="space-y-4 max-w-sm mx-auto md:mx-0">
              {/* Login Box */}
              <div className="bg-white/80 dark:bg-zinc-900/60 p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl backdrop-blur-md relative z-10">
                <div className="flex flex-col items-center gap-6">
                    <div id="googleSignInDiv" className="min-h-[40px]"></div>
                </div>
                
                {error && (
                  <p className="mt-4 text-red-500 text-xs text-center">{error}</p>
                )}
                <p className="text-[10px] text-center text-zinc-400 mt-8 font-sans uppercase tracking-widest font-bold">
                  {t('footer_copyright')}
                </p>
              </div>
          </div>
        </div>

        {/* Right: 3D App Mockup */}
        <div className="order-1 md:order-2 relative group perspective-1000">
            <div className="absolute inset-0 bg-brand-500/10 blur-3xl rounded-full transform scale-75 group-hover:scale-90 transition-transform duration-700"></div>
            
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
                        <h3 className="text-xl font-bold text-zinc-900 dark:text-white font-sans">{t('tour_mockup_header')}</h3>
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
                            <div className="text-sm font-semibold text-zinc-900 dark:text-white font-sans">{t('tour_mockup_date')}</div>
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
                      <div className="text-xs font-bold text-zinc-400 mb-2 uppercase tracking-wider font-sans">{t('tour_mockup_setlist')}</div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-2 rounded-lg bg-brand-50 dark:bg-brand-900/10 border border-brand-100 dark:border-brand-500/20">
                            <div className="flex items-center gap-3">
                              <span className="font-mono text-xs text-brand-400">01</span>
                              <span className="text-sm font-medium text-brand-900 dark:text-brand-100 font-sans">Paint It Black</span>
                            </div>
                            <div className="flex items-center gap-1 bg-brand-200 dark:bg-brand-800 text-brand-800 dark:text-brand-200 text-[10px] px-1.5 py-0.5 rounded">
                              <PlayCircle size={10} /> {t('tour_mockup_playing')}
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-900 border border-transparent">
                            <div className="flex items-center gap-3">
                              <span className="font-mono text-xs text-zinc-400">02</span>
                              <span className="text-sm text-zinc-600 dark:text-zinc-300 font-sans">Gimme Shelter</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-900 border border-transparent">
                            <div className="flex items-center gap-3">
                              <span className="font-mono text-xs text-zinc-400">03</span>
                              <span className="text-sm text-zinc-600 dark:text-zinc-300 font-sans">Sympathy for the Devil</span>
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
      <div className="relative z-10 w-full max-w-6xl mt-20 mb-10">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
              <div className="aspect-video bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                 <img src="p1.jpg" alt="Voting" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100" onError={(e) => { (e.target as any).src = 'https://images.unsplash.com/photo-1514525253361-b8748530499e?w=800&auto=format&fit=crop&q=60'; }} />
              </div>
              <div className="p-6">
                <div className="bg-brand-100 dark:bg-brand-900/30 p-3 rounded-xl text-brand-600 dark:text-brand-400 w-fit mb-4">
                    <Users size={24} />
                </div>
                <h3 className="font-bold text-lg text-zinc-900 dark:text-white mb-2 font-sans">{t('feature_vote_title')}</h3>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed font-sans">{t('feature_vote_desc')}</p>
              </div>
            </div>

            <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
              <div className="aspect-video bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                 <img src="p2.jpg" alt="Cloud Sync" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100" onError={(e) => { (e.target as any).src = 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=60'; }} />
              </div>
              <div className="p-6">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-xl text-blue-600 dark:text-blue-400 w-fit mb-4">
                    <Cloud size={24} />
                </div>
                <h3 className="font-bold text-lg text-zinc-900 dark:text-white mb-2 font-sans">{t('feature_sync_title')}</h3>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed font-sans">{t('feature_sync_desc')}</p>
              </div>
            </div>

            <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
              <div className="aspect-video bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                 <img src="p3.jpg" alt="Smart Setlist" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100" onError={(e) => { (e.target as any).src = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=60'; }} />
              </div>
              <div className="p-6">
                <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-xl text-purple-600 dark:text-purple-400 w-fit mb-4">
                    <Calendar size={24} />
                </div>
                <h3 className="font-bold text-lg text-zinc-900 dark:text-white mb-2 font-sans">{t('feature_setlist_title')}</h3>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed font-sans">{t('feature_setlist_desc')}</p>
              </div>
            </div>
          </div>
      </div>

    </div>
  );
};