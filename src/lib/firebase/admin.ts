import "server-only";
import { initializeApp, getApps, getApp, cert, type ServiceAccount } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import * as fs from 'fs';
import * as path from 'path';

// 1. Define the interfaces for our credentials
interface AdminCredentials {
    projectId?: string;
    clientEmail?: string;
    privateKey?: string;
}

// 2. Function to load credentials with "File-First" Strategy
function getAdminCredentials(): ServiceAccount {
    let credentials: AdminCredentials = {};

    // PRIORITY 1: Local JSON File
    // We assume the file is in the root of the project (where package.json is)
    const localKeyPath = path.join(process.cwd(), 'luxem-saloon-firebase-adminsdk-fbsvc-1812b6fac0.json');
    let loadedFromFile = false;

    try {
        if (fs.existsSync(localKeyPath)) {
            const rawData = fs.readFileSync(localKeyPath, 'utf-8');
            const jsonCreds = JSON.parse(rawData);

            // Map JSON keys (snake_case) to ServiceAccount keys (camelCase)
            credentials = {
                projectId: jsonCreds.project_id,
                clientEmail: jsonCreds.client_email,
                privateKey: jsonCreds.private_key,
            };

            // Basic check to see if we got data
            if (credentials.projectId && credentials.clientEmail && credentials.privateKey) {
                console.log("✅ Loaded Firebase Admin credentials from local JSON file.");
                loadedFromFile = true;
            }
        }
    } catch (error) {
        console.warn("⚠️ Found local key file but failed to read/parse it:", error);
    }

    // PRIORITY 2: Environment Variables (Fallback)
    if (!loadedFromFile) {
        // console.log("ℹ️ Local JSON key not found or invalid. Attempting to load from environment variables...");

        credentials = {
            projectId: process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY,
        };

        // Sanitize Private Key from Env
        if (credentials.privateKey) {
            credentials.privateKey = credentials.privateKey.replace(/\\n/g, '\n');
        }
    }

    // 3. Strict Validation
    if (!credentials.projectId || !credentials.clientEmail || !credentials.privateKey) {
        const missing = [];
        if (!credentials.projectId) missing.push("project_id / FIREBASE_PROJECT_ID");
        if (!credentials.clientEmail) missing.push("client_email / FIREBASE_CLIENT_EMAIL");
        if (!credentials.privateKey) missing.push("private_key / FIREBASE_PRIVATE_KEY");

        console.error("❌ CRITICAL: Failed to load Firebase Admin Credentials.");
        console.error(`   Checked File: ${localKeyPath}`);
        console.error(`   Missing fields: ${missing.join(', ')}`);

        throw new Error(`Firebase Admin SDK Initialization Failed. Missing: ${missing.join(', ')}`);
    }

    return {
        projectId: credentials.projectId,
        clientEmail: credentials.clientEmail,
        privateKey: credentials.privateKey,
    };
}

// 4. Initialize App
const serviceAccount = getAdminCredentials();

const app = !getApps().length
    ? initializeApp({
        credential: cert(serviceAccount),
    })
    : getApp();

const adminAuth = getAuth(app);
const adminDb = getFirestore(app);

export { adminAuth, adminDb };