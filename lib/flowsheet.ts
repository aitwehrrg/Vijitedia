import { Course, CourseOption, Minor, Honors } from "@/types/flowsheet";
import { MINORS } from "@/data/minors";
import { HONORS } from "@/data/honors";

export type CourseStatus = "default" | "hovered" | "prereq" | "postreq";

export interface ActiveRelationships {
    prereqs: Set<string>;
    postreqs: Set<string>;
    activeId: string;
}

export function resolveEffectiveCourses(
    allCourses: Course[],
    selections: Record<string, string>,
    selectedMinorId: string | null,
    selectedHonorsId: string | null
): Course[] {
    return allCourses.map((course) => {
        if (course.type === "elective" && selections[course.id]) {
            const selectedOpt = course.options?.find(
                (o) => o.id === selections[course.id]
            );
            if (selectedOpt)
                return { ...course, ...selectedOpt, id: course.id };
        }

        if (
            course.type === "minor" &&
            selectedMinorId &&
            course.minorIndex !== undefined
        ) {
            const activeMinor = MINORS.find((m) => m.id === selectedMinorId);
            const minorCourse = activeMinor?.courses[course.minorIndex];
            if (minorCourse)
                return {
                    ...course,
                    ...minorCourse,
                    id: course.id,
                    originalId: minorCourse.id,
                };
        }

        if (
            course.type === "honors" &&
            selectedHonorsId &&
            course.honorsIndex !== undefined
        ) {
            const activeHonors = HONORS.find((h) => h.id === selectedHonorsId);
            const honorsCourse = activeHonors?.courses[course.honorsIndex];
            if (honorsCourse)
                return {
                    ...course,
                    ...honorsCourse,
                    id: course.id,
                    originalId: honorsCourse.id,
                };
        }

        return course;
    });
}

export function isMinorLabSlotVisible(
    course: Course,
    selectedMinorId: string | null,
    minors: Minor[] = MINORS
): boolean {
    if (course.type !== "minor" || course.minorIndex !== 5) return true;
    if (!selectedMinorId) return false;

    const selectedMinor = minors.find((m) => m.id === selectedMinorId);
    const labCourse = selectedMinor?.courses[5];

    return Boolean(labCourse && labCourse.credits === 1);
}

export function computeTakenCourses(
    allCourses: Course[],
    selections: Record<string, string>
): Set<string> {
    const taken = new Set<string>();
    allCourses.forEach((c) => c.type === "core" && taken.add(c.id));
    Object.values(selections).forEach((selId) => taken.add(selId));
    return taken;
}

export function computeDisabledMinorIds(
    takenCourses: Set<string>,
    minors: Minor[] = MINORS
): Set<string> {
    const disabled = new Set<string>();
    minors.forEach((minor) => {
        for (const course of minor.courses) {
            if (
                takenCourses.has(course.id) ||
                course.mutexIds?.some((id) => takenCourses.has(id))
            ) {
                disabled.add(minor.id);
                break;
            }
        }
    });
    return disabled;
}

export function computeDisabledOptionIds(
    allCourses: Course[],
    takenCoursesBase: Set<string>,
    selectedMinorId: string | null,
    selectedHonorsId: string | null
): Set<string> {
    const disabled = new Set<string>();
    const takenForElectives = new Set(takenCoursesBase);
    if (selectedMinorId)
        MINORS.find((m) => m.id === selectedMinorId)?.courses.forEach((c) =>
            takenForElectives.add(c.id)
        );
    if (selectedHonorsId)
        HONORS.find((h) => h.id === selectedHonorsId)?.courses.forEach((c) =>
            takenForElectives.add(c.id)
        );

    allCourses.forEach((course) => {
        if (course.type === "elective" && course.options) {
            course.options.forEach((option) => {
                if (
                    takenForElectives.has(option.id) ||
                    option.mutexIds?.some((id) => takenForElectives.has(id))
                ) {
                    disabled.add(option.id);
                }
            });
        }
    });
    return disabled;
}

export function computeActiveRelationships(
    activeCourseId: string | null,
    effectiveCourses: Course[]
): ActiveRelationships | null {
    if (!activeCourseId) return null;

    const activeCourse = effectiveCourses.find((c) => c.id === activeCourseId);
    if (!activeCourse) return null;
    const prereqs = new Set<string>();
    (activeCourse.prereqs || []).forEach((prereqId) => {
        const match = effectiveCourses.find(
            (c) =>
                c.id === prereqId ||
                (c as { originalId?: string }).originalId === prereqId
        );
        prereqs.add(match ? match.id : prereqId);
    });
    const postreqs = new Set<string>();

    effectiveCourses.forEach((c) => {
        const p = c.prereqs || [];
        if (
            p.includes(activeCourseId) ||
            ((activeCourse as any).originalId &&
                p.includes((activeCourse as any).originalId))
        ) {
            postreqs.add(c.id);
        }
    });

    return { prereqs, postreqs, activeId: activeCourseId };
}

export function getCourseStatus(
    courseId: string,
    relationships: ActiveRelationships | null
): CourseStatus {
    if (!relationships) return "default";
    if (courseId === relationships.activeId) return "hovered";
    if (relationships.prereqs.has(courseId)) return "prereq";
    if (relationships.postreqs.has(courseId)) return "postreq";
    return "default";
}
