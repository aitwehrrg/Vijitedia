import Link from "next/link";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { FLOWSHEET_DATA } from "@/data/programs";
import { ArrowRight, Workflow } from "lucide-react";
import { Metadata } from "next";
import { ThemeToggle } from "@/components/theme-toggle";

export const metadata: Metadata = {
    title: "Academic Flowsheets",
};

export default function FlowsheetLanding() {
    const groupedPrograms = FLOWSHEET_DATA.reduce(
        (acc, program) => {
            const dept = program.department;
            if (!acc[dept]) {
                acc[dept] = [];
            }
            acc[dept].push(program);
            return acc;
        },
        {} as Record<string, typeof FLOWSHEET_DATA>
    );

    const sortedDepartments = Object.keys(groupedPrograms).sort();

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 sm:p-8 relative overflow-hidden selection:bg-indigo-100 selection:text-indigo-900 dark:selection:bg-indigo-900 dark:selection:text-indigo-100">
            <div className="absolute top-4 right-4 md:top-8 md:right-8 z-50">
                <ThemeToggle />
            </div>
            <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.4] dark:opacity-[0.1]">
                <svg
                    className="w-full h-full"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                >
                    <defs>
                        <linearGradient
                            id="grid-grad-indigo-light"
                            x1="0%"
                            y1="0%"
                            x2="100%"
                            y2="100%"
                        >
                            <stop
                                offset="0%"
                                stopColor="#6366f1"
                                stopOpacity="0"
                            />
                            <stop
                                offset="50%"
                                stopColor="#6366f1"
                                stopOpacity="0.4"
                            />
                            <stop
                                offset="100%"
                                stopColor="#6366f1"
                                stopOpacity="0"
                            />
                        </linearGradient>
                    </defs>
                    <path
                        d="M20,10 C20,40 50,40 50,70"
                        fill="none"
                        stroke="url(#grid-grad-indigo-light)"
                        strokeWidth="0.5"
                    />
                    <path
                        d="M80,10 C80,40 50,40 50,70"
                        fill="none"
                        stroke="url(#grid-grad-indigo-light)"
                        strokeWidth="0.5"
                    />
                </svg>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-multiply"></div>
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage:
                            "radial-gradient(rgba(99, 102, 241, 0.15) 1px, transparent 1px)",
                        backgroundSize: "40px 40px",
                    }}
                ></div>
            </div>

            <div className="max-w-3xl w-full space-y-12 relative z-10">
                <div className="text-center space-y-6">
                    <div className="flex justify-center mb-4">
                        <div className="p-4 bg-card rounded-2xl border border-indigo-100 dark:border-indigo-900/50 shadow-xl shadow-indigo-500/5">
                            <Workflow className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
                            Academic{" "}
                            <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                                Flowsheets
                            </span>
                        </h1>
                        <p className="text-lg text-muted-foreground max-w-md mx-auto">
                            Select an engineering program to view its
                            interactive curriculum map.
                        </p>
                    </div>
                </div>

                <div className="space-y-10">
                    {sortedDepartments.map((department) => (
                        <div key={department} className="space-y-4">
                            <h2 className="text-xl font-bold text-foreground border-l-4 border-indigo-500 pl-3">
                                {department}
                            </h2>
                            <div className="grid gap-4 md:grid-cols-2">
                                {groupedPrograms[department].map((program) => (
                                    <Link
                                        key={program.id}
                                        href={`/flowsheet/${program.id}`}
                                        className="block h-full"
                                    >
                                        <Card className="h-full bg-card border-border hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/10 transition-all cursor-pointer group">
                                            <CardHeader className="flex flex-row items-center justify-between p-6">
                                                <div>
                                                    <CardTitle className="text-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors text-lg">
                                                        {program.name}
                                                    </CardTitle>
                                                    <CardDescription className="text-muted-foreground mt-1 text-sm">
                                                        View Curriculum
                                                    </CardDescription>
                                                </div>
                                                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950/50 transition-colors shrink-0 ml-4">
                                                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
                                                </div>
                                            </CardHeader>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="text-center pt-8 pb-4">
                    <Link
                        href="/"
                        className="text-sm text-muted-foreground hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline transition-colors"
                    >
                        Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
