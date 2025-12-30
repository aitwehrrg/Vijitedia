export type CourseType = "core" | "elective" | "minor";

export type Minor = {
    id: string;
    dept: string;
    name: string;
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

    code?: string;
    title?: string;
    credits?: number;
    prereqs?: string[];

    label?: string;
    options?: CourseOption[];
    linkedSlotId?: string;

    minorIndex?: number;
};

export type Semester = {
    id: string;
    label: string; 
    courses: Course[];
};

export type Year = {
    id: string;
    label: string; 
    semesters: Semester[];
};

export type Program = {
    id: string;
    name: string;
    department: string;
    years: Year[];
};
