"use client";

import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import { Shuffle } from "lucide-react";
import { useCallback } from "react";
export default function NewProblemButton({
  onNewProblem,
}: {
  onNewProblem: (problem: string) => void;
}) {
  const {
    data: problem,
    refetch,
    isFetching,
  } = api.exercise.getRandomProblem.useQuery(undefined, {
    staleTime: undefined,
  });
  const onClick = useCallback(() => {
    onNewProblem(problem?.problem ?? "");
    void refetch();
  }, [onNewProblem, problem, refetch]);
  return (
    <Button
      variant="outline"
      size="icon"
      onClick={onClick}
      disabled={!problem || isFetching}
    >
      <Shuffle className="h-4 w-4" />
    </Button>
  );
}
