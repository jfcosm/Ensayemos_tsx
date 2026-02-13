// v2.5 - Strict Google Auth (Removed guest helper)
import { User } from '../types';

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

export const handleGoogleCredential = (credential: string): User | null => {
  const payload = parseJwt(credential);
  if (!payload) return null;

  const user: User = {
    id: payload.sub,
    name: payload.name,
    email: payload.email,
    picture: payload.picture,
  };

  localStorage.setItem(USER_KEY, JSON.stringify(user));
  return user;
};

export const getCurrentUser = (): User | null => {
  const data = localStorage.getItem(USER_KEY);
  return data ? JSON.parse(data) : null;
};

export const logout = (): void => {
  localStorage.removeItem(USER_KEY);
};