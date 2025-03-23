import { Latex } from "@/app/_components/richtext/Latex";
import { Button } from "@/components/ui/button";

export default function RecommendedQuestionsList({
  disabled,
  onAsk,
  questions,
}: {
  disabled: boolean;
  onAsk: (question: string) => void;
  questions: string[];
}) {
  return (
    <div className="flex flex-col gap-2">
      {questions.map((question) => (
        <Button
          key={question}
          variant="outline"
          className="h-auto w-full whitespace-normal font-normal text-muted-foreground"
          onClick={() => onAsk(question)}
          disabled={disabled}
        >
          <Latex>{question}</Latex>
        </Button>
      ))}
    </div>
  );
}
