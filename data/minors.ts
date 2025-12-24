import { Minor } from "@/types/flowsheet";

export const MINORS: Minor[] = [
    {
        id: "R5EL2203",
        name: "Signal Processing and Imaging",
        courses: [
            {
                id: "R5EL2203",
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
];
