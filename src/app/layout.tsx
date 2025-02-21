"use client";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Providers } from "@/components/Providers";

const inter = Inter({ subsets: ["latin"] });

const queryClient = new QueryClient();

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <Providers>
        <html lang="en">
          <head>
            <link
              rel="stylesheet"
              href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;600;700&display=swap"
            />
          </head>
          <body className={inter.className}>{children}</body>
        </html>
      </Providers>
    </QueryClientProvider>
  );
}
