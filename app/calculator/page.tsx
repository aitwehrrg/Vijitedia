import Link from "next/link";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { FLOWSHEET_DATA } from "@/data/programs";
import { Calculator, ArrowRight } from "lucide-react";
import { Metadata } from "next";
import { ThemeToggle } from "@/components/theme-toggle";

export const metadata: Metadata = {
    title: "CGPA Calculators",
};

export default function CalculatorLanding() {
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
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 sm:p-8 relative overflow-hidden selection:bg-emerald-100 selection:text-emerald-900 dark:selection:bg-emerald-900 dark:selection:text-emerald-100">
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
                            id="grid-grad-green-light"
                            x1="0%"
                            y1="0%"
                            x2="100%"
                            y2="100%"
                        >
                            <stop
                                offset="0%"
                                stopColor="#10b981"
                                stopOpacity="0"
                            />
                            <stop
                                offset="50%"
                                stopColor="#10b981"
                                stopOpacity="0.4"
                            />
                            <stop
                                offset="100%"
                                stopColor="#10b981"
                                stopOpacity="0"
                            />
                        </linearGradient>
                    </defs>
                    <path
                        d="M10,20 C40,20 40,50 80,50"
                        fill="none"
                        stroke="url(#grid-grad-green-light)"
                        strokeWidth="0.5"
                    />
                    <path
                        d="M10,80 C30,80 30,50 80,50"
                        fill="none"
                        stroke="url(#grid-grad-green-light)"
                        strokeWidth="0.5"
                    />
                    <circle
                        cx="80"
                        cy="50"
                        r="1"
                        fill="#10b981"
                        className="opacity-50"
                    />
                </svg>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-multiply"></div>
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage:
                            "radial-gradient(rgba(16, 185, 129, 0.15) 1px, transparent 1px)",
                        backgroundSize: "40px 40px",
                    }}
                ></div>
            </div>

            <div className="max-w-3xl w-full space-y-12 relative z-10">
                <div className="text-center space-y-6">
                    <div className="flex justify-center mb-4">
                        <div className="p-4 bg-card rounded-2xl border border-emerald-100 dark:border-emerald-900/50 shadow-xl shadow-emerald-500/5">
                            <Calculator className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
                            CGPA{" "}
                            <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-400">
                                Calculator
                            </span>
                        </h1>
                        <p className="text-lg text-muted-foreground max-w-md mx-auto">
                            Select your program to track semester grades and
                            predict your academic targets.
                        </p>
                    </div>
                </div>

                <div className="space-y-10">
                    {sortedDepartments.map((department) => (
                        <div key={department} className="space-y-4">
                            <h2 className="text-xl font-bold text-foreground border-l-4 border-emerald-500 pl-3">
                                {department}
                            </h2>
                            <div className="grid gap-4 md:grid-cols-2">
                                {groupedPrograms[department].map((program) => (
                                    <Link
                                        key={program.id}
                                        href={`/calculator/${program.id}`}
                                        className="block h-full"
                                    >
                                        <Card className="h-full bg-card border-border hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/10 transition-all cursor-pointer group">
                                            <CardHeader className="flex flex-row items-center justify-between p-6">
                                                <div>
                                                    <CardTitle className="text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors text-lg">
                                                        {program.name}
                                                    </CardTitle>
                                                    <CardDescription className="text-muted-foreground mt-1 text-sm">
                                                        Calculate CGPA/SGPA
                                                    </CardDescription>
                                                </div>
                                                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center group-hover:bg-emerald-50 dark:group-hover:bg-emerald-950/50 transition-colors shrink-0 ml-4">
                                                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
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
                        className="text-sm text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 hover:underline transition-colors"
                    >
                        Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
