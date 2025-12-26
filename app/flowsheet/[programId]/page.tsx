import { Metadata } from "next";
import { FLOWSHEET_DATA } from "@/data/programs";
import { MINORS } from "@/data/minors";
import { notFound } from "next/navigation";
import FlowsheetClient from "./flowsheet-client";

// 1. Define a specific type for the flattened SEO data
type SeoCourse = {
    code: string;
    title: string;
    credits: number;
    prereqs: string[];
    category: string;
    dept: string;
};

type Props = {
    params: { programId: string };
};

// ... generateMetadata ...

export default async function FlowsheetPage({ params }: Props) {
    const { programId } = await Promise.resolve(params);
    const program = FLOWSHEET_DATA.find((p) => p.id === programId);

    if (!program) return notFound();

    // 2. FLATTEN CORE & ELECTIVES -> SeoCourse[]
    const coreAndElectives: SeoCourse[] = program.years.flatMap((y) =>
        y.semesters.flatMap((s) =>
            s.courses.flatMap((c) => {
                // Case A: Elective (Map options to SeoCourse)
                if (c.type === "elective" && c.options) {
                    return c.options.map((opt) => ({
                        code: opt.code,
                        title: opt.title,
                        credits: opt.credits,
                        prereqs: opt.prereqs,
                        category: "Elective Option",
                        dept: program.department, // Default to program dept for electives
                    }));
                }

                // Case B: Core Course (Map single slot to SeoCourse)
                if (c.code && c.title) {
                    return [
                        {
                            code: c.code,
                            title: c.title,
                            credits: c.credits || 0,
                            prereqs: c.prereqs || [],
                            category: "Core Requirement",
                            dept: program.department,
                        },
                    ];
                }

                return [];
            })
        )
    );

    // 3. FLATTEN MINORS -> SeoCourse[]
    const minorCourses: SeoCourse[] = MINORS.flatMap((m) =>
        m.courses.map((c) => ({
            code: c.code,
            title: c.title,
            credits: c.credits,
            prereqs: c.prereqs,
            category: `Minor in ${m.name}`,
            dept: m.dept, // Use the Minor's specific department
        }))
    );

    // 4. MERGE
    const fullCourseList = [...coreAndElectives, ...minorCourses];

    // 5. JSON-LD
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
                description: `Type: ${course.category}. Dept: ${course.dept}. Credits: ${course.credits}.`,
                provider: {
                    "@type": "CollegeOrUniversity",
                    name: "Veermata Jijabai Technological Institute",
                    department: course.dept,
                },
            },
        })),
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <div className="sr-only">
                <h1>Full Course Catalog: {program.name}</h1>
                <ul>
                    {fullCourseList.map((c, i) => (
                        <li key={`${c.code}-${i}`}>
                            <span>
                                [{c.category} - {c.dept} Dept]{" "}
                            </span>
                            <strong>
                                {c.code}: {c.title}
                            </strong>
                            . Credits: {c.credits}. Prerequisites:{" "}
                            {c.prereqs && c.prereqs.length > 0
                                ? c.prereqs.join(", ")
                                : "None"}
                            .
                        </li>
                    ))}
                </ul>
            </div>

            <FlowsheetClient />
        </>
    );
}
