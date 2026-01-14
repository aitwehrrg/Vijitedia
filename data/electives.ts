import { CourseOption } from "@/types/flowsheet";

export const OPEN_ELECTIVES_I: CourseOption[] = [
    {
        id: "R5MA3301T",
        code: "R5MA3301T",
        title: "Combinatorics and Graph Theory",
        credits: 4,
        prereqs: [],
    },
    {
        id: "R5CH3301T",
        code: "R5CH3301T",
        title: "Practices to Performance: Pathways to Enterprise Sustainability",
        credits: 4,
        prereqs: [],
    },
    {
        id: "R5PH3301T",
        code: "R5PH3301T",
        title: "Nanoscience and Nanotechnology for Engineers",
        credits: 4,
        prereqs: [],
    },
    {
        id: "R5HS3301T",
        code: "R5HS3301T",
        title: "Professional Communication Skills",
        credits: 4,
        prereqs: [],
    },
    {
        id: "R5HS3302T",
        code: "R5HS3302T",
        title: "Financial Management",
        credits: 4,
        prereqs: [],
        mutexIds: ["R5CO3401T", "R5IT3401T", "R5EL3401T"],
    },
    {
        id: "R5HS3303T",
        code: "R5HS3303T",
        title: "Leadership and Team Effectiveness",
        credits: 4,
        prereqs: [],
    },
    {
        id: "R5HS3304T",
        code: "R5HS3304T",
        title: "Principles of Management",
        credits: 4,
        prereqs: [],
    },
    {
        id: "R5HS3305T",
        code: "R5HS3305T",
        title: "Business Development: From Start to Scale",
        credits: 4,
        prereqs: [],
        mutexIds: [
            "R5IL2201T",
            "R5IL2202T",
            "R5IL3201T",
            "R5IL3202T",
            "R5IL4201T",
        ],
    },
];
