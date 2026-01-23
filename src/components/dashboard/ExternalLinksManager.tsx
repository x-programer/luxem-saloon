"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase/config";
import { doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { Plus, Trash2, Instagram, Facebook, Globe, ShoppingBag, Youtube, Twitter } from "lucide-react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

interface ExternalLink {
    id: string;
    platform: "instagram" | "facebook" | "twitter" | "youtube" | "website" | "shop";
    url: string;
    label: string;
}

const PLATFORMS = [
    { value: "instagram", label: "Instagram", icon: Instagram },
    { value: "facebook", label: "Facebook", icon: Facebook },
    { value: "twitter", label: "Twitter", icon: Twitter },
    { value: "youtube", label: "YouTube", icon: Youtube },
    { value: "website", label: "Website", icon: Globe },
    { value: "shop", label: "Shop", icon: ShoppingBag },
];

export function ExternalLinksManager({ currentLinks = [] }: { currentLinks: ExternalLink[] }) {
    const { user } = useAuth();
    const [isAdding, setIsAdding] = useState(false);
    const [platform, setPlatform] = useState<ExternalLink['platform']>("instagram");
    const [url, setUrl] = useState("");
    const [label, setLabel] = useState("");

    const [editingId, setEditingId] = useState<string | null>(null);

    const handleSave = async () => {
        if (!user || !url) return;

        try {
            if (editingId) {
                // UPDATE EXISTING
                const updatedLinks = currentLinks.map(link =>
                    link.id === editingId
                        ? { ...link, platform, url: url.startsWith("http") ? url : `https://${url}`, label: label || PLATFORMS.find(p => p.value === platform)?.label || platform }
                        : link
                );

                await updateDoc(doc(db, "users", user.uid), {
                    externalLinks: updatedLinks
                });
                toast.success("Link updated");
            } else {
                // ADD NEW
                const newLink: ExternalLink = {
                    id: uuidv4(),
                    platform,
                    url: url.startsWith("http") ? url : `https://${url}`,
                    label: label || PLATFORMS.find(p => p.value === platform)?.label || platform
                };

                await updateDoc(doc(db, "users", user.uid), {
                    externalLinks: arrayUnion(newLink)
                });
                toast.success("Link added");
            }

            resetForm();
        } catch (error) {
            toast.error("Failed to save link");
            console.error(error);
        }
    };

    const handleEdit = (link: ExternalLink) => {
        setEditingId(link.id);
        setPlatform(link.platform);
        setUrl(link.url);
        setLabel(link.label);
        setIsAdding(true);
    };

    const resetForm = () => {
        setIsAdding(false);
        setEditingId(null);
        setUrl("");
        setLabel("");
        setPlatform("instagram");
    };

    const handleRemove = async (link: ExternalLink) => {
        if (!user) return;
        try {
            await updateDoc(doc(db, "users", user.uid), {
                externalLinks: arrayRemove(link)
            });
            toast.success("Link removed");
        } catch (error) {
            toast.error("Failed to remove link");
        }
    };

    return (
        <div className="space-y-6">
            <div className="grid gap-4">
                {currentLinks.map((link) => {
                    const PlatformIcon = PLATFORMS.find(p => p.value === link.platform)?.icon || Globe;
                    return (
                        <div key={link.id} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gray-50 rounded-lg text-gray-600">
                                    <PlatformIcon size={18} />
                                </div>
                                <div>
                                    <p className="font-bold text-sm text-gray-900">{link.label}</p>
                                    <p className="text-xs text-gray-400 truncate max-w-[200px]">{link.url}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => handleEdit(link)}
                                    className="p-2 text-gray-400 hover:text-[#6F2DBD] hover:bg-purple-50 rounded-lg transition-colors text-xs font-bold"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleRemove(link)}
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {isAdding ? (
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="font-bold text-sm text-gray-900">{editingId ? 'Edit Link' : 'Add New Link'}</h4>
                    </div>
                    <div className="grid gap-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Platform</label>
                                <select
                                    value={platform}
                                    onChange={(e) => setPlatform(e.target.value as any)}
                                    className="w-full p-2 rounded-lg border border-gray-300 text-sm outline-none focus:border-[#6F2DBD]"
                                >
                                    {PLATFORMS.map(p => (
                                        <option key={p.value} value={p.value}>{p.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Label (Optional)</label>
                                <input
                                    value={label}
                                    onChange={(e) => setLabel(e.target.value)}
                                    placeholder="e.g. Follow Us"
                                    className="w-full p-2 rounded-lg border border-gray-300 text-sm outline-none focus:border-[#6F2DBD]"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">URL</label>
                            <input
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder="https://..."
                                className="w-full p-2 rounded-lg border border-gray-300 text-sm outline-none focus:border-[#6F2DBD]"
                            />
                        </div>
                        <div className="flex justify-end gap-2 mt-2">
                            <button onClick={resetForm} className="px-3 py-1.5 text-xs font-bold text-gray-500 hover:bg-gray-200 rounded-lg">Cancel</button>
                            <button onClick={handleSave} className="px-3 py-1.5 text-xs font-bold text-white bg-[#6F2DBD] hover:bg-[#5a2499] rounded-lg">
                                {editingId ? 'Update Link' : 'Save Link'}
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <button
                    onClick={() => setIsAdding(true)}
                    className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center gap-2 text-gray-500 font-bold hover:border-[#6F2DBD] hover:text-[#6F2DBD] transition-all"
                >
                    <Plus size={16} /> Add External Link
                </button>
            )}
        </div>
    );
}
