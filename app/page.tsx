"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Calculator, GitBranch, Github, Network, ChevronDown } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { CourseCard } from "@/components/course-card";
import type { Course } from "@/types/flowsheet";
import { getGradeColor } from "@/lib/calculator";
import { GRADE_POINTS } from "@/data/grades";

const MOCK_COURSES = {
    DS: { id: "ds", type: "core", code: "R5CO1022T", title: "Data Structures", credits: 3, prereqs: [] } as Course,
    DAA: { id: "daa", type: "core", code: "R5IT2002T", title: "Algorithms (DAA)", credits: 3, prereqs: ["ds"] } as Course,
    AI: { id: "ai", type: "core", code: "R5IT2007T", title: "Artificial Intelligence", credits: 3, prereqs: ["daa"] } as Course,
    OS: { id: "os", type: "core", code: "R5IT2003T", title: "Operating Systems", credits: 3, prereqs: [] } as Course,
    CLOUD: { id: "cloud", type: "core", code: "R5IT3004T", title: "Cloud Computing", credits: 3, prereqs: ["os"] } as Course,
};

const FlowsheetPreview = () => {
    const [step, setStep] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setStep((s) => (s + 1) % 5);
        }, 1500);
        return () => clearInterval(interval);
    }, []);

    const getStatus = (courseId: string): "default" | "hovered" | "prereq" | "postreq" => {
        if (step === 0) { // DS hovered
            if (courseId === "ds") return "hovered";
            if (courseId === "daa") return "postreq";
        } else if (step === 1) { // DAA hovered
            if (courseId === "daa") return "hovered";
            if (courseId === "ds") return "prereq";
            if (courseId === "ai") return "postreq";
        } else if (step === 2) { // AI hovered
            if (courseId === "ai") return "hovered";
            if (courseId === "daa") return "prereq";
        } else if (step === 3) { // OS hovered
            if (courseId === "os") return "hovered";
            if (courseId === "cloud") return "postreq";
        } else if (step === 4) { // CLOUD hovered
            if (courseId === "cloud") return "hovered";
            if (courseId === "os") return "prereq";
        }
        return "default";
    };

    return (
        <div className="relative w-full min-h-[400px] h-full bg-white dark:bg-slate-950 rounded-2xl border border-border p-3 sm:p-6 shadow-xl flex flex-col justify-center items-center">
            {/* Background grid pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none rounded-2xl"></div>

            <div className="grid grid-cols-3 gap-2 sm:gap-6 w-full h-full max-h-[300px] relative z-10 pointer-events-none">
                {/* SVG connection lines matching grid layout */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible" style={{ zIndex: -1 }}>
                    <defs>
                        <marker id="arrow-prereq" viewBox="0 0 12 12" refX="10" refY="6" markerWidth="8" markerHeight="8" orient="auto-start-reverse" className="text-amber-500 dark:text-amber-400">
                            <path d="M0,0 L12,6 L0,12 L3,6 z" fill="currentColor" />
                        </marker>
                        <marker id="arrow-postreq" viewBox="0 0 12 12" refX="10" refY="6" markerWidth="8" markerHeight="8" orient="auto-start-reverse" className="text-blue-500 dark:text-blue-400">
                            <path d="M0,0 L12,6 L0,12 L3,6 z" fill="currentColor" />
                        </marker>
                    </defs>
                    
                    {/* DS to DAA (Col 1 to Col 2) */}
                    <path d="M 32% 25% C 40% 25%, 40% 25%, 48% 25%" fill="none" stroke="currentColor" strokeWidth="2"
                        markerEnd="url(#arrow-postreq)"
                        className={`transition-all duration-300 text-blue-500 dark:text-blue-400 ${step === 0 ? 'opacity-80' : 'opacity-0'}`} />
                    <path d="M 32% 25% C 40% 25%, 40% 25%, 48% 25%" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="5,5"
                        markerEnd="url(#arrow-prereq)"
                        className={`transition-all duration-300 text-amber-500 dark:text-amber-400 ${step === 1 ? 'opacity-80' : 'opacity-0'}`} />

                    {/* DAA to AI (Col 2 to Col 3) */}
                    <path d="M 65% 25% C 73% 25%, 73% 25%, 81% 25%" fill="none" stroke="currentColor" strokeWidth="2"
                        markerEnd="url(#arrow-postreq)"
                        className={`transition-all duration-300 text-blue-500 dark:text-blue-400 ${step === 1 ? 'opacity-80' : 'opacity-0'}`} />
                    <path d="M 65% 25% C 73% 25%, 73% 25%, 81% 25%" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="5,5"
                        markerEnd="url(#arrow-prereq)"
                        className={`transition-all duration-300 text-amber-500 dark:text-amber-400 ${step === 2 ? 'opacity-80' : 'opacity-0'}`} />

                    {/* OS to CLOUD (Col 1 to Col 2, Row 2) */}
                    <path d="M 32% 75% C 40% 75%, 40% 75%, 48% 75%" fill="none" stroke="currentColor" strokeWidth="2"
                        markerEnd="url(#arrow-postreq)"
                        className={`transition-all duration-300 text-blue-500 dark:text-blue-400 ${step === 3 ? 'opacity-80' : 'opacity-0'}`} />
                    <path d="M 32% 75% C 40% 75%, 40% 75%, 48% 75%" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="5,5"
                        markerEnd="url(#arrow-prereq)"
                        className={`transition-all duration-300 text-amber-500 dark:text-amber-400 ${step === 4 ? 'opacity-80' : 'opacity-0'}`} />
                </svg>

                {/* Col 1 */}
                <div className="flex flex-col justify-around gap-2 sm:gap-4 h-full">
                    <div className="h-28 sm:h-32"><CourseCard course={MOCK_COURSES.DS} status={getStatus("ds")} /></div>
                    <div className="h-28 sm:h-32"><CourseCard course={MOCK_COURSES.OS} status={getStatus("os")} /></div>
                </div>
                {/* Col 2 */}
                <div className="flex flex-col justify-around gap-2 sm:gap-4 h-full">
                    <div className="h-28 sm:h-32"><CourseCard course={MOCK_COURSES.DAA} status={getStatus("daa")} /></div>
                    <div className="h-28 sm:h-32"><CourseCard course={MOCK_COURSES.CLOUD} status={getStatus("cloud")} /></div>
                </div>
                {/* Col 3 */}
                <div className="flex flex-col justify-around gap-2 sm:gap-4 h-full">
                    <div className="h-28 sm:h-32"><CourseCard course={MOCK_COURSES.AI} status={getStatus("ai")} /></div>
                    <div className="h-28 sm:h-32"></div>
                </div>
            </div>
        </div>
    );
};


const CalculatorPreview = () => {
    const [step, setStep] = useState(0);
    const steps = [
        { g1: "BB", g2: "BC", g3: "CC" },
        { g1: "AB", g2: "BC", g3: "BB" },
        { g1: "AA", g2: "AB", g3: "BB" },
        { g1: "AA", g2: "AA", g3: "AA" },
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setStep((s) => (s + 1) % steps.length);
        }, 1800);
        return () => clearInterval(interval);
    }, []);

    const current = steps[step];
    const credits = [4, 3, 2];
    const earned = GRADE_POINTS[current.g1] * credits[0] + GRADE_POINTS[current.g2] * credits[1] + GRADE_POINTS[current.g3] * credits[2];
    const totalCredits = credits[0] + credits[1] + credits[2];
    const sgpa = (earned / totalCredits).toFixed(2);


    return (
        <div className="relative w-full min-h-[400px] h-full bg-white dark:bg-slate-950 rounded-2xl border border-border p-6 shadow-xl overflow-hidden flex flex-col justify-center items-center">
             {/* Background dots */}
             <div className="absolute inset-0 bg-[radial-gradient(#80808020_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none"></div>
             
             <div className="relative w-full max-w-sm bg-slate-50 dark:bg-slate-900 rounded-xl border border-border p-5 shadow-sm mt-4">
                <div className="flex justify-between items-center mb-5 border-b border-border pb-3">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100">Semester III</h3>
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Calculated SGPA</span>
                        <Badge variant="outline" className="font-mono text-lg transition-all duration-300 bg-background shadow-sm px-3 py-0.5 mt-1 border-indigo-500/30 text-indigo-700 dark:text-indigo-400">
                            {sgpa}
                        </Badge>
                    </div>
                </div>
                
                <div className="space-y-3">
                    {/* Mocked CourseRow 1 */}
                    <div className="flex items-center justify-between gap-3 group p-2 rounded-lg transition-all">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                                <span className="font-bold text-sm text-foreground font-mono truncate">
                                    R5MA2001T
                                </span>
                                <span className="text-xs text-muted-foreground shrink-0 bg-secondary px-1 rounded">
                                    {credits[0]} Cr
                                </span>
                            </div>
                            <div className="text-sm text-muted-foreground truncate font-medium">
                                Discrete Mathematics
                            </div>
                        </div>
                        <div className={`w-[75px] h-9 flex justify-center items-center rounded-md border text-sm font-mono transition-colors duration-500 ${getGradeColor(current.g1)}`}>
                            {current.g1} <ChevronDown className="w-3 h-3 ml-2 opacity-50"/>
                        </div>
                    </div>
                    {/* Mocked CourseRow 2 */}
                    <div className="flex items-center justify-between gap-3 group p-2 rounded-lg transition-all">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                                <span className="font-bold text-sm text-foreground font-mono truncate">
                                    R5CO1022T
                                </span>
                                <span className="text-xs text-muted-foreground shrink-0 bg-secondary px-1 rounded">
                                    {credits[1]} Cr
                                </span>
                            </div>
                            <div className="text-sm text-muted-foreground truncate font-medium">
                                Data Structures
                            </div>
                        </div>
                        <div className={`w-[75px] h-9 flex justify-center items-center rounded-md border text-sm font-mono transition-colors duration-500 ${getGradeColor(current.g2)}`}>
                            {current.g2} <ChevronDown className="w-3 h-3 ml-2 opacity-50"/>
                        </div>
                    </div>
                    {/* Mocked CourseRow 3 */}
                    <div className="flex items-center justify-between gap-3 group p-2 rounded-lg transition-all">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                                <span className="font-bold text-sm text-foreground font-mono truncate">
                                    R5IT2001T
                                </span>
                                <span className="text-xs text-muted-foreground shrink-0 bg-secondary px-1 rounded">
                                    {credits[2]} Cr
                                </span>
                            </div>
                            <div className="text-sm text-muted-foreground truncate font-medium">
                                MDM-I
                            </div>
                        </div>
                        <div className={`w-[75px] h-9 flex justify-center items-center rounded-md border text-sm font-mono transition-colors duration-500 ${getGradeColor(current.g3)}`}>
                            {current.g3} <ChevronDown className="w-3 h-3 ml-2 opacity-50"/>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function Home() {
    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden selection:bg-indigo-100 selection:text-indigo-900 dark:selection:text-indigo-100 dark:selection:bg-indigo-900">
            {/* The abstract geometric background elements from original.tsx */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.4]">
                <svg
                    className="w-full h-full"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                >
                    <defs>
                        <linearGradient
                            id="grid-grad-main"
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
                        d="M10,20 C40,20 40,50 80,50"
                        fill="none"
                        stroke="url(#grid-grad-main)"
                        strokeWidth="0.5"
                    />
                    <path
                        d="M10,80 C30,80 30,50 80,50"
                        fill="none"
                        stroke="url(#grid-grad-main)"
                        strokeWidth="0.5"
                    />
                    <path
                        d="M30,10 C30,40 60,40 60,70"
                        fill="none"
                        stroke="url(#grid-grad-main)"
                        strokeWidth="0.5"
                    />

                    <circle
                        cx="10"
                        cy="20"
                        r="1"
                        fill="#6366f1"
                        className="opacity-50"
                    />
                    <circle
                        cx="80"
                        cy="50"
                        r="1"
                        fill="#6366f1"
                        className="opacity-50"
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

            <header className="relative z-10 border-b border-border bg-background/50 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-xl tracking-tighter text-foreground">
                        <div className="p-1.5 bg-indigo-50 rounded-lg">
                            <Network className="w-5 h-5 text-indigo-600" />
                        </div>
                        <span>Vijitedia</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm font-medium text-muted-foreground">
                        <ThemeToggle />
                        <Button asChild>
                            <Link
                                href="https://github.com/aitwehrrg/Vijitedia"
                                target="_blank"
                            >
                                <Github /> <span className="hidden sm:inline">GitHub</span>
                            </Link>
                        </Button>
                    </div>
                </div>
            </header>

            <main className="flex-1 relative z-10 flex flex-col items-center justify-center p-6 text-center">
                <div className="py-12 md:py-20">
                    <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight mb-6 max-w-4xl mx-auto leading-[1.1] text-foreground text-left">
                        Visualize Your <br />
                        <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-600 via-violet-600 to-indigo-600 animate-gradient-x dark:from-indigo-400 dark:via-violet-400 dark:to-indigo-400">
                            Engineering Path
                        </span>
                    </h1>

                    <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed text-left">
                        The interactive directed graph for your VJTI degree. Trace
                        prerequisites, map out electives, and visualize dependencies
                        in real-time.
                    </p>
                </div>

                {/* FLOWSHEET SECTION */}
                <section className="w-full -mx-6 px-6">
                    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center text-left">
                        <div className="flex flex-col items-start space-y-6">
                            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                                Interactive Flowsheet
                            </h2>
                            <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-lg">
                                Visualize your exact 4-year journey at VJTI. See how courses interconnect, instantly identify prerequisites, and map out your honors and minor programs with absolute precision.
                            </p>
                            <div className="pt-4">
                                <Link href="/flowsheet">
                                    <Button size="lg" className="h-14 px-8 text-base rounded-full shadow-lg bg-purple-600 hover:bg-purple-700 text-white shadow-purple-500/20 hover:shadow-purple-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all font-semibold">
                                        <GitBranch className="w-4 h-4 mr-2 inline" /> 
                                        Open Flowsheet <ArrowRight className="ml-2 w-5 h-5" />
                                    </Button>
                                </Link>
                            </div>
                        </div>
                        <div className="w-full h-full">
                            <FlowsheetPreview />
                        </div>
                    </div>
                </section>

                {/* CALCULATOR SECTION */}
                <section className="w-full py-8 md:py-12 -mx-6 px-6">
                    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center text-left">
                        <div className="w-full h-full order-2 lg:order-1">
                            <CalculatorPreview />
                        </div>
                        <div className="flex flex-col items-start space-y-6 order-1 lg:order-2">
                            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                                CGPA Calculator
                            </h2>
                            <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-lg">
                                Built for VJTI's grading scheme (AA to FF). Instantly calculate your semester SGPA, compute your cumulative CGPA, and predict the effort needed to maintain a certain threshold for future semesters.
                            </p>
                            <div className="pt-4">
                                <Link href="/calculator">
                                    <Button size="lg" variant="outline" className="h-14 px-8 text-base rounded-full border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 shadow-sm hover:bg-emerald-50 dark:hover:bg-emerald-950/50 hover:border-emerald-300 dark:hover:border-emerald-700 hover:scale-[1.02] active:scale-[0.98] transition-all font-semibold">
                                        <Calculator className="w-4 h-4 mr-2 inline" /> 
                                        Open Calculator <ArrowRight className="ml-2 w-5 h-5" />
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
                
            </main>

            <footer className="w-full py-6 text-center text-sm text-muted-foreground border-t border-border bg-background relative z-10">
                <p>
                    Built by{" "}
                    <a
                        href="https://github.com/aitwehrrg"
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline decoration-indigo-500/50 underline-offset-4 transition-colors"
                    >
                        @aitwehrrg
                    </a>
                    .
                </p>
            </footer>
        </div>
    );
}
