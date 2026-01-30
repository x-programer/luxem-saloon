"use client";

import { useEffect, useState } from "react";
import { useAuth, ADMIN_EMAIL } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { AdminUserTable } from "@/components/admin/AdminUserTable";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Loader2, Megaphone, Search, HelpCircle } from "lucide-react";
import { BroadcastModal } from "@/components/admin/BroadcastModal";

export default function AdminUsersPage() {
    const { user, role, loading } = useAuth();
    const router = useRouter();

    // Data State
    const [users, setUsers] = useState<any[]>([]);
    const [fetching, setFetching] = useState(true);
    const [permissionDenied, setPermissionDenied] = useState(false);

    // Filter State
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");

    // Modal State
    const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);

    useEffect(() => {
        if (!loading) {
            if (!user || role !== 'admin') {
                router.push('/dashboard');
            } else {
                fetchUsers();
            }
        }
    }, [user, role, loading, router]);

    const fetchUsers = async () => {
        if (user?.email !== ADMIN_EMAIL) {
            console.warn("Security Alert: Admin role present but email does not match allowlist.");
            setPermissionDenied(true);
            setFetching(false);
            return;
        }

        try {
            const q = query(collection(db, "users"), orderBy('createdAt', 'desc'));
            const snapshot = await getDocs(q);
            const userData = snapshot.docs.map(doc => ({
                uid: doc.id,
                ...doc.data(),
                platformStatus: doc.data().platformStatus || 'active'
            }));
            setUsers(userData);
        } catch (error: any) {
            console.error("Error fetching users:", error);
            if (error.code === 'permission-denied' || error.message?.includes('Missing Permissions')) {
                setPermissionDenied(true);
            }
        } finally {
            setFetching(false);
        }
    };

    // --- Client-Side Filtering ---
    const filteredUsers = users.filter(user => {
        // 1. Search (Name OR Email)
        const matchSearch = searchTerm === "" ||
            (user.displayName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (user.email?.toLowerCase().includes(searchTerm.toLowerCase()));

        // 2. Role
        const matchRole = roleFilter === "all" || user.role === roleFilter;

        // 3. Status
        const matchStatus = statusFilter === "all" || user.platformStatus === statusFilter;

        return matchSearch && matchRole && matchStatus;
    });

    if (loading || (role === 'admin' && fetching)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        );
    }

    if (role !== 'admin') return null;

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
                        Auth mismatch for {user?.email}
                    </p>
                    <button onClick={() => router.push('/dashboard')} className="btn-primary">Back</button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">User Management</h1>
                        <p className="text-gray-500 mt-1">Manage vendor permissions, shadow bans, and suspensions.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 text-sm font-medium text-gray-600">
                            Total Users: {users.length}
                        </div>
                        <button
                            onClick={() => setIsBroadcastOpen(true)}
                            className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg font-bold shadow-md shadow-violet-200 transition-all flex items-center gap-2"
                        >
                            <Megaphone className="w-4 h-4" />
                            Broadcast Alert
                        </button>
                        <button
                            onClick={() => router.push('/admin/support')}
                            className="bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg font-bold shadow-sm border border-gray-200 transition-all flex items-center gap-2"
                        >
                            <HelpCircle className="w-4 h-4" />
                            Support Tickets
                        </button>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

                {/* 🛠️ FILTER TOOLBAR 🛠️ */}
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                    {/* Search */}
                    <div className="flex-1 w-full relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by Name or Email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
                        />
                    </div>

                    {/* Role Filter */}
                    <div className="w-full md:w-48">
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-500/50 bg-white"
                        >
                            <option value="all">All Roles</option>
                            <option value="vendor">Vendors</option>
                            <option value="customer">Customers</option>
                            <option value="admin">Admins</option>
                        </select>
                    </div>

                    {/* Status Filter */}
                    <div className="w-full md:w-48">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-500/50 bg-white"
                        >
                            <option value="all">All Statuses</option>
                            <option value="active">Active</option>
                            <option value="suspended">Suspended</option>
                            <option value="shadow_banned">Shadow Banned</option>
                        </select>
                    </div>
                </div>

                {/* Table with Filtered Data */}
                <AdminUserTable data={filteredUsers} />

                {/* Broadcast Modal */}
                <BroadcastModal
                    isOpen={isBroadcastOpen}
                    onClose={() => setIsBroadcastOpen(false)}
                />
            </div>
        </div>
    );
}
