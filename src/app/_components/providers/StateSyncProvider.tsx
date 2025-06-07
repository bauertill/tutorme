"use client";
import { useStore } from "@/store";
import { api } from "@/trpc/react";
import { skipToken } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useCallback, useEffect } from "react";
import { useDebouncedCallback } from "use-debounce";
const SYNC_INTERVAL = 60 * 1000;

export function StateSyncProvider({ children }: { children: React.ReactNode }) {
  const session = useSession();
  const assignmentsLocal = useStore.use.assignments();
  const pathsLocal = useStore.use.paths();
  const upsertAssignmentsLocal = useStore.use.upsertAssignments();

  const { data: assignmentsOnServer } =
    api.assignment.listStudentAssignments.useQuery(
      session.data?.user.id ? undefined : skipToken,
    );

  const { mutate: syncAssignments } =
    api.assignment.syncAssignments.useMutation({
      onSuccess: () => {
        console.log("syncAssignments success");
      },
      onError: (error) => {
        console.error(error);
      },
    });

  const debouncedSync = useDebouncedCallback(
    useCallback(() => {
      if (!session.data?.user.id) {
        console.log("No user id found, skipping sync");
        return;
      }
      if (!assignmentsOnServer) {
        console.log("Assignments on server not loaded, skipping sync");
        return;
      }
      console.log("syncing assignments");
      syncAssignments(assignmentsLocal); // TODO: Don't send entire data, only changes
    }, [
      session.data?.user.id,
      assignmentsLocal,
      assignmentsOnServer,
      syncAssignments,
    ]),
    SYNC_INTERVAL,
    { leading: true, trailing: true, maxWait: SYNC_INTERVAL },
  );

  useEffect(() => {
    if (assignmentsOnServer) {
      upsertAssignmentsLocal(assignmentsOnServer);
    }
  }, [assignmentsOnServer, upsertAssignmentsLocal]);

  useEffect(debouncedSync, [pathsLocal, debouncedSync]);

  return <>{children}</>;
}
