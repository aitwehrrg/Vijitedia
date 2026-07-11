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

    it("every minor has exactly 6 courses", () => {
        MINORS.forEach((minor) => {
            expect(
                minor.courses,
                `Minor '${minor.name}' has ${minor.courses.length} courses instead of 5`
            ).toHaveLength(6);
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

    it("minor credit totals are progressive (2, 2, 3, 3, 3, 1)", () => {
        const expectedCredits = [2, 2, 3, 3, 3, 1];
        MINORS.forEach((minor) => {
            minor.courses.forEach((course, i) => {
                expect(
                    course.credits,
                    `Minor '${minor.name}' course ${i} has ${course.credits} credits, expected ${expectedCredits[i]}`
                ).toBe(expectedCredits[i]);
            });
        });
    });
});
