import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { authenticator } from "otplib";
import * as bcrypt from "bcryptjs";
import * as logger from "firebase-functions/logger";

// Ensure Firestore is initialized
if (!admin.apps.length) {
    admin.initializeApp();
}
const db = admin.firestore();

// Helper to generate backup codes
const generateBackupCodes = (count: number = 5): string[] => {
    const codes: string[] = [];
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    for (let i = 0; i < count; i++) {
        let code = "";
        for (let j = 0; j < 8; j++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        codes.push(code.slice(0, 4) + "-" + code.slice(4));
    }
    return codes;
};

interface InitiateSignupData {
    phone: string;
    name: string;
}

interface FinalizeSignupData {
    phone: string;
    token: string;
}

// Function A: Initiate Signup (v2)
export const initiateSignup = onCall(
    {
        cors: true,
        invoker: "public",  // <--- CRITICAL FIX: Allows public access without auth
        maxInstances: 10    // (Optional) Prevents cold starts from getting too expensive
    },
    async (request) => {
        const { phone, name } = request.data as InitiateSignupData;

        try {
            if (!phone || !name) {
                throw new HttpsError("invalid-argument", "Missing phone number or name.");
            }

            // 1. Validation: Check if user exists
            try {
                await admin.auth().getUserByPhoneNumber(phone);
                throw new HttpsError("already-exists", "Account already exists with this phone number.");
            } catch (error: any) {
                if (error.code === 'already-exists') throw error;
                if (error.code !== 'auth/user-not-found') {
                    logger.error("Error checking user:", error);
                    throw new HttpsError("internal", "Internal server error checking user.");
                }
            }

            // 2. Secret Gen
            const secret = authenticator.generateSecret();
            const otpauth = authenticator.keyuri(phone, "LuxeSalon", secret);

            // 3. Backup Gen
            const backupCodes = generateBackupCodes();

            // Hash Backup Codes for secure storage
            const hashedBackupCodes = await Promise.all(
                backupCodes.map((code) => bcrypt.hash(code.replace("-", ""), 10))
            );

            // 4. Storage (Pending)
            await db.collection("pending_signups").doc(phone).set({
                secret,
                hashedBackupCodes,
                name,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
            });

            // 5. Response
            return {
                qrCodeUrl: otpauth,
                backupCodes,
            };

        } catch (error: any) {
            logger.error("Initiate Signup Error", error);
            if (error instanceof HttpsError) {
                throw error;
            }
            throw new HttpsError("internal", error.message || "Failed to initiate signup.");
        }
    }
);

// Function B: Finalize Signup (v2)
export const finalizeSignup = onCall(
    {
        cors: true,
        invoker: "public" // <--- CRITICAL FIX: Allows public access
    },
    async (request) => {
        const { phone, token } = request.data as FinalizeSignupData;

        try {
            if (!phone || !token) {
                throw new HttpsError("invalid-argument", "Missing phone or code.");
            }

            // 1. Fetch Pending Data
            const docRef = db.collection("pending_signups").doc(phone);
            const docSnap = await docRef.get();

            if (!docSnap.exists) {
                throw new HttpsError("not-found", "Signup session expired or invalid. Please start over.");
            }

            const { secret, hashedBackupCodes, name } = docSnap.data() as any;

            // 2. Verify TOTP
            try {
                const isValid = authenticator.check(token, secret);
                if (!isValid) {
                    throw new HttpsError("invalid-argument", "Invalid Authenticator Code.");
                }
            } catch (err) {
                throw new HttpsError("invalid-argument", "Invalid Authenticator Code format.");
            }

            // 3. Action (Create User & Move Secrets)
            const userRecord = await admin.auth().createUser({
                phoneNumber: phone,
                displayName: name,
            });

            // Set Custom Claims (Role) - IMPLICITLY ADDED HERE
            await admin.auth().setCustomUserClaims(userRecord.uid, {
                role: "vendor",
                status: "pending"
            });

            // Store Secrets in protected collection
            await db.collection("user_secrets").doc(userRecord.uid).set({
                totpSecret: secret,
                backupCodes: hashedBackupCodes,
            });

            // Create initial user profile
            await db.collection("users").doc(userRecord.uid).set({
                displayName: name,
                phoneNumber: phone,
                role: "vendor",
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
            });

            // Cleanup
            await docRef.delete();

            // Mint Token
            const firebaseCustomToken = await admin.auth().createCustomToken(userRecord.uid);

            return { firebaseCustomToken };

        } catch (error: any) {
            logger.error("Finalize Signup Error", error);
            if (error instanceof HttpsError) {
                throw error;
            }
            throw new HttpsError("internal", "Failed to finalize signup.");
        }
    }
);