import { GeistSans } from "geist/font/sans";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Drawing Companion",
  description: "Mobile companion app for real-time drawing",
  manifest: "/manifest.json",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  themeColor: "#000000",
};

export default function MobileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable}`}
      suppressHydrationWarning
    >
      <body className="touch-manipulation overscroll-none">{children}</body>
    </html>
  );
}
