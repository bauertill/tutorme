"use client";

import { SidebarText } from "@/components/ui/sidebar";
import { Trans } from "@/i18n/react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface FooterProps {
  className?: string;
}

export function Footer({ className }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <SidebarText className={cn("w-full border-t", className)}>
      <div className="container mx-auto flex flex-col gap-2 px-4 py-4">
        <div className="text-center text-xs text-muted-foreground">
          <Trans i18nKey="footer_text" values={{ currentYear }} />
        </div>
        <nav className="flex justify-center gap-4 text-xs text-muted-foreground">
          <Link
            href="/terms"
            target="_blank"
            className="hover:text-foreground hover:underline"
          >
            <Trans i18nKey="terms_of_service" />
          </Link>
          <Link
            href="/privacy"
            target="_blank"
            className="hover:text-foreground hover:underline"
          >
            <Trans i18nKey="privacy_policy" />
          </Link>
          <Link
            href="/impressum"
            target="_blank"
            className="hover:text-foreground hover:underline"
          >
            <Trans i18nKey="impressum" />
          </Link>
        </nav>
      </div>
    </SidebarText>
  );
}
