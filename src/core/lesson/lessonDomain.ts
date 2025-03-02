import type { DBAdapter } from "../adapters/dbAdapter";
import type { LLMAdapter } from "../adapters/llmAdapter";
import { queryProblems } from "../problem/problemDomain";
import type {
  Lesson,
  LessonExerciseTurn,
  LessonIteration,
  LessonTurn,
} from "./types";

async function findRelevantExercise(
  lessonGoal: string,
  previousExercises: LessonExerciseTurn[],
  dbAdapter: DBAdapter,
  llmAdapter: LLMAdapter,
): Promise<LessonExerciseTurn> {
  const relevantProblems = await queryProblems(
    lessonGoal,
    10,
    dbAdapter,
    previousExercises.map((exercise) => exercise.problemId),
  );
  const chosenProblem = await llmAdapter.lesson.chooseProblemForGoal(
    lessonGoal,
    relevantProblems.map((problem) => problem.problem),
  );
  return {
    type: "exercise" as const,
    text: chosenProblem.problem,
    solution: chosenProblem.solution,
    problemId: chosenProblem.id,
  };
}

export async function createLesson(
  conceptId: string,
  userId: string,
  dbAdapter: DBAdapter,
  llmAdapter: LLMAdapter,
): Promise<Lesson> {
  const concept = await dbAdapter.getConceptWithGoalByConceptId(conceptId);

  // Fetch previous lessons for this concept to extract their goals
  const previousLessons = await dbAdapter.getLessonsByConceptId(conceptId);
  const previousLessonGoals = previousLessons.map(
    (lesson) => lesson.lessonGoal,
  );

  // Pass previous lesson goals to help the LLM generate a new, different goal
  const lessonGoal = await llmAdapter.lesson.createLessonGoal(
    concept,
    userId,
    previousLessonGoals,
  );

  const exercise = await findRelevantExercise(
    lessonGoal,
    [],
    dbAdapter,
    llmAdapter,
  );

  const { explanation } = await llmAdapter.lesson.createLessonIteration(
    concept,
    lessonGoal,
    [],
    userId,
  );

  const lessonIteration: LessonIteration = {
    turns: [explanation, exercise],
  };

  return await dbAdapter.createLesson(
    lessonGoal,
    conceptId,
    concept.goalId,
    userId,
    [lessonIteration],
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

  // Ensure the lesson has iterations
  if (lesson.lessonIterations.length === 0) {
    throw new Error("Lesson has no iterations");
  }

  const { evaluation, isComplete } =
    await llmAdapter.lesson.evaluateLessonResponse(lesson, userInput);
  const lastIteration =
    lesson.lessonIterations[lesson.lessonIterations.length - 1]!;
  const userInputTurn: LessonTurn = {
    type: "user_input",
    text: userInput,
  };
  const updatedLastIteration: LessonIteration = {
    ...lastIteration,
    turns: [...lastIteration.turns, userInputTurn],
    evaluation,
  };
  const updatedLessonIterations = [
    ...lesson.lessonIterations.slice(0, -1),
    updatedLastIteration,
  ];

  const concept = await dbAdapter.getConceptById(lesson.conceptId);
  if (!isComplete) {
    const previousExercises = updatedLessonIterations
      .map((iteration) =>
        iteration.turns.find((turn) => turn.type === "exercise"),
      )
      .filter(
        (exercise): exercise is LessonExerciseTurn => exercise !== undefined,
      );
    const exercise = await findRelevantExercise(
      lesson.lessonGoal,
      previousExercises,
      dbAdapter,
      llmAdapter,
    );

    const { explanation } = await llmAdapter.lesson.createLessonIteration(
      concept,
      lesson.lessonGoal,
      updatedLessonIterations,
      userId,
    );

    const newIteration: LessonIteration = {
      turns: [explanation, exercise],
    };

    updatedLessonIterations.push(newIteration);
  }

  const teacherReport = await llmAdapter.lesson.createLessonTeacherReport(
    concept,
    lesson,
    userId,
  );
  await dbAdapter.updateConceptWithTeacherReport(concept.id, teacherReport);
  const updatedLesson = {
    ...lesson,
    lessonIterations: updatedLessonIterations,
    status: isComplete ? "DONE" : lesson.status,
  };
  return await dbAdapter.updateLesson(updatedLesson);
}
