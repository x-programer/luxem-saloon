import { ServiceForm } from "@/components/dashboard/ServiceForm";

export default function NewServicePage() {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Create New Service</h1>
            <ServiceForm />
        </div>
    );
}
