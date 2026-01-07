"use client";

import Link from "next/link";
import {
    ArrowLeftFromLine,
    Calculator,
    Check,
    ChevronsUpDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetClose,
    SheetDescription,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { FLOWSHEET_DATA } from "@/data/programs";

interface FlowsheetHeaderProps {
    programName: string;
    department: string;
    currentProgramId: string;
    programListRefs: React.MutableRefObject<Map<string, HTMLAnchorElement>>;
}

export function FlowsheetHeader({
    programName,
    department,
    currentProgramId,
    programListRefs,
}: FlowsheetHeaderProps) {
    const handleSheetKeyDown = (e: React.KeyboardEvent) => {
        if (["ArrowDown", "ArrowUp", "w", "s", "i", "k"].includes(e.key)) {
            e.preventDefault();
            const items = Array.from(programListRefs.current.values());
            const activeEl = document.activeElement as HTMLAnchorElement;
            const currentIndex = items.indexOf(activeEl);

            if (currentIndex === -1) return;

            let nextIndex;
            if (["ArrowDown", "s", "k"].includes(e.key)) {
                nextIndex =
                    currentIndex < items.length - 1 ? currentIndex + 1 : 0;
            } else {
                nextIndex =
                    currentIndex > 0 ? currentIndex - 1 : items.length - 1;
            }

            const nextItem = items[nextIndex];
            nextItem?.focus();
            nextItem?.scrollIntoView({ block: "nearest" });
        }
    };

    return (
        <div
            className="w-full bg-white border-b px-3 py-3 md:px-8 md:py-4 sticky top-0 z-50 shadow-sm"
            onClick={(e) => e.stopPropagation()}
        >
            <div className="max-w-8xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-4">
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 -ml-1 md:ml-0 shrink-0"
                        asChild
                    >
                        <Link href="/flowsheet">
                            <ArrowLeftFromLine className="w-5 h-5" />
                        </Link>
                    </Button>
                    <div className="min-w-0">
                        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 leading-tight truncate">
                            Academic Flowsheet
                        </h1>
                        <p className="text-xs md:text-sm text-slate-500 line-clamp-1">
                            {programName}
                        </p>
                    </div>
                </div>

                <div className="w-full md:w-auto flex flex-row items-center justify-between gap-3 md:gap-4">
                    <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="shrink-0 gap-2 h-10 md:h-9"
                    >
                        <Link href={`/calculator/${currentProgramId}`}>
                            <Calculator className="w-4 h-4" />
                            <span className="hidden sm:inline">Calculator</span>
                        </Link>
                    </Button>

                    <Sheet>
                        <SheetTrigger asChild>
                            <Button
                                variant="outline"
                                role="combobox"
                                className="flex-1 md:flex-none justify-between gap-2 h-10 md:h-9 md:w-[160px]"
                            >
                                <span className="truncate">Switch Program</span>
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent
                            side="right"
                            className="w-full sm:w-[400px] h-full flex flex-col"
                            onOpenAutoFocus={(e) => {
                                e.preventDefault();
                                const target =
                                    programListRefs.current.get(
                                        currentProgramId
                                    );
                                target?.focus();
                                target?.scrollIntoView({ block: "center" });
                            }}
                        >
                            <SheetHeader className="pb-4 border-b">
                                <SheetTitle className="text-xl">
                                    Select Program
                                </SheetTitle>
                                <SheetDescription>
                                    <span className="hidden 2xl:inline">
                                        Use{" "}
                                        <kbd className="bg-slate-100 px-1 rounded border font-mono text-[10px] text-slate-500">
                                            ↑
                                        </kbd>{" "}
                                        and{" "}
                                        <kbd className="bg-slate-100 px-1 rounded border font-mono text-[10px] text-slate-500">
                                            ↓
                                        </kbd>{" "}
                                        to navigate.
                                    </span>
                                    <span className="2xl:hidden">
                                        Choose an academic program to view its
                                        flowsheet.
                                    </span>
                                </SheetDescription>
                            </SheetHeader>
                            <div
                                className="flex-1 overflow-y-auto py-6 flex flex-col gap-4 outline-none"
                                onKeyDown={handleSheetKeyDown}
                            >
                                {FLOWSHEET_DATA.map((prog) => (
                                    <SheetClose key={prog.id} asChild>
                                        <Link
                                            href={`/flowsheet/${prog.id}`}
                                            ref={(el) => {
                                                if (el)
                                                    programListRefs.current.set(
                                                        prog.id,
                                                        el
                                                    );
                                                else
                                                    programListRefs.current.delete(
                                                        prog.id
                                                    );
                                            }}
                                            className={cn(
                                                "flex items-center justify-between px-4 py-6 rounded-xl border transition-all outline-none group",
                                                "hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm focus:ring-2 focus:ring-blue-500 focus:bg-slate-50",
                                                currentProgramId === prog.id
                                                    ? "border-blue-600 bg-blue-50/50 ring-1 ring-blue-600/20"
                                                    : "border-slate-100 bg-white shadow-sm"
                                            )}
                                        >
                                            <div className="flex flex-col gap-1.5 mr-3">
                                                <span
                                                    className={cn(
                                                        "text-base font-semibold leading-snug transition-colors",
                                                        currentProgramId ===
                                                            prog.id
                                                            ? "text-blue-700"
                                                            : "text-slate-900 group-hover:text-slate-900"
                                                    )}
                                                >
                                                    {prog.name}
                                                </span>
                                                <span className="text-sm text-slate-500 font-medium">
                                                    Dept. of {prog.department}
                                                </span>
                                            </div>
                                            {currentProgramId === prog.id && (
                                                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                                                    <Check className="h-5 w-5 text-blue-600" />
                                                </div>
                                            )}
                                        </Link>
                                    </SheetClose>
                                ))}
                            </div>
                        </SheetContent>
                    </Sheet>

                    <div className="flex shrink-0 gap-3 text-xs font-medium">
                        <div className="flex items-center text-slate-600">
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5" />{" "}
                            Prereq
                        </div>
                        <div className="flex items-center text-slate-600">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-1.5" />{" "}
                            Postreq
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
