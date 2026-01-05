import { Metadata } from "next";
import { FLOWSHEET_DATA } from "@/data/programs";
import CalculatorClient from "@/components/calculator/client";

type Props = {
    params: { programId: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
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

export default function Page() {
    return <CalculatorClient />;
}
