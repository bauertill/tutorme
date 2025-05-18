import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { api } from "@/trpc/react";
import { UploadAdminProblems } from "./UploadAdminProblems";

export function ProblemManagement() {
  const {
    data: userProblems,
    isLoading,
    error,
  } = api.assignment.getUserProblems.useQuery();

  return (
    <div className="space-y-4">
      <div className="flex w-full flex-row items-start justify-between">
        <CardTitle>Problem Management</CardTitle>
        <UploadAdminProblems />
      </div>
      {isLoading && <div>Loading user problems...</div>}
      {error && <div className="text-red-500">Error loading user problems</div>}
      {userProblems && userProblems.length === 0 && (
        <div>No user problems found.</div>
      )}
      <div className="grid grid-cols-1 gap-4">
        {userProblems &&
          userProblems.map((problem) => (
            <Card key={problem.id}>
              <CardContent>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="font-semibold">{problem.problem}</div>
                    <div className="text-sm text-gray-500">
                      Status: {problem.status}
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-400 md:mt-0">
                    Created: {new Date(problem.createdAt).toLocaleString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );
}
