"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase/config"; // Client SDK
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, writeBatch } from "firebase/firestore";
import { useAuth } from "@/lib/auth-context";

export interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    read: boolean;
    createdAt: any; // Firestore Timestamp or Date
    link?: string;
}

export function useNotifications() {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setNotifications([]);
            setLoading(false);
            return;
        }

        const q = query(
            collection(db, "users", user.uid, "notifications"),
            orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const items = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Notification[];
            setNotifications(items);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const unreadCount = notifications.filter(n => !n.read).length;

    const markAsRead = async (id: string) => {
        if (!user) return;
        try {
            const ref = doc(db, "users", user.uid, "notifications", id);
            await updateDoc(ref, { read: true });
        } catch (error) {
            console.error("Error marking notification as read:", error);
        }
    };

    const removeNotification = async (id: string) => {
        if (!user) return;
        try {
            const ref = doc(db, "users", user.uid, "notifications", id);
            await deleteDoc(ref);
        } catch (error) {
            console.error("Error removing notification:", error);
        }
    };

    const clearAll = async () => {
        if (!user || notifications.length === 0) return;
        try {
            const batch = writeBatch(db);
            notifications.forEach(n => {
                const ref = doc(db, "users", user.uid, "notifications", n.id);
                batch.delete(ref);
            });
            await batch.commit();
        } catch (error) {
            console.error("Error clearing notifications:", error);
        }
    };

    return {
        notifications,
        unreadCount,
        loading,
        markAsRead,
        removeNotification,
        clearAll
    };
}
