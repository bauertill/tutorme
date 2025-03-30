"use client";
import { useTrackEvent } from "@/app/_components/GoogleTagManager";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Trans } from "@/i18n/react";
import { useStore } from "@/store";
import { api } from "@/trpc/react";
import { ArrowRight, BookOpen } from "lucide-react";

export default function ExampleProblemCard() {
  const { promise } = api.assignment.getExampleAssignment.useQuery(undefined, {
    staleTime: Infinity,
    experimental_prefetchInRender: true,
  });
  const assignments = useStore.use.assignments();
  const addAssignment = useStore.use.addAssignment();
  const setActiveProblem = useStore.use.setActiveProblem();
  const trackEvent = useTrackEvent();

  const onClick = async () => {
    trackEvent("clicked_example_assignment_card");
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
      className="cursor-pointer bg-primary/60 transition-colors hover:bg-accent/50"
      onClick={onClick}
    >
      <CardContent className="flex items-center gap-4 p-6 pb-4 2xl:pb-6">
        <BookOpen className="h-6 w-6 flex-shrink-0" />
        <p className="">
          <Trans i18nKey="learn_the_basics_by_working_through_a_guided_example_problem" />
        </p>
      </CardContent>
      <CardFooter className="ml-10 flex items-center gap-2">
        <div className="flex items-center gap-2 font-semibold">
          <Trans i18nKey="try_example_now" />
          <ArrowRight className="size-4" />
        </div>
      </CardFooter>
    </Card>
  );
}
