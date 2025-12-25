import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vijitedia",
  description: "Academic flowsheets for VJTI engineering programmes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <html lang="en">
          <body
              className={`${geistSans.variable} ${geistMono.variable} antialiased`}
          >
              {children}
              <footer className="flex items-center justify-center py-4">
                  <p className="text-sm text-muted-foreground">
                      Built by{" "}
                      <a
                          href="https://github.com/aitwehrrg"
                          target="_blank"
                          rel="noreferrer"
                      >
                          @aitwehrrg
                      </a>
                  </p>
              </footer>
          </body>
      </html>
  );
}
