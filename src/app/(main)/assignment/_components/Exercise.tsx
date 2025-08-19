"use client";
import { useStore } from "@/store";
import {
  useActiveProblem,
  useReferenceSolution,
} from "@/store/problem.selectors";
import { api } from "@/trpc/react";
import { useEffect } from "react";
import { useDebounce } from "use-debounce";
import { Canvas } from "./Canvas";
import ProblemController from "./Problem/ProblemController";

export default function Exercise() {
  const activeProblem = useActiveProblem();
  const [debouncedProblem] = useDebounce(activeProblem, 5000);
  const { mutateAsync: createReferenceSolution } =
    api.problem.createReferenceSolution.useMutation();

  // @TODO challenge this workflow as we can create the reference solution as part of the
  // problem generation step.
  const addReferenceSolution = useStore.use.addReferenceSolution();
  const referenceSolution = useReferenceSolution(activeProblem?.id ?? null);

  useEffect(() => {
    if (debouncedProblem && !referenceSolution) {
      void createReferenceSolution(debouncedProblem.problem).then(
        (referenceSolution) => {
          addReferenceSolution(
            debouncedProblem.id,
            referenceSolution.substring(0, 30),
          );
        },
      );
    }
  }, [
    debouncedProblem,
    createReferenceSolution,
    addReferenceSolution,
    referenceSolution,
  ]);

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
