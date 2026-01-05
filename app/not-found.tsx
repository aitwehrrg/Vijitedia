import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileQuestion, ArrowLeft } from "lucide-react";

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-center p-4 relative overflow-hidden selection:bg-indigo-100 selection:text-indigo-900">
            <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.3]">
                <svg
                    className="w-full h-full"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                >
                    <defs>
                        <linearGradient
                            id="grid-grad-error"
                            x1="0%"
                            y1="0%"
                            x2="100%"
                            y2="100%"
                        >
                            <stop
                                offset="0%"
                                stopColor="#64748b"
                                stopOpacity="0"
                            />
                            <stop
                                offset="50%"
                                stopColor="#64748b"
                                stopOpacity="0.3"
                            />
                            <stop
                                offset="100%"
                                stopColor="#64748b"
                                stopOpacity="0"
                            />
                        </linearGradient>
                    </defs>
                    <path
                        d="M10,20 C40,20 40,50 80,50"
                        fill="none"
                        stroke="url(#grid-grad-error)"
                        strokeWidth="0.5"
                    />
                    <circle
                        cx="80"
                        cy="50"
                        r="1"
                        fill="#64748b"
                        className="opacity-50"
                    />
                </svg>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-multiply"></div>
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage:
                            "radial-gradient(rgba(99, 102, 241, 0.1) 1px, transparent 1px)",
                        backgroundSize: "40px 40px",
                    }}
                ></div>
            </div>

            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-linear-to-tr from-indigo-500/20 via-purple-500/20 to-blue-500/20 blur-[120px] rounded-full pointer-events-none z-0"></div>

            <div className="bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 max-w-md w-full flex flex-col items-center space-y-6 relative z-10">
                <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center border border-indigo-100 shadow-inner">
                    <FileQuestion className="w-8 h-8 text-indigo-500" />
                </div>

                <div className="space-y-2">
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                        Page Not Found
                    </h1>
                    <p className="text-slate-500">
                        The academic resource you are looking for doesn't exist
                        or has been moved.
                    </p>
                </div>

                <div className="grid grid-cols-1 w-full gap-3">
                    <Button
                        asChild
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-md shadow-indigo-500/20"
                    >
                        <Link href="/">Return Home</Link>
                    </Button>
                    <Button
                        variant="outline"
                        asChild
                        className="w-full hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                    >
                        <Link href="/flowsheet" className="gap-2">
                            <ArrowLeft className="w-4 h-4" /> Go to Flowsheets
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
