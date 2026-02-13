// v2.6 - Added error handling to real-time subscriptions
import { Song, Rehearsal } from '../types';
import { db } from './firebaseConfig';
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy 
} from 'firebase/firestore';

const SONGS_COLLECTION = 'songs';
const REHEARSALS_COLLECTION = 'rehearsals';

// --- Songs ---

export const subscribeToSongs = (
  callback: (songs: Song[]) => void, 
  onError?: (error: any) => void
) => {
  const q = query(collection(db, SONGS_COLLECTION), orderBy('title'));
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

export const saveSong = async (song: Song): Promise<void> => {
  try {
    const docRef = doc(db, SONGS_COLLECTION, song.id);
    await setDoc(docRef, song, { merge: true });
  } catch (error) {
    console.error("Error saving song:", error);
    alert("Error al guardar en la nube. Revisa tus reglas de Firebase.");
  }
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
  callback: (rehearsals: Rehearsal[]) => void,
  onError?: (error: any) => void
) => {
  const q = query(collection(db, REHEARSALS_COLLECTION), orderBy('createdAt', 'desc'));
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

export const saveRehearsal = async (rehearsal: Rehearsal): Promise<void> => {
  try {
    const docRef = doc(db, REHEARSALS_COLLECTION, rehearsal.id);
    await setDoc(docRef, rehearsal, { merge: true });
  } catch (error) {
    console.error("Error saving rehearsal:", error);
    alert("Error al guardar ensayo. Revisa tus reglas de Firebase.");
  }
};

export const deleteRehearsal = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, REHEARSALS_COLLECTION, id));
  } catch (error) {
    console.error("Error deleting rehearsal:", error);
  }
};