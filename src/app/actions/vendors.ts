"use server";

import { adminDb } from "@/lib/firebase/admin";
import { unstable_cache } from "next/cache";

export interface VendorPreview {
    id: string;
    slug: string;
    businessName: string;
    address: string;
    city: string;
    coverImage: string;
    services: string[]; // Simplified list of service names or categories
}

// Internal fetch function
async function fetchAllVendors(searchQuery?: string, searchCity?: string) {
    try {
        // 1. Validation & Sanitization
        let query = searchQuery?.trim().toLowerCase() || "";
        let cityFilter = searchCity?.trim().toLowerCase() || "";

        // Manual strict validation (simulating Zod)
        if (query.length > 100) query = query.substring(0, 100);
        if (cityFilter.length > 50) cityFilter = cityFilter.substring(0, 50);

        // Security: Remove dangerous characters (Allow only alphanumeric, spaces, ., -, and ,)
        query = query.replace(/[^a-z0-9 .,-]/g, "");
        cityFilter = cityFilter.replace(/[^a-z0-9 .,-]/g, "");

        // 2. Fetch All Vendors
        const snapshot = await adminDb
            .collection('users')
            //.where('role', '==', 'vendor') // Uncomment if you have roles set up
            .get();

        const vendors: VendorPreview[] = [];

        // 3. Parallel Hydration
        await Promise.all(snapshot.docs.map(async (doc) => {
            const data = doc.data();

            // Fetch services for filtering
            const servicesSnap = await adminDb.collection('services').where('uid', '==', doc.id).limit(5).get();
            const serviceNames = servicesSnap.docs.map(s => s.data().name);

            // ✅ SMART MAPPING FIX: Handle different field names for the name
            // Database has 'displayName' (e.g. "Ruhi"), code might look for 'businessName'
            const rawName = data.displayName || data.businessName || data.salonName || "Saloon Book";
            const businessName = rawName.toLowerCase();

            // Normalize City (Safe Fallback to prevent crash)
            let derivedCity = data.city || "";
            if (!derivedCity && data.address && data.address.includes(',')) {
                derivedCity = data.address.split(',')[1]?.trim() || "";
            }
            const vendorCity = derivedCity.toLowerCase();
            const vendorAddress = (data.address || "").toLowerCase();

            // 4. Filtering Logic
            let matchesQuery = true;
            let matchesCity = true;

            if (query) {
                // Smart Search: Check Name, City, OR Address
                // Also check combined text for keyword matches within services
                const combinedServices = serviceNames.join(" ").toLowerCase();

                const matchesName = businessName.includes(query);
                const matchesCitySearch = vendorCity.includes(query);
                const matchesAddress = vendorAddress.includes(query);
                const matchesServices = combinedServices.includes(query);

                // Debug log to help you verify matches in terminal
                // console.log(`Checking: "${businessName}" against "${query}" -> Match? ${matchesName}`);

                matchesQuery = matchesName || matchesCitySearch || matchesAddress || matchesServices;
            }

            if (cityFilter) {
                // Check exact city match OR if city is part of address string
                matchesCity = vendorCity.includes(cityFilter) || vendorAddress.includes(cityFilter);
            }

            if (matchesQuery && matchesCity) {
                vendors.push({
                    id: doc.id,
                    slug: data.slug || doc.id,
                    businessName: rawName, // ✅ Use the correctly mapped name
                    address: data.address || "No address provided",
                    city: derivedCity || "Unknown City",
                    coverImage: data.banner || data.coverImage || "https://images.unsplash.com/photo-1521590832898-947c13a8ba3b?q=80&w=1200&auto=format&fit=crop",
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
    ['all-vendors-list'],
    {
        tags: ['vendors'], // Cache Tag for revalidation
        revalidate: 60 // Revalidate every 60 seconds (Good for live debugging)
    }
);