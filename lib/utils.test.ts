import { describe, it, expect } from "vitest";
import { toRoman, getSuffix } from "./utils";

describe("toRoman", () => {
    it("returns empty string for index 0", () => {
        expect(toRoman(0)).toBe("");
    });

    it.each([
        [1, "I"],
        [2, "II"],
        [3, "III"],
        [4, "IV"],
        [5, "V"],
        [6, "VI"],
        [7, "VII"],
        [8, "VIII"],
        [9, "IX"],
        [10, "X"],
    ])("toRoman(%i) returns '%s'", (num, expected) => {
        expect(toRoman(num)).toBe(expected);
    });

    it("returns undefined for out-of-range input", () => {
        expect(toRoman(11)).toBeUndefined();
    });
});

describe("getSuffix", () => {
    it('returns " I" for courseIndex 0 (theory)', () => {
        expect(getSuffix(0)).toBe(" I");
    });

    it('returns " I Laboratory" for courseIndex 1 (lab)', () => {
        expect(getSuffix(1)).toBe(" I Laboratory");
    });

    it('returns " II" for courseIndex 2', () => {
        expect(getSuffix(2)).toBe(" II");
    });

    it('returns " II Laboratory" for courseIndex 3', () => {
        expect(getSuffix(3)).toBe(" II Laboratory");
    });

    it('returns " III" for courseIndex 4', () => {
        expect(getSuffix(4)).toBe(" III");
    });

    it('returns " III Laboratory" for courseIndex 5', () => {
        expect(getSuffix(5)).toBe(" III Laboratory");
    });

    it('returns " IV" for courseIndex 6', () => {
        expect(getSuffix(6)).toBe(" IV");
    });

    it('returns " Project" for courseIndex 7', () => {
        expect(getSuffix(7)).toBe(" Project");
    });
});
