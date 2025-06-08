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
  const studentSolutionsLocal = useStore.use.studentSolutions();
  const upsertAssignmentsLocal = useStore.use.upsertAssignments();
  const upsertStudentSolutionsLocal = useStore.use.upsertStudentSolutions();

  const { data: assignmentsOnServer } =
    api.assignment.listStudentAssignments.useQuery(
      session.data?.user.id ? undefined : skipToken,
    );

  const { data: studentSolutionsOnServer } =
    api.studentSolution.listStudentSolutions.useQuery(
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

  const { mutate: syncStudentSolutions } =
    api.studentSolution.syncStudentSolutions.useMutation({
      onSuccess: ({ studentSolutionsNotInLocal }) => {
        console.log("syncStudentSolutions success");
        upsertStudentSolutionsLocal(studentSolutionsNotInLocal);
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
      syncAssignments(assignmentsLocal);
      syncStudentSolutions(studentSolutionsLocal);
    }, [
      session.data?.user.id,
      assignmentsLocal,
      assignmentsOnServer,
      syncAssignments,
      syncStudentSolutions,
      studentSolutionsLocal,
    ]),
    SYNC_INTERVAL,
    { leading: true, trailing: true, maxWait: SYNC_INTERVAL },
  );

  useEffect(() => {
    if (assignmentsOnServer) {
      upsertAssignmentsLocal(assignmentsOnServer);
    }
  }, [assignmentsOnServer, upsertAssignmentsLocal]);

  useEffect(() => {
    if (studentSolutionsOnServer) {
      upsertStudentSolutionsLocal(studentSolutionsOnServer);
    }
  }, [studentSolutionsOnServer, upsertStudentSolutionsLocal]);

  useEffect(debouncedSync, [
    assignmentsLocal,
    studentSolutionsLocal,
    debouncedSync,
  ]);

  return <>{children}</>;
}
