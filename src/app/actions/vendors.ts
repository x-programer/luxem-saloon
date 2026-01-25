"use server";

import { adminDb } from "@/lib/firebase/admin";

export interface VendorPreview {
    id: string;
    slug: string;
    businessName: string;
    address: string;
    city: string;
    coverImage: string;
    services: string[]; // Simplified list of service names or categories
}

import { unstable_cache } from "next/cache";

// Internal fetch function (renamed)
async function fetchAllVendors(searchQuery?: string, searchCity?: string) {
    try {
        // 1. Validation & Sanitization
        let query = searchQuery?.trim().toLowerCase() || "";
        let cityFilter = searchCity?.trim().toLowerCase() || "";

        // Manual strict validation (simulating Zod)
        if (query.length > 100) query = query.substring(0, 100);
        if (cityFilter.length > 50) cityFilter = cityFilter.substring(0, 50);

        // Remove dangerous characters (basic XSS prevention for search logic)
        query = query.replace(/[<>]/g, "");
        cityFilter = cityFilter.replace(/[<>]/g, "");

        // 2. Fetch All Vendors (Optimized for MVP)
        // Note: For MVP with <1000 vendors, fetching all and filtering in-memory is acceptable 
        // and provides better search relevance than basic Firestore inequality queries.
        const snapshot = await adminDb
            .collection('users')
            .where('role', '==', 'vendor')
            .get();

        const vendors: VendorPreview[] = [];

        // 3. Parallel Hydration
        await Promise.all(snapshot.docs.map(async (doc) => {
            const data = doc.data();

            // Fetch services for filtering
            const servicesSnap = await adminDb.collection('services').where('uid', '==', doc.id).limit(5).get();
            const serviceNames = servicesSnap.docs.map(s => s.data().name);

            // Normalize City
            const vendorCity = (data.city || (data.address ? data.address.split(',')[1]?.trim() : "")).toLowerCase();
            const vendorAddress = (data.address || "").toLowerCase();
            const businessName = (data.salonName || data.businessName || "Luxe Salon").toLowerCase();

            // 4. Filtering Logic
            let matchesQuery = true;
            let matchesCity = true;

            if (query) {
                const combinedText = `${businessName} ${serviceNames.join(" ")}`.toLowerCase();
                matchesQuery = combinedText.includes(query);
            }

            if (cityFilter) {
                // Check exact city match OR if city is part of address string
                matchesCity = vendorCity.includes(cityFilter) || vendorAddress.includes(cityFilter);
            }

            if (matchesQuery && matchesCity) {
                vendors.push({
                    id: doc.id,
                    slug: data.slug || doc.id,
                    businessName: data.salonName || data.businessName || "Luxe Salon",
                    address: data.address || "",
                    city: data.city || (data.address ? data.address.split(',')[1]?.trim() : "Unknown City"),
                    coverImage: data.coverImage || "https://images.unsplash.com/photo-1521590832898-947c13a8ba3b?q=80&w=1200&auto=format&fit=crop",
                    services: serviceNames
                });
            }
        }));

        return { success: true, vendors };

    } catch (error: any) {
        console.error("Error fetching vendors:", error);
        return { success: false, error: error.message };
    }
}

// 🚀 Cached Version (Public Export)
export const getAllVendors = unstable_cache(
    async (searchQuery?: string, searchCity?: string) => fetchAllVendors(searchQuery, searchCity),
    ['all-vendors-list'], // Key parts
    {
        tags: ['vendors'], // Cache Tag for revalidation
        revalidate: 3600 // Revalidate every hour
    }
);
