"use client";
import { Button } from "@/components/ui/button";
import { Trans } from "@/i18n";
import { useStore } from "@/store";
import { api } from "@/trpc/react";
import { BookOpen } from "lucide-react";

export default function ExampleProblemCard() {
  const { promise } = api.assignment.getExampleAssignment.useQuery(undefined, {
    staleTime: Infinity,
    experimental_prefetchInRender: true,
  });
  const assignments = useStore.use.assignments();
  const addAssignment = useStore.use.addAssignment();
  const setActiveProblem = useStore.use.setActiveProblem();

  const onClick = async () => {
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
    <div className="flex flex-col gap-4">
      <p className="font-semibold">
        <Trans i18nKey="learn_the_basics_by_working_through_a_guided_example_problem" />
      </p>
      <div>
        <Button
          variant="outline"
          onClick={onClick}
          className="w-full justify-start text-left"
          size="lg"
        >
          <BookOpen className="h-6 w-6 flex-shrink-0" />
          <Trans i18nKey="Start with Example Problem" />
        </Button>
      </div>
    </div>
  );
}
