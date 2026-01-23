import { Skeleton } from "@/components/ui/Skeleton";

export function DashboardSkeleton() {
    return (
        <div className="space-y-8 pb-10">
            {/* Header Skeleton */}
            <div className="relative w-full rounded-3xl overflow-hidden shadow-soft bg-white border border-gray-100/50">
                <Skeleton className="h-40 w-full" />
                <div className="px-4 md:px-8 pb-6 flex flex-col md:flex-row items-center md:items-end gap-4 md:gap-6 -mt-12 md:-mt-10 relative">
                    <Skeleton className="w-24 h-24 rounded-full border-4 border-white" />
                    <div className="flex-1 mb-1 text-center md:text-left space-y-2 w-full flex flex-col items-center md:items-start">
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-4 w-64" />
                    </div>
                    <div className="hidden md:flex gap-6 mb-1 bg-gray-50/80 p-3 rounded-2xl border border-gray-100">
                        <div className="space-y-1">
                            <Skeleton className="h-3 w-12 ml-auto" />
                            <Skeleton className="h-5 w-20" />
                        </div>
                        <div className="w-px bg-gray-200" />
                        <div className="space-y-1">
                            <Skeleton className="h-3 w-12 ml-auto" />
                            <Skeleton className="h-5 w-20" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start justify-between">
                        <div className="space-y-3">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-8 w-32" />
                            <Skeleton className="h-4 w-20" />
                        </div>
                        <Skeleton className="w-12 h-12 rounded-xl" />
                    </div>
                ))}
            </div>

            {/* Analytics Section Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[400px]">
                <Skeleton className="lg:col-span-2 rounded-2xl h-full" />
                <Skeleton className="rounded-2xl h-full" />
            </div>

            {/* Recent Activity Skeleton */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 space-y-6">
                <div className="flex justify-between items-center">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-9 w-24 rounded-lg" />
                </div>
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-4 py-2">
                        <Skeleton className="w-10 h-10 rounded-full" />
                        <div className="space-y-2 flex-1">
                            <Skeleton className="h-4 w-full max-w-[200px]" />
                            <Skeleton className="h-3 w-full max-w-[150px]" />
                        </div>
                        <Skeleton className="w-20 h-8 rounded-lg" />
                    </div>
                ))}
            </div>
        </div>
    );
}
