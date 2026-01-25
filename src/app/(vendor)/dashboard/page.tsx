"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
    LayoutDashboard, Scissors, Calendar, Users, ShoppingBag,
    Star, Image as ImageIcon, Briefcase, Eye, DollarSign,
    AlertTriangle, X, LogOut, Search, Bell, ExternalLink,
    Store, Menu, Settings, Plus
} from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

// --- Components ---

const SidebarItem = ({ icon: Icon, label, isActive, onClick }: any) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden ${isActive
            ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20"
            : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
            }`}
    >
        <Icon className={`w-5 h-5 ${isActive ? "text-white" : "text-slate-400 group-hover:text-slate-900"}`} />
        <span className="font-medium text-sm">{label}</span>
    </button>
);

const StatsCard = ({ icon: Icon, label, value, trend, colorClass }: any) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-all duration-200">
        <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl ${colorClass.bg}`}>
                <Icon className={`w-6 h-6 ${colorClass.text}`} />
            </div>
            {trend && (
                <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-1 rounded-full">
                    {trend}
                </span>
            )}
        </div>
        <div className="text-3xl font-bold text-slate-900">{value}</div>
        <div className="text-sm text-slate-500 mt-1 font-medium">{label}</div>
    </div>
);

export default function VendorDashboardPage() {
    const { user, role, loading, logout } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const impersonateId = searchParams.get('impersonate');

    // Layout State
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Data State
    const [viewedUser, setViewedUser] = useState<any>(null);
    const [isImpersonating, setIsImpersonating] = useState(false);
    const [dataLoading, setDataLoading] = useState(true);

    // --- 1. Access Control & "God Mode" Logic ---
    useEffect(() => {
        const initDashboard = async () => {
            if (loading) return;

            if (!user) {
                router.push('/login');
                return;
            }

            setDataLoading(true);

            // Admin Impersonation
            if (role === 'admin' && impersonateId) {
                setIsImpersonating(true);
                try {
                    const targetDoc = await getDoc(doc(db, "users", impersonateId));
                    if (targetDoc.exists()) {
                        setViewedUser({ uid: targetDoc.id, ...targetDoc.data() });
                    } else {
                        console.error("Target user not found");
                        setViewedUser({ displayName: "Unknown User" });
                    }
                } catch (err) {
                    console.error("Error fetching target", err);
                }
            }
            // Access Check
            else if (role !== 'vendor' && role !== 'admin') {
                router.push('/my-bookings');
                return;
            }
            // Normal Vendor View
            else {
                setViewedUser(user);
            }
            setDataLoading(false);
        };

        initDashboard();
    }, [user, role, loading, impersonateId, router]);

    const handleLogout = async () => {
        try {
            await logout();
            router.push('/login');
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    if (loading || dataLoading || !viewedUser) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
                    <p className="text-sm text-slate-500 animate-pulse">Loading Workspace...</p>
                </div>
            </div>
        );
    }

    // --- 2. Render Content based on Tab ---
    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return (
                    <div className="space-y-8 animate-in fade-in duration-500">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Overview</h1>
                            <p className="text-slate-500">Welcome back, {viewedUser.businessName || viewedUser.displayName || 'Partner'}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <StatsCard
                                icon={Calendar}
                                label="Total Bookings"
                                value={viewedUser.stats?.totalBookings || '0'}
                                trend={viewedUser.stats?.totalBookings > 0 ? "+12%" : null}
                                colorClass={{ bg: 'bg-purple-50', text: 'text-purple-600' }}
                            />
                            <StatsCard
                                icon={DollarSign}
                                label="Total Revenue"
                                value={`$${viewedUser.stats?.totalRevenue?.toLocaleString() || '0.00'}`}
                                trend={viewedUser.stats?.totalRevenue > 0 ? "+8%" : null}
                                colorClass={{ bg: 'bg-blue-50', text: 'text-blue-600' }}
                            />
                            <StatsCard
                                icon={Eye}
                                label="Profile Views"
                                value={viewedUser.stats?.views || '0'}
                                trend="+24%"
                                colorClass={{ bg: 'bg-indigo-50', text: 'text-indigo-600' }}
                            />
                        </div>

                        {/* Recent Activity */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center min-h-[400px] flex flex-col items-center justify-center">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                <Calendar className="w-8 h-8 text-slate-300" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">No recent activity</h3>
                            <p className="text-slate-500 max-w-sm mt-2">
                                Your recent bookings will appear here once customers start scheduling appointments.
                            </p>
                        </div>
                    </div>
                );
            case 'services':
                // ✅ SERVICES TAB
                return (
                    <div className="bg-white p-12 rounded-2xl border border-slate-200 shadow-sm text-center min-h-[60vh] flex flex-col items-center justify-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-6">
                            <Scissors className="w-10 h-10" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900">Services Menu</h2>
                        <p className="text-slate-500 mt-2 max-w-md mx-auto">
                            Manage your service list, pricing, and durations here.
                        </p>
                        <button className="mt-8 flex items-center gap-2 px-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 active:scale-95">
                            <Plus className="w-5 h-5" />
                            Add Your First Service
                        </button>
                    </div>
                );
            case 'bookings':
                // ✅ BOOKINGS TAB
                return (
                    <div className="bg-white p-12 rounded-2xl border border-slate-200 shadow-sm text-center min-h-[60vh] flex flex-col items-center justify-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="w-20 h-20 bg-purple-50 text-purple-500 rounded-full flex items-center justify-center mb-6">
                            <Calendar className="w-10 h-10" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900">Bookings Calendar</h2>
                        <p className="text-slate-500 mt-2 max-w-md mx-auto">
                            View upcoming appointments and manage your schedule.
                        </p>
                        <div className="mt-8 flex gap-3">
                            <button className="px-6 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors">
                                Sync Google Calendar
                            </button>
                            <button className="px-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors shadow-lg">
                                + New Appointment
                            </button>
                        </div>
                    </div>
                );
            case 'settings':
                // ✅ SETTINGS TAB (RESTORED)
                return (
                    <div className="space-y-6 animate-in fade-in duration-500">
                        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                            <h2 className="text-xl font-bold text-slate-900 mb-6">Business Settings</h2>
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Business Name</label>
                                        <input type="text" className="w-full p-3 rounded-lg border border-slate-200 bg-slate-50" placeholder="Luxe Salon" defaultValue={viewedUser.businessName} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Phone Number</label>
                                        <input type="text" className="w-full p-3 rounded-lg border border-slate-200 bg-slate-50" placeholder="+1 234 567 890" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Bio / Description</label>
                                    <textarea className="w-full p-3 rounded-lg border border-slate-200 bg-slate-50 h-32" placeholder="Tell customers about your salon..." />
                                </div>
                                <div className="pt-4">
                                    <button className="px-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all">
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            default:
                return (
                    <div className="flex flex-col items-center justify-center h-[60vh] text-center animate-in fade-in zoom-in-95 duration-300">
                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                            <Briefcase className="w-10 h-10 text-slate-400" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 capitalize">{activeTab}</h2>
                        <p className="text-slate-500 mt-2 max-w-md">
                            This feature is currently under development.
                        </p>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900 relative">

            {/* MOBILE OVERLAY */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* SIDEBAR */}
            <aside className={`
                fixed top-0 left-0 h-screen w-64 bg-white border-r border-slate-200 z-50 flex flex-col transition-transform duration-300 ease-in-out
                ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0
            `}>
                {/* Logo */}
                <div className="h-20 flex items-center px-6 border-b border-slate-50 justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-md">
                            L
                        </div>
                        <span className="font-bold text-slate-900 text-lg tracking-tight">Luxe<span className="text-slate-400 font-normal">Salon</span></span>
                    </div>
                    <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden p-1 text-slate-400">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Live Shop Button */}
                <div className="px-4 pt-6 pb-2">
                    <button
                        onClick={() => window.open(`/shop/${viewedUser.uid}`, '_blank')}
                        className="w-full flex items-center justify-between px-4 py-3 bg-purple-50 text-purple-700 rounded-xl font-bold text-sm hover:bg-purple-100 transition-colors border border-purple-100"
                    >
                        <div className="flex items-center gap-2">
                            <Store className="w-4 h-4" />
                            Live Shop
                        </div>
                        <ExternalLink className="w-3 h-3 opacity-50" />
                    </button>
                </div>

                {/* Nav Items */}
                <div className="flex-1 px-4 py-4 space-y-1 overflow-y-auto custom-scrollbar">
                    <SidebarItem icon={LayoutDashboard} label="Dashboard" isActive={activeTab === 'dashboard'} onClick={() => { setActiveTab('dashboard'); setIsMobileMenuOpen(false); }} />
                    <SidebarItem icon={Scissors} label="Services" isActive={activeTab === 'services'} onClick={() => { setActiveTab('services'); setIsMobileMenuOpen(false); }} />
                    <SidebarItem icon={Calendar} label="Bookings" isActive={activeTab === 'bookings'} onClick={() => { setActiveTab('bookings'); setIsMobileMenuOpen(false); }} />
                    <SidebarItem icon={Users} label="Clients" isActive={activeTab === 'clients'} onClick={() => { setActiveTab('clients'); setIsMobileMenuOpen(false); }} />
                    <SidebarItem icon={Briefcase} label="My Team" isActive={activeTab === 'team'} onClick={() => { setActiveTab('team'); setIsMobileMenuOpen(false); }} />
                    <SidebarItem icon={ShoppingBag} label="Products" isActive={activeTab === 'products'} onClick={() => { setActiveTab('products'); setIsMobileMenuOpen(false); }} />
                    <SidebarItem icon={Settings} label="Settings" isActive={activeTab === 'settings'} onClick={() => { setActiveTab('settings'); setIsMobileMenuOpen(false); }} />
                </div>

                {/* Profile / Logout */}
                <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-3 p-2 mb-2">
                        <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold border-2 border-white shadow-sm">
                            {(viewedUser?.displayName?.[0] || 'V').toUpperCase()}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <div className="text-xs font-bold text-slate-900 truncate">{viewedUser?.displayName || 'Vendor'}</div>
                            <div className="text-[10px] text-slate-500 truncate uppercase tracking-wider font-semibold">Vendor Account</div>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 py-2 text-xs font-bold text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <LogOut className="w-3 h-3" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-1 md:ml-64 min-h-screen flex flex-col transition-all duration-300">
                {/* Header */}
                <header className="h-16 bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-40 px-4 md:px-8 flex items-center justify-between">
                    <button
                        className="md:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                        onClick={() => setIsMobileMenuOpen(true)}
                    >
                        <Menu className="w-6 h-6" />
                    </button>

                    <div className="hidden md:block relative w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                            placeholder="Search bookings, clients..."
                            className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-full text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-slate-400"
                        />
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full relative transition-colors">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>
                    </div>
                </header>

                {/* Admin Banner */}
                {isImpersonating && (
                    <div className="bg-amber-100 border-b border-amber-200 px-4 md:px-8 py-3 flex flex-col md:flex-row items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-amber-900 text-sm font-bold">
                            <AlertTriangle className="w-4 h-4" />
                            Viewing Dashboard as {viewedUser?.displayName} (Admin Mode)
                        </div>
                        <button
                            onClick={() => router.push('/admin/users')}
                            className="text-xs bg-white/50 hover:bg-white text-amber-900 px-3 py-1 rounded-md font-bold transition-colors shadow-sm"
                        >
                            Exit View
                        </button>
                    </div>
                )}

                {/* Dynamic Content */}
                <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
                    {renderContent()}
                </div>
            </main>
        </div>
    );
}