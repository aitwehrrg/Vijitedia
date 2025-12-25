import type { Metadata } from "next";
import { Geist_Mono, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

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
              className={`cmu-tt bg-neutral-50 text-neutral-900 antialiased`}
          >
              {children}
              <footer className="flex items-center justify-center pb-4">
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
