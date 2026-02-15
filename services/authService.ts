
// v2.10 - Robust Identity Syncing
import { User } from '../types';
import { auth } from './firebaseConfig';
import { GoogleAuthProvider, signInWithCredential, signOut } from 'firebase/auth';

const USER_KEY = 'ensayamos_user';

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
    const payload = parseJwt(credential);
    if (!payload) return null;

    const user: User = {
      id: payload.sub,
      name: payload.name,
      email: payload.email,
      picture: payload.picture,
    };

    // CRITICAL: We MUST await this before proceeding to allow Firestore rules to recognize the user
    const googleCred = GoogleAuthProvider.credential(credential);
    await signInWithCredential(auth, googleCred);

    localStorage.setItem(USER_KEY, JSON.stringify(user));
    return user;
  } catch (error) {
    console.error("Firebase Sync Error:", error);
    return null;
  }
};

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
