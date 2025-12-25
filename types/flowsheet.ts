export type CourseType = "core" | "elective" | "minor";

export type Minor = {
    id: string;
    name: string;
    // An ordered list of courses that this minor provides
    courses: CourseOption[];
};

export type CourseOption = {
    id: string;
    code: string;
    title: string;
    credits: number;
    prereqs: string[];
    linkedOptionId?: string;
    mutexIds?: string[];
};

export type Course = {
    id: string;
    type?: CourseType;

    // -- Core Fields --
    code?: string;
    title?: string;
    credits?: number;
    prereqs?: string[];

    // -- Elective Fields --
    label?: string;
    options?: CourseOption[];
    linkedSlotId?: string;

    // -- Minor Fields --
    minorIndex?: number;
};

export type Semester = {
    id: string;
    label: string; // e.g., "Fall", "Spring"
    courses: Course[];
};

export type Year = {
    id: string;
    label: string; // e.g., "Year 1"
    semesters: Semester[];
};

export type Program = {
    id: string;
    name: string;
    department: string;
    years: Year[];
};
