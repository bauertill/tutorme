"use client";
import { Button } from "@/components/ui/button";
import { useStore } from "@/store";
import { api } from "@/trpc/react";

export default function ExampleProblemButton({
  children = "Work on an Example Problem",
  ...props
}: React.ComponentProps<typeof Button>) {
  const { promise } = api.assignment.getExampleAssignment.useQuery(undefined, {
    staleTime: Infinity,
    experimental_prefetchInRender: true,
  });
  const assignments = useStore.use.assignments();
  const addAssignment = useStore.use.addAssignment();
  const setActiveProblem = useStore.use.setActiveProblem();
  const onClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const existingExampleAssignment = assignments.find(
      (assignment) => assignment.name === "Example Assignment",
    );
    if (existingExampleAssignment) {
      const problem = existingExampleAssignment.problems[0];
      if (problem) {
        setActiveProblem(problem);
      }
    } else {
      const exampleAssignment = await promise;
      addAssignment(exampleAssignment);
    }
  };
  return (
    <Button {...props} onClick={onClick}>
      {children}
    </Button>
  );
}
