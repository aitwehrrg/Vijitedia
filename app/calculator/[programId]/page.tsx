import { Metadata } from "next";
import { FLOWSHEET_DATA } from "@/data/programs";
import CalculatorClient from "./calculator-client";

type Props = {
    params: { programId: string };
};

// 1. Generate Metadata (Runs on Server)
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    // Await params if you are on Next.js 15+, otherwise access directly
    const { programId } = await Promise.resolve(params);

    const program = FLOWSHEET_DATA.find((p) => p.id === programId);

    return {
        title: program
            ? `CGPA Calculator: ${program.name}`
            : "CGPA Calculator",
        description: program
            ? `Calculate your SGPA and CGPA for ${program.name}.`
            : "Academic CGPA Calculator",
    };
}

// 2. Render the Client Component
export default function Page() {
    return <CalculatorClient />;
}
