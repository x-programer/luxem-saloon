import { Metadata } from "next";
import PublicProfileClient from "@/components/vendor/PublicProfileClient";
import { db } from "@/lib/firebase/config";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";

// Server-side helper for metadata only - Try/Catch wrapper
async function getVendorDataServer(slug: string) {
    try {
        // Warning: This might fail on some server environments with Client SDK
        // If it fails, we catch it and return null, allowing the Client Component to take over fetching.

        // 1. Try fetching by UID
        const userDocRef = doc(db, 'users', slug);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
            return userDocSnap.data();
        }

        // 2. Try fetching by slug
        const q = query(collection(db, 'users'), where('slug', '==', slug));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            return querySnapshot.docs[0].data();
        }

        return null;
    } catch (error) {
        // Silently fail on server to avoid 500 pages -> Client will handle the real 404
        console.warn("Server-side fetch failed (Metadata), falling back to client fetch:", error);
        return null;
    }
}

export async function generateMetadata({ params }: { params: Promise<{ vendor_slug: string }> }): Promise<Metadata> {
    const { vendor_slug } = await params;
    const vendorData: any = await getVendorDataServer(vendor_slug);

    if (!vendorData) {
        return {
            title: "Luxe Salon | Book Online",
        }
    }

    return {
        title: `${vendorData.salonName || "Luxe Salon"} | Book Online`,
        description: vendorData.description || "Book your appointment online.",
        openGraph: {
            title: vendorData.salonName,
            description: vendorData.description,
            images: [vendorData.coverImage || ""],
        },
    };
}

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

// 1. Fetch Vendor Core Data
async function getVendorData(slug: string) {
    try {
        // Try fetching by UID
        const userDocRef = doc(db, 'users', slug);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
            return serializeDoc(userDocSnap);
        }

        // Try fetching by slug
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

// 2. Fetch Helper for Subcollections
async function getSubcollection(uid: string, collectionName: string) {
    try {
        // Services are root-level with uid field
        if (collectionName === 'services') {
            const q = query(collection(db, 'services'), where('uid', '==', uid));
            const snap = await getDocs(q);
            return snap.docs.map(d => serializeDoc(d));
        }

        // Others are subcollections
        const q = query(collection(db, 'users', uid, collectionName));
        const snap = await getDocs(q);
        return snap.docs.map(d => serializeDoc(d));
    } catch (error) {
        // console.error(`Error fetching ${collectionName}:`, error);
        return [];
    }
}

export default async function VendorProfilePage({ params }: { params: Promise<{ vendor_slug: string }> }) {
    const { vendor_slug } = await params;
    const vendorData: any = await getVendorData(vendor_slug);

    if (!vendorData) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#121212] p-4 text-center">
                <h1 className="text-2xl font-bold text-white mb-2">Vendor Not Found</h1>
                <p className="text-gray-400">The page you are looking for does not exist.</p>
            </div>
        );
    }

    // Parallel Fetching
    const [services, staff, products] = await Promise.all([
        getSubcollection(vendorData.id, 'services'),
        getSubcollection(vendorData.id, 'staff'),
        getSubcollection(vendorData.id, 'products')
    ]);

    // Construct full object
    const fullVendorProfile = {
        uid: vendorData.id,
        businessName: vendorData.salonName || "Luxe Salon",
        description: vendorData.description || "Experience the pinnacle of beauty and wellness.",
        themePreference: vendorData.theme || 'royal',
        profileImage: vendorData.coverImage || "https://images.unsplash.com/photo-1600948836101-f9ffda59d250?q=80&w=1200&auto=format&fit=crop",
        banner: vendorData.banner || null,
        logo: vendorData.logo || null,
        showLogo: vendorData.showLogo,
        address: vendorData.address || "Downtown Luxury District",
        gallery: vendorData.gallery || [],
        services: services,
        staff: staff,
        products: products,
        schedule: vendorData.schedule || {},
        isBookingEnabled: vendorData.isBookingEnabled !== false ? vendorData.isBookingEnabled : false,
        externalLinks: vendorData.externalLinks || []
    };

    return <PublicProfileClient vendor={fullVendorProfile} />;
}
