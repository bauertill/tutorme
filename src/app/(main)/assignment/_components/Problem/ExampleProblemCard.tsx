"use client";
import { Card, CardContent } from "@/components/ui/card";
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
    <Card
      className="cursor-pointer transition-colors hover:bg-accent/50"
      onClick={onClick}
    >
      <CardContent className="flex items-center gap-4 p-6">
        <BookOpen className="h-6 w-6 flex-shrink-0" />
        <p className="text-sm">
          <Trans i18nKey="learn_the_basics_by_working_through_a_guided_example_problem" />
        </p>
      </CardContent>
    </Card>
  );
}
