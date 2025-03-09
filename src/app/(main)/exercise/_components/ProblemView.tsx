import { Latex } from "@/app/_components/Latex";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProblemView() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Exercise</CardTitle>
      </CardHeader>
      <CardContent className="whitespace-pre-wrap">
        <Latex>{`Solve for x: 2x + 3 = 11`}</Latex>
      </CardContent>
    </Card>
  );
}
