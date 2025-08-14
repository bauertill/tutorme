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

  if (status === "loading" || (shouldQuery && isLoading)) {
    return <div>Loading...</div>;
  }

  if (!session) {
    return <Welcome />;
  }

  if (studentContext) {
    return <Home />;
  }

  redirect("/onboarding");
}
