import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRightFromLine, Circle, Lock } from "lucide-react";
import { Course } from "@/types/flowsheet";

export type CourseStatus = "default" | "hovered" | "prereq" | "postreq";

interface CourseCardProps {
    course: Course;
    status: CourseStatus;
    className?: string;
}

export function CourseCard({ course, status, className }: CourseCardProps) {
    const styles = {
        default: "border-l-border hover:border-l-slate-400 dark:hover:border-l-slate-600 opacity-100 bg-card",
        hovered:
            "border-l-primary ring-1 ring-primary ring-offset-2 bg-muted shadow-md scale-[1.03] z-10",
        prereq: "border-l-amber-500 bg-amber-50 dark:bg-amber-500/10 ring-1 ring-amber-200 dark:ring-amber-500/30 dashed-border",
        postreq: "border-l-blue-500 bg-blue-50 dark:bg-blue-500/10 ring-1 ring-blue-200 dark:ring-blue-500/30",
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
            className={`h-full flex flex-col justify-between border-l-4 transition-all duration-200 cursor-pointer overflow-hidden ${styles[status]} ${className || ""}`}
        >
            <CardHeader className="p-4 pb-2 md:p-3 md:pb-2 space-y-0 shrink-0">
                <div className="flex justify-between items-start gap-2">
                    <Badge
                        variant={status === "default" ? "outline" : "secondary"}
                        className="h-7 px-3 md:h-6 md:px-2 font-mono text-base md:text-sm font-bold tracking-tight flex items-center shrink-0"
                    >
                        <StatusIcon />
                        {course.code || "??"}
                    </Badge>

                    <div className="flex flex-col items-end shrink-0">
                        <span className="text-base md:text-sm font-bold text-foreground font-mono bg-muted px-2 py-1 md:px-1.5 md:py-0.5 rounded-md border border-border">
                            {course.credits || 0}
                        </span>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-4 pt-0 md:p-3 md:pt-0 grow flex items-center min-h-0">
                <CardTitle
                    className="text-base md:text-xs xl:text-sm font-medium leading-snug text-foreground line-clamp-3"
                    title={course.title}
                >
                    {course.title || "Untitled Course"}
                </CardTitle>
            </CardContent>
        </Card>
    );
}
