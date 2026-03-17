import { describe, it, expect } from "vitest";
import {
    calculateStats,
    getGradeColor,
    predictCGPA,
    computeYearStats,
    checkPromotionEligibility,
    YearStat,
} from "@/lib/calculator";
import { Course, Year } from "@/types/flowsheet";

const mockCourse = (id: string, credits: number): Course => ({
    id,
    credits,
    type: "core",
    code: id,
    title: `Course ${id}`,
    prereqs: [],
});

const mockYear = (
    id: string,
    courses: Course[]
): Year => ({
    id,
    label: `Year ${id}`,
    semesters: [
        { id: `${id}-s1`, label: "Sem 1", courses },
        { id: `${id}-s2`, label: "Sem 2", courses: [] },
    ],
});

describe("calculateStats", () => {
    it("returns zeros when no grades are provided", () => {
        const courses = [mockCourse("C1", 3), mockCourse("C2", 4)];
        const result = calculateStats(courses, {});
        expect(result).toEqual({ points: 0, credits: 0, gpa: "0.00" });
    });

    it("calculates correctly for a single course with AA grade", () => {
        const courses = [mockCourse("C1", 3)];
        const result = calculateStats(courses, { C1: "AA" });
        expect(result).toEqual({ points: 30, credits: 3, gpa: "10.00" });
    });

    it("calculates correctly for a single course with FF grade", () => {
        const courses = [mockCourse("C1", 4)];
        const result = calculateStats(courses, { C1: "FF" });
        expect(result).toEqual({ points: 0, credits: 4, gpa: "0.00" });
    });

    it("calculates weighted average across multiple courses", () => {
        const courses = [mockCourse("C1", 3), mockCourse("C2", 4)];
        const result = calculateStats(courses, { C1: "AA", C2: "BB" });
        expect(result.points).toBe(62);
        expect(result.credits).toBe(7);
        expect(result.gpa).toBe("8.86");
    });

    it("ignores courses without assigned grades", () => {
        const courses = [mockCourse("C1", 3), mockCourse("C2", 4)];
        const result = calculateStats(courses, { C1: "AB" });
        expect(result).toEqual({ points: 27, credits: 3, gpa: "9.00" });
    });

    it("handles empty course list", () => {
        const result = calculateStats([], { C1: "AA" });
        expect(result).toEqual({ points: 0, credits: 0, gpa: "0.00" });
    });

    it("handles course with 0 credits gracefully", () => {
        const courses = [mockCourse("C1", 0)];
        const result = calculateStats(courses, { C1: "AA" });
        expect(result).toEqual({ points: 0, credits: 0, gpa: "0.00" });
    });

    it("handles fractional credits", () => {
        const courses = [mockCourse("C1", 1.5)];
        const result = calculateStats(courses, { C1: "AA" });
        expect(result.points).toBe(15);
        expect(result.credits).toBe(1.5);
        expect(result.gpa).toBe("10.00");
    });

    it("handles totalCredits = 0 to avoid division by zero when grades exist but no credits", () => {
        const courses = [mockCourse("C1", 0), mockCourse("C2", 0)];
        const result = calculateStats(courses, { C1: "AA", C2: "BB" });
        expect(result).toEqual({ points: 0, credits: 0, gpa: "0.00" });
    });
});

describe("getGradeColor", () => {
    it("returns green for AA (10 points)", () => {
        expect(getGradeColor("AA")).toContain("green");
    });

    it("returns green for AB (9 points)", () => {
        expect(getGradeColor("AB")).toContain("green");
    });

    it("returns cyan for BB (8 points)", () => {
        expect(getGradeColor("BB")).toContain("cyan");
    });

    it("returns blue for BC (7 points)", () => {
        expect(getGradeColor("BC")).toContain("blue");
    });

    it("returns violet for CC (6 points)", () => {
        expect(getGradeColor("CC")).toContain("violet");
    });

    it("returns yellow for CD (5 points)", () => {
        expect(getGradeColor("CD")).toContain("yellow");
    });

    it("returns orange for DD (4 points)", () => {
        expect(getGradeColor("DD")).toContain("orange");
    });

    it("returns rose for FF (0 points)", () => {
        expect(getGradeColor("FF")).toContain("rose");
    });

    it("returns slate for unknown grades", () => {
        expect(getGradeColor("ZZ")).toContain("slate");
    });

    it("returns slate for empty string", () => {
        expect(getGradeColor("")).toContain("slate");
    });
});

describe("predictCGPA", () => {
    it("returns null for non-numeric target", () => {
        expect(predictCGPA("abc", [], { credits: 0, points: 0 })).toBeNull();
    });

    it("returns null for empty string target", () => {
        expect(predictCGPA("", [], { credits: 0, points: 0 })).toBeNull();
    });

    it('returns "done" when all credits are completed', () => {
        const courses = [mockCourse("C1", 3), mockCourse("C2", 4)];
        const stats = { credits: 7, points: 70 }; 
        const result = predictCGPA("9.0", courses, stats);
        expect(result!.status).toBe("done");
    });

    it('returns "impossible-high" when target is too ambitious', () => {
        const courses = [mockCourse("C1", 5), mockCourse("C2", 5)];
        const stats = { credits: 5, points: 0 };
        const result = predictCGPA("10.0", courses, stats);
        expect(result!.status).toBe("impossible-high");
    });

    it('returns "impossible-low" when target is already exceeded', () => {
        const courses = [mockCourse("C1", 5), mockCourse("C2", 5)];
        const stats = { credits: 5, points: 50 };
        const result = predictCGPA("2.0", courses, stats);
        expect(result!.status).toBe("impossible-low");
    });

    it('returns "possible" with the required GPA value', () => {
        const courses = [mockCourse("C1", 5), mockCourse("C2", 5)];
        const stats = { credits: 5, points: 40 };
        const result = predictCGPA("9.0", courses, stats);
        expect(result!.status).toBe("possible");
        expect(result!.value).toBe(10.0);
    });

    it("calculates maxPossible correctly", () => {
        const courses = [mockCourse("C1", 5), mockCourse("C2", 5)];
        const stats = { credits: 5, points: 40 };
        const result = predictCGPA("9.0", courses, stats);
        expect(result!.maxPossible).toBe(9.0);
    });

    it("calculates minPossible correctly", () => {
        const courses = [mockCourse("C1", 5), mockCourse("C2", 5)];
        const stats = { credits: 5, points: 40 };
        const result = predictCGPA("9.0", courses, stats);
        expect(result!.minPossible).toBe(4.0);
    });

    it("handles zero total degree credits", () => {
        const result = predictCGPA("9.0", [], { credits: 0, points: 0 });
        expect(result!.status).toBe("done");
        expect(result!.maxPossible).toBe(0);
    });

    it("handles edge case where current points exceed max possible points due to negative remaining credits", () => {
        const courses = [mockCourse("C1", 5)];
        const stats = { credits: 10, points: 100 };
        const result = predictCGPA("9.0", courses, stats);
        expect(result!.status).toBe("done");
    });
});

describe("computeYearStats", () => {
    it("returns empty array for empty years", () => {
        expect(computeYearStats([], {})).toEqual([]);
    });

    it("returns zero stats when no grades are assigned", () => {
        const years = [mockYear("Y1", [mockCourse("C1", 3)])];
        const result = computeYearStats(years, {});
        expect(result).toEqual([{ passedCredits: 0, failureCount: 0 }]);
    });

    it("counts FF grades as failures without adding credits", () => {
        const years = [
            mockYear("Y1", [
                mockCourse("C1", 3),
                mockCourse("C2", 4),
            ]),
        ];
        const result = computeYearStats(years, { C1: "FF", C2: "AA" });
        expect(result[0].failureCount).toBe(1);
        expect(result[0].passedCredits).toBe(4);
    });

    it("counts all non-FF grades as passed credits", () => {
        const years = [
            mockYear("Y1", [
                mockCourse("C1", 3),
                mockCourse("C2", 4),
            ]),
        ];
        const result = computeYearStats(years, { C1: "DD", C2: "AB" });
        expect(result[0].failureCount).toBe(0);
        expect(result[0].passedCredits).toBe(7);
    });

    it("handles multiple years independently", () => {
        const years = [
            mockYear("Y1", [mockCourse("C1", 4)]),
            mockYear("Y2", [mockCourse("C2", 3)]),
        ];
        const result = computeYearStats(years, { C1: "AA", C2: "FF" });
        expect(result[0]).toEqual({ passedCredits: 4, failureCount: 0 });
        expect(result[1]).toEqual({ passedCredits: 0, failureCount: 1 });
    });
});

describe("checkPromotionEligibility", () => {
    const fullStats: YearStat[] = [
        { passedCredits: 40, failureCount: 0 },
        { passedCredits: 40, failureCount: 0 },
        { passedCredits: 40, failureCount: 0 },
        { passedCredits: 40, failureCount: 0 },
    ];

    it("returns null for yearIndex 0", () => {
        expect(checkPromotionEligibility(0, fullStats, false, 8.0)).toBeNull();
    });

    it("returns error for Y1 insufficient credits (non-DSY)", () => {
        const stats = [
            { passedCredits: 20, failureCount: 0 },
            ...fullStats.slice(1),
        ];
        const error = checkPromotionEligibility(1, stats, false, 8.0);
        expect(error).toContain("Insufficient First Year Credits");
        expect(error).toContain("20/32");
    });

    it("allows promotion for Y1 insufficient credits when DSY", () => {
        const stats = [
            { passedCredits: 20, failureCount: 0 },
            ...fullStats.slice(1),
        ];
        expect(checkPromotionEligibility(1, stats, true, 8.0)).toBeNull();
    });

    it("passes Y1 with sufficient credits", () => {
        expect(checkPromotionEligibility(1, fullStats, false, 8.0)).toBeNull();
    });

    it("returns error for Y2 insufficient credits", () => {
        const stats = [
            fullStats[0],
            { passedCredits: 25, failureCount: 0 },
            ...fullStats.slice(2),
        ];
        const error = checkPromotionEligibility(2, stats, false, 8.0);
        expect(error).toContain("Insufficient Second Year Credits");
    });

    it("returns error for Y2 with too many Y1 failures (non-DSY)", () => {
        const stats = [
            { passedCredits: 40, failureCount: 2 },
            { passedCredits: 40, failureCount: 0 },
            ...fullStats.slice(2),
        ];
        const error = checkPromotionEligibility(2, stats, false, 8.0);
        expect(error).toContain("Too many First Year Failures");
    });

    it("allows Y2 promotion when DSY bypasses Y1 failure check", () => {
        const stats = [
            { passedCredits: 40, failureCount: 3 },
            { passedCredits: 40, failureCount: 0 },
            ...fullStats.slice(2),
        ];
        expect(checkPromotionEligibility(2, stats, true, 8.0)).toBeNull();
    });

    it("returns error for Y3 insufficient credits", () => {
        const stats = [
            fullStats[0],
            fullStats[1],
            { passedCredits: 20, failureCount: 0 },
            fullStats[3],
        ];
        const error = checkPromotionEligibility(3, stats, false, 8.0);
        expect(error).toContain("Insufficient Third Year Credits");
    });

    it("returns error for Y3 with too many Y2 failures", () => {
        const stats = [
            { passedCredits: 40, failureCount: 0 },
            { passedCredits: 40, failureCount: 2 },
            { passedCredits: 40, failureCount: 0 },
            fullStats[3],
        ];
        const error = checkPromotionEligibility(3, stats, false, 8.0);
        expect(error).toContain("Too many Second Year Failures");
    });

    it("returns error for Y3 with uncleared Y1 failures (non-DSY)", () => {
        const stats = [
            { passedCredits: 40, failureCount: 1 },
            { passedCredits: 40, failureCount: 0 },
            { passedCredits: 40, failureCount: 0 },
            fullStats[3],
        ];
        const error = checkPromotionEligibility(3, stats, false, 8.0);
        expect(error).toContain("Uncleared First Year Failures");
    });

    it("allows Y3 promotion when DSY bypasses Y1 uncleared failure", () => {
        const stats = [
            { passedCredits: 40, failureCount: 1 },
            { passedCredits: 40, failureCount: 0 },
            { passedCredits: 40, failureCount: 0 },
            fullStats[3],
        ];
        expect(checkPromotionEligibility(3, stats, true, 8.0)).toBeNull();
    });

    it("returns error for graduation when CGPA below 4.0", () => {
        const error = checkPromotionEligibility(4, fullStats, false, 3.5);
        expect(error).toContain("CGPA below 4.0");
        expect(error).toContain("3.50");
    });

    it("allows graduation when CGPA is 4.0 or above", () => {
        expect(
            checkPromotionEligibility(4, fullStats, false, 4.0)
        ).toBeNull();
    });

    it("allows graduation when CGPA is high", () => {
        expect(
            checkPromotionEligibility(4, fullStats, false, 9.5)
        ).toBeNull();
    });

    it("returns null for out of bounds year index", () => {
        expect(
            checkPromotionEligibility(5, fullStats, false, 10.0)
        ).toBeNull();
        expect(
            checkPromotionEligibility(-1, fullStats, false, 10.0)
        ).toBeNull();
    });
});
