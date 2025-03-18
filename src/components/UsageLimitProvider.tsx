"use client";

import { useStore } from "@/store";
import { useEffect } from "react";
import { toast } from "sonner";
import { UsageLimitOverlay } from "./UsageLimitOverlay";

interface TRPCError {
  code: string;
  message: string;
}

export function UsageLimitProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isUsageLimitReached, setUsageLimitReached } = useStore();

  useEffect(() => {
    // Listen for TOO_MANY_REQUESTS errors from tRPC
    const handleError = (event: CustomEvent<TRPCError>) => {
      const error = event.detail;
      if (error?.code === "TOO_MANY_REQUESTS") {
        setUsageLimitReached(true);
        toast.error(error.message);
      }
    };

    window.addEventListener("trpc-error", handleError as EventListener);
    return () => {
      window.removeEventListener("trpc-error", handleError as EventListener);
    };
  }, [setUsageLimitReached]);

  if (isUsageLimitReached) {
    return <UsageLimitOverlay />;
  }

  return <>{children}</>;
}
