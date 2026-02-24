export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  CREATE_REHEARSAL = 'CREATE_REHEARSAL',
  REHEARSAL_DETAIL = 'REHEARSAL_DETAIL',
  SONG_LIBRARY = 'SONG_LIBRARY',
  EDIT_SONG = 'EDIT_SONG',
  EDIT_SETLIST = 'EDIT_SETLIST',
  VIEW_SETLIST = 'VIEW_SETLIST',
  PLAY_MODE = 'PLAY_MODE',
  COMPOSER = 'COMPOSER',
  BANDS = 'BANDS'
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
  workspaceId?: string;
  ownerId?: string;
}

export interface Setlist {
  id: string;
  title: string;
  description: string;
  songs: string[]; // Array of Song IDs
  ownerId: string;
  workspaceId?: string;
  createdAt: number;
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
  linkedSetlistId?: string; // ID of the associated Setlist
  setlist: string[]; // Array of Song IDs (legacy or custom override)
  createdBy?: string;
  workspaceId?: string;
  createdAt: number;
}

export type Role = 'ADMIN' | 'MEMBER' | 'GUEST';

export interface BandMember {
  userId: string;
  role: Role;
  joinedAt: number;
}

export interface Band {
  id: string;
  name: string;
  createdBy: string;
  members: BandMember[];
  createdAt: number;
  picture?: string;
}

export type Language = 'es' | 'en' | 'it' | 'fr' | 'de' | 'ja' | 'ko' | 'zh' | 'hi' | 'gu' | 'ta' | 'uk' | 'sv' | 'fi' | 'nl' | 'is' | 'arn' | 'pl';