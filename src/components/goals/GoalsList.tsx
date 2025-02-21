"use client";
import Link from "next/link";
import { trpc } from "../providers/TrpcProvider";
import { useSession } from "next-auth/react";

export function GoalsList() {
  const { data: session } = useSession();
  const { data, isLoading } = trpc.goal.getAll.useQuery(undefined, {
    enabled: !!session,
  });
  const goals = data?.goals;

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!goals) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {goals.map(goal => (
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
