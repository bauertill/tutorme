import type { DBAdapter } from "../adapters/dbAdapter";
import type { LLMAdapter } from "../adapters/llmAdapter";
import { createLessonFromProblem } from "../adapters/llmAdapter/lesson";
import { type NextLessonAction } from "../adapters/llmAdapter/lesson/decideNextLessonAction";
import { type Exercise } from "../adapters/llmAdapter/lesson/generateDummyExercises";
import { type PubSubAdapter } from "../adapters/pubsubAdapter";
import { updateConceptMasteryLevelAndTeacherReport } from "../concept/conceptDomain";
import { type Concept, type Difficulty, MasteryLevel } from "../concept/types";
import { type Problem, type ProblemQueryResult } from "../problem/types";
import type { Lesson, LessonStatus, LessonTurn } from "./types";

// @TODO understand why scores are so low :/
const CUTOFF_SCORE = 0;
const MASTERY_LEVEL_TO_DIFFICULTY = {
  [MasteryLevel.Enum.UNKNOWN]: "Level 1",
  [MasteryLevel.Enum.BEGINNER]: "Level 1",
  [MasteryLevel.Enum.INTERMEDIATE]: "Level 2",
  [MasteryLevel.Enum.ADVANCED]: "Level 3",
  [MasteryLevel.Enum.EXPERT]: "Level 4",
};

const LEVEL_TO_DIFFICULTY: Record<string, Difficulty> = {
  "Level 1": "BEGINNER",
  "Level 2": "INTERMEDIATE",
  "Level 3": "ADVANCED",
  "Level 4": "EXPERT",
};

// DEPRECATED - keeping it around for inspiration
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
  const difficulty = MASTERY_LEVEL_TO_DIFFICULTY[concept.masteryLevel];
  const relevantProblems = await dbAdapter.queryProblems(
    query,
    10,
    blackListProblemIds,
    difficulty,
  );
  const topProblem = relevantProblems[0];
  if (!topProblem) throw new Error("No problem found for query");
  if (topProblem.score < CUTOFF_SCORE)
    throw new Error("No problem found above  CUTOFF_SCORE");
  // @TODO decide which problem to choose based on the level of question and mastery level
  return { problem: topProblem.problem, lessonGoal };
}

// DEPRECATED - keeping it around for inspiration
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
  const { lessonText } = await createLessonFromProblem(
    concept,
    problem,
    userId,
  );
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
    getDifficultyFromLevel(problem.level),
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

/**
 * This method creates a series of lessons for a concept. It creates
 * dummy exercises for each level of difficulty and then finds real problems
 * that are similar to the dummy exercises. It then creates a lesson for each
 * real problem.
 */
export async function createLessonsForConcept(
  conceptId: string,
  userId: string,
  dbAdapter: DBAdapter,
  llmAdapter: LLMAdapter,
): Promise<Lesson[]> {
  const concept = await dbAdapter.getConceptById(conceptId);
  const dummyExercises = await llmAdapter.lesson.createDummyExercises(
    concept,
    userId,
  );
  const problemQueries: Promise<ProblemQueryResult[]>[] = [];
  for (const level of ["beginner", "intermediate", "advanced"] as const) {
    dummyExercises[level].map((exercise) => {
      const queryString = `Problem: ${exercise.problem}\nSolution: ${exercise.solution}`;
      const queryLevel =
        level === "beginner"
          ? "Level 1"
          : level === "intermediate"
            ? "Level 2"
            : "Level 3";
      problemQueries.push(
        dbAdapter.queryProblems(queryString, 10, [], queryLevel),
      );
    });
  }
  const problemResults2D: ProblemQueryResult[][] =
    await Promise.all(problemQueries);
  const uniqueProblems: Problem[] = [];
  for (const problemResults of problemResults2D) {
    for (const { problem } of problemResults) {
      // @TODO decide what to do with score
      const isUnique = !uniqueProblems.find((p) => p.id === problem.id);
      if (isUnique) {
        uniqueProblems.push(problem);
        break;
      }
    }
  }

  const lessons: Lesson[] = await Promise.all(
    uniqueProblems.map(async (problem) => {
      const { lessonText, lessonSummary } = await createLessonFromProblem(
        concept,
        problem,
        userId,
      );
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

      const lesson = await dbAdapter.createLesson(
        lessonSummary,
        concept.id,
        concept.goalId,
        userId,
        problem.id,
        turns,
        getDifficultyFromLevel(problem.level),
      );
      return lesson;
    }),
  );
  return lessons;
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

function getDifficultyFromLevel(level: string): Difficulty {
  const difficulty = LEVEL_TO_DIFFICULTY[level];
  if (!difficulty) {
    console.error(`No difficulty found for level ${level}`);
    return "BEGINNER";
  }
  return difficulty;
}

const DIFFICULTIES = ["beginner", "intermediate", "advanced"] as const;

async function generateLesson(
  exercise: Exercise,
  concept: Concept,
  userId: string,
  dbAdapter: DBAdapter,
  llmAdapter: LLMAdapter,
  pubsubAdapter: PubSubAdapter,
): Promise<void> {
  const level = `Level ${DIFFICULTIES.indexOf(exercise.difficulty) + 1}`;
  const problemResult = (
    await dbAdapter.queryProblems(exercise.problem, 1, [], level)
  )[0];
  if (!problemResult) {
    console.error(`No problem found for exercise ${exercise.problem}`);
    return;
  }
  // @TODO decide if the lesson should only be a problem and the hint comes on demand only
  const problem = problemResult.problem;
  const { lessonText, lessonSummary } =
    await llmAdapter.lesson.createLessonFromProblem(concept, problem, userId);

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
  const lesson = await dbAdapter.createLesson(
    lessonSummary,
    concept.id,
    concept.goalId,
    userId,
    problem.id,
    turns,
    getDifficultyFromLevel(problem.level),
  );
  void pubsubAdapter.publish("lesson:generated", lesson, concept.id);
}

export async function generateLessonsForConcept(
  conceptId: string,
  userId: string,
  dbAdapter: DBAdapter,
  llmAdapter: LLMAdapter,
  pubsubAdapter: PubSubAdapter,
): Promise<void> {
  console.log(
    new Date().toISOString(),
    "Generating lessons for concept",
    conceptId,
  );
  const concept = await dbAdapter.getConceptById(conceptId);
  const exercises = llmAdapter.lesson.generateDummyExercisesForConcept(
    concept,
    userId,
  );

  const promises: Promise<void>[] = [];
  for await (const exercise of exercises) {
    promises.push(
      generateLesson(
        exercise,
        concept,
        userId,
        dbAdapter,
        llmAdapter,
        pubsubAdapter,
      ),
    );
  }
  await Promise.all(promises);
  await dbAdapter.updateConceptLessonGenerationStatus(concept.id, "COMPLETED");
  await pubsubAdapter.publishEndOfGeneration("lesson:generated", concept.id);
}

export async function getLessonsByConceptId(
  conceptId: string,
  userId: string,
  dbAdapter: DBAdapter,
  llmAdapter: LLMAdapter,
  pubsubAdapter: PubSubAdapter,
): Promise<Lesson[]> {
  const lessons = await dbAdapter.getLessonsByConceptId(conceptId);
  if (lessons.length === 0) {
    console.log("Generating lessons for concept", conceptId);
    void generateLessonsForConcept(
      conceptId,
      userId,
      dbAdapter,
      llmAdapter,
      pubsubAdapter,
    );
  }
  return lessons;
}
