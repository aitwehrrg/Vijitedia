import { describe, it, expect } from "vitest";
import { MINORS } from "./minors";

describe("MINORS", () => {
    it("contains 14 minor programs", () => {
        expect(MINORS).toHaveLength(14);
    });

    it("every minor has required fields", () => {
        MINORS.forEach((minor) => {
            expect(minor.id).toBeTruthy();
            expect(minor.dept).toBeTruthy();
            expect(minor.name).toBeTruthy();
            expect(minor.courses).toBeDefined();
        });
    });

    it("every minor has 5 or 6 courses", () => {
        MINORS.forEach((minor) => {
            expect(
                minor.courses.length,
                `Minor '${minor.name}' has ${minor.courses.length} courses; expected at least 5`
            ).toBeGreaterThanOrEqual(5);
            expect(
                minor.courses.length,
                `Minor '${minor.name}' has ${minor.courses.length} courses; expected at most 6`
            ).toBeLessThanOrEqual(6);
        });
    });

    it("every minor course has valid structure", () => {
        MINORS.forEach((minor) => {
            minor.courses.forEach((course) => {
                expect(course.id).toBeTruthy();
                expect(course.code).toBeTruthy();
                expect(course.title).toBeTruthy();
                expect(course.credits).toBeGreaterThan(0);
                expect(course.prereqs).toBeDefined();
            });
        });
    });

    it("has no duplicate minor IDs", () => {
        const ids = MINORS.map((m) => m.id);
        expect(new Set(ids).size).toBe(ids.length);
    });

    it("mutexIds are valid string arrays when present", () => {
        MINORS.forEach((minor) => {
            minor.courses.forEach((course) => {
                if (course.mutexIds) {
                    expect(Array.isArray(course.mutexIds)).toBe(true);
                    course.mutexIds.forEach((mid) => {
                        expect(typeof mid).toBe("string");
                        expect(mid.length).toBeGreaterThan(0);
                    });
                }
            });
        });
    });

    it("minor credit pattern matches allowed endings", () => {
        const baseCredits = [2, 2, 3, 3];
        MINORS.forEach((minor) => {
            expect(
                minor.courses.slice(0, 4).map((c) => c.credits),
                `Minor '${minor.name}' first 4 credits should be ${baseCredits.join(",")}`
            ).toEqual(baseCredits);

            if (minor.courses.length === 5) {
                expect(
                    minor.courses[4].credits,
                    `Minor '${minor.name}' 5-course ending must have final 4-credit course`
                ).toBe(4);
            } else {
                expect(
                    [minor.courses[4].credits, minor.courses[5].credits],
                    `Minor '${minor.name}' 6-course ending must be 3 + 1 credits`
                ).toEqual([3, 1]);
            }
        });
    });
});
