"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.finalizeSignup = exports.initiateSignup = void 0;
const https_1 = require("firebase-functions/v2/https");
const admin = __importStar(require("firebase-admin"));
const otplib_1 = require("otplib");
const bcrypt = __importStar(require("bcryptjs"));
const logger = __importStar(require("firebase-functions/logger"));
// Ensure Firestore is initialized
if (!admin.apps.length) {
    admin.initializeApp();
}
const db = admin.firestore();
// Helper to generate backup codes
const generateBackupCodes = (count = 5) => {
    const codes = [];
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
// Function A: Initiate Signup (v2)
exports.initiateSignup = (0, https_1.onCall)({
    cors: true,
    invoker: "public", // <--- CRITICAL FIX: Allows public access without auth
    maxInstances: 10 // (Optional) Prevents cold starts from getting too expensive
}, async (request) => {
    const { phone, name } = request.data;
    try {
        if (!phone || !name) {
            throw new https_1.HttpsError("invalid-argument", "Missing phone number or name.");
        }
        // 1. Validation: Check if user exists
        try {
            await admin.auth().getUserByPhoneNumber(phone);
            throw new https_1.HttpsError("already-exists", "Account already exists with this phone number.");
        }
        catch (error) {
            if (error.code === 'already-exists')
                throw error;
            if (error.code !== 'auth/user-not-found') {
                logger.error("Error checking user:", error);
                throw new https_1.HttpsError("internal", "Internal server error checking user.");
            }
        }
        // 2. Secret Gen
        const secret = otplib_1.authenticator.generateSecret();
        const otpauth = otplib_1.authenticator.keyuri(phone, "LuxeSalon", secret);
        // 3. Backup Gen
        const backupCodes = generateBackupCodes();
        // Hash Backup Codes for secure storage
        const hashedBackupCodes = await Promise.all(backupCodes.map((code) => bcrypt.hash(code.replace("-", ""), 10)));
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
    }
    catch (error) {
        logger.error("Initiate Signup Error", error);
        if (error instanceof https_1.HttpsError) {
            throw error;
        }
        throw new https_1.HttpsError("internal", error.message || "Failed to initiate signup.");
    }
});
// Function B: Finalize Signup (v2)
exports.finalizeSignup = (0, https_1.onCall)({
    cors: true,
    invoker: "public" // <--- CRITICAL FIX: Allows public access
}, async (request) => {
    const { phone, token } = request.data;
    try {
        if (!phone || !token) {
            throw new https_1.HttpsError("invalid-argument", "Missing phone or code.");
        }
        // 1. Fetch Pending Data
        const docRef = db.collection("pending_signups").doc(phone);
        const docSnap = await docRef.get();
        if (!docSnap.exists) {
            throw new https_1.HttpsError("not-found", "Signup session expired or invalid. Please start over.");
        }
        const { secret, hashedBackupCodes, name } = docSnap.data();
        // 2. Verify TOTP
        try {
            const isValid = otplib_1.authenticator.check(token, secret);
            if (!isValid) {
                throw new https_1.HttpsError("invalid-argument", "Invalid Authenticator Code.");
            }
        }
        catch (err) {
            throw new https_1.HttpsError("invalid-argument", "Invalid Authenticator Code format.");
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
    }
    catch (error) {
        logger.error("Finalize Signup Error", error);
        if (error instanceof https_1.HttpsError) {
            throw error;
        }
        throw new https_1.HttpsError("internal", "Failed to finalize signup.");
    }
});
//# sourceMappingURL=auth.js.map