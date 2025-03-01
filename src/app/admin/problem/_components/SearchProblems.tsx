"use client";
import { Latex } from "@/app/_components/Latex";
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
import { useState } from "react";

export function SearchProblems() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  const { data: problems, isLoading } = api.problem.query.useQuery(
    { query: debouncedQuery },
    { enabled: debouncedQuery.length > 0 },
  );

  const handleSearch = () => {
    setDebouncedQuery(searchQuery);
  };

  return (
    <>
      <div className="mb-4 flex gap-2">
        <Input
          placeholder="Search problems..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearch();
            }
          }}
        />
        <Button onClick={handleSearch}>Search</Button>
      </div>

      {isLoading && <p>Loading...</p>}

      {problems && problems.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {problems.map(({ problem, score }) => (
            <Card key={problem.id} className="flex flex-col">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="">
                    {problem.dataset} | {problem.level} | {problem.type}
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
      ) : (
        debouncedQuery.length > 0 &&
        !isLoading && <p className="py-4 text-center">No problems found</p>
      )}
    </>
  );
}
