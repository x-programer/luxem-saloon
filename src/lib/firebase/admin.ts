import "server-only";
import { initializeApp, getApps, getApp, cert, type ServiceAccount } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

// 1. Load & Sanitize Credentials
function getAdminCredentials(): ServiceAccount {
    const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    // Handle both literal \n (from some env providers) and actual newlines
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    // 2. Strict Validation
    if (!projectId || !clientEmail || !privateKey) {
        throw new Error("Firebase Admin SDK Initialization Failed: Missing credentials in .env.local");
    }

    if (!privateKey.startsWith("-----BEGIN PRIVATE KEY-----")) {
        throw new Error("FATAL: Firebase Private Key is missing the correct header (-----BEGIN PRIVATE KEY-----). Check your .env.local file.");
    }

    return {
        projectId,
        clientEmail,
        privateKey,
    };
}

// 3. Initialize App (Prevents hot-reload errors)
const app = getApps().length === 0
    ? initializeApp({
        credential: cert(getAdminCredentials()),
    })
    : getApp();

const adminAuth = getAuth(app);
const adminDb = getFirestore(app);

export { adminAuth, adminDb };