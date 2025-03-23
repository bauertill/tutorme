import { useScrollToBottom } from "@/app/_components/layout/useScrollToBottom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useHelp } from "@/store/selectors";
import { api } from "@/trpc/react";
import { X } from "lucide-react";
import { useRef } from "react";
import MessageList from "./MessageList";
import SuggestedQuestionsList from "./SuggestedQuestionsList";
import TextInput from "./TextInput";

export default function HelpBox({
  onClose,
  getCanvasDataUrl,
}: {
  onClose?: () => void;
  getCanvasDataUrl: () => Promise<string | null>;
}) {
  const questions = [
    "How do I add two numbers?",
    "What's a number?",
    "I don't know how to do this problem at all, please send help.",
  ];
  const {
    newUserMessage,
    setMessages,
    newAssistantMessage,
    messages,
    activeProblem,
  } = useHelp();
  const ask = async (question: string) => {
    const updatedMessages = [...messages, newUserMessage(question)];
    setMessages(updatedMessages);
    askMutation({
      messages: updatedMessages,
      problem: activeProblem?.problem ?? null,
      solutionImage: await getCanvasDataUrl(),
    });
  };
  const { mutate: askMutation, isPending } = api.help.ask.useMutation({
    onSuccess: (reply) => {
      setMessages([...messages, newAssistantMessage(reply)]);
    },
    onError: (error) => {
      setMessages([...messages, newAssistantMessage(error.message)]);
    },
  });

  const container = useRef<HTMLDivElement>(null);
  useScrollToBottom(container);

  return (
    <div className="relative flex">
      <Button
        className="absolute right-2 top-2 z-10 h-8 w-8"
        variant="ghost"
        size="icon"
        onClick={() => onClose?.()}
      >
        <X className="h-4 w-4" />
      </Button>
      <Card
        ref={container}
        className="max-h-full w-60 overflow-auto text-sm [scrollbar-width:thin] md:w-72 lg:w-80 xl:w-96"
      >
        <CardContent className="p-4">
          {messages.length === 0 && <p>Are you stuck? Ask for help!</p>}
          <MessageList messages={messages} />
        </CardContent>
        <CardFooter className="flex flex-col gap-4 px-4 pb-4">
          <TextInput
            disabled={isPending}
            onSend={(question) => ask(question)}
            isLoading={isPending}
          />
          <SuggestedQuestionsList
            disabled={isPending}
            onAsk={(question) => ask(question)}
            questions={questions}
          />
        </CardFooter>
      </Card>
    </div>
  );
}
