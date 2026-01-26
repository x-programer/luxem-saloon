"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase/config";
import { collection, query, where, orderBy, onSnapshot, Timestamp } from "firebase/firestore";

export interface Booking {
    id: string;
    vendorId: string;
    serviceName: string;
    price: number;
    date: string | Timestamp; // Can be either depending on where it comes from, but from Firestore it is Timestamp
    time: string;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'declined';
    createdAt: Timestamp;
    services?: any[];
}

export function useCustomerBookings(userId: string | undefined) {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!userId) {
            setLoading(false);
            return;
        }

        setLoading(true);

        const q = query(
            collection(db, 'bookings'), // 👈 UPDATED: Query Root Collection (Data now dual-written)
            where('customerId', '==', userId),
            orderBy('date', 'desc')
        );

        const unsubscribe = onSnapshot(q,
            (snapshot) => {
                const results: Booking[] = [];
                snapshot.forEach((doc) => {
                    results.push({ id: doc.id, ...doc.data() } as Booking);
                });
                setBookings(results);
                setLoading(false);
            },
            (err) => {
                console.error("Real-time sync error:", err);
                setError("Failed to sync bookings.");
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [userId]);

    return { bookings, loading, error };
}
