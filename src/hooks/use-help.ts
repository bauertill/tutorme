import { newMessage } from "@/core/help/help.domain";
import { api } from "@/trpc/react";

export const useHelp = (studentSolutionId: string) => {
  const utils = api.useUtils();
  const hasId = Boolean(studentSolutionId);

  const messagesQuery = api.help.getMessages.useQuery(
    { studentSolutionId },
    {
      enabled: hasId,
      initialData: [] as ReturnType<typeof newMessage>[],
    },
  );
  const messages = messagesQuery.data ?? [];

  const { mutate: addMessage } = api.help.addMessage.useMutation({
    onMutate: (message) => {
      if (!hasId) return;
      utils.help.getMessages.setData({ studentSolutionId }, (old) => [
        ...(old ?? []),
        message,
      ]);
    },
    onSuccess: () => {
      if (!hasId) return;
      void utils.help.getMessages.invalidate({ studentSolutionId });
    },
  });

  const studentSolutionsQuery =
    api.studentSolution.listStudentSolutions.useQuery(undefined, {
      enabled: hasId,
      initialData: [],
    });
  const recommendedQuestions = hasId
    ? ((studentSolutionsQuery.data ?? []).find(
        (s) => s.id === studentSolutionId,
      )?.recommendedQuestions ?? [])
    : [];

  const { mutate: setRecommendedQuestionsMutation } =
    api.studentSolution.setStudentSolutionRecommendedQuestions.useMutation({
      onMutate: ({ recommendedQuestions }) => {
        if (!hasId) return;
        utils.studentSolution.listStudentSolutions.setData(undefined, (old) =>
          old?.map((s) =>
            s.id === studentSolutionId ? { ...s, recommendedQuestions } : s,
          ),
        );
      },
      onSuccess: () => {
        if (!hasId) return;
        void utils.studentSolution.listStudentSolutions.invalidate();
      },
    });

  const setRecommendedQuestions = (recommended: string[]) => {
    if (!hasId) return;
    setRecommendedQuestionsMutation({
      studentSolutionId,
      recommendedQuestions: recommended.map((q) => ({
        question: q,
        studentSolutionId,
      })),
    });
  };

  return {
    messages,
    recommendedQuestions,
    newUserMessage: (content: string) =>
      newMessage({ role: "user", content, studentSolutionId }),
    newAssistantMessage: (content: string) =>
      newMessage({ role: "assistant", content, studentSolutionId }),
    addMessage,
    setRecommendedQuestions,
  };
};
