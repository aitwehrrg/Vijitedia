// data/programs/ce.ts
import { Program } from "@/types/flowsheet";

export const CE_PROGRAM: Program = {
    id: "btech-ce",
    name: "Computer Engineering",
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
                            id: "R5CO2001T",
                            code: "R5CO2001T",
                            title: "Discrete Structure",
                            credits: 4,
                            prereqs: [],
                        },
                        {
                            id: "R5CO2002T",
                            code: "R5CO2002T",
                            title: "Design & Analysis of Algorithm",
                            credits: 3,
                            prereqs: ["R5CO1022T"],
                        },
                        {
                            id: "R5CO2003T",
                            code: "R5CO2003T",
                            title: "Operating System",
                            credits: 3,
                            prereqs: ["R5CO1021T"],
                        },
                        {
                            id: "MDM-I-CE",
                            code: "MDM-I",
                            title: "Multi-disciplinary Minor-I",
                            credits: 2,
                            prereqs: [],
                        },
                        {
                            id: "R5CO2005L",
                            code: "R5CO2005L",
                            title: "Program Development Laboratory",
                            credits: 1,
                            prereqs: ["R5CO1001T"],
                        },
                        {
                            id: "R5CO2002L",
                            code: "R5CO2002L",
                            title: "Algorithm Laboratory",
                            credits: 1,
                            prereqs: ["R5CO1022T"],
                        },
                        {
                            id: "R5CO2003L",
                            code: "R5CO2003L",
                            title: "Operating System Lab",
                            credits: 1,
                            prereqs: [],
                        },
                        {
                            id: "MIL-CE",
                            code: "AEC",
                            title: "Modern Indian Languages",
                            credits: 2,
                            prereqs: [],
                        },
                        {
                            id: "R5CO2004L",
                            code: "R5CO2004L",
                            title: "Open Source Technology Laboratory",
                            credits: 1,
                            prereqs: ["R5CO1022T"],
                        },
                        {
                            id: "R5HS24010-CE",
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
                            id: "R5CO2006T",
                            code: "R5CO2006T",
                            title: "Theory of Computation",
                            credits: 4,
                            prereqs: ["R5CO1022T"],
                        },
                        {
                            id: "R5CO2007T",
                            code: "R5CO2007T",
                            title: "Artificial Intelligence",
                            credits: 3,
                            prereqs: ["R5CO2002T"],
                        },
                        {
                            id: "R5CO2008T",
                            code: "R5CO2008T",
                            title: "Database Management System",
                            credits: 3,
                            prereqs: ["R5CO1022T"],
                        },
                        {
                            id: "R5CO2009T",
                            code: "R5CO2009T",
                            title: "Software Engineering",
                            credits: 3,
                            prereqs: [],
                        },
                        {
                            id: "MDM-II-CE",
                            code: "MDM-II",
                            title: "Multi-disciplinary Minor-II",
                            credits: 2,
                            prereqs: [],
                        },
                        {
                            id: "R5CO2007L",
                            code: "R5CO2007L",
                            title: "Artificial Intelligence Lab",
                            credits: 1,
                            prereqs: [],
                        },
                        {
                            id: "R5CO2008L",
                            code: "R5CO2008L",
                            title: "Database Management System Lab",
                            credits: 1,
                            prereqs: [],
                        },
                        {
                            id: "R5CO2009L",
                            code: "R5CO2009L",
                            title: "Software Engineering Lab",
                            credits: 1,
                            prereqs: [],
                        },
                        {
                            id: "R5CO2010L",
                            code: "R5CO2010L",
                            title: "Linux Administration Lab",
                            credits: 1,
                            prereqs: [],
                        },
                        {
                            id: "R5CH24020-CE",
                            code: "R5CH24020",
                            title: "Environmental Science",
                            credits: 2,
                            prereqs: [],
                        },
                        {
                            id: "R5CO2601P",
                            code: "R5CO2601P",
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
                            id: "R5CO3001T",
                            code: "R5CO3001T",
                            title: "Compiler Construction",
                            credits: 3,
                            prereqs: ["C/C++ Programming", "Computer Organization", "Operating System"], // [cite: 1542]
                        },
                        {
                            id: "R5CO3002T",
                            code: "R5CO3002T",
                            title: "Machine Learning",
                            credits: 3,
                            prereqs: ["Linear Algebra", "Probability", "Statistics"], // [cite: 1547]
                        },
                        {
                            id: "R5CO3003T",
                            code: "R5CO3003T",
                            title: "Computer Network",
                            credits: 3,
                            prereqs: [], // [cite: 1552]
                        },
                        {
                            id: "R5CO3004T",
                            code: "R5CO3004T",
                            title: "Parallel Computing",
                            credits: 3,
                            prereqs: ["COA"], // [cite: 1569]
                        },
                        {
                            id: "R5CO3005T",
                            code: "R5CO3005T",
                            title: "Human Computer Interaction",
                            credits: 2,
                            prereqs: [], // [cite: 1588]
                        },
                        {
                            id: "R5CO3201T",
                            code: "R5CO3201T",
                            title: "Multi-disciplinary Minor-III",
                            credits: 3,
                            prereqs: [], // [cite: 1526]
                        },
                        {
                            id: "R5CO3101T",
                            code: "R5CO3101T",
                            title: "Program Elective - I",
                            credits: 3,
                            prereqs: [], // [cite: 1526]
                        },
                        {
                            id: "R5CO3101L",
                            code: "R5CO3101L",
                            title: "Program Elective I Laboratory",
                            credits: 1,
                            prereqs: [], // [cite: 1526]
                        },
                        {
                            id: "R5CO3001L",
                            code: "R5CO3001L",
                            title: "Parallel Programming Laboratory",
                            credits: 1,
                            prereqs: ["Computer Organization", "Operating Systems", "C/C++", "Data Structures"], // [cite: 1669]
                        },
                        {
                            id: "R5CO3002L",
                            code: "R5CO3002L",
                            title: "Machine Learning Lab",
                            credits: 1,
                            prereqs: [], // [cite: 1526]
                        },
                        {
                            id: "R5CO3003L",
                            code: "R5CO3003L",
                            title: "Computer Network Laboratory",
                            credits: 1,
                            prereqs: [], // [cite: 1628]
                        },
                    ],
                },
                {
                    id: "y3s2",
                    label: "Semester VI",
                    courses: [
                        {
                            id: "R5CO3006T",
                            code: "R5CO3006T",
                            title: "Cloud Computing",
                            credits: 3,
                            prereqs: ["Operating system"], // [cite: 1925]
                        },
                        {
                            id: "R5CO3007T",
                            code: "R5CO3007T",
                            title: "Cyber Security",
                            credits: 3,
                            prereqs: [], // [cite: 1532]
                        },
                        {
                            id: "R5CO3008T",
                            code: "R5CO3008T",
                            title: "Research Methodology",
                            credits: 2,
                            prereqs: [], // [cite: 1532]
                        },
                        {
                            id: "R5CO3301T",
                            code: "R5CO3301T",
                            title: "Open elective - I",
                            credits: 4,
                            prereqs: [], // [cite: 1532]
                        },
                        {
                            id: "FIN-MGMT-CE",
                            code: "HSSM",
                            title: "Financial Management",
                            credits: 2,
                            prereqs: [], // [cite: 1959]
                        },
                        {
                            id: "MDM-IV-CE",
                            code: "R5CO3201T",
                            title: "Multi-disciplinary Minor- IV",
                            credits: 3,
                            prereqs: [], // [cite: 1532]
                        },
                        {
                            id: "R5CO3107T",
                            code: "R5CO3107T",
                            title: "Program Elective - II",
                            credits: 3,
                            prereqs: [], // [cite: 1532]
                        },
                        {
                            id: "R5CO3004L",
                            code: "R5CO3004L",
                            title: "Devops",
                            credits: 1,
                            prereqs: ["Software Engineering", "Web Development", "Cloud", "Networking"], // [cite: 1977]
                        },
                        {
                            id: "R5CO3005L",
                            code: "R5CO3005L",
                            title: "Cloud Computing Laboratory",
                            credits: 1,
                            prereqs: [], // [cite: 1999]
                        },
                        {
                            id: "R5CO3006L",
                            code: "R5CO3006L",
                            title: "Cyber Security Laboratory",
                            credits: 1,
                            prereqs: [], // [cite: 2008]
                        },
                        {
                            id: "R5CO3107L",
                            code: "R5CO3107L",
                            title: "Program Elective II Laboratory",
                            credits: 1,
                            prereqs: [], // [cite: 1532]
                        },
                    ],
                },
            ],
        },
    ],
};
