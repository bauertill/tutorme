import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Exercise } from "./_components/Exercise";

export default function ExercisePage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Exercise</CardTitle>
      </CardHeader>
      <CardContent>
        <Exercise exerciseText={`Solve for x: 2x + 3 = 11`} />
      </CardContent>
    </Card>
  );
}
