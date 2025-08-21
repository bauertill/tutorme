import { type LLMAdapter } from "@/core/adapters/llmAdapter";
import { getConceptsForStudent } from "@/core/concept/concept.domain";
import { type StudentConcept } from "@/core/concept/concept.types";
import { type Problem } from "@/core/problem/problem.types";
import { StudentSolutionRepository } from "@/core/studentSolution/studentSolution.repository";
import { type Language } from "@/i18n/types";
import { Prisma, type PrismaClient } from "@prisma/client";
import {
  getConceptProblem,
  type ConceptProblemGenerationOutput,
} from "./llm/getConceptProblem";
import { StudentContextRepository } from "./studentContext.repository";
import { type StudentContext } from "./studentContext.types";

export async function getInitialStudentAssessment(
  userId: string,
  language: Language,
  llmAdapter: LLMAdapter,
  db: PrismaClient,
): Promise<Problem[]> {
  const studentContextRepository = new StudentContextRepository(db);
  const studentContext =
    await studentContextRepository.getStudentContext(userId);
  if (!studentContext) {
    throw new Error(
      "Student context not found. User must complete onboarding first.",
    );
  }

  const concepts = await getConceptsForStudent(
    userId,
    language,
    llmAdapter,
    db,
  );
  if (concepts.length === 0) {
    throw new Error("No concepts found for student");
  }
  const selectedConcept = concepts[0];
  if (!selectedConcept) {
    throw new Error("Selected concept is undefined");
  }

  const studentSolutionRepository = new StudentSolutionRepository(db);
  const solvedProblems =
    await studentSolutionRepository.getAllSolvedProblems(userId);

  const assignment = await generateUniqueProblem(
    studentContext,
    selectedConcept,
    language,
    llmAdapter,
    solvedProblems,
  );

  return await createProblemsForStudent(
    assignment,
    selectedConcept,
    userId,
    db,
  );
}

async function generateUniqueProblem(
  studentContext: StudentContext,
  selectedConcept: StudentConcept,
  language: Language,
  llmAdapter: LLMAdapter,
  solvedProblems: Problem[],
): Promise<ConceptProblemGenerationOutput> {
  const maxAttempts = 3;

  for (let attemptCount = 1; attemptCount <= maxAttempts; attemptCount++) {
    const assignment = await getConceptProblem(
      studentContext,
      selectedConcept,
      language,
      llmAdapter,
      solvedProblems,
      attemptCount,
    );

    const hasDuplicates = assignment.problems.some((problemData) => {
      const newProblemText = problemData.problemText.toLowerCase();
      return solvedProblems.some((solvedProblem) => {
        const solvedText = solvedProblem.problem.toLowerCase();
        return (
          solvedText === newProblemText ||
          (solvedText.length > 20 &&
            newProblemText.includes(solvedText.substring(0, 30))) ||
          (newProblemText.length > 20 &&
            solvedText.includes(newProblemText.substring(0, 30)))
        );
      });
    });

    if (!hasDuplicates) {
      return assignment;
    }
  }

  throw new Error(
    "Unable to generate unique problems for this concept. Please try again.",
  );
}

async function createProblemsForStudent(
  assignment: ConceptProblemGenerationOutput,
  selectedConcept: StudentConcept,
  userId: string,
  db: PrismaClient,
): Promise<Problem[]> {
  const createdProblems: Problem[] = [];

  for (const problemData of assignment.problems) {
    const existingProblem = await db.problem.findFirst({
      where: {
        problem: problemData.problemText,
        conceptId: selectedConcept.concept.id,
      },
      include: {
        studentSolutions: { where: { userId } },
      },
    });

    if (existingProblem && existingProblem.studentSolutions.length > 0) {
      continue;
    }

    const problemToUse =
      existingProblem ??
      (await db.problem.create({
        data: {
          problem: problemData.problemText,
          problemNumber: problemData.problemNumber,
          referenceSolution: problemData.referenceSolution,
          conceptId: selectedConcept.concept.id,
        },
      }));

    await db.studentSolution.create({
      data: {
        problemId: problemToUse.id,
        userId,
        canvas: { paths: [] },
        evaluation: Prisma.JsonNull,
        recommendedQuestions: [],
      },
    });

    createdProblems.push(problemToUse);
  }

  if (createdProblems.length === 0) {
    throw new Error(
      "Failed to generate unique problems. All generated problems were too similar to solved ones.",
    );
  }

  return createdProblems;
}
