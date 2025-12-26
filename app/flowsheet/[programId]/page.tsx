import { Metadata } from "next";
import { FLOWSHEET_DATA } from "@/data/programs";
import { MINORS } from "@/data/minors";
import { notFound } from "next/navigation";
import FlowsheetClient from "./flowsheet-client";

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

    // 1. FLATTEN DATA
    const coreAndElectives = program.years.flatMap((y) =>
        y.semesters.flatMap((s) =>
            s.courses.flatMap((c) => {
                if (c.type === "elective" && c.options) return c.options;
                if (c.type === "minor") return [];
                if (c.code && c.title) {
                    return [
                        {
                            id: c.id,
                            code: c.code,
                            title: c.title,
                            credits: c.credits || 0,
                            prereqs: c.prereqs || [],
                        },
                    ];
                }
                return [];
            })
        )
    );

    const allMinorCourses = MINORS.flatMap((m) => m.courses);

    // Combine for rendering
    const fullCourseList = [...coreAndElectives, ...allMinorCourses];

    // 2. BUILD JSON-LD (Schema.org)
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        itemListElement: fullCourseList.map((course, index) => ({
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
        })),
    };

    return (
        <>
            {/* 1. SCHEMA.ORG DATA (Google/Search) */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* 2. SEMANTIC TEXT DATA (LLMs/Scrapers/Screen Readers) */}
            {/* 'sr-only' hides this from visual UI but keeps it in the DOM text stream */}
            <div className="sr-only">
                <h1>Full Course Catalog: {program.name}</h1>
                <p>
                    The following is a complete text list of all courses
                    associated with this program, including core requirements,
                    electives, and available minors.
                </p>
                <ul>
                    {fullCourseList.map((c, i) => (
                        <li key={`${c.code}-${i}`}>
                            <strong>{c.code}</strong>: {c.title}. Credits:{" "}
                            {c.credits}. Prerequisites:{" "}
                            {c.prereqs && c.prereqs.length > 0
                                ? c.prereqs.join(", ")
                                : "None"}
                            .
                        </li>
                    ))}
                </ul>
            </div>

            {/* 3. VISUAL APP */}
            <FlowsheetClient />
        </>
    );
}
