import { useScrollToBottom } from "@/app/_components/layout/useScrollToBottom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Trans } from "@/i18n/react";
import { cn } from "@/lib/utils";
import { useStore } from "@/store";
import { useHelp } from "@/store/selectors";
import { api } from "@/trpc/react";
import { X } from "lucide-react";
import { useCallback, useEffect, useRef } from "react";
import { useDebouncedCallback } from "use-debounce";
import MessageList from "./MessageList";
import RecommendedQuestionsList from "./RecommendedQuestionsList";
import TextInput from "./TextInput";

export default function HelpBox({
  onClose,
  getCanvasDataUrl,
}: {
  onClose?: () => void;
  getCanvasDataUrl: () => Promise<string | null>;
}) {
  const setUsageLimitReached = useStore.use.setUsageLimitReached();
  const {
    messages,
    setMessages,
    recommendedQuestions,
    setRecommendedQuestions,
    newUserMessage,
    newAssistantMessage,
    activeProblem,
  } = useHelp();
  const ask = async (question: string) => {
    const updatedMessages = [...messages, newUserMessage(question)];
    setMessages(updatedMessages);
    askMutation.mutate({
      problemId: activeProblem?.id ?? "",
      messages: updatedMessages,
      problem: activeProblem?.problem ?? null,
      solutionImage: await getCanvasDataUrl(),
    });
  };
  const askMutation = api.help.ask.useMutation({
    onMutate: () => {
      setRecommendedQuestions([]);
    },
    onSuccess: (reply) => {
      setMessages([...messages, newAssistantMessage(reply.reply)]);
      setRecommendedQuestions(reply.followUpQuestions);
    },
    onError: (error) => {
      if (error.message === "Free tier limit reached") {
        setUsageLimitReached(true);
      } else {
        setMessages([...messages, newAssistantMessage(error.message)]);
      }
    },
  });
  const { mutate: recommendQuestions, isPending: isRecommendQuestionsPending } =
    api.help.recommendQuestions.useMutation({
      onSuccess: (questions) => {
        setRecommendedQuestions(questions);
      },
      onError: (error) => {
        if (error.message === "Free tier limit reached") {
          setUsageLimitReached(true);
        }
      },
    });

  const debouncedRecommendQuestions = useDebouncedCallback(
    useCallback(async () => {
      if (
        recommendedQuestions.length === 0 &&
        messages.length === 0 &&
        activeProblem &&
        !isRecommendQuestionsPending
      ) {
        recommendQuestions({
          problem: activeProblem.problem,
          solutionImage: await getCanvasDataUrl(),
        });
      }
    }, [
      recommendedQuestions,
      messages,
      activeProblem,
      isRecommendQuestionsPending,
      recommendQuestions,
      getCanvasDataUrl,
    ]),
    100,
  );

  useEffect(() => {
    void debouncedRecommendQuestions();
  }, [debouncedRecommendQuestions]);

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
        className={cn(
          "max-h-full w-60 overflow-auto text-sm md:w-72 lg:w-80 xl:w-96",
          "[scrollbar-width:thin]",
          "[scrollbar-color:hsl(var(--muted))_transparent]",
        )}
      >
        <CardContent className="p-4">
          {messages.length === 0 && (
            <p>
              <Trans i18nKey="help_box_empty_message" />
            </p>
          )}
          <MessageList messages={messages} />
        </CardContent>
        <CardFooter className="flex flex-col gap-4 px-4 pb-4">
          <TextInput
            disabled={askMutation.isPending}
            onSend={(question) => ask(question)}
            isLoading={askMutation.isPending}
          />
          <RecommendedQuestionsList
            disabled={askMutation.isPending}
            onAsk={(question) => ask(question)}
            questions={recommendedQuestions}
          />
        </CardFooter>
      </Card>
    </div>
  );
}
