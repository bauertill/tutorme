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
  const { mutateAsync: createReferenceSolution } =
    api.assignment.createReferenceSolution.useMutation();
  const addReferenceSolution = useStore.use.addReferenceSolution();
  const referenceSolutions = useStore.use.referenceSolutions();

  useEffect(() => {
    if (debouncedProblem && !referenceSolutions[debouncedProblem.id]) {
      void createReferenceSolution(debouncedProblem.problem).then(
        (referenceSolution) => {
          console.log("referenceSolution", referenceSolution);
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
    referenceSolutions,
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
