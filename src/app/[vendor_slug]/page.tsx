import { ThemeWrapper } from "@/components/theme/ThemeWrapper";
import { notFound } from "next/navigation";
import { Calendar, Clock, MapPin, Star, Share2, Check } from "lucide-react";

// Mock Data Fetcher
async function getVendor(slug: string) {
    // In real app: await db.collection('vendors').where('slug', '==', slug).get()

    // Simulate Theme Switching based on slug for demo
    const themes = ['minimal_zen', 'dark_luxury', 'medical_clean'];
    const themeIndex = slug.length % 3;

    return {
        businessName: slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        description: "Experience the pinnacle of beauty and wellness. Our experts are dedicated to providing personalized treatments in a serene environment, using only the finest products to ensure your complete satisfaction and rejuvenation.",
        themePreference: themes[themeIndex] as 'minimal_zen' | 'dark_luxury' | 'medical_clean',
        profileImage: "https://images.unsplash.com/photo-1600948836101-f9ffda59d250?q=80&w=1200&auto=format&fit=crop",
        gallery: [
            "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=800",
            "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?q=80&w=800",
            "https://images.unsplash.com/photo-1522337660859-02fbefca4702?q=80&w=800",
            "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?q=80&w=800"
        ],
        services: [
            { name: "Signature HydraFacial", price: "$120", duration: "60m" },
            { name: "Deep Tissue Massage", price: "$150", duration: "90m" },
            { name: "Executive Hair Styling", price: "$80", duration: "45m" },
            { name: "Vitamin C Peel", price: "$95", duration: "30m" },
        ]
    };
}

export default async function VendorProfilePage({ params }: { params: { vendor_slug: string } }) {
    const vendor = await getVendor(params.vendor_slug);

    if (!vendor) return notFound();

    return (
        <ThemeWrapper theme={vendor.themePreference}>
            {/* Header / Hero */}
            <header className="relative h-[50vh] min-h-[400px] overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={vendor.profileImage} alt={vendor.businessName} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex items-end">
                    <div className="container mx-auto px-6 pb-12">
                        <span className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-white text-xs font-medium mb-6 border border-white/20 uppercase tracking-widest">
                            {vendor.themePreference.replace('_', ' ')}
                        </span>
                        <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 tracking-tight">{vendor.businessName}</h1>
                        <div className="flex flex-wrap items-center text-white/90 text-sm md:text-base gap-6 font-light">
                            <span className="flex items-center"><MapPin className="w-4 h-4 mr-2" /> Downtown Luxury District</span>
                            <span className="flex items-center"><Star className="w-4 h-4 mr-2 text-yellow-400 fill-yellow-400" /> 4.9 (128 Reviews)</span>
                            <span className="flex items-center"><Clock className="w-4 h-4 mr-2" /> Open until 8:00 PM</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Content */}
            <div className="container mx-auto px-6 py-16">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-16">
                        <section>
                            <h2 className="text-3xl font-semibold mb-6 opacity-90">About Us</h2>
                            <p className="text-lg leading-relaxed opacity-70 font-light">{vendor.description}</p>
                        </section>

                        <section>
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-3xl font-semibold opacity-90">Services Menu</h2>
                                <span className="text-sm opacity-50 uppercase tracking-wider">{vendor.services.length} Treatments Available</span>
                            </div>

                            <div className="grid gap-4">
                                {vendor.services.map((service, idx) => (
                                    <div key={idx} className="flex flex-col md:flex-row md:items-center justify-between p-6 rounded-2xl bg-current/[0.03] border border-current/[0.05] hover:bg-current/[0.05] transition-all cursor-pointer group hover:scale-[1.01] duration-300">
                                        <div className="mb-4 md:mb-0">
                                            <h3 className="font-medium text-xl group-hover:translate-x-1 transition-transform">{service.name}</h3>
                                            <p className="text-sm opacity-50 mt-1 flex items-center">
                                                <Clock className="w-3 h-3 mr-1" /> {service.duration} • Full Treatment
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-6 justify-between md:justify-end">
                                            <span className="font-semibold text-2xl opacity-90">{service.price}</span>
                                            <button className="px-6 py-3 rounded-full bg-black text-white text-sm font-medium hover:opacity-80 transition-opacity dark:bg-white dark:text-black shadow-lg">
                                                Book Now
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section>
                            <h2 className="text-3xl font-semibold mb-8 opacity-90">Gallery</h2>
                            <div className="grid grid-cols-2 gap-4">
                                {vendor.gallery.map((img, idx) => (
                                    <div key={idx} className="aspect-[4/3] rounded-xl overflow-hidden relative group cursor-zoom-in">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={img} alt="Gallery" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Sidebar / Sticky Info */}
                    <div className="space-y-8">
                        <div className="p-8 rounded-3xl border border-current/[0.1] bg-current/[0.02] backdrop-blur-sm sticky top-8">
                            <h3 className="font-semibold text-2xl mb-6">Location & Hours</h3>
                            <div className="space-y-4 text-sm opacity-70 mb-8">
                                <p className="flex justify-between border-b border-current/[0.1] pb-2"><span>Monday - Friday</span> <span>9:00 AM - 8:00 PM</span></p>
                                <p className="flex justify-between border-b border-current/[0.1] pb-2"><span>Saturday</span> <span>10:00 AM - 6:00 PM</span></p>
                                <p className="flex justify-between"><span>Sunday</span> <span>Closed</span></p>
                            </div>
                            <button className="w-full py-4 rounded-xl border border-current/[0.2] font-medium hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all flex items-center justify-center uppercase tracking-wider text-xs">
                                <Share2 className="w-4 h-4 mr-2" /> Share Profile
                            </button>
                        </div>

                        <div className="p-8 rounded-3xl bg-indigo-600 text-white shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
                            <h3 className="font-bold text-xl mb-2 relative z-10">First Time Visitor?</h3>
                            <p className="text-indigo-100 text-sm mb-6 relative z-10">Get 15% off your first booking with code LUXE15.</p>
                            <button className="w-full py-3 rounded-lg bg-white text-indigo-600 font-bold text-sm hover:bg-indigo-50 transition-colors relative z-10">
                                Claim Offer
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </ThemeWrapper>
    );
}
