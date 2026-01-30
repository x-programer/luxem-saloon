"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { createSupportTicket, TicketCategory } from "@/app/actions/support";

interface SupportModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: any;
}

export function SupportModal({ isOpen, onClose, user }: SupportModalProps) {
    const [loading, setLoading] = useState(false);
    const [category, setCategory] = useState<TicketCategory>("Technical Issue");
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) {
            toast.error("You must be logged in.");
            return;
        }

        setLoading(true);

        try {
            const res = await createSupportTicket({
                vendorId: user.uid,
                vendorName: user.displayName || user.email?.split('@')[0] || "Vendor",
                vendorEmail: user.email || "",
                category,
                subject,
                message,
            });

            if (res.success) {
                toast.success("Support ticket created!");
                setSubject("");
                setMessage("");
                onClose();
            } else {
                toast.error("Failed to create ticket: " + res.error);
            }
        } catch (error) {
            console.error(error);
            toast.error("An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Contact Support</DialogTitle>
                    <DialogDescription>
                        Need help? Submit a ticket and our admin team will investigate.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Category</Label>
                        <Select value={category} onValueChange={(v) => setCategory(v as TicketCategory)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Technical Issue">Technical Issue</SelectItem>
                                <SelectItem value="Account">Account</SelectItem>
                                <SelectItem value="Billing">Billing</SelectItem>
                                <SelectItem value="Feature Request">Feature Request</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Subject</Label>
                        <Input
                            placeholder="Brief summary of the issue"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Message</Label>
                        <Textarea
                            placeholder="Describe your issue in detail..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="min-h-[120px]"
                            required
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Submit Ticket
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
