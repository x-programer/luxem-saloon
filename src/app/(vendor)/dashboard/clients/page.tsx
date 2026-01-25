"use client";

import { useAuth } from "@/lib/auth-context";
import { useEffect, useState } from "react";
import { Search, Users, Smartphone, Mail, ArrowRight, RefreshCw, Clock, Trash2 } from "lucide-react";
import { ClientDetailsSheet } from "@/components/dashboard/ClientDetailsSheet";
import { motion, AnimatePresence } from "framer-motion";
import { getAggregatedClients, ClientStats, deleteClientAction } from "@/app/actions/clients";
import { format } from "date-fns";
import { toast } from "sonner";
import { DeleteConfirmationModal } from "@/components/ui/DeleteConfirmationModal";

export default function ClientsPage() {
    const { user } = useAuth();
    const [clients, setClients] = useState<ClientStats[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedClient, setSelectedClient] = useState<ClientStats | null>(null);
    const [clientToDelete, setClientToDelete] = useState<ClientStats | null>(null);

    // Fetch Clients Logic
    const fetchClients = async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            const data = await getAggregatedClients(user.uid);
            setClients(data);
        } catch (error) {
            console.error("Failed to load clients", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchClients();
    }, [user]);

    // Search Filter
    const filteredClients = clients.filter(client =>
        client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.phone.includes(searchQuery) ||
        (client.email && client.email.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    // Helper to format client for Sheet
    const handleClientClick = (client: ClientStats) => {
        // We no longer need to convert timestamps because ClientStats uses ISO strings
        // and ClientDetailsSheet is updated to handle ClientStats type directly.
        setSelectedClient(client);
    };

    // Generate Initials Color
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .substring(0, 2)
            .toUpperCase();
    };

    const handleDeleteClick = (e: React.MouseEvent, client: ClientStats) => {
        e.stopPropagation();
        setClientToDelete(client);
    };

    const handleConfirmDelete = async () => {
        if (!user || !clientToDelete) return;

        const appointmentIds = clientToDelete.history.map(h => h.id);
        const result = await deleteClientAction(user.uid, appointmentIds);

        if (result.success) {
            toast.success("Client profile removed successfully");
            // Optimistic update or refresh
            setClients(prev => prev.filter(c => c.id !== clientToDelete.id));
            setClientToDelete(null);
        } else {
            toast.error("Failed to delete client data");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 p-4 md:p-8 space-y-8 pb-32">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
                        Client List
                        <span className="px-3 py-1 rounded-full bg-violet-100 text-violet-700 text-sm font-bold border border-violet-200">
                            {clients.length}
                        </span>
                    </h1>
                    <p className="text-gray-500 mt-2 text-sm font-medium">
                        Your auto-generated customer database.
                    </p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    {/* Search Bar */}
                    <div className="relative w-full md:w-80 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-violet-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search name, phone..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all shadow-sm"
                        />
                    </div>
                    {/* Refresh Button */}
                    <button
                        onClick={fetchClients}
                        className="p-3 rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-all shadow-sm"
                        title="Refresh List"
                    >
                        <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Content */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="h-48 rounded-xl bg-gray-200 animate-pulse border border-gray-200" />
                    ))}
                </div>
            ) : filteredClients.length === 0 ? (
                /* Empty State */
                <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-16 text-center max-w-2xl mx-auto mt-10 shadow-sm">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-gray-100 relative">
                        <Users className="w-10 h-10 text-gray-300" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No clients found yet</h3>
                    <p className="text-gray-500 text-sm leading-relaxed max-w-sm mx-auto">
                        {searchQuery
                            ? `No results for "${searchQuery}". Try checking your spelling.`
                            : "Once you create manual bookings or receive online appointments, your client list will appear here automatically."}
                    </p>
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery("")}
                            className="mt-6 px-6 py-2 rounded-full bg-violet-600 text-white font-bold text-sm hover:bg-violet-700 transition-colors shadow-sm"
                        >
                            Clear Search
                        </button>
                    )}
                </div>
            ) : (
                /* Clients Grid */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredClients.map((client) => {
                        const lastSeenDate = new Date(client.lastVisit);
                        return (
                            <motion.div
                                key={client.id}
                                whileHover={{ y: -4 }}
                                onClick={() => handleClientClick(client)}
                                className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-violet-100 transition-all text-left group relative overflow-hidden w-full cursor-pointer"
                            >
                                <div className="flex items-start gap-5 mb-5">
                                    {/* Avatar */}
                                    <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-violet-100 to-fuchsia-100 border border-white flex items-center justify-center text-violet-600 font-bold text-lg shrink-0 shadow-sm group-hover:scale-105 transition-transform duration-300">
                                        {getInitials(client.name)}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0 py-0.5">
                                        <h3 className="font-bold text-lg text-gray-900 truncate group-hover:text-violet-600 transition-colors">
                                            {client.name}
                                        </h3>

                                        <div className="flex flex-col gap-1 mt-1.5">
                                            {client.phone && client.phone !== 'N/A' ? (
                                                <div className="flex items-center gap-2 text-gray-500 text-sm">
                                                    <Smartphone className="w-3.5 h-3.5" />
                                                    <span className="truncate">{client.phone}</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 text-gray-400 text-sm italic">
                                                    <Smartphone className="w-3.5 h-3.5" />
                                                    <span>No Phone</span>
                                                </div>
                                            )}

                                            {client.email && (
                                                <div className="flex items-center gap-2 text-gray-500 text-sm">
                                                    <Mail className="w-3.5 h-3.5" />
                                                    <span className="truncate">{client.email}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Stats Bar */}
                                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                    <div className="flex items-center gap-2">
                                        <span className="px-2.5 py-1 bg-violet-50 rounded-lg text-xs font-semibold text-violet-700 border border-violet-100">
                                            {client.visitCount} Visits
                                        </span>
                                        <span className="text-gray-300 text-xs">•</span>
                                        <span className="text-gray-700 text-xs font-bold">
                                            ${client.totalSpend}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-1.5 text-gray-400 text-xs">
                                        <Clock className="w-3 h-3" />
                                        {format(lastSeenDate, 'MMM d')}
                                    </div>
                                </div>

                                <button
                                    onClick={(e) => handleDeleteClick(e, client)}
                                    className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-all z-10 p-2 hover:bg-red-50 rounded-lg"
                                    title="Delete Client"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>

                                <div className="absolute bottom-4 right-4 text-violet-400 opacity-50 group-hover:opacity-100 transition-all">
                                    <ArrowRight className="w-5 h-5" />
                                </div>

                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* Details Sheet - Pass mapped client */}
            <ClientDetailsSheet
                isOpen={!!selectedClient}
                onClose={() => setSelectedClient(null)}
                client={selectedClient}
                vendorUid={user?.uid || ""}
            />

            <DeleteConfirmationModal
                isOpen={!!clientToDelete}
                onClose={() => setClientToDelete(null)}
                onConfirm={handleConfirmDelete}
                title="Delete Client?"
                message="Are you sure you want to remove this client? This will permanently delete their profile and all appointment history."
                itemName={clientToDelete?.name}
            />
        </div>
    );
}