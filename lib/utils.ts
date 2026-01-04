import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function toRoman(num: number) {
    const roman = [
        "",
        "I",
        "II",
        "III",
        "IV",
        "V",
        "VI",
        "VII",
        "VIII",
        "IX",
        "X",
    ];
    return roman[num];
}

export function getSuffix(courseIndex: number) {
    let suffix = " ";
    if (courseIndex === 7) {
        suffix += "Project";
        return suffix;
    }
    suffix += toRoman((courseIndex >> 1) + 1);
    if ((courseIndex & 1) === 1) suffix += " Laboratory";
    return suffix;
}
