import { Metadata } from "next";
import { FLOWSHEET_DATA } from "@/data/programs";
import { MINORS } from "@/data/minors";
import { HONORS } from "@/data/honors";
import { notFound } from "next/navigation";
import FlowsheetClient from "./flowsheet-client";

type SeoCourse = {
    code: string;
    title: string;
    credits: number;
    prereqs: string[];
    mutexIds: string[];
    category: string;
    dept: string;
};

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

    const coreAndElectives: SeoCourse[] = program.years.flatMap((y) =>
        y.semesters.flatMap((s) =>
            s.courses.flatMap((c) => {
                if (c.type === "elective" && c.options) {
                    return c.options.map((opt) => ({
                        code: opt.code,
                        title: opt.title,
                        credits: opt.credits,
                        prereqs: opt.prereqs || [],
                        mutexIds: opt.mutexIds || [],
                        category: "Elective Option",
                        dept: program.department,
                    }));
                }

                if (c.code && c.title) {
                    return [
                        {
                            code: c.code,
                            title: c.title,
                            credits: c.credits || 0,
                            prereqs: c.prereqs || [],
                            mutexIds: c.mutexIds || [],
                            category: "Core Requirement",
                            dept: program.department,
                        },
                    ];
                }

                return [];
            })
        )
    );

    const minorCourses: SeoCourse[] = MINORS.flatMap((m) =>
        m.courses.map((c) => ({
            code: c.code,
            title: c.title,
            credits: c.credits,
            prereqs: c.prereqs || [],
            mutexIds: c.mutexIds || [],
            category: `Minor in ${m.name}`,
            dept: m.dept,
        }))
    );

    const relevantHonors = HONORS.filter((h) => h.dept === program.department);
    const honorsCourses: SeoCourse[] = relevantHonors.flatMap((h) =>
        h.courses.map((c) => ({
            code: c.code,
            title: c.title,
            credits: c.credits,
            prereqs: c.prereqs || [],
            mutexIds: c.mutexIds || [],
            category: `Honors in ${h.name}`,
            dept: h.dept,
        }))
    );

    const fullCourseList = [
        ...coreAndElectives,
        ...minorCourses,
        ...honorsCourses,
    ];

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        itemListElement: fullCourseList.map((course, index) => {
            let desc = `Type: ${course.category}. Dept: ${course.dept}. Credits: ${course.credits}.`;
            if (course.mutexIds.length > 0) {
                desc += ` Mutually Exclusive with: ${course.mutexIds.join(", ")}.`;
            }

            return {
                "@type": "ListItem",
                position: index + 1,
                item: {
                    "@type": "Course",
                    courseCode: course.code,
                    name: course.title,
                    description: desc,
                    provider: {
                        "@type": "CollegeOrUniversity",
                        name: "Veermata Jijabai Technological Institute",
                        department: course.dept,
                    },
                },
            };
        }),
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
                            .{}
                            {c.mutexIds && c.mutexIds.length > 0 && (
                                <> Conflicts/Mutex: {c.mutexIds.join(", ")}.</>
                            )}
                        </li>
                    ))}
                </ul>
            </div>

            <FlowsheetClient />
        </>
    );
}
