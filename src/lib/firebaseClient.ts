
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getAuth, type Auth } from "firebase/auth";

// --- CONFIGURACIÓN DE FIREBASE ---
const firebaseConfig = {
    apiKey: "AIzaSyDPyjpk-G4ZFo1829Kih36TXQE1V2P1ZP0",
    authDomain: "axis-z-gpi-firebase-v1.firebaseapp.com",
    projectId: "axis-z-gpi-firebase-v1",
    storageBucket: "axis-z-gpi-firebase-v1.firebasestorage.app",
    messagingSenderId: "757898027312",
    appId: "1:757898027312:web:de4f51c344ccf5911728f5"
};

// --- INICIALIZACIÓN DIRECTA Y SEGURA ---

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;

// **ACCIÓN CORRECTORA:**
// Se elimina la validación errónea de la API Key. Se restaura la inicialización
// directa que funcionaba originalmente, envuelta en un try/catch para
// capturar errores sin bloquear la aplicación.
try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    console.log("Firebase ha sido inicializado correctamente.");
} catch (error) {
    console.error("Error inicializando Firebase. La app podría no funcionar online:", error);
    // Se deja que la app continúe, aunque la conexión a la DB falle.
    app = null;
    db = null;
    auth = null;
}

export { db, auth };
