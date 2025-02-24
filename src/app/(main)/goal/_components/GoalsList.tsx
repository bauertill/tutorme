"use client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/trpc/react";
import Link from "next/link";

export function GoalsList() {
  const { data: goals, isPending, isError } = api.goal.all.useQuery();

  if (isError) {
    return <div>Error loading goals</div>;
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {isPending
        ? Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full p-4" />
          ))
        : goals?.map((goal) => (
            <Button
              key={goal.id}
              variant="secondary"
              className="h-auto justify-start p-4"
              asChild
            >
              <Link href={`/goal/${goal.id}`}>
                <h2 className="truncate text-inherit">{goal.name}</h2>
              </Link>
            </Button>
          ))}
    </div>
  );
}
