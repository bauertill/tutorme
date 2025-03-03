"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function LessonSkeleton() {
  return (
    <div className="mt-6 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-6 w-[250px]" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Simulate multiple turns */}
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="my-2 rounded bg-muted p-3">
              <Skeleton className="mb-2 h-4 w-[100px]" />
              <Skeleton className="h-16 w-full" />
            </div>
          ))}

          {/* Simulate response area */}
          <div className="mt-4 space-y-3">
            <Skeleton className="h-4 w-[120px]" />
            <Skeleton className="h-[144px] w-full" />
            <div className="flex justify-end gap-2">
              <Skeleton className="h-10 w-[100px]" />
              <Skeleton className="h-10 w-[120px]" />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <div className="flex w-full justify-between gap-2">
            <Skeleton className="h-4 w-[300px]" />
            <Skeleton className="h-10 w-[120px]" />
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
