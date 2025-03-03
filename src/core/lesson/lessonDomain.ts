import type { DBAdapter } from "../adapters/dbAdapter";
import type { LLMAdapter } from "../adapters/llmAdapter";
import { createLessonFromProblem } from "../adapters/llmAdapter/lesson";
import { Concept } from "../concept/types";
import { Problem } from "../problem/types";
import type { Lesson, LessonTurn } from "./types";

const CUTOFF_SCORE = 0.5;

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
  const lessonGoal = await llmAdapter.lesson.createLessonGoal(
    concept,
    userId,
    previousLessonGoals,
  );

  const { explanationText, exerciseText } =
    await llmAdapter.lesson.createLessonIteration(
      concept,
      lessonGoal,
      [],
      userId,
    );
  const query = `Lesson goal: ${lessonGoal}\nExercise: ${exerciseText}`;
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

  // Ensure the lesson has turns
  if (lesson.turns.length === 0) {
    throw new Error("Lesson has no turns");
  }
  return lesson;

  // const { evaluation, isComplete } =
  //   await llmAdapter.lesson.evaluateLessonResponse(lesson, userInput);
  // const lastIteration =
  //   lesson.lessonIterations[lesson.lessonIterations.length - 1]!;
  // const userInputTurn: LessonTurn = {
  //   type: "user_input",
  //   text: userInput,
  // };
  // const updatedLastIteration: LessonIteration = {
  //   ...lastIteration,
  //   turns: [...lastIteration.turns, userInputTurn],
  //   evaluation,
  // };
  // const updatedLessonIterations = [
  //   ...lesson.lessonIterations.slice(0, -1),
  //   updatedLastIteration,
  // ];

  // const concept = await dbAdapter.getConceptById(lesson.conceptId);
  // if (!isComplete) {
  //   const previousExercises = updatedLessonIterations
  //     .map((iteration) =>
  //       iteration.turns.find((turn) => turn.type === "exercise"),
  //     )
  //     .filter(
  //       (exercise): exercise is LessonExerciseTurn => exercise !== undefined,
  //     );

  //   const { explanationText, exerciseText } =
  //     await llmAdapter.lesson.createLessonIteration(
  //       concept,
  //       lesson.lessonGoal,
  //       updatedLessonIterations,
  //       userId,
  //     );
  //   const exercise = await findRelevantExercise(
  //     lesson.lessonGoal,
  //     exerciseText,
  //     previousExercises,
  //     dbAdapter,
  //     llmAdapter,
  //   );

  //   const newIteration: LessonIteration = {
  //     turns: [{ type: "explanation", text: explanationText }, exercise],
  //   };

  //   updatedLessonIterations.push(newIteration);
  // }

  // const teacherReport = await llmAdapter.lesson.createLessonTeacherReport(
  //   concept,
  //   lesson,
  //   userId,
  // );
  // await dbAdapter.updateConceptWithTeacherReport(concept.id, teacherReport);
  // const updatedLesson = {
  //   ...lesson,
  //   lessonIterations: updatedLessonIterations,
  //   status: isComplete ? "DONE" : lesson.status,
  // };
  // return await dbAdapter.updateLesson(updatedLesson);
}
