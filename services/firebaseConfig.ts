// v3.11 - Added Offline Persistence for Instant Loading
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyAihjd-EIiYDxU4dEUDh8iODfq1ldcUlz8",
    authDomain: "verso.social",
    projectId: "ensayamos-4581f",
    storageBucket: "ensayamos-4581f.firebasestorage.app",
    messagingSenderId: "290114942318",
    appId: "1:290114942318:web:a4012c73216f75a9df3d7f",
    measurementId: "G-FRLJ7XSEB6"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const db = getFirestore(app);
export const auth = getAuth(app);

// Habilitar persistencia de datos local
enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
        // Probablemente múltiples pestañas abiertas
        console.warn("Persistencia de Firestore deshabilitada (múltiples pestañas).");
    } else if (err.code === 'unimplemented') {
        // El navegador no lo soporta
        console.warn("El navegador no soporta persistencia de Firestore.");
    }
});