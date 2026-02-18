
// v3.10 - Standardized Firebase v9 Modular Imports
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
// Fix: Corrected import for getAuth to resolve "no exported member" error in modular environments
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAihjd-EIiYDxU4dEUDh8iODfq1ldcUlz8",
  authDomain: "ensayamos-4581f.firebaseapp.com",
  projectId: "ensayamos-4581f",
  storageBucket: "ensayamos-4581f.firebasestorage.app",
  messagingSenderId: "290114942318",
  appId: "1:290114942318:web:a4012c73216f75a9df3d7f",
  measurementId: "G-FRLJ7XSEB6"
};

// Singleton pattern: prevent double initialization and ensure version consistency
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Exports linked to the correct app instance
export const db = getFirestore(app);
// Fix: Re-exporting auth initialized via getAuth named export
export const auth = getAuth(app);


// Al final del archivo firebaseConfig.ts
import { initializeFirestore, terminate } from 'firebase/firestore';

// Opcional: Esto ayuda a que Firestore no se quede "colgado" esperando 
// conexiones persistentes en entornos de desarrollo limitados como AI Studio.
// Si notas lentitud extrema, añade esta línea después de 'db':
// (Solo actívalo si el problema de lentitud persiste tras el cambio de CreateRehearsal)
// enableIndexedDbPersistence(db).catch(() => {});