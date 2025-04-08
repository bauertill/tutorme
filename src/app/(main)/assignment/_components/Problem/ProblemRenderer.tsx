import { Latex } from "@/app/_components/richtext/Latex";
import { type UserProblem } from "@/core/assignment/types";
import { ImageSegmentRenderer } from "./ImageSegmentRenderer";

export function ProblemRenderer({ problem }: { problem: UserProblem }) {
  const hasRelevantImageSegment =
    problem.imageUrl && problem.relevantImageSegment;

  return (
    <div>
      <div className="current-problem flex flex-row items-center gap-1">
        <span className="mr-1 text-muted-foreground">
          {problem.problemNumber}
        </span>
        <Latex className="whitespace-pre-wrap">{problem.problem}</Latex>
      </div>
      {hasRelevantImageSegment &&
        problem.imageUrl &&
        problem.relevantImageSegment && (
          <ImageSegmentRenderer
            imageUrl={problem.imageUrl}
            segment={problem.relevantImageSegment}
            problemId={problem.id}
            assignmentId={problem.assignmentId}
          />
        )}
    </div>
  );
}
