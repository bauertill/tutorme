"use client";
import { api } from "@/trpc/react";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

export function StateSyncProvider({ children }: { children: React.ReactNode }) {
  const session = useSession();
  const { data: assignments } = api.assignment.list.useQuery(undefined, {
    enabled: !!session.data?.user,
  });
  useEffect(() => {
    if (assignments) {
      console.log("got assignments from server", assignments);
      // TODO: merge server and client state; write back to server
    }
  }, [assignments]);
  useEffect(() => {
    const t = setTimeout(() => {
      // TODO: sync state to server; only sync if there are changes; only sync if there's a session
    }, 60 * 1000);
    return () => clearTimeout(t);
  }, [assignments]);
  return <>{children}</>;
}
