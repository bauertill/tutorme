import { Latex } from "@/app/_components/richtext/Latex";
import { Button } from "@/components/ui/button";
import { type RecommendedQuestion } from "@/core/help/types";
export default function RecommendedQuestionsList({
  disabled,
  onAsk,
  questions,
}: {
  disabled: boolean;
  onAsk: (question: string) => void;
  questions: RecommendedQuestion[];
}) {
  return (
    <div className="flex flex-col gap-2">
      {questions.map((question) => (
        <Button
          key={question.question}
          variant="outline"
          className="h-auto w-full whitespace-normal font-normal text-muted-foreground"
          onClick={() => onAsk(question.question)}
          disabled={disabled}
        >
          <Latex>{question.question}</Latex>
        </Button>
      ))}
    </div>
  );
}
