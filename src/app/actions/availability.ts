"use server";

import { adminDb } from "@/lib/firebase/admin";
import { addMinutes, format, parse, isBefore, isAfter, startOfDay, endOfDay } from "date-fns";
import { Timestamp } from "firebase-admin/firestore";

interface AvailabilitySlot {
    time: string; // "09:30"
    display: string; // "9:30 AM"
    available: boolean;
}

export async function getDayAvailability(vendorId: string, dateString: string, serviceDuration: number = 30) {
    try {
        if (!vendorId || !dateString) throw new Error("Missing vendorId or date");

        console.log(`[Availability] Checking for ${dateString}, Service Duration: ${serviceDuration} min`);

        // 1. Fetch Vendor Schedule
        const vendorDoc = await adminDb.collection("users").doc(vendorId).get();
        if (!vendorDoc.exists) throw new Error("Vendor not found");

        const vendorData = vendorDoc.data();
        const schedule = vendorData?.schedule;

        // Parse Date & Determine Day of Week
        const queryDate = parse(dateString, "yyyy-MM-dd", new Date());
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const dayName = days[queryDate.getDay()];

        // Get Schedule (Default to 9-5 if missing)
        const daySchedule = schedule?.[dayName];
        const isOpen = daySchedule?.isOpen ?? true; // Default open if not set
        const openTime = daySchedule?.open || "09:00";
        const closeTime = daySchedule?.close || "17:00";

        if (!isOpen) return []; // Closed for the day

        // 2. Fetch Existing Bookings (Full Day Range)
        const startTimestamp = Timestamp.fromDate(startOfDay(queryDate));
        const endTimestamp = Timestamp.fromDate(endOfDay(queryDate));

        const bookingsSnap = await adminDb
            .collection("users")
            .doc(vendorId)
            .collection("appointments")
            .where("date", ">=", startTimestamp)
            .where("date", "<=", endTimestamp)
            .where("status", "in", ["confirmed", "pending"]) // Only active bookings
            .get();

        const activeBookings = bookingsSnap.docs.map(doc => {
            const data = doc.data();
            return {
                time: data.time, // "14:00" string stored in DB
                duration: data.duration || 60 // Read from DB or default to 60
            };
        });

        console.log(`[Availability] ${dateString}: Found ${activeBookings.length} active bookings.`);

        // 3. Generate Slots
        const slots: AvailabilitySlot[] = [];
        const interval = 30; // 30 min increments for START times

        // Create Date objects for Loop
        let currentTime = parse(`${dateString}T${openTime}`, "yyyy-MM-dd'T'HH:mm", new Date());
        const closingTime = parse(`${dateString}T${closeTime}`, "yyyy-MM-dd'T'HH:mm", new Date());
        const now = new Date(); // Current time for "past slot" check

        while (isBefore(currentTime, closingTime)) {
            const timeString = format(currentTime, "HH:mm"); // "09:30"
            const displayTime = format(currentTime, "h:mm a"); // "9:30 AM"

            // Slot Range: [Start, Start + User's Service Duration]
            const slotStart = currentTime;
            const slotEnd = addMinutes(currentTime, serviceDuration);

            // Constraint 1: Must finish before closing
            if (isAfter(slotEnd, closingTime)) {
                break; // Stop generating slots that go past closing
            }

            // Constraint 2: Must not overlap with existing bookings
            const isConflict = activeBookings.some(booking => {
                // Parse existing booking start time
                const bookingStart = parse(`${dateString}T${booking.time}`, "yyyy-MM-dd'T'HH:mm", new Date());
                const bookingEnd = addMinutes(bookingStart, booking.duration);

                // Overlap formula: (StartA < EndB) and (EndA > StartB)
                // A = Proposed Slot, B = Existing Booking
                return isBefore(slotStart, bookingEnd) && isAfter(slotEnd, bookingStart);
            });

            // Constraint 3: Must not be in the past (if today)
            const isPast = (format(now, "yyyy-MM-dd") === dateString) && isBefore(currentTime, now);

            slots.push({
                time: timeString,
                display: displayTime,
                available: !isConflict && !isPast
            });

            // Increment generated slot start times by interval
            currentTime = addMinutes(currentTime, interval);
        }

        return slots;

    } catch (error: any) {
        console.error("Error fetching availability:", error);
        throw new Error(error.message || "Failed to fetch availability");
    }
}