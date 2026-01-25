"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";

interface DeleteConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void> | void;
    title?: string;
    message?: string;
    itemName?: string;
}

export function DeleteConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title = "Delete Item?",
    message = "Are you sure you want to remove this? This action cannot be undone and all associated data will be lost.",
    itemName,
}: DeleteConfirmationModalProps) {
    const [isDeleting, setIsDeleting] = useState(false);

    // Reset state when modal opens/closes
    useEffect(() => {
        if (isOpen) setIsDeleting(false);
    }, [isOpen]);

    const handleConfirm = async () => {
        setIsDeleting(true);
        try {
            await onConfirm();
        } catch (error) {
            // If error occurs, stop loading so user can try again or close
            console.error("Delete failed", error);
            setIsDeleting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={!isDeleting ? onClose : undefined}
                    />

                    {/* Modal Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden"
                    >
                        {/* Close Button */}
                        {!isDeleting && (
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                            >
                                <X size={20} />
                            </button>
                        )}

                        <div className="p-6 pt-8 text-center">
                            {/* Icon */}
                            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
                                <Trash2 className="h-8 w-8 text-red-500" />
                            </div>

                            {/* Text Content */}
                            <h3 className="mb-2 text-xl font-bold text-gray-900">
                                {title.replace("[Item Name]", itemName || "Item")}
                            </h3>

                            <p className="text-sm text-gray-500 leading-relaxed max-w-[90%] mx-auto">
                                {message}
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="bg-gray-50 px-6 py-4 flex gap-3 justify-center">
                            <button
                                disabled={isDeleting}
                                onClick={onClose}
                                className="flex-1 py-2.5 px-4 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-100 hover:border-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Keep it
                            </button>

                            <button
                                disabled={isDeleting}
                                onClick={handleConfirm}
                                className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 shadow-md shadow-red-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isDeleting ? (
                                    <>
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                        Deleting...
                                    </>
                                ) : (
                                    "Yes, Delete"
                                )}
                            </button>
                        </div>

                        {/* Progress Bar (Optional Visual Flair) */}
                        {isDeleting && (
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 1.5, ease: "linear" }}
                                className="h-1 bg-red-500/30 absolute bottom-0 left-0"
                            />
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
