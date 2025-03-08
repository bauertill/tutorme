import "@/styles/globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "katex/dist/katex.min.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";

import { TRPCReactProvider } from "@/trpc/react";
import { Toaster } from "sonner";
import { ProgressProvider } from "./_components/ProgressProvider";
import { ThemeProvider } from "./_components/ThemeProvider";

export const metadata: Metadata = {
  title: "Tutor Me Good",
  description: "An app for tutoring",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable}`}
      suppressHydrationWarning
    >
      <body className="select-none [-webkit-user-select:none]">
        <ThemeProvider>
          <ProgressProvider>
            <TRPCReactProvider>
              {children}
              <Toaster />
            </TRPCReactProvider>
          </ProgressProvider>
        </ThemeProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
