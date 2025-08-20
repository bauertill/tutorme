import { type LLMAdapter } from "@/core/adapters/llmAdapter";
import { getConceptsForStudent } from "@/core/concept/concept.domain";
import { type Problem } from "@/core/problem/problem.types";
import { StudentSolutionRepository } from "@/core/studentSolution/studentSolution.repository";
import { type Language } from "@/i18n/types";
import { Prisma, type PrismaClient } from "@prisma/client";
import { getConceptAssignment } from "./llm/getConceptAssignment";
import { StudentContextRepository } from "./studentContext.repository";

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */

export async function getInitialStudentAssessment(
  userId: string,
  language: Language,
  llmAdapter: LLMAdapter,
  db: PrismaClient,
): Promise<Problem[]> {
  // Validate student context
  const studentContextRepository = new StudentContextRepository(db);
  const studentContext =
    await studentContextRepository.getStudentContext(userId);
  if (!studentContext) {
    throw new Error(
      "Student context not found. User must complete onboarding first.",
    );
  }

  // Get concepts and select the first one
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

  // Get all solved problems to inform the LLM
  const studentSolutionRepository = new StudentSolutionRepository(db);
  const solvedProblems =
    await studentSolutionRepository.getAllSolvedProblems(userId);

  const assignment = await generateUniqueAssignment(
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

async function generateUniqueAssignment(
  studentContext: any,
  selectedConcept: any,
  language: Language,
  llmAdapter: LLMAdapter,
  solvedProblems: Problem[],
): Promise<any> {
  const maxAttempts = 3;

  for (let attemptCount = 1; attemptCount <= maxAttempts; attemptCount++) {
    const assignment = await getConceptAssignment(
      studentContext,
      selectedConcept,
      language,
      llmAdapter,
      solvedProblems,
      attemptCount,
    );

    // Check if generated problems are duplicates
    const hasDuplicates = assignment.problems.some((problemData: any) => {
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
  assignment: any,
  selectedConcept: any,
  userId: string,
  db: PrismaClient,
): Promise<Problem[]> {
  const createdProblems: Problem[] = [];

  for (const problemData of assignment.problems) {
    const existingProblem = await db.problem.findFirst({
      where: {
        problem: problemData.problemText,
        conceptId: selectedConcept.concept.id,
      } as any,
      include: {
        studentSolutions: { where: { userId } as any },
      },
    });

    if (
      existingProblem &&
      (existingProblem as any).studentSolutions.length > 0
    ) {
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
        } as any,
      }));

    await db.studentSolution.create({
      data: {
        problemId: problemToUse.id,
        userId,
        canvas: { paths: [] },
        evaluation: Prisma.JsonNull,
        recommendedQuestions: [],
      } as any,
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
