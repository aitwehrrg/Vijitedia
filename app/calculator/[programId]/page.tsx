"use client";

import { useState, useMemo, useEffect } from "react";
import { useParams } from "next/navigation";
import { Course } from "@/types/flowsheet";
import { FLOWSHEET_DATA } from "@/data/programs";
import { GRADE_POINTS, GRADE_OPTIONS } from "@/data/grades";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

export default function CalculatorPage() {
    const params = useParams();
    const programId = params.programId as string;

    const [grades, setGrades] = useState<Record<string, string>>({});
    const [targetCGPA, setTargetCGPA] = useState<string>("");
    const [isLoaded, setIsLoaded] = useState(false);

    const currentProgram = useMemo(
        () => FLOWSHEET_DATA.find((p) => p.id === programId),
        [programId]
    );

    useEffect(() => {
        const saved = localStorage.getItem(`cgpa_${programId}`);
        if (saved) {
            setGrades(JSON.parse(saved));
        }
        setIsLoaded(true);
    }, [programId]);

    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem(`cgpa_${programId}`, JSON.stringify(grades));
        }
    }, [grades, programId, isLoaded]);

    if (!currentProgram) return <div>Program not found</div>;

    const handleGradeChange = (courseId: string, gradeKey: string) => {
        setGrades((prev) => ({
            ...prev,
            [courseId]: gradeKey,
        }));
    };

    // NEW: Handler to clear specific semester
    const clearSemesterGrades = (semesterCourses: Course[]) => {
        // if (!confirm("Clear grades for this semester?")) return;
        setGrades((prev) => {
            const next = { ...prev };
            semesterCourses.forEach((course) => {
                delete next[course.id];
            });
            return next;
        });
    };

    const calculateStats = (courses: Course[]) => {
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
                totalCredits > 0
                    ? (totalPoints / totalCredits).toFixed(2)
                    : "0.00",
        };
    };

    const allCourses = currentProgram.years.flatMap((y) =>
        y.semesters.flatMap((s) => s.courses)
    );

    const globalStats = calculateStats(allCourses);

    const calculatePrediction = () => {
        const target = parseFloat(targetCGPA);
        if (isNaN(target)) return null;

        const totalDegreeCredits = allCourses.reduce(
            (sum, c) => sum + (c.credits || 0),
            0
        );
        const completedCredits = globalStats.credits;
        const remainingCredits = totalDegreeCredits - completedCredits;

        if (remainingCredits <= 0)
            return { impossible: false, value: 0, done: true };

        const requiredPoints = target * totalDegreeCredits - globalStats.points;
        const requiredGPA = requiredPoints / remainingCredits;

        return {
            value: requiredGPA.toFixed(2),
            impossible: requiredGPA > 10.0 || requiredGPA < 0,
            done: false,
        };
    };

    const prediction = calculatePrediction();

    return (
        <div className="min-h-screen bg-slate-50/50 flex flex-col">
            {/* HEADER */}
            <div className="bg-white border-b px-4 py-4 sticky top-0 z-30 shadow-sm">
                <div className="max-w-6xl mx-auto flex flex-col gap-4 md:flex-row md:items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href="/calculator">
                                <ArrowLeftFromLine className="w-5 h-5 text-slate-500" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 hidden sm:block">
                                {currentProgram.name}
                            </h1>
                            <h1 className="text-xl font-bold text-slate-900 sm:hidden">
                                CGPA Calc
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-2 md:gap-6 w-full md:w-auto">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="h-10 border-dashed border-indigo-300 text-indigo-700 bg-indigo-50/50 hover:bg-indigo-50"
                                >
                                    <Target className="w-4 h-4 mr-2" />
                                    Predict
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80 p-4">
                                <div className="space-y-4">
                                    <h4 className="font-medium leading-none">
                                        Target CGPA
                                    </h4>
                                    <p className="text-sm text-muted-foreground">
                                        Enter your goal to see what you need in
                                        remaining courses.
                                    </p>
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
                                    {prediction && !prediction.done && (
                                        <div
                                            className={`text-sm font-medium p-2 rounded ${prediction.impossible ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}
                                        >
                                            {prediction.impossible
                                                ? `Impossible. Max possible is ${(
                                                      (globalStats.points +
                                                          10.0 *
                                                              (allCourses.reduce(
                                                                  (sum, c) =>
                                                                      sum +
                                                                      (c.credits ||
                                                                          0),
                                                                  0
                                                              ) -
                                                                  globalStats.credits)) /
                                                      allCourses.reduce(
                                                          (sum, c) =>
                                                              sum +
                                                              (c.credits || 0),
                                                          0
                                                      )
                                                  ).toFixed(2)}`
                                                : `You need avg ${prediction.value} in remaining credits.`}
                                        </div>
                                    )}
                                </div>
                            </PopoverContent>
                        </Popover>

                        <div className="h-8 w-px bg-slate-200 hidden sm:block" />

                        <div className="text-right hidden sm:block">
                            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                                Credits
                            </div>
                            <div className="font-mono font-bold text-slate-700">
                                {globalStats.credits}
                            </div>
                        </div>

                        <div className="text-right">
                            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                                CGPA
                            </div>
                            <div
                                className={`text-2xl font-mono font-black ${Number(globalStats.gpa) >= 3.0 ? "text-green-600" : "text-slate-900"}`}
                            >
                                {globalStats.gpa}
                            </div>
                        </div>

                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-slate-400 hover:text-red-500"
                            onClick={() => {
                                // if (!confirm("Clear all grades?")) return;
                                setGrades({});
                            }}
                            title="Reset All"
                        >
                            <RotateCcw className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* CONTENT GRID */}
            <div className="max-w-6xl mx-auto w-full p-4 md:p-8 space-y-8">
                {currentProgram.years.map((year) => (
                    <div key={year.id} className="space-y-4">
                        <h2 className="text-lg font-bold text-slate-800 border-b pb-2">
                            {year.label}
                        </h2>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {year.semesters.map((semester) => {
                                const semStats = calculateStats(
                                    semester.courses
                                );

                                return (
                                    <div
                                        key={semester.id}
                                        className="bg-white rounded-xl border shadow-sm p-5 flex flex-col"
                                    >
                                        <div className="flex justify-between items-center mb-4 border-b pb-2">
                                            <span className="font-semibold text-slate-600">
                                                {semester.label}
                                            </span>
                                            <div className="flex gap-2 items-center">
                                                <Badge
                                                    variant="secondary"
                                                    className="font-mono text-[10px]"
                                                >
                                                    {semStats.credits} Cr
                                                </Badge>
                                                <Badge
                                                    variant="outline"
                                                    className={`font-mono ${Number(semStats.gpa) >= 3.0 ? "bg-green-50 text-green-700 border-green-200" : "bg-slate-50"}`}
                                                >
                                                    SGPA: {semStats.gpa}
                                                </Badge>

                                                {/* Clear Semester Button */}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6 text-slate-300 hover:text-red-500 hover:bg-red-50 ml-1"
                                                    onClick={() =>
                                                        clearSemesterGrades(
                                                            semester.courses
                                                        )
                                                    }
                                                    title="Clear Semester"
                                                >
                                                    <RotateCcw className="w-3 h-3" />
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="space-y-3 flex-1">
                                            {semester.courses.map((course) => (
                                                <div
                                                    key={course.id}
                                                    className="flex items-center justify-between gap-3 group"
                                                >
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-bold text-xs text-slate-700 font-mono truncate group-hover:text-indigo-600 transition-colors">
                                                                {course.code ||
                                                                    course.label ||
                                                                    "Elective"}
                                                            </span>
                                                            <span className="text-[10px] text-slate-400 shrink-0">
                                                                {course.credits}{" "}
                                                                Cr
                                                            </span>
                                                        </div>
                                                        <div
                                                            className="text-xs text-slate-500 truncate"
                                                            title={course.title}
                                                        >
                                                            {course.title ||
                                                                "Select Grade"}
                                                        </div>
                                                    </div>

                                                    <Select
                                                        value={
                                                            grades[course.id] ||
                                                            ""
                                                        }
                                                        onValueChange={(val) =>
                                                            handleGradeChange(
                                                                course.id,
                                                                val
                                                            )
                                                        }
                                                    >
                                                        <SelectTrigger
                                                            className={`w-[70px] h-8 text-xs font-mono ${grades[course.id] ? "border-indigo-300 bg-indigo-50 text-indigo-700 font-bold" : ""}`}
                                                        >
                                                            <SelectValue placeholder="-" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {GRADE_OPTIONS.map(
                                                                (g) => (
                                                                    <SelectItem
                                                                        key={g}
                                                                        value={
                                                                            g
                                                                        }
                                                                    >
                                                                        {g}
                                                                    </SelectItem>
                                                                )
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
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
