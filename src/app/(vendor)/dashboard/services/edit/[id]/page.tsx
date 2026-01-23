"use client";

import { ServiceForm } from "@/components/dashboard/ServiceForm";
import { db } from "@/lib/firebase/config";
import { doc, getDoc } from "firebase/firestore";
import { Loader2 } from "lucide-react";
import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";

export default function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [serviceData, setServiceData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchService = async () => {
            try {
                const docRef = doc(db, "services", id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setServiceData(docSnap.data());
                } else {
                    console.error("No such service!");
                    router.push("/dashboard/services");
                }
            } catch (error) {
                console.error("Error fetching service:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchService();
    }, [id, router]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 text-[#6F2DBD] animate-spin" />
            </div>
        );
    }

    if (!serviceData) return null;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Edit Service</h1>
            <ServiceForm initialData={serviceData} serviceId={id} />
        </div>
    );
}
