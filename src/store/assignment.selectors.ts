import { type StudentAssignment } from "@/core/assignment/assignment.types";
import { useStore } from ".";

export const useActiveAssignment = (): StudentAssignment | null => {
  const assignmentId = useStore.use.activeAssignmentId();
  const assignments = useStore.use.assignments();
  const assignment = assignments.find((a) => a.id === assignmentId);
  return assignment ?? assignments[0] ?? null;
};
