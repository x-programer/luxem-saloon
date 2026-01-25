"use server";

import { adminDb } from "@/lib/firebase/admin";
import { Timestamp } from "firebase-admin/firestore";

export interface AnalyticsData {
    totalRevenue: number;
    totalBookings: number;
    activeClients: number;
    revenueTrends: { name: string; revenue: number }[];
    popularServices: { name: string; value: number; color: string }[];
}

export async function getVendorAnalytics(vendorId: string): Promise<AnalyticsData> {
    if (!vendorId) {
        return {
            totalRevenue: 0,
            totalBookings: 0,
            activeClients: 0,
            revenueTrends: [],
            popularServices: []
        };
    }

    try {
        // Fetch all appointments for the vendor
        // Optimization: In a real app, we might limit this query by date range (e.g., last 30 days)
        // or ensure we have an index on 'date' or 'status'.
        const snapshot = await adminDb
            .collection('users')
            .doc(vendorId)
            .collection('appointments')
            // .where('status', 'in', ['completed', 'confirmed']) // Optional filter
            .get();

        const bookings = snapshot.docs.map(doc => doc.data());

        let totalRevenue = 0;
        let totalBookings = 0;
        const uniqueClients = new Set<string>();
        const serviceCounts: Record<string, number> = {};

        // Initialize last 7 days map for trends
        const trendsMap: Record<string, number> = {};
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const today = new Date();

        // Populate last 7 days with 0
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(today.getDate() - i);
            const dayName = days[d.getDay()];
            trendsMap[dayName] = 0;
            // Note: If you want specific dates like "Jan 24", format differently.
            // For now, day names (Mon, Tue) are simple, but might be ambiguous if spanning > 1 week.
            // Let's stick to day names or short dates "Oct 12".
            // Implementation plan said: "Group bookings by Date... Format: [{name: 'Jan 24', revenue: 400}]"
            // Let's do short date format 'Jan 24'
        }

        // Re-initialize trendsMap with sorted dates for correct order in chart
        const sortedDates: string[] = [];
        const dateRevenueMap: Record<string, number> = {};

        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(today.getDate() - i);
            const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
            const dateStr = d.toLocaleDateString('en-US', options); // "Jan 24"
            sortedDates.push(dateStr);
            dateRevenueMap[dateStr] = 0;
        }

        bookings.forEach(booking => {
            // 1. KPI Stats
            // Only count "valid" bookings for revenue? 
            // If status is cancelled, maybe skip?
            const status = booking.status || 'confirmed';
            if (status === 'cancelled') return;

            const price = Number(booking.price) || 0;
            totalRevenue += price;
            totalBookings += 1;

            if (booking.customerId) uniqueClients.add(booking.customerId);
            else if (booking.customerName) uniqueClients.add(booking.customerName); // Fallback

            // 2. Popular Services
            const serviceName = booking.serviceName || "Unknown Service";
            serviceCounts[serviceName] = (serviceCounts[serviceName] || 0) + 1;

            // 3. Trends
            // Ensure date is handled correctly (Timestamp or string)
            let dateObj: Date;
            if (booking.date instanceof Timestamp) {
                dateObj = booking.date.toDate();
            } else if (booking.date?.toDate) {
                dateObj = booking.date.toDate();
            } else {
                dateObj = new Date(booking.date); // Fallback for ISO strings
            }

            // Check if date is within the last 7 days window
            // Simplistic check: matches one of our keys
            const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
            const dateStr = dateObj.toLocaleDateString('en-US', options);

            if (dateRevenueMap.hasOwnProperty(dateStr)) {
                dateRevenueMap[dateStr] += price;
            }
        });

        // Format Trends
        const revenueTrends = sortedDates.map(date => ({
            name: date,
            revenue: dateRevenueMap[date]
        }));

        // Format Services
        // Sort by count desc, take top 4
        const colors = ['#6F2DBD', '#A663CC', '#D4B4E8', '#E9D5FF', '#F3E8FF'];
        const popularServices = Object.entries(serviceCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([name, value], index) => ({
                name,
                value, // This is count. If chart needs percentage, check usage. Recharts Pie uses raw value just fine.
                color: colors[index % colors.length]
            }));

        // Calculate percentages for services if needed, but Recharts handles raw numbers.
        // However, if we want the chart labels to show %, that's often UI side. 
        // The mock used exact percentages. We'll pass raw counts and let UI handle display or tooltip.
        // Or we can convert to percentage here if totalBookings > 0.
        // Let's stick to raw counts for 'value' so the pie slice size is accurate relationally.
        // But for the LEGEND in the UI, it showed "45%". We might need to adjust UI to show generic count or calc %.

        // Let's refine popularServices to include percentage calc for the UI text?
        // UI code: <span ...>{item.value}%</span>
        // So UI expects a percentage number. Let's convert to percentage.
        const totalServiceCount = Object.values(serviceCounts).reduce((a, b) => a + b, 0);
        const popularServicesWithPct = popularServices.map(item => ({
            ...item,
            value: totalServiceCount > 0 ? Math.round((item.value / totalServiceCount) * 100) : 0
        }));

        return {
            totalRevenue,
            totalBookings,
            activeClients: uniqueClients.size,
            revenueTrends,
            popularServices: popularServicesWithPct
        };

    } catch (error) {
        console.error("Error fetching vendor analytics:", error);
        throw new Error("Failed to fetch analytics");
    }
}
