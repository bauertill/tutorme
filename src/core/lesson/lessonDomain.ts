import type { DBAdapter } from "../adapters/dbAdapter";
import type { LLMAdapter } from "../adapters/llmAdapter";
import { createLessonFromProblem } from "../adapters/llmAdapter/lesson";
import { NextLessonAction } from "../adapters/llmAdapter/lesson/decideNextLessonAction";
import { updateConceptMasteryLevelAndTeacherReport } from "../concept/conceptDomain";
import { Concept } from "../concept/types";
import { Problem } from "../problem/types";
import type { Lesson, LessonStatus, LessonTurn } from "./types";

// @TODO understand why scores are so low :/
const CUTOFF_SCORE = 0;

async function chooseNextProblemForConcept(
  concept: Concept,
  userId: string,
  dbAdapter: DBAdapter,
  llmAdapter: LLMAdapter,
): Promise<{ problem: Problem; lessonGoal: string }> {
  // Fetch previous lessons for this concept to extract their goals
  const previousLessons = await dbAdapter.getLessonsByConceptId(concept.id);
  const previousLessonGoals = previousLessons.map(
    (lesson) => lesson.lessonGoal,
  );

  // @TODO make this a single function
  // Pass previous lesson goals to help the LLM generate a new, different goal
  const { lessonGoal, exercise } =
    await llmAdapter.lesson.createLessonGoalAndDummyExercise(
      concept,
      userId,
      previousLessonGoals,
    );

  const query = `Lesson goal: ${lessonGoal}\nExercise: ${exercise}`;
  const blackListProblemIds = previousLessons.map((lesson) => lesson.problemId);
  const relevantProblems = await dbAdapter.queryProblems(
    query,
    10,
    blackListProblemIds,
  );
  const topProblem = relevantProblems[0];
  if (!topProblem) throw new Error("No problem found for query");
  if (topProblem.score < CUTOFF_SCORE)
    throw new Error("No problem found above  CUTOFF_SCORE");
  // @TODO decide which problem to choose based on the level of question and mastery level
  return { problem: topProblem.problem, lessonGoal };
}

export async function createLesson(
  conceptId: string,
  userId: string,
  dbAdapter: DBAdapter,
  llmAdapter: LLMAdapter,
): Promise<Lesson> {
  const concept = await dbAdapter.getConceptById(conceptId);
  const { problem, lessonGoal } = await chooseNextProblemForConcept(
    concept,
    userId,
    dbAdapter,
    llmAdapter,
  );
  const lessonText = await createLessonFromProblem(concept, problem, userId);
  const turns: LessonTurn[] = [
    {
      type: "explanation",
      text: lessonText,
    },
    {
      type: "exercise",
      text: problem.problem,
      solution: problem.solution,
    },
  ];

  return await dbAdapter.createLesson(
    lessonGoal,
    conceptId,
    concept.goalId,
    userId,
    problem.id,
    turns,
  );
}

export async function addUserInputToLesson(
  lessonId: string,
  userId: string,
  userInput: string,
  dbAdapter: DBAdapter,
  llmAdapter: LLMAdapter,
): Promise<Lesson> {
  const lesson = await dbAdapter.getLessonById(lessonId);
  const concept = await dbAdapter.getConceptById(lesson.conceptId);
  // Ensure the lesson has turns
  if (lesson.turns.length === 0) {
    throw new Error("Lesson has no turns");
  }

  const nextLessonAction = await llmAdapter.lesson.decideNextLessonAction(
    lesson,
    userInput,
  );
  if (
    nextLessonAction.action === "end_lesson" ||
    nextLessonAction.action === "pause_lesson"
  ) {
    const updatedLesson: Lesson = {
      ...lesson,
      turns: [...lesson.turns, { type: "user_input", text: userInput }],
      status: getNewStatus(lesson, nextLessonAction.action),
    };
    await dbAdapter.updateLesson(updatedLesson);
    await updateConceptMasteryLevelAndTeacherReport(
      userId,
      concept,
      dbAdapter,
      llmAdapter,
    );
    return updatedLesson;
  }

  const updatedLesson: Lesson = {
    ...lesson,
    turns: [
      ...lesson.turns,
      {
        type: "user_input",
        text: userInput,
      },
      { type: "explanation", text: nextLessonAction.hint },
    ],
  };
  return await dbAdapter.updateLesson(updatedLesson);
}

function getNewStatus(
  lesson: Lesson,
  nextLessonAction: NextLessonAction["action"],
): LessonStatus {
  if (nextLessonAction === "end_lesson") {
    const hasMultipleExplanationTurns =
      lesson.turns.filter((l) => l.type === "explanation").length > 1;
    if (hasMultipleExplanationTurns) {
      return "DONE_WITH_HELP";
    }
    return "DONE";
  }
  return "PAUSED";
}
