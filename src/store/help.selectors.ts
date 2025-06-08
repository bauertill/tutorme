import { newMessage } from "@/core/help/help.domain";
import { type Message } from "@/core/help/help.types";
import { useStore } from ".";
import { useActiveProblem } from "./problem.selectors";

export const useHelp = () => {
  const messages = useStore.use.messages();
  const recommendedQuestions = useStore.use.recommendedQuestions();
  const setThreadMessages = useStore.use.setThreadMessages();
  const setThreadRecommendedQuestions =
    useStore.use.setThreadRecommendedQuestions();
  const activeProblem = useActiveProblem();
  const threadId = activeProblem?.id ?? "NONE";
  return {
    messages: messages.filter((m) => m.threadId === threadId),
    recommendedQuestions: recommendedQuestions.filter(
      (q) => q.threadId === threadId,
    ),
    newUserMessage: (content: string) =>
      newMessage({ role: "user", content, threadId }),
    newAssistantMessage: (content: string) =>
      newMessage({ role: "assistant", content, threadId }),
    setMessages: (messages: Message[]) => setThreadMessages(messages, threadId),
    setRecommendedQuestions: (questions: string[]) =>
      setThreadRecommendedQuestions(questions, threadId),
    activeProblem,
  };
};
