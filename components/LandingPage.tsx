
// v2.10 - Async Login Handling to prevent Firestore Race Conditions
import React, { useEffect, useState, useRef } from 'react';
import { User } from '../types';
import { handleGoogleCredential } from '../services/authService';
import { useLanguage } from '../contexts/LanguageContext';
import { Music2, Calendar, Users, Cloud, PlayCircle, CheckCircle2, Loader2 } from 'lucide-react';

declare global {
  interface Window {
    google: any;
  }
}

const getGoogleClientId = () => {
  return "290114942318-u4s685k90oevmpe68b3p0g1b6m2u8b8r.apps.googleusercontent.com";
};

export const LandingPage: React.FC<{ onLogin: (user: User) => void }> = ({ onLogin }) => {
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const { t } = useLanguage();
  const retryCount = useRef(0);

  useEffect(() => {
    const clientId = getGoogleClientId();

    const initializeGoogleAuth = () => {
      if (window.google && clientId) {
        try {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: async (response: any) => {
              if (response.credential) {
                setIsAuthenticating(true);
                setError(null);
                const user = await handleGoogleCredential(response.credential);
                if (user) {
                  onLogin(user);
                } else {
                  setError("No se pudo sincronizar con el servidor de seguridad. Reintenta.");
                  setIsAuthenticating(false);
                }
              }
            },
            auto_select: false,
          });

          const btnDiv = document.getElementById('googleSignInDiv');
          if (btnDiv) {
              window.google.accounts.id.renderButton(
                  btnDiv,
                  { theme: 'outline', size: 'large', width: '280', text: 'signin_with' }
              );
          }
        } catch (e) {
          console.error("GSI Error:", e);
        }
      } else {
        if (retryCount.current < 30) {
          retryCount.current++;
          setTimeout(initializeGoogleAuth, 500);
        }
      }
    };

    initializeGoogleAuth();
  }, [onLogin, t]);

  const featureImages = {
    voting: 'https://images.unsplash.com/photo-1514525253361-b8748530499e?q=80&w=800&auto=format&fit=crop',
    sync: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=800&auto=format&fit=crop',
    setlist: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=800&auto=format&fit=crop'
  };

  return (
    <div className="flex-1 flex flex-col items-center p-4 md:p-8 animate-in fade-in duration-700 overflow-x-hidden relative">
      <style>{`
        @keyframes eq-bounce {
          0%, 100% { transform: scaleY(0.3); opacity: 0.1; }
          50% { transform: scaleY(1); opacity: 0.4; }
        }
        .led-column { animation: eq-bounce infinite ease-in-out; transform-origin: bottom; }
      `}</style>
      
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 select-none">
        <div className="flex justify-center items-end gap-4 md:gap-12 h-full w-full opacity-30 dark:opacity-40 max-w-7xl mx-auto px-10">
            <div className="led-column w-16 md:w-32 h-[60%] bg-gradient-to-t from-red-600 via-brand-500 to-transparent blur-[40px] rounded-t-full" style={{ animationDuration: '3s' }}></div>
            <div className="led-column w-16 md:w-32 h-[80%] bg-gradient-to-t from-red-700 via-brand-600 to-transparent blur-[50px] rounded-t-full" style={{ animationDuration: '4.2s' }}></div>
            <div className="led-column w-20 md:w-40 h-[90%] bg-gradient-to-t from-brand-800 via-red-500 to-transparent blur-[60px] rounded-t-full" style={{ animationDuration: '5s' }}></div>
        </div>
      </div>

      <div className="relative z-10 max-w-6xl w-full grid md:grid-cols-2 gap-12 lg:gap-20 items-center min-h-[600px]">
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
          </div>

          <div className="space-y-4 max-w-sm mx-auto md:mx-0">
              <div className="bg-white/80 dark:bg-zinc-900/60 p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl backdrop-blur-md relative z-10">
                <div className="flex flex-col items-center gap-6">
                    {isAuthenticating ? (
                        <div className="flex flex-col items-center gap-3 py-2">
                            <Loader2 className="animate-spin text-brand-500" size={32} />
                            <p className="text-sm font-bold text-zinc-600 dark:text-zinc-300 animate-pulse">Verificando identidad segura...</p>
                        </div>
                    ) : (
                        <div id="googleSignInDiv" className="min-h-[44px]"></div>
                    )}
                </div>
                {error && <p className="mt-4 text-red-500 text-xs text-center font-bold bg-red-50 dark:bg-red-900/20 p-2 rounded-lg">{error}</p>}
              </div>
          </div>
        </div>

        <div className="order-1 md:order-2 relative">
            <div className="relative bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden max-w-md mx-auto">
                <div className="bg-zinc-100 dark:bg-zinc-900/50 p-3 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                  <div className="flex gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-400"></div><div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div><div className="w-2.5 h-2.5 rounded-full bg-green-400"></div></div>
                </div>
                <div className="p-6 space-y-5">
                  <div className="h-4 w-32 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse"></div>
                  <div className="h-10 w-full bg-zinc-100 dark:bg-zinc-900 rounded animate-pulse"></div>
                  <div className="h-24 w-full bg-zinc-100 dark:bg-zinc-900 rounded animate-pulse"></div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
