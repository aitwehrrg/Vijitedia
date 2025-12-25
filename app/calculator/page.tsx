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

export default function CalculatorLanding() {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8">
            <div className="max-w-2xl w-full space-y-8">
                <div className="text-center space-y-2">
                    <div className="flex justify-center mb-4">
                        <div className="p-3 bg-indigo-100 rounded-full">
                            <Calculator className="w-8 h-8 text-indigo-600" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                        CGPA Calculator
                    </h1>
                    <p className="text-slate-500">
                        Select your program to compute semester and cumulative
                        GPA.
                    </p>
                </div>

                <div className="grid gap-4">
                    {FLOWSHEET_DATA.map((program) => (
                        <Link
                            key={program.id}
                            href={`/calculator/${program.id}`}
                        >
                            <Card className="hover:border-indigo-500 hover:shadow-md transition-all cursor-pointer group border-l-4 border-l-transparent hover:border-l-indigo-500">
                                <CardHeader className="flex flex-row items-center justify-between p-6">
                                    <div>
                                        <CardTitle className="group-hover:text-indigo-600 transition-colors">
                                            {program.name}
                                        </CardTitle>
                                        <CardDescription>
                                            {program.department}
                                        </CardDescription>
                                    </div>
                                    <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                                </CardHeader>
                            </Card>
                        </Link>
                    ))}
                </div>

                <div className="text-center">
                    <Link
                        href="/flowsheet"
                        className="text-sm text-slate-400 hover:text-indigo-600 hover:underline"
                    >
                        Go to Flowsheets
                    </Link>
                </div>
            </div>
        </div>
    );
}

export const metadata: Metadata = {
    title: "CGPA Calculators",
};
