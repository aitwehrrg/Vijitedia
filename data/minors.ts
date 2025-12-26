import { Minor } from "@/types/flowsheet";

export const MINORS: Minor[] = [
    {
        id: "R5CE2201",
        dept: "Civil Engineering",
        name: "Innovation and Entrepreneurship",
        courses: [
            {
                id: "R5CE2201T",
                code: "R5CE2201T",
                title: "Understanding Incubation and Entrepreneurship",
                credits: 2,
                prereqs: [],
            },
            {
                id: "R5CE2204T",
                code: "R5CE2204T",
                title: "Entrepreneurship Essentials",
                credits: 2,
                prereqs: [],
            },
            {
                id: "R5CE3201T",
                code: "R5CE3201T",
                title: "Product Design and Manufacturing",
                credits: 3,
                prereqs: [],
            },
            {
                id: "R5CE3204T",
                code: "R5CE3204T",
                title: "Six Sigma",
                credits: 3,
                prereqs: [],
            },
        ],
    },
    {
        id: "R5EL2203",
        dept: "Electronics Engineering",
        name: "Signal Processing and Imaging",
        courses: [
            {
                id: "R5EL2203T",
                code: "R5EL2203T",
                title: "Signals and Systems",
                credits: 2,
                prereqs: [],
            },
            {
                id: "R5EL2204T",
                code: "R5EL2204T",
                title: "Digital Signal Processing",
                credits: 2,
                prereqs: ["R5EL2203T"],
            },
            {
                id: "R5EL3202T",
                code: "R5EL3202T",
                title: "Digital Image Processing",
                credits: 3,
                prereqs: ["R5EL2204T"],
            },
            {
                id: "R5EL3204T",
                code: "R5EL3204T",
                title: "Pattern Recognition",
                credits: 3,
                prereqs: ["R5EL2203T", "R5EL2204T"],
            },
            // {
            //     id: "R5EL4202T",
            //     code: "R5EL4202T",
            //     title: "Applications of Signal and Image Processing",
            //     credits: 4,
            //     prereqs: ["R5EL2203T", "R5EL2204T", "R5EL3202T", "R5EL3204T"],
            // },
        ],
    },
    {
        id: "R5ME2202",
        dept: "Mechanical Engineering",
        name: "Defence Technology",
        courses: [
            {
                id: "R5ME2202T",
                code: "R5ME2202T",
                title: "Warfare Platforms and Systems",
                credits: 2,
                prereqs: [],
            },
            {
                id: "R5ME2205T",
                code: "R5ME2205T",
                title: "Airforce Systems and Configurations",
                credits: 2,
                prereqs: [],
            },
            {
                id: "R5ME3201T",
                code: "R5ME3201T",
                title: "Navigation, Guidance and Control",
                credits: 3,
                prereqs: ["R5SE1001T", "R5SE1001L", "R5MA1014T"],
            },
            {
                id: "R5ME3204T",
                code: "R5ME3204T",
                title: "Communication Systems and Sensors",
                credits: 3,
                prereqs: ["R5PH1011T", "R5PH1011L"],
            },
        ],
    },
];
