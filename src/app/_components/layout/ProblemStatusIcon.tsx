import { type UserProblem } from "@/core/assignment/types";
import { CheckCircle, Circle } from "lucide-react";

export function ProblemStatusIcon({
  status,
}: {
  status: UserProblem["status"];
}) {
  if (status === "SOLVED") {
    return (
      <CheckCircle className="ml-auto flex h-4 min-h-4 w-4 min-w-4 text-green-500" />
    );
  }
  if (status === "IN_PROGRESS") {
    return <Circle className="ml-auto flex h-4 w-4 min-w-4 text-yellow-500" />;
  }
  if (status === "FAILED") {
    return <Circle className="ml-auto flex h-4 w-4 min-w-4 text-red-500" />;
  }
  return null;
}
