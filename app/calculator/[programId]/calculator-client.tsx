"use client";

import { useState, useMemo, useEffect, useCallback, memo } from "react";
import { notFound, useParams } from "next/navigation";
import { Course } from "@/types/flowsheet";
import { FLOWSHEET_DATA } from "@/data/programs";
import { HONORS } from "@/data/honors";
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
import {
    ArrowLeftFromLine,
    RotateCcw,
    Target,
    Network,
    AlertTriangle,
    Award,
} from "lucide-react";
import Link from "next/link";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { getSuffix } from "@/lib/utils";

const getGradeColor = (grade: string) => {
    const points = GRADE_POINTS[grade];
    if (points === undefined)
        return "border-slate-300 bg-slate-100 text-slate-700 font-bold";
    if (points >= 9)
        return "border-green-300 bg-green-100 text-green-800 font-bold";
    if (points >= 8)
        return "border-cyan-300 bg-cyan-100 text-cyan-800 font-bold";
    if (points >= 7)
        return "border-blue-300 bg-blue-100 text-blue-800 font-bold";
    if (points >= 6)
        return "border-violet-300 bg-violet-100 text-violet-800 font-bold";
    if (points >= 5)
        return "border-yellow-300 bg-yellow-100 text-yellow-800 font-bold";
    if (points >= 4)
        return "border-orange-300 bg-orange-100 text-orange-800 font-bold";
    return "border-rose-300 bg-rose-100 text-rose-800 font-bold";
};

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
                        <span className="font-bold text-sm text-slate-700 font-mono truncate group-hover:text-indigo-600 transition-colors">
                            {course.code || course.label || "Elective"}
                        </span>
                        <span className="text-xs text-slate-400 shrink-0 bg-slate-100 px-1 rounded">
                            {course.credits} Cr
                        </span>
                    </div>
                    <div
                        className="text-sm text-slate-600 truncate font-medium"
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
                        className={`w-[75px] h-9 text-sm font-mono transition-colors ${
                            grade && !isDisabled ? getGradeColor(grade) : ""
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
            setGrades((prev) => ({ ...prev, [courseId]: gradeKey }));
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

    const activeMainCourses = useMemo(() => {
        if (!currentProgram) return [];
        return currentProgram.years.flatMap((y) =>
            y.semesters
                .filter((s) => !excludedSemesters.includes(s.id))
                .flatMap((s) =>
                    s.courses.filter(
                        (c) => c.type !== "honors"
                    )
                )
        );
    }, [currentProgram, excludedSemesters]);

    const activeHonorsCourses = useMemo(() => {
        if (!currentProgram) return [];

        const track = HONORS.find((h) => h.dept === currentProgram.department);

        if (!track) return [];

        return track.courses.map((c, i) => ({
            ...c,
            code: `R5XX${(i >> 2) + 3}XXX${i === 7 ? "P" : (i & 1) === 0 ? "T" : "L"}`,
            title: `Honors ${getSuffix(i)}`,
        }));
    }, [currentProgram]);

    const mainStats = useMemo(() => {
        return calculateStats(activeMainCourses, grades);
    }, [activeMainCourses, grades]);

    const honorsStats = useMemo(() => {
        return calculateStats(activeHonorsCourses, grades);
    }, [activeHonorsCourses, grades]);

    const yearStats = useMemo(() => {
        if (!currentProgram) return [];
        return currentProgram.years.map((year) => {
            let passedCredits = 0;
            let failureCount = 0;
            const allCourses = year.semesters.flatMap((s) => s.courses);
            allCourses.forEach((course) => {
                const g = grades[course.id];
                if (g) {
                    if (g === "FF") failureCount++;
                    else passedCredits += course.credits || 0;
                }
            });
            return { passedCredits, failureCount };
        });
    }, [currentProgram, grades]);

    const prediction = useMemo(() => {
        const target = parseFloat(targetCGPA);
        if (isNaN(target)) return null;

        const totalDegreeCredits = activeMainCourses.reduce(
            (sum, c) => sum + (c.credits || 0),
            0
        );
        const completedCredits = mainStats.credits;
        const remainingCredits = totalDegreeCredits - completedCredits;
        const currentPoints = mainStats.points;

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

        if (requiredGPA > 10.0)
            return {
                status: "impossible-high",
                value: requiredGPA,
                maxPossible: maxPossibleCGPA,
                minPossible: minPossibleCGPA,
            };
        if (requiredGPA < 0)
            return {
                status: "impossible-low",
                value: requiredGPA,
                maxPossible: maxPossibleCGPA,
                minPossible: minPossibleCGPA,
            };

        return {
            status: "possible",
            value: requiredGPA,
            maxPossible: maxPossibleCGPA,
            minPossible: minPossibleCGPA,
        };
    }, [targetCGPA, activeMainCourses, mainStats]);

    if (!currentProgram) notFound();

    const renderPredictionMessage = () => {
        if (!prediction) return null;
        if (prediction.status === "done")
            return (
                <div className="text-sm font-medium p-2 rounded bg-slate-100 text-slate-600">
                    No remaining credits to predict.
                </div>
            );
        if (prediction.status === "impossible-high")
            return (
                <div className="text-sm font-medium p-2 rounded bg-red-50 text-red-600 space-y-1">
                    <div>Impossible. Target too high.</div>
                    <div className="text-xs opacity-90">
                        Max theoretical CGPA:{" "}
                        <strong>{prediction.maxPossible.toFixed(2)}</strong>
                    </div>
                </div>
            );
        if (prediction.status === "impossible-low")
            return (
                <div className="text-sm font-medium p-2 rounded bg-blue-50 text-blue-600 space-y-1">
                    <div>Guaranteed. Target already met.</div>
                    <div className="text-xs opacity-90">
                        Min theoretical CGPA:{" "}
                        <strong>{prediction.minPossible.toFixed(2)}</strong>
                    </div>
                </div>
            );
        return (
            <div className="text-sm font-medium p-2 rounded bg-green-50 text-green-600">
                Need avg <strong>{prediction.value.toFixed(2)}</strong> in
                remaining credits.
            </div>
        );
    };

    const renderPromotionWarning = (yearIndex: number) => {
        if (yearIndex === 0) return null;
        const isDSY = currentProgram.years[0].semesters.every((s) =>
            excludedSemesters.includes(s.id)
        );
        const failuresY1 = yearStats[0]?.failureCount || 0;
        const creditsY1 = yearStats[0]?.passedCredits || 0;
        const failuresY2 = yearStats[1]?.failureCount || 0;
        const creditsY2 = yearStats[1]?.passedCredits || 0;
        const creditsY3 = yearStats[2]?.passedCredits || 0;
        let error = null;
        if (yearIndex === 1) {
            if (!isDSY && creditsY1 < 32)
                error = `Insufficient Year 1 Credits (${creditsY1}/32)`;
        } else if (yearIndex === 2) {
            if (creditsY2 < 32)
                error = `Insufficient Year 2 Credits (${creditsY2}/32)`;
            else if (!isDSY && failuresY1 > 1)
                error = `Too many Year 1 Failures (${failuresY1} > 1)`;
        } else if (yearIndex === 3) {
            if (creditsY3 < 32)
                error = `Insufficient Year 3 Credits (${creditsY3}/32)`;
            else if (failuresY2 > 1)
                error = `Too many Year 2 Failures (${failuresY2} > 1)`;
            else if (!isDSY && failuresY1 > 0)
                error = `Uncleared Year 1 Failures (${failuresY1})`;
        }
        if (error)
            return (
                <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-3 text-amber-800 text-sm font-medium">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>
                        Cannot promote to Year {yearIndex + 1}: {error}
                    </span>
                </div>
            );
        return null;
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
                        <Button
                            asChild
                            variant="outline"
                            className="h-10 md:h-9 text-xs md:text-sm gap-2"
                        >
                            <Link href={`/flowsheet/${programId}`}>
                                <Network className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">
                                    Flowsheet
                                </span>
                                <span className="inline sm:hidden">View</span>
                            </Link>
                        </Button>

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
                                        Target CGPA (Main)
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
                                    {mainStats.credits}
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-[10px] md:text-xs uppercase font-bold text-slate-400 tracking-wider">
                                    CGPA
                                </div>
                                <div
                                    className={`text-xl md:text-2xl font-mono font-black ${Number(mainStats.gpa) >= 6.75 ? "text-green-600" : "text-slate-900"}`}
                                >
                                    {mainStats.gpa}
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

            <div className="max-w-7xl mx-auto w-full p-4 md:p-8 space-y-8">
                {}
                {currentProgram.years.map((year, yearIndex) => {
                    const isYearDisabled = year.semesters.every((s) =>
                        excludedSemesters.includes(s.id)
                    );
                    return (
                        <div key={year.id} className="space-y-4">
                            {!isYearDisabled &&
                                renderPromotionWarning(yearIndex)}
                            <h2 className="text-sm md:text-base font-bold text-slate-800 border-b pb-2">
                                {year.label}
                            </h2>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                                {year.semesters.map((semester) => {
                                    const isExcluded =
                                        excludedSemesters.includes(semester.id);
                                    const mainSemCourses =
                                        semester.courses.filter(
                                            (c) => c.type !== "honors"
                                        );
                                    const semStats = calculateStats(
                                        mainSemCourses,
                                        grades
                                    );

                                    return (
                                        <div
                                            key={semester.id}
                                            className={`bg-white rounded-xl border shadow-sm p-4 md:p-5 flex flex-col transition-opacity duration-200 ${isExcluded ? "opacity-60 grayscale-[0.5]" : "opacity-100"}`}
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
                                                        className="font-mono text-sm"
                                                    >
                                                        {semStats.credits} Cr
                                                    </Badge>
                                                    <Badge
                                                        variant="outline"
                                                        className={`font-mono text-sm ${!isExcluded && Number(semStats.gpa) >= 4.0 ? "bg-green-50 text-green-700 border-green-200" : "bg-slate-50 text-slate-500"}`}
                                                    >
                                                        SGPA: {semStats.gpa}
                                                    </Badge>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6 text-slate-300 hover:text-red-500 hover:bg-red-50 ml-1"
                                                        onClick={() =>
                                                            clearSemesterGrades(
                                                                mainSemCourses
                                                            )
                                                        }
                                                        disabled={isExcluded}
                                                    >
                                                        <RotateCcw className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                            <div
                                                className={`space-y-3 flex-1 ${isExcluded ? "pointer-events-none" : ""}`}
                                            >
                                                {mainSemCourses.map(
                                                    (course) => (
                                                        <CourseRow
                                                            key={course.id}
                                                            course={course}
                                                            grade={
                                                                grades[
                                                                    course.id
                                                                ]
                                                            }
                                                            isDisabled={
                                                                isExcluded
                                                            }
                                                            onGradeChange={
                                                                handleGradeChange
                                                            }
                                                        />
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}

                {}
                {activeHonorsCourses.length > 0 && (
                    <div className="pt-8 border-t border-slate-200">
                        <div className="bg-purple-50/50 rounded-xl border border-purple-100 shadow-sm p-4 md:p-6">
                            <div className="flex justify-between items-center mb-6 border-b border-purple-100 pb-4">
                                <div className="flex items-center gap-3">
                                    <Award className="w-5 h-5 text-purple-900" />
                                    <div>
                                        <h3 className="font-bold text-purple-900">
                                            Honors Degree
                                        </h3>
                                    </div>
                                </div>

                                <div className="flex gap-4 items-center">
                                    <div className="text-right">
                                        <div className="text-[10px] uppercase font-bold text-purple-400 tracking-wider">
                                            Credits
                                        </div>
                                        <div className="font-mono font-bold text-purple-800">
                                            {honorsStats.credits}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[10px] uppercase font-bold text-purple-400 tracking-wider">
                                            Honors GPA
                                        </div>
                                        <div className="text-xl font-mono font-black text-purple-700">
                                            {honorsStats.gpa}
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-purple-300 hover:text-red-500 hover:bg-red-50"
                                        onClick={() =>
                                            clearSemesterGrades(
                                                activeHonorsCourses
                                            )
                                        }
                                    >
                                        <RotateCcw className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {activeHonorsCourses.map((course) => (
                                    <CourseRow
                                        key={course.id}
                                        course={course}
                                        grade={grades[course.id]}
                                        isDisabled={false}
                                        onGradeChange={handleGradeChange}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
