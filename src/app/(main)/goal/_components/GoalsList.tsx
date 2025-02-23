"use client";
import { api } from "@/trpc/react";
import Link from "next/link";

export function GoalsList() {
  const { data: goals, isLoading } = api.goal.getAll.useQuery();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!goals) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {goals.map((goal) => (
        <Link
          key={goal.id}
          href={`/goal/${goal.id}`}
          className="flex items-center p-4 bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors group"
        >
          <h2 className="text-gray-100 group-hover:text-gray-50">
            {goal.name}
          </h2>
        </Link>
      ))}
    </div>
  );
}
