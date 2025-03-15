"use client";
import { useStore } from "@/store";
import { api } from "@/trpc/react";
import { skipToken } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useEffect, useRef } from "react";
const SYNC_INTERVAL = 60 * 1000;

export function StateSyncProvider({ children }: { children: React.ReactNode }) {
  const session = useSession();
  const assignmentsLocal = useStore.use.assignments();
  const upsertAssignmentsLocal = useStore.use.upsertAssignments();
  const lastSyncTime = useRef<number>(Date.now());

  const {
    data: assignmentsOnServer,
    isSuccess,
    refetch,
  } = api.assignment.list.useQuery(
    session.data?.user.id ? undefined : skipToken,
  );

  const { mutate: syncAssignments } =
    api.assignment.syncAssignments.useMutation({
      onSuccess: () => {
        lastSyncTime.current = Date.now();
        void refetch();
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
    if (!isSuccess || !assignmentsOnServer) {
      console.log("Assignments on server not loaded, skipping sync");
      return;
    }
    upsertAssignmentsLocal(assignmentsOnServer);
    const timeSinceLastSync = Date.now() - lastSyncTime.current;
    if (timeSinceLastSync > SYNC_INTERVAL) {
      console.log("Syncing assignments from local to server");
      syncAssignments(assignmentsLocal);
      lastSyncTime.current = Date.now();
    }
  }, [
    assignmentsLocal,
    session.data?.user.id,
    isSuccess,
    assignmentsOnServer,
    syncAssignments,
    upsertAssignmentsLocal,
  ]);

  return <>{children}</>;
}
