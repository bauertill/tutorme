import ResizableDiv from "@/app/(main)/assignment/_components/Canvas/HelpButton/ResizableDiv";
import { useScrollToBottom } from "@/app/_components/layout/useScrollToBottom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { type RecommendedQuestion as RecommendedQuestionType } from "@/core/help/help.types";
import { useHelp } from "@/hooks/use-help";
import { Trans, useTranslation } from "@/i18n/react";
import { cn } from "@/lib/utils";
import { useStore } from "@/store";
import { useActiveProblem } from "@/store/problem.selectors";
import { api } from "@/trpc/react";
import { X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import MessageList from "./MessageList";
import RecommendedQuestionsList from "./RecommendedQuestionsList";
import TextInput from "./TextInput";

export default function HelpBox({
  onClose,
  getCanvasDataUrl,
  studentSolutionId,
  isSubmitting,
}: {
  onClose?: () => void;
  getCanvasDataUrl: () => Promise<string | null>;
  studentSolutionId: string;
  isSubmitting?: boolean;
}) {
  const setUsageLimitReached = useStore.use.setUsageLimitReached();
  const activeProblem = useActiveProblem();
  const {
    messages,
    addMessage,
    recommendedQuestions,
    setRecommendedQuestions,
    newUserMessage,
    newAssistantMessage,
  } = useHelp(studentSolutionId);

  const hasStudentSolution = Boolean(studentSolutionId);
  const [fallbackQuestions, setFallbackQuestions] = useState<string[]>([]);
  const [localMessages, setLocalMessages] = useState<
    ReturnType<typeof newUserMessage>[]
  >([]);

  const displayedMessages = hasStudentSolution ? messages : localMessages;

  const { t } = useTranslation();
  const askMutation = api.help.ask.useMutation({
    onMutate: () => {
      if (hasStudentSolution) setRecommendedQuestions([]);
      else setFallbackQuestions([]);
    },
    onSuccess: (reply) => {
      if (hasStudentSolution) {
        addMessage(newAssistantMessage(reply.reply));
        setRecommendedQuestions(reply.followUpQuestions);
      } else {
        setLocalMessages((prev) => [...prev, newAssistantMessage(reply.reply)]);
        setFallbackQuestions(reply.followUpQuestions);
      }
    },
    onError: (error) => {
      if (error.message === "Free tier limit reached") {
        setUsageLimitReached(true);
      } else {
        const msg = newAssistantMessage(error.message);
        if (hasStudentSolution) addMessage(msg);
        else setLocalMessages((prev) => [...prev, msg]);
      }
    },
  });

  const ask = async (question: string) => {
    const userMsg = newUserMessage(question);
    if (hasStudentSolution) addMessage(userMsg);
    else setLocalMessages((prev) => [...prev, userMsg]);

    askMutation.mutate({
      problemId: activeProblem?.id ?? "",
      messages: [...displayedMessages, userMsg],
      problem: activeProblem?.problem ?? "",
      solutionImage: await getCanvasDataUrl(),
    });
  };

  const thumbsDownMutation = api.help.setMessageThumbsDown.useMutation({
    onMutate: () => {
      if (hasStudentSolution) setRecommendedQuestions([]);
      else setFallbackQuestions([]);
    },
    onSuccess: (reply) => {
      if (hasStudentSolution) {
        addMessage(newAssistantMessage(reply.reply));
        setRecommendedQuestions(reply.followUpQuestions);
      } else {
        setLocalMessages((prev) => [...prev, newAssistantMessage(reply.reply)]);
        setFallbackQuestions(reply.followUpQuestions);
      }
    },
    onError: (error) => {
      if (error.message === "Free tier limit reached") {
        setUsageLimitReached(true);
      } else {
        const msg = newAssistantMessage(error.message);
        if (hasStudentSolution) addMessage(msg);
        else setLocalMessages((prev) => [...prev, msg]);
      }
    },
  });

  const handleThumbsDown = async () => {
    const msg = newUserMessage(t("badResponseButton"));
    if (hasStudentSolution) addMessage(msg);
    else setLocalMessages((prev) => [...prev, msg]);

    thumbsDownMutation.mutate({
      problemId: activeProblem?.id ?? "",
      messages: [...displayedMessages, msg],
      problem: activeProblem?.problem ?? "",
      solutionImage: await getCanvasDataUrl(),
    });
  };

  const { mutate: recommendQuestions, isPending: isRecommendQuestionsPending } =
    api.help.recommendQuestions.useMutation({
      onSuccess: (questions) => {
        if (hasStudentSolution) setRecommendedQuestions(questions);
        else setFallbackQuestions(questions);
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
        !hasStudentSolution ||
        (recommendedQuestions.length === 0 &&
          messages.length === 0 &&
          activeProblem &&
          !isRecommendQuestionsPending)
      ) {
        recommendQuestions({
          problem: activeProblem?.problem ?? "",
          solutionImage: await getCanvasDataUrl(),
        });
      }
    }, [
      hasStudentSolution,
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

  const questionsToShow: RecommendedQuestionType[] = isSubmitting
    ? recommendedQuestions
    : hasStudentSolution
      ? recommendedQuestions.length > 0
        ? recommendedQuestions
        : fallbackQuestions.map((q) => ({
            question: q,
            studentSolutionId: studentSolutionId,
          }))
      : fallbackQuestions.map((q) => ({
          question: q,
          studentSolutionId: "",
        }));

  useEffect(() => {
    if (
      hasStudentSolution &&
      recommendedQuestions.length === 0 &&
      fallbackQuestions.length > 0
    ) {
      setRecommendedQuestions(fallbackQuestions);
    }
  }, [
    hasStudentSolution,
    recommendedQuestions,
    fallbackQuestions,
    setRecommendedQuestions,
  ]);

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
      <ResizableDiv className={cn("h-full w-[35vw] overflow-hidden")}>
        <Card
          ref={container}
          className={cn(
            "flex h-full w-full flex-col justify-between overflow-auto text-sm",
            "[scrollbar-width:thin]",
            "[scrollbar-color:hsl(var(--muted))_transparent]",
          )}
        >
          {displayedMessages.length === 0 ? (
            <CardContent className="flex h-full w-full items-center justify-center p-4">
              <Trans i18nKey="help_box_empty_message" />
            </CardContent>
          ) : (
            <CardContent className="p-4">
              <MessageList
                messages={displayedMessages}
                onThumbsDown={() => void handleThumbsDown()}
              />
            </CardContent>
          )}
          <CardFooter className="flex flex-col gap-4 px-4 pb-4">
            <RecommendedQuestionsList
              disabled={askMutation.isPending}
              onAsk={(question) => ask(question)}
              questions={questionsToShow}
            />
            <TextInput
              disabled={askMutation.isPending}
              onSend={(question) => ask(question)}
              isLoading={askMutation.isPending}
            />
          </CardFooter>
        </Card>
      </ResizableDiv>
    </div>
  );
}
