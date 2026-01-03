"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { CourseCard, CourseStatus } from "@/components/course-card";
import { ElectiveCard, ElectiveCardHandle } from "@/components/elective-card";
import { MinorSlot, MinorSlotHandle } from "@/components/minor-slot";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetClose,
} from "@/components/ui/sheet";
import {
    ArrowLeftFromLine,
    Calculator,
    ChevronsUpDown,
    Check,
} from "lucide-react";
import { Course } from "@/types/flowsheet";
import { FLOWSHEET_DATA } from "@/data/programs";
import { MINORS } from "@/data/minors";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Point = { x: number; y: number };
type Connection = { start: Point; end: Point; type: "prereq" | "postreq" };

const ConnectionLines = ({ connections }: { connections: Connection[] }) => {
    return (
        <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-20 overflow-visible">
            <defs>
                <marker
                    id="arrow-prereq"
                    viewBox="0 0 12 12"
                    refX="10"
                    refY="6"
                    markerWidth="8"
                    markerHeight="8"
                    orient="auto-start-reverse"
                >
                    <path d="M0,0 L12,6 L0,12 L3,6 z" fill="#f59e0b" />
                </marker>

                <marker
                    id="arrow-postreq"
                    viewBox="0 0 12 12"
                    refX="10"
                    refY="6"
                    markerWidth="8"
                    markerHeight="8"
                    orient="auto-start-reverse"
                >
                    <path d="M0,0 L12,6 L0,12 L3,6 z" fill="#3b82f6" />
                </marker>
            </defs>
            {connections.map((conn, i) => {
                const dx = conn.end.x - conn.start.x;
                const curveIntensity = Math.min(
                    Math.max(Math.abs(dx) * 0.5, 40),
                    150
                );
                const pathData = `M ${conn.start.x} ${conn.start.y} C ${conn.start.x + curveIntensity} ${conn.start.y}, ${conn.end.x - curveIntensity} ${conn.end.y}, ${conn.end.x} ${conn.end.y}`;
                const color = conn.type === "prereq" ? "#f59e0b" : "#3b82f6";
                return (
                    <path
                        key={i}
                        d={pathData}
                        fill="none"
                        stroke={color}
                        strokeWidth="2"
                        strokeDasharray={conn.type === "prereq" ? "5,5" : "0"}
                        markerEnd={`url(#arrow-${conn.type})`}
                        className="opacity-80 transition-all duration-300"
                    />
                );
            })}
        </svg>
    );
};

export default function FlowsheetPage() {
    const params = useParams();
    const router = useRouter();
    const programId = params.programId as string;

    const [hoveredCourseId, setHoveredCourseId] = useState<string | null>(null);
    const [selectedCourseId, setSelectedCourseId] = useState<string | null>(
        null
    );
    const [selections, setSelections] = useState<Record<string, string>>({});
    const [selectedMinorId, setSelectedMinorId] = useState<string | null>(null);
    const [connections, setConnections] = useState<Connection[]>([]);

    const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    const currentProgram = useMemo(
        () => FLOWSHEET_DATA.find((p) => p.id === programId),
        [programId]
    );

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

    const effectiveCourses = useMemo(() => {
        return allCourses.map((course) => {
            if (course.type === "elective" && selections[course.id]) {
                const selectedOpt = course.options?.find(
                    (o) => o.id === selections[course.id]
                );
                if (selectedOpt) {
                    return { ...course, ...selectedOpt, id: course.id };
                }
            }

            if (
                course.type === "minor" &&
                selectedMinorId &&
                course.minorIndex !== undefined
            ) {
                const activeMinor = MINORS.find(
                    (m) => m.id === selectedMinorId
                );
                const minorCourse = activeMinor?.courses[course.minorIndex];

                if (minorCourse) {
                    return {
                        ...course,
                        ...minorCourse,
                        id: course.id,
                        originalId: minorCourse.id,
                    };
                }
            }

            return course;
        });
    }, [allCourses, selections, selectedMinorId]);

    const takenCoursesBase = useMemo(() => {
        const taken = new Set<string>();

        allCourses.forEach((course) => {
            if (course.type === "core") {
                taken.add(course.id);
            }
        });

        Object.values(selections).forEach((selId) => taken.add(selId));

        return taken;
    }, [allCourses, selections]);

    const disabledMinorIds = useMemo(() => {
        const disabled = new Set<string>();

        MINORS.forEach((minor) => {
            for (const course of minor.courses) {
                if (takenCoursesBase.has(course.id)) {
                    disabled.add(minor.id);
                    break;
                }

                if (course.mutexIds) {
                    const hasMutexConflict = course.mutexIds.some((mutexId) =>
                        takenCoursesBase.has(mutexId)
                    );
                    if (hasMutexConflict) {
                        disabled.add(minor.id);
                        break;
                    }
                }
            }
        });

        return disabled;
    }, [takenCoursesBase]);

    const disabledOptionIds = useMemo(() => {
        const disabled = new Set<string>();

        const takenForElectives = new Set(takenCoursesBase);

        if (selectedMinorId) {
            const activeMinor = MINORS.find((m) => m.id === selectedMinorId);
            activeMinor?.courses.forEach((c) => takenForElectives.add(c.id));
        }

        allCourses.forEach((course) => {
            if (course.type === "elective" && course.options) {
                course.options.forEach((option) => {
                    if (takenForElectives.has(option.id)) {
                        disabled.add(option.id);
                    }

                    if (option.mutexIds) {
                        const hasConflict = option.mutexIds.some((mutexId) =>
                            takenForElectives.has(mutexId)
                        );
                        if (hasConflict) {
                            disabled.add(option.id);
                        }
                    }
                });
            }
        });

        return disabled;
    }, [allCourses, takenCoursesBase, selectedMinorId]);

    useEffect(() => {
        setHoveredCourseId(null);
        setSelectedCourseId(null);
        setSelections({});
        setSelectedMinorId(null);
        setConnections([]);
        cardRefs.current.clear();
    }, [programId]);

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

    const activeCourseId = hoveredCourseId || selectedCourseId;
    const handleProgramChange = (newId: string) =>
        router.push(`/flowsheet/${newId}`);

    const handleCourseClick = (e: React.MouseEvent, courseId: string) => {
        e.stopPropagation();
        setSelectedCourseId((prev) => (prev === courseId ? null : courseId));
    };

    const handleElectiveSelect = (slotId: string, optionId: string) => {
        const currentSlot = allCourses.find((c) => c.id === slotId);
        if (!currentSlot || !currentSlot.options) return;

        const selectedOption = currentSlot.options.find(
            (o) => o.id === optionId
        );

        const updates: Record<string, string> = {};
        updates[slotId] = optionId;

        if (currentSlot.linkedSlotId && selectedOption?.linkedOptionId) {
            updates[currentSlot.linkedSlotId] = selectedOption.linkedOptionId;
        }

        setSelections((prev) => ({ ...prev, ...updates }));

        setTimeout(() => {
            cardRefs.current.get(slotId)?.focus();
        }, 0);
    };

    const getCourseStatus = (currentCourse: Course): CourseStatus => {
        if (!activeCourseId) return "default";
        if (currentCourse.id === activeCourseId) return "hovered";

        const activeCourse = effectiveCourses.find(
            (c) => c.id === activeCourseId
        );
        if (!activeCourse) return "default";

        const effectiveCurrent =
            effectiveCourses.find((c) => c.id === currentCourse.id) ||
            currentCourse;

        if (activeCourse.prereqs?.includes(currentCourse.id)) return "prereq";
        if (effectiveCurrent.prereqs?.includes(activeCourse.id))
            return "postreq";

        return "default";
    };

    useEffect(() => {
        const updateConnections = () => {
            if (!activeCourseId || !contentRef.current) {
                setConnections([]);
                return;
            }

            const newConnections: Connection[] = [];
            const containerRect = contentRef.current.getBoundingClientRect();

            const getNodeRef = (targetId: string) => {
                if (cardRefs.current.has(targetId)) {
                    return cardRefs.current.get(targetId);
                }
                const hiddenCourse = effectiveCourses.find(
                    (c) => (c as any).originalId === targetId
                );
                if (hiddenCourse && cardRefs.current.has(hiddenCourse.id)) {
                    return cardRefs.current.get(hiddenCourse.id);
                }
                return null;
            };

            const activeNode = cardRefs.current.get(activeCourseId);
            if (!activeNode) return;

            const activeRect = activeNode.getBoundingClientRect();
            const activeCourse = effectiveCourses.find(
                (c) => c.id === activeCourseId
            );

            const getCoords = (rect: DOMRect, side: "left" | "right") => ({
                x:
                    (side === "left" ? rect.left : rect.right) -
                    containerRect.left,
                y: rect.top - containerRect.top + rect.height / 2,
            });

            activeCourse?.prereqs?.forEach((prereqId) => {
                const prereqNode = getNodeRef(prereqId);
                if (prereqNode) {
                    newConnections.push({
                        start: getCoords(
                            prereqNode.getBoundingClientRect(),
                            "right"
                        ),
                        end: getCoords(activeRect, "left"),
                        type: "prereq",
                    });
                }
            });

            const postReqs = effectiveCourses.filter((c) => {
                const prereqs = c.prereqs || [];
                return (
                    prereqs.includes(activeCourseId) ||
                    ((activeCourse as any).originalId &&
                        prereqs.includes((activeCourse as any).originalId))
                );
            });

            postReqs.forEach((post) => {
                const postNode = cardRefs.current.get(post.id);
                if (postNode) {
                    newConnections.push({
                        start: getCoords(activeRect, "right"),
                        end: getCoords(
                            postNode.getBoundingClientRect(),
                            "left"
                        ),
                        type: "postreq",
                    });
                }
            });

            setConnections(newConnections);
        };

        updateConnections();
        window.addEventListener("resize", updateConnections);
        return () => window.removeEventListener("resize", updateConnections);
    }, [activeCourseId, effectiveCourses]);

    const shouldShowSeparator = (index: number) => {
        return (index + 1) % 2 === 0 && index !== flatSemesters.length - 1;
    };

    const electiveRefs = useRef<Map<string, ElectiveCardHandle>>(new Map());
    const minorRefs = useRef<Map<string, MinorSlotHandle>>(new Map());
    const handleKeyDown = (
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

                setSelectedCourseId((prev) =>
                    prev === course.id ? null : course.id
                );
                break;
        }
    };

    const programListRefs = useRef<Map<string, HTMLAnchorElement>>(new Map());

    const handleSheetKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "w" || e.key === "s" || e.key === "i" || e.key === "k") {
            e.preventDefault();

            const items = Array.from(programListRefs.current.values());
            const currentIndex = items.indexOf(
                document.activeElement as HTMLAnchorElement
            );

            if (currentIndex === -1) return;

            let nextIndex;
            if (e.key === "ArrowDown" || e.key === "s" || e.key === "k") {
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
            className="min-h-screen w-full flex flex-col bg-slate-50/50"
            onClick={() => setSelectedCourseId(null)}
        >
            <div
                className="w-full bg-white border-b px-3 py-3 md:px-8 md:py-4 sticky top-0 z-50 shadow-sm"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-4">
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
                                {currentProgram.name}
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
                            <Link href={`/calculator/${programId}`}>
                                <Calculator className="w-4 h-4" />
                                <span className="hidden sm:inline">
                                    Calculator
                                </span>
                            </Link>
                        </Button>

                        <Sheet>
                            <SheetTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    className="flex-1 md:flex-none justify-between gap-2 h-10 md:h-9 md:w-[160px]"
                                >
                                    <span className="truncate">
                                        Switch Program
                                    </span>
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent
                                side="right"
                                className="w-full sm:w-[400px] h-full flex flex-col"
                                onOpenAutoFocus={(e) => {
                                    e.preventDefault();
                                    const target =
                                        programListRefs.current.get(programId);
                                    target?.focus();
                                    target?.scrollIntoView({ block: "center" });
                                }}
                            >
                                <SheetHeader className="pb-4 border-b">
                                    <SheetTitle className="text-xl">Select Program</SheetTitle>
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
                                            Choose an academic program to view
                                            its flowsheet.
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
                                                    "hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm",
                                                    "focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:bg-slate-50 focus:border-blue-400",
                                                    programId === prog.id
                                                        ? "border-blue-600 bg-blue-50/50 ring-1 ring-blue-600/20"
                                                        : "border-slate-100 bg-white shadow-sm"
                                                )}
                                            >
                                                <div className="flex flex-col gap-1.5 mr-3">
                                                    <span
                                                        className={cn(
                                                            "text-base font-semibold leading-snug transition-colors",
                                                            programId ===
                                                                prog.id
                                                                ? "text-blue-700"
                                                                : "text-slate-900 group-hover:text-slate-900"
                                                        )}
                                                    >
                                                        {prog.name}
                                                    </span>
                                                    <span className="text-sm text-slate-500 font-medium">
                                                        Dept. of{" "}
                                                        {prog.department}
                                                    </span>
                                                </div>
                                                {programId === prog.id && (
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

                        <div className="flex shrink-0 gap-3 text-xs md:text-xs font-medium">
                            <div className="flex items-center text-slate-600">
                                <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-amber-500 mr-1.5 md:mr-2" />
                                Prereq
                            </div>
                            <div className="flex items-center text-slate-600">
                                <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-blue-500 mr-1.5 md:mr-2" />
                                Postreq
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="w-full px-4 pt-6 md:px-8">
                <div className="max-w-7xl mx-auto text-center">
                    <h2 className="text-xl md:text-2xl font-light text-slate-700 leading-relaxed">
                        Bachelor of Technology in{" "}
                        <span className="font-semibold text-slate-900 block sm:inline">
                            {currentProgram.name}
                        </span>
                        {selectedMinor && (
                            <span className="animate-in fade-in slide-in-from-top-2 duration-300">
                                {" "}
                                <span className="text-slate-400 block sm:inline sm:mx-1">
                                    with Minor in
                                </span>{" "}
                                <span className="font-semibold text-blue-600 block sm:inline">
                                    {selectedMinor.name}
                                </span>
                            </span>
                        )}
                    </h2>
                </div>
            </div>

            <div
                className="flex-1 w-full overflow-x-auto p-4 md:p-8"
                ref={scrollContainerRef}
            >
                <div
                    className="relative bg-white rounded-xl shadow-xl border p-6 mx-auto min-w-[1200px] max-w-7xl"
                    ref={contentRef}
                    onClick={(e) => e.stopPropagation()}
                >
                    <ConnectionLines connections={connections} />

                    <div
                        className="grid w-full mb-2"
                        style={{
                            gridTemplateColumns: `repeat(${flatSemesters.length}, minmax(0, 1fr))`,
                        }}
                    >
                        {currentProgram.years.map((year) => (
                            <div
                                key={year.id}
                                className="col-span-2 text-center border-b border-slate-100 pb-2"
                            >
                                <span className="font-bold text-slate-800 text-sm">
                                    {year.label}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div
                        className="grid w-full mb-4 gap-4"
                        style={{
                            gridTemplateColumns: `repeat(${flatSemesters.length}, minmax(0, 1fr))`,
                        }}
                    >
                        {flatSemesters.map((sem, i) => (
                            <div
                                key={sem.id}
                                className="text-center text-[10px] uppercase font-bold text-slate-400 tracking-wider relative"
                            >
                                {sem.label}
                                {shouldShowSeparator(i) && (
                                    <div className="absolute -right-2 top-0 h-full w-px bg-slate-200" />
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
                                    gridTemplateColumns: `repeat(${flatSemesters.length}, minmax(0, 1fr))`,
                                }}
                            >
                                {flatSemesters.map((semester, semIndex) => {
                                    const course = semester.courses[rowIndex];
                                    const showSep =
                                        shouldShowSeparator(semIndex);
                                    const wrapperClass =
                                        "aspect-4/3 w-full relative rounded-lg scroll-mt-36 md:scroll-mt-24";

                                    if (!course)
                                        return (
                                            <div
                                                key={`empty-${semester.id}-${rowIndex}`}
                                                className={wrapperClass}
                                            >
                                                {showSep && (
                                                    <div className="absolute -right-2 -top-2 -bottom-2 w-px bg-slate-200" />
                                                )}
                                            </div>
                                        );

                                    return (
                                        <div
                                            key={course.id}
                                            className={`${wrapperClass} outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-shadow`}
                                            role="button"
                                            tabIndex={0}
                                            onKeyDown={(e) =>
                                                handleKeyDown(
                                                    e,
                                                    rowIndex,
                                                    semIndex,
                                                    course
                                                )
                                            }
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
                                        >
                                            {showSep && (
                                                <div className="absolute -right-2 -top-2 -bottom-2 w-px bg-slate-200 pointer-events-none" />
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
                                                    disabledMinorIds={
                                                        disabledMinorIds
                                                    }
                                                    onSelectMinor={(id) => {
                                                        setSelectedMinorId(id);
                                                        setTimeout(() => {
                                                            cardRefs.current
                                                                .get(course.id)
                                                                ?.focus();
                                                        }, 0);
                                                    }}
                                                    effectiveCourse={
                                                        effectiveCourses.find(
                                                            (c) =>
                                                                c.id ===
                                                                course.id
                                                        ) || course
                                                    }
                                                    status={getCourseStatus(
                                                        course
                                                    )}
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
                                                    status={getCourseStatus(
                                                        course
                                                    )}
                                                    disabledOptionIds={
                                                        disabledOptionIds
                                                    }
                                                />
                                            ) : (
                                                <CourseCard
                                                    course={course}
                                                    status={getCourseStatus(
                                                        course
                                                    )}
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
        </div>
    );
}
