"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { AdminUserTable } from "@/components/admin/AdminUserTable";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Loader2 } from "lucide-react";

export default function AdminUsersPage() {
    const { user, role, loading } = useAuth();
    const router = useRouter();
    const [users, setUsers] = useState<any[]>([]);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        if (!loading) {
            if (!user || role !== 'admin') {
                router.push('/dashboard'); // or /login
            } else {
                fetchUsers();
            }
        }
    }, [user, role, loading, router]);

    const fetchUsers = async () => {
        try {
            // Fetch all users
            // In production with 1000s of users, this should use pagination and server-side filtering
            const q = query(collection(db, "users"), orderBy('createdAt', 'desc'));
            const snapshot = await getDocs(q);
            const userData = snapshot.docs.map(doc => ({
                uid: doc.id,
                ...doc.data(),
                // normalize fields if needed
                platformStatus: doc.data().platformStatus || 'active'
            }));
            setUsers(userData);
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setFetching(false);
        }
    };

    if (loading || (role === 'admin' && fetching)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        );
    }

    if (role !== 'admin') return null; // blocked by effect

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">User Management</h1>
                        <p className="text-gray-500 mt-1">Manage vendor permissions, shadow bans, and suspensions.</p>
                    </div>
                    <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 text-sm font-medium text-gray-600">
                        Total Users: {users.length}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <div className="text-sm font-medium text-gray-500 mb-1">Active Vendors</div>
                        <div className="text-3xl font-bold text-gray-900">
                            {users.filter(u => u.role === 'vendor' && u.platformStatus === 'active').length}
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <div className="text-sm font-medium text-gray-500 mb-1">Shadow Banned</div>
                        <div className="text-3xl font-bold text-yellow-600">
                            {users.filter(u => u.platformStatus === 'shadow_banned').length}
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <div className="text-sm font-medium text-gray-500 mb-1">Suspended</div>
                        <div className="text-3xl font-bold text-red-600">
                            {users.filter(u => u.platformStatus === 'suspended').length}
                        </div>
                    </div>
                </div>

                <AdminUserTable data={users} />
            </div>
        </div>
    );
}
