import { CardTitle } from "@/components/ui/card";
import { UploadAdminProblems } from "./UploadAdminProblems";

export function ProblemManagement() {
  return (
    <div className="space-y-4">
      <div className="flex w-full flex-row items-start justify-between">
        <CardTitle>Problem Management</CardTitle>

        <UploadAdminProblems />
      </div>
    </div>
  );
}
