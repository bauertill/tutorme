import { Latex } from "@/app/_components/richtext/Latex";
import { type UserProblem } from "@/core/assignment/types";
import { ImageSegmentRenderer } from "./ImageSegmentRenderer";

export function ProblemRenderer({ problem }: { problem: UserProblem }) {
  return (
    <div>
      <div className="current-problem flex flex-row items-center gap-1">
        <span className="mr-1 text-muted-foreground">
          {problem.problemNumber}
        </span>
        <Latex className="whitespace-pre-wrap">{problem.problem}</Latex>
      </div>
      <ImageSegmentRenderer problem={problem} />
    </div>
  );
}
