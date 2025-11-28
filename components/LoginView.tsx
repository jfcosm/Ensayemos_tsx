import React, { useEffect, useState } from 'react';
import { User } from '../types';
import { handleGoogleCredential, loginAsDemoUser } from '../services/authService';
import { Mic2, Music2 } from 'lucide-react';

declare global {
  interface Window {
    google: any;
  }
}

interface LoginViewProps {
  onLogin: (user: User) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // This Client ID is a placeholder. 
    // In a real production app, you would replace this with your actual Google Cloud Client ID.
    // Since we are in a demo environment, this might fail to load if not whitelisted, 
    // so we provide a "Demo Login" button as fallback.
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
                setError("Error al procesar las credenciales.");
              }
            }
          },
        });

        // We use the standard button, theme adjustments are handled by Google's lib but we can try to match
        window.google.accounts.id.renderButton(
          document.getElementById('googleSignInDiv'),
          { theme: 'outline', size: 'large', width: '280' }
        );
      } catch (e) {
        console.error("Google Auth Error:", e);
      }
    }
  }, [onLogin]);

  const handleDemoLogin = () => {
    const user = loginAsDemoUser();
    onLogin(user);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] dark:from-zinc-900 dark:via-zinc-950 dark:to-zinc-950 p-4 transition-colors duration-300">
      <div className="w-full max-w-md space-y-8 bg-white dark:bg-zinc-900/50 p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl backdrop-blur-sm">
        
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-6">
            <div className="bg-brand-600 p-4 rounded-2xl shadow-lg shadow-brand-500/30 rotate-3">
              <Mic2 size={40} className="text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Bienvenido a <span className="text-brand-600 dark:text-brand-500">Ensayemos!</span>
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400">Coordinación de bandas y setlists simplificada.</p>
        </div>

        <div className="space-y-4 pt-4">
          
          {/* Google Sign In Container */}
          <div className="flex justify-center h-12">
            <div id="googleSignInDiv"></div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-zinc-200 dark:border-zinc-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-zinc-900 px-2 text-zinc-500">O ingresa como invitado</span>
            </div>
          </div>

          <button
            onClick={handleDemoLogin}
            className="w-full flex items-center justify-center gap-2 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white font-medium py-3 px-4 rounded-lg transition-all border border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 shadow-sm"
          >
            <Music2 size={18} />
            Continuar Modo Demo
          </button>

          {error && (
            <p className="text-red-500 text-sm text-center bg-red-50 dark:bg-red-900/20 p-2 rounded-lg border border-red-100 dark:border-red-900/50">
              {error}
            </p>
          )}

          <p className="text-xs text-center text-zinc-500 dark:text-zinc-600 pt-4">
            Al ingresar, aceptas coordinar ensayos épicos y tocar a tiempo.
          </p>
        </div>
      </div>
    </div>
  );
};