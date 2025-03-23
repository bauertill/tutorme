import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useHelp } from "@/store/selectors";
import { api } from "@/trpc/react";
import { Loader2, X } from "lucide-react";
import { useState, type KeyboardEvent } from "react";

export default function HelpBox({ onClose }: { onClose?: () => void }) {
  const [inputValue, setInputValue] = useState("");
  const questions = [
    "How do I add two numbers?",
    "What's a number?",
    "I don't know how to do this problem at all, please send help.",
  ];
  const { addUserMessage, addAssistantMessage, messages } = useHelp();
  const { mutate: ask, isPending } = api.help.ask.useMutation({
    onMutate: ({ question }) => {
      addUserMessage(question);
      setInputValue("");
    },
    onSuccess: (data) => {
      addAssistantMessage(data);
    },
    onError: (error) => {
      addAssistantMessage(error.message);
    },
  });
  const onReturn = (event: KeyboardEvent<HTMLInputElement>) => {
    if (inputValue.trim() && event.key === "Enter") {
      ask({ question: inputValue });
    }
  };
  return (
    <div className="relative flex overflow-auto">
      <Button
        className="absolute right-2 top-1 z-10"
        variant="ghost"
        size="icon"
        onClick={() => onClose?.()}
      >
        <X className="h-4 w-4" />
      </Button>
      <Card className="max-h-full w-60 overflow-auto text-sm md:w-72 lg:w-80 xl:w-96">
        <CardContent className="p-4">
          {messages.length === 0 && <p>Are you stuck? Ask for help!</p>}
          {messages.map((message) => (
            <p key={message.id}>{message.content}</p>
          ))}
        </CardContent>
        <CardFooter className="flex flex-col gap-2 px-4 pb-4">
          <div className="relative flex w-full items-center">
            <Input
              placeholder="Enter question here..."
              onKeyDown={onReturn}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isPending}
            />
            {isPending && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            )}
          </div>
          {questions.map((question) => (
            <Button
              key={question}
              variant="outline"
              className="h-auto w-full whitespace-normal font-normal text-muted-foreground"
              onClick={() => ask({ question })}
              disabled={isPending}
            >
              {question}
            </Button>
          ))}
        </CardFooter>
      </Card>
    </div>
  );
}
