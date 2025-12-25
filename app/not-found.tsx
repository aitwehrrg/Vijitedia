import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileQuestion, ArrowLeft } from "lucide-react";

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 max-w-md w-full flex flex-col items-center space-y-6">
                {/* Icon */}
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                    <FileQuestion className="w-8 h-8 text-slate-400" />
                </div>

                {/* Text */}
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold text-slate-900">
                        Page Not Found
                    </h1>
                    <p className="text-slate-500">
                        The academic resource you are looking for doesn't exist
                        or has been moved.
                    </p>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-1 w-full gap-3">
                    <Button
                        asChild
                        className="w-full"
                    >
                        <Link href="/">Return Home</Link>
                    </Button>
                    <Button variant="outline" asChild className="w-full">
                        <Link href="/flowsheet" className="gap-2">
                            <ArrowLeft className="w-4 h-4" /> Go to Flowsheets
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
