import { Metadata } from "next";
import { FLOWSHEET_DATA } from "@/data/programs";
import { MINORS } from "@/data/minors";
import { notFound } from "next/navigation";
import FlowsheetClient from "./flowsheet-client"; // Your Client Component

type Props = {
    params: { programId: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { programId } = await Promise.resolve(params);
    const program = FLOWSHEET_DATA.find((p) => p.id === programId);

    if (!program) return { title: "Not Found" };

    return {
        title: program
            ? `Academic Flowsheet: ${program.name}`
            : "Academic Flowsheet",
        description: program
            ? `Interactive prerequisite map for ${program.name}.`
            : "Academic Flowsheets",
    };
}

export default async function FlowsheetPage({ params }: Props) {
    const { programId } = await Promise.resolve(params);
    const program = FLOWSHEET_DATA.find((p) => p.id === programId);

    if (!program) return notFound();

    // 1. FLATTEN DATA FOR SEO
    // We need a uniform type { code: string, title: string, ... }
    const coreAndElectives = program.years.flatMap((y) =>
        y.semesters.flatMap((s) =>
            s.courses.flatMap((c) => {
                // Case A: Elective? Return its Options (which are concrete courses)
                if (c.type === "elective" && c.options) {
                    return c.options;
                }

                // Case B: Minor Slot? Ignore (we add MINORS global list later)
                if (c.type === "minor") {
                    return [];
                }

                // Case C: Core Course? Ensure it has code/title before returning
                if (c.code && c.title) {
                    return [
                        {
                            id: c.id,
                            code: c.code, // TS now knows this is string
                            title: c.title,
                            credits: c.credits || 0,
                            prereqs: c.prereqs || [],
                        },
                    ];
                }

                // Case D: Empty/Invalid Slot
                return [];
            })
        )
    );

    // Get all Minor Courses from the global definitions
    const allMinorCourses = MINORS.flatMap((m) => m.courses);

    // 2. BUILD JSON-LD
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        itemListElement: [...coreAndElectives, ...allMinorCourses].map(
            (course, index) => ({
                "@type": "ListItem",
                position: index + 1,
                item: {
                    "@type": "Course",
                    courseCode: course.code,
                    name: course.title,
                    description: `Credits: ${course.credits}. Prereqs: ${course.prereqs?.join(", ") || "None"}`,
                    provider: {
                        "@type": "CollegeOrUniversity",
                        name: "Veermata Jijabai Technological Institute",
                    },
                },
            })
        ),
    };

    return (
        <>
            {/* INJECT SEO DATA */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* RENDER APP */}
            <FlowsheetClient />
        </>
    );
}
