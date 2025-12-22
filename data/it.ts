// data/programs/it.ts
import { Program } from "@/types/flowsheet";

export const IT_PROGRAM: Program = {
    id: "btech-it",
    name: "Information Technology",
    department: "Computer Engineering and Information Technology",
    years: [
        {
            id: "y1",
            label: "First Year",
            semesters: [
                {
                    id: "y1s1",
                    label: "Semester I",
                    courses: [
                        {
                            id: "R5CH1011T",
                            code: "R5CH1011T",
                            title: "Chemistry I",
                            credits: 3,
                            prereqs: [],
                        },
                        {
                            id: "R5CH1011L",
                            code: "R5CH1011L",
                            title: "Chemistry I Laboratory",
                            credits: 1,
                            prereqs: [],
                        },
                        {
                            id: "R5MA1003T",
                            code: "R5MA1003T",
                            title: "Mathematics-I",
                            credits: 3,
                            prereqs: [],
                        },
                        {
                            id: "R5CO1026T",
                            code: "R5CO1026T",
                            title: "FRB 1: Probability & Statistics",
                            credits: 2,
                            prereqs: [],
                        },
                        {
                            id: "R5SE1001T",
                            code: "R5SE1001T",
                            title: "Engineering Mechanics",
                            credits: 2,
                            prereqs: [],
                        },
                        {
                            id: "R5SE1001L",
                            code: "R5SE1001L",
                            title: "Engineering Mechanics Laboratory",
                            credits: 1,
                            prereqs: [],
                        },
                        {
                            id: "R5CO1001T",
                            code: "R5CO1001T",
                            title: "Programming for Problem Solving",
                            credits: 2,
                            prereqs: [],
                        },
                        {
                            id: "R5CO1001L",
                            code: "R5CO1001L",
                            title: "Programming for Problem Solving Laboratory",
                            credits: 1,
                            prereqs: [],
                        },
                        {
                            id: "R5CO1027T",
                            code: "R5CO1027T",
                            title: "FRB 2: Digital Logic Design",
                            credits: 2,
                            prereqs: [],
                        },
                        {
                            id: "R5CO1028L",
                            code: "R5CO1028L",
                            title: "Department Specific Workshop",
                            credits: 1.5,
                            prereqs: [],
                        },
                        {
                            id: "R5CO1029T",
                            code: "R5CO1029T",
                            title: "Indian Knowledge System",
                            credits: 2,
                            prereqs: [],
                        },
                        {
                            id: "R5CO1030L",
                            code: "R5CO1030L",
                            title: "Co-Curricular Course",
                            credits: 1.5,
                            prereqs: [],
                        },
                    ],
                },
                {
                    id: "y1s2",
                    label: "Semester II",
                    courses: [
                        {
                            id: "R5PH1011T",
                            code: "R5PH1011T",
                            title: "Physics II",
                            credits: 3,
                            prereqs: [],
                        },
                        {
                            id: "R5PH1011L",
                            code: "R5PH1011L",
                            title: "Physics II Laboratory",
                            credits: 1,
                            prereqs: [],
                        },
                        {
                            id: "R5MA1014T",
                            code: "R5MA1014T",
                            title: "Mathematics-II",
                            credits: 3,
                            prereqs: [],
                        },
                        {
                            id: "R5ME1001T",
                            code: "R5ME1001T",
                            title: "Engineering Graphics",
                            credits: 2,
                            prereqs: [],
                        },
                        {
                            id: "R5ME1001L",
                            code: "R5ME1001L",
                            title: "Engineering Graphics Laboratory",
                            credits: 1,
                            prereqs: [],
                        },
                        {
                            id: "R5CO1021T",
                            code: "R5CO1021T",
                            title: "Computer Organisation",
                            credits: 3,
                            prereqs: [],
                        },
                        {
                            id: "R5CO1022T",
                            code: "R5CO1022T",
                            title: "Data Structures",
                            credits: 3,
                            prereqs: [],
                        },
                        {
                            id: "R5CO1023L",
                            code: "R5CO1023L",
                            title: "Data Structures Laboratory",
                            credits: 1,
                            prereqs: [],
                        },
                        {
                            id: "R5CO1024L",
                            code: "R5CO1024L",
                            title: "Web Development Engineering Workshop",
                            credits: 1.5,
                            prereqs: [],
                        },
                        {
                            id: "R5HS1001L",
                            code: "R5HS1001L",
                            title: "Ability Enhancement Course (Business & Technical Communication)",
                            credits: 2,
                            prereqs: [],
                        },
                        {
                            id: "R5CO1025L",
                            code: "R5CO1025L",
                            title: "Sports and Yoga or NSS/NCC",
                            credits: 1.5,
                            prereqs: [],
                        },
                    ],
                },
            ],
        },
        {
            id: "y2",
            label: "Second Year",
            semesters: [
                {
                    id: "y2s1",
                    label: "Semester III",
                    courses: [
                        {
                            id: "R5MA2007T",
                            code: "R5MA2007T",
                            title: "Mathematics for Computer Engineers",
                            credits: 3,
                            prereqs: [],
                        },
                        {
                            id: "R5IT2001T",
                            code: "R5IT2001T",
                            title: "Discrete Mathematics",
                            credits: 4,
                            prereqs: [],
                        },
                        {
                            id: "R5IT2002T",
                            code: "R5IT2002T",
                            title: "Design & Analysis of Algorithm",
                            credits: 3,
                            prereqs: ["R5CO1022T"],
                        },
                        {
                            id: "R5IT2003T",
                            code: "R5IT2003T",
                            title: "Operating System",
                            credits: 3,
                            prereqs: ["R5CO1021T"],
                        },
                        {
                            id: "MDM-I-IT",
                            code: "MDM-I",
                            title: "Multi-disciplinary Minor-I",
                            credits: 2,
                            prereqs: [],
                        },
                        {
                            id: "R5IT2005L",
                            code: "R5IT2005L",
                            title: "Program Development Laboratory",
                            credits: 1,
                            prereqs: ["R5CO1001T"],
                        },
                        {
                            id: "R5IT2002L",
                            code: "R5IT2002L",
                            title: "Algorithm Laboratory",
                            credits: 1,
                            prereqs: ["R5CO1022T"],
                        },
                        {
                            id: "R5IT2003L",
                            code: "R5IT2003L",
                            title: "Operating System Laboratory",
                            credits: 1,
                            prereqs: [],
                        },
                        {
                            id: "MIL-IT",
                            code: "AEC",
                            title: "Modern Indian Languages",
                            credits: 2,
                            prereqs: [],
                        },
                        {
                            id: "R5IT2004L",
                            code: "R5IT2004L",
                            title: "Open Source Technology Laboratory",
                            credits: 1,
                            prereqs: ["R5CO1022T"],
                        },
                        {
                            id: "R5HS24010-IT",
                            code: "R5HS24010",
                            title: "Universal Human Values",
                            credits: 2,
                            prereqs: [],
                        },
                    ],
                },
                {
                    id: "y2s2",
                    label: "Semester IV",
                    courses: [
                        {
                            id: "R5IT2006T",
                            code: "R5IT2006T",
                            title: "Automata Theory",
                            credits: 4,
                            prereqs: ["R5CO1022T"],
                        },
                        {
                            id: "R5IT2007T",
                            code: "R5IT2007T",
                            title: "Artificial Intelligence",
                            credits: 3,
                            prereqs: ["R5IT2002T"],
                        },
                        {
                            id: "R5IT2008T",
                            code: "R5IT2008T",
                            title: "Database Systems",
                            credits: 3,
                            prereqs: ["R5CO1022T"],
                        },
                        {
                            id: "R5IT2009T",
                            code: "R5IT2009T",
                            title: "Computer Networks",
                            credits: 3,
                            prereqs: [],
                        },
                        {
                            id: "MDM-II-IT",
                            code: "MDM-II",
                            title: "Multi-disciplinary Minor-II",
                            credits: 2,
                            prereqs: [],
                        },
                        {
                            id: "R5IT2007L",
                            code: "R5IT2007L",
                            title: "Artificial Intelligence Laboratory",
                            credits: 1,
                            prereqs: [],
                        },
                        {
                            id: "R5IT2008L",
                            code: "R5IT2008L",
                            title: "Database Systems Laboratory",
                            credits: 1,
                            prereqs: [],
                        },
                        {
                            id: "R5IT2009L",
                            code: "R5IT2009L",
                            title: "Computer Networks Laboratory",
                            credits: 1,
                            prereqs: [],
                        },
                        {
                            id: "R5IT2010L",
                            code: "R5IT2010L",
                            title: "Linux Administration Laboratory",
                            credits: 1,
                            prereqs: [],
                        },
                        {
                            id: "R5CH24020-IT",
                            code: "R5CH24020",
                            title: "Environmental Science",
                            credits: 2,
                            prereqs: [],
                        },
                        {
                            id: "R5IT2601P",
                            code: "R5IT2601P",
                            title: "Community Engineering Project",
                            credits: 2,
                            prereqs: [],
                        },
                    ],
                },
            ],
        },
        {
            id: "y3",
            label: "Third Year",
            semesters: [
                {
                    id: "y3s1",
                    label: "Semester V",
                    courses: [
                        {
                            id: "R5IT3001T",
                            code: "R5IT3001T",
                            title: "Machine Learning",
                            credits: 3,
                            prereqs: ["Linear Algebra", "Probability", "Statistics"], // [cite: 2291]
                        },
                        {
                            id: "R5IT3002T",
                            code: "R5IT3002T",
                            title: "Software Engineering",
                            credits: 3,
                            prereqs: ["Programming", "basics of software engineering"], // [cite: 2306]
                        },
                        {
                            id: "R5IT3003T",
                            code: "R5IT3003T",
                            title: "Parallel Computing",
                            credits: 3,
                            prereqs: ["DAA"], // [cite: 2328]
                        },
                        {
                            id: "R5IT3004T",
                            code: "R5IT3004T",
                            title: "Cloud Computing",
                            credits: 3,
                            prereqs: [], // [cite: 2338]
                        },
                        {
                            id: "R5IT3005T",
                            code: "R5IT3005T",
                            title: "Cryptography",
                            credits: 2,
                            prereqs: [], // [cite: 2348]
                        },
                        {
                            id: "R5IT3201T",
                            code: "R5IT3201T",
                            title: "Multi-disciplinary Minor-III",
                            credits: 3,
                            prereqs: [], // [cite: 2265]
                        },
                        {
                            id: "R5IT3101T",
                            code: "R5IT3101T",
                            title: "Program Elective -I",
                            credits: 3,
                            prereqs: [], // [cite: 2265]
                        },
                        {
                            id: "R5IT3003L",
                            code: "R5IT3003L",
                            title: "Machine Learning Lab",
                            credits: 1,
                            prereqs: [], // [cite: 2365]
                        },
                        {
                            id: "R5IT3002L",
                            code: "R5IT3002L",
                            title: "Software Engineering Laboratory",
                            credits: 1,
                            prereqs: ["Computer & Software Fundamentals Laboratory"], // [cite: 2381]
                        },
                        {
                            id: "R5IT3101L",
                            code: "R5IT3101L",
                            title: "Program Elective I Laboratory",
                            credits: 1,
                            prereqs: [], // [cite: 2265]
                        },
                        {
                            id: "R5IT3001L",
                            code: "R5IT3001L",
                            title: "Parallel Programming Laboratory",
                            credits: 1,
                            prereqs: ["C/C++ programming", "Python"], // [cite: 2401]
                        },
                    ],
                },
                {
                    id: "y3s2",
                    label: "Semester VI",
                    courses: [
                        {
                            id: "R5IT3006T",
                            code: "R5IT3006T",
                            title: "System Security",
                            credits: 3,
                            prereqs: [], // [cite: 2682]
                        },
                        {
                            id: "R5IT3007T",
                            code: "R5IT3007T",
                            title: "Wireless Network",
                            credits: 3,
                            prereqs: ["Operating system"], // [cite: 2692]
                        },
                        {
                            id: "R5IT3008T",
                            code: "R5IT3008T",
                            title: "Research Methodology",
                            credits: 2,
                            prereqs: [], // [cite: 2704]
                        },
                        {
                            id: "R5IT3301T",
                            code: "R5IT3301T",
                            title: "Open Elective",
                            credits: 4,
                            prereqs: [], // [cite: 2274]
                        },
                        {
                            id: "FIN-MGMT-IT",
                            code: "HSSM",
                            title: "Financial Management",
                            credits: 2,
                            prereqs: [], // [cite: 2720]
                        },
                        {
                            id: "MDM-IV-IT",
                            code: "R5IT3205T",
                            title: "Multi-disciplinary Minor-IV",
                            credits: 3,
                            prereqs: [], // [cite: 2274]
                        },
                        {
                            id: "R5IT3107T",
                            code: "R5IT3107T",
                            title: "Program Elective - II",
                            credits: 3,
                            prereqs: [], // [cite: 2274]
                        },
                        {
                            id: "R5IT3004L",
                            code: "R5IT3004L",
                            title: "Devops",
                            credits: 1,
                            prereqs: ["Software Engineering", "Web Development", "Cloud", "Networking"], // [cite: 2744]
                        },
                        {
                            id: "R5IT3005L",
                            code: "R5IT3005L",
                            title: "System Security Lab",
                            credits: 1,
                            prereqs: [], // [cite: 2764]
                        },
                        {
                            id: "R5IT3006L",
                            code: "R5IT3006L",
                            title: "Wireless Network Laboratory",
                            credits: 1,
                            prereqs: ["Operating system"], // [cite: 2774]
                        },
                        {
                            id: "R5IT3107L",
                            code: "R5IT3107L",
                            title: "Program Elective II Laboratory",
                            credits: 1,
                            prereqs: [], // [cite: 2274]
                        },
                    ],
                },
            ],
        },
    ],
};
