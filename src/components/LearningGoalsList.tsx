import { Goal } from "@/core/goal/types";
import Link from "next/link";

interface LearningGoalsListProps {
  goals: Goal[];
}

export default function LearningGoalsList({ goals }: LearningGoalsListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {goals.map(goal => (
        <Link
          key={goal.id}
          href={`/goal/${goal.id}`}
          className="flex items-center p-4 hover:bg-gray-50 transition-colors group"
        >
          <h2 className=" dark:text-white group-hover:text-gray-900">
            {goal.goal}
          </h2>
        </Link>
      ))}
    </div>
  );
}
