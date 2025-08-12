import "@/styles/globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "katex/dist/katex.min.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";

import { PostHogProvider } from "@/app/_components/providers/PostHogProvider";
import { ProgressProvider } from "@/app/_components/providers/ProgressProvider";
import { ThemeProvider } from "@/app/_components/providers/ThemeProvider";
import { TRPCReactProvider } from "@/trpc/react";
import { Toaster } from "sonner";
import { GoogleTagManager } from "./_components/GoogleTagManager";
import { ClientOnly } from "./_components/providers/ClientOnly";
import { I18nProvider } from "./_components/providers/I18nProvider";
import { ReactScan } from "./_components/ReactScan";

export const metadata: Metadata = {
  title: "Tutor Me Good",
  description: "An app for tutoring",
  icons: {
    icon: [
      { url: "/icons/graduation-cap.svg", type: "image/svg+xml" },
      { url: "/favicon.ico" },
    ],
  },
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
      <ReactScan />
      <body
        className="select-none [-webkit-user-select:none]"
        suppressHydrationWarning
      >
        <ClientOnly>
          <GoogleTagManager />
          <PostHogProvider>
            <ThemeProvider>
              <ProgressProvider>
                <TRPCReactProvider>
                  <I18nProvider>
                    {children}
                    <Toaster />
                  </I18nProvider>
                </TRPCReactProvider>
              </ProgressProvider>
            </ThemeProvider>
            <SpeedInsights />
          </PostHogProvider>
        </ClientOnly>
      </body>
    </html>
  );
}
