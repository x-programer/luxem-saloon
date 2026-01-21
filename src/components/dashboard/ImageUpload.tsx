"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, Loader2, X, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useStorage } from "@/hooks/use-storage";

interface ImageUploadProps {
    onUploadComplete: (url: string) => void;
    className?: string;
    defaultValue?: string;
    uploadPath?: string; // Allow custom path
}

export function ImageUpload({ onUploadComplete, className, defaultValue, uploadPath = "uploads" }: ImageUploadProps) {
    const [imageUrl, setImageUrl] = useState<string | null>(defaultValue || null);
    // Use the hook for logic
    const { uploadFile, progress, error: uploadError } = useStorage();
    const [isUploading, setIsUploading] = useState(false);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (!file) return;

        setIsUploading(true);

        try {
            // Upload to Firebase using hook
            // Generate a unique path: uploads/timestamp_filename
            const path = `${uploadPath}/${Date.now()}_${file.name}`;
            const downloadUrl = await uploadFile(file, path);

            setImageUrl(downloadUrl);
            onUploadComplete(downloadUrl);
        } catch (err) {
            console.error(err);
        } finally {
            setIsUploading(false);
        }
    }, [onUploadComplete, uploadFile, uploadPath]);

    const removeImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setImageUrl(null);
        onUploadComplete("");
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': [] },
        maxFiles: 1,
        disabled: isUploading || !!imageUrl
    });

    return (
        <div className={cn("w-full", className)}>
            <div
                {...getRootProps()}
                className={cn(
                    "relative group cursor-pointer flex flex-col items-center justify-center w-full h-64 rounded-xl border-2 border-dashed transition-all duration-300 bg-gray-50/50 backdrop-blur-sm overflow-hidden",
                    isDragActive ? "border-indigo-500 bg-indigo-50/50" : "border-gray-300 hover:border-gray-400 hover:bg-gray-100/50",
                    uploadError && "border-red-500 bg-red-50",
                    imageUrl && "border-none"
                )}
            >
                <input {...getInputProps()} />

                <AnimatePresence mode='wait'>
                    {isUploading ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center"
                        >
                            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-2" />
                            <p className="text-sm text-gray-500 font-medium">Uploading... {Math.round(progress)}%</p>
                        </motion.div>
                    ) : imageUrl ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="relative w-full h-full"
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={imageUrl} alt="Uploaded" className="w-full h-full object-cover" />

                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button
                                    onClick={removeImage}
                                    className="p-2 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center shadow-lg">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Uploaded
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center text-center p-4"
                        >
                            <div className={cn("p-4 rounded-full bg-white shadow-sm mb-4 transition-transform group-hover:scale-110", isDragActive && "text-indigo-600")}>
                                <UploadCloud className="w-8 h-8 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                            </div>
                            <p className="text-sm font-semibold text-gray-700">
                                {isDragActive ? "Drop the artwork here" : "Click or drag image"}
                            </p>
                            <p className="mt-1 text-xs text-gray-500 max-w-xs leading-relaxed">
                                SVG, PNG, JPG or GIF (max. 10MB)
                            </p>
                            {uploadError && (
                                <p className="mt-3 text-sm text-red-500 font-medium bg-red-50 px-3 py-1 rounded-full">
                                    {uploadError}
                                </p>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
