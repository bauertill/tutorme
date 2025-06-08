import { type StudentAssignment } from "@/core/assignment/assignment.types";
import { useShallow } from "zustand/shallow";
import { useStore } from ".";

export const useActiveAssignment = (): StudentAssignment | null => {
  return useStore(
    useShallow(({ assignments: { entities, activeId } }) =>
      activeId === null ? null : (entities[activeId] ?? null),
    ),
  );
};

export const useAssignments = (): StudentAssignment[] => {
  return useStore(
    useShallow(({ assignments: { entities, ids } }) =>
      ids.map((id) => entities[id] ?? null).filter((a) => a !== null),
    ),
  );
};

export const useActiveAssignmentId = (): string | null => {
  return useStore(useShallow(({ assignments: { activeId } }) => activeId));
};
