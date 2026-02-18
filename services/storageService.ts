// v3.0 - Added User-Based Filtering and Optimized Snapshots | MelodIA Lab
import { Song, Rehearsal } from '../types';
import { db } from './firebaseConfig';
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  where,
  orderBy 
} from 'firebase/firestore';

const SONGS_COLLECTION = 'songs';
const REHEARSALS_COLLECTION = 'rehearsals';

// --- Songs ---

export const subscribeToSongs = (
  userId: string, 
  callback: (songs: Song[]) => void, 
  onError?: (error: any) => void
) => {
  // Solo traemos canciones que te pertenecen (ownerId)
  const q = query(
    collection(db, SONGS_COLLECTION), 
    where('ownerId', '==', userId), 
    orderBy('title')
  );
  
  return onSnapshot(q, 
    (snapshot) => {
      const songs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Song));
      callback(songs);
    },
    (error) => {
      console.error("Firestore Songs Error:", error);
      if (onError) onError(error);
    }
  );
};

export const saveSong = async (song: Song, userId: string): Promise<void> => {
  const docRef = doc(db, SONGS_COLLECTION, song.id);
  // Guardamos con ownerId para persistencia total entre sesiones
  return await setDoc(docRef, { ...song, ownerId: userId }, { merge: true });
};

export const deleteSong = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, SONGS_COLLECTION, id));
  } catch (error) {
    console.error("Error deleting song:", error);
  }
};

// --- Rehearsals ---

export const subscribeToRehearsals = (
  userId: string, 
  callback: (rehearsals: Rehearsal[]) => void,
  onError?: (error: any) => void
) => {
  // Solo traemos ensayos creados por ti (createdBy)
  const q = query(
    collection(db, REHEARSALS_COLLECTION), 
    where('createdBy', '==', userId), 
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, 
    (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Rehearsal));
      callback(list);
    },
    (error) => {
      console.error("Firestore Rehearsals Error:", error);
      if (onError) onError(error);
    }
  );
};

export const saveRehearsal = async (rehearsal: Rehearsal, userId: string): Promise<void> => {
  const docRef = doc(db, REHEARSALS_COLLECTION, rehearsal.id);
  // Aseguramos el vínculo con tu cuenta de MelodIA Lab
  return await setDoc(docRef, { ...rehearsal, createdBy: userId }, { merge: true });
};

export const deleteRehearsal = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, REHEARSALS_COLLECTION, id));
  } catch (error) {
    console.error("Error deleting rehearsal:", error);
  }
};