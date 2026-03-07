import { describe, it, expect } from "vitest";
import { OPEN_ELECTIVES_I } from "./electives";

describe("OPEN_ELECTIVES_I", () => {
    it("has at least 5 elective options", () => {
        expect(OPEN_ELECTIVES_I.length).toBeGreaterThanOrEqual(5);
    });

    it("every elective has required fields", () => {
        OPEN_ELECTIVES_I.forEach((elective) => {
            expect(elective.id).toBeTruthy();
            expect(elective.code).toBeTruthy();
            expect(elective.title).toBeTruthy();
            expect(elective.credits).toBeGreaterThan(0);
            expect(elective.prereqs).toBeDefined();
        });
    });

    it("all electives have 4 credits", () => {
        OPEN_ELECTIVES_I.forEach((elective) => {
            expect(elective.credits).toBe(4);
        });
    });

    it("has no duplicate elective IDs", () => {
        const ids = OPEN_ELECTIVES_I.map((e) => e.id);
        expect(new Set(ids).size).toBe(ids.length);
    });

    it("elective IDs match their codes", () => {
        OPEN_ELECTIVES_I.forEach((elective) => {
            expect(elective.id).toBe(elective.code);
        });
    });

    it("mutexIds are valid string arrays when present", () => {
        OPEN_ELECTIVES_I.forEach((elective) => {
            if (elective.mutexIds) {
                expect(Array.isArray(elective.mutexIds)).toBe(true);
                elective.mutexIds.forEach((mid) => {
                    expect(typeof mid).toBe("string");
                    expect(mid.length).toBeGreaterThan(0);
                });
            }
        });
    });

    it("all electives have empty prereqs", () => {
        OPEN_ELECTIVES_I.forEach((elective) => {
            expect(elective.prereqs).toHaveLength(0);
        });
    });
});
