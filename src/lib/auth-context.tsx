"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
    onAuthStateChanged,
    User,
    signOut as firebaseSignOut
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase/config";
import { useRouter } from "next/navigation";

// Define the Admin Email
export const ADMIN_EMAIL = "ringtoneboy1530@gmail.com";

type UserRole = "admin" | "vendor" | null;

interface AuthContextType {
    user: User | null;
    role: UserRole;
    loading: boolean;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    role: null,
    loading: true,
    logout: async () => { },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [role, setRole] = useState<UserRole>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setLoading(true);
            if (currentUser) {
                // 1. Hardcoded Super Admin Check
                if (currentUser.email === ADMIN_EMAIL) {
                    setUser(currentUser);
                    setRole("admin");
                } else {
                    // 2. Fetch Role from Firestore for normal users
                    try {
                        const userDocRef = doc(db, "users", currentUser.uid);
                        const userDoc = await getDoc(userDocRef);

                        if (userDoc.exists()) {
                            const data = userDoc.data();

                            // CHECK SUSPENSION
                            if (data.platformStatus === 'suspended') {
                                await firebaseSignOut(auth);
                                setUser(null);
                                setRole(null);
                                alert("Your account has been suspended. Please contact support.");
                                setLoading(false);
                                return;
                            }

                            setUser(currentUser);
                            // Default to vendor if no role specified
                            setRole(data.role || "vendor");
                        } else {
                            // If doc doesn't exist yet (signup in progress), wait or default to vendor
                            setUser(currentUser);
                            setRole("vendor");
                        }
                    } catch (error) {
                        console.error("Error fetching user role:", error);
                        setUser(currentUser);
                        setRole("vendor");
                    }
                }
            } else {
                setUser(null);
                setRole(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const logout = async () => {
        await firebaseSignOut(auth);
        setUser(null);
        setRole(null);
        router.push("/login");
    };

    return (
        <AuthContext.Provider value={{ user, role, loading, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
