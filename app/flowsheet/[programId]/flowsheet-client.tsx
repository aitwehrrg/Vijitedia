"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { CourseCard, CourseStatus } from "@/components/course-card";
import { ElectiveCard } from "@/components/elective-card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ArrowLeftFromLine, GraduationCap } from "lucide-react";
import { Course, CourseOption } from "@/types/flowsheet";
import { FLOWSHEET_DATA } from "@/data/programs";
import { MINORS } from "@/data/minors"; // Ensure this matches your data file
import { Button } from "@/components/ui/button";
import Link from "next/link";

// --- CONNECTION LINES COMPONENT (Unchanged) ---
type Point = { x: number; y: number };
type Connection = { start: Point; end: Point; type: "prereq" | "postreq" };

const ConnectionLines = ({ connections }: { connections: Connection[] }) => {
    return (
        <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-50 overflow-visible">
            <defs>
                <marker
                    id="arrow-prereq"
                    markerWidth="10"
                    markerHeight="10"
                    refX="9"
                    refY="3"
                    orient="auto"
                >
                    <path d="M0,0 L0,6 L9,3 z" fill="#f59e0b" />
                </marker>
                <marker
                    id="arrow-postreq"
                    markerWidth="10"
                    markerHeight="10"
                    refX="9"
                    refY="3"
                    orient="auto"
                >
                    <path d="M0,0 L0,6 L9,3 z" fill="#3b82f6" />
                </marker>
            </defs>
            {connections.map((conn, i) => {
                const dx = conn.end.x - conn.start.x;
                const curveIntensity = Math.min(Math.abs(dx) * 0.5, 120);
                const pathData = `M ${conn.start.x} ${conn.start.y} C ${conn.start.x + curveIntensity} ${conn.start.y}, ${conn.end.x - curveIntensity} ${conn.end.y}, ${conn.end.x} ${conn.end.y}`;
                const color = conn.type === "prereq" ? "#f59e0b" : "#3b82f6";
                return (
                    <path
                        key={i}
                        d={pathData}
                        fill="none"
                        stroke={color}
                        strokeWidth="2"
                        strokeDasharray={conn.type === "prereq" ? "4,4" : "0"}
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

    // Interaction State
    const [hoveredCourseId, setHoveredCourseId] = useState<string | null>(null);
    const [selectedCourseId, setSelectedCourseId] = useState<string | null>(
        null
    );
    const [selections, setSelections] = useState<Record<string, string>>({}); // Electives
    const [selectedMinorId, setSelectedMinorId] = useState<string | null>(null); // NEW: Minors
    const [connections, setConnections] = useState<Connection[]>([]);

    const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    // 1. Get Active Program Data
    const currentProgram = useMemo(
        () => FLOWSHEET_DATA.find((p) => p.id === programId),
        [programId]
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

    // 2. Calculate Effective Courses (Swapping slots with selected options or minors)
    const effectiveCourses = useMemo(() => {
        return allCourses.map((course) => {
            // A. Handle Electives (Local choice)
            if (course.type === "elective" && selections[course.id]) {
                const selectedOpt = course.options?.find(
                    (o) => o.id === selections[course.id]
                );
                if (selectedOpt) {
                    return { ...course, ...selectedOpt, id: course.id };
                }
            }

            // B. NEW: Handle Minors (Global choice)
            if (
                course.type === "minor" &&
                selectedMinorId &&
                course.minorIndex !== undefined
            ) {
                const activeMinor = MINORS.find(
                    (m) => m.id === selectedMinorId
                );
                // Get the specific course for this slot (e.g., 2nd course in the minor list)
                const minorCourse = activeMinor?.courses[course.minorIndex];

                if (minorCourse) {
                    // Merge: Keep the slot ID so React doesn't re-mount, but swap data
                    return { ...course, ...minorCourse, id: course.id };
                }
            }

            return course;
        });
    }, [allCourses, selections, selectedMinorId]);

    const allOptionsMap = useMemo(() => {
        const map = new Map<string, CourseOption>();
        allCourses.forEach((c) => {
            if (c.type === "elective" && c.options) {
                c.options.forEach((opt) => map.set(opt.id, opt));
            }
        });
        return map;
    }, [allCourses]);

    const disabledOptionIds = useMemo(() => {
        const disabled = new Set<string>();

        // Iterate over every currently selected option
        Object.values(selections).forEach((selectedId) => {
            const option = allOptionsMap.get(selectedId);
            // If this option has mutexIds, add them to the disabled set
            if (option && option.mutexIds) {
                option.mutexIds.forEach((mutexId) => disabled.add(mutexId));
            }
        });

        return disabled;
    }, [selections, allOptionsMap]);

    // Reset Interaction on Route Change
    useEffect(() => {
        setHoveredCourseId(null);
        setSelectedCourseId(null);
        setSelections({});
        setSelectedMinorId(null); // Reset minor
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

    // --- Logic Helpers ---
    const activeCourseId = hoveredCourseId || selectedCourseId;
    const handleProgramChange = (newId: string) => router.push(`/flowsheet/${newId}`);

    const handleCourseClick = (e: React.MouseEvent, courseId: string) => {
        e.stopPropagation();
        setSelectedCourseId((prev) => (prev === courseId ? null : courseId));
    };

    const handleElectiveSelect = (slotId: string, optionId: string) => {
        // 1. Find the slot object
        const currentSlot = allCourses.find((c) => c.id === slotId);
        if (!currentSlot || !currentSlot.options) return;

        // 2. Find the selected option object
        const selectedOption = currentSlot.options.find(
            (o) => o.id === optionId
        );

        // 3. Prepare the updates
        const updates: Record<string, string> = {};

        // Update the current slot
        updates[slotId] = optionId;

        // 4. CHECK FOR LINKS: If this choice is linked to another slot/option, update that too
        if (currentSlot.linkedSlotId && selectedOption?.linkedOptionId) {
            updates[currentSlot.linkedSlotId] = selectedOption.linkedOptionId;
        }

        // 5. Apply all updates at once
        setSelections((prev) => ({ ...prev, ...updates }));
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

    // --- Connection Line Logic ---
    useEffect(() => {
        if (!activeCourseId || !contentRef.current) {
            setConnections([]);
            return;
        }

        const newConnections: Connection[] = [];
        const containerRect = contentRef.current.getBoundingClientRect();
        const activeNode = cardRefs.current.get(activeCourseId);

        if (!activeNode) return;

        const activeRect = activeNode.getBoundingClientRect();
        const activeCourse = effectiveCourses.find(
            (c) => c.id === activeCourseId
        );

        const getCoords = (rect: DOMRect, side: "left" | "right") => ({
            x: (side === "left" ? rect.left : rect.right) - containerRect.left,
            y: rect.top - containerRect.top + rect.height / 2,
        });

        activeCourse?.prereqs?.forEach((prereqId) => {
            const prereqNode = cardRefs.current.get(prereqId);
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

        const postReqs = effectiveCourses.filter((c) =>
            c.prereqs?.includes(activeCourseId)
        );
        postReqs.forEach((post) => {
            const postNode = cardRefs.current.get(post.id);
            if (postNode) {
                newConnections.push({
                    start: getCoords(activeRect, "right"),
                    end: getCoords(postNode.getBoundingClientRect(), "left"),
                    type: "postreq",
                });
            }
        });

        setConnections(newConnections);
    }, [activeCourseId, effectiveCourses]);

    return (
        <div
            className="min-h-screen w-full flex flex-col bg-slate-50/50"
            onClick={() => setSelectedCourseId(null)}
        >
            {/* HEADER */}
            <div
                className="w-full bg-white border-b px-3 py-2 md:px-8 md:py-4 sticky top-0 z-30 shadow-sm"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3 md:gap-4">
                    {/* TOP ROW: Title & Back Button */}
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 -ml-1 md:ml-0"
                            asChild
                        >
                            <Link href="/flowsheet">
                                <ArrowLeftFromLine className="w-4 h-4" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-lg md:text-2xl font-bold tracking-tight text-slate-900 leading-tight">
                                Academic Flowsheet
                            </h1>
                            <p className="text-[10px] md:text-sm text-slate-500 line-clamp-1">
                                {currentProgram.department}
                            </p>
                        </div>
                    </div>

                    {/* BOTTOM ROW (Mobile) / RIGHT SIDE (Desktop): Controls */}
                    <div className="w-full md:w-auto flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
                        {/* Inputs: Grid on mobile (side-by-side), Flex on desktop */}
                        <div className="grid grid-cols-2 gap-2 w-full md:flex md:w-auto md:gap-4">
                            {/* Minor Selector */}
                            <Select
                                value={selectedMinorId || "none"}
                                onValueChange={(v) =>
                                    setSelectedMinorId(v === "none" ? null : v)
                                }
                            >
                                <SelectTrigger className="w-full md:w-[220px] h-8 md:h-9 border-dashed border-indigo-300 bg-indigo-50/50 text-indigo-700 text-xs">
                                    <SelectValue placeholder="Add Minor..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">
                                        No Minor
                                    </SelectItem>
                                    {MINORS.map((m) => (
                                        <SelectItem key={m.id} value={m.id}>
                                            {m.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {/* Program Selector */}
                            <Select
                                value={programId}
                                onValueChange={handleProgramChange}
                            >
                                <SelectTrigger className="w-full md:w-[220px] h-8 md:h-9 text-xs">
                                    <SelectValue placeholder="Select Program" />
                                </SelectTrigger>
                                <SelectContent>
                                    {FLOWSHEET_DATA.map((prog) => (
                                        <SelectItem
                                            key={prog.id}
                                            value={prog.id}
                                        >
                                            {prog.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Legend */}
                        <div className="flex gap-3 text-[10px] md:text-xs font-medium justify-end md:justify-start pt-1 md:pt-0">
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

            {/* SCROLLABLE CONTAINER */}
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

                    {/* Grid Headers */}
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
                        {flatSemesters.map((sem) => (
                            <div
                                key={sem.id}
                                className="text-center text-[10px] uppercase font-bold text-slate-400 tracking-wider"
                            >
                                {sem.label}
                            </div>
                        ))}
                    </div>

                    {/* COURSE GRID */}
                    <div className="flex flex-col gap-4 w-full relative z-10">
                        {Array.from({ length: maxRows }).map((_, rowIndex) => (
                            <div
                                key={rowIndex}
                                className="grid gap-4 w-full"
                                style={{
                                    gridTemplateColumns: `repeat(${flatSemesters.length}, minmax(0, 1fr))`,
                                }}
                            >
                                {flatSemesters.map((semester) => {
                                    const course = semester.courses[rowIndex];
                                    if (!course)
                                        return (
                                            <div
                                                key={`empty-${semester.id}-${rowIndex}`}
                                                className="aspect-4/3"
                                            />
                                        );

                                    return (
                                        <div
                                            key={course.id}
                                            className="aspect-4/3 w-full"
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
                                            {/* 1. MINOR SLOTS */}
                                            {course.type === "minor" ? (
                                                selectedMinorId ? (
                                                    // Minor Selected: Render as a styled CourseCard
                                                    <div className="h-full relative group">
                                                        <div className="absolute -top-1 -right-1 z-10 bg-white rounded-full p-0.5 shadow-sm">
                                                            <GraduationCap className="w-3 h-3 text-indigo-600" />
                                                        </div>
                                                        <CourseCard
                                                            // Pass the 'effective' merged data so the title/code is correct
                                                            course={
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
                                                        <div className="absolute inset-0 border-2 border-indigo-500/30 pointer-events-none rounded-lg" />
                                                    </div>
                                                ) : (
                                                    // No Minor: Render Placeholder
                                                    <div className="h-full border-2 border-dashed border-slate-200 rounded-lg p-2 flex flex-col justify-center items-center bg-slate-50 text-slate-400">
                                                        <GraduationCap className="w-5 h-5 mb-1 opacity-40" />
                                                        <span className="text-[9px] font-bold uppercase tracking-wider text-center">
                                                            Minor Slot{" "}
                                                            {course.minorIndex! +
                                                                1}
                                                        </span>
                                                    </div>
                                                )
                                            ) : course.type === "elective" ? (
                                                // 2. ELECTIVE SLOTS
                                                <ElectiveCard
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
                                                    } // <--- PASS THIS PROP
                                                />
                                            ) : (
                                                // 3. CORE COURSES
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
