import { Skeleton } from "@/components/ui/Skeleton";

export function PublicProfileSkeleton() {
    return (
        <div className="min-h-screen bg-[#121212] pb-20">
            {/* Hero Banner Skeleton */}
            <Skeleton className="w-full h-[40vh] md:h-[50vh] rounded-none bg-gray-800" />

            {/* Main Content Container */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 md:-mt-32 relative z-10">
                <div className="bg-[#1a1a1a]/80 backdrop-blur-xl rounded-3xl overflow-hidden min-h-[600px] border border-white/5 shadow-2xl">

                    {/* Header Section */}
                    <div className="p-6 md:p-10 border-b border-white/5">
                        <div className="flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
                            <Skeleton className="w-32 h-32 rounded-full border-4 border-[#121212] shadow-lg shrink-0 bg-gray-800" />
                            <div className="flex-1 space-y-3 w-full flex flex-col items-center md:items-start">
                                <Skeleton className="h-10 w-3/4 md:w-96 bg-gray-800" />
                                <Skeleton className="h-4 w-full md:w-2/3 bg-gray-800" />
                                <div className="flex gap-4 pt-2">
                                    <Skeleton className="h-4 w-24 bg-gray-800" />
                                    <Skeleton className="h-4 w-24 bg-gray-800" />
                                </div>
                            </div>
                            <div className="hidden md:block">
                                <Skeleton className="w-40 h-12 rounded-xl bg-gray-800" />
                            </div>
                        </div>
                    </div>

                    {/* Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-white/5">

                        {/* Left Column: About & Info */}
                        <div className="p-6 md:p-10 space-y-8 lg:col-span-1">
                            <div className="space-y-4">
                                <Skeleton className="h-6 w-32 bg-gray-800" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-full bg-gray-800" />
                                    <Skeleton className="h-4 w-full bg-gray-800" />
                                    <Skeleton className="h-4 w-2/3 bg-gray-800" />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <Skeleton className="h-6 w-32 bg-gray-800" />
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="flex gap-4">
                                        <Skeleton className="w-10 h-10 rounded-lg shrink-0 bg-gray-800" />
                                        <div className="space-y-2 flex-1 pt-1">
                                            <Skeleton className="h-4 w-20 bg-gray-800" />
                                            <Skeleton className="h-3 w-full bg-gray-800" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right Column: Services & Gallery */}
                        <div className="p-6 md:p-10 lg:col-span-2 space-y-10">
                            {/* Featured Services */}
                            <div className="space-y-6">
                                <div className="flex justify-between items-center">
                                    <Skeleton className="h-8 w-48 bg-gray-800" />
                                    <Skeleton className="h-4 w-20 bg-gray-800" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className="p-4 border border-white/5 bg-white/5 rounded-2xl flex gap-4">
                                            <Skeleton className="w-16 h-16 rounded-xl shrink-0 bg-gray-800" />
                                            <div className="space-y-2 flex-1">
                                                <Skeleton className="h-5 w-3/4 bg-gray-800" />
                                                <Skeleton className="h-4 w-1/2 bg-gray-800" />
                                                <div className="flex justify-between pt-2">
                                                    <Skeleton className="h-4 w-16 bg-gray-800" />
                                                    <Skeleton className="h-4 w-12 bg-gray-800" />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Gallery Preview */}
                            <div className="space-y-6">
                                <Skeleton className="h-8 w-48 bg-gray-800" />
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {[1, 2, 3, 4].map(i => (
                                        <Skeleton key={i} className="aspect-square rounded-xl bg-gray-800" />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
