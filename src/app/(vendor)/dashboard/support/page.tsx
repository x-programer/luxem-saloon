"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { getVendorTickets, deleteTicket, SupportTicketData } from "@/app/actions/support";
import { SupportModal } from "@/components/vendor/SupportModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, MessageCircle, AlertCircle, CheckCircle, Trash2, MoreVertical, Search, Filter, History } from "lucide-react";
import { toast } from "sonner";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";

export default function VendorSupportPage() {
    const { user, loading: authLoading } = useAuth();
    const [tickets, setTickets] = useState<SupportTicketData[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState<string>("all");

    // --- Data Fetching ---
    const fetchTickets = async () => {
        if (!user) return;
        setLoading(true);
        const res = await getVendorTickets(user.uid);
        if (res.success && res.data) { // Ensure res.data is defined
            setTickets(res.data);
        } else {
            toast.error("Failed to load tickets");
        }
        setLoading(false);
    };

    useEffect(() => {
        if (!authLoading && user) {
            fetchTickets();
        }
    }, [authLoading, user]);

    // --- Actions ---
    const handleDelete = async (ticketId: string) => {
        if (!user) return;
        if (!confirm("Are you sure you want to delete this ticket?")) return;

        // Optimistic Delete
        const originalTickets = [...tickets];
        setTickets(prev => prev.filter(t => t.uid !== ticketId));

        const res = await deleteTicket(ticketId, user.uid);
        if (!res.success) {
            setTickets(originalTickets); // Revert
            toast.error(res.error || "Failed to delete ticket");
        } else {
            toast.success("Ticket deleted");
        }
    };

    // --- Filtering ---
    const filteredTickets = tickets.filter(ticket => {
        const matchesSearch = ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ticket.message.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === "all" || ticket.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const stats = {
        total: tickets.length,
        open: tickets.filter(t => t.status === "open").length,
        resolved: tickets.filter(t => t.status === "resolved").length
    };

    if (authLoading) return null;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Help & Support</h1>
                    <p className="text-slate-500 mt-1">Track your support requests and get assistance.</p>
                </div>
                <Button onClick={() => setIsCreateOpen(true)} className="bg-luxe-primary hover:bg-luxe-primary/90 text-white shadow-lg shadow-luxe-primary/20 transition-all hover:scale-105">
                    <Plus className="w-4 h-4 mr-2" />
                    New Ticket
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                        <MessageCircle className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
                        <div className="text-sm text-slate-500 font-medium">Total Tickets</div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                        <AlertCircle className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-slate-900">{stats.open}</div>
                        <div className="text-sm text-slate-500 font-medium">Open Issues</div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                        <CheckCircle className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-slate-900">{stats.resolved}</div>
                        <div className="text-sm text-slate-500 font-medium">Resolved</div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search tickets..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-luxe-primary/20 bg-white"
                    />
                </div>
                <div className="relative w-full sm:w-48">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-luxe-primary/20 bg-white appearance-none cursor-pointer"
                    >
                        <option value="all">All Status</option>
                        <option value="open">Open</option>
                        <option value="resolved">Resolved</option>
                    </select>
                </div>
            </div>

            {/* Ticket List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="flex justify-center p-12">
                        <Loader2 className="w-8 h-8 animate-spin text-luxe-primary" />
                    </div>
                ) : filteredTickets.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                            <History className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">No tickets found</h3>
                        <p className="text-slate-500 max-w-sm mx-auto mt-2">
                            You haven't created any support tickets yet. Need help? Create a new ticket above.
                        </p>
                    </div>
                ) : (
                    <AnimatePresence mode="popLayout">
                        {filteredTickets.map((ticket) => (
                            <motion.div
                                key={ticket.uid}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden"
                            >
                                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-luxe-primary to-luxe-secondary opacity-0 group-hover:opacity-100 transition-opacity" />

                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-2">
                                            <Badge
                                                variant={ticket.status === 'resolved' ? 'secondary' : 'default'}
                                                className={
                                                    ticket.status === 'resolved'
                                                        ? "bg-green-100 text-green-700 hover:bg-green-100"
                                                        : "bg-blue-100 text-blue-700 hover:bg-blue-100"
                                                }
                                            >
                                                {ticket.status === 'resolved' ? (
                                                    <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Resolved</span>
                                                ) : (
                                                    <span className="flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Open</span>
                                                )}
                                            </Badge>
                                            <span className="text-xs text-slate-400 font-medium">#{ticket.uid?.slice(-6).toUpperCase()}</span>
                                            <span className="text-xs text-slate-400">•</span>
                                            <span className="text-xs text-slate-400">{ticket.category}</span>
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900 mb-1 leading-tight">{ticket.subject}</h3>
                                        <p className="text-slate-600 text-sm line-clamp-2 leading-relaxed">{ticket.message}</p>
                                        <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
                                            <span>Requested {ticket.createdAt ? formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true }) : "recently"}</span>
                                        </div>
                                    </div>

                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900">
                                                <MoreVertical className="w-4 h-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem className="text-red-600 focus:text-red-700" onClick={() => ticket.uid && handleDelete(ticket.uid)}>
                                                <Trash2 className="w-4 h-4 mr-2" />
                                                Delete Ticket
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>

            <SupportModal
                isOpen={isCreateOpen}
                onClose={() => {
                    setIsCreateOpen(false);
                    fetchTickets(); // Refresh list on close
                }}
                user={user}
            />
        </div>
    );
}
