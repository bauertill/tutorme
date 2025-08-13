"use client";

import type { StudentContext as StudentContextType } from "@/core/studentContext/studentContext.types";
import { useAuth } from "@/lib/react-auth";
import { api } from "@/trpc/react";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import { Home } from "./Home";
import Welcome from "./Welcome";

export default function Page() {
  const { session } = useAuth();
  const [isReady, setIsReady] = useState(false);
  const [fallbackData] = useState<StudentContextType | null>(null);

  useEffect(() => {
    if (session?.user?.email?.endsWith("@gmail.com")) {
      const timer = setTimeout(() => setIsReady(true), 500);
      return () => clearTimeout(timer);
    } else {
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

  // If there is no authenticated session, show Welcome immediately
  if (!session) {
    return <Welcome />;
  }

  // Show loading while waiting for session readiness, data fetching, or fallback
  if (!isReady || (shouldQuery && isLoading)) {
    return <div>Loading...</div>;
  }

  // If user has completed onboarding, show Home dashboard
  if (studentContext || fallbackData) {
    return <Home />;
  }

  // If authenticated user hasn't completed onboarding, redirect to onboarding
  if (session && !isLoading && isReady) {
    redirect("/onboarding");
  }

  return <div />;
}
