"use client";
import { Latex } from "@/app/_components/richtext/Latex";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { api } from "@/trpc/react";
import { skipToken } from "@tanstack/react-query";
import { useState } from "react";
import { useDebounce } from "use-debounce";

export function SearchProblems() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, { flush }] = useDebounce(searchQuery, 500, {
    maxWait: 2000,
  });

  const {
    data: problems,
    isLoading,
    isError,
    error,
  } = api.problem.query.useQuery(
    debouncedQuery.length > 0 ? { query: debouncedQuery } : skipToken,
    { staleTime: 0 },
  );

  if (isError) {
    return <p>Error: {error.message}</p>;
  }

  return (
    <>
      <div className="mb-4 flex gap-2">
        <Input
          placeholder="Search problems..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              flush();
            }
          }}
        />
        <Button onClick={() => flush()}>Search</Button>
      </div>

      {isLoading ? (
        <p className="py-4 text-center">Loading...</p>
      ) : debouncedQuery.length > 0 && problems?.length === 0 ? (
        <p className="py-4 text-center">No problems found</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {problems?.map(({ problem, score }) => (
            <Card key={problem.id} className="flex flex-col">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="">
                    {problem.dataSource} | {problem.level} | {problem.type}
                  </CardTitle>
                  <Badge variant="outline">{score.toFixed(2)}</Badge>
                </div>
              </CardHeader>
              <CardContent className="pb-2 pt-0">
                <p className="text-sm">
                  <Latex>{problem.problem}</Latex>
                </p>
                <Separator className="my-4" />
                <p className="text-sm">
                  <Latex>{problem.solution}</Latex>
                </p>
              </CardContent>
              <CardFooter></CardFooter>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
