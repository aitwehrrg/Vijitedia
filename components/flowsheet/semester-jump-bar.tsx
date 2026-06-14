"use client";

import { memo, useRef, useEffect } from "react";
import { Semester } from "@/types/flowsheet";

interface SemesterJumpBarProps {
    semesters: Semester[];
    activeSemesterIndex: number;
    onJump: (index: number) => void;
}

export const SemesterJumpBar = memo(function SemesterJumpBar({
    semesters,
    activeSemesterIndex,
    onJump,
}: SemesterJumpBarProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const pillRefs = useRef<Map<number, HTMLButtonElement>>(new Map());

    // Keep the active pill visible in the scrollable bar
    useEffect(() => {
        const pill = pillRefs.current.get(activeSemesterIndex);
        if (pill && scrollRef.current) {
            pill.scrollIntoView({
                behavior: "smooth",
                block: "nearest",
                inline: "center",
            });
        }
    }, [activeSemesterIndex]);

    return (
        <div 
            className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background/90 backdrop-blur-md border-t border-border pb-[env(safe-area-inset-bottom)]"
            onClick={(e) => e.stopPropagation()}
        >
            <div
                ref={scrollRef}
                className="flex items-center gap-1 px-3 py-2 overflow-x-auto scrollbar-hide"
            >
                {semesters.map((sem, i) => {
                    const isActive = i === activeSemesterIndex;
                    const isYearBoundary = i > 0 && i % 2 === 0;

                    return (
                        <div key={sem.id} className="flex items-center gap-1 shrink-0">
                            {isYearBoundary && (
                                <div className="w-px h-4 bg-border mx-1" />
                            )}
                            <button
                                ref={(el) => {
                                    if (el) pillRefs.current.set(i, el);
                                    else pillRefs.current.delete(i);
                                }}
                                onClick={() => onJump(i)}
                                className={`px-4 py-2.5 min-h-[44px] min-w-[64px] rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                                    isActive
                                        ? "bg-foreground text-background shadow-sm"
                                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                                }`}
                            >
                                {sem.label}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
});
