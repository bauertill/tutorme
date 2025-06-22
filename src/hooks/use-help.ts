import { newMessage } from "@/core/help/help.domain";
import { api } from "@/trpc/react";

export const useHelp = (studentSolutionId: string) => {
  const utils = api.useUtils();
  const [messages] = api.help.getMessages.useSuspenseQuery({
    studentSolutionId,
  });
  const { mutate: addMessage } = api.help.addMessage.useMutation({
    onMutate: (message) => {
      utils.help.getMessages.setData({ studentSolutionId }, (old) => [
        ...(old ?? []),
        message,
      ]);
    },
    onSuccess: () => {
      void utils.help.getMessages.invalidate({ studentSolutionId });
    },
  });
  const [recommendedQuestions] =
    api.studentSolution.listStudentSolutions.useSuspenseQuery(undefined, {
      select: (data) =>
        data.find((s) => s.id === studentSolutionId)?.recommendedQuestions ??
        [],
    });
  const { mutate: setRecommendedQuestions } =
    api.studentSolution.setStudentSolutionRecommendedQuestions.useMutation({
      onMutate: ({ recommendedQuestions }) => {
        utils.studentSolution.listStudentSolutions.setData(undefined, (old) =>
          old?.map((s) =>
            s.id === studentSolutionId ? { ...s, recommendedQuestions } : s,
          ),
        );
      },
      onSuccess: () => {
        void utils.studentSolution.listStudentSolutions.invalidate();
      },
    });
  return {
    messages,
    recommendedQuestions,
    newUserMessage: (content: string) =>
      newMessage({ role: "user", content, studentSolutionId }),
    newAssistantMessage: (content: string) =>
      newMessage({ role: "assistant", content, studentSolutionId }),
    addMessage,
    setRecommendedQuestions: (recommendedQuestions: string[]) =>
      setRecommendedQuestions({
        studentSolutionId,
        recommendedQuestions: recommendedQuestions.map((q) => ({
          question: q,
          studentSolutionId,
        })),
      }),
  };
};
