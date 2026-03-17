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
import { Award, Pencil, Check } from "lucide-react";
import { Course, Honors } from "@/types/flowsheet";
import { getSuffix } from "@/lib/utils";

export interface HonorsSlotHandle {
    trigger: () => void;
}

interface HonorsSlotProps {
    course: Course;
    selectedHonorsId: string | null;
    onSelectHonors: (id: string | null) => void;
    effectiveCourse: Course;
    status: CourseStatus;
    availableHonors: Honors[];
}

export const HonorsSlot = forwardRef<HonorsSlotHandle, HonorsSlotProps>(
    (
        {
            course,
            selectedHonorsId,
            onSelectHonors,
            effectiveCourse,
            status,
            availableHonors,
        },
        ref
    ) => {
        const [open, setOpen] = useState(false);

        useImperativeHandle(ref, () => ({
            trigger: () => setOpen(true),
        }));

        return (
            <Popover open={open} onOpenChange={setOpen}>
                {selectedHonorsId ? (
                    <div className="relative h-full w-full group">
                        <CourseCard course={effectiveCourse} status={status} />

                        <PopoverTrigger asChild>
                            <button
                                className="absolute top-2 right-2 z-10 h-6 w-6 flex items-center justify-center rounded-full bg-background hover:bg-muted text-muted-foreground border border-border shadow-sm transition-all"
                                title="Change Honors Track"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setOpen(true);
                                }}
                                onKeyDown={(e) => e.stopPropagation()}
                            >
                                <Pencil className="w-3 h-3" />
                            </button>
                        </PopoverTrigger>

                        <div className="absolute inset-0 border-2 border-purple-500/20 pointer-events-none rounded-lg" />
                    </div>
                ) : (
                    <PopoverTrigger asChild>
                        <div className="h-full border-2 border-dashed border-border bg-card hover:border-purple-400 hover:bg-purple-50/50 dark:hover:bg-purple-950/30 p-2 flex flex-col justify-center items-center cursor-pointer transition-colors rounded-lg group">
                            <Award className="w-4 h-4 text-muted-foreground group-hover:text-purple-600 mb-1 transition-colors" />
                            <span className="text-sm font-semibold text-center text-foreground group-hover:text-purple-700 dark:group-hover:text-purple-400 leading-tight transition-colors">
                                Honors{getSuffix(course.honorsIndex || 0)}
                            </span>
                            <Badge
                                variant="secondary"
                                className="mt-1 text-[10px] h-4 bg-muted text-muted-foreground group-hover:bg-purple-100 dark:group-hover:bg-purple-950/50 group-hover:text-purple-700 dark:group-hover:text-purple-400 transition-colors"
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
                                placeholder="Search honors tracks..."
                                className="h-9"
                            />
                        </div>

                        <CommandList className="overscroll-contain max-h-[250px] 2xl:max-h-[300px]">
                            <CommandEmpty>
                                No relevant honors found.
                            </CommandEmpty>
                            <CommandGroup heading="Available Tracks">
                                <CommandItem
                                    value="none"
                                    onSelect={() => {
                                        onSelectHonors(null);
                                        setOpen(false);
                                    }}
                                    className="text-muted-foreground italic"
                                >
                                    <div className="flex items-center w-full">
                                        <span>No Honors Track</span>
                                        {!selectedHonorsId && (
                                            <Check className="w-4 h-4 text-muted-foreground ml-auto" />
                                        )}
                                    </div>
                                </CommandItem>

                                {availableHonors.map((h) => {
                                    const isSelected =
                                        selectedHonorsId === h.id;

                                    return (
                                        <CommandItem
                                            key={h.id}
                                            value={h.name + " " + h.dept}
                                            onSelect={() => {
                                                onSelectHonors(h.id);
                                                setOpen(false);
                                            }}
                                        >
                                            <div className="flex flex-col w-full">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-bold mr-2 text-foreground">
                                                        {h.name}
                                                    </span>
                                                    {isSelected && (
                                                        <Check className="w-4 h-4 text-purple-600 ml-2" />
                                                    )}
                                                </div>
                                                <span className="text-xs font-medium text-muted-foreground">
                                                    {h.dept}
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

HonorsSlot.displayName = "HonorsSlot";
