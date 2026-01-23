import { db } from "@/lib/firebase/config";
import { doc, getDoc, setDoc, updateDoc, increment, serverTimestamp, Timestamp } from "firebase/firestore";

interface BookingData {
    vendorUid: string;
    customerName: string;
    customerPhone: string;
    price: number;
    date: Date | Timestamp;
}

export async function upsertClient(booking: BookingData) {
    if (!booking.vendorUid || !booking.customerPhone) {
        console.error("Missing required booking data for upsertClient");
        return;
    }

    // Normalize phone number to use as ID (remove spaces/dashes if any, assuming standard format is provided or strict ID usage)
    const clientId = booking.customerPhone.replace(/\D/g, '');
    const clientRef = doc(db, "users", booking.vendorUid, "clients", clientId);

    const clientSnap = await getDoc(clientRef);

    if (clientSnap.exists()) {
        // Update existing client
        await updateDoc(clientRef, {
            visitCount: increment(1),
            totalSpend: increment(booking.price),
            lastVisit: booking.date,
            // Update name in case they changed it, or keep original? Let's keep latest.
            name: booking.customerName,
            updatedAt: serverTimestamp()
        });
    } else {
        // Create new client
        await setDoc(clientRef, {
            name: booking.customerName,
            phone: booking.customerPhone,
            visitCount: 1,
            totalSpend: booking.price,
            firstVisit: booking.date,
            lastVisit: booking.date,
            notes: "", // Initial empty notes
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
    }
}
