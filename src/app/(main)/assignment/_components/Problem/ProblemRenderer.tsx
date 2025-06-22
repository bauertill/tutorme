import { Latex } from "@/app/_components/richtext/Latex";
import { type Problem } from "@/core/problem/problem.types";

export function ProblemRenderer({ problem }: { problem: Problem }) {
  return (
    <div>
      <div className="current-problem flex select-text flex-row items-center gap-1 [-webkit-user-select:text]">
        <span className="mr-1 text-muted-foreground">
          {problem.problemNumber}
        </span>
        <Latex className="whitespace-pre-wrap">{problem.problem}</Latex>
      </div>
    </div>
  );
}
