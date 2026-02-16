
// v2.19 - Robust Identity Syncing with Firebase Popup
import { User } from '../types';
import { auth } from './firebaseConfig';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';

const USER_KEY = 'ensayamos_user';

/**
 * Inicia el flujo de autenticación mediante el popup nativo de Firebase.
 * Esto es más robusto que GSI manual ya que usa la configuración del proyecto de Firebase.
 */
export const loginWithGoogle = async (): Promise<User | null> => {
  try {
    const provider = new GoogleAuthProvider();
    // Añadimos scopes básicos para asegurar que recibimos el perfil
    provider.addScope('profile');
    provider.addScope('email');
    
    const result = await signInWithPopup(auth, provider);
    const fbUser = result.user;

    if (!fbUser) return null;

    const user: User = {
      id: fbUser.uid,
      name: fbUser.displayName || 'Usuario de Verso',
      email: fbUser.email || '',
      picture: fbUser.photoURL || '',
    };

    localStorage.setItem(USER_KEY, JSON.stringify(user));
    return user;
  } catch (error: any) {
    console.error("Firebase Login Error:", error);
    // Errores comunes: popup bloqueado o cierre manual
    if (error.code === 'auth/popup-closed-by-user') {
      console.warn("El usuario cerró el popup de autenticación.");
    }
    return null;
  }
};

/**
 * Mantiene compatibilidad con el sistema anterior si fuera necesario,
 * pero redirige al flujo persistente.
 */
export const getCurrentUser = (): User | null => {
  const data = localStorage.getItem(USER_KEY);
  return data ? JSON.parse(data) : null;
};

export const logout = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (e) {}
  localStorage.removeItem(USER_KEY);
};
