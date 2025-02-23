"use client";
import { api } from "@/trpc/react";
import Link from "next/link";

export function GoalsList() {
  const { data: goals, isPending, isError } = api.goal.all.useQuery();

  if (isError) {
    return <div>Error loading goals</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {isPending
        ? Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center p-4 bg-gray-900 rounded-lg animate-pulse"
            >
              <div className="h-6 bg-gray-800 rounded w-2/3"></div>
            </div>
          ))
        : goals?.map((goal) => (
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
