"use client";

import { useState } from "react";
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
    createColumnHelper,
    getPaginationRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    SortingState,
} from "@tanstack/react-table";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { toast } from "sonner";
import { MoreHorizontal, ShieldAlert, ShieldCheck, Ban, EyeOff, BadgeCheck, LogIn, Edit2, Check, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

type UserStatus = 'active' | 'shadow_banned' | 'suspended' | 'pending_verification';

interface UserData {
    uid: string;
    email: string;
    displayName?: string;
    photoUrl?: string; // or photoURL
    role: 'vendor' | 'client' | 'admin';
    platformStatus: UserStatus;
    isVerified?: boolean;
    platformFeePercent?: number;
    createdAt?: any; // Timestamp
    stats?: {
        totalBookings?: number;
        totalSpent?: number; // for clients
        totalRevenue?: number; // for vendors
    };
}

const columnHelper = createColumnHelper<UserData>();

export function AdminUserTable({ data }: { data: UserData[] }) {
    const router = useRouter();
    const [sorting, setSorting] = useState<SortingState>([]);
    const [loadingId, setLoadingId] = useState<string | null>(null);
    const [editingFeeId, setEditingFeeId] = useState<string | null>(null);

    // Status Update Handler
    const handleStatusChange = async (uid: string, newStatus: UserStatus) => {
        setLoadingId(uid);
        try {
            await updateDoc(doc(db, "users", uid), {
                platformStatus: newStatus
            });
            toast.success(`User status updated to ${newStatus}`);
        } catch (error) {
            console.error("Failed to update status", error);
            toast.error("Failed to update status");
        } finally {
            setLoadingId(null);
        }
    };

    // Verify Handler
    const handleVerify = async (uid: string, currentStatus: boolean) => {
        setLoadingId(uid);
        try {
            await updateDoc(doc(db, "users", uid), {
                isVerified: !currentStatus
            });
            toast.success(`User ${!currentStatus ? 'verified' : 'unverified'}`);
        } catch (error) {
            console.error("Failed to update verification", error);
            toast.error("Failed to update verification");
        } finally {
            setLoadingId(null);
        }
    };

    // Impersonation Handler
    const handleImpersonate = (uid: string) => {
        router.push(`/dashboard?impersonate=${uid}`);
        toast.success("Impersonation mode activated");
    };

    // Commission Update Handler
    const handleCommissionUpdate = async (uid: string, newFee: string) => {
        const fee = parseFloat(newFee);
        if (isNaN(fee) || fee < 0 || fee > 100) {
            toast.error("Invalid percentage");
            return;
        }

        try {
            await updateDoc(doc(db, "users", uid), {
                platformFeePercent: fee
            });
            toast.success("Commission rate updated");
            setEditingFeeId(null);
        } catch (error) {
            console.error("Failed to update commission", error);
            toast.error("Failed to update commission");
        }
    };

    const columns = [
        columnHelper.accessor("uid", {
            header: "User",
            cell: (info) => {
                const user = info.row.original;
                return (
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden relative border border-gray-200">
                            {user.photoUrl ? (
                                <Image
                                    src={user.photoUrl}
                                    alt={user.displayName || "User"}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-xs">
                                    {(user.displayName || user.email || "?").substring(0, 2).toUpperCase()}
                                </div>
                            )}
                        </div>
                        <div>
                            <div className="font-medium text-gray-900 flex items-center gap-1">
                                {user.displayName || "Unknown User"}
                                {user.isVerified && (
                                    <BadgeCheck className="w-4 h-4 text-blue-500 fill-blue-50" />
                                )}
                            </div>
                            <div className="text-xs text-gray-500">{user.email}</div>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider
                            ${user.role === 'vendor' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}
                        `}>
                            {user.role}
                        </span>
                    </div>
                );
            },
        }),
        columnHelper.accessor("stats", {
            header: "Commercial",
            cell: (info) => {
                const user = info.row.original;
                const stats = user.stats || {};

                if (user.role !== 'vendor') {
                    return (
                        <div className="text-sm">
                            <div className="font-medium text-gray-700">Spent: ${stats.totalSpent?.toLocaleString() || 0}</div>
                            <div className="text-xs text-gray-400">{stats.totalBookings || 0} Bookings</div>
                        </div>
                    );
                }

                // Vendor specific view with commission logic
                const commission = user.platformFeePercent ?? 10; // default 10%
                const isEditing = editingFeeId === user.uid;

                return (
                    <div className="text-sm">
                        <div className="font-medium text-gray-700">Rev: ${stats.totalRevenue?.toLocaleString() || 0}</div>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-400">Fee:</span>
                            {isEditing ? (
                                <input
                                    autoFocus
                                    className="w-12 px-1 py-0.5 text-xs border rounded"
                                    defaultValue={commission}
                                    onBlur={() => setEditingFeeId(null)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleCommissionUpdate(user.uid, e.currentTarget.value);
                                        if (e.key === 'Escape') setEditingFeeId(null);
                                    }}
                                />
                            ) : (
                                <button
                                    onClick={() => setEditingFeeId(user.uid)}
                                    className="text-xs font-bold bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded hover:bg-gray-200 flex items-center gap-1"
                                >
                                    {commission}% <Edit2 className="w-2.5 h-2.5" />
                                </button>
                            )}
                        </div>
                    </div>
                );
            },
        }),
        columnHelper.accessor("createdAt", {
            header: "Joined",
            cell: (info) => {
                const date = info.getValue(); // Firestore Timestamp usually
                // Handle Firestore timestamp or ISO string
                const dateObj = date?.toDate ? date.toDate() : new Date(date || Date.now());
                return (
                    <span className="text-sm text-gray-500">
                        {dateObj.toLocaleDateString()}
                    </span>
                );
            }
        }),
        columnHelper.accessor("platformStatus", {
            header: "Status",
            cell: (info) => {
                const status = info.getValue() as UserStatus;
                const uid = info.row.original.uid;
                const isLoading = loadingId === uid;

                return (
                    <div className="relative group">
                        <select
                            disabled={isLoading}
                            value={status}
                            onChange={(e) => handleStatusChange(uid, e.target.value as UserStatus)}
                            className={`
                                appearance-none pl-8 pr-8 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider cursor-pointer transition-all border
                                focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-200
                                ${status === 'active' ? 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200' : ''}
                                ${status === 'shadow_banned' ? 'bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-200' : ''}
                                ${status === 'suspended' ? 'bg-red-100 text-red-700 border-red-200 hover:bg-red-200' : ''}
                                ${status === 'pending_verification' ? 'bg-gray-100 text-gray-700 border-gray-200' : ''}
                                ${isLoading ? 'opacity-50 cursor-wait' : ''}
                            `}
                        >
                            <option value="active">Active</option>
                            <option value="shadow_banned">Shadow Block</option>
                            <option value="suspended">Suspended</option>
                            <option value="pending_verification">Pending</option>
                        </select>

                        {/* Icon Overlay */}
                        <div className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                            {status === 'active' && <ShieldCheck className="w-3.5 h-3.5 text-green-600" />}
                            {status === 'shadow_banned' && <EyeOff className="w-3.5 h-3.5 text-yellow-600" />}
                            {status === 'suspended' && <Ban className="w-3.5 h-3.5 text-red-600" />}
                            {status === 'pending_verification' && <MoreHorizontal className="w-3.5 h-3.5 text-gray-500" />}
                        </div>
                    </div>
                );
            },
        }),
        columnHelper.display({
            id: "actions",
            header: "Actions",
            cell: (info) => {
                const user = info.row.original;
                return (
                    <div className="flex items-center gap-2">
                        {/* Verify Button */}
                        {user.role === 'vendor' && (
                            <button
                                onClick={() => handleVerify(user.uid, user.isVerified || false)}
                                title={user.isVerified ? "Revoke Verification" : "Verify Vendor"}
                                className={`p-1.5 rounded-md transition-colors ${user.isVerified
                                    ? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                                    : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                                    }`}
                            >
                                <BadgeCheck className="w-4 h-4" />
                            </button>
                        )}

                        {/* Impersonate Button */}
                        <button
                            onClick={() => handleImpersonate(user.uid)}
                            title="Login as User"
                            className="p-1.5 rounded-md bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
                        >
                            <LogIn className="w-4 h-4" />
                        </button>
                    </div>
                );
            },
        }),
    ];

    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
        },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <tr key={headerGroup.id} className="bg-gray-50/50 border-b border-gray-200">
                                {headerGroup.headers.map((header) => (
                                    <th
                                        key={header.id}
                                        className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                                        onClick={header.column.getToggleSortingHandler()}
                                    >
                                        <div className="flex items-center gap-1">
                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                            {{
                                                asc: ' ↑',
                                                desc: ' ↓',
                                            }[header.column.getIsSorted() as string] ?? null}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {table.getRowModel().rows.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-400 italic">
                                    No users found.
                                </td>
                            </tr>
                        ) : (
                            table.getRowModel().rows.map((row) => (
                                <tr key={row.id} className="hover:bg-gray-50/50 transition-colors group">
                                    {row.getVisibleCells().map((cell) => (
                                        <td key={cell.id} className="px-6 py-4">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination / Footer */}
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/30">
                <div className="text-xs text-gray-500">
                    Showing {table.getRowModel().rows.length} of {data.length} users
                </div>
                <div className="flex gap-2">
                    <button
                        className="px-3 py-1 rounded border border-gray-200 bg-white text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        Previous
                    </button>
                    <button
                        className="px-3 py-1 rounded border border-gray-200 bg-white text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}
