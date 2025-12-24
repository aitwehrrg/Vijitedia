import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRightFromLine, Circle, Lock } from "lucide-react";
// Import the central type definition
import { Course } from "@/types/flowsheet";

export type CourseStatus = "default" | "hovered" | "prereq" | "postreq";

interface CourseCardProps {
    course: Course; // Use the shared type instead of a hardcoded object
    status: CourseStatus;
}

export function CourseCard({ course, status }: CourseCardProps) {
    const styles = {
        default: "border-l-transparent hover:border-l-slate-400 opacity-100",
        hovered:
            "border-l-primary ring-1 ring-primary ring-offset-1 bg-slate-50 shadow-sm scale-[1.02]",
        prereq: "border-l-amber-500 bg-amber-50/80 dashed-border",
        postreq: "border-l-blue-500 bg-blue-50/80",
    };

    const StatusIcon = () => {
        switch (status) {
            case "prereq":
                return <Lock className="w-2.5 h-2.5 text-amber-600 mr-1" />;
            case "postreq":
                return (
                    <ArrowRightFromLine className="w-2.5 h-2.5 text-blue-600 mr-1" />
                );
            case "hovered":
                return (
                    <Circle className="w-2.5 h-2.5 text-primary fill-primary mr-1" />
                );
            default:
                return null;
        }
    };

    return (
        <Card
            className={`h-full border-l-[3px] transition-all duration-200 cursor-pointer shadow-none ${styles[status]}`}
        >
            <CardHeader className="p-2 pb-1 space-y-0">
                <div className="flex justify-between items-center">
                    <Badge
                        variant={status === "default" ? "outline" : "secondary"}
                        className="h-5 px-1 font-mono font-bold text-[9px] flex items-center"
                    >
                        <StatusIcon />
                        {/* Fallback to '??' if code is undefined (though it shouldn't be for core courses) */}
                        {course.code || "??"}
                    </Badge>
                    <span className="text-[9px] text-muted-foreground font-mono">
                        {course.credits || 0}
                    </span>
                </div>
            </CardHeader>
            <CardContent className="p-2 pt-1">
                <CardTitle className="text-xs font-medium leading-tight line-clamp-2">
                    {course.title || "Untitled Course"}
                </CardTitle>
            </CardContent>
        </Card>
    );
}
