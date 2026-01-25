"use server";

import { adminDb } from "@/lib/firebase/admin";

export interface AppointmentHistoryItem {
    id: string;
    date: string;
    time: string;
    serviceName: string;
    price: number;
    status: string;
    clientName: string; // 👈 NEW FIELD
}

export interface ClientStats {
    id: string;
    name: string;
    email: string | null;
    phone: string;
    visitCount: number;
    totalSpend: number;
    lastVisit: string;
    firstVisit: string;
    history: AppointmentHistoryItem[];
}

export async function getAggregatedClients(vendorId: string) {
    if (!vendorId) return [];

    try {
        const appointmentsRef = adminDb
            .collection('users')
            .doc(vendorId)
            .collection('appointments');

        const snapshot = await appointmentsRef.get();

        if (snapshot.empty) return [];

        const clientsMap = new Map<string, ClientStats>();

        snapshot.docs.forEach(doc => {
            const data = doc.data();

            // Standardization
            const cId = data.customerId ? String(data.customerId).trim() : '';
            const cPhone = data.customerPhone ? String(data.customerPhone).trim() : '';
            const cEmail = data.customerEmail ? String(data.customerEmail).trim() : '';
            const cName = data.customerName ? String(data.customerName).trim() : 'Unknown Guest';

            // Grouping Priority
            let clientId = '';
            if (cId) clientId = cId;
            else if (cPhone) clientId = cPhone;
            else if (cEmail) clientId = cEmail;
            else if (cName) clientId = cName.toLowerCase();
            else clientId = doc.id;

            if (!clientId) return;

            const price = Number(data.price) || 0;
            let bookingDate = data.date?.toDate ? data.date.toDate() : new Date(data.date || 0);

            // 👈 POPULATE THE NEW FIELD
            const historyItem: AppointmentHistoryItem = {
                id: doc.id,
                date: bookingDate.toISOString(),
                time: data.time || 'N/A',
                serviceName: data.serviceName || 'Unknown Service',
                price: price,
                status: data.status || 'pending',
                clientName: cName, // Store the specific name used for THIS booking
            };

            const existing = clientsMap.get(clientId);

            if (!existing) {
                clientsMap.set(clientId, {
                    id: clientId,
                    name: cName,
                    email: cEmail || null,
                    phone: cPhone || 'N/A',
                    visitCount: 1,
                    totalSpend: price,
                    lastVisit: bookingDate.toISOString(),
                    firstVisit: bookingDate.toISOString(),
                    history: [historyItem]
                });
            } else {
                existing.visitCount += 1;
                existing.totalSpend += price;
                existing.history.push(historyItem);

                // Update "Main Client Details" if this is a newer visit
                if (bookingDate > new Date(existing.lastVisit)) {
                    existing.lastVisit = bookingDate.toISOString();
                    // Optional: Update main name only if it seems like a correction, 
                    // otherwise keep the most common one. For now, we update it.
                    existing.name = cName;
                    if (cPhone && cPhone !== 'N/A') existing.phone = cPhone;
                    if (cEmail) existing.email = cEmail;
                }
            }
        });

        return Array.from(clientsMap.values())
            .map(client => {
                client.history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                return client;
            })
            .sort((a, b) => new Date(b.lastVisit).getTime() - new Date(a.lastVisit).getTime());

    } catch (error) {
        console.error("Error aggregating clients:", error);
        throw new Error("Failed to fetch client list.");
    }
}

export async function deleteClientAction(vendorId: string, appointmentIds: string[]) {
    if (!vendorId || !appointmentIds.length) return { success: false, error: "Invalid request" };

    try {
        const batch = adminDb.batch();

        appointmentIds.forEach(id => {
            const ref = adminDb
                .collection('users')
                .doc(vendorId)
                .collection('appointments')
                .doc(id);
            batch.delete(ref);
        });

        await batch.commit();
        return { success: true };
    } catch (error) {
        console.error("Error deleting client data:", error);
        return { success: false, error: "Failed to delete client data" };
    }
}