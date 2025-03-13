"use client";
import { useStore } from "@/store";
import { api } from "@/trpc/react";
import { useSession } from "next-auth/react";
import { useEffect, useRef } from "react";

export function StateSyncProvider({ children }: { children: React.ReactNode }) {
  const session = useSession();
  const assignmentsLocal = useStore.use.assignments();
  const upsertAssignmentsLocal = useStore.use.upsertAssignments();
  const lastSyncTime = useRef<number>(Date.now());

  const syncAssignments = api.assignment.syncAssignments.useMutation({
    onSuccess: (data) => {
      if (!data.assignmentsNotInLocal.length) {
        console.log("Assignments in sync");
        return;
      }
      upsertAssignmentsLocal(data.assignmentsNotInLocal);
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
    const timeSinceLastSync = Date.now() - lastSyncTime.current;
    if (timeSinceLastSync > 60 * 1000) {
      console.log("Syncing assignments from local to server");
      syncAssignments.mutate(assignmentsLocal);
      lastSyncTime.current = Date.now();
    }
  }, [assignmentsLocal, session.data?.user.id, syncAssignments]);

  return <>{children}</>;
}
