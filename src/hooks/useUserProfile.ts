"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase/config";
import { doc, onSnapshot } from "firebase/firestore";

export interface UserProfile {
    name?: string;
    phone?: string;
    email?: string;
    photoURL?: string;
}

export function useUserProfile(userId: string | undefined) {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!userId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        const docRef = doc(db, "users", userId);

        const unsubscribe = onSnapshot(docRef,
            (docSnap) => {
                if (docSnap.exists()) {
                    setProfile(docSnap.data() as UserProfile);
                } else {
                    setProfile(null);
                }
                setLoading(false);
            },
            (err) => {
                console.error("Profile sync error:", err);
                setError("Failed to sync profile.");
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [userId]);

    return { profile, loading, error };
}
