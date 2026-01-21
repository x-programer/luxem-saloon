import * as admin from "firebase-admin";

// Initialize Admin globally (required for v2 functions using global instance)
if (!admin.apps.length) {
    admin.initializeApp();
}

// Export new Auth functions
export * from "./auth";
