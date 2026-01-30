"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getAllSupportTickets, resolveTicket, SupportTicketData } from "@/app/actions/support";
import { toast } from "sonner";
import { Eye, CheckCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminSupportPage() {
    const router = useRouter();
    const [tickets, setTickets] = useState<SupportTicketData[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchTickets = async () => {
        setLoading(true);
        const res = await getAllSupportTickets();
        if (res.success && res.data) {
            setTickets(res.data);
        } else {
            toast.error("Failed to fetch tickets");
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    const handleResolve = async (id: string) => {
        const res = await resolveTicket(id);
        if (res.success) {
            toast.success("Ticket resolved");
            // Optimistic update
            setTickets(prev => prev.map(t => t.uid === id ? { ...t, status: "resolved" } : t));
        } else {
            toast.error("Failed to resolve ticket");
        }
    };

    const handleInvestigate = (vendorId: string) => {
        window.open(`/dashboard?viewAs=${vendorId}`, '_blank');
        toast.info("Opening Vendor Dashboard...");
    };

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-6">Support Tickets</h1>

            <div className="rounded-md border bg-white shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50">
                            <TableHead>Status</TableHead>
                            <TableHead>Vendor</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Subject</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" />
                                </TableCell>
                            </TableRow>
                        ) : tickets.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-gray-500">
                                    No support tickets found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            tickets.map((ticket) => (
                                <TableRow key={ticket.uid}>
                                    <TableCell>
                                        <Badge
                                            variant={ticket.status === 'resolved' ? 'secondary' : 'default'}
                                            className={
                                                ticket.status === 'resolved' ? "bg-gray-100 text-gray-600 hover:bg-gray-200" :
                                                    ticket.status === 'open' ? "bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200" : ""
                                            }
                                        >
                                            {ticket.status.toUpperCase()}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <div className="font-bold">{ticket.vendorName}</div>
                                            <div className="text-xs text-gray-500">{ticket.vendorEmail}</div>
                                        </div>
                                    </TableCell>
                                    <TableCell>{ticket.category}</TableCell>
                                    <TableCell>
                                        <div className="max-w-xs truncate" title={ticket.message}>
                                            <span className="font-medium block">{ticket.subject}</span>
                                            <span className="text-xs text-gray-500">{ticket.message}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-sm text-gray-500">
                                        {ticket.createdAt ? format(new Date(ticket.createdAt), "MMM d, yyyy") : "N/A"}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleInvestigate(ticket.vendorId)}
                                                className="h-8 gap-1"
                                            >
                                                <Eye className="w-4 h-4" /> Investigate
                                            </Button>

                                            {ticket.status !== 'resolved' && (
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                                                    onClick={() => ticket.uid && handleResolve(ticket.uid)}
                                                    title="Mark Resolved"
                                                >
                                                    <CheckCircle className="w-5 h-5" />
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
