
// v2.19 - New Auth Flow with Custom Google Button
import React, { useState } from 'react';
import { User } from '../types';
import { loginWithGoogle } from '../services/authService';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  Music2, 
  Calendar, 
  Users, 
  Cloud, 
  PlayCircle, 
  CheckCircle2, 
  Loader2, 
  Zap, 
  ShieldCheck, 
  ArrowRight,
  ChevronDown
} from 'lucide-react';

export const LandingPage: React.FC<{ onLogin: (user: User) => void }> = ({ onLogin }) => {
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const { t } = useLanguage();

  const handleSignIn = async () => {
    setIsAuthenticating(true);
    setError(null);
    
    try {
      const user = await loginWithGoogle();
      if (user) {
        onLogin(user);
      } else {
        // Si el usuario simplemente cerró el popup, no mostramos error crítico
        setIsAuthenticating(false);
      }
    } catch (err) {
      setError("No pudimos conectar con Google. Por favor intenta de nuevo.");
      setIsAuthenticating(false);
    }
  };

  const features = [
    {
      icon: <Calendar className="text-brand-500" size={32} />,
      title: t('tour_feature_1_title'),
      desc: t('tour_feature_1_desc')
    },
    {
      icon: <Music2 className="text-brand-500" size={32} />,
      title: t('tour_feature_2_title'),
      desc: t('tour_feature_2_desc')
    },
    {
      icon: <Cloud className="text-brand-500" size={32} />,
      title: t('tour_feature_3_title'),
      desc: t('tour_feature_3_desc')
    }
  ];

  return (
    <div className="flex-1 w-full bg-zinc-50 dark:bg-zinc-950 transition-colors duration-500 overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-4 pt-20 pb-32">
        {/* Background Animation (Equalizer) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-20 dark:opacity-30">
          <div className="flex justify-center items-end gap-4 md:gap-12 h-full w-full max-w-7xl mx-auto px-10">
              <div className="w-16 md:w-32 h-[40%] bg-gradient-to-t from-red-600 to-transparent blur-[60px] rounded-t-full animate-pulse"></div>
              <div className="w-16 md:w-32 h-[70%] bg-gradient-to-t from-brand-600 to-transparent blur-[80px] rounded-t-full animate-pulse" style={{ animationDelay: '1s' }}></div>
              <div className="w-16 md:w-32 h-[50%] bg-gradient-to-t from-red-700 to-transparent blur-[70px] rounded-t-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
          </div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-50 dark:bg-brand-900/20 border border-brand-100 dark:border-brand-800 animate-in fade-in slide-in-from-top-4 duration-1000">
             <Zap size={14} className="text-brand-600" />
             <span className="text-xs font-bold uppercase tracking-widest text-brand-700 dark:text-brand-400">Versión 2.19 Estable</span>
          </div>

          <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.9] text-zinc-900 dark:text-white transition-all duration-700">
            {t('tagline').split('.')[0]}.<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-brand-400 dark:from-brand-500 dark:to-brand-300 italic">
              {t('tagline').split('.')[1] || "Master it."}
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto font-medium">
            La plataforma definitiva para bandas que quieren dejar de perder el tiempo en chats y empezar a sonar mejor.
          </p>

          <div className="flex flex-col items-center gap-6 pt-4">
            <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl backdrop-blur-xl transition-all hover:shadow-brand-500/10">
               {isAuthenticating ? (
                  <div className="flex items-center gap-4 px-10 py-2">
                    <Loader2 className="animate-spin text-brand-500" size={24} />
                    <span className="text-sm font-bold text-zinc-500">Iniciando sesión segura...</span>
                  </div>
               ) : (
                  <button 
                    onClick={handleSignIn}
                    className="flex items-center gap-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-8 py-4 rounded-2xl font-bold transition-all hover:scale-105 active:scale-95 shadow-xl hover:shadow-brand-500/20 group"
                  >
                    <div className="bg-white p-1 rounded-full group-hover:rotate-12 transition-transform">
                        <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                    </div>
                    {t('start_button')}
                  </button>
               )}
               {error && <p className="mt-4 text-red-500 text-xs font-bold text-center">{error}</p>}
            </div>
            
            <div className="flex items-center gap-6 text-zinc-400 dark:text-zinc-600">
               <div className="flex items-center gap-1.5"><ShieldCheck size={16} /> <span className="text-[10px] font-bold uppercase tracking-wider">Firebase Secured</span></div>
               <div className="flex items-center gap-1.5"><Users size={16} /> <span className="text-[10px] font-bold uppercase tracking-wider">Multi-User Sync</span></div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce text-zinc-300 dark:text-zinc-800">
          <ChevronDown size={32} />
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-white dark:bg-zinc-900/50 relative border-y border-zinc-200 dark:border-zinc-800">
        <div className="max-w-6xl mx-auto px-6">
           <div className="text-center mb-16 space-y-4">
              <h2 className="text-3xl md:text-5xl font-black text-zinc-900 dark:text-white tracking-tight">{t('tour_title')}</h2>
              <p className="text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto">{t('tour_subtitle')}</p>
           </div>

           <div className="grid md:grid-cols-3 gap-8">
              {features.map((f, i) => (
                <div key={i} className="bg-zinc-50 dark:bg-zinc-950 p-10 rounded-3xl border border-zinc-100 dark:border-zinc-800 hover:border-brand-500/50 transition-all hover:shadow-xl group">
                   <div className="mb-6 transform group-hover:scale-110 transition-transform">{f.icon}</div>
                   <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-3">{f.title}</h3>
                   <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">{f.desc}</p>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* Visual Mockup Section */}
      <section className="py-32 px-6">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
           <div className="space-y-8">
              <h2 className="text-4xl md:text-6xl font-black text-zinc-900 dark:text-white tracking-tighter leading-none">
                Toda tu música <br/>en el <span className="text-brand-600">bolsillo</span>.
              </h2>
              <div className="space-y-6">
                 {[
                   { t: "Gestión de Repertoio", d: "Sube letras y acordes con un click." },
                   { t: "IA Formatter", d: "Gemini limpia y ordena tus canciones automáticamente." },
                   { t: "Modo Ensayo", d: "Visualización optimizada para tablets y móviles." }
                 ].map((item, i) => (
                   <div key={i} className="flex gap-4">
                      <div className="shrink-0 w-6 h-6 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-600"><CheckCircle2 size={14}/></div>
                      <div>
                        <h4 className="font-bold text-zinc-900 dark:text-white">{item.t}</h4>
                        <p className="text-sm text-zinc-500">{item.d}</p>
                      </div>
                   </div>
                 ))}
              </div>
           </div>

           <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-tr from-brand-500/20 to-transparent blur-3xl rounded-full"></div>
              <div className="relative bg-zinc-200 dark:bg-zinc-800 rounded-3xl p-2 shadow-2xl border border-zinc-300 dark:border-zinc-700 transform rotate-2">
                 <img 
                   src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1200&auto=format&fit=crop" 
                   className="rounded-2xl grayscale hover:grayscale-0 transition-all duration-1000"
                   alt="App Mockup"
                 />
                 <div className="absolute bottom-6 right-6 bg-white dark:bg-zinc-900 p-4 rounded-2xl shadow-xl border border-zinc-100 dark:border-zinc-800 animate-bounce">
                    <div className="flex items-center gap-3">
                       <PlayCircle className="text-brand-600" />
                       <div className="text-left">
                          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Ensayando ahora</p>
                          <p className="text-sm font-bold text-zinc-900 dark:text-white">De Música Ligera</p>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-brand-600 dark:bg-brand-700 text-white text-center rounded-[4rem] mx-4 mb-20 shadow-2xl overflow-hidden relative">
         <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[100px] rounded-full"></div>
         <div className="relative z-10 max-w-3xl mx-auto space-y-8">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter">¿Listo para sonar <br/>como nunca?</h2>
            <p className="text-brand-100 text-lg">Únete a cientos de bandas que ya coordinan sus ensayos con Verso.</p>
            <div className="flex flex-col items-center gap-4">
              <button 
                onClick={() => document.documentElement.scrollTop = 0}
                className="bg-white text-brand-600 px-10 py-4 rounded-2xl font-black text-xl hover:bg-zinc-100 transition-all flex items-center gap-3 shadow-xl"
              >
                Empezar gratis <ArrowRight />
              </button>
              <p className="text-brand-200 text-xs font-bold uppercase tracking-widest">No requiere tarjeta de crédito</p>
            </div>
         </div>
      </section>
    </div>
  );
};
