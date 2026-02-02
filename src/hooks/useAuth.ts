"use client";

import { useState, useEffect } from "react";
import { onAuthStateChanged, User, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/config";

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                // Enforce Session Timeout (24 Hours) using Token 'authTime'
                try {
                    const tokenResult = await currentUser.getIdTokenResult();
                    const authTime = Date.parse(tokenResult.authTime) / 1000; // authTime is UTC string, convert to seconds
                    // OR sometimes authTime is already seconds depending on SDK version, but usually string in Client SDK.
                    // Let's use the property .claims.auth_time if available or handle parsing safely.
                    // Actually, tokenResult.authTime is a string "UTC date string".

                    const now = Date.now() / 1000;
                    const sessionDuration = 24 * 60 * 60; // 24 Hours

                    // Note: Date.parse(tokenResult.authTime) might work, but claims.auth_time is safer numerical timestamp
                    const issuedAtTime = tokenResult.claims.auth_time ? Number(tokenResult.claims.auth_time) : (Date.parse(tokenResult.authTime) / 1000);

                    if (now - issuedAtTime > sessionDuration) {
                        console.log("Session expired. Logging out.");
                        await signOut(auth);
                        setUser(null);
                        setLoading(false);
                        return;
                    }
                } catch (e) {
                    console.error("Error checking session age:", e);
                }
            }
            setUser(currentUser);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return { user, loading };
}
