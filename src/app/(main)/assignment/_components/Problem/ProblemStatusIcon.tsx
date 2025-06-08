import { type StudentSolution } from "@/core/studentSolution/studentSolution.types";
import { CheckCircle, Circle } from "lucide-react";

export function ProblemStatusIcon({
  status,
}: {
  status: StudentSolution["status"];
}) {
  if (status === "SOLVED") {
    return (
      <CheckCircle className="ml-auto flex h-4 min-h-4 w-4 min-w-4 text-green-500" />
    );
  }
  if (status === "IN_PROGRESS") {
    return <Circle className="ml-auto flex h-4 w-4 min-w-4 text-yellow-500" />;
  }
  return null;
}
