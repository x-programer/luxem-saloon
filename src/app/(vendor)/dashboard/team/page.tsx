"use client";

import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase/config";
import { collection, onSnapshot, addDoc, deleteDoc, doc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { ImageUploader } from "@/components/dashboard/ImageUploader";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { DeleteConfirmationModal } from "@/components/ui/DeleteConfirmationModal";

export default function TeamPage() {
    const { user } = useAuth();
    const [staff, setStaff] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Delete Modal State
    const [staffToDelete, setStaffToDelete] = useState<any>(null);

    // Add Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [name, setName] = useState("");
    const [role, setRole] = useState("");
    const [specialties, setSpecialties] = useState("");
    const [photo, setPhoto] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!user) return;
        const unsubscribe = onSnapshot(collection(db, "users", user.uid, "staff"), (snap) => {
            setStaff(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            setLoading(false);
        });
        return () => unsubscribe();
    }, [user]);

    const handleAddStaff = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setIsSubmitting(true);
        try {
            await addDoc(collection(db, "users", user.uid, "staff"), {
                name,
                role,
                specialties: specialties.split(',').map(s => s.trim()).filter(Boolean),
                photo,
                createdAt: new Date()
            });
            toast.success("Staff member added");
            setIsModalOpen(false);
            resetForm();
        } catch (error) {
            console.error(error);
            toast.error("Failed to add staff");
        }
        setIsSubmitting(false);
    };

    const handleDeleteClick = (staffMember: any) => {
        setStaffToDelete(staffMember);
    };

    const handleConfirmDelete = async () => {
        if (!user || !staffToDelete) return;

        await deleteDoc(doc(db, "users", user.uid, "staff", staffToDelete.id));
        toast.success("Staff member removed successfully");
        setStaffToDelete(null);
    };

    const resetForm = () => {
        setName("");
        setRole("");
        setSpecialties("");
        setPhoto("");
    };

    if (loading) return <div>Loading team...</div>;

    return (
        <div className="space-y-8 min-h-screen pb-20">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">My Team</h1>
                    <p className="text-gray-500 mt-1">Showcase your talented stylists.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-[#6F2DBD] text-white px-4 py-2 rounded-xl font-bold hover:bg-[#5a2499] transition-all shadow-lg hover:shadow-[#6F2DBD]/30"
                >
                    <Plus className="w-5 h-5" /> Add Member
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {staff.map((member) => (
                    <div key={member.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative group text-center hover:shadow-md transition-shadow">
                        <button
                            onClick={() => handleDeleteClick(member)}
                            className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>

                        <div className="w-24 h-24 mx-auto rounded-full bg-gray-100 overflow-hidden mb-4 border-2 border-white shadow-lg">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={member.photo || "https://source.unsplash.com/random/200x200/?face"} alt={member.name} className="w-full h-full object-cover" />
                        </div>

                        <h3 className="font-bold text-lg text-gray-900">{member.name}</h3>
                        <p className="text-[#6F2DBD] text-xs font-bold uppercase tracking-wider mb-2">{member.role}</p>

                        <div className="flex flex-wrap gap-1 justify-center">
                            {member.specialties?.map((s: string, i: number) => (
                                <span key={i} className="text-[10px] bg-gray-50 px-2 py-1 rounded-full text-gray-500 border border-gray-100">{s}</span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Add Staff Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                            onClick={() => setIsModalOpen(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            className="relative bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl"
                        >
                            <h2 className="text-2xl font-bold mb-6">Add Team Member</h2>
                            <form onSubmit={handleAddStaff} className="space-y-6">
                                <div className="flex justify-center">
                                    <ImageUploader
                                        directory="staff"
                                        onUpload={(url) => setPhoto(url)}
                                        onRemove={() => setPhoto("")}
                                        currentImage={photo}
                                        variant="circle"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700">Name</label>
                                        <input required value={name} onChange={e => setName(e.target.value)} className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#6F2DBD] outline-none" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700">Role</label>
                                        <input required value={role} onChange={e => setRole(e.target.value)} placeholder="e.g. Senior Stylist" className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#6F2DBD] outline-none" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700">Specialties (comma separated)</label>
                                    <input value={specialties} onChange={e => setSpecialties(e.target.value)} placeholder="e.g. Color, Cuts, Bridal" className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#6F2DBD] outline-none" />
                                </div>

                                <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-[#6F2DBD] text-white rounded-xl font-bold hover:bg-[#5a2499] transition-colors">
                                    {isSubmitting ? "Adding..." : "Add Member"}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <DeleteConfirmationModal
                isOpen={!!staffToDelete}
                onClose={() => setStaffToDelete(null)}
                onConfirm={handleConfirmDelete}
                title="Remove Team Member?"
                message="Are you sure you want to remove this staff member? They will no longer be visible on your booking page."
                itemName={staffToDelete?.name}
            />
        </div>
    );
}
