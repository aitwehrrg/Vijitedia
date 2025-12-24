import Link from "next/link";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { FLOWSHEET_DATA } from "@/data/programs";
import { ArrowRight } from "lucide-react";

export default function FlowsheetLanding() {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8">
            <div className="max-w-2xl w-full space-y-8">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                        Academic Flowsheets
                    </h1>
                    <p className="text-slate-500">
                        Select an engineering program to view its curriculum
                        map.
                    </p>
                </div>

                <div className="grid gap-4">
                    {FLOWSHEET_DATA.map((program) => (
                        <Link
                            key={program.id}
                            href={`/${program.id}`}
                        >
                            <Card className="hover:border-blue-500 hover:shadow-md transition-all cursor-pointer group">
                                <CardHeader className="flex flex-row items-center justify-between p-6">
                                    <div>
                                        <CardTitle className="group-hover:text-blue-600 transition-colors">
                                            {program.name}
                                        </CardTitle>
                                        <CardDescription>
                                            {program.department}
                                        </CardDescription>
                                    </div>
                                    <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transition-colors" />
                                </CardHeader>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
