"use client";

import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase/config";
import { doc, onSnapshot, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { useEffect, useState } from "react";
import { ImageUploader } from "@/components/dashboard/ImageUploader";
import { Image as ImageIcon } from "lucide-react";
import { GallerySkeleton } from "@/components/skeletons/GallerySkeleton";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function GalleryPage() {
    const { user, loading } = useAuth();
    const [gallery, setGallery] = useState<string[]>([]);
    const [banner, setBanner] = useState<string>("");
    const [isLoadingData, setIsLoadingData] = useState(true);

    useEffect(() => {
        if (!user) return;

        const docRef = doc(db, "users", user.uid);
        const unsubscribe = onSnapshot(docRef, (doc) => {
            if (doc.exists()) {
                const data = doc.data();
                setGallery(data.gallery || []); // Default to empty array
                setBanner(data.banner || "");
            }
            setIsLoadingData(false);
        });

        return () => unsubscribe();
    }, [user]);

    const handleAddImage = async (url: string) => {
        if (!user) return;
        try {
            await updateDoc(doc(db, "users", user.uid), {
                gallery: arrayUnion(url)
            });
            toast.success("Image added to gallery");
        } catch (error) {
            console.error("Error adding image:", error);
            toast.error("Failed to update gallery");
        }
    };

    const handleRemoveImage = async (url: string) => {
        if (!user) return;
        try {
            await updateDoc(doc(db, "users", user.uid), {
                gallery: arrayRemove(url)
            });
        } catch (error) {
            console.error("Error removing image:", error);
            toast.error("Failed to remove from gallery");
        }
    };

    const handleBannerUpload = async (url: string) => {
        if (!user) return;
        try {
            await updateDoc(doc(db, "users", user.uid), {
                banner: url
            });
            toast.success("Banner updated");
        } catch (error) {
            console.error("Error updating banner:", error);
            toast.error("Failed to update banner");
        }
    };

    const handleBannerRemove = async () => {
        if (!user) return;
        try {
            await updateDoc(doc(db, "users", user.uid), {
                banner: null
            });
            // ImageUploader handles API deletion
            setBanner("");
        } catch (error) {
            console.error("Error removing banner:", error);
            toast.error("Failed to remove banner");
        }
    };

    if (loading || isLoadingData) {
        return <GallerySkeleton />;
    }

    // Prepare 5 slots (was 6)
    const slots = Array(5).fill(null).map((_, i) => gallery[i] || null);

    return (
        <div className="space-y-8 min-h-screen pb-20">
            {/* Header */}
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">My Portfolio</h1>
                <p className="text-gray-500">Manage your profile banner and gallery images.</p>
            </div>

            {/* Section 1: Hero Banner */}
            <section className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">Profile Banner</h2>
                    <span className="text-xs font-medium px-2 py-1 bg-gray-100 rounded text-gray-600">Required</span>
                </div>
                <div className="w-full max-w-4xl">
                    <ImageUploader
                        currentImage={banner}
                        onUpload={handleBannerUpload}
                        onRemove={handleBannerRemove}
                        directory="banner"
                        variant="rectangular"
                        helperText="16:9 Aspect Ratio (e.g. 1920x1080)"
                    />
                </div>
            </section>

            <hr className="border-gray-100" />

            {/* Section 2: Work Gallery */}
            <section className="space-y-4">
                <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-gray-900">Work Gallery</h2>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#6F2DBD]/10 text-[#6F2DBD] text-xs font-bold border border-[#6F2DBD]/20">
                        {gallery.length}/5
                    </span>
                </div>
                <p className="text-sm text-gray-500">Upload up to 5 images to showcase your best work.</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                    {slots.map((image, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="aspect-square"
                        >
                            <ImageUploader
                                currentImage={image}
                                onUpload={handleAddImage}
                                onRemove={() => image && handleRemoveImage(image)}
                                directory="gallery"
                                variant="square"
                                helperText={`Slot ${index + 1}`}
                            />
                        </motion.div>
                    ))}
                </div>
            </section>
        </div>
    );
}
