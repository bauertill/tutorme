"use client";
import { Goal } from "@/core/goal/types";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

interface LearningGoalsListProps {
  email: string;
}

export default function LearningGoalsList({ email }: LearningGoalsListProps) {
  const getGoalForUser = async () => {
    const response = await fetch("/api/goal");
    const data = await response.json();
    return data;
  };

  const { data, isLoading } = useQuery({
    queryKey: ["goals", email],
    queryFn: () => getGoalForUser(),
  });

  if (!data) {
    return;
  }
  if (isLoading) {
    return <div>Loading...</div>;
  }
  const goals = data.goals;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {goals.map((goal: Goal) => (
        <Link
          key={goal.id}
          href={`/goal/${goal.id}`}
          className="flex items-center p-4 bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors group"
        >
          <h2 className="text-gray-100 group-hover:text-gray-50">
            {goal.goal}
          </h2>
        </Link>
      ))}
    </div>
  );
}
