"use client";

import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import { Shuffle } from "lucide-react";
import { useCallback } from "react";
export default function RandomProblemButton({
  onNewProblem,
}: {
  onNewProblem: (problem: string) => void;
}) {
  const {
    data: newProblem,
    refetch,
    isFetching,
  } = api.exercise.getRandomProblem.useQuery(undefined, {
    staleTime: undefined,
  });

  const onClick = useCallback(() => {
    onNewProblem(newProblem?.problem ?? "");
    void refetch();
  }, [onNewProblem, newProblem, refetch]);

  // @TODO Random problem should insert the problem for this user.

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
