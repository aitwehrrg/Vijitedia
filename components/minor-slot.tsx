"use client";

import { useState, forwardRef, useImperativeHandle } from "react";
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
import { MINORS } from "@/data/minors";
import { Course } from "@/types/flowsheet";
import { toRoman } from "@/lib/utils";

export interface MinorSlotHandle {
    trigger: () => void;
}

interface MinorSlotProps {
    course: Course;
    selectedMinorId: string | null;
    onSelectMinor: (id: string | null) => void;
    effectiveCourse: Course;
    status: CourseStatus;
    disabledMinorIds?: Set<string>;
}

export const MinorSlot = forwardRef<MinorSlotHandle, MinorSlotProps>(
    (
        {
            course,
            selectedMinorId,
            onSelectMinor,
            effectiveCourse,
            status,
            disabledMinorIds,
        },
        ref
    ) => {
        const [open, setOpen] = useState(false);
        const minorSlotLabel =
            course.minorIndex === undefined
                ? "Minor"
                : course.minorIndex === 5
                    ? "Minor V Laboratory"
                    : `Minor ${toRoman(course.minorIndex + 1)}`;

        useImperativeHandle(ref, () => ({
            trigger: () => setOpen(true),
        }));

        return (
            <Popover open={open} onOpenChange={setOpen}>
                {selectedMinorId ? (
                    <div className="relative h-full w-full group">
                        <CourseCard
                            course={effectiveCourse}
                            status={status}
                            className={status === "default" ? "bg-teal-50/60 dark:bg-teal-950/20 border-l-teal-500" : undefined}
                        />

                        <PopoverTrigger asChild>
                            <button
                                className="absolute top-2 right-2 z-10 h-6 w-6 flex items-center justify-center rounded-full bg-background hover:bg-muted text-muted-foreground border border-border transition-all"
                                title="Change Minor"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setOpen(true);
                                }}
                                onKeyDown={(e) => e.stopPropagation()}
                            >
                                <Pencil className="w-3 h-3" />
                            </button>
                        </PopoverTrigger>

                        {status === "default" && (
                            <div className="absolute inset-0 border-2 border-teal-400/40 dark:border-teal-500/30 pointer-events-none rounded-lg" />
                        )}
                    </div>
                ) : (
                    <PopoverTrigger asChild>
                        <div className="h-full border-2 border-dashed border-border bg-card hover:border-teal-400 hover:bg-teal-50/30 dark:hover:bg-teal-950/30 p-2 flex flex-col justify-center items-center cursor-pointer transition-colors rounded-lg group">
                            <GraduationCap className="w-4 h-4 text-muted-foreground group-hover:text-teal-500 mb-1 transition-colors" />
                            <span className="text-sm font-semibold text-center text-foreground group-hover:text-teal-700 dark:group-hover:text-teal-400 leading-tight transition-colors">
                                {minorSlotLabel}
                            </span>
                            <Badge
                                variant="secondary"
                                className="mt-1 text-[10px] h-4 bg-muted text-muted-foreground group-hover:bg-teal-100 dark:group-hover:bg-teal-950/50 group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors"
                            >
                                Select
                            </Badge>
                        </div>
                    </PopoverTrigger>
                )}

                <PopoverContent
                    className="w-[350px] p-0"
                    align="start"
                    onKeyDown={(e) => e.stopPropagation()}
                >
                    <Command>
                        <div className="hidden 2xl:block">
                            <CommandInput
                                placeholder="Search minors..."
                                className="h-9"
                            />
                        </div>

                        <CommandList className="overscroll-contain max-h-[250px] 2xl:max-h-[300px]">
                            <CommandEmpty>No minor found.</CommandEmpty>
                            <CommandGroup>
                                {MINORS.map((m) => {
                                    const isDisabled = disabledMinorIds?.has(
                                        m.id
                                    );

                                    return (
                                        <CommandItem
                                            key={m.id}
                                            value={m.name + " " + m.dept}
                                            disabled={isDisabled}
                                            onSelect={() => {
                                                if (!isDisabled) {
                                                    onSelectMinor(m.id);
                                                    setOpen(false);
                                                }
                                            }}
                                            className={
                                                isDisabled
                                                    ? "opacity-50 cursor-not-allowed"
                                                    : ""
                                            }
                                        >
                                            <div className="flex flex-col w-full">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-bold mr-2">
                                                        {m.name}
                                                    </span>
                                                    {isDisabled ? (
                                                        <span className="text-[9px] text-red-500 font-bold uppercase ml-2">
                                                            (Conflict)
                                                        </span>
                                                    ) : (
                                                        selectedMinorId ===
                                                            m.id && (
                                                            <Check className="w-4 h-4 text-teal-600 ml-2" />
                                                        )
                                                    )}
                                                </div>
                                                <span className="text-xs font-medium text-muted-foreground">
                                                    {m.dept}
                                                </span>
                                            </div>
                                        </CommandItem>
                                    );
                                })}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        );
    }
);

MinorSlot.displayName = "MinorSlot";
