"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { CourseCard, CourseStatus } from "@/components/course-card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { FLOWSHEET_DATA, Course } from "@/data/programs";

// --- CONNECTION LINE COMPONENT (UNCHANGED) ---
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
                const controlPoint1 = {
                    x: conn.start.x + dx * 0.5,
                    y: conn.start.y,
                };
                const controlPoint2 = {
                    x: conn.end.x - dx * 0.5,
                    y: conn.end.y,
                };
                const pathData = `M ${conn.start.x} ${conn.start.y} C ${controlPoint1.x} ${controlPoint1.y}, ${controlPoint2.x} ${controlPoint2.y}, ${conn.end.x} ${conn.end.y}`;
                const color = conn.type === "prereq" ? "#f59e0b" : "#3b82f6";

                return (
                    <path
                        key={i}
                        d={pathData}
                        fill="none"
                        stroke={color}
                        strokeWidth="3"
                        strokeDasharray={conn.type === "prereq" ? "5,5" : "0"}
                        markerEnd={`url(#arrow-${conn.type})`}
                        className="animate-in fade-in duration-300"
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
    const containerRef = useRef<HTMLDivElement>(null);

    // 1. Get Active Program Data
    const currentProgram = useMemo(
        () =>
            FLOWSHEET_DATA.find((p) => p.id === selectedProgramId) ||
            FLOWSHEET_DATA[0],
        [selectedProgramId]
    );

    // 2. Flatten Courses for current program
    const allCourses = useMemo(() => {
        return currentProgram.years.flatMap((y) =>
            y.semesters.flatMap((s) => s.courses)
        );
    }, [currentProgram]);

    // Reset connections when program changes
    useEffect(() => {
        setHoveredCourseId(null);
        setConnections([]);
        cardRefs.current.clear();
    }, [selectedProgramId]);

    // Calculate positions (Same logic as before, depends on allCourses)
    useEffect(() => {
        if (!hoveredCourseId || !containerRef.current) {
            setConnections([]);
            return;
        }

        const newConnections: Connection[] = [];
        const containerRect = containerRef.current.getBoundingClientRect();
        const activeNode = cardRefs.current.get(hoveredCourseId);

        if (!activeNode) return;
        const activeRect = activeNode.getBoundingClientRect();
        const activeCourse = allCourses.find((c) => c.id === hoveredCourseId);

        const getCoords = (rect: DOMRect, side: "left" | "right") => ({
            x:
                (side === "left" ? rect.left : rect.right) -
                containerRect.left +
                (containerRef.current?.scrollLeft || 0),
            y: rect.top - containerRect.top + rect.height / 2,
        });

        // Prereqs
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

        // Postreqs
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
        <div className="p-6 w-full h-screen flex flex-col gap-6">
            {/* HEADER WITH CONTROLS */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Academic Flowsheets
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        {currentProgram.department}
                    </p>
                </div>

                <div className="flex items-center gap-6">
                    {/* Program Selector */}
                    <Select
                        value={selectedProgramId}
                        onValueChange={setSelectedProgramId}
                    >
                        <SelectTrigger className="w-[280px]">
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

                    {/* Legend */}
                    <div className="hidden md:flex gap-4 text-xs font-medium">
                        <div className="flex items-center">
                            <div className="w-3 h-3 bg-amber-100 border-l-2 border-amber-500 mr-2" />{" "}
                            Prerequisite
                        </div>
                        <div className="flex items-center">
                            <div className="w-3 h-3 bg-blue-100 border-l-2 border-blue-500 mr-2" />{" "}
                            Post-requisite
                        </div>
                    </div>
                </div>
            </div>

            <ScrollArea
                className="w-full whitespace-nowrap rounded-md border bg-slate-50/30 flex-1"
                ref={containerRef}
            >
                <div className="flex w-max min-w-full divide-x relative min-h-full">
                    <ConnectionLines connections={connections} />

                    {currentProgram.years.map((year) => (
                        <div
                            key={year.id}
                            className="flex flex-col min-w-[350px]"
                        >
                            <div className="bg-slate-100 dark:bg-slate-800 p-3 text-center font-bold border-b sticky top-0 z-20">
                                {year.label}
                            </div>
                            <div className="flex h-full divide-x">
                                {year.semesters.map((semester) => (
                                    <div
                                        key={semester.id}
                                        className="flex-1 min-w-[175px] flex flex-col p-2 gap-3 z-10"
                                    >
                                        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider text-center mb-2">
                                            {semester.label}
                                        </div>

                                        {semester.courses.map((course) => (
                                            <div
                                                key={course.id}
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
                                                    setHoveredCourseId(
                                                        course.id
                                                    )
                                                }
                                                onMouseLeave={() =>
                                                    setHoveredCourseId(null)
                                                }
                                            >
                                                <CourseCard
                                                    course={course}
                                                    status={getCourseStatus(
                                                        course
                                                    )}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
                <ScrollBar orientation="horizontal" />
            </ScrollArea>
        </div>
    );
}
