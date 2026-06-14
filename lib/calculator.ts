import { Course, Semester, Year } from "@/types/flowsheet";
import { GRADE_POINTS } from "@/data/grades";

/**
 * Map of semester ID → approximate SGPA entered by the student in quick mode.
 */
export type QuickSgpaMap = Record<string, number>;

export const getGradeColor = (grade: string) => {
    const points = GRADE_POINTS[grade];
    if (points === undefined)
        return "border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 font-bold";
    if (points >= 9)
        return "border-green-300 bg-green-100 text-green-800 dark:border-green-800 dark:bg-green-900/50 dark:text-green-300 font-bold";
    if (points >= 8)
        return "border-cyan-300 bg-cyan-100 text-cyan-800 dark:border-cyan-800 dark:bg-cyan-900/50 dark:text-cyan-300 font-bold";
    if (points >= 7)
        return "border-blue-300 bg-blue-100 text-blue-800 dark:border-blue-800 dark:bg-blue-900/50 dark:text-blue-300 font-bold";
    if (points >= 6)
        return "border-violet-300 bg-violet-100 text-violet-800 dark:border-violet-800 dark:bg-violet-900/50 dark:text-violet-300 font-bold";
    if (points >= 5)
        return "border-yellow-300 bg-yellow-100 text-yellow-800 dark:border-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300 font-bold";
    if (points >= 4)
        return "border-orange-300 bg-orange-100 text-orange-800 dark:border-orange-800 dark:bg-orange-900/50 dark:text-orange-300 font-bold";
    return "border-rose-300 bg-rose-100 text-rose-800 dark:border-rose-800 dark:bg-rose-900/50 dark:text-rose-300 font-bold";
};

export const calculateStats = (
    courses: Course[],
    grades: Record<string, string>
) => {
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

export interface PredictionResult {
    status: "done" | "impossible-high" | "impossible-low" | "possible";
    value: number;
    maxPossible: number;
    minPossible: number;
}

export function predictCGPA(
    targetCGPA: string,
    activeMainCourses: Course[],
    mainStats: { credits: number; points: number }
): PredictionResult | null {
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
}

/**
 * Calculate stats for a list of courses that may span semesters in quick mode.
 * For courses belonging to a quick-mode semester, their contribution is computed
 * from the approximate SGPA rather than individual grades.
 *
 * @param courses      – flat list of courses to evaluate
 * @param grades       – per-course grade selections
 * @param quickSgpa    – map of semester ID → approximate SGPA
 * @param semesters    – full semester objects (needed to check which semester a course belongs to)
 */
export function calculateStatsWithQuickSgpa(
    courses: Course[],
    grades: Record<string, string>,
    quickSgpa: QuickSgpaMap,
    semesters: Semester[]
) {
    let totalPoints = 0;
    let totalCredits = 0;

    // Build a lookup: courseId → semesterId
    const courseToSemester = new Map<string, string>();
    for (const sem of semesters) {
        for (const c of sem.courses) {
            courseToSemester.set(c.id, sem.id);
        }
    }

    // Track which quick-mode semesters have already been counted
    // (so we don't double-count courses within the same semester)
    const countedQuickSemesters = new Set<string>();

    for (const course of courses) {
        const semId = courseToSemester.get(course.id);

        if (semId && quickSgpa[semId] !== undefined) {
            // Quick mode: count entire semester once
            if (!countedQuickSemesters.has(semId)) {
                countedQuickSemesters.add(semId);
                const sem = semesters.find((s) => s.id === semId)!;
                const semCourses = sem.courses.filter(
                    (c) => c.type !== "honors" && courses.some((ac) => ac.id === c.id)
                );
                const semCredits = semCourses.reduce(
                    (sum, c) => sum + (c.credits || 0),
                    0
                );
                const sgpa = Math.max(0, Math.min(10, quickSgpa[semId]));
                totalPoints += sgpa * semCredits;
                totalCredits += semCredits;
            }
        } else {
            // Detailed mode: use individual grade
            const gradeKey = grades[course.id];
            if (gradeKey) {
                const points = GRADE_POINTS[gradeKey];
                const credits = course.credits || 0;
                totalPoints += points * credits;
                totalCredits += credits;
            }
        }
    }

    return {
        points: totalPoints,
        credits: totalCredits,
        gpa:
            totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : "0.00",
    };
}

export interface YearStat {
    passedCredits: number;
    failureCount: number;
}

export function computeYearStats(
    years: Year[],
    grades: Record<string, string>,
    quickSgpa: QuickSgpaMap = {}
): YearStat[] {
    return years.map((year) => {
        let passedCredits = 0;
        let failureCount = 0;

        for (const sem of year.semesters) {
            if (quickSgpa[sem.id] !== undefined) {
                // In quick mode, assume all credits are passed (SGPA > 0 implies passing)
                const sgpa = quickSgpa[sem.id];
                if (sgpa > 0) {
                    const semCredits = sem.courses.reduce(
                        (sum, c) => sum + (c.credits || 0),
                        0
                    );
                    passedCredits += semCredits;
                }
                // No failures tracked in quick mode
            } else {
                for (const course of sem.courses) {
                    const g = grades[course.id];
                    if (g) {
                        if (g === "FF") failureCount++;
                        else passedCredits += course.credits || 0;
                    }
                }
            }
        }

        return { passedCredits, failureCount };
    });
}

export function checkPromotionEligibility(
    yearIndex: number,
    yearStats: YearStat[],
    isDSY: boolean,
    mainGPA: number
): string | null {
    if (yearIndex === 0) return null;

    const failuresY1 = yearStats[0]?.failureCount || 0;
    const creditsY1 = yearStats[0]?.passedCredits || 0;
    const failuresY2 = yearStats[1]?.failureCount || 0;
    const creditsY2 = yearStats[1]?.passedCredits || 0;
    const creditsY3 = yearStats[2]?.passedCredits || 0;

    if (yearIndex === 1) {
        if (!isDSY && creditsY1 < 32)
            return `Insufficient First Year Credits (${creditsY1}/32)`;
    } else if (yearIndex === 2) {
        if (creditsY2 < 32)
            return `Insufficient Second Year Credits (${creditsY2}/32)`;
        else if (!isDSY && failuresY1 > 1)
            return `Too many First Year Failures (${failuresY1} > 1)`;
    } else if (yearIndex === 3) {
        if (creditsY3 < 32)
            return `Insufficient Third Year Credits (${creditsY3}/32)`;
        else if (failuresY2 > 1)
            return `Too many Second Year Failures (${failuresY2} > 1)`;
        else if (!isDSY && failuresY1 > 0)
            return `Uncleared First Year Failures (${failuresY1})`;
    } else if (yearIndex === 4) {
        if (mainGPA < 4.0)
            return `CGPA below 4.0 (${mainGPA.toFixed(2)})`;
    }

    return null;
}
