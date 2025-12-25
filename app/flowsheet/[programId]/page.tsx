import { Metadata } from "next";
import { FLOWSHEET_DATA } from "@/data/programs";
import FlowsheetClient from "./flowsheet-client";

type Props = {
    params: { programId: string };
};

// 1. Generate Metadata (Runs on Server)
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    // Await params if you are on Next.js 15+, otherwise access directly
    const { programId } = await Promise.resolve(params);

    const program = FLOWSHEET_DATA.find((p) => p.id === programId);

    return {
        title: program ? `Academic Flowsheet: ${program.name}` : "Academic Flowsheet",
        description: program
            ? `View the flowsheet for ${program.name}.`
            : "Academic Flowsheets",
    };
}

// 2. Render the Client Component
export default function Page() {
    return <FlowsheetClient />;
}
