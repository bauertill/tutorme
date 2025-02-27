import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function TeacherReport({
  teacherReport,
  onClose,
}: {
  teacherReport: string;
  onClose: () => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Teacher Report</CardTitle>
      </CardHeader>
      <CardContent>{teacherReport}</CardContent>
      <CardFooter>
        <Button onClick={onClose}>Close</Button>
      </CardFooter>
    </Card>
  );
}
