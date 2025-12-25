import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { GraduationCap, ArrowRight, GitBranch, Calculator } from "lucide-react";

export default function Home() {
    return (
        <div className="min-h-screen bg-white flex flex-col font-sans">
            {/* HEADER */}
            <header className="border-b py-4">
                <div className="container mx-auto px-6 flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-xl text-slate-900">
                        <GraduationCap className="w-6 h-6 text-indigo-600" />
                        <span>Vijitedia</span>
                    </div>
                    <div className="flex gap-4">
                        <Button
                            variant="ghost"
                            asChild
                            className="hidden sm:flex"
                        >
                            <Link href="/flowsheet">Flowsheet</Link>
                        </Button>
                        <Button
                            variant="ghost"
                            asChild
                            className="hidden sm:flex"
                        >
                            <Link href="/calculator">Calculator</Link>
                        </Button>
                        <Button asChild>
                            <Link href="https://github.com" target="_blank">
                                GitHub
                            </Link>
                        </Button>
                    </div>
                </div>
            </header>

            {/* MAIN CONTENT */}
            <main className="flex-1 flex flex-col items-center justify-center p-6 space-y-12">
                <div className="text-center space-y-4 max-w-2xl">
                    <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
                        Academic Toolkit for VJTI
                    </h1>
                    <p className="text-lg text-slate-500">
                        Plan your VJTI engineering degree and track your grades
                        in one place.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6 w-full max-w-3xl">
                    {/* FLOWSHEET LINK */}
                    <Link href="/flowsheet" className="group">
                        <Card className="h-full hover:border-indigo-500 hover:shadow-md transition-all cursor-pointer">
                            <CardHeader>
                                <div className="mb-4 w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
                                    <GitBranch className="w-6 h-6" />
                                </div>
                                <CardTitle className="flex items-center gap-2 text-slate-900">
                                    Course Flowsheet
                                    <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-indigo-600" />
                                </CardTitle>
                                <CardDescription className="text-base mt-2">
                                    Visualize prerequisites, explore electives,
                                    and select your minor.
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    </Link>

                    {/* CALCULATOR LINK */}
                    <Link href="/calculator" className="group">
                        <Card className="h-full hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer">
                            <CardHeader>
                                <div className="mb-4 w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600">
                                    <Calculator className="w-6 h-6" />
                                </div>
                                <CardTitle className="flex items-center gap-2 text-slate-900">
                                    CGPA Calculator
                                    <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-emerald-600" />
                                </CardTitle>
                                <CardDescription className="text-base mt-2">
                                    Track your semester grades and predict your
                                    future CGPA.
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    </Link>
                </div>
            </main>

            {/* FOOTER
            <footer className="py-8 text-center text-sm text-slate-400 border-t bg-slate-50">
                &copy; {new Date().getFullYear()} Vijitedia. Built for
                engineers.
            </footer> */}
        </div>
    );
}
