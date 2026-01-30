"use client";

import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebase/config";
import { collection, onSnapshot, query, where, addDoc, doc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { Plus } from "lucide-react";
import { ServiceListSkeleton } from "@/components/skeletons/ServiceListSkeleton";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ServiceCard } from "@/components/dashboard/ServiceCard";
import { ServiceDetailsModal } from "@/components/dashboard/ServiceDetailsModal";
import { toast } from "sonner";

import { useSearchParams } from "next/navigation";

export default function ServicesPage() {
    const { user, loading } = useAuth();
    const searchParams = useSearchParams();
    const viewAsId = searchParams.get("viewAs");
    const targetId = viewAsId || user?.uid;

    const [services, setServices] = useState<any[]>([]);
    const [offers, setOffers] = useState<any[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [selectedService, setSelectedService] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<"services" | "offers">("services");
    const [isCreatingOffer, setIsCreatingOffer] = useState(false);

    // Offer Form State
    const [offerCode, setOfferCode] = useState("");
    const [offerDiscount, setOfferDiscount] = useState("");
    const [offerValidUntil, setOfferValidUntil] = useState("");

    useEffect(() => {
        if (!targetId) return;

        // Query services
        const qServices = query(
            collection(db, "services"),
            where("uid", "==", targetId)
        );

        const unsubscribeServices = onSnapshot(qServices, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setServices(data);
        });

        // Query offers - Assuming offers are stored in a subcollection 'offers' under the user
        const qOffers = query(collection(db, "users", targetId, "offers"));

        const unsubscribeOffers = onSnapshot(qOffers, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setOffers(data);
            setIsLoadingData(false); // Only set loading false after offers fetched too? Or independent?
        }, (err) => {
            console.log("No offers collection yet or error", err);
            setIsLoadingData(false);
        });

        return () => {
            unsubscribeServices();
            unsubscribeOffers();
        };
    }, [user, targetId]);

    const handleCreateOffer = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!targetId) return;

        try {
            await addDoc(collection(db, "users", targetId, "offers"), {
                code: offerCode.toUpperCase(),
                discount: Number(offerDiscount),
                validUntil: offerValidUntil,
                isActive: true,
                createdAt: serverTimestamp()
            });
            toast.success("Offer created successfully");
            setOfferCode("");
            setOfferDiscount("");
            setOfferValidUntil("");
            setIsCreatingOffer(false);
        } catch (error) {
            console.error("Error creating offer", error);
            toast.error("Failed to create offer");
        }
    };

    const toggleOfferStatus = async (offerId: string, currentStatus: boolean) => {
        if (!targetId) return;
        try {
            await updateDoc(doc(db, "users", targetId, "offers", offerId), {
                isActive: !currentStatus
            });
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    const deleteOffer = async (offerId: string) => {
        if (!targetId) return;
        if (!confirm("Are you sure you want to delete this offer?")) return;
        try {
            await deleteDoc(doc(db, "users", targetId, "offers", offerId));
            toast.success("Offer deleted");
        } catch (error) {
            toast.error("Failed to delete offer");
        }
    };

    if (loading || isLoadingData) {
        return <ServiceListSkeleton />;
    }

    return (
        <div className="space-y-8 relative min-h-screen">
            {/* Grid Background */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none fixed" />

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Services & Offers</h1>
                    <p className="text-gray-500 mt-1">Manage your service menu and promotional codes.</p>
                </div>

                <div className="flex bg-white rounded-xl p-1 shadow-sm border border-gray-100">
                    <button
                        onClick={() => setActiveTab("services")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'services' ? 'bg-[#6F2DBD] text-white shadow-md' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                        Service Menu
                    </button>
                    <button
                        onClick={() => setActiveTab("offers")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'offers' ? 'bg-[#6F2DBD] text-white shadow-md' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                        Special Offers
                    </button>
                </div>
            </div>

            {activeTab === "services" ? (
                <>
                    <div className="flex justify-end relative z-10">
                        <Link
                            href={viewAsId ? `/dashboard/services/new?viewAs=${viewAsId}` : "/dashboard/services/new"}
                            className="bg-[#6F2DBD] text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-[#5a2499] shadow-lg shadow-purple-200 transition-all flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Add Service
                        </Link>
                    </div>

                    {services.length === 0 ? (
                        <div className="bg-white rounded-3xl border border-dashed border-gray-200 p-12 text-center relative z-10">
                            <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Plus className="w-6 h-6 text-[#6F2DBD]" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">No services yet</h3>
                            <p className="text-gray-500 mt-2 mb-6 max-w-sm mx-auto">
                                Create your first service package to start showcasing your offerings to clients.
                            </p>
                            <Link
                                href={viewAsId ? `/dashboard/services/new?viewAs=${viewAsId}` : "/dashboard/services/new"}
                                className="text-[#6F2DBD] font-bold hover:underline"
                            >
                                Create your first service &rarr;
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
                            {services.map((service) => (
                                <ServiceCard
                                    key={service.id}
                                    id={service.id}
                                    name={service.name}
                                    price={service.price}
                                    duration={service.duration}
                                    category={service.category}
                                    description={service.description}
                                    onView={() => setSelectedService(service)}
                                />
                            ))}
                        </div>
                    )}
                </>
            ) : (
                /* OFFERS TAB */
                <div className="space-y-6 relative z-10">
                    <div className="flex justify-end">
                        <button
                            onClick={() => setIsCreatingOffer(!isCreatingOffer)}
                            className="bg-[#6F2DBD] text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-[#5a2499] shadow-lg shadow-purple-200 transition-all flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Create New Offer
                        </button>
                    </div>

                    {isCreatingOffer && (
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 animate-in slide-in-from-top-4 fade-in duration-200">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">New Coupon Details</h3>
                            <form onSubmit={handleCreateOffer} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Coupon Code</label>
                                    <input
                                        required
                                        value={offerCode}
                                        onChange={(e) => setOfferCode(e.target.value.toUpperCase())}
                                        placeholder="SUMMER25"
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#6F2DBD]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Discount (%)</label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        max="100"
                                        value={offerDiscount}
                                        onChange={(e) => setOfferDiscount(e.target.value)}
                                        placeholder="15"
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#6F2DBD]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Valid Until</label>
                                    <input
                                        type="date"
                                        required
                                        value={offerValidUntil}
                                        onChange={(e) => setOfferValidUntil(e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#6F2DBD]"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="bg-black text-white px-6 py-2.5 rounded-xl font-bold hover:bg-gray-800 transition-colors"
                                >
                                    Save Offer
                                </button>
                            </form>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {offers.map((offer) => (
                            <div key={offer.id} className={`relative p-6 rounded-2xl border-2 border-dashed flex flex-col justify-between group transition-all ${offer.isActive ? 'bg-white border-luxe-primary/30' : 'bg-gray-50 border-gray-200 opacity-70'}`}>
                                <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#FBFBFF] rounded-full border-r border-gray-200" />
                                <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#FBFBFF] rounded-full border-l border-gray-200" />

                                <div className="mb-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${offer.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                                            {offer.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                        <button onClick={() => deleteOffer(offer.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                                            <span className="sr-only">Delete</span>
                                            ×
                                        </button>
                                    </div>
                                    <h3 className="text-2xl font-black text-gray-900 tracking-tight">{offer.code}</h3>
                                    <p className="text-[#6F2DBD] font-medium">{offer.discount}% OFF</p>
                                </div>

                                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                                    <div className="text-xs text-gray-500">
                                        Expires: <span className="font-semibold">{offer.validUntil}</span>
                                    </div>
                                    <button
                                        onClick={() => toggleOfferStatus(offer.id, offer.isActive)}
                                        className="text-xs font-bold underline decoration-dotted hover:text-[#6F2DBD]"
                                    >
                                        {offer.isActive ? 'Deactivate' : 'Activate'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    {offers.length === 0 && !isCreatingOffer && (
                        <div className="text-center py-12 text-gray-400">
                            <p>No active offers found. Create one to attract more customers!</p>
                        </div>
                    )}
                </div>
            )}

            <ServiceDetailsModal
                isOpen={!!selectedService}
                onClose={() => setSelectedService(null)}
                service={selectedService}
            />
        </div>
    );
}