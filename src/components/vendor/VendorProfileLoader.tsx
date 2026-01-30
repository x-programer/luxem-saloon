"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase/config";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import PublicProfileClient from "@/components/vendor/PublicProfileClient";
import { Loader2 } from "lucide-react";
import { PublicProfileSkeleton } from "@/components/skeletons/PublicProfileSkeleton";

// Helper to serialize (simplify for client usage)
const serializeDoc = (doc: any) => {
    const data = doc.data();
    return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.().toISOString() || null,
        updatedAt: data.updatedAt?.toDate?.().toISOString() || null,
    };
};

async function getVendorData(slug: string) {
    try {
        // 1. Try fetching by UID (User ID)
        const userDocRef = doc(db, 'users', slug);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
            return serializeDoc(userDocSnap);
        }

        // 2. Try fetching by custom 'slug' field
        const q = query(collection(db, 'users'), where('slug', '==', slug));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            return serializeDoc(querySnapshot.docs[0]);
        }

        return null;
    } catch (error) {
        console.error("Error fetching vendor:", error);
        return null;
    }
}

async function getVendorServices(uid: string) {
    try {
        const q = query(collection(db, 'services'), where('uid', '==', uid));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => serializeDoc(doc) as any);
    } catch (error) {
        console.error("Error fetching services:", error);
        return [];
    }
}

async function getVendorSubcollection(uid: string, subcollectionName: string) {
    try {
        const q = query(collection(db, 'users', uid, subcollectionName));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => serializeDoc(doc) as any);
    } catch (error) {
        console.error(`Error fetching ${subcollectionName}:`, error);
        return [];
    }
}

export default function VendorProfileLoader({ slug }: { slug: string }) {
    const [vendor, setVendor] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            const data = await getVendorData(slug);

            if (!data) {
                setNotFound(true);
            } else {
                const services = await getVendorServices(data.id);
                const staff = await getVendorSubcollection(data.id, 'staff');
                const products = await getVendorSubcollection(data.id, 'products');

                setVendor({
                    uid: data.id,
                    businessName: data.salonName || "Saloon Book",
                    description: data.description || "Experience the pinnacle of beauty and wellness.",
                    themePreference: data.theme || 'royal',
                    profileImage: data.coverImage || "https://images.unsplash.com/photo-1600948836101-f9ffda59d250?q=80&w=1200&auto=format&fit=crop",
                    banner: data.banner || null,
                    logo: data.logo || null,
                    showLogo: data.showLogo,
                    address: data.address || "Downtown Luxury District",
                    gallery: data.gallery || [],
                    services: services,
                    staff: staff,
                    products: products,
                    schedule: data.schedule || {},
                    isBookingEnabled: data.isBookingEnabled !== false
                        ? data.isBookingEnabled : false,
                    externalLinks: data.externalLinks || []
                });
            }
            setLoading(false);
        };

        fetch();
    }, [slug]);

    if (loading) {
        return <PublicProfileSkeleton />;
    }

    if (notFound || !vendor) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Vendor Not Found</h1>
                <p className="text-gray-500">The page you are looking for does not exist.</p>
            </div>
        );
    }

    return <PublicProfileClient vendor={vendor} />;
}
