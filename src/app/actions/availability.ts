"use server";

import { adminDb } from "@/lib/firebase/admin";
import { addMinutes, format, parse, isBefore, isAfter, isEqual, set } from "date-fns";
import { Timestamp } from "firebase-admin/firestore";

interface AvailabilitySlot {
    time: string;
    available: boolean;
}

export async function getDayAvailability(vendorId: string, date: string, serviceDuration = 60) {
    try {
        if (!vendorId || !date) throw new Error("Missing vendorId or date");

        // 1. Fetch Vendor Schedule
        const vendorDoc = await adminDb.collection("users").doc(vendorId).get();
        if (!vendorDoc.exists) throw new Error("Vendor not found");

        const vendorData = vendorDoc.data();
        const schedule = vendorData?.schedule;

        // Determine Day of Week (0=Sunday, etc.)
        // Note: date input is "YYYY-MM-DD"
        // We'll parse it as local time to get the day name matching the schedule keys
        const dateObj = parse(date, "yyyy-MM-dd", new Date());
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const dayName = days[dateObj.getDay()];

        const daySchedule = schedule?.[dayName];

        // If closed, return empty or all false? 
        // Typically if closed, no slots should be returned or we can return empty array.
        if (!daySchedule?.isOpen) {
            return [];
        }

        const openTime = daySchedule.open || "09:00";
        const closeTime = daySchedule.close || "17:00";

        // 2. Fetch Existing Bookings for that Date
        // We need to query range: [date 00:00, date 23:59]
        const startOfDay = new Date(`${date}T00:00:00`);
        const endOfDay = new Date(`${date}T23:59:59`);

        // Firestore Timestamp range
        const startTimestamp = Timestamp.fromDate(startOfDay);
        const endTimestamp = Timestamp.fromDate(endOfDay);

        const bookingsSnap = await adminDb
            .collection("users")
            .doc(vendorId)
            .collection("appointments")
            .where("date", ">=", startTimestamp)
            .where("date", "<=", endTimestamp)
            // .where("status", "in", ["confirmed", "pending"]) // 'in' query limitations might apply if we had other filters, but simple here. 
            // Actually, safe to just fetch all and filter in memory for status to avoid index errors if not yet created.
            .get();

        const activeBookings = bookingsSnap.docs
            .map(doc => doc.data())
            .filter(b => ["confirmed", "pending"].includes(b.status));

        // 3. Generate Slots & Check Conflicts
        const slots: AvailabilitySlot[] = [];
        const interval = 30; // 30 min increments

        // Create Date objects for open/close on that specific day
        let currentTime = parse(`${date}T${openTime}`, "yyyy-MM-dd'T'HH:mm", new Date());
        const closingTime = parse(`${date}T${closeTime}`, "yyyy-MM-dd'T'HH:mm", new Date());

        while (isBefore(currentTime, closingTime)) {
            const timeString = format(currentTime, "HH:mm");

            // Define the proposed slot interval
            // [slotStart, slotEnd]
            const slotStart = currentTime;
            const slotEnd = addMinutes(currentTime, serviceDuration);

            // Check if this slot extends beyond closing time
            if (isAfter(slotEnd, closingTime)) {
                // If the service is too long to fit before closing, it's unavailable.
                // We can either mark it unavailable or stop generating. 
                // Let's mark it unavailable but keep generating in case shorter services exist (though we have fixed serviceDuration argument).
                // Actually if we stop, we might miss slots if serviceDuration variable changes?
                // Current logic: strict cutoff.
                slots.push({ time: timeString, available: false });
                currentTime = addMinutes(currentTime, interval);
                continue;
            }

            // Check for overlaps with "Active Bookings"
            const isBusy = activeBookings.some(booking => {
                // Booking Start
                // Booking Date is a Timestamp
                const bStart = (booking.date as Timestamp).toDate();
                // Booking Duration? If missing, assume 60.
                // Ideally we store duration or serviceId->duration. 
                // For now, let's assume 60 if not present, or look up service? 
                // The 'service' object might be in booking data?
                // Prompt says: "Assume a default service duration of 60 mins... for conflict checking"
                // So we assume the EXISTING booking takes 60 mins if we don't know.
                const bDuration = 60;
                const bEnd = addMinutes(bStart, bDuration);

                // Check Intersection
                // Overlap if (StartA < EndB) and (EndA > StartB)
                return isBefore(slotStart, bEnd) && isAfter(slotEnd, bStart);
            });

            slots.push({ time: timeString, available: !isBusy });

            // Increment
            currentTime = addMinutes(currentTime, interval);
        }

        return slots;

    } catch (error: any) {
        console.error("Error fetching availability:", error);
        throw new Error(error.message || "Failed to fetch availability");
    }
}
