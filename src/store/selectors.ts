import {
  type Assignment,
  type EvaluationResult,
  type UserProblem,
} from "@/core/assignment/types";
import { newMessage } from "@/core/help/helpDomain";
import { type Message } from "@/core/help/types";
import { useCallback } from "react";
import { useStore } from ".";

export const useActiveAssignment = (): Assignment | null => {
  const assignmentId = useStore.use.activeAssignmentId();
  const assignments = useStore.use.assignments();
  const assignment = assignments.find((a) => a.id === assignmentId);
  return assignment ?? assignments[0] ?? null;
};

export const useActiveProblem = (): UserProblem | null => {
  const assignment = useActiveAssignment();
  const problemId = useStore.use.activeProblemId();
  const problem = assignment?.problems.find((p) => p.id === problemId) ?? null;
  return problem ?? assignment?.problems[0] ?? null;
};

export const useProblemController = (): {
  activeAssignment: Assignment | null;
  activeProblem: UserProblem | null;
  nextProblem?: UserProblem;
  previousProblem?: UserProblem;
  gotoNextProblem: () => void;
  gotoNextUnsolvedProblem?: () => void;
  gotoPreviousProblem: () => void;
  setActiveProblemWithCanvas: (problem: UserProblem) => void;
} => {
  const setActiveProblem = useStore.use.setActiveProblem();
  const setCanvas = useStore.use.setCanvas();
  const storeCurrentPathsOnProblem = useStore.use.storeCurrentPathsOnProblem();

  const activeAssignment = useActiveAssignment();
  const activeProblem = useActiveProblem();
  const activeProblemIndex =
    activeAssignment?.problems.findIndex((p) => p.id === activeProblem?.id) ??
    0;

  const nextProblem = activeAssignment?.problems[activeProblemIndex + 1];
  const nextUnsolvedProblem =
    activeAssignment?.problems.find(
      (p, idx) => p.status !== "SOLVED" && idx > activeProblemIndex,
    ) ?? activeAssignment?.problems.find((p) => p.status !== "SOLVED");
  const previousProblem = activeAssignment?.problems[activeProblemIndex - 1];

  const gotoNextProblem = useCallback(() => {
    if (!nextProblem) return;
    storeCurrentPathsOnProblem();
    setActiveProblem(nextProblem);
    setCanvas(nextProblem.canvas ?? { paths: [] });
  }, [nextProblem, setActiveProblem, setCanvas, storeCurrentPathsOnProblem]);
  const gotoNextUnsolvedProblem = nextUnsolvedProblem
    ? () => {
        storeCurrentPathsOnProblem();
        setActiveProblem(nextUnsolvedProblem);
        setCanvas(nextUnsolvedProblem.canvas ?? { paths: [] });
      }
    : undefined;
  const gotoPreviousProblem = useCallback(() => {
    if (!previousProblem) return;
    storeCurrentPathsOnProblem();
    setActiveProblem(previousProblem);
    setCanvas(previousProblem.canvas ?? { paths: [] });
  }, [
    previousProblem,
    setActiveProblem,
    setCanvas,
    storeCurrentPathsOnProblem,
  ]);

  const setActiveProblemWithCanvas = (problem: UserProblem) => {
    storeCurrentPathsOnProblem();
    setActiveProblem(problem);
    setCanvas(problem.canvas ?? { paths: [] });
  };

  return {
    activeAssignment,
    activeProblem,
    nextProblem,
    previousProblem,
    gotoNextProblem,
    gotoNextUnsolvedProblem,
    gotoPreviousProblem,
    setActiveProblemWithCanvas,
  };
};

export const useEvaluationResult = (): {
  evaluationResult: EvaluationResult | null;
  setEvaluationResult: (
    problemId: string,
    evaluationResult: EvaluationResult,
  ) => void;
} => {
  const activeProblem = useActiveProblem();
  const updateProblem = useStore.use.updateProblem();
  const evaluationResult = activeProblem?.evaluation ?? null;
  if (!activeProblem) {
    return { evaluationResult, setEvaluationResult: () => null };
  }
  const setEvaluationResult = (
    problemId: string,
    evaluationResult: EvaluationResult,
  ) => {
    if (activeProblem.id !== problemId) {
      return;
    }
    const newProblem: UserProblem = {
      ...activeProblem,
      evaluation: evaluationResult,
      updatedAt: new Date(),
    };
    const isCorrect =
      evaluationResult.isComplete && !evaluationResult.hasMistakes;
    if (isCorrect) newProblem.status = "SOLVED";
    else newProblem.status = "IN_PROGRESS";
    updateProblem(newProblem);
  };
  return { evaluationResult, setEvaluationResult };
};

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
