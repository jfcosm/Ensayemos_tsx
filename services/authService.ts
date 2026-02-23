
// v2.26 - Consolidated Firebase Auth imports to resolve module export errors
import { User } from '../types';
import { auth } from './firebaseConfig';
// Fix: Re-structured imports from 'firebase/auth' to ensure all members are correctly identified as modular exports
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';

const USER_KEY = 'ensayamos_user';

export const loginWithGoogle = async (): Promise<User | null> => {
  try {
    await setPersistence(auth, browserLocalPersistence);
    const provider = new GoogleAuthProvider();
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
    console.error("Firebase Auth Error:", error);
    if (error.code !== 'auth/popup-closed-by-user') {
      alert("Error de inicio de sesión. Por favor intenta de nuevo.");
    }
    return null;
  }
};

export const getCurrentUser = (): User | null => {
  const data = localStorage.getItem(USER_KEY);
  try {
    return data ? JSON.parse(data) : null;
  } catch (e) {
    return null;
  }
};

export const logout = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (e) { }
  localStorage.removeItem(USER_KEY);
};
