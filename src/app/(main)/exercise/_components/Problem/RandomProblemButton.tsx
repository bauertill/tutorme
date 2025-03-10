"use client";

import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import { Shuffle } from "lucide-react";
import { useCallback } from "react";
export default function RandomProblemButton({
  setProblem,
}: {
  setProblem: (problem: string) => void;
}) {
  const {
    data: newProblem,
    refetch,
    isFetching,
  } = api.exercise.getRandomProblem.useQuery(undefined, {
    staleTime: undefined,
  });

  const { mutate: createUserProblem } =
    api.problem.createUserProblem.useMutation();

  const onClick = useCallback(() => {
    if (newProblem) {
      createUserProblem({ problem: newProblem.problem });
      setProblem(newProblem.problem);
      void refetch();
    }
  }, [setProblem, newProblem, refetch]);

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={onClick}
      disabled={!newProblem || isFetching}
    >
      <Shuffle className="h-4 w-4" />
    </Button>
  );
}
