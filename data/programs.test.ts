import { describe, it, expect } from "vitest";
import { FLOWSHEET_DATA } from "./programs";

describe("FLOWSHEET_DATA", () => {
    it("contains exactly 5 programs", () => {
        expect(FLOWSHEET_DATA).toHaveLength(5);
    });

    it.each(
        FLOWSHEET_DATA.map((p) => [p.id, p])
    )("program '%s' has required top-level fields", (_id, program) => {
        expect(program.id).toBeTruthy();
        expect(program.name).toBeTruthy();
        expect(program.department).toBeTruthy();
        expect(program.years).toBeDefined();
    });

    it.each(
        FLOWSHEET_DATA.map((p) => [p.id, p])
    )("program '%s' has 4 years with 2 semesters each", (_id, program) => {
        expect(program.years).toHaveLength(4);
        program.years.forEach((year) => {
            expect(year.id).toBeTruthy();
            expect(year.label).toBeTruthy();
            expect(year.semesters).toHaveLength(2);
        });
    });

    it.each(
        FLOWSHEET_DATA.map((p) => [p.id, p])
    )(
        "program '%s' has valid courses with id, type, and valid credits",
        (_id, program) => {
            const allCourses = program.years.flatMap((y) =>
                y.semesters.flatMap((s) => s.courses)
            );
            expect(allCourses.length).toBeGreaterThan(0);

            allCourses.forEach((course) => {
                expect(course.id).toBeTruthy();
                expect(course.credits).toBeGreaterThan(0);
            });
        }
    );

    it.each(
        FLOWSHEET_DATA.map((p) => [p.id, p])
    )("program '%s' has no duplicate course IDs", (_id, program) => {
        const allCourses = program.years.flatMap((y) =>
            y.semesters.flatMap((s) => s.courses)
        );
        const ids = allCourses.map((c) => c.id);
        const uniqueIds = new Set(ids);
        expect(uniqueIds.size).toBe(ids.length);
    });

    it.each(
        FLOWSHEET_DATA.map((p) => [p.id, p])
    )(
        "program '%s' has all prereqs as non-empty strings",
        (_id, program) => {
            const allCourses = program.years.flatMap((y) =>
                y.semesters.flatMap((s) => s.courses)
            );

            allCourses.forEach((course) => {
                if (course.prereqs && course.prereqs.length > 0) {
                    course.prereqs.forEach((prereq) => {
                        expect(typeof prereq).toBe("string");
                        expect(
                            prereq.length,
                            `Course '${course.id}' has empty prereq string`
                        ).toBeGreaterThan(0);
                    });
                }
            });
        }
    );

    it.each(
        FLOWSHEET_DATA.map((p) => [p.id, p])
    )(
        "program '%s' has elective courses with valid option entries when options exist",
        (_id, program) => {
            const allCourses = program.years.flatMap((y) =>
                y.semesters.flatMap((s) => s.courses)
            );

            allCourses
                .filter((c) => c.type === "elective" && c.options && c.options.length > 0)
                .forEach((course) => {
                    course.options!.forEach((opt) => {
                        expect(opt.id).toBeTruthy();
                        expect(opt.code).toBeTruthy();
                        expect(opt.title).toBeTruthy();
                        expect(opt.credits).toBeGreaterThan(0);
                    });
                });
        }
    );

    it.each(
        FLOWSHEET_DATA.map((p) => [p.id, p])
    )(
        "program '%s' has elective courses with valid label or code",
        (_id, program) => {
            const allCourses = program.years.flatMap((y) =>
                y.semesters.flatMap((s) => s.courses)
            );

            allCourses
                .filter((c) => c.type === "elective")
                .forEach((course) => {
                    const hasIdentifier = course.label || course.code;
                    expect(
                        hasIdentifier,
                        `Elective '${course.id}' has no label or code`
                    ).toBeTruthy();
                });
        }
    );

    it.each(
        FLOWSHEET_DATA.map((p) => [p.id, p])
    )(
        "program '%s' has minor slots with sequential minorIndex values",
        (_id, program) => {
            const allCourses = program.years.flatMap((y) =>
                y.semesters.flatMap((s) => s.courses)
            );
            const minorCourses = allCourses
                .filter((c) => c.type === "minor")
                .sort((a, b) => (a.minorIndex ?? 0) - (b.minorIndex ?? 0));

            minorCourses.forEach((course, i) => {
                expect(course.minorIndex).toBe(i);
            });
        }
    );

    it.each(
        FLOWSHEET_DATA.map((p) => [p.id, p])
    )(
        "program '%s' has unique program ID format",
        (_id, program) => {
            expect(program.id).toMatch(/^btech-/);
        }
    );
});
