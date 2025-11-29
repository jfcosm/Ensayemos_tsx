export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  CREATE_REHEARSAL = 'CREATE_REHEARSAL',
  REHEARSAL_DETAIL = 'REHEARSAL_DETAIL',
  SONG_LIBRARY = 'SONG_LIBRARY',
  EDIT_SONG = 'EDIT_SONG',
  PLAY_MODE = 'PLAY_MODE'
}

export interface User {
  id: string;
  name: string;
  email: string;
  picture: string;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  content: string; // The lyrics and chords
  key?: string;
}

export interface RehearsalOption {
  id: string;
  date: string; // ISO string
  time: string;
  location: string;
  voterIds: string[]; // Array of User IDs who voted for this
}

export interface Rehearsal {
  id: string;
  title: string;
  status: 'PROPOSED' | 'CONFIRMED' | 'COMPLETED';
  options: RehearsalOption[];
  confirmedOptionId?: string;
  setlist: string[]; // Array of Song IDs
  createdAt: number;
}

export type Language = 'es' | 'en' | 'it' | 'fr' | 'hi' | 'ja' | 'ko' | 'zh' | 'de';