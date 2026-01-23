"use client";

import { useState, useRef } from "react";
import { useAuth } from "@/lib/auth-context";
import { compressImage } from "@/lib/image-compression";
import { sanitizeFileName } from "@/lib/security";
import { Loader2, Upload, Trash2, Camera, Plus, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface ImageUploaderProps {
    currentImage: string | null;
    onUpload: (url: string) => void;
    onRemove: () => void;
    directory: string; // e.g., "logo" or "gallery"
    variant: "circle" | "square" | "rectangular" | "rectangle";
    isLoading?: boolean;
    helperText?: string;
}

export function ImageUploader({
    currentImage,
    onUpload,
    onRemove,
    directory,
    variant,
    isLoading: externalLoading = false,
    helperText
}: ImageUploaderProps) {
    const { user } = useAuth();
    const [isUploading, setIsUploading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;

        try {
            // 1. Validation
            const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
            if (!validTypes.includes(file.type)) {
                toast.error("Invalid file type. Only JPG, PNG, and WebP are allowed.");
                return;
            }

            if (file.size > 5 * 1024 * 1024) { // 5MB
                toast.error("File is too large. Max 5MB allowed.");
                return;
            }

            setIsUploading(true);

            // 2. Compress Image
            const compressedFile = await compressImage(file, { maxWidth: 1000, quality: 0.75 });
            const sanitizedName = sanitizeFileName(file.name);

            // 3. Get Signature from our API
            const folder = `luxe-salon/users/${user.uid}/${directory}`;
            const signResponse = await fetch('/api/sign-cloudinary', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ folder, userId: user.uid }),
            });

            if (signResponse.status === 429) {
                throw new Error("Too many uploads. Please wait a minute.");
            }

            if (!signResponse.ok) throw new Error("Failed to get upload signature");

            const { signature, timestamp, apiKey, cloudName } = await signResponse.json();

            // 4. Upload to Cloudinary
            const formData = new FormData();
            formData.append('file', compressedFile, sanitizedName); // Pass sanitized name
            formData.append('api_key', apiKey);
            formData.append('timestamp', timestamp.toString());
            formData.append('signature', signature);
            formData.append('folder', folder);

            const uploadResponse = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
                method: 'POST',
                body: formData,
            });

            if (!uploadResponse.ok) throw new Error("Cloudinary upload failed");

            const data = await uploadResponse.json();

            // 3. Callback with secure URL
            onUpload(data.secure_url);
            toast.success("Image uploaded successfully");

        } catch (error) {
            console.error("Upload failed:", error);
            toast.error("Failed to upload image");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleRemove = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!currentImage || !user) return;

        try {
            setIsDeleting(true);

            // Extract public ID from URL
            // URL format: https://res.cloudinary.com/cloud_name/image/upload/v12345/folder/path/image.webp
            // We want: folder/path/image (without extension)
            const regex = /\/v\d+\/(.+)\.[a-z]+$/;
            const match = currentImage.match(regex);

            if (match && match[1]) {
                const publicId = match[1];

                // Call secure deletion API
                const response = await fetch('/api/delete-image', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ publicId, userId: user.uid }),
                });

                if (!response.ok) {
                    console.error("Deletion failed:", await response.json());
                    toast.error("Failed to delete image from storage");
                    // We might still want to remove it from UI/DB, so we proceed or return based on policy.
                    // For now, allow UI removal even if storage fails (to prevent stuck state).
                }
            }

            onRemove();
            toast.success("Image removed");
        } catch (error) {
            console.error("Error removing image:", error);
            toast.error("Error removing image");
        } finally {
            setIsDeleting(false);
        }
    };

    const isLoading = isUploading || isDeleting || externalLoading;

    return (
        <div
            onClick={() => !isLoading && fileInputRef.current?.click()}
            className={cn(
                "relative group cursor-pointer overflow-hidden border-2 bg-gray-50 flex flex-col items-center justify-center transition-all hover:bg-gray-100",
                variant === "circle" ? "w-32 h-32 rounded-full border-dashed border-gray-300 hover:border-[#6F2DBD]" :
                    (variant === "rectangular" || variant === "rectangle") ? "w-full aspect-[21/9] rounded-2xl border-dashed border-gray-200 hover:border-[#6F2DBD]" :
                        "w-full aspect-square rounded-2xl border-dashed border-gray-200 hover:border-[#6F2DBD]",
                isLoading && "opacity-70 cursor-wait pointer-events-none"
            )}
        >
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*"
                className="hidden"
            />

            {isLoading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-10">
                    <Loader2 className="w-6 h-6 text-[#6F2DBD] animate-spin" />
                </div>
            ) : null}

            {currentImage ? (
                <>
                    <Image
                        src={currentImage}
                        alt="Uploaded"
                        fill
                        className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                            onClick={handleRemove}
                            className="p-2 bg-white rounded-full text-red-500 hover:bg-red-50 transition-colors shadow-lg transform hover:scale-110"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                </>
            ) : (
                <div className="flex flex-col items-center justify-center text-gray-400 gap-2 p-4 text-center">
                    {variant === "circle" ? (
                        <Camera className="w-8 h-8 group-hover:text-[#6F2DBD] transition-colors" />
                    ) : (
                        <Plus className="w-8 h-8 group-hover:text-[#6F2DBD] transition-colors" />
                    )}
                    {helperText && variant === 'square' && <span className="text-xs font-medium">{helperText}</span>}
                </div>
            )}
        </div>
    );
}
