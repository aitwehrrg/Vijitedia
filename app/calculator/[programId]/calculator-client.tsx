"use client";

import { useState, useMemo, useEffect, useCallback, memo } from "react";
import { notFound, useParams } from "next/navigation";
import { Course } from "@/types/flowsheet";
import { FLOWSHEET_DATA } from "@/data/programs";
import { GRADE_POINTS, GRADE_OPTIONS } from "@/data/grades";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeftFromLine, RotateCcw, Target } from "lucide-react";
import Link from "next/link";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

const CourseRow = memo(
    ({
        course,
        grade,
        isDisabled,
        onGradeChange,
    }: {
        course: Course;
        grade: string;
        isDisabled: boolean;
        onGradeChange: (courseId: string, val: string) => void;
    }) => {
        return (
            <div className="flex items-center justify-between gap-3 group">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-bold text-xs text-slate-700 font-mono truncate group-hover:text-indigo-600 transition-colors">
                            {course.code || course.label || "Elective"}
                        </span>
                        <span className="text-[10px] text-slate-400 shrink-0 bg-slate-100 px-1 rounded">
                            {course.credits} Cr
                        </span>
                    </div>
                    <div
                        className="text-xs sm:text-sm text-slate-600 truncate font-medium"
                        title={course.title}
                    >
                        {course.title || "Select Grade"}
                    </div>
                </div>

                <Select
                    value={grade || ""}
                    onValueChange={(val) => onGradeChange(course.id, val)}
                    disabled={isDisabled}
                >
                    <SelectTrigger
                        className={`w-[75px] h-9 text-xs font-mono ${
                            grade && !isDisabled
                                ? "border-indigo-300 bg-indigo-50 text-indigo-700 font-bold"
                                : ""
                        }`}
                    >
                        <SelectValue placeholder="-" />
                    </SelectTrigger>
                    <SelectContent>
                        {GRADE_OPTIONS.map((g) => (
                            <SelectItem key={g} value={g}>
                                {g}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        );
    },
    (prev, next) => {
        return (
            prev.grade === next.grade &&
            prev.isDisabled === next.isDisabled &&
            prev.course.id === next.course.id
        );
    }
);
CourseRow.displayName = "CourseRow";

const calculateStats = (courses: Course[], grades: Record<string, string>) => {
    let totalPoints = 0;
    let totalCredits = 0;

    courses.forEach((course) => {
        const gradeKey = grades[course.id];
        if (gradeKey) {
            const points = GRADE_POINTS[gradeKey];
            const credits = course.credits || 0;
            totalPoints += points * credits;
            totalCredits += credits;
        }
    });

    return {
        points: totalPoints,
        credits: totalCredits,
        gpa:
            totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : "0.00",
    };
};

export default function CalculatorPage() {
    const params = useParams();
    const programId = params.programId as string;

    const [grades, setGrades] = useState<Record<string, string>>({});
    const [targetCGPA, setTargetCGPA] = useState<string>("");
    const [excludedSemesters, setExcludedSemesters] = useState<string[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    const currentProgram = useMemo(
        () => FLOWSHEET_DATA.find((p) => p.id === programId),
        [programId]
    );

    useEffect(() => {
        const savedGrades = localStorage.getItem(`cgpa_${programId}_grades`);
        const savedExcluded = localStorage.getItem(
            `cgpa_${programId}_excluded`
        );

        if (savedGrades) setGrades(JSON.parse(savedGrades));
        if (savedExcluded) setExcludedSemesters(JSON.parse(savedExcluded));

        setIsLoaded(true);
    }, [programId]);

    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem(
                `cgpa_${programId}_grades`,
                JSON.stringify(grades)
            );
            localStorage.setItem(
                `cgpa_${programId}_excluded`,
                JSON.stringify(excludedSemesters)
            );
        }
    }, [grades, excludedSemesters, programId, isLoaded]);

    const handleGradeChange = useCallback(
        (courseId: string, gradeKey: string) => {
            setGrades((prev) => ({
                ...prev,
                [courseId]: gradeKey,
            }));
        },
        []
    );

    const toggleSemester = useCallback((semId: string) => {
        setExcludedSemesters((prev) =>
            prev.includes(semId)
                ? prev.filter((id) => id !== semId)
                : [...prev, semId]
        );
    }, []);

    const clearSemesterGrades = useCallback((semesterCourses: Course[]) => {
        setGrades((prev) => {
            const next = { ...prev };
            semesterCourses.forEach((course) => {
                delete next[course.id];
            });
            return next;
        });
    }, []);

    const clearAllGrades = useCallback(() => {
        setGrades({});
    }, []);

    const activeCourses = useMemo(() => {
        if (!currentProgram) return [];
        return currentProgram.years.flatMap((y) =>
            y.semesters
                .filter((s) => !excludedSemesters.includes(s.id))
                .flatMap((s) => s.courses)
        );
    }, [currentProgram, excludedSemesters]);

    const globalStats = useMemo(() => {
        return calculateStats(activeCourses, grades);
    }, [activeCourses, grades]);

    const prediction = useMemo(() => {
        const target = parseFloat(targetCGPA);
        if (isNaN(target)) return null;

        const totalDegreeCredits = activeCourses.reduce(
            (sum, c) => sum + (c.credits || 0),
            0
        );
        const completedCredits = globalStats.credits;
        const remainingCredits = totalDegreeCredits - completedCredits;

        const currentPoints = globalStats.points;

        const maxPoints = currentPoints + 10 * remainingCredits;
        const maxPossibleCGPA =
            totalDegreeCredits > 0 ? maxPoints / totalDegreeCredits : 0;

        const minPoints = currentPoints + 0 * remainingCredits;
        const minPossibleCGPA =
            totalDegreeCredits > 0 ? minPoints / totalDegreeCredits : 0;

        if (remainingCredits <= 0)
            return {
                status: "done",
                value: 0,
                maxPossible: maxPossibleCGPA,
                minPossible: minPossibleCGPA,
            };

        const requiredPoints = target * totalDegreeCredits - currentPoints;
        const requiredGPA = requiredPoints / remainingCredits;

        if (requiredGPA > 10.0) {
            return {
                status: "impossible-high",
                value: requiredGPA,
                maxPossible: maxPossibleCGPA,
                minPossible: minPossibleCGPA,
            };
        }

        if (requiredGPA < 0) {
            return {
                status: "impossible-low",
                value: requiredGPA,
                maxPossible: maxPossibleCGPA,
                minPossible: minPossibleCGPA,
            };
        }

        return {
            status: "possible",
            value: requiredGPA,
            maxPossible: maxPossibleCGPA,
            minPossible: minPossibleCGPA,
        };
    }, [targetCGPA, activeCourses, globalStats]);

    if (!currentProgram) notFound();

    const renderPredictionMessage = () => {
        if (!prediction) return null;

        if (prediction.status === "done") {
            return (
                <div className="text-sm font-medium p-2 rounded bg-slate-100 text-slate-600">
                    No remaining credits to predict.
                </div>
            );
        }

        if (prediction.status === "impossible-high") {
            return (
                <div className="text-sm font-medium p-2 rounded bg-red-50 text-red-600 space-y-1">
                    <div>Impossible. Target too high.</div>
                    <div className="text-xs opacity-90">
                        Max theoretical CGPA:{" "}
                        <strong>{prediction.maxPossible.toFixed(2)}</strong>
                    </div>
                </div>
            );
        }

        if (prediction.status === "impossible-low") {
            return (
                <div className="text-sm font-medium p-2 rounded bg-blue-50 text-blue-600 space-y-1">
                    <div>Guaranteed. Target already met.</div>
                    <div className="text-xs opacity-90">
                        Min theoretical CGPA:{" "}
                        <strong>{prediction.minPossible.toFixed(2)}</strong>
                    </div>
                </div>
            );
        }

        return (
            <div className="text-sm font-medium p-2 rounded bg-green-50 text-green-600">
                Need avg <strong>{prediction.value.toFixed(2)}</strong> in
                remaining credits.
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-slate-50/50 flex flex-col">
            {}
            <div className="bg-white border-b px-3 py-3 md:px-8 md:py-4 sticky top-0 z-30 shadow-sm">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 -ml-1 md:ml-0 shrink-0"
                            asChild
                        >
                            <Link href="/calculator">
                                <ArrowLeftFromLine className="w-5 h-5 text-slate-500" />
                            </Link>
                        </Button>
                        <div className="min-w-0">
                            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 leading-tight truncate">
                                CGPA Calculator
                            </h1>
                            <p className="text-xs md:text-sm text-slate-500 line-clamp-1">
                                {currentProgram.name}
                            </p>
                        </div>
                    </div>

                    <div className="w-full md:w-auto flex items-center justify-between gap-3 md:gap-6">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="h-10 md:h-9 border-dashed border-indigo-300 text-indigo-700 bg-indigo-50/50 hover:bg-indigo-50 text-xs md:text-sm px-3"
                                >
                                    <Target className="w-3.5 h-3.5 mr-2" />
                                    Predict
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80 p-4">
                                <div className="space-y-4">
                                    <h4 className="font-medium leading-none">
                                        Target CGPA
                                    </h4>
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="7.5"
                                            value={targetCGPA}
                                            onChange={(e) =>
                                                setTargetCGPA(e.target.value)
                                            }
                                            className="h-8"
                                        />
                                    </div>
                                    {renderPredictionMessage()}
                                </div>
                            </PopoverContent>
                        </Popover>

                        <div className="flex items-center gap-4 md:gap-6">
                            <div className="text-right">
                                <div className="text-[10px] md:text-xs uppercase font-bold text-slate-400 tracking-wider">
                                    Credits
                                </div>
                                <div className="font-mono font-bold text-slate-700 text-sm md:text-base">
                                    {globalStats.credits}
                                </div>
                            </div>

                            <div className="text-right">
                                <div className="text-[10px] md:text-xs uppercase font-bold text-slate-400 tracking-wider">
                                    CGPA
                                </div>
                                <div
                                    className={`text-xl md:text-2xl font-mono font-black ${
                                        Number(globalStats.gpa) >= 3.0
                                            ? "text-green-600"
                                            : "text-slate-900"
                                    }`}
                                >
                                    {globalStats.gpa}
                                </div>
                            </div>

                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 text-slate-400 hover:text-red-500"
                                onClick={clearAllGrades}
                                title="Reset All"
                            >
                                <RotateCcw className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {}
            <div className="max-w-7xl mx-auto w-full p-4 md:p-8 space-y-8">
                {currentProgram.years.map((year) => (
                    <div key={year.id} className="space-y-4">
                        <h2 className="text-sm md:text-base font-bold text-slate-800 border-b pb-2">
                            {year.label}
                        </h2>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                            {year.semesters.map((semester) => {
                                const isExcluded = excludedSemesters.includes(
                                    semester.id
                                );
                                const semStats = calculateStats(
                                    semester.courses,
                                    grades
                                );

                                return (
                                    <div
                                        key={semester.id}
                                        className={`bg-white rounded-xl border shadow-sm p-4 md:p-5 flex flex-col transition-opacity duration-200 ${
                                            isExcluded
                                                ? "opacity-60 grayscale-[0.5]"
                                                : "opacity-100"
                                        }`}
                                    >
                                        <div className="flex justify-between items-center mb-4 border-b pb-3">
                                            <div className="flex items-center gap-3">
                                                <Checkbox
                                                    id={`chk-${semester.id}`}
                                                    checked={!isExcluded}
                                                    onCheckedChange={() =>
                                                        toggleSemester(
                                                            semester.id
                                                        )
                                                    }
                                                    className="data-[state=checked]:bg-neutral-600 data-[state=checked]:border-neutral-600"
                                                />
                                                <label
                                                    htmlFor={`chk-${semester.id}`}
                                                    className="font-bold text-slate-700 text-sm cursor-pointer select-none"
                                                >
                                                    {semester.label}
                                                </label>
                                            </div>

                                            <div className="flex gap-2 items-center">
                                                <Badge
                                                    variant="secondary"
                                                    className="font-mono text-xs"
                                                >
                                                    {semStats.credits} Cr
                                                </Badge>
                                                <Badge
                                                    variant="outline"
                                                    className={`font-mono text-xs ${
                                                        !isExcluded &&
                                                        Number(semStats.gpa) >=
                                                            3.0
                                                            ? "bg-green-50 text-green-700 border-green-200"
                                                            : "bg-slate-50 text-slate-500"
                                                    }`}
                                                >
                                                    SGPA: {semStats.gpa}
                                                </Badge>

                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6 text-slate-300 hover:text-red-500 hover:bg-red-50 ml-1"
                                                    onClick={() =>
                                                        clearSemesterGrades(
                                                            semester.courses
                                                        )
                                                    }
                                                    disabled={isExcluded}
                                                >
                                                    <RotateCcw className="w-3 h-3" />
                                                </Button>
                                            </div>
                                        </div>

                                        <div
                                            className={`space-y-3 flex-1 ${
                                                isExcluded
                                                    ? "pointer-events-none"
                                                    : ""
                                            }`}
                                        >
                                            {semester.courses.map((course) => (
                                                <CourseRow
                                                    key={course.id}
                                                    course={course}
                                                    grade={grades[course.id]}
                                                    isDisabled={isExcluded}
                                                    onGradeChange={
                                                        handleGradeChange
                                                    }
                                                />
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
