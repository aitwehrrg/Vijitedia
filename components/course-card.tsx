import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRightFromLine, Circle, Lock } from "lucide-react";
import { Course } from "@/types/flowsheet";

export type CourseStatus = "default" | "hovered" | "prereq" | "postreq";

interface CourseCardProps {
    course: Course;
    status: CourseStatus;
}

export function CourseCard({ course, status }: CourseCardProps) {
    const styles = {
        default: "border-l-transparent hover:border-l-slate-400 opacity-100",
        hovered:
            "border-l-primary ring-1 ring-primary ring-offset-2 bg-slate-50 shadow-md scale-[1.03] z-10",
        prereq: "border-l-amber-500 bg-amber-50 ring-1 ring-amber-200 dashed-border",
        postreq: "border-l-blue-500 bg-blue-50 ring-1 ring-blue-200",
    };

    const StatusIcon = () => {
        switch (status) {
            case "prereq":
                return <Lock className="w-3 h-3 text-amber-600 mr-1.5" />;
            case "postreq":
                return (
                    <ArrowRightFromLine className="w-3 h-3 text-blue-600 mr-1.5" />
                );
            case "hovered":
                return (
                    <Circle className="w-3 h-3 text-primary fill-primary mr-1.5" />
                );
            default:
                return null;
        }
    };

    return (
        <Card
            className={`h-full flex flex-col justify-between border-l-4 transition-all duration-200 cursor-pointer shadow-sm overflow-hidden ${styles[status]}`}
        >
            <CardHeader className="p-3 pb-2 space-y-0 shrink-0">
                <div className="flex justify-between items-start gap-2">
                    <Badge
                        variant={status === "default" ? "outline" : "secondary"}
                        className="h-6 px-2 font-mono text-sm font-bold tracking-tight flex items-center shrink-0"
                    >
                        <StatusIcon />
                        {course.code || "??"}
                    </Badge>

                    <div className="flex flex-col items-end shrink-0">
                        <span className="text-sm font-bold text-slate-700 font-mono bg-slate-100 px-1.5 py-0.5 rounded-md border border-slate-200">
                            {course.credits || 0}
                        </span>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-3 pt-0 grow flex items-center min-h-0">
                <CardTitle
                    className="text-xs sm:text-sm font-medium leading-snug text-slate-800 line-clamp-3"
                    title={course.title}
                >
                    {course.title || "Untitled Course"}
                </CardTitle>
            </CardContent>
        </Card>
    );
}
