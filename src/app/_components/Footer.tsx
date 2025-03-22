"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";

interface FooterProps {
  className?: string;
}

export function Footer({ className }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={cn("w-full border-t", className)}>
      <div className="container mx-auto flex flex-col gap-2 px-4 py-4">
        <div className="text-center text-xs text-muted-foreground">
          © {currentYear} Tutor Me Good. All rights reserved.
        </div>
        <nav className="flex justify-center gap-4 text-xs text-muted-foreground">
          <Link href="/terms" className="hover:text-foreground hover:underline">
            Terms of Service
          </Link>
          <Link
            href="/privacy"
            className="hover:text-foreground hover:underline"
          >
            Privacy Policy
          </Link>
          <Link
            href="/impressum"
            className="hover:text-foreground hover:underline"
          >
            Impressum
          </Link>
        </nav>
      </div>
    </footer>
  );
}
