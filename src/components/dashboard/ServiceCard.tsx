"use client";

import { Clock, Edit2, Eye, Trash2 } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { toast } from "sonner";

interface ServiceCardProps {
    id: string;
    name: string;
    price: number;
    duration: number;
    category: string;
    description: string;
    onView?: () => void;
}

export function ServiceCard({ id, name, price, duration, category, description, onView }: ServiceCardProps) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this service?")) return;

        setIsDeleting(true);
        try {
            await deleteDoc(doc(db, "services", id)); // Note: Depending on your data structure, it might be services collection at root or nested. 
            // Based on ServiceForm, it writes to `services` root collection? 
            // Wait, looking at ServiceForm: `addDoc(collection(db, "services")` 
            // So it IS a root collection but with a `uid` field. 
            // Wait, the user request said `users/{uid}/services` in implementation plan but `collection(db, "services")` in actual code?
            // Let's check ServiceForm code I wrote.
            // "const docRef = await addDoc(collection(db, "services"), serviceData);" 
            // Okay, so it IS in a root collection "services". Correct.

            toast.success("Service deleted");
        } catch (error) {
            console.error("Error deleting service:", error);
            toast.error("Failed to delete service");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl p-5 shadow-soft border border-gray-100 hover:shadow-md transition-all group relative overflow-hidden">
            {/* Hover Gradient Overlay */}
            <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-[#6F2DBD] to-[#A663CC] scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />

            <div className="flex justify-between items-start mb-4">
                <div>
                    <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-500 mb-2">
                        {category}
                    </span>
                    <h3 className="font-bold text-gray-900 text-lg leading-tight line-clamp-1">{name}</h3>
                </div>
                <div className="text-right">
                    <p className="font-bold text-[#6F2DBD] text-lg">₹{price}</p>
                </div>
            </div>

            <p className="text-gray-500 text-sm line-clamp-2 mb-4 h-10">
                {description || "No description provided."}
            </p>

            <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                    <Clock className="w-3.5 h-3.5" />
                    {duration} min
                </div>
                {/* Actions */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={onView}
                        className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-[#6F2DBD] transition-colors"
                        title="View Details"
                    >
                        <Eye className="w-4 h-4" />
                    </button>
                    {/* Edit Link */}
                    <Link
                        href={`/dashboard/services/edit/${id}`}
                        className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-blue-500 transition-colors"
                        title="Edit"
                    >
                        <Edit2 className="w-4 h-4" />
                    </Link>
                    <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="p-2 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                        title="Delete"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
