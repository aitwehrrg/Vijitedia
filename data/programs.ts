import { Program } from "@/types/flowsheet";
import { CE_PROGRAM } from "./majors/btech-ce";
import { IT_PROGRAM } from "./majors/btech-it";

import { EE_PROGRAM } from "./majors/btech-ee";
import { EL_PROGRAM } from "./majors/btech-el";
import { ET_PROGRAM } from "./majors/btech-et";

export const FLOWSHEET_DATA: Program[] = [
    CE_PROGRAM,
    IT_PROGRAM,
    EE_PROGRAM,
    EL_PROGRAM,
    ET_PROGRAM,
];
