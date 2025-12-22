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
    const styles = {
        default: "border-l-transparent hover:border-l-slate-400 opacity-100",
        hovered:
            "border-l-primary ring-1 ring-primary ring-offset-0 bg-slate-50 shadow-md scale-[1.02] z-10",
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
            className={`h-full border-l-[3px] transition-all duration-200 cursor-pointer ${styles[status]}`}
        >
            <CardHeader className="p-2 pb-0 space-y-0">
                <div className="flex justify-between items-start gap-1">
                    <Badge
                        variant={status === "default" ? "outline" : "secondary"}
                        className="font-mono font-bold text-[9px] h-4 px-1 flex items-center shrink-0"
                    >
                        <StatusIcon />
                        {course.code}
                    </Badge>
                    <span className="text-[9px] text-muted-foreground font-mono shrink-0 pt-0.5">
                        {course.credits}
                    </span>
                </div>
            </CardHeader>
            <CardContent className="p-2 pt-1">
                <CardTitle className="text-xs font-medium leading-tight line-clamp-2">
                    {course.title}
                </CardTitle>
            </CardContent>
        </Card>
    );
}
