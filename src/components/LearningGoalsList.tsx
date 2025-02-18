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
          href={`/learning-goals/${goal.id}`}
          className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          <h2 className="text-xl font-semibold mb-2">{goal.goal}</h2>
        </Link>
      ))}
    </div>
  );
}
