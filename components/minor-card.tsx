import { useState } from "react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, ChevronsUpDown, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";
import { Course } from "@/types/flowsheet";
import { MINORS } from "@/data/minors";
import { CourseCard, CourseStatus } from "@/components/course-card";

interface MinorCardProps {
    course: Course;
    minorIndex: number;
    selectedMinorId: string | null;
    onSelectMinor: (id: string) => void;
    status: CourseStatus;
    effectiveCourse: Course;
}

export function MinorCard({
    course,
    minorIndex,
    selectedMinorId,
    onSelectMinor,
    status,
    effectiveCourse,
}: MinorCardProps) {
    const [open, setOpen] = useState(false);

    // 1. FILLED STATE: Render specific course card with "Change" option
    if (selectedMinorId) {
        return (
            <div className="relative h-full group">
                <Popover open={open} onOpenChange={setOpen}>
                    <div className="h-full relative">
                        <div className="absolute -top-2 -right-2 z-20 flex gap-1">
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-5 w-5 rounded-full shadow-sm bg-white border-indigo-200 hover:bg-indigo-50"
                                >
                                    <ChevronsUpDown className="h-3 w-3 text-indigo-600" />
                                </Button>
                            </PopoverTrigger>
                        </div>

                        {/* Render the actual course details */}
                        <CourseCard course={effectiveCourse} status={status} />

                        {/* Visual Indicator for Minor */}
                        <div className="absolute inset-0 border-2 border-indigo-500/30 pointer-events-none rounded-lg transition-colors group-hover:border-indigo-500/50" />
                        <div className="absolute bottom-1 right-1">
                            <GraduationCap className="w-3 h-3 text-indigo-400/50" />
                        </div>
                    </div>

                    <PopoverContent className="w-[200px] p-0" align="start">
                        <Command>
                            <CommandInput placeholder="Change minor..." />
                            <CommandList>
                                <CommandEmpty>No minor found.</CommandEmpty>
                                <CommandGroup>
                                    {MINORS.map((minor) => (
                                        <CommandItem
                                            key={minor.id}
                                            value={minor.name}
                                            onSelect={() => {
                                                onSelectMinor(minor.id);
                                                setOpen(false);
                                            }}
                                        >
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4",
                                                    selectedMinorId === minor.id
                                                        ? "opacity-100"
                                                        : "opacity-0"
                                                )}
                                            />
                                            {minor.name}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
            </div>
        );
    }

    // 2. EMPTY STATE: Render "Select Minor" placeholder
    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <div className="h-full border-2 border-dashed border-indigo-200 rounded-lg p-2 flex flex-col justify-center items-center bg-indigo-50/30 cursor-pointer hover:bg-indigo-50 hover:border-indigo-400 transition-all">
                    <GraduationCap className="w-5 h-5 mb-1 text-indigo-400" />
                    <span className="text-[9px] font-bold uppercase tracking-wider text-center text-indigo-600">
                        {course.label || `Minor Slot ${minorIndex + 1}`}
                    </span>
                    <Badge
                        variant="secondary"
                        className="mt-1 text-[9px] h-4 bg-white text-indigo-600 hover:bg-indigo-100"
                    >
                        Select Minor
                    </Badge>
                </div>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0" align="start">
                <Command>
                    <CommandInput placeholder="Search minors..." />
                    <CommandList>
                        <CommandEmpty>No minor found.</CommandEmpty>
                        <CommandGroup>
                            {MINORS.map((minor) => (
                                <CommandItem
                                    key={minor.id}
                                    value={minor.name}
                                    onSelect={() => {
                                        onSelectMinor(minor.id);
                                        setOpen(false);
                                    }}
                                >
                                    {minor.name}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
