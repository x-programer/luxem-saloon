import { Skeleton } from "@/components/ui/Skeleton";

export function ClientsSkeleton() {
    return (
        <div className="space-y-8 min-h-screen pb-20">
            {/* Header Skeleton */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-64" />
                </div>
                <Skeleton className="h-10 w-full sm:w-64 rounded-xl" />
            </div>

            {/* Clients Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-4">
                        <Skeleton className="w-14 h-14 rounded-full shrink-0" />
                        <div className="space-y-2 flex-1 pt-1">
                            <Skeleton className="h-5 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                            <div className="flex gap-2 pt-2">
                                <Skeleton className="h-6 w-16 rounded-lg" />
                                <Skeleton className="h-6 w-16 rounded-lg" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
