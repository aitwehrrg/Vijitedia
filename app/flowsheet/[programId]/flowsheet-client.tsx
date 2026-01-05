"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

import { CourseCard, CourseStatus } from "@/components/course-card";
import { ElectiveCard, ElectiveCardHandle } from "@/components/elective-card";
import { MinorSlot, MinorSlotHandle } from "@/components/minor-slot";
import { HonorsSlot, HonorsSlotHandle } from "@/components/honors-slot";
import { Button } from "@/components/ui/button";
import { FlowsheetHeader } from "@/components/flowsheet/header";
import {
    ConnectionLines,
    Connection,
} from "@/components/flowsheet/connections";

import { FLOWSHEET_DATA } from "@/data/programs";
import { MINORS } from "@/data/minors";
import { HONORS } from "@/data/honors";

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

    const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());
    const contentRef = useRef<HTMLDivElement>(null);
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

    const effectiveCourses = useMemo(() => {
        return allCourses.map((course) => {
            if (course.type === "elective" && selections[course.id]) {
                const selectedOpt = course.options?.find(
                    (o) => o.id === selections[course.id]
                );
                if (selectedOpt)
                    return { ...course, ...selectedOpt, id: course.id };
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
                if (minorCourse)
                    return {
                        ...course,
                        ...minorCourse,
                        id: course.id,
                        originalId: minorCourse.id,
                    };
            }

            if (
                course.type === "honors" &&
                selectedHonorsId &&
                course.honorsIndex !== undefined
            ) {
                const activeHonors = HONORS.find(
                    (h) => h.id === selectedHonorsId
                );
                const honorsCourse = activeHonors?.courses[course.honorsIndex];
                if (honorsCourse)
                    return {
                        ...course,
                        ...honorsCourse,
                        id: course.id,
                        originalId: honorsCourse.id,
                    };
            }

            return course;
        });
    }, [allCourses, selections, selectedMinorId, selectedHonorsId]);

    const takenCoursesBase = useMemo(() => {
        const taken = new Set<string>();
        allCourses.forEach((c) => c.type === "core" && taken.add(c.id));
        Object.values(selections).forEach((selId) => taken.add(selId));
        return taken;
    }, [allCourses, selections]);

    const disabledMinorIds = useMemo(() => {
        const disabled = new Set<string>();
        MINORS.forEach((minor) => {
            for (const course of minor.courses) {
                if (
                    takenCoursesBase.has(course.id) ||
                    course.mutexIds?.some((id) => takenCoursesBase.has(id))
                ) {
                    disabled.add(minor.id);
                    break;
                }
            }
        });
        return disabled;
    }, [takenCoursesBase]);

    const disabledOptionIds = useMemo(() => {
        const disabled = new Set<string>();
        const takenForElectives = new Set(takenCoursesBase);

        if (selectedMinorId)
            MINORS.find((m) => m.id === selectedMinorId)?.courses.forEach((c) =>
                takenForElectives.add(c.id)
            );
        if (selectedHonorsId)
            HONORS.find((h) => h.id === selectedHonorsId)?.courses.forEach(
                (c) => takenForElectives.add(c.id)
            );

        allCourses.forEach((course) => {
            if (course.type === "elective" && course.options) {
                course.options.forEach((option) => {
                    if (
                        takenForElectives.has(option.id) ||
                        option.mutexIds?.some((id) => takenForElectives.has(id))
                    ) {
                        disabled.add(option.id);
                    }
                });
            }
        });
        return disabled;
    }, [allCourses, takenCoursesBase, selectedMinorId, selectedHonorsId]);

    const activeCourseId = hoveredCourseId || selectedCourseId;

    const activeRelationships = useMemo(() => {
        if (!activeCourseId) return null;

        const activeCourse = effectiveCourses.find(
            (c) => c.id === activeCourseId
        );
        if (!activeCourse) return null;

        const prereqs = new Set(activeCourse.prereqs || []);
        const postreqs = new Set<string>();

        effectiveCourses.forEach((c) => {
            const p = c.prereqs || [];
            if (
                p.includes(activeCourseId) ||
                ((activeCourse as any).originalId &&
                    p.includes((activeCourse as any).originalId))
            ) {
                postreqs.add(c.id);
            }
        });

        return { prereqs, postreqs, activeId: activeCourseId };
    }, [activeCourseId, effectiveCourses]);

    const getCourseStatus = useCallback(
        (courseId: string): CourseStatus => {
            if (!activeRelationships) return "default";
            if (courseId === activeRelationships.activeId) return "hovered";
            if (activeRelationships.prereqs.has(courseId)) return "prereq";
            if (activeRelationships.postreqs.has(courseId)) return "postreq";
            return "default";
        },
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
        const updates: Record<string, string> = { [slotId]: optionId };

        if (currentSlot.linkedSlotId && selectedOption?.linkedOptionId) {
            updates[currentSlot.linkedSlotId] = selectedOption.linkedOptionId;
        }

        setSelections((prev) => ({ ...prev, ...updates }));
        setTimeout(() => cardRefs.current.get(slotId)?.focus(), 0);
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

    return (
        <div
            className="min-h-screen w-full flex flex-col bg-slate-50/50"
            onClick={() => setSelectedCourseId(null)}
        >
            <FlowsheetHeader
                programName={currentProgram.name}
                department={currentProgram.department}
                currentProgramId={programId}
                programListRefs={programListRefs}
            />

            <div className="w-full px-4 pt-6 md:px-8">
                <div className="max-w-7xl mx-auto text-center">
                    <h2 className="text-xl md:text-2xl font-light text-slate-700 leading-relaxed">
                        Bachelor of Technology in{" "}
                        <span className="font-semibold text-slate-900 block sm:inline">
                            {currentProgram.name}
                        </span>
                        {selectedMinor && (
                            <span className="animate-in fade-in slide-in-from-top-2 duration-300 block sm:inline">
                                <span className="text-slate-400 sm:mx-1">
                                    with Minor in
                                </span>
                                <span className="font-semibold text-blue-600">
                                    {selectedMinor.name}
                                </span>
                            </span>
                        )}
                        {selectedHonorsId && (
                            <span className="animate-in fade-in slide-in-from-top-2 duration-300 block sm:inline">
                                <span className="text-slate-400 sm:mx-1">
                                    {selectedMinor ? "and" : "with"} Honors in
                                </span>
                                <span className="font-semibold text-purple-600">
                                    {HONORS.find(
                                        (h) => h.id === selectedHonorsId
                                    )?.name.replace("B.Tech Honors in ", "")}
                                </span>
                            </span>
                        )}
                    </h2>
                </div>
            </div>

            <div className="flex-1 w-full overflow-x-auto p-4 md:p-8">
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

                                    if (!course) {
                                        return (
                                            <div
                                                key={`empty-${semester.id}-${rowIndex}`}
                                                className="aspect-4/3 relative"
                                            >
                                                {showSep && (
                                                    <div className="absolute -right-2 top-0 bottom-0 w-px bg-slate-200" />
                                                )}
                                            </div>
                                        );
                                    }

                                    const effectiveCourse =
                                        effectiveCourses.find(
                                            (c) => c.id === course.id
                                        ) || course;
                                    const status = getCourseStatus(course.id);

                                    return (
                                        <div
                                            key={course.id}
                                            className="aspect-4/3 w-full relative"
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
                                                    }}
                                                    course={course}
                                                    selectedMinorId={
                                                        selectedMinorId
                                                    }
                                                    onSelectMinor={
                                                        setSelectedMinorId
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
                                                    }}
                                                    course={course}
                                                    selectedHonorsId={
                                                        selectedHonorsId
                                                    }
                                                    onSelectHonors={
                                                        setSelectedHonorsId
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
        </div>
    );
}
