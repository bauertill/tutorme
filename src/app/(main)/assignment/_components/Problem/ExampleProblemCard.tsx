import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/trpc/react";
import { ArrowRight, BookOpen } from "lucide-react";
import { toast } from "sonner";

export default function ExampleProblemCard() {
  const utils = api.useUtils();

  const { mutate: createExampleAssignment } =
    api.assignment.createExampleAssignment.useMutation({
      onSuccess: () => {
        void utils.assignment.getStudentProblems.invalidate();
      },
      onError: (error) => {
        toast.error("Example assignment not available: " + error.message);
      },
    });

  const handleClick = () => {
    createExampleAssignment();
  };

  return (
    <Card className="w-full cursor-pointer transition-all hover:shadow-md">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
              <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold">Try Example Problem</h3>
              <p className="text-sm text-muted-foreground">
                Sample math problem (Coming Soon)
              </p>
            </div>
          </div>
          <Button
            onClick={handleClick}
            variant="ghost"
            size="sm"
            className="text-blue-600 hover:text-blue-700"
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
