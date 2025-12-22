"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { CourseCard, CourseStatus } from "@/components/course-card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Course } from "@/types/flowsheet";
import { FLOWSHEET_DATA } from "@/data/programs";

// --- CONNECTION LINES ---
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

                // Curve Logic
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
    const [selectedProgramId, setSelectedProgramId] = useState(
        FLOWSHEET_DATA[0].id
    );
    const [hoveredCourseId, setHoveredCourseId] = useState<string | null>(null);
    const [connections, setConnections] = useState<Connection[]>([]);

    const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());
    const scrollContainerRef = useRef<HTMLDivElement>(null); // Ref for the scrollable area
    const contentRef = useRef<HTMLDivElement>(null); // Ref for the content inside

    // 1. Get Data
    const currentProgram = useMemo(
        () =>
            FLOWSHEET_DATA.find((p) => p.id === selectedProgramId) ||
            FLOWSHEET_DATA[0],
        [selectedProgramId]
    );

    const flatSemesters = useMemo(
        () => currentProgram.years.flatMap((y) => y.semesters),
        [currentProgram]
    );

    const maxRows = useMemo(
        () => Math.max(...flatSemesters.map((s) => s.courses.length), 5),
        [flatSemesters]
    );

    const allCourses = useMemo(
        () => flatSemesters.flatMap((s) => s.courses),
        [flatSemesters]
    );

    // Reset
    useEffect(() => {
        setHoveredCourseId(null);
        setConnections([]);
        cardRefs.current.clear();
    }, [selectedProgramId]);

    // Calculate Lines
    useEffect(() => {
        if (!hoveredCourseId || !contentRef.current) {
            setConnections([]);
            return;
        }

        const newConnections: Connection[] = [];
        const containerRect = contentRef.current.getBoundingClientRect(); // Relative to the scroll content
        const activeNode = cardRefs.current.get(hoveredCourseId);

        if (!activeNode) return;
        const activeRect = activeNode.getBoundingClientRect();
        const activeCourse = allCourses.find((c) => c.id === hoveredCourseId);

        // Coordinate Helper: Relative to the CONTENT container, not the viewport
        const getCoords = (rect: DOMRect, side: "left" | "right") => ({
            x: (side === "left" ? rect.left : rect.right) - containerRect.left,
            y: rect.top - containerRect.top + rect.height / 2,
        });

        activeCourse?.prereqs.forEach((prereqId) => {
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

        const postReqs = allCourses.filter((c) =>
            c.prereqs.includes(hoveredCourseId)
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
    }, [hoveredCourseId, allCourses]);

    const getCourseStatus = (currentCourse: Course): CourseStatus => {
        if (!hoveredCourseId) return "default";
        if (currentCourse.id === hoveredCourseId) return "hovered";
        const activeCourse = allCourses.find((c) => c.id === hoveredCourseId);
        if (!activeCourse) return "default";
        if (activeCourse.prereqs.includes(currentCourse.id)) return "prereq";
        if (currentCourse.prereqs.includes(activeCourse.id)) return "postreq";
        return "default";
    };

    return (
        <div className="min-h-screen w-full flex flex-col bg-slate-50/50">
            {/* HEADER CONTROLS */}
            <div className="w-full bg-white border-b px-4 py-4 md:px-8 sticky top-0 z-30 shadow-sm">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                            Academic Flowsheet
                        </h1>
                        <p className="text-xs md:text-sm text-slate-500">
                            {currentProgram.department}
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto">
                        <Select
                            value={selectedProgramId}
                            onValueChange={setSelectedProgramId}
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
                {/* FIXED MIN-WIDTH CONTAINER - Ensures squares stay squares */}
                <div
                    className="relative bg-white rounded-xl shadow-xl border p-6 mx-auto min-w-[1200px] max-w-7xl"
                    ref={contentRef}
                >
                    {/* SVG Layer */}
                    <ConnectionLines connections={connections} />

                    {/* 1. YEAR HEADERS */}
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

                    {/* 2. SEMESTER HEADERS */}
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

                    {/* 3. COURSE GRID */}
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

                                    if (!course) {
                                        return (
                                            <div
                                                key={`empty-${semester.id}-${rowIndex}`}
                                                className="aspect-4/3"
                                            />
                                        );
                                    }

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
                                            // Mobile: Tap to toggle hover
                                            onClick={() =>
                                                setHoveredCourseId((prev) =>
                                                    prev === course.id
                                                        ? null
                                                        : course.id
                                                )
                                            }
                                        >
                                            <CourseCard
                                                course={course}
                                                status={getCourseStatus(course)}
                                            />
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
