"use client";
import { useStore } from "@/store";
import { useActiveProblem } from "@/store/selectors";
import { api } from "@/trpc/react";
import { useEffect } from "react";
import { useDebounce } from "use-debounce";
import { Canvas } from "./Canvas";
import ProblemController from "./Problem/ProblemController";

export default function Exercise() {
  const activeProblem = useActiveProblem();
  const [debouncedProblem] = useDebounce(activeProblem, 5000);
  const updateProblem = useStore.use.updateProblem();
  const { mutateAsync: createReferenceSolution } =
    api.assignment.createReferenceSolution.useMutation();

  useEffect(() => {
    if (debouncedProblem?.referenceSolution === null) {
      void createReferenceSolution(debouncedProblem.problem).then(
        (referenceSolution) => {
          updateProblem({
            id: debouncedProblem.id,
            assignmentId: debouncedProblem.assignmentId,
            referenceSolution,
          });
        },
      );
    }
  }, [debouncedProblem, createReferenceSolution, updateProblem]);

  if (!activeProblem) {
    return <div className="p-4">No problem selected</div>;
  }

  return (
    <div className="relative flex h-full flex-col">
      <ProblemController />
      <Canvas />
    </div>
  );
}
