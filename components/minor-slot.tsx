"use client";

import { useState } from "react";
import { CourseCard, CourseStatus } from "@/components/course-card";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Command,
    CommandItem,
    CommandList,
    CommandInput,
    CommandGroup,
    CommandEmpty,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Pencil, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { toRoman } from "@/utils/toRoman";
import { MINORS } from "@/data/minors";
import { Course } from "@/types/flowsheet";

interface MinorSlotProps {
    course: Course;
    selectedMinorId: string | null;
    onSelectMinor: (id: string | null) => void;
    effectiveCourse: Course;
    status: CourseStatus;
}

export function MinorSlot({
    course,
    selectedMinorId,
    onSelectMinor,
    effectiveCourse,
    status,
}: MinorSlotProps) {
    const [open, setOpen] = useState(false);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            {/* 1. SELECTED STATE: Render CourseCard + Edit Button */}
            {selectedMinorId ? (
                <div className="relative h-full w-full group">
                    <CourseCard course={effectiveCourse} status={status} />

                    {/* Trigger Button (Hidden until hover) */}
                    <PopoverTrigger asChild>
                        <button
                            className="absolute top-2 right-2 z-10 h-6 w-6 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 shadow-sm transition-all"
                            title="Change Minor"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Pencil className="w-3 h-3" />
                        </button>
                    </PopoverTrigger>

                    {/* Optional Indigo Border Ring to denote it is a Minor */}
                    <div className="absolute inset-0 border-2 border-indigo-500/10 pointer-events-none rounded-lg" />
                </div>
            ) : (
                /* 2. EMPTY STATE: Render Dashed Placeholder (Indigo Theme) */
                <PopoverTrigger asChild>
                    <div className="h-full border-2 border-dashed border-slate-300 hover:border-indigo-400 hover:bg-indigo-50/30 p-2 flex flex-col justify-center items-center cursor-pointer transition-colors rounded-lg group">
                        <GraduationCap className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 mb-1 transition-colors" />
                        <span className="text-sm font-semibold text-center text-slate-600 group-hover:text-indigo-700 leading-tight transition-colors">
                            Minor {toRoman(course.minorIndex! + 1)}
                        </span>
                        <Badge
                            variant="secondary"
                            className="mt-1 text-[10px] h-4 bg-slate-100 text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-700 transition-colors"
                        >
                            Select
                        </Badge>
                    </div>
                </PopoverTrigger>
            )}

            {/* 3. POPOVER LIST */}
            <PopoverContent className="w-[300px] p-0" align="start">
                <Command>
                    {/* QoL: Input for desktop arrow-key nav; Hidden wrapper for mobile */}
                    <div className="hidden sm:block">
                        <CommandInput
                            placeholder="Search minors..."
                            className="h-9"
                        />
                    </div>

                    <CommandList className="overscroll-contain">
                        <CommandEmpty>No minor found.</CommandEmpty>
                        <CommandGroup>
                            {/* List of Available Minors */}
                            {MINORS.map((m) => (
                                <CommandItem
                                    key={m.id}
                                    value={m.name + " " + m.dept} // Search by Name or Dept
                                    onSelect={() => {
                                        onSelectMinor(m.id);
                                        setOpen(false);
                                    }}
                                >
                                    <div className="flex flex-col">
                                        <div className="flex items-center">
                                            <span className="font-bold mr-2">
                                                {m.name}
                                            </span>
                                            {selectedMinorId === m.id && (
                                                <Check className="w-4 h-4 text-indigo-600 ml-2 right-1 absolute" />
                                            )}
                                        </div>
                                        <span className="text-xs font-medium text-slate-700">
                                            {m.dept}
                                        </span>
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
