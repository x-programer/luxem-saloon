import { Skeleton } from "@/components/ui/Skeleton";

export function ServiceListSkeleton() {
    return (
        <div className="space-y-8 relative min-h-screen pb-10">
            {/* Header Skeleton */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-64" />
                </div>
                <Skeleton className="h-10 w-48 rounded-xl" />
            </div>

            {/* Content Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4">
                        <div className="flex gap-4">
                            <Skeleton className="w-16 h-16 rounded-xl shrink-0" />
                            <div className="space-y-2 flex-1 pt-1">
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-3 w-1/2" />
                            </div>
                        </div>
                        <div className="space-y-2 pt-2">
                            <Skeleton className="h-3 w-full" />
                            <Skeleton className="h-3 w-5/6" />
                        </div>
                        <div className="pt-3 flex justify-between items-center border-t border-gray-50">
                            <Skeleton className="h-5 w-16" />
                            <Skeleton className="h-8 w-8 rounded-lg" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
