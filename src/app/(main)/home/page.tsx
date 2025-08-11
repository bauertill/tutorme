"use client";

import { useAuth } from "@/lib/react-auth";
import { api } from "@/trpc/react";
import { redirect } from "next/navigation";
import { Home } from "./Home";
import Welcome from "./Welcome";

export default function Page() {
  const { session, isAnon } = useAuth();
  const { data: studentContext } =
    api.studentContext.getStudentContext.useQuery();

  if (studentContext) {
    return <Home />;
  }
  if (session && !isAnon) {
    redirect("/onboarding");
  }
  return <Welcome />;
}
