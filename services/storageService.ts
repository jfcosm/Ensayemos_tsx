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

  const q = query(collection(db, SONGS_COLLECTION));

  return onSnapshot(q,
    (snapshot) => {
      let allSongs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Song));

      // Filter locally to bypass Firebase "OR" query IndexedDB cache freezes
      let filtered = allSongs.filter(s => s.ownerId === workspaceId || s.workspaceId === workspaceId);

      filtered.sort((a, b) => a.title.localeCompare(b.title));
      callback(filtered);
    },
    (error) => {
      console.error("Firestore Songs Error:", error);
      if (onError) onError(error);
    }
  );
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

  const q = query(collection(db, SETLISTS_COLLECTION));

  return onSnapshot(q,
    (snapshot) => {
      let allSetlists = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Setlist));

      // Filter locally
      let filtered = allSetlists.filter(s => s.ownerId === workspaceId || s.workspaceId === workspaceId);

      filtered.sort((a, b) => b.createdAt - a.createdAt);
      callback(filtered);
    },
    (error) => {
      console.error("Firestore Setlists Error:", error);
      if (onError) onError(error);
    }
  );
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

  const q = query(collection(db, REHEARSALS_COLLECTION));

  return onSnapshot(q,
    (snapshot) => {
      let all = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Rehearsal));

      // Filter locally
      let filtered = all.filter(r => r.createdBy === workspaceId || r.workspaceId === workspaceId);

      filtered.sort((a, b) => b.createdAt - a.createdAt);
      callback(filtered);
    },
    (error) => {
      console.error("Firestore Rehearsals Error:", error);
      if (onError) onError(error);
    }
  );
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

export const subscribeToUserBands = (
  userId: string,
  callback: (bands: import('../types').Band[]) => void,
  onError?: (error: any) => void
) => {
  if (!userId) return () => { };

  const q = query(
    collection(db, BANDS_COLLECTION),
    or(
      where('memberIds', 'array-contains', userId),
      where('createdBy', '==', userId)
    )
  );

  return onSnapshot(q,
    (snapshot) => {
      const allBandsMap = new Map<string, import('../types').Band>();
      snapshot.docs.forEach(doc => {
        allBandsMap.set(doc.id, { id: doc.id, ...doc.data() } as import('../types').Band);
      });
      callback(Array.from(allBandsMap.values()));
    },
    (error) => {
      console.error("Firestore Bands Error:", error);
      if (onError) onError(error);
    }
  );
};

export const createBand = async (band: import('../types').Band): Promise<void> => {
  const docRef = doc(db, BANDS_COLLECTION, band.id);
  return await setDoc(docRef, band);
};

export const deleteBand = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, BANDS_COLLECTION, id));
  } catch (error) {
    console.error("Error deleting band:", error);
    throw error; // Let UI catch it if needed, though we'll use fire-and-forget
  }
};

// Obsoleted by subscribeToUserBands, but kept for reference/migration if needed elsewhere
export const getUserBands = async (userId: string): Promise<import('../types').Band[]> => {
  if (!userId) return [];
  try {
    // 1. Query by memberIds for new format
    const qMembers = query(
      collection(db, BANDS_COLLECTION),
      where('memberIds', 'array-contains', userId)
    );
    // 2. Query by createdBy as a fallback for older records
    const qCreator = query(
      collection(db, BANDS_COLLECTION),
      where('createdBy', '==', userId)
    );

    const [membersSnapshot, creatorSnapshot] = await Promise.all([
      getDocs(qMembers),
      getDocs(qCreator)
    ]);

    const allBandsMap = new Map<string, import('../types').Band>();

    // Merge results to avoid duplicates
    membersSnapshot.docs.forEach(doc => {
      allBandsMap.set(doc.id, { id: doc.id, ...doc.data() } as import('../types').Band);
    });
    creatorSnapshot.docs.forEach(doc => {
      if (!allBandsMap.has(doc.id)) {
        allBandsMap.set(doc.id, { id: doc.id, ...doc.data() } as import('../types').Band);
      }
    });

    return Array.from(allBandsMap.values());
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