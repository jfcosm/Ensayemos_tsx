// v3.1 - Fixed query syntax and multi-user filtering | MelodIA Lab
import { Song, Rehearsal, Setlist } from '../types';
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
const SETLISTS_COLLECTION = 'setlists';

// --- Canciones ---

export const subscribeToSongs = (
  userId: string,
  callback: (songs: Song[]) => void,
  onError?: (error: any) => void
) => {
  if (!userId) return () => { }; // Seguridad si no hay ID

  // REMOVED 'orderBy' to prevent Firebase Index Missing errors on production
  // We will sort on the client side instead.
  const q = query(
    collection(db, SONGS_COLLECTION),
    where('ownerId', '==', userId)
  );

  return onSnapshot(q,
    (snapshot) => {
      let songs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Song));
      // Client-side sorting
      songs.sort((a, b) => a.title.localeCompare(b.title));
      callback(songs);
    },
    (error) => {
      console.error("Firestore Songs Error:", error);
      if (onError) onError(error);
    }
  );
};

export const saveSong = async (song: Song, userId: string): Promise<void> => {
  if (!userId) throw new Error("Se requiere ID de usuario para guardar");
  const docRef = doc(db, SONGS_COLLECTION, song.id);
  return await setDoc(docRef, { ...song, ownerId: userId }, { merge: true });
};

export const deleteSong = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, SONGS_COLLECTION, id));
  } catch (error) {
    console.error("Error deleting song:", error);
  }
};

// --- Setlists ---

export const subscribeToSetlists = (
  userId: string,
  callback: (setlists: Setlist[]) => void,
  onError?: (error: any) => void
) => {
  if (!userId) return () => { };

  const q = query(
    collection(db, SETLISTS_COLLECTION),
    where('ownerId', '==', userId)
  );

  return onSnapshot(q,
    (snapshot) => {
      let setlists = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Setlist));
      setlists.sort((a, b) => b.createdAt - a.createdAt); // Client sorting by date
      callback(setlists);
    },
    (error) => {
      console.error("Firestore Setlists Error:", error);
      if (onError) onError(error);
    }
  );
};

export const saveSetlist = async (setlist: Setlist, userId: string): Promise<void> => {
  if (!userId) throw new Error("Se requiere ID de usuario para guardar");
  const docRef = doc(db, SETLISTS_COLLECTION, setlist.id);
  return await setDoc(docRef, { ...setlist, ownerId: userId }, { merge: true });
};

export const deleteSetlist = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, SETLISTS_COLLECTION, id));
  } catch (error) {
    console.error("Error deleting setlist:", error);
  }
};

// --- Ensayos ---

export const subscribeToRehearsals = (
  userId: string,
  callback: (rehearsals: Rehearsal[]) => void,
  onError?: (error: any) => void
) => {
  if (!userId) return () => { };

  // REMOVED 'orderBy' to prevent Firebase Index Missing errors.
  const q = query(
    collection(db, REHEARSALS_COLLECTION),
    where('createdBy', '==', userId)
  );

  return onSnapshot(q,
    (snapshot) => {
      let list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Rehearsal));
      // Client-side sorting
      list.sort((a, b) => b.createdAt - a.createdAt);
      callback(list);
    },
    (error) => {
      console.error("Firestore Rehearsals Error:", error);
      if (onError) onError(error);
    }
  );
};

export const saveRehearsal = async (rehearsal: Rehearsal, userId: string): Promise<void> => {
  if (!userId || typeof userId !== 'string') throw new Error("ID de usuario inválido");
  const docRef = doc(db, REHEARSALS_COLLECTION, rehearsal.id);
  return await setDoc(docRef, { ...rehearsal, createdBy: userId }, { merge: true });
};

export const deleteRehearsal = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, REHEARSALS_COLLECTION, id));
  } catch (error) {
    console.error("Error deleting rehearsal:", error);
  }
};