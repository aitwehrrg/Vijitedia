// data/programs.ts

export type Course = {
    id: string;
    code: string;
    title: string;
    credits: number;
    prereqs: string[];
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

export const FLOWSHEET_DATA: Program[] = [
    {
        id: "cse-bs",
        name: "Computer Science BS",
        department: "Computer Science & Engineering",
        years: [
            {
                id: "y1",
                label: "Year 1",
                semesters: [
                    {
                        id: "y1s1",
                        label: "Fall",
                        courses: [
                            {
                                id: "c1",
                                code: "MTH 141",
                                title: "Calculus I",
                                credits: 4,
                                prereqs: [],
                            },
                            {
                                id: "c2",
                                code: "CSE 115",
                                title: "Intro to CS I",
                                credits: 4,
                                prereqs: [],
                            },
                        ],
                    },
                    {
                        id: "y1s2",
                        label: "Spring",
                        courses: [
                            {
                                id: "c3",
                                code: "MTH 142",
                                title: "Calculus II",
                                credits: 4,
                                prereqs: ["c1"],
                            },
                            {
                                id: "c4",
                                code: "CSE 116",
                                title: "Intro to CS II",
                                credits: 4,
                                prereqs: ["c2"],
                            },
                        ],
                    },
                ],
            },
            {
                id: "y2",
                label: "Year 2",
                semesters: [
                    {
                        id: "y2s1",
                        label: "Fall",
                        courses: [
                            {
                                id: "c5",
                                code: "CSE 250",
                                title: "Data Structures",
                                credits: 4,
                                prereqs: ["c4", "c3"],
                            },
                            {
                                id: "c6",
                                code: "CSE 220",
                                title: "Systems Programming",
                                credits: 4,
                                prereqs: ["c4"],
                            },
                        ],
                    },
                    {
                        id: "y2s2",
                        label: "Spring",
                        courses: [
                            {
                                id: "c7",
                                code: "CSE 331",
                                title: "Algo & Complexity",
                                credits: 4,
                                prereqs: ["c5"],
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        id: "ee-bs",
        name: "Electrical Engineering BS",
        department: "Electrical Engineering",
        years: [
            {
                id: "ee-y1",
                label: "Year 1",
                semesters: [
                    {
                        id: "ee-y1s1",
                        label: "Fall",
                        courses: [
                            {
                                id: "ee1",
                                code: "MTH 141",
                                title: "Calculus I",
                                credits: 4,
                                prereqs: [],
                            },
                            {
                                id: "ee2",
                                code: "CHE 107",
                                title: "Gen Chem for Engr",
                                credits: 4,
                                prereqs: [],
                            },
                        ],
                    },
                    {
                        id: "ee-y1s2",
                        label: "Spring",
                        courses: [
                            {
                                id: "ee3",
                                code: "MTH 142",
                                title: "Calculus II",
                                credits: 4,
                                prereqs: ["ee1"],
                            },
                            {
                                id: "ee4",
                                code: "PHY 107",
                                title: "Gen Physics I",
                                credits: 4,
                                prereqs: ["ee1"],
                            },
                        ],
                    },
                ],
            },
            {
                id: "ee-y2",
                label: "Year 2",
                semesters: [
                    {
                        id: "ee-y2s1",
                        label: "Fall",
                        courses: [
                            {
                                id: "ee5",
                                code: "EE 202",
                                title: "Circuit Analysis",
                                credits: 3,
                                prereqs: ["ee3", "ee4"],
                            },
                            {
                                id: "ee6",
                                code: "MTH 306",
                                title: "Diff Equations",
                                credits: 4,
                                prereqs: ["ee3"],
                            },
                        ],
                    },
                    {
                        id: "ee-y2s2",
                        label: "Spring",
                        courses: [
                            {
                                id: "ee7",
                                code: "EE 310",
                                title: "Signals & Systems",
                                credits: 4,
                                prereqs: ["ee5", "ee6"],
                            },
                            {
                                id: "ee8",
                                code: "EE 312",
                                title: "Applied Magnetics",
                                credits: 3,
                                prereqs: ["ee5"],
                            },
                        ],
                    },
                ],
            },
        ],
    },
];
