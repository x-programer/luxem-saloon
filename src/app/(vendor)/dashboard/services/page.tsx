import { ServiceForm } from "@/components/dashboard/ServiceForm";

export default function ServicesPage() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Services</h1>
            </div>

            {/* For now, just render the form directly as requested */}
            <div className="mt-8">
                <ServiceForm />
            </div>
        </div>
    )
}
