export type CourseType = "core" | "elective" | "minor" | "honors";

export type Honors = {
    id: string;
    dept: string;
    name: string;
    courses: CourseOption[];
};

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
    mutexIds?: string[];

    minorIndex?: number;
    honorsIndex?: number; 
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
