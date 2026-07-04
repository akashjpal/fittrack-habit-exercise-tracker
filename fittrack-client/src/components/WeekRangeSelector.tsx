import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, isSameWeek } from "date-fns";

interface WeekRangeSelectorProps {
    weekStart: Date;
    weekEnd: Date;
    onRangeChange: (startDate: Date, endDate: Date) => void;
}

export default function WeekRangeSelector({ weekStart, weekEnd, onRangeChange }: WeekRangeSelectorProps) {
    const isCurrentWeek = isSameWeek(new Date(), weekStart, { weekStartsOn: 0 });

    const handlePreviousWeek = () => {
        const newStart = subWeeks(weekStart, 1);
        const newEnd = endOfWeek(newStart, { weekStartsOn: 0 });
        newEnd.setHours(23, 59, 59, 999);
        onRangeChange(newStart, newEnd);
    };

    const handleNextWeek = () => {
        const newStart = addWeeks(weekStart, 1);
        const newEnd = endOfWeek(newStart, { weekStartsOn: 0 });
        newEnd.setHours(23, 59, 59, 999);
        onRangeChange(newStart, newEnd);
    };

    return (
        <div className="flex items-center justify-between bg-card border border-border rounded-lg p-4">
            <Button
                variant="outline"
                size="icon"
                onClick={handlePreviousWeek}
                className="hover-elevate"
            >
                <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="text-center">
                <div className="text-sm text-muted-foreground">Week Range</div>
                <div className="text-lg font-semibold">
                    {format(weekStart, "MMM d")} - {format(weekEnd, "MMM d, yyyy")}
                </div>
            </div>

            <Button
                variant="outline"
                size="icon"
                onClick={handleNextWeek}
                disabled={isCurrentWeek}
                className="hover-elevate"
            >
                <ChevronRight className="h-4 w-4" />
            </Button>
        </div>
    );
}
