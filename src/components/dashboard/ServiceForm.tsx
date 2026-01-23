"use client";

import { useState } from "react";
import { Loader2, Plus, Clock, Trash2, Scissors } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebase/config";
import { collection, addDoc, serverTimestamp, doc, updateDoc } from "firebase/firestore";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface ServiceStep {
    id: string;
    name: string;
    duration: string;
    details: string;
}

interface ServiceFormData {
    name: string;
    description: string;
    price: string;
    compareAtPrice: string; // For "Save 55%" effect
    totalDuration: string;
    targetAudience: "everyone" | "female" | "male";
    category: string;
}

interface ServiceFormProps {
    initialData?: any;
    serviceId?: string;
}

export function ServiceForm({ initialData, serviceId }: ServiceFormProps) {
    const { user } = useAuth();
    const router = useRouter();

    const [formData, setFormData] = useState<ServiceFormData>({
        name: initialData?.name || "",
        description: initialData?.description || "",
        price: initialData?.price?.toString() || "",
        compareAtPrice: initialData?.compareAtPrice?.toString() || "",
        totalDuration: initialData?.duration?.toString() || "60",
        targetAudience: initialData?.targetAudience || "female",
        category: initialData?.category || "Hair",
    });

    // The "Fresha-style" Included Items List
    const [steps, setSteps] = useState<ServiceStep[]>(
        initialData?.includedSteps?.map((step: any) => ({ ...step, id: Math.random().toString(36).substr(2, 9) })) ||
        [{ id: "1", name: "Premium Hair Wash", duration: "10", details: "Loreal products for gentle cleansing" }]
    );

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Helper: Add new step
    const addStep = () => {
        const newId = Math.random().toString(36).substr(2, 9);
        setSteps([...steps, { id: newId, name: "", duration: "", details: "" }]);
    };

    // Helper: Remove step
    const removeStep = (id: string) => {
        setSteps(steps.filter(s => s.id !== id));
    };

    // Helper: Update step
    const updateStep = (id: string, field: keyof ServiceStep, value: string) => {
        setSteps(steps.map(s => s.id === id ? { ...s, [field]: value } : s));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) {
            toast.error("You must be logged in to save a service.");
            return;
        }

        setIsSubmitting(true);

        try {
            // Prepare data for Firestore
            const serviceData = {
                uid: user.uid,
                name: formData.name,
                category: formData.category,
                price: parseFloat(formData.price),
                compareAtPrice: formData.compareAtPrice ? parseFloat(formData.compareAtPrice) : null,
                duration: parseInt(formData.totalDuration),
                targetAudience: formData.targetAudience,
                description: formData.description,
                includedSteps: steps.map(({ id, ...rest }) => rest), // Remove ID from steps
                updatedAt: serverTimestamp(),
                ...(!serviceId && { createdAt: serverTimestamp() })
            };

            if (serviceId) {
                // Update existing service
                const docRef = doc(db, "services", serviceId);
                await updateDoc(docRef, serviceData);
                toast.success("Service updated successfully!");
                router.push("/dashboard/services"); // Redirect back to list
            } else {
                // Create new service
                const docRef = await addDoc(collection(db, "services"), serviceData);
                console.log("Document written with ID: ", docRef.id);
                toast.success("Service created successfully!");

                // Reset
                setFormData({
                    name: "",
                    description: "",
                    price: "",
                    compareAtPrice: "",
                    totalDuration: "60",
                    targetAudience: "female",
                    category: "Hair",
                });
                setSteps([{ id: "1", name: "Premium Hair Wash", duration: "10", details: "Loreal products for gentle cleansing" }]);
            }

        } catch (error) {
            console.error("Error saving document: ", error);
            toast.error("Failed to save service. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-soft border border-gray-100 p-8 max-w-3xl mx-auto relative overflow-hidden">

            {/* Top Decoration */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#6F2DBD] to-[#A663CC]" />

            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                    {serviceId ? "Edit Service Package" : "Create Service Package"}
                </h2>
                <p className="text-gray-500 mt-1">Design a detailed service experience for your clients.</p>
            </div>

            <div className="space-y-8">

                {/* 1. BASIC DETAILS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-gray-700 mb-2">Service Name</label>
                        <input
                            type="text"
                            required
                            className="w-full rounded-xl border-gray-200 focus:ring-2 focus:ring-[#6F2DBD]/20 focus:border-[#6F2DBD] text-sm py-3 px-4 bg-gray-50 focus:bg-white transition-all font-medium placeholder:text-gray-400"
                            placeholder="e.g. Pro Stylist Hair Cut & Spa"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                        <select
                            className="w-full rounded-xl border-gray-200 focus:ring-2 focus:ring-[#6F2DBD]/20 focus:border-[#6F2DBD] text-sm py-3 px-4 bg-gray-50 focus:bg-white transition-all font-medium"
                            value={formData.category}
                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                        >
                            <option value="Hair">Hair</option>
                            <option value="Facial">Facial</option>
                            <option value="Massage">Massage</option>
                            <option value="Nails">Nails</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Target Audience</label>
                        <div className="flex gap-2">
                            {(['female', 'male', 'everyone'] as const).map((type) => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, targetAudience: type })}
                                    className={cn(
                                        "flex-1 py-3 text-xs font-bold uppercase tracking-wider rounded-xl border transition-all",
                                        formData.targetAudience === type
                                            ? "bg-[#6F2DBD] text-white border-[#6F2DBD] shadow-md shadow-purple-200"
                                            : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
                                    )}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-gray-700 mb-2">Short Description</label>
                        <textarea
                            rows={3}
                            className="w-full rounded-xl border-gray-200 focus:ring-2 focus:ring-[#6F2DBD]/20 focus:border-[#6F2DBD] text-sm py-3 px-4 bg-gray-50 focus:bg-white resize-none transition-all"
                            placeholder="Briefly describe the outcome of this service..."
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>
                </div>

                {/* 2. THE "FRESHA" STYLE INCLUSIONS */}
                <div className="bg-gray-50/50 rounded-2xl p-6 border border-gray-100">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <Scissors className="w-5 h-5 text-[#6F2DBD]" />
                                What's Included?
                            </h3>
                            <p className="text-xs text-gray-500">Break down the service into steps.</p>
                        </div>
                        <button
                            type="button"
                            onClick={addStep}
                            className="text-xs font-bold text-[#6F2DBD] bg-purple-50 px-3 py-1.5 rounded-lg hover:bg-purple-100 transition-colors flex items-center gap-1"
                        >
                            <Plus className="w-3 h-3" /> Add Step
                        </button>
                    </div>

                    <div className="space-y-3">
                        <AnimatePresence>
                            {steps.map((step, index) => (
                                <motion.div
                                    key={step.id}
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="group bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:border-[#6F2DBD]/30 transition-colors relative"
                                >
                                    <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center text-[10px] text-gray-400 font-bold z-10">
                                        {index + 1}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                                        <div className="md:col-span-5">
                                            <input
                                                placeholder="Step Name (e.g. Hair Wash)"
                                                value={step.name}
                                                onChange={(e) => updateStep(step.id, 'name', e.target.value)}
                                                className="w-full text-sm font-bold text-gray-900 placeholder:text-gray-300 border-none p-0 focus:ring-0"
                                            />
                                            <input
                                                placeholder="Details (e.g. Using Loreal Shampoo)"
                                                value={step.details}
                                                onChange={(e) => updateStep(step.id, 'details', e.target.value)}
                                                className="w-full text-xs text-gray-500 placeholder:text-gray-300 border-none p-0 focus:ring-0 mt-1"
                                            />
                                        </div>
                                        <div className="md:col-span-3">
                                            <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-2 py-1.5">
                                                <Clock className="w-3 h-3 text-gray-400" />
                                                <input
                                                    placeholder="10"
                                                    value={step.duration}
                                                    onChange={(e) => updateStep(step.id, 'duration', e.target.value)}
                                                    className="w-full bg-transparent text-sm text-gray-900 border-none p-0 focus:ring-0 text-right"
                                                />
                                                <span className="text-xs text-gray-400">min</span>
                                            </div>
                                        </div>
                                        <div className="md:col-span-4 flex justify-end items-center">
                                            {steps.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeStep(step.id)}
                                                    className="text-gray-300 hover:text-red-500 transition-colors p-2"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>

                {/* 3. PRICING & SAVINGS */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    <div className="col-span-2 md:col-span-1">
                        <label className="block text-sm font-bold text-gray-700 mb-2">Final Price</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <span className="text-gray-400 font-bold text-lg">₹</span>
                            </div>
                            <input
                                type="number"
                                required
                                className="w-full pl-8 rounded-xl border-gray-200 focus:ring-2 focus:ring-[#6F2DBD]/20 focus:border-[#6F2DBD] text-lg font-bold py-3 bg-gray-50 focus:bg-white transition-all text-[#6F2DBD]"
                                placeholder="0"
                                value={formData.price}
                                onChange={e => setFormData({ ...formData, price: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="col-span-2 md:col-span-1">
                        <label className="block text-sm font-bold text-gray-700 mb-2">Original Price <span className="text-xs font-normal text-gray-400">(Optional)</span></label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <span className="text-gray-400 font-bold text-lg">₹</span>
                            </div>
                            <input
                                type="number"
                                className="w-full pl-8 rounded-xl border-gray-200 focus:ring-2 focus:ring-[#6F2DBD]/20 focus:border-[#6F2DBD] text-lg font-bold py-3 bg-gray-50 focus:bg-white transition-all text-gray-400 line-through"
                                placeholder="0"
                                value={formData.compareAtPrice}
                                onChange={e => setFormData({ ...formData, compareAtPrice: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="col-span-2 md:col-span-1">
                        <label className="block text-sm font-bold text-gray-700 mb-2">Total Duration</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Clock className="w-5 h-5 text-gray-400" />
                            </div>
                            <input
                                type="number"
                                required
                                className="w-full pl-11 rounded-xl border-gray-200 focus:ring-2 focus:ring-[#6F2DBD]/20 focus:border-[#6F2DBD] text-lg font-bold py-3 bg-gray-50 focus:bg-white transition-all text-gray-900"
                                value={formData.totalDuration}
                                onChange={e => setFormData({ ...formData, totalDuration: e.target.value })}
                            />
                            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                <span className="text-xs font-bold text-gray-400">MIN</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4. ACTIONS */}
                <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-6 py-3 text-sm font-bold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={cn(
                            "flex items-center justify-center px-8 py-3 text-sm font-bold rounded-xl text-white bg-[#6F2DBD] hover:bg-[#5a2499] shadow-lg shadow-purple-200 transition-all active:scale-[0.98]",
                            isSubmitting && "opacity-75 cursor-not-allowed"
                        )}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                                {serviceId ? "Updating..." : "Saving..."}
                            </>
                        ) : (
                            serviceId ? "Update Service" : "Create Service Package"
                        )}
                    </button>
                </div>
            </div>
        </form>
    );
}