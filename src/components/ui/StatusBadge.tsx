import { cn } from "@/lib/utils";

type StatusType = 'confirmed' | 'pending' | 'cancelled' | 'completed';

interface StatusBadgeProps {
    status: StatusType;
    className?: string;
}

const statusConfig: Record<StatusType, string> = {
    confirmed: "bg-green-50 text-green-700 border-green-100",
    pending: "bg-orange-50 text-orange-700 border-orange-100",
    cancelled: "bg-red-50 text-red-700 border-red-100",
    completed: "bg-blue-50 text-blue-700 border-blue-100",
};

const statusLabels: Record<StatusType, string> = {
    confirmed: "Confirmed",
    pending: "Pending",
    cancelled: "Cancelled",
    completed: "Completed",
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
    return (
        <div
            className={cn(
                "px-3 py-1 rounded-full text-xs font-medium border",
                statusConfig[status],
                className
            )}
        >
            {statusLabels[status]}
        </div>
    );
}
