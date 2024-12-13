import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimelineIndicatorProps {
    isCompleted: boolean;
    isLast?: boolean;
}

export function TimelineIndicator({ isCompleted, isLast = false }: TimelineIndicatorProps) {
    return (
        <div className="absolute -left-[15px] top-[35px] z-10">
            <div
                className={cn(
                    "flex h-5 w-5 items-center justify-center rounded-full",
                    "transition-all duration-200 ease-in-out",
                    isCompleted
                        ? "bg-green-500 text-white"
                        : "bg-gray-300 text-white",
                    "shadow-sm"
                )}
            >
                <Check className="h-4 w-4" />
            </div>
        </div>
    );
}