import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    ArrowRight,
    GitBranch,
    Calculator,
    Github,
    Network,
} from "lucide-react";

export default function Home() {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col relative overflow-hidden selection:bg-indigo-100 selection:text-indigo-900">
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

            <header className="relative z-10 border-b border-slate-200 bg-white/50 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-xl tracking-tighter text-slate-900">
                        <div className="p-1.5 bg-indigo-50 rounded-lg">
                            <Network className="w-5 h-5 text-indigo-600" />
                        </div>
                        <span>Vijitedia</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm font-medium text-slate-500">
                        <Button asChild>
                            <Link
                                href="https://github.com/aitwehrrg/Vijitedia"
                                target="_blank"
                            >
                                <Github /> GitHub
                            </Link>
                        </Button>
                    </div>
                </div>
            </header>

            <main className="flex-1 relative z-10 flex flex-col items-center justify-center p-6 text-center">
                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 max-w-4xl mx-auto leading-[1.1] text-slate-900 text-left">
                    Visualize Your <br />
                    <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-600 via-violet-600 to-indigo-600 animate-gradient-x">
                        Engineering Path
                    </span>
                </h1>

                <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
                    The interactive directed graph for your degree. Trace
                    prerequisites, map out electives, and visualize dependencies
                    in real-time.
                </p>

                <div className="group relative inline-flex shadow-xl shadow-indigo-500/20">
                    <div className="absolute transition-all duration-1000 opacity-70 -inset-px bg-linear-to-r from-indigo-500 via-purple-500 to-indigo-500 rounded-xl blur-lg group-hover:opacity-100 group-hover:-inset-1 group-hover:duration-200 animate-tilt"></div>
                    <Link href="/flowsheet">
                        <Button
                            size="lg"
                            className="relative h-14 px-8 text-lg bg-indigo-600 text-white rounded-xl font-bold border border-indigo-500 hover:bg-indigo-700 transition-all"
                        >
                            <GitBranch className="w-5 h-5 mr-2 text-indigo-100" />
                            Launch Flowsheet
                            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </Link>
                </div>

                <div className="mt-16 flex flex-col items-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                    <div className="h-12 w-px bg-linear-to-b from-transparent via-slate-300 to-transparent"></div>

                    <div className="flex items-center gap-6 p-4 rounded-2xl border border-slate-200 bg-white/60 backdrop-blur-sm hover:bg-white hover:shadow-md transition-all">
                        <div className="flex flex-col text-left">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                                Utility Addon
                            </span>
                            <span className="text-xs sm:text-sm font-semibold text-slate-700 flex items-center gap-2">
                                <Calculator className="w-4 h-4 text-emerald-500" />
                                CGPA Calculator & Predictor
                            </span>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            className="text-slate-500 hover:text-indigo-600 hover:bg-indigo-50"
                        >
                            <Link href="/calculator">Try it &rarr;</Link>
                        </Button>
                    </div>
                </div>
            </main>

            <footer className="w-full py-6 text-center text-sm text-slate-400 border-t border-slate-200 bg-slate-50 relative z-10">
                <p>
                    Built by{" "}
                    <a
                        href="https://github.com/aitwehrrg"
                        target="_blank"
                        rel="noreferrer"
                    >
                        @aitwehrrg
                    </a>
                    .
                </p>
            </footer>
        </div>
    );
}
