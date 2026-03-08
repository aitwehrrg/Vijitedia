import { describe, it, expect } from "vitest";
import { HONORS } from "./honors";

describe("HONORS", () => {
    it("contains 2 honors tracks", () => {
        expect(HONORS).toHaveLength(2);
    });

    it("every honors track has required fields", () => {
        HONORS.forEach((honor) => {
            expect(honor.id).toBeTruthy();
            expect(honor.dept).toBeTruthy();
            expect(honor.name).toBeTruthy();
            expect(honor.courses).toBeDefined();
        });
    });

    it("every honors track has exactly 8 courses", () => {
        HONORS.forEach((honor) => {
            expect(
                honor.courses,
                `Honors '${honor.name}' has ${honor.courses.length} courses instead of 8`
            ).toHaveLength(8);
        });
    });

    it("every honors course has valid structure", () => {
        HONORS.forEach((honor) => {
            honor.courses.forEach((course) => {
                expect(course.id).toBeTruthy();
                expect(course.code).toBeTruthy();
                expect(course.title).toBeTruthy();
                expect(course.credits).toBeGreaterThan(0);
                expect(course.prereqs).toBeDefined();
            });
        });
    });

    it("has no duplicate honors track IDs", () => {
        const ids = HONORS.map((h) => h.id);
        expect(new Set(ids).size).toBe(ids.length);
    });

    it("all prereqs within an honors track reference valid course IDs", () => {
        HONORS.forEach((honor) => {
            const validIds = new Set(honor.courses.map((c) => c.id));
            honor.courses.forEach((course) => {
                course.prereqs.forEach((prereq) => {
                    expect(typeof prereq).toBe("string");
                    expect(prereq.length).toBeGreaterThan(0);
                });
            });
        });
    });

    it("first course pair in each track has no prereqs", () => {
        HONORS.forEach((honor) => {
            expect(honor.courses[0].prereqs).toHaveLength(0);
            expect(honor.courses[1].prereqs).toHaveLength(0);
        });
    });

    it("last course in each track is a Project", () => {
        HONORS.forEach((honor) => {
            const lastCourse = honor.courses[honor.courses.length - 1];
            expect(lastCourse.title.toLowerCase()).toContain("project");
        });
    });
});
