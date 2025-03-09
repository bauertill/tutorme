import { Latex } from "@/app/_components/Latex";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function FeedbackView({
  isCorrect,
  feedback,
}: {
  isCorrect: boolean;
  feedback: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Feedback: {isCorrect ? "Correct" : "Incorrect"}</CardTitle>
      </CardHeader>
      <CardContent className="whitespace-pre-wrap pb-16">
        <Latex>{feedback}</Latex>
      </CardContent>
    </Card>
  );
}
