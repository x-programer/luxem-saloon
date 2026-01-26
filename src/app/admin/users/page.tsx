"use client";

import { useEffect, useState } from "react";
import { useAuth, ADMIN_EMAIL } from "@/lib/auth-context";
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
    const [permissionDenied, setPermissionDenied] = useState(false);

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
        // STRICT SECURITY CHECK
        // Even if role is admin, ensure email matches HARDCODED admin email
        // This matches Firestore security rules: request.auth.token.email == 'ringtoneboy1530@gmail.com'
        if (user?.email !== ADMIN_EMAIL) {
            console.warn("Security Alert: Admin role present but email does not match allowlist.");
            setPermissionDenied(true);
            setFetching(false);
            return;
        }

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
        } catch (error: any) {
            console.error("Error fetching users:", error);
            // Handle permission denied from Firestore
            if (error.code === 'permission-denied' || error.message?.includes('Missing Permissions')) {
                setPermissionDenied(true);
            }
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

    if (permissionDenied) {
        return (
            <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
                <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg border border-red-100 text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
                    <p className="text-gray-600 mb-6">
                        You have the Admin role, but your email address ({user?.email}) is not authorized to view sensitive user data.
                    </p>
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
                    >
                        Return to Dashboard
                    </button>
                </div>
            </div>
        )
    }

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
