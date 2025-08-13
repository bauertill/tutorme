"use client";

import type { StudentContext as StudentContextType } from "@/core/studentContext/studentContext.types";
import { useAuth } from "@/lib/react-auth";
import { api } from "@/trpc/react";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import { Home } from "./Home";
import Welcome from "./Welcome";

export default function Page() {
  const { session, isAnon } = useAuth();
  const [isReady, setIsReady] = useState(false);
  const [fallbackData, setFallbackData] = useState<StudentContextType | null>(
    null,
  );
  const [fallbackComplete, setFallbackComplete] = useState(false);

  // Add a delay for Google users to ensure OAuth session is fully established
  useEffect(() => {
    if (session?.user?.email?.endsWith("@gmail.com")) {
      // For Gmail users, add a small delay to avoid race conditions with OAuth
      const timer = setTimeout(() => setIsReady(true), 500);
      return () => clearTimeout(timer);
    } else {
      // For other users, ready immediately
      setIsReady(true);
    }
  }, [session?.user?.email]);

  // Enable tRPC query when session is stable and ready
  const shouldQuery = !!session?.user?.id && isReady;

  const { data: studentContext, isLoading } =
    api.studentContext.getStudentContext.useQuery(undefined, {
      enabled: shouldQuery,
      retry: false,
      staleTime: 0,
      gcTime: 0,
      refetchOnMount: true,
      refetchOnWindowFocus: false,
    });

  // Fallback for Gmail users: Direct HTTP fetch to bypass tRPC client caching issues
  useEffect(() => {
    if (
      session?.user?.email?.endsWith("@gmail.com") &&
      isReady &&
      !fallbackComplete
    ) {
      fetch(
        "/api/trpc/studentContext.getStudentContext?batch=1&input=%7B%220%22%3A%7B%22json%22%3Anull%2C%22meta%22%3A%7B%22values%22%3A%5B%22undefined%22%5D%7D%7D%7D",
      )
        .then(
          (response) =>
            response.json() as Promise<
              Array<{
                result?: { data?: { json?: StudentContextType | null } };
              }>
            >,
        )
        .then((data) => {
          const json = data?.[0]?.result?.data?.json;
          if (json) {
            setFallbackData(json);
          }
          setFallbackComplete(true);
        })
        .catch(() => setFallbackComplete(true));
    } else if (!session?.user?.email?.endsWith("@gmail.com")) {
      setFallbackComplete(true);
    }
  }, [session?.user?.email, isReady, fallbackComplete]);

  // Show loading while waiting for session readiness, data fetching, or fallback
  if (!isReady || (shouldQuery && isLoading) || !fallbackComplete) {
    return <div>Loading...</div>;
  }

  // If user has completed onboarding, show Home dashboard
  if (studentContext || fallbackData) {
    return <Home />;
  }

  // If authenticated user hasn't completed onboarding, redirect to onboarding
  if (session && !isAnon && !isLoading && isReady && fallbackComplete) {
    redirect("/onboarding");
  }

  // For anonymous users without studentContext, show Welcome page
  return <Welcome />;
}
