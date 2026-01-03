import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

export const metadata: Metadata = {
    title: "Vijitedia",
    description:
        "Vijitedia is an interactive academic planning tool designed for engineering students at VJTI. It features a dynamic curriculum flowsheet for visualizing course dependencies.",
};

const cmSans = localFont({
    src: [
        {
            path: "./fonts/cmunss.woff2",
            weight: "400",
            style: "normal",
        },
        {
            path: "./fonts/cmunsx.woff2",
            weight: "700",
            style: "normal",
        },
        {
            path: "./fonts/cmunsi.woff2",
            weight: "400",
            style: "italic",
        },
        {
            path: "./fonts/cmunso.woff2",
            weight: "700",
            style: "italic",
        },
    ],
    variable: "--font-cm-sans",
    display: "block",
});

const cmMono = localFont({
    src: [
        {
            path: "./fonts/cmuntt.woff2",
            weight: "400",
            style: "normal",
        },
        {
            path: "./fonts/cmuntb.woff2",
            weight: "700",
            style: "normal",
        },
        {
            path: "./fonts/cmunit.woff2",
            weight: "400",
            style: "italic",
        },
        {
            path: "./fonts/cmuntx.woff2",
            weight: "700",
            style: "italic",
        },
    ],
    variable: "--font-cm-mono",
    display: "block",
});

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <head>
                <meta property="og:image" content="/thumbnail.jpeg"></meta>
                <meta property="og:site_name" content="Vijitedia"></meta>
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
            <body
                className={`${cmSans.variable} ${cmMono.variable} font-sans`}
            >
                {children}
            </body>
        </html>
    );
}
