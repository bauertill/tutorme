import { useShallow } from "zustand/shallow";
import { useStore } from ".";

export const useActiveAssignmentId = (): string | null => {
  return useStore(useShallow(({ activeAssignmentId }) => activeAssignmentId));
};
