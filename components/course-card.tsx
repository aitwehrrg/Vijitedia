import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    ArrowLeftFromLine,
    ArrowRightFromLine,
    Circle,
    Lock,
} from "lucide-react";

export type CourseStatus = "default" | "hovered" | "prereq" | "postreq";

interface CourseCardProps {
    course: {
        code: string;
        title: string;
        credits: number;
    };
    status: CourseStatus;
}

export function CourseCard({ course, status }: CourseCardProps) {
    // Visual Styles Mapping
    const styles = {
        default: "border-l-transparent hover:border-l-slate-400 opacity-100",
        hovered:
            "border-l-primary ring-2 ring-primary ring-offset-1 bg-slate-50 shadow-lg scale-[1.02]",
        prereq: "border-l-amber-500 bg-amber-50/80 dashed-border", // Required BEFORE
        postreq: "border-l-blue-500 bg-blue-50/80", // Unlocked AFTER
    };

    // Icon Mapping
    const StatusIcon = () => {
        switch (status) {
            case "prereq":
                return <Lock className="w-3 h-3 text-amber-600 mr-1" />;
            case "postreq":
                return (
                    <ArrowRightFromLine className="w-3 h-3 text-blue-600 mr-1" />
                );
            case "hovered":
                return (
                    <Circle className="w-3 h-3 text-primary fill-primary mr-1" />
                );
            default:
                return null;
        }
    };

    return (
        <Card
            className={`h-full border-l-4 transition-all duration-200 cursor-pointer ${styles[status]}`}
        >
            <CardHeader className="p-3 pb-1">
                <div className="flex justify-between items-start">
                    <Badge
                        variant={status === "default" ? "outline" : "secondary"}
                        className="font-mono font-bold text-[10px] flex items-center"
                    >
                        <StatusIcon />
                        {course.code}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground font-mono">
                        {course.credits} Cr
                    </span>
                </div>
            </CardHeader>
            <CardContent className="p-3 pt-1">
                <CardTitle className="text-sm font-medium leading-tight">
                    {course.title}
                </CardTitle>
            </CardContent>
        </Card>
    );
}
