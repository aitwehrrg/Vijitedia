import type { Metadata } from "next";
import { Geist_Mono, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

const ibmPlexSans = IBM_Plex_Sans({
    weight: ["400", "500", "600", "700"],
    subsets: ["latin"],
    variable: "--font-plex-sans",
    display: "swap",
});

export const metadata: Metadata = {
    title: "Vijitedia",
    description:
        "Vijitedia is an interactive academic planning tool designed for engineering students at VJTI. It features a dynamic curriculum flowsheet for visualizing course dependencies.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <head>
                <meta
                    property="og:image"
                    content="/thumbnail.jpeg"
                ></meta>
                <meta
                    property="og:site_name"
                    content="Vijitedia"
                ></meta>
                <meta property="og:title" content="Vijitedia"></meta>
                <meta
                    property="og:description"
                    content="Vijitedia is an interactive academic planning tool designed for engineering students at VJTI. It features a dynamic curriculum flowsheet for visualizing course dependencies."
                />
                <meta
                    property="og:url"
                    content="https://vijitedia.vercel.app/"
                ></meta>
            </head>
            <body className={`cmu-tt antialiased`}>{children}</body>
        </html>
    );
}
