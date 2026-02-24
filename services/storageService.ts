// v3.1 - Fixed query syntax and multi-user filtering | MelodIA Lab
import { Song, Rehearsal, Setlist } from '../types';
import { db } from './firebaseConfig';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  or,
  orderBy,
  arrayUnion
} from 'firebase/firestore';

const SONGS_COLLECTION = 'songs';
const REHEARSALS_COLLECTION = 'rehearsals';
const SETLISTS_COLLECTION = 'setlists';
const BANDS_COLLECTION = 'bands';

// --- Canciones ---

export const subscribeToSongs = (
  workspaceId: string,
  callback: (songs: Song[]) => void,
  onError?: (error: any) => void
) => {
  if (!workspaceId) return () => { };

  let songs1: Song[] = [];
  let songs2: Song[] = [];
  let errCount = 0;

  const update = () => {
    const map = new Map<string, Song>();
    [...songs1, ...songs2].forEach(s => map.set(s.id, s));
    const merged = Array.from(map.values());
    merged.sort((a, b) => a.title.localeCompare(b.title));
    callback(merged);
  };

  const handleErr = (error: any) => {
    console.error("Firestore Songs Error:", error);
    errCount++;
    if (errCount === 2 && onError) onError(error);
  };

  const q1 = query(collection(db, SONGS_COLLECTION), where('ownerId', '==', workspaceId));
  const q2 = query(collection(db, SONGS_COLLECTION), where('workspaceId', '==', workspaceId));

  const unsub1 = onSnapshot(q1, snap => {
    songs1 = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Song));
    update();
  }, handleErr);

  const unsub2 = onSnapshot(q2, snap => {
    songs2 = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Song));
    update();
  }, handleErr);

  return () => { unsub1(); unsub2(); };
};

export const saveSong = async (song: Song, workspaceId: string, userId: string = workspaceId): Promise<void> => {
  if (!workspaceId) throw new Error("Se requiere ID de workspace para guardar");
  const docRef = doc(db, SONGS_COLLECTION, song.id);
  return await setDoc(docRef, { ...song, workspaceId, ownerId: song.ownerId || userId }, { merge: true });
};

export const deleteSong = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, SONGS_COLLECTION, id));
  } catch (error) {
    console.error("Error deleting song:", error);
  }
};

export const getSharedSongs = async (songIds: string[]): Promise<Song[]> => {
  if (!songIds || songIds.length === 0) return [];
  try {
    const promises = songIds.map(id => getDoc(doc(db, SONGS_COLLECTION, id)));
    const docs = await Promise.all(promises);
    return docs.filter(d => d.exists()).map(d => ({ id: d.id, ...d.data() } as Song));
  } catch (error) {
    console.error("Error fetching shared songs:", error);
    return [];
  }
};

// --- Setlists ---

export const subscribeToSetlists = (
  workspaceId: string,
  callback: (setlists: Setlist[]) => void,
  onError?: (error: any) => void
) => {
  if (!workspaceId) return () => { };

  let list1: Setlist[] = [];
  let list2: Setlist[] = [];
  let errCount = 0;

  const update = () => {
    const map = new Map<string, Setlist>();
    [...list1, ...list2].forEach(s => map.set(s.id, s));
    const merged = Array.from(map.values());
    merged.sort((a, b) => b.createdAt - a.createdAt);
    callback(merged);
  };

  const handleErr = (error: any) => {
    console.error("Firestore Setlists Error:", error);
    errCount++;
    if (errCount === 2 && onError) onError(error);
  };

  const q1 = query(collection(db, SETLISTS_COLLECTION), where('ownerId', '==', workspaceId));
  const q2 = query(collection(db, SETLISTS_COLLECTION), where('workspaceId', '==', workspaceId));

  const unsub1 = onSnapshot(q1, snap => {
    list1 = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Setlist));
    update();
  }, handleErr);

  const unsub2 = onSnapshot(q2, snap => {
    list2 = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Setlist));
    update();
  }, handleErr);

  return () => { unsub1(); unsub2(); };
};

export const saveSetlist = async (setlist: Setlist, workspaceId: string, userId: string = workspaceId): Promise<void> => {
  if (!workspaceId) throw new Error("Se requiere ID de workspace para guardar");
  const docRef = doc(db, SETLISTS_COLLECTION, setlist.id);
  return await setDoc(docRef, { ...setlist, workspaceId, ownerId: setlist.ownerId || userId }, { merge: true });
};

export const deleteSetlist = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, SETLISTS_COLLECTION, id));
  } catch (error) {
    console.error("Error deleting setlist:", error);
  }
};

export const getSharedSetlist = async (id: string): Promise<Setlist | null> => {
  if (!id) return null;
  try {
    const d = await getDoc(doc(db, SETLISTS_COLLECTION, id));
    return d.exists() ? ({ id: d.id, ...d.data() } as Setlist) : null;
  } catch (error) {
    console.error("Error fetching shared setlist:", error);
    return null;
  }
};

// --- Ensayos ---

export const subscribeToRehearsals = (
  workspaceId: string,
  callback: (rehearsals: Rehearsal[]) => void,
  onError?: (error: any) => void
) => {
  if (!workspaceId) return () => { };

  let list1: Rehearsal[] = [];
  let list2: Rehearsal[] = [];
  let errCount = 0;

  const update = () => {
    const map = new Map<string, Rehearsal>();
    [...list1, ...list2].forEach(s => map.set(s.id, s));
    const merged = Array.from(map.values());
    merged.sort((a, b) => b.createdAt - a.createdAt);
    callback(merged);
  };

  const handleErr = (error: any) => {
    console.error("Firestore Rehearsals Error:", error);
    errCount++;
    if (errCount === 2 && onError) onError(error);
  };

  const q1 = query(collection(db, REHEARSALS_COLLECTION), where('createdBy', '==', workspaceId));
  const q2 = query(collection(db, REHEARSALS_COLLECTION), where('workspaceId', '==', workspaceId));

  const unsub1 = onSnapshot(q1, snap => {
    list1 = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Rehearsal));
    update();
  }, handleErr);

  const unsub2 = onSnapshot(q2, snap => {
    list2 = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Rehearsal));
    update();
  }, handleErr);

  return () => { unsub1(); unsub2(); };
};

export const saveRehearsal = async (rehearsal: Rehearsal, workspaceId: string, userId: string = workspaceId): Promise<void> => {
  if (!workspaceId || typeof workspaceId !== 'string') throw new Error("ID de workspace inválido");
  const docRef = doc(db, REHEARSALS_COLLECTION, rehearsal.id);
  return await setDoc(docRef, { ...rehearsal, workspaceId, createdBy: rehearsal.createdBy || userId }, { merge: true });
};

export const deleteRehearsal = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, REHEARSALS_COLLECTION, id));
  } catch (error) {
    console.error("Error deleting rehearsal:", error);
  }
};

export const getRehearsalById = async (id: string): Promise<Rehearsal | null> => {
  if (!id) return null;
  try {
    const d = await getDoc(doc(db, REHEARSALS_COLLECTION, id));
    return d.exists() ? ({ id: d.id, ...d.data() } as Rehearsal) : null;
  } catch (error) {
    console.error("Error fetching rehearsal by ID:", error);
    return null;
  }
};

// --- Bands (Workspaces) ---

export const createBand = async (band: import('../types').Band): Promise<void> => {
  const docRef = doc(db, BANDS_COLLECTION, band.id);
  return await setDoc(docRef, band);
};

export const getUserBands = async (userId: string): Promise<import('../types').Band[]> => {
  if (!userId) return [];
  try {
    const q = query(
      collection(db, BANDS_COLLECTION),
      where('members', 'array-contains', { userId, role: 'ADMIN' })
      // Note: Firestore array-contains on objects requires exact match. 
      // For a more robust query, we'll fetch all and filter in memory if needed, 
      // or change how members are stored (e.g. memberIds string[]). Let's use getDocs and filter manually to be safe.
    );
    const snapshot = await getDocs(collection(db, BANDS_COLLECTION));
    const allBands = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as import('../types').Band));
    return allBands.filter(band => band.members.some(m => m.userId === userId));
  } catch (error) {
    console.error("Error fetching user bands:", error);
    return [];
  }
};

export const getBandById = async (id: string): Promise<import('../types').Band | null> => {
  if (!id) return null;
  try {
    const d = await getDoc(doc(db, BANDS_COLLECTION, id));
    return d.exists() ? ({ id: d.id, ...d.data() } as import('../types').Band) : null;
  } catch (error) {
    console.error("Error fetching band by ID:", error);
    return null;
  }
};

export const joinBand = async (bandId: string, userId: string): Promise<void> => {
  if (!bandId || !userId) return;
  const docRef = doc(db, BANDS_COLLECTION, bandId);
  const newMember: import('../types').BandMember = {
    userId,
    role: 'MEMBER',
    joinedAt: Date.now()
  };
  await updateDoc(docRef, {
    members: arrayUnion(newMember)
  });
};