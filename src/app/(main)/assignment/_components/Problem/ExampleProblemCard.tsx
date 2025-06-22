"use client";
import { useTrackEvent } from "@/app/_components/GoogleTagManager";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useSetActiveProblem } from "@/hooks/use-set-active-problem";
import { Trans } from "@/i18n/react";
import { api } from "@/trpc/react";
import { ArrowRight, BookOpen } from "lucide-react";

export default function ExampleProblemCard() {
  const utils = api.useUtils();
  const { mutate: createExampleAssignment } =
    api.assignment.createExampleAssignment.useMutation({
      onSuccess: (exampleAssignment) => {
        // @TODO use the .invalidate() method declaratively instead of the .useUtils() method
        void utils.assignment.listStudentAssignments.invalidate();
        const problem = exampleAssignment.problems[0];
        if (problem) {
          void setActiveProblem(problem.id, exampleAssignment.id);
        }
      },
    });

  const setActiveProblem = useSetActiveProblem();
  const trackEvent = useTrackEvent();

  const onClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    trackEvent("clicked_example_assignment_card");
    createExampleAssignment();
  };

  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-6 pb-4 2xl:pb-6">
        <p className="">
          <Trans i18nKey="learn_the_basics_by_working_through_a_guided_example_problem" />
        </p>
      </CardContent>
      <CardFooter className="flex items-center gap-2">
        <Button
          className="flex items-center gap-4 font-semibold"
          onClick={onClick}
        >
          <BookOpen className="h-6 w-6 flex-shrink-0" />
          <Trans i18nKey="try_example_now" />
          <ArrowRight className="size-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
