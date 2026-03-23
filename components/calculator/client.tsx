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
import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { getSuffix } from "@/lib/utils";
import { getGradeColor, calculateStats, predictCGPA, computeYearStats, checkPromotionEligibility } from "@/lib/calculator";

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
                        <span className="font-bold text-sm text-foreground font-mono truncate group-hover:text-indigo-600 transition-colors">
                            {course.code || course.label || "Elective"}
                        </span>
                        <span className="text-xs text-muted-foreground shrink-0 bg-secondary px-1 rounded">
                            {course.credits} Cr
                        </span>
                    </div>
                    <div
                        className="text-sm text-muted-foreground truncate font-medium"
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
                        className={`w-[75px] h-9 text-sm font-mono transition-colors ${grade && !isDisabled ? getGradeColor(grade) : ""
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
                .flatMap((s) => s.courses.filter((c) => c.type !== "honors"))
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

    const yearStats = useMemo(
        () => currentProgram ? computeYearStats(currentProgram.years, grades) : [],
        [currentProgram, grades]
    );

    const prediction = useMemo(
        () => predictCGPA(targetCGPA, activeMainCourses, mainStats),
        [targetCGPA, activeMainCourses, mainStats]
    );

    if (!currentProgram) notFound();

    const renderPredictionMessage = () => {
        if (!prediction) return null;
        if (prediction.status === "done")
            return (
                <div className="text-sm font-medium p-2 rounded bg-muted text-muted-foreground">
                    No remaining credits to predict.
                </div>
            );
        if (prediction.status === "impossible-high")
            return (
                <div className="text-sm font-medium p-2 rounded bg-destructive/10 text-destructive space-y-1">
                    <div>Impossible. Target too high.</div>
                    <div className="text-xs opacity-90">
                        Max theoretical CGPA:{" "}
                        <strong>{prediction.maxPossible.toFixed(2)}</strong>
                    </div>
                </div>
            );
        if (prediction.status === "impossible-low")
            return (
                <div className="text-sm font-medium p-2 rounded bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 space-y-1">
                    <div>Guaranteed. Target already met.</div>
                    <div className="text-xs opacity-90">
                        Min theoretical CGPA:{" "}
                        <strong>{prediction.minPossible.toFixed(2)}</strong>
                    </div>
                </div>
            );
        return (
            <div className="text-sm font-medium p-2 rounded bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400">
                Need avg <strong>{prediction.value.toFixed(2)}</strong> in
                remaining credits.
            </div>
        );
    };

    const renderPromotionWarning = (yearIndex: number) => {
        const isDSY = currentProgram.years[0].semesters.every((s) =>
            excludedSemesters.includes(s.id)
        );

        const error = checkPromotionEligibility(
            yearIndex,
            yearStats,
            isDSY,
            Number(mainStats.gpa)
        );

        if (!error) return null;

        const targetYearLabel =
            currentProgram.years[yearIndex]?.label || "Graduation";
        const title =
            yearIndex === 4
                ? "Cannot Graduate"
                : `Cannot promote to ${targetYearLabel}`;

        return (
            <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-lg flex items-center gap-3 text-amber-800 dark:text-amber-400 text-sm font-medium">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>
                    {title}: {error}
                </span>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <div className="bg-card border-b border-border px-3 py-3 md:px-8 md:py-4 sticky top-0 z-30 shadow-sm">
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
                            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground leading-tight truncate">
                                CGPA Calculator
                            </h1>
                            <p className="text-xs md:text-sm text-muted-foreground line-clamp-1">
                                {currentProgram.name}
                            </p>
                        </div>
                    </div>

                    <div className="w-full md:w-auto flex flex-wrap items-center gap-2 sm:gap-3 md:gap-6">
                        <ThemeToggle />
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
                                    className="h-10 md:h-9 border-dashed border-indigo-300 dark:border-indigo-800 text-indigo-700 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/30 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-xs md:text-sm px-3"
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

                        <div className="flex items-center gap-2 sm:gap-4 md:gap-6 ml-auto">
                            <div className="text-right hidden sm:block">
                                <div className="text-[10px] md:text-xs uppercase font-bold text-muted-foreground tracking-wider">
                                    Credits
                                </div>
                                <div className="font-mono font-bold text-foreground text-sm md:text-base">
                                    {mainStats.credits}
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-[10px] md:text-xs uppercase font-bold text-muted-foreground tracking-wider">
                                    CGPA
                                </div>
                                <div
                                    className={`text-xl md:text-2xl font-mono font-black ${Number(mainStats.gpa) >= 6.75 ? "text-green-600 dark:text-green-500" : "text-foreground"}`}
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
                {currentProgram.years.map((year, yearIndex) => {
                    const isYearDisabled = year.semesters.every((s) =>
                        excludedSemesters.includes(s.id)
                    );
                    return (
                        <div key={year.id} className="space-y-4">
                            {!isYearDisabled &&
                                renderPromotionWarning(yearIndex)}
                            <h2 className="text-sm md:text-base font-bold text-foreground border-b border-border pb-2">
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
                                            className={`bg-card rounded-xl border border-border shadow-sm p-4 md:p-5 flex flex-col transition-opacity duration-200 ${isExcluded ? "opacity-60 grayscale-[0.5]" : "opacity-100"}`}
                                        >
                                            <div className="flex justify-between items-center mb-4 border-b border-border pb-3">
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
                                                        className="font-bold text-foreground text-sm cursor-pointer select-none"
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
                                                        className={`font-mono text-sm ${!isExcluded && Number(semStats.gpa) >= 4.0 ? "bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800" : "bg-muted text-muted-foreground border-border"}`}
                                                    >
                                                        SGPA: {semStats.gpa}
                                                    </Badge>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10 ml-1"
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

                {renderPromotionWarning(4)}

                {activeHonorsCourses.length > 0 && (
                    <div className="pt-8 border-t border-border">
                        <div className="bg-purple-50/50 dark:bg-purple-950/20 rounded-xl border border-purple-100 dark:border-purple-900/50 shadow-sm p-4 md:p-6">
                            <div className="flex justify-between items-center mb-6 border-b border-purple-100 dark:border-purple-900/50 pb-4">
                                <div className="flex items-center gap-3">
                                    <Award className="w-5 h-5 text-purple-900 dark:text-purple-400" />
                                    <div>
                                        <h3 className="font-bold text-purple-900 dark:text-purple-400">
                                            Honors Degree
                                        </h3>
                                    </div>
                                </div>

                                <div className="flex gap-4 items-center">
                                    <div className="text-right">
                                        <div className="text-[10px] uppercase font-bold text-purple-400 tracking-wider">
                                            Credits
                                        </div>
                                        <div className="font-mono font-bold text-purple-800 dark:text-purple-300">
                                            {honorsStats.credits}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[10px] uppercase font-bold text-purple-400 tracking-wider">
                                            Honors GPA
                                        </div>
                                        <div className="text-xl font-mono font-black text-purple-700 dark:text-purple-300">
                                            {honorsStats.gpa}
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-purple-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
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
