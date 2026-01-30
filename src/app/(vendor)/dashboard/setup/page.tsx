"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "@/lib/auth-context";
import { useStorage } from "@/hooks/use-storage";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useRouter } from "next/navigation";
import { Camera, Image as ImageIcon, Loader2, Plus, X } from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

export default function VendorSetupPage() {
    const { user } = useAuth();
    const router = useRouter();
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [isLoading, setIsLoading] = useState(false);

    // Image States
    const [profileImage, setProfileImage] = useState<File | null>(null);
    const [profilePreview, setProfilePreview] = useState<string | null>(null);
    const [galleryImages, setGalleryImages] = useState<(File | null)[]>([null, null, null, null, null, null]);
    const [galleryPreviews, setGalleryPreviews] = useState<(string | null)[]>([null, null, null, null, null, null]);

    // Hooks
    const { uploadFile, progress: uploadProgress } = useStorage();

    // Handlers
    const handleProfileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setProfileImage(file);
            setProfilePreview(URL.createObjectURL(file));
        }
    };

    const handleGallerySelect = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const newImages = [...galleryImages];
            newImages[index] = file;
            setGalleryImages(newImages);

            const newPreviews = [...galleryPreviews];
            newPreviews[index] = URL.createObjectURL(file);
            setGalleryPreviews(newPreviews);
        }
    };

    const removeGalleryImage = (index: number) => {
        const newImages = [...galleryImages];
        newImages[index] = null;
        setGalleryImages(newImages);

        const newPreviews = [...galleryPreviews];
        newPreviews[index] = null;
        setGalleryPreviews(newPreviews);
    };

    const onSubmit = async (data: any) => {
        if (!user) return;
        setIsLoading(true);

        try {
            // 1. Upload Profile Image
            let profileUrl = "";
            if (profileImage) {
                profileUrl = await uploadFile(profileImage, `vendors/${user.uid}/profile_${Date.now()}`);
            }

            // 2. Upload Gallery Images
            const galleryUrls: string[] = [];
            for (let i = 0; i < galleryImages.length; i++) {
                const img = galleryImages[i];
                if (img) {
                    const url = await uploadFile(img, `vendors/${user.uid}/gallery_${i}_${Date.now()}`);
                    galleryUrls.push(url);
                }
            }

            // 3. Save to Firestore
            await setDoc(doc(db, "vendors", user.uid), {
                salonName: data.salonName,
                phone: user.phoneNumber, // Pre-filled from Auth
                description: data.description,
                profileImage: profileUrl,
                gallery: galleryUrls,
                setupCompleted: true,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            }, { merge: true });

            router.push("/dashboard");

        } catch (err) {
            console.error("Setup Error:", err);
            // In real app, show toast error
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-secondary p-4 md:p-8 flex justify-center">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-3xl space-y-8"
            >
                <div>
                    <h1 className="text-3xl font-bold text-textMain">Complete Your Profile</h1>
                    <p className="text-textMuted mt-2">Set up your luxury salon presence.</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

                    {/* Section A: Basic Info */}
                    <div className="bg-surface rounded-3xl p-6 md:p-8 shadow-soft border border-gray-100">
                        <h2 className="text-xl font-bold text-textMain mb-6 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm">1</span>
                            Basic Details
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-textMain mb-1">Salon Name</label>
                                <input
                                    {...register("salonName", { required: true })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-gray-50 focus:bg-white transition-all"
                                    placeholder="e.g. Saloon Studio"
                                />
                                {errors.salonName && <span className="text-red-500 text-xs mt-1">Required</span>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-textMain mb-1">Phone Number</label>
                                <input
                                    disabled
                                    value={user?.phoneNumber || ""}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-100 text-gray-500 cursor-not-allowed"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-textMain mb-1">Description</label>
                                <textarea
                                    {...register("description", { required: true })}
                                    rows={4}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-gray-50 focus:bg-white transition-all resize-none"
                                    placeholder="Tell us about your salon..."
                                />
                                {errors.description && <span className="text-red-500 text-xs mt-1">Required</span>}
                            </div>
                        </div>
                    </div>

                    {/* Section B: Profile Picture */}
                    <div className="bg-surface rounded-3xl p-6 md:p-8 shadow-soft border border-gray-100">
                        <h2 className="text-xl font-bold text-textMain mb-6 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm">2</span>
                            Profile Picture
                        </h2>

                        <div className="flex items-center gap-6">
                            <div className="relative group w-32 h-32 rounded-full overflow-hidden bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-primary transition-colors">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleProfileSelect}
                                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                />
                                {profilePreview ? (
                                    <Image src={profilePreview} alt="Preview" fill className="object-cover" />
                                ) : (
                                    <Camera className="w-8 h-8 text-gray-400 group-hover:text-primary transition-colors" />
                                )}
                            </div>
                            <div className="text-sm text-textMuted">
                                <p className="font-medium text-textMain">Upload your logo</p>
                                <p>Recommended 400x400px.</p>
                            </div>
                        </div>
                    </div>

                    {/* Section C: Gallery */}
                    <div className="bg-surface rounded-3xl p-6 md:p-8 shadow-soft border border-gray-100">
                        <h2 className="text-xl font-bold text-textMain mb-6 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm">3</span>
                            Portfolio Gallery
                        </h2>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {galleryPreviews.map((preview, index) => (
                                <div key={index} className="relative aspect-square rounded-2xl overflow-hidden bg-gray-50 border-2 border-dashed border-gray-200 hover:border-primary transition-colors group">
                                    {preview ? (
                                        <>
                                            <Image src={preview} alt={`Gallery ${index}`} fill className="object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => removeGalleryImage(index)}
                                                className="absolute top-2 right-2 p-1 bg-white/80 rounded-full text-red-500 hover:bg-white transition-colors"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </>
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Plus className="w-8 h-8 text-gray-300 group-hover:text-primary transition-colors" />
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => handleGallerySelect(index, e)}
                                                className="absolute inset-0 opacity-0 cursor-pointer"
                                            />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        <p className="text-xs text-textMuted mt-4 text-center">Upload up to 6 high-quality images of your facility.</p>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-primary text-white font-bold py-4 rounded-2xl hover:bg-violet-600 transition-colors shadow-lg shadow-violet-200 flex items-center justify-center gap-2 text-lg"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="animate-spin w-5 h-5" />
                                {uploadProgress > 0 ? `Uploading... ${Math.round(uploadProgress)}%` : "Saving Profile..."}
                            </>
                        ) : "Complete Setup"}
                    </button>

                </form>
            </motion.div>
        </div>
    );
}
