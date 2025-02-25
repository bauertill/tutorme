import { UserAndSignOutButton } from "@/app/_components/UserAndSignOutButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireSession } from "@/server/auth";
import { CreateGoalButton } from "../goal/_components/CreateGoalButton";
import { GoalsList } from "../goal/_components/GoalsList";
import FileUploadButton from "./_components/FileUploadButton";

export default async function DashboardPage() {
  const { user } = await requireSession();

  return (
    <div className="mx-auto max-w-screen-md space-y-12">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Welcome to your Dashboard</h1>
        <UserAndSignOutButton user={user} />
      </div>
      <Card className="">
        <CardHeader>
          <CardTitle>
            <div className="flex items-center justify-between">
              Learning Goals
              <div className="flex items-center gap-2">
                <FileUploadButton />
                <CreateGoalButton />
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <GoalsList />
        </CardContent>
      </Card>
    </div>
  );
}
