
// v2.8 - Real Identity Syncing with Firebase Auth
import { User } from '../types';
import { auth } from './firebaseConfig';
import { GoogleAuthProvider, signInWithCredential, signOut } from 'firebase/auth';

const USER_KEY = 'ensayamos_user';

// Helper to decode JWT without external libraries (Standard implementation)
function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export const handleGoogleCredential = async (credential: string): Promise<User | null> => {
  try {
    // 1. Decodificar para uso local
    const payload = parseJwt(credential);
    if (!payload) return null;

    const user: User = {
      id: payload.sub,
      name: payload.name,
      email: payload.email,
      picture: payload.picture,
    };

    // 2. Sincronizar con Firebase Auth (Esto es lo que permite que las reglas 'if auth != null' funcionen)
    const googleCred = GoogleAuthProvider.credential(credential);
    await signInWithCredential(auth, googleCred);

    localStorage.setItem(USER_KEY, JSON.stringify(user));
    return user;
  } catch (error) {
    console.error("Error syncing identity with Firebase:", error);
    return null;
  }
};

export const getCurrentUser = (): User | null => {
  const data = localStorage.getItem(USER_KEY);
  return data ? JSON.parse(data) : null;
};

export const logout = async (): Promise<void> => {
  await signOut(auth);
  localStorage.removeItem(USER_KEY);
};
