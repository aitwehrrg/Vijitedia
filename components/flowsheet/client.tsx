"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

import { CourseCard } from "@/components/course-card";
import {
    resolveEffectiveCourses,
    computeTakenCourses,
    computeDisabledMinorIds,
    computeDisabledOptionIds,
    computeActiveRelationships,
    getCourseStatus,
    CourseStatus,
} from "@/lib/flowsheet";
import { ElectiveCard, ElectiveCardHandle } from "@/components/elective-card";
import { MinorSlot, MinorSlotHandle } from "@/components/minor-slot";
import { HonorsSlot, HonorsSlotHandle } from "@/components/honors-slot";
import { Button } from "@/components/ui/button";
import { FlowsheetHeader } from "@/components/flowsheet/header";
import {
    ConnectionLines,
    Connection,
} from "@/components/flowsheet/connections";
import { SemesterJumpBar } from "@/components/flowsheet/semester-jump-bar";

import { FLOWSHEET_DATA } from "@/data/programs";
import { MINORS } from "@/data/minors";
import { HONORS } from "@/data/honors";
import { Course } from "@/types/flowsheet";

/** Check if the viewport is mobile-sized (matches md: breakpoint) */
function useIsMobile() {
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        const mql = window.matchMedia("(max-width: 767px)");
        const handler = (e: MediaQueryListEvent | MediaQueryList) =>
            setIsMobile(e.matches);
        handler(mql);
        mql.addEventListener("change", handler as (e: MediaQueryListEvent) => void);
        return () => mql.removeEventListener("change", handler as (e: MediaQueryListEvent) => void);
    }, []);
    return isMobile;
}

export default function FlowsheetPage() {
    const params = useParams();
    const programId = params.programId as string;

    const [hoveredCourseId, setHoveredCourseId] = useState<string | null>(null);
    const [selectedCourseId, setSelectedCourseId] = useState<string | null>(
        null
    );
    const [selections, setSelections] = useState<Record<string, string>>({});
    const [selectedMinorId, setSelectedMinorId] = useState<string | null>(null);
    const [selectedHonorsId, setSelectedHonorsId] = useState<string | null>(
        null
    );
    const [connections, setConnections] = useState<Connection[]>([]);
    const [activeSemesterIndex, setActiveSemesterIndex] = useState(0);

    const isMobile = useIsMobile();

    const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());
    const contentRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const semesterSentinelRefs = useRef<Map<number, HTMLDivElement>>(new Map());
    const electiveRefs = useRef<Map<string, ElectiveCardHandle>>(new Map());
    const minorRefs = useRef<Map<string, MinorSlotHandle>>(new Map());
    const honorsRefs = useRef<Map<string, HonorsSlotHandle>>(new Map());
    const programListRefs = useRef<Map<string, HTMLAnchorElement>>(new Map());

    const currentProgram = useMemo(
        () => FLOWSHEET_DATA.find((p) => p.id === programId),
        [programId]
    );

    const availableHonors = useMemo(() => {
        if (!currentProgram) return [];
        return HONORS.filter((h) => h.dept === currentProgram.department);
    }, [currentProgram]);

    const selectedMinor = useMemo(
        () => MINORS.find((m) => m.id === selectedMinorId),
        [selectedMinorId]
    );

    const flatSemesters = useMemo(
        () => currentProgram?.years.flatMap((y) => y.semesters) || [],
        [currentProgram]
    );

    const maxRows = useMemo(
        () =>
            Math.max(...(flatSemesters.map((s) => s.courses.length) || []), 5),
        [flatSemesters]
    );

    const allCourses = useMemo(
        () => flatSemesters.flatMap((s) => s.courses),
        [flatSemesters]
    );

    const effectiveCourses = useMemo(
        () => resolveEffectiveCourses(allCourses, selections, selectedMinorId, selectedHonorsId),
        [allCourses, selections, selectedMinorId, selectedHonorsId]
    );

    const takenCoursesBase = useMemo(
        () => computeTakenCourses(allCourses, selections),
        [allCourses, selections]
    );

    const disabledMinorIds = useMemo(
        () => computeDisabledMinorIds(takenCoursesBase),
        [takenCoursesBase]
    );

    const disabledOptionIds = useMemo(
        () => computeDisabledOptionIds(allCourses, takenCoursesBase, selectedMinorId, selectedHonorsId),
        [allCourses, takenCoursesBase, selectedMinorId, selectedHonorsId]
    );

    const activeCourseId = hoveredCourseId || selectedCourseId;

    const activeRelationships = useMemo(
        () => computeActiveRelationships(activeCourseId, effectiveCourses),
        [activeCourseId, effectiveCourses]
    );

    const getStatus = useCallback(
        (courseId: string): CourseStatus => getCourseStatus(courseId, activeRelationships),
        [activeRelationships]
    );

    useEffect(() => {
        if (!activeCourseId || !contentRef.current || !activeRelationships) {
            setConnections([]);
            return;
        }

        const rAF = requestAnimationFrame(() => {
            const newConnections: Connection[] = [];
            const containerRect = contentRef.current!.getBoundingClientRect();
            const activeNode = cardRefs.current.get(activeCourseId);

            if (!activeNode) return;

            const activeRect = activeNode.getBoundingClientRect();
            const getCoords = (rect: DOMRect, side: "left" | "right") => ({
                x:
                    (side === "left" ? rect.left : rect.right) -
                    containerRect.left,
                y: rect.top - containerRect.top + rect.height / 2,
            });

            const getNodeRef = (targetId: string) => {
                if (cardRefs.current.has(targetId))
                    return cardRefs.current.get(targetId);
                const hiddenCourse = effectiveCourses.find(
                    (c) => (c as any).originalId === targetId
                );
                if (hiddenCourse && cardRefs.current.has(hiddenCourse.id))
                    return cardRefs.current.get(hiddenCourse.id);
                return null;
            };

            activeRelationships.prereqs.forEach((pid) => {
                const node = getNodeRef(pid);
                if (node) {
                    newConnections.push({
                        start: getCoords(node.getBoundingClientRect(), "right"),
                        end: getCoords(activeRect, "left"),
                        type: "prereq",
                    });
                }
            });

            activeRelationships.postreqs.forEach((pid) => {
                const node = cardRefs.current.get(pid);
                if (node) {
                    newConnections.push({
                        start: getCoords(activeRect, "right"),
                        end: getCoords(node.getBoundingClientRect(), "left"),
                        type: "postreq",
                    });
                }
            });

            setConnections(newConnections);
        });

        return () => cancelAnimationFrame(rAF);
    }, [activeCourseId, activeRelationships, effectiveCourses]);

    useEffect(() => {
        setHoveredCourseId(null);
        setSelectedCourseId(null);
        setSelections({});
        setSelectedMinorId(null);
        setSelectedHonorsId(null);
        setConnections([]);
        cardRefs.current.clear();
    }, [programId]);

    // IntersectionObserver to track which semester column is visible (mobile pill bar)
    useEffect(() => {
        if (!isMobile) return;
        const observers: IntersectionObserver[] = [];
        semesterSentinelRefs.current.forEach((el, index) => {
            const observer = new IntersectionObserver(
                ([entry]) => {
                    if (entry.isIntersecting) {
                        setActiveSemesterIndex(index);
                    }
                },
                {
                    root: scrollContainerRef.current,
                    threshold: 0.5,
                }
            );
            observer.observe(el);
            observers.push(observer);
        });
        return () => observers.forEach((o) => o.disconnect());
    }, [isMobile, flatSemesters]);

    const handleCourseClick = (e: React.MouseEvent, courseId: string) => {
        e.stopPropagation();
        setSelectedCourseId((prev) => (prev === courseId ? null : courseId));
    };

    const handleJumpToSemester = useCallback(
        (index: number) => {
            const sentinel = semesterSentinelRefs.current.get(index);
            if (sentinel) {
                sentinel.scrollIntoView({
                    behavior: "smooth",
                    block: "nearest",
                    inline: "start",
                });
            }
        },
        []
    );

    const handleElectiveSelect = (slotId: string, optionId: string) => {
        const currentSlot = allCourses.find((c) => c.id === slotId);
        if (!currentSlot || !currentSlot.options) return;

        const selectedOption = currentSlot.options.find(
            (o) => o.id === optionId
        );
        const updates: Record<string, string> = { [slotId]: optionId };

        if (currentSlot.linkedSlotId && selectedOption?.linkedOptionId) {
            updates[currentSlot.linkedSlotId] = selectedOption.linkedOptionId;
        }

        setSelections((prev) => ({ ...prev, ...updates }));
        setTimeout(() => cardRefs.current.get(slotId)?.focus(), 0);
    };

    const handleMinorSelect = (courseId: string, minorId: string | null) => {
        setSelectedMinorId(minorId);
        setTimeout(() => cardRefs.current.get(courseId)?.focus(), 0);
    };

    const handleHonorsSelect = (courseId: string, honorsId: string | null) => {
        setSelectedHonorsId(honorsId);
        setTimeout(() => cardRefs.current.get(courseId)?.focus(), 0);
    };

    const handleGridKeyDown = (
        e: React.KeyboardEvent,
        rowIndex: number,
        colIndex: number,
        course: Course
    ) => {
        const focusCell = (r: number, c: number) => {
            const targetSemester = flatSemesters[c];
            if (targetSemester && targetSemester.courses[r]) {
                const targetId = targetSemester.courses[r].id;
                cardRefs.current.get(targetId)?.focus();
            }
        };

        switch (e.key) {
            case "ArrowUp":
            case "w":
            case "i":
                e.preventDefault();
                focusCell(rowIndex - 1, colIndex);
                break;
            case "ArrowDown":
            case "s":
            case "k":
                e.preventDefault();
                focusCell(rowIndex + 1, colIndex);
                break;
            case "ArrowLeft":
            case "a":
            case "j":
                e.preventDefault();
                focusCell(rowIndex, colIndex - 1);
                break;
            case "ArrowRight":
            case "d":
            case "l":
                e.preventDefault();
                focusCell(rowIndex, colIndex + 1);
                break;

            case "Enter":
            case " ":
                e.preventDefault();

                if (course.type === "elective") {
                    const isSelected = selections[course.id];
                    if (!isSelected && electiveRefs.current.has(course.id)) {
                        electiveRefs.current.get(course.id)?.trigger();
                        return;
                    }
                }

                if (course.type === "minor") {
                    if (!selectedMinorId && minorRefs.current.has(course.id)) {
                        minorRefs.current.get(course.id)?.trigger();
                        return;
                    }
                }

                if (course.type === "honors") {
                    if (
                        !selectedHonorsId &&
                        honorsRefs.current.has(course.id)
                    ) {
                        honorsRefs.current.get(course.id)?.trigger();
                        return;
                    }
                }

                handleCourseClick(e as any, course.id);
                break;
        }
    };

    if (!currentProgram) {
        return (
            <div className="h-screen flex flex-col items-center justify-center space-y-4">
                <h1 className="text-2xl font-bold">Program Not Found</h1>
                <Button asChild>
                    <Link href="/">Return to List</Link>
                </Button>
            </div>
        );
    }

    const shouldShowSeparator = (index: number) =>
        (index + 1) % 2 === 0 && index !== flatSemesters.length - 1;

    const MIN_COL_WIDTH = "180px";
    const SEPARATOR_STYLE =
        "absolute -right-[10px] w-[2px] bg-border pointer-events-none z-0";

    return (
        <div
            className="min-h-screen w-full flex flex-col bg-background"
            onClick={() => setSelectedCourseId(null)}
        >
            <FlowsheetHeader
                programName={currentProgram.name}
                department={currentProgram.department}
                currentProgramId={programId}
                programListRefs={programListRefs}
            />

            <div className="w-full px-4 pt-6 md:px-8">
                <div className="w-fit mx-auto text-center">
                    <h2 className="text-xl md:text-2xl font-light text-muted-foreground leading-relaxed">
                        Bachelor of Technology in{" "}
                        <span className="font-semibold text-foreground block sm:inline">
                            {currentProgram.name}
                        </span>
                        {selectedMinor && (
                            <span className="animate-in fade-in slide-in-from-top-2 duration-300 block sm:inline">
                                <span className="text-muted-foreground sm:mx-1">
                                    {" "}
                                    with Minor in{" "}
                                </span>
                                <span className="font-semibold text-blue-600 dark:text-blue-400">
                                    {selectedMinor.name}
                                </span>
                            </span>
                        )}
                        {selectedHonorsId && (
                            <span className="animate-in fade-in slide-in-from-top-2 duration-300 block sm:inline">
                                <span className="text-muted-foreground sm:mx-1">
                                    {selectedMinor ? " and" : " with"} Honors
                                    in{" "}
                                </span>
                                <span className="font-semibold text-purple-600 dark:text-purple-400">
                                    {
                                        HONORS.find(
                                            (h) => h.id === selectedHonorsId
                                        )?.name
                                    }
                                </span>
                            </span>
                        )}
                    </h2>
                </div>
            </div>

            <div
                ref={scrollContainerRef}
                className="flex-1 w-full overflow-x-auto p-4 md:p-8 pb-16 md:pb-8 snap-x snap-proximity md:snap-none"
            >
                <div
                    className="relative bg-card rounded-xl shadow-xl border border-border p-6 mx-auto min-w-[1200px] w-fit"
                    ref={contentRef}
                    onClick={(e) => e.stopPropagation()}
                >
                    <ConnectionLines connections={connections} />

                    <div
                        className="grid w-full mb-2"
                        style={{
                            gridTemplateColumns: `repeat(${flatSemesters.length}, ${isMobile ? "85vw" : `minmax(${MIN_COL_WIDTH}, 1fr)`})`,
                        }}
                    >
                        {currentProgram.years.map((year) => (
                            <div
                                key={year.id}
                                className="col-span-2 text-center border-b-2 border-border pb-2"
                            >
                                <span className="font-bold text-foreground text-sm">
                                    {year.label}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div
                        className="grid w-full mb-4 gap-4"
                        style={{
                            gridTemplateColumns: `repeat(${flatSemesters.length}, ${isMobile ? "85vw" : `minmax(${MIN_COL_WIDTH}, 1fr)`})`,
                        }}
                    >
                        {flatSemesters.map((sem, i) => (
                            <div
                                key={sem.id}
                                ref={(el) => {
                                    if (el) semesterSentinelRefs.current.set(i, el);
                                    else semesterSentinelRefs.current.delete(i);
                                }}
                                className="text-center text-[10px] uppercase font-bold text-muted-foreground tracking-wider relative snap-start"
                            >
                                {sem.label}
                                {shouldShowSeparator(i) && (
                                    <div
                                        className={`${SEPARATOR_STYLE} top-0 h-full`}
                                    />
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-col gap-4 w-full relative z-10">
                        {Array.from({ length: maxRows }).map((_, rowIndex) => (
                            <div
                                key={rowIndex}
                                className="grid gap-4 w-full"
                                style={{
                                    gridTemplateColumns: `repeat(${flatSemesters.length}, ${isMobile ? "85vw" : `minmax(${MIN_COL_WIDTH}, 1fr)`})`,
                                }}
                            >
                                {flatSemesters.map((semester, semIndex) => {
                                    const course = semester.courses[rowIndex];
                                    const showSep =
                                        shouldShowSeparator(semIndex);

                                    if (!course) {
                                        return (
                                            <div
                                                key={`empty-${semester.id}-${rowIndex}`}
                                                className="aspect-4/3 w-full max-w-[260px] md:max-w-none mx-auto relative"
                                            >
                                                {showSep && (
                                                    <div
                                                        className={`${SEPARATOR_STYLE} -top-2 -bottom-2`}
                                                    />
                                                )}
                                            </div>
                                        );
                                    }

                                    const effectiveCourse =
                                        effectiveCourses.find(
                                            (c) => c.id === course.id
                                        ) || course;
                                    const status = getStatus(course.id);

                                    return (
                                        <div
                                            key={course.id}
                                            className="aspect-4/3 w-full max-w-[260px] md:max-w-none mx-auto relative outline-none ring-offset-2 focus-within:ring-2 focus-within:ring-blue-500 rounded-xl scroll-mt-28 scroll-mb-28 md:scroll-mt-32 md:scroll-mb-32"
                                            tabIndex={0}
                                            data-grid-row={rowIndex}
                                            data-grid-col={semIndex}
                                            ref={(el) => {
                                                if (el)
                                                    cardRefs.current.set(
                                                        course.id,
                                                        el
                                                    );
                                                else
                                                    cardRefs.current.delete(
                                                        course.id
                                                    );
                                            }}
                                            onMouseEnter={() =>
                                                setHoveredCourseId(course.id)
                                            }
                                            onMouseLeave={() =>
                                                setHoveredCourseId(null)
                                            }
                                            onClick={(e) =>
                                                handleCourseClick(e, course.id)
                                            }
                                            onKeyDown={(e) =>
                                                handleGridKeyDown(
                                                    e,
                                                    rowIndex,
                                                    semIndex,
                                                    course
                                                )
                                            }
                                        >
                                            {showSep && (
                                                <div
                                                    className={`${SEPARATOR_STYLE} -top-2 -bottom-2`}
                                                />
                                            )}

                                            {course.type === "minor" ? (
                                                <MinorSlot
                                                    ref={(el) => {
                                                        if (el)
                                                            minorRefs.current.set(
                                                                course.id,
                                                                el
                                                            );
                                                        else
                                                            minorRefs.current.delete(
                                                                course.id
                                                            );
                                                    }}
                                                    course={course}
                                                    selectedMinorId={
                                                        selectedMinorId
                                                    }
                                                    onSelectMinor={(id) =>
                                                        handleMinorSelect(
                                                            course.id,
                                                            id
                                                        )
                                                    }
                                                    effectiveCourse={
                                                        effectiveCourse
                                                    }
                                                    status={status}
                                                    disabledMinorIds={
                                                        disabledMinorIds
                                                    }
                                                />
                                            ) : course.type === "honors" ? (
                                                <HonorsSlot
                                                    ref={(el) => {
                                                        if (el)
                                                            honorsRefs.current.set(
                                                                course.id,
                                                                el
                                                            );
                                                        else
                                                            honorsRefs.current.delete(
                                                                course.id
                                                            );
                                                    }}
                                                    course={course}
                                                    selectedHonorsId={
                                                        selectedHonorsId
                                                    }
                                                    onSelectHonors={(id) =>
                                                        handleHonorsSelect(
                                                            course.id,
                                                            id
                                                        )
                                                    }
                                                    effectiveCourse={
                                                        effectiveCourse
                                                    }
                                                    status={status}
                                                    availableHonors={
                                                        availableHonors
                                                    }
                                                />
                                            ) : course.type === "elective" ? (
                                                <ElectiveCard
                                                    ref={(el) => {
                                                        if (el)
                                                            electiveRefs.current.set(
                                                                course.id,
                                                                el
                                                            );
                                                        else
                                                            electiveRefs.current.delete(
                                                                course.id
                                                            );
                                                    }}
                                                    course={course}
                                                    selectedOption={
                                                        course.options?.find(
                                                            (o) =>
                                                                o.id ===
                                                                selections[
                                                                course.id
                                                                ]
                                                        ) || null
                                                    }
                                                    onSelect={(opt) =>
                                                        handleElectiveSelect(
                                                            course.id,
                                                            opt.id
                                                        )
                                                    }
                                                    status={status}
                                                    disabledOptionIds={
                                                        disabledOptionIds
                                                    }
                                                />
                                            ) : (
                                                <CourseCard
                                                    course={course}
                                                    status={status}
                                                />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {isMobile && (
                <SemesterJumpBar
                    semesters={flatSemesters}
                    activeSemesterIndex={activeSemesterIndex}
                    onJump={handleJumpToSemester}
                />
            )}
        </div>
    );
}
