import { type StudentAssignment } from "@/core/assignment/assignment.types";
import { newMessage } from "@/core/help/help.domain";
import { type Message } from "@/core/help/help.types";
import { type Problem } from "@/core/problem/problem.types";
import {
  type EvaluationResult,
  type StudentSolution,
} from "@/core/studentSolution/studentSolution.types";
import { useCallback, useEffect, useMemo } from "react";
import { useDebouncedCallback } from "use-debounce";
import { useStore } from ".";

export const useActiveAssignment = (): StudentAssignment | null => {
  const assignmentId = useStore.use.activeAssignmentId();
  const assignments = useStore.use.assignments();
  const assignment = assignments.find((a) => a.id === assignmentId);
  return assignment ?? assignments[0] ?? null;
};

export const useActiveProblem = (): Problem | null => {
  const assignment = useActiveAssignment();
  const problemId = useStore.use.activeProblemId();
  const problem = assignment?.problems.find((p) => p.id === problemId) ?? null;
  return problem ?? assignment?.problems[0] ?? null;
};

export const useProblemController = (): {
  activeAssignment: StudentAssignment | null;
  activeProblem: Problem | null;
  activeStudentSolution: StudentSolution | null;
  nextProblem?: Problem;
  previousProblem?: Problem;
  gotoNextProblem: () => void;
  gotoNextUnsolvedProblem?: () => void;
  gotoPreviousProblem: () => void;
  setActiveProblemWithCanvas: (problem: Problem) => void;
} => {
  const setActiveProblem = useStore.use.setActiveProblem();
  const setCanvas = useStore.use.setCanvas();
  const paths = useStore.use.paths();
  const storeCurrentPathsOnStudentSolution =
    useStore.use.storeCurrentPathsOnStudentSolution();

  const activeAssignment = useActiveAssignment();
  const activeProblem = useActiveProblem();
  const activeProblemIndex =
    activeAssignment?.problems.findIndex((p) => p.id === activeProblem?.id) ??
    0;
  const studentSolutions = useStore.use.studentSolutions();
  const activeStudentSolution = useMemo(
    () =>
      studentSolutions.find(
        (s) =>
          s.problemId === activeProblem?.id &&
          s.studentAssignmentId === activeAssignment?.id,
      ) ?? null,
    [activeProblem, activeAssignment, studentSolutions],
  );

  const debouncedStorePaths = useDebouncedCallback(
    useCallback(() => {
      if (!activeProblem || !activeAssignment) return;
      storeCurrentPathsOnStudentSolution(
        activeProblem.id,
        activeAssignment.id,
        paths,
      );
    }, [
      activeProblem,
      activeAssignment,
      paths,
      storeCurrentPathsOnStudentSolution,
    ]),
    5000,
    { leading: true, trailing: true, maxWait: 5000 },
  );
  useEffect(debouncedStorePaths, [paths, debouncedStorePaths]);

  const nextProblem = activeAssignment?.problems[activeProblemIndex + 1];
  const nextUnsolvedProblem =
    activeAssignment?.problems.find((p, idx) => {
      const studentSolution = studentSolutions.find(
        (s) =>
          s.problemId === p.id &&
          s.studentAssignmentId === activeAssignment?.id,
      );
      return studentSolution?.status !== "SOLVED" && idx > activeProblemIndex;
    }) ??
    activeAssignment?.problems.find((p) => {
      const studentSolution = studentSolutions.find(
        (s) =>
          s.problemId === p.id &&
          s.studentAssignmentId === activeAssignment?.id,
      );
      return studentSolution?.status !== "SOLVED";
    });
  const previousProblem = activeAssignment?.problems[activeProblemIndex - 1];

  const gotoNextProblem = useCallback(() => {
    if (!nextProblem || !activeAssignment) return;
    storeCurrentPathsOnStudentSolution(
      activeProblem?.id ?? "",
      activeAssignment.id,
      paths,
    );
    setActiveProblem(nextProblem, activeAssignment.id);
    const studentSolution = studentSolutions.find(
      (s) =>
        s.problemId === nextProblem.id &&
        s.studentAssignmentId === activeAssignment.id,
    );
    setCanvas(studentSolution?.canvas ?? { paths: [] });
  }, [
    activeProblem,
    paths,
    nextProblem,
    setActiveProblem,
    setCanvas,
    storeCurrentPathsOnStudentSolution,
    activeAssignment,
    studentSolutions,
  ]);
  const gotoNextUnsolvedProblem = nextUnsolvedProblem
    ? () => {
        if (!activeAssignment) return;
        storeCurrentPathsOnStudentSolution(
          activeProblem?.id ?? "",
          activeAssignment.id,
          paths,
        );
        setActiveProblem(nextUnsolvedProblem, activeAssignment.id);
        const studentSolution = studentSolutions.find(
          (s) =>
            s.problemId === nextUnsolvedProblem.id &&
            s.studentAssignmentId === activeAssignment.id,
        );
        setCanvas(studentSolution?.canvas ?? { paths: [] });
      }
    : undefined;
  const gotoPreviousProblem = useCallback(() => {
    if (!previousProblem || !activeAssignment) return;
    storeCurrentPathsOnStudentSolution(
      activeProblem?.id ?? "",
      activeAssignment.id,
      paths,
    );
    setActiveProblem(previousProblem, activeAssignment.id);
    const studentSolution = studentSolutions.find(
      (s) =>
        s.problemId === previousProblem.id &&
        s.studentAssignmentId === activeAssignment.id,
    );
    setCanvas(studentSolution?.canvas ?? { paths: [] });
  }, [
    activeProblem,
    paths,
    previousProblem,
    activeAssignment,
    setActiveProblem,
    setCanvas,
    storeCurrentPathsOnStudentSolution,
    studentSolutions,
  ]);

  const setActiveProblemWithCanvas = (problem: Problem) => {
    if (!activeAssignment) return;
    storeCurrentPathsOnStudentSolution(
      activeProblem?.id ?? "",
      activeAssignment.id,
      paths,
    );
    setActiveProblem(problem, activeAssignment.id);
    const studentSolution = studentSolutions.find(
      (s) =>
        s.problemId === problem.id &&
        s.studentAssignmentId === activeAssignment.id,
    );
    setCanvas(studentSolution?.canvas ?? { paths: [] });
  };

  return {
    activeAssignment,
    activeProblem,
    activeStudentSolution,
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
    studentAssignmentId: string,
    evaluationResult: EvaluationResult,
  ) => void;
} => {
  const activeProblem = useActiveProblem();
  const activeAssignment = useActiveAssignment();
  const upsertStudentSolutions = useStore.use.upsertStudentSolutions();
  const studentSolutions = useStore.use.studentSolutions();
  const evaluationResult =
    studentSolutions.find(
      (s) =>
        s.problemId === activeProblem?.id &&
        s.studentAssignmentId === activeAssignment?.id,
    )?.evaluation ?? null;
  if (!activeProblem) {
    return { evaluationResult, setEvaluationResult: () => null };
  }
  const setEvaluationResult = (
    problemId: string,
    studentAssignmentId: string,
    evaluationResult: EvaluationResult,
  ) => {
    const studentSolution = studentSolutions.find(
      (s) =>
        s.problemId === problemId &&
        s.studentAssignmentId === studentAssignmentId,
    );
    if (!studentSolution) {
      return;
    }
    const newStudentSolution: StudentSolution = {
      ...studentSolution,
      evaluation: evaluationResult,
      updatedAt: new Date(),
    };
    const isCorrect =
      evaluationResult.isComplete && !evaluationResult.hasMistakes;
    if (isCorrect) newStudentSolution.status = "SOLVED";
    else newStudentSolution.status = "IN_PROGRESS";
    upsertStudentSolutions([newStudentSolution]);
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
