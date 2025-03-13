"use client";
import { useStore } from "@/store";
import { api } from "@/trpc/react";
import { useSession } from "next-auth/react";
import { useEffect, useRef } from "react";

export function StateSyncProvider({ children }: { children: React.ReactNode }) {
  const session = useSession();
  const assignmentsLocal = useStore.use.assignments();
  const setAssignmentsLocal = useStore.use.setAssignments();
  const lastSyncTime = useRef<number>(0);

  const syncAssignments = api.assignment.syncAssignments.useMutation({
    onSuccess: (data) => {
      if (!data.assignmentsNotInLocal.length) {
        console.log("No assignments found on server to sync");
        return;
      }
      console.log("Syncing assignments from server to local");
      setAssignmentsLocal([...assignmentsLocal, ...data.assignmentsNotInLocal]);
    },
    onError: (error) => {
      console.error(error);
    },
  });

  useEffect(() => {
    if (!session.data?.user.id) {
      console.log("No user id found, skipping sync");
      return;
    }
    console.log("Syncing assignments from local to server");

    const now = Date.now();
    const timeSinceLastSync = now - lastSyncTime.current;
    const delayNeeded = Math.max(0, 1000 - timeSinceLastSync);

    const t = setTimeout(() => {
      syncAssignments.mutate(assignmentsLocal);
      lastSyncTime.current = Date.now();
    }, delayNeeded);

    return () => clearTimeout(t);
  }, [assignmentsLocal, session.data?.user.id, syncAssignments]);

  return <>{children}</>;
}
