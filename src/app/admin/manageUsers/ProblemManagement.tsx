import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UploadAdminProblems } from "./UploadAdminProblems";

export function ProblemManagement() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Problem Management</CardTitle>
        </CardHeader>
        <CardContent>
          <UploadAdminProblems trigger="card" />
        </CardContent>
      </Card>
    </div>
  );
}
