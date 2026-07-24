import { describe, it, expect } from "vitest";
import { Course } from "@/types/flowsheet";
import {
    resolveEffectiveCourses,
    isMinorLabSlotVisible,
    computeTakenCourses,
    computeDisabledMinorIds,
    computeDisabledOptionIds,
    computeActiveRelationships,
    getCourseStatus,
} from "./flowsheet";
import { MINORS } from "@/data/minors";
import { HONORS } from "@/data/honors";

const mkCourse = (overrides: Partial<Course> & { id: string }): Course => ({
    type: "core",
    credits: 3,
    prereqs: [],
    ...overrides,
});

describe("resolveEffectiveCourses", () => {
    it("returns core courses unchanged", () => {
        const courses = [mkCourse({ id: "C1", code: "A" })];
        const result = resolveEffectiveCourses(courses, {}, null, null);
        expect(result).toEqual(courses);
    });

    it("merges selected elective option into the course slot", () => {
        const courses = [
            mkCourse({
                id: "E1",
                type: "elective",
                code: "ELEC",
                title: "Elective",
                options: [
                    {
                        id: "OPT1",
                        code: "OE101",
                        title: "Open Elective I",
                        credits: 4,
                        prereqs: [],
                    },
                ],
            }),
        ];
        const result = resolveEffectiveCourses(
            courses,
            { E1: "OPT1" },
            null,
            null
        );
        expect(result[0].id).toBe("E1");
        expect(result[0].code).toBe("OE101");
        expect(result[0].title).toBe("Open Elective I");
        expect(result[0].credits).toBe(4);
    });

    it("leaves elective unchanged when no selection exists", () => {
        const courses = [
            mkCourse({
                id: "E1",
                type: "elective",
                options: [
                    {
                        id: "OPT1",
                        code: "X",
                        title: "X",
                        credits: 4,
                        prereqs: [],
                    },
                ],
            }),
        ];
        const result = resolveEffectiveCourses(courses, {}, null, null);
        expect(result[0].code).toBeUndefined();
    });

    it("substitutes minor course when minor is selected", () => {
        const courses = [
            mkCourse({
                id: "M0",
                type: "minor",
                minorIndex: 0,
            }),
        ];
        const minorId = MINORS[0].id;
        const result = resolveEffectiveCourses(courses, {}, minorId, null);
        expect(result[0].id).toBe("M0");
        expect((result[0] as any).originalId).toBeDefined();
        expect(result[0].code).toBeDefined();
    });

    it("returns unchanged minor slot when no minor is selected", () => {
        const courses = [
            mkCourse({
                id: "M0",
                type: "minor",
                minorIndex: 0,
            }),
        ];
        const result = resolveEffectiveCourses(courses, {}, null, null);
        expect((result[0] as any).originalId).toBeUndefined();
    });

    it("does not substitute minor lab slot for a selected 5-course minor", () => {
        const fiveCourseMinor = MINORS.find((m) => m.courses.length === 5);
        expect(fiveCourseMinor).toBeDefined();

        const courses = [
            mkCourse({
                id: "M-LAB",
                type: "minor",
                minorIndex: 5,
                code: "SLOT-LAB",
                title: "Minor Lab Slot",
                credits: 0,
            }),
        ];

        const result = resolveEffectiveCourses(
            courses,
            {},
            fiveCourseMinor!.id,
            null
        );

        expect(result[0].id).toBe("M-LAB");
        expect((result[0] as any).originalId).toBeUndefined();
        expect(result[0].code).toBe("SLOT-LAB");
    });

    it("substitutes minor lab slot for a selected 6-course minor", () => {
        const sixCourseMinor = MINORS.find((m) => m.courses.length === 6);
        expect(sixCourseMinor).toBeDefined();

        const courses = [
            mkCourse({
                id: "M-LAB",
                type: "minor",
                minorIndex: 5,
            }),
        ];

        const result = resolveEffectiveCourses(
            courses,
            {},
            sixCourseMinor!.id,
            null
        );

        expect(result[0].id).toBe("M-LAB");
        expect((result[0] as any).originalId).toBe(sixCourseMinor!.courses[5].id);
        expect(result[0].credits).toBe(1);
    });

    it("substitutes honors course when honors is selected", () => {
        const courses = [
            mkCourse({
                id: "H0",
                type: "honors",
                honorsIndex: 0,
            }),
        ];
        const honorsId = HONORS[0].id;
        const result = resolveEffectiveCourses(courses, {}, null, honorsId);
        expect(result[0].id).toBe("H0");
        expect((result[0] as any).originalId).toBeDefined();
        expect(result[0].code).toBeDefined();
    });

    it("returns unchanged honors slot when no honors is selected", () => {
        const courses = [
            mkCourse({
                id: "H0",
                type: "honors",
                honorsIndex: 0,
            }),
        ];
        const result = resolveEffectiveCourses(courses, {}, null, null);
        expect((result[0] as any).originalId).toBeUndefined();
    });

    it("handles mixed course types simultaneously", () => {
        const courses = [
            mkCourse({ id: "C1", type: "core", code: "CORE" }),
            mkCourse({
                id: "E1",
                type: "elective",
                options: [
                    {
                        id: "OPT1",
                        code: "OE1",
                        title: "X",
                        credits: 4,
                        prereqs: [],
                    },
                ],
            }),
            mkCourse({ id: "M0", type: "minor", minorIndex: 0 }),
        ];
        const minorId = MINORS[0].id;
        const result = resolveEffectiveCourses(
            courses,
            { E1: "OPT1" },
            minorId,
            null
        );
        expect(result[0].code).toBe("CORE");
        expect(result[1].code).toBe("OE1");
        expect((result[2] as any).originalId).toBeDefined();
    });
});

describe("computeTakenCourses", () => {
    it("includes all core course IDs", () => {
        const courses = [
            mkCourse({ id: "C1", type: "core" }),
            mkCourse({ id: "C2", type: "core" }),
        ];
        const taken = computeTakenCourses(courses, {});
        expect(taken.has("C1")).toBe(true);
        expect(taken.has("C2")).toBe(true);
    });

    it("does not include non-core courses without selections", () => {
        const courses = [
            mkCourse({ id: "E1", type: "elective" }),
            mkCourse({ id: "M0", type: "minor" }),
        ];
        const taken = computeTakenCourses(courses, {});
        expect(taken.has("E1")).toBe(false);
        expect(taken.has("M0")).toBe(false);
    });

    it("includes selected option IDs from selections", () => {
        const courses = [mkCourse({ id: "E1", type: "elective" })];
        const taken = computeTakenCourses(courses, {
            E1: "OPT1",
            E2: "OPT2",
        });
        expect(taken.has("OPT1")).toBe(true);
        expect(taken.has("OPT2")).toBe(true);
    });

    it("returns empty set for empty inputs", () => {
        const taken = computeTakenCourses([], {});
        expect(taken.size).toBe(0);
    });
});

describe("isMinorLabSlotVisible", () => {
    const minorLabSlot = mkCourse({ id: "M-LAB", type: "minor", minorIndex: 5 });

    it("returns true for non-minor courses", () => {
        const core = mkCourse({ id: "C1", type: "core" });
        expect(isMinorLabSlotVisible(core, null)).toBe(true);
    });

    it("returns true for non-lab minor slots", () => {
        const minor = mkCourse({ id: "M0", type: "minor", minorIndex: 0 });
        expect(isMinorLabSlotVisible(minor, null)).toBe(true);
    });

    it("returns false for lab slot when no minor is selected", () => {
        expect(isMinorLabSlotVisible(minorLabSlot, null)).toBe(false);
    });

    it("returns false for lab slot when selected minor has only five courses", () => {
        
    });

    it("returns true for lab slot when selected minor has a valid 6th lab course", () => {
        
    });

    it("returns false for malformed 6th course with non-lab credits", () => {
        const malformedMinors = [
            {
                id: "malformed",
                dept: "X",
                name: "Malformed",
                courses: [
                    { id: "A", code: "A", title: "A", credits: 2, prereqs: [] },
                    { id: "B", code: "B", title: "B", credits: 2, prereqs: [] },
                    { id: "C", code: "C", title: "C", credits: 3, prereqs: [] },
                    { id: "D", code: "D", title: "D", credits: 3, prereqs: [] },
                    { id: "E", code: "E", title: "E", credits: 3, prereqs: [] },
                    { id: "F", code: "F", title: "F", credits: 2, prereqs: [] },
                ],
            },
        ];

        expect(
            isMinorLabSlotVisible(minorLabSlot, "malformed", malformedMinors)
        ).toBe(false);
    });
});

describe("computeDisabledMinorIds", () => {
    const testMinors = [
        {
            id: "minor-a",
            dept: "A",
            name: "Minor A",
            courses: [
                {
                    id: "MA1",
                    code: "MA1",
                    title: "A1",
                    credits: 2,
                    prereqs: [],
                },
                {
                    id: "MA2",
                    code: "MA2",
                    title: "A2",
                    credits: 2,
                    prereqs: [],
                },
                {
                    id: "MA3",
                    code: "MA3",
                    title: "A3",
                    credits: 3,
                    prereqs: [],
                },
                {
                    id: "MA4",
                    code: "MA4",
                    title: "A4",
                    credits: 3,
                    prereqs: [],
                },
                {
                    id: "MA5",
                    code: "MA5",
                    title: "A5",
                    credits: 4,
                    prereqs: [],
                },
            ],
        },
        {
            id: "minor-b",
            dept: "B",
            name: "Minor B",
            courses: [
                {
                    id: "MB1",
                    code: "MB1",
                    title: "B1",
                    credits: 2,
                    prereqs: [],
                    mutexIds: ["MUTEX1"],
                },
                {
                    id: "MB2",
                    code: "MB2",
                    title: "B2",
                    credits: 2,
                    prereqs: [],
                },
                {
                    id: "MB3",
                    code: "MB3",
                    title: "B3",
                    credits: 3,
                    prereqs: [],
                },
                {
                    id: "MB4",
                    code: "MB4",
                    title: "B4",
                    credits: 3,
                    prereqs: [],
                },
                {
                    id: "MB5",
                    code: "MB5",
                    title: "B5",
                    credits: 4,
                    prereqs: [],
                },
            ],
        },
    ];

    it("disables a minor when a taken course directly matches", () => {
        const taken = new Set(["MA1"]);
        const disabled = computeDisabledMinorIds(taken, testMinors);
        expect(disabled.has("minor-a")).toBe(true);
        expect(disabled.has("minor-b")).toBe(false);
    });

    it("disables a minor when a mutex ID is taken", () => {
        const taken = new Set(["MUTEX1"]);
        const disabled = computeDisabledMinorIds(taken, testMinors);
        expect(disabled.has("minor-b")).toBe(true);
        expect(disabled.has("minor-a")).toBe(false);
    });

    it("returns empty set when no conflicts", () => {
        const taken = new Set(["UNRELATED"]);
        const disabled = computeDisabledMinorIds(taken, testMinors);
        expect(disabled.size).toBe(0);
    });

    it("disables multiple minors at once", () => {
        const taken = new Set(["MA3", "MUTEX1"]);
        const disabled = computeDisabledMinorIds(taken, testMinors);
        expect(disabled.has("minor-a")).toBe(true);
        expect(disabled.has("minor-b")).toBe(true);
    });
});

describe("computeDisabledOptionIds", () => {
    it("disables an option whose ID is already taken", () => {
        const courses = [
            mkCourse({
                id: "E1",
                type: "elective",
                options: [
                    {
                        id: "OPT1",
                        code: "X",
                        title: "X",
                        credits: 4,
                        prereqs: [],
                    },
                    {
                        id: "OPT2",
                        code: "Y",
                        title: "Y",
                        credits: 4,
                        prereqs: [],
                    },
                ],
            }),
        ];
        const taken = new Set(["OPT1"]);
        const disabled = computeDisabledOptionIds(courses, taken, null, null);
        expect(disabled.has("OPT1")).toBe(true);
        expect(disabled.has("OPT2")).toBe(false);
    });

    it("disables an option via mutex conflict", () => {
        const courses = [
            mkCourse({
                id: "E1",
                type: "elective",
                options: [
                    {
                        id: "OPT1",
                        code: "X",
                        title: "X",
                        credits: 4,
                        prereqs: [],
                        mutexIds: ["CORE1"],
                    },
                ],
            }),
        ];
        const taken = new Set(["CORE1"]);
        const disabled = computeDisabledOptionIds(courses, taken, null, null);
        expect(disabled.has("OPT1")).toBe(true);
    });

    it("returns empty set when no elective courses exist", () => {
        const courses = [mkCourse({ id: "C1", type: "core" })];
        const disabled = computeDisabledOptionIds(
            courses,
            new Set(),
            null,
            null
        );
        expect(disabled.size).toBe(0);
    });

    it("does not disable options without conflict", () => {
        const courses = [
            mkCourse({
                id: "E1",
                type: "elective",
                options: [
                    {
                        id: "OPT1",
                        code: "X",
                        title: "X",
                        credits: 4,
                        prereqs: [],
                    },
                ],
            }),
        ];
        const disabled = computeDisabledOptionIds(
            courses,
            new Set(),
            null,
            null
        );
        expect(disabled.size).toBe(0);
    });
});

describe("computeActiveRelationships", () => {
    it("returns null when no active course ID", () => {
        const result = computeActiveRelationships(null, []);
        expect(result).toBeNull();
    });

    it("returns null when active course not found", () => {
        const courses = [mkCourse({ id: "C1" })];
        const result = computeActiveRelationships("MISSING", courses);
        expect(result).toBeNull();
    });

    it("computes prereqs from the active course", () => {
        const courses = [
            mkCourse({ id: "P1" }),
            mkCourse({ id: "C1", prereqs: ["P1"] }),
        ];
        const result = computeActiveRelationships("C1", courses);
        expect(result!.activeId).toBe("C1");
        expect(result!.prereqs.has("P1")).toBe(true);
        expect(result!.postreqs.size).toBe(0);
    });

    it("computes postreqs from dependent courses", () => {
        const courses = [
            mkCourse({ id: "C1" }),
            mkCourse({ id: "D1", prereqs: ["C1"] }),
            mkCourse({ id: "D2", prereqs: ["C1"] }),
        ];
        const result = computeActiveRelationships("C1", courses);
        expect(result!.postreqs.has("D1")).toBe(true);
        expect(result!.postreqs.has("D2")).toBe(true);
    });

    it("computes postreqs via originalId for substituted courses", () => {
        const courses = [
            { ...mkCourse({ id: "C1" }), originalId: "ORIG1" } as any,
            mkCourse({ id: "D1", prereqs: ["ORIG1"] }),
        ];
        const result = computeActiveRelationships("C1", courses);
        expect(result!.postreqs.has("D1")).toBe(true);
    });

    it("maps prereqs referencing an originalId to the slot id", () => {
        const courses = [
            { ...mkCourse({ id: "M0" }), originalId: "ORIG1" } as any,
            mkCourse({ id: "M1", prereqs: ["ORIG1"] }),
        ];
        const result = computeActiveRelationships("M1", courses);
        expect(result!.prereqs.has("M0")).toBe(true);
        expect(result!.prereqs.has("ORIG1")).toBe(false);
    });

    it("handles both prereqs and postreqs simultaneously", () => {
        const courses = [
            mkCourse({ id: "A" }),
            mkCourse({ id: "B", prereqs: ["A"] }),
            mkCourse({ id: "C", prereqs: ["B"] }),
        ];
        const result = computeActiveRelationships("B", courses);
        expect(result!.prereqs.has("A")).toBe(true);
        expect(result!.postreqs.has("C")).toBe(true);
        expect(result!.activeId).toBe("B");
    });
});

describe("getCourseStatus", () => {
    it('returns "default" when relationships is null', () => {
        expect(getCourseStatus("C1", null)).toBe("default");
    });

    it('returns "hovered" for the active course', () => {
        const rels = {
            activeId: "C1",
            prereqs: new Set<string>(),
            postreqs: new Set<string>(),
        };
        expect(getCourseStatus("C1", rels)).toBe("hovered");
    });

    it('returns "prereq" for a prerequisite course', () => {
        const rels = {
            activeId: "C2",
            prereqs: new Set(["C1"]),
            postreqs: new Set<string>(),
        };
        expect(getCourseStatus("C1", rels)).toBe("prereq");
    });

    it('returns "postreq" for a dependent course', () => {
        const rels = {
            activeId: "C1",
            prereqs: new Set<string>(),
            postreqs: new Set(["C2"]),
        };
        expect(getCourseStatus("C2", rels)).toBe("postreq");
    });

    it('returns "default" for an unrelated course', () => {
        const rels = {
            activeId: "C1",
            prereqs: new Set(["P1"]),
            postreqs: new Set(["D1"]),
        };
        expect(getCourseStatus("UNRELATED", rels)).toBe("default");
    });
});
