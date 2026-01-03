"use client";

import { useState, forwardRef, useImperativeHandle } from "react";
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
import { Layers, Pencil, Check } from "lucide-react";
import { Course, CourseOption } from "@/types/flowsheet";
import { CourseCard } from "./course-card";

export interface ElectiveCardHandle {
    trigger: () => void;
}

interface ElectiveCardProps {
    course: Course;
    onSelect: (option: CourseOption) => void;
    selectedOption: CourseOption | null;
    status: "default" | "hovered" | "prereq" | "postreq";
    disabledOptionIds?: Set<string>;
}

export const ElectiveCard = forwardRef<ElectiveCardHandle, ElectiveCardProps>(
    ({ course, onSelect, selectedOption, status, disabledOptionIds }, ref) => {
        const [open, setOpen] = useState(false);

        useImperativeHandle(ref, () => ({
            trigger: () => setOpen(true),
        }));

        return (
            <Popover open={open} onOpenChange={setOpen}>
                {selectedOption ? (
                    <div className="relative h-full w-full group">
                        <CourseCard course={selectedOption} status={status} />
                        <PopoverTrigger asChild>
                            <button
                                className="absolute top-2 right-2 z-10 h-6 w-6 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 shadow-sm transition-all"
                                title="Change Elective"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setOpen(true);
                                }}
                                onKeyDown={(e) => e.stopPropagation()}
                            >
                                <Pencil className="w-3 h-3" />
                            </button>
                        </PopoverTrigger>
                    </div>
                ) : (
                    <PopoverTrigger asChild>
                        <div className="h-full border-2 border-dashed border-slate-300 p-2 flex flex-col justify-center items-center cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-colors">
                            <Layers className="w-4 h-4 text-slate-400 mb-1" />
                            <span className="text-sm font-semibold text-center text-slate-600 leading-tight">
                                {course.label || "Elective"}
                            </span>
                            <Badge
                                variant="secondary"
                                className="mt-1 text-[12px] h-4"
                            >
                                Select
                            </Badge>
                        </div>
                    </PopoverTrigger>
                )}

                <PopoverContent
                    className="w-64 p-0"
                    onKeyDown={(e) => e.stopPropagation()}
                >
                    <Command>
                        <div className="hidden xl:block">
                            <CommandInput
                                placeholder="Search options..."
                                className="h-9 hidden xl:flex"
                            />
                        </div>
                        <CommandList className="overscroll-contain">
                            <CommandEmpty>No options found.</CommandEmpty>
                            <CommandGroup>
                                {course.options?.map((opt) => {
                                    const isSelected =
                                        selectedOption?.id === opt.id;
                                    const isDisabled =
                                        disabledOptionIds?.has(opt.id) &&
                                        !isSelected;

                                    return (
                                        <CommandItem
                                            key={opt.id}
                                            value={opt.code + " " + opt.title}
                                            disabled={isDisabled}
                                            onSelect={() => {
                                                if (!isDisabled) {
                                                    onSelect(opt);
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
                                                    <div className="flex items-center">
                                                        <span className="font-bold font-mono mr-2">
                                                            {opt.code}
                                                        </span>
                                                        {isDisabled && (
                                                            <span className="text-[9px] text-red-500 font-bold uppercase ml-2">
                                                                (Conflict)
                                                            </span>
                                                        )}
                                                    </div>
                                                    {isSelected && (
                                                        <Check className="w-4 h-4 text-purple-600" />
                                                    )}
                                                </div>
                                                <span className="text-xs text-muted-foreground">
                                                    {opt.title}
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

ElectiveCard.displayName = "ElectiveCard";
