import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, orderBy, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAihjd-EIiYDxU4dEUDh8iODfq1ldcUlz8",
  authDomain: "ensayamos-4581f.firebaseapp.com",
  projectId: "ensayamos-4581f",
  storageBucket: "ensayamos-4581f.firebasestorage.app",
  messagingSenderId: "290114942318",
  appId: "1:290114942318:web:a4012c73216f75a9df3d7f",
  measurementId: "G-FRLJ7XSEB6"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testQuery() {
  try {
    const q = query(
      collection(db, 'rehearsals'),
      where('createdBy', '==', 'testUser'),
      orderBy('createdAt', 'desc')
    );
    await getDocs(q);
    console.log("Rehearsals Query SUCCESS!");
  } catch (error) {
    console.error("Rehearsals Query FAILED:", error.message);
  }
  
  try {
    const q2 = query(
      collection(db, 'songs'),
      where('ownerId', '==', 'testUser'),
      orderBy('title')
    );
    await getDocs(q2);
    console.log("Songs Query SUCCESS!");
  } catch (error) {
    console.error("Songs Query FAILED:", error.message);
  }
}

testQuery();
