import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// ------------------------------------------------------------------
// INSTRUCCIONES:
// Reemplaza el objeto de abajo con la configuración que te dio Firebase Console.
// Ve a Configuración del Proyecto -> General -> Tus apps -> SDK setup
// ------------------------------------------------------------------

const firebaseConfig = {
  apiKey: "AIzaSyAihjd-EIiYDxU4dEUDh8iODfq1ldcUlz8",
  authDomain: "ensayemos-4581f.firebaseapp.com",
  projectId: "ensayemos-4581f",
  storageBucket: "ensayemos-4581f.firebasestorage.app",
  messagingSenderId: "290114942318",
  appId: "1:290114942318:web:a4012c73216f75a9df3d7f",
  measurementId: "G-FRLJ7XSEB6"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);