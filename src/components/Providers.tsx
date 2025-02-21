"use client";

import { SessionProvider } from "next-auth/react";
import { TrpcProvider } from "./providers/TrpcProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <TrpcProvider>{children}</TrpcProvider>
    </SessionProvider>
  );
}
