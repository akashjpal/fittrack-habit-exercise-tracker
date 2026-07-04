import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

interface TrendRangeSelectorProps {
    startDate: Date;
    endDate: Date;
    onRangeChange: (start: Date, end: Date) => void;
}

export default function TrendRangeSelector({
    startDate,
    endDate,
    onRangeChange,
}: TrendRangeSelectorProps) {
    return (
        <div className="flex items-center gap-2">
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant={"outline"}
                        className={cn(
                            "w-[240px] justify-start text-left font-normal",
                            !startDate && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, "PPP") : <span>Pick a start date</span>}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={(date) => date && onRangeChange(date, endDate)}
                        initialFocus
                    />
                </PopoverContent>
            </Popover>
            <span className="text-muted-foreground">-</span>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant={"outline"}
                        className={cn(
                            "w-[240px] justify-start text-left font-normal",
                            !endDate && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, "PPP") : <span>Pick an end date</span>}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={(date) => date && onRangeChange(startDate, date)}
                        initialFocus
                    />
                </PopoverContent>
            </Popover>
        </div>
    );
}
