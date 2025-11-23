
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// --- CONFIGURACIÓN DE FIREBASE ---
// REEMPLAZA ESTOS VALORES con los de tu consola de Firebase:
// 1. Ve a console.firebase.google.com
// 2. Crea un proyecto nuevo
// 3. Añade una "Web App" (icono </>)
// 4. Copia la configuración aquí abajo.

const firebaseConfig = {
  apiKey: "TU_API_KEY_AQUI",
  authDomain: "TU_PROJECT_ID.firebaseapp.com",
  projectId: "TU_PROJECT_ID",
  storageBucket: "TU_PROJECT_ID.appspot.com",
  messagingSenderId: "TU_SENDER_ID",
  appId: "TU_APP_ID"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Exportar servicios
export const db = getFirestore(app);
export const auth = getAuth(app);

// Nota: Para habilitar el modo "offline" robusto en Firestore web:
// import { enableIndexedDbPersistence } from "firebase/firestore"; 
// enableIndexedDbPersistence(db).catch((err) => { ... });
