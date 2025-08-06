"use client";

import { useAuth } from "@/lib/react-auth";
import { api } from "@/trpc/react";
import { Home } from "./Home";
import Welcome from "./Welcome";
import Onboarding from "./onboarding/Onboarding";

export default function Page() {
  const { session, isAnon } = useAuth();
  const { data: studentContext } =
    api.studentContext.getStudentContext.useQuery();
  if (studentContext) {
    return <Home />;
  }
  if (session && !isAnon) {
    return <Onboarding />;
  }
  return <Welcome />;
}
