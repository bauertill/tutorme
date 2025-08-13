"use client";

import { useAuth } from "@/lib/react-auth";
import { api } from "@/trpc/react";
import { redirect } from "next/navigation";
import { Home } from "./Home";
import Welcome from "./Welcome";

export default function Page() {
  const { session, status } = useAuth();
  const shouldQuery = !!session?.user?.id;

  const { data: studentContext, isLoading } =
    api.studentContext.getStudentContext.useQuery(undefined, {
      enabled: shouldQuery,
      retry: false,
      staleTime: 0,
      gcTime: 0,
      refetchOnMount: true,
      refetchOnWindowFocus: false,
    });

  // While session is resolving or data is loading, show loading
  if (status === "loading" || (shouldQuery && isLoading)) {
    return <div>Loading...</div>;
  }

  // If there is no authenticated session, show Welcome immediately
  if (!session) {
    return <Welcome />;
  }

  // If user has completed onboarding, show Home dashboard
  if (studentContext) {
    return <Home />;
  }

  // If authenticated user hasn't completed onboarding, redirect to onboarding
  if (session && !isLoading) {
    redirect("/onboarding");
  }

  return <div />;
}
