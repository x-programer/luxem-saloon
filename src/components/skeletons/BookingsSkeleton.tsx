import { Skeleton } from "@/components/ui/Skeleton";

export function BookingsSkeleton() {
    return (
        <div className="space-y-8 min-h-screen pb-20">
            {/* Header Skeleton */}
            <div className="space-y-2">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-48" />
            </div>

            {/* Tabs Skeleton */}
            <div className="flex p-1 bg-white rounded-xl border border-gray-100 shadow-sm w-full md:w-fit gap-1">
                {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-10 w-24 rounded-lg" />
                ))}
            </div>

            {/* Bookings List Skeleton */}
            <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 md:p-6 shadow-sm flex flex-col md:flex-row gap-6 relative overflow-hidden">
                        {/* Status Line */}
                        <Skeleton className="absolute left-0 top-0 bottom-0 w-1.5 h-full rounded-l-2xl" />

                        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 pl-2 w-full">
                            {/* Time */}
                            <div className="min-w-[100px] space-y-2">
                                <Skeleton className="h-8 w-16" />
                                <Skeleton className="h-4 w-20" />
                            </div>

                            {/* Customer Profile */}
                            <div className="flex-1 flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full">
                                <Skeleton className="w-12 h-12 rounded-full shrink-0" />
                                <div className="space-y-2 flex-1">
                                    <Skeleton className="h-6 w-48" />
                                    <div className="flex gap-4">
                                        <Skeleton className="h-4 w-24" />
                                        <Skeleton className="h-4 w-16" />
                                    </div>
                                </div>
                                <Skeleton className="h-10 w-32 rounded-lg" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
