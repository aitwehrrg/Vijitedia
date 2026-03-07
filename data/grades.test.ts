import { describe, it, expect } from "vitest";
import { GRADE_POINTS, GRADE_OPTIONS } from "./grades";

describe("GRADE_POINTS", () => {
    it("maps AA to 10", () => {
        expect(GRADE_POINTS["AA"]).toBe(10);
    });

    it("maps AB to 9", () => {
        expect(GRADE_POINTS["AB"]).toBe(9);
    });

    it("maps BB to 8", () => {
        expect(GRADE_POINTS["BB"]).toBe(8);
    });

    it("maps BC to 7", () => {
        expect(GRADE_POINTS["BC"]).toBe(7);
    });

    it("maps CC to 6", () => {
        expect(GRADE_POINTS["CC"]).toBe(6);
    });

    it("maps CD to 5", () => {
        expect(GRADE_POINTS["CD"]).toBe(5);
    });

    it("maps DD to 4", () => {
        expect(GRADE_POINTS["DD"]).toBe(4);
    });

    it("maps FF to 0", () => {
        expect(GRADE_POINTS["FF"]).toBe(0);
    });

    it("has exactly 8 grades", () => {
        expect(Object.keys(GRADE_POINTS)).toHaveLength(8);
    });

    it("returns undefined for unknown grades", () => {
        expect(GRADE_POINTS["ZZ"]).toBeUndefined();
    });
});

describe("GRADE_OPTIONS", () => {
    it("has the same length as GRADE_POINTS keys", () => {
        expect(GRADE_OPTIONS).toHaveLength(Object.keys(GRADE_POINTS).length);
    });

    it("contains all grade keys", () => {
        Object.keys(GRADE_POINTS).forEach((key) => {
            expect(GRADE_OPTIONS).toContain(key);
        });
    });

    it("is ordered from highest to lowest (AA first, FF last)", () => {
        expect(GRADE_OPTIONS[0]).toBe("AA");
        expect(GRADE_OPTIONS[GRADE_OPTIONS.length - 1]).toBe("FF");
    });
});
