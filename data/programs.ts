import { Program } from "@/types/flowsheet";

import { EE_PROGRAM } from "./majors/btech-ee";
import { EL_PROGRAM } from "./majors/btech-el";
import { CE_PROGRAM } from "./majors/btech-ce";
import { IT_PROGRAM } from "./majors/btech-it";
import { ET_PROGRAM } from "./majors/btech-et";

export const FLOWSHEET_DATA: Program[] = [
    EE_PROGRAM,
    EL_PROGRAM,
    CE_PROGRAM,
    IT_PROGRAM,
    ET_PROGRAM,
];
