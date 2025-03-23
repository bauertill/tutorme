import { Button } from "@/components/ui/button";

export default function SuggestedQuestionsList({
  disabled,
  onAsk,
  questions,
}: {
  disabled: boolean;
  onAsk: (question: string) => void;
  questions: string[];
}) {
  return (
    <>
      {questions.map((question) => (
        <Button
          key={question}
          variant="outline"
          className="h-auto w-full whitespace-normal font-normal text-muted-foreground"
          onClick={() => onAsk(question)}
          disabled={disabled}
        >
          {question}
        </Button>
      ))}
    </>
  );
}
