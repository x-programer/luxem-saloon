import { Skeleton } from "@/components/ui/Skeleton";

export function GallerySkeleton() {
    return (
        <div className="space-y-8 min-h-screen pb-20">
            {/* Header Skeleton */}
            <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-64" />
            </div>

            {/* Banner Section Skeleton */}
            <div className="space-y-4">
                <div className="flex justify-between items-center max-w-4xl">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-5 w-16" />
                </div>
                <Skeleton className="w-full max-w-4xl h-48 md:h-64 rounded-2xl" />
            </div>

            <div className="h-px bg-gray-100 w-full" />

            {/* Gallery Grid Skeleton */}
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-5 w-12 rounded-full" />
                </div>
                <Skeleton className="h-4 w-64" />

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="aspect-square relative flex flex-col items-center justify-center p-4 border border-gray-100 rounded-2xl bg-gray-50/50">
                            <Skeleton className="w-full h-full rounded-xl" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
