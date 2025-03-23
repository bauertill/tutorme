"use client";
import { ProgressProvider as BProgressProvider } from "@bprogress/next/app";

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  return (
    <BProgressProvider options={{ showSpinner: true }}>
      {children}
    </BProgressProvider>
  );
}
