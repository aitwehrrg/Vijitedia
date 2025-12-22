export type Course = {
    id: string;
    code: string;
    title: string;
    credits: number;
    prereqs: string[]; // IDs of prerequisite courses
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
