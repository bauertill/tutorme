"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Concept } from "@/core/concept/types";
import { MasteryLevel } from "@/core/goal/types";
import { api } from "@/trpc/react";
import { ArrowRight } from "lucide-react";

export function SelfAssessment({ concept }: { concept: Concept }) {
  const utils = api.useUtils();
  const updateMasteryLevel = api.concept.updateMasteryLevel.useMutation({
    onSuccess: () => {
      void utils.concept.byId.invalidate(concept.id);
      void utils.goal.getConcepts.invalidate();
    },
  });

  const onKnowsNothing = () => {
    updateMasteryLevel.mutate({
      conceptId: concept.id,
      masteryLevel: MasteryLevel.Enum.BEGINNER,
    });
  };

  const onKnowsSome = () => {
    updateMasteryLevel.mutate({
      conceptId: concept.id,
      masteryLevel: MasteryLevel.Enum.INTERMEDIATE,
    });
  };

  const onKnowsAll = () => {
    updateMasteryLevel.mutate({
      conceptId: concept.id,
      masteryLevel: MasteryLevel.Enum.EXPERT,
    });
  };

  return (
    <div className="space-y-4">
      <p>
        Tell us how much you know about <i>{concept.name}</i>.
      </p>
      <div className="space-y-4">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Beginner</CardTitle>
          </CardHeader>
          <CardContent>
            Choose this if you&apos;re completely new to the subject.
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button
              variant="outline"
              onClick={onKnowsNothing}
              disabled={updateMasteryLevel.isPending}
            >
              I know nothing
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Intermediate</CardTitle>
          </CardHeader>
          <CardContent>
            Choose this if you have learned some things about the subject, but
            haven&apos;t mastered it yet.
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button
              variant="outline"
              onClick={onKnowsSome}
              disabled={updateMasteryLevel.isPending}
            >
              I know some things
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Expert</CardTitle>
          </CardHeader>
          <CardContent>
            Choose this if you have mastered the subject.
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button
              variant="outline"
              onClick={onKnowsAll}
              disabled={updateMasteryLevel.isPending}
            >
              I know all
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>
      {updateMasteryLevel.isPending && (
        <p className="text-center">Please wait...</p>
      )}
    </div>
  );
}
