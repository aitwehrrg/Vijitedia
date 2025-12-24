"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { CourseCard, CourseStatus } from "@/components/course-card";
import { ElectiveCard } from "@/components/elective-card"; // Import the new component
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ArrowLeftFromLine } from "lucide-react";
import { Course } from "@/types/flowsheet";
import { FLOWSHEET_DATA } from "@/data/programs";
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
    const [selections, setSelections] = useState<Record<string, string>>({}); // Track elective picks
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

    // 2. Calculate Effective Courses (Swapping slots with selected options)
    // This ensures arrows point to the prerequisites of the *selected* elective
    const effectiveCourses = useMemo(() => {
        return allCourses.map((course) => {
            // If it's an elective and we have a selection for it...
            if (course.type === "elective" && selections[course.id]) {
                const selectedOpt = course.options?.find(
                    (o) => o.id === selections[course.id]
                );
                // Return merged object: Slot ID (for DOM ref) + Option Data (for Logic)
                if (selectedOpt) {
                    return { ...course, ...selectedOpt, id: course.id };
                }
            }
            return course;
        });
    }, [allCourses, selections]);

    // Reset Interaction on Route Change
    useEffect(() => {
        setHoveredCourseId(null);
        setSelectedCourseId(null);
        setSelections({});
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

    const handleProgramChange = (newId: string) => router.push(`/${newId}`);

    const handleCourseClick = (e: React.MouseEvent, courseId: string) => {
        e.stopPropagation();
        setSelectedCourseId((prev) => (prev === courseId ? null : courseId));
    };

    const handleElectiveSelect = (slotId: string, optionId: string) => {
        setSelections((prev) => ({ ...prev, [slotId]: optionId }));
    };

    const getCourseStatus = (currentCourse: Course): CourseStatus => {
        if (!activeCourseId) return "default";
        if (currentCourse.id === activeCourseId) return "hovered";

        // Use effectiveCourses for logic so arrows match selections
        const activeCourse = effectiveCourses.find(
            (c) => c.id === activeCourseId
        );
        if (!activeCourse) return "default";

        // Use effectiveCourses to check relationships
        // (If currentCourse is a slot, we need its effective version to check its prereqs)
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

        // 1. Prereqs -> Active
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

        // 2. Active -> Postreqs
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
    }, [activeCourseId, effectiveCourses]); // Depend on effectiveCourses

    return (
        <div
            className="min-h-screen w-full flex flex-col bg-slate-50/50"
            onClick={() => setSelectedCourseId(null)}
        >
            {/* HEADER (Unchanged content, abbreviated for brevity) */}
            <div
                className="w-full bg-white border-b px-4 py-4 md:px-8 sticky top-0 z-30 shadow-sm"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            asChild
                            className="hidden md:flex"
                        >
                            <Link href="/">
                                <ArrowLeftFromLine className="w-4 h-4" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                                Academic Flowsheet
                            </h1>
                            <p className="text-xs md:text-sm text-slate-500">
                                {currentProgram.department}
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto">
                        <Select
                            value={programId}
                            onValueChange={handleProgramChange}
                        >
                            <SelectTrigger className="w-full md:w-[240px]">
                                <SelectValue placeholder="Select Program" />
                            </SelectTrigger>
                            <SelectContent>
                                {FLOWSHEET_DATA.map((prog) => (
                                    <SelectItem key={prog.id} value={prog.id}>
                                        {prog.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <div className="flex gap-4 text-xs font-medium">
                            <div className="flex items-center text-slate-600">
                                <div className="w-2 h-2 rounded-full bg-amber-500 mr-2" />{" "}
                                Prereq
                            </div>
                            <div className="flex items-center text-slate-600">
                                <div className="w-2 h-2 rounded-full bg-blue-500 mr-2" />{" "}
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

                    {/* Grid Headers (Years/Semesters) - Unchanged */}
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
                                            {/* CONDITIONAL RENDERING FOR ELECTIVES */}
                                            {course.type === "elective" ? (
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
