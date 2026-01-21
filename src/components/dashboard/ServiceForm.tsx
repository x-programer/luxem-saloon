"use client";

import { useState } from "react";
import { ImageUpload } from "./ImageUpload";
import { Loader2, Plus, DollarSign, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface ServiceFormData {
    name: string;
    description: string;
    price: string;
    duration: string;
    imageUrl: string;
}

export function ServiceForm() {
    const [formData, setFormData] = useState<ServiceFormData>({
        name: "",
        description: "",
        price: "",
        duration: "30",
        imageUrl: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulate API call to save service
        await new Promise(resolve => setTimeout(resolve, 1500));

        alert("Service created successfully!");
        setIsSubmitting(false);
        // Reset form or redirect
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-2xl mx-auto">
            <div className="mb-8 border-b pb-4">
                <h2 className="text-xl font-bold text-gray-900">Add New Service</h2>
                <p className="text-sm text-gray-500">Add a premium service to your menu.</p>
            </div>

            <div className="space-y-6">
                {/* Is this Service Featured? Checkbox maybe? Keeping simple for now. */}

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Service Image</label>
                    <ImageUpload
                        onUploadComplete={(url) => setFormData(prev => ({ ...prev, imageUrl: url }))}
                        className="h-64"
                    />
                    <p className="text-xs text-gray-500 mt-2">Recommended size 1200x800px.</p>
                </div>

                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Service Name</label>
                    <input
                        type="text"
                        id="name"
                        required
                        className="w-full rounded-lg border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 transition-shadow text-sm py-3 px-4 bg-gray-50 focus:bg-white"
                        placeholder="e.g. Luxury HydraFacial"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <DollarSign className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                                type="number"
                                id="price"
                                required
                                className="w-full pl-10 rounded-lg border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 transition-shadow text-sm py-3 bg-gray-50 focus:bg-white"
                                placeholder="0.00"
                                value={formData.price}
                                onChange={e => setFormData({ ...formData, price: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">Duration (min)</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Clock className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                                type="number"
                                id="duration"
                                required
                                className="w-full pl-10 rounded-lg border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 transition-shadow text-sm py-3 bg-gray-50 focus:bg-white"
                                placeholder="Duration in minutes"
                                value={formData.duration}
                                onChange={e => setFormData({ ...formData, duration: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                        id="description"
                        rows={4}
                        className="w-full rounded-lg border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 transition-shadow text-sm py-3 px-4 bg-gray-50 focus:bg-white resize-none"
                        placeholder="Describe the treatment process and benefits..."
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                    />
                </div>

                <div className="pt-4 border-t flex justify-end">
                    <button
                        type="button"
                        className="mr-3 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={cn(
                            "flex items-center justify-center px-6 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-sm transition-all",
                            isSubmitting && "opacity-75 cursor-not-allowed"
                        )}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                                Saving...
                            </>
                        ) : (
                            <>Save Service</>
                        )}
                    </button>
                </div>
            </div>
        </form>
    );
}
