import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";
import { getStorage, connectStorageEmulator } from "firebase/storage";
// 1. Import App Check
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const functions = getFunctions(app);
const storage = getStorage(app);

// 2. Initialize App Check (Client-Side Only)
if (typeof window !== "undefined") {
    // Use a variable to ensure the key exists
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

    if (siteKey) {
        try {
            initializeAppCheck(app, {
                provider: new ReCaptchaV3Provider(siteKey),
                isTokenAutoRefreshEnabled: true,
            });
            console.log("🛡️ App Check initialized successfully.");
        } catch (error) {
            console.error("Error initializing App Check:", error);
        }
    } else {
        console.warn("⚠️ App Check skipped: NEXT_PUBLIC_RECAPTCHA_SITE_KEY is missing in .env.local");
    }
}

// Connect to Emulators if running locally (Optional, uncomment to use)
// if (process.env.NODE_ENV === "development") {
//    connectFunctionsEmulator(functions, "localhost", 5001);
//    connectStorageEmulator(storage, "localhost", 9199);
// }

export { app, auth, db, functions, storage };