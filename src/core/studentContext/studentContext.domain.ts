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

  // Get concepts for the student
  const concepts = await getConceptsForStudent(
    userId,
    language,
    llmAdapter,
    db,
  );
  if (concepts.length === 0) {
    throw new Error("No concepts found for student");
  }

  // Find a concept that has unsolved problems or use the first one
  const studentSolutionRepository = new StudentSolutionRepository(db);

  let selectedConcept = null;
  let solvedProblems = [];

  // Get ALL solved problems for the user (regardless of concept) to pass to LLM
  const allSolvedProblems =
    await studentSolutionRepository.getAllSolvedProblems(userId);

  // For concept selection, still check per-concept but use the first concept for simplicity
  selectedConcept = concepts[0];
  if (!selectedConcept) {
    throw new Error("No concepts available");
  }

  // Use ALL solved problems (not just for this concept) to inform the LLM
  solvedProblems = allSolvedProblems;

  // Try to generate problems, with retry if duplicates are detected
  let assignment;
  let attemptCount = 0;
  const maxAttempts = 3;

  do {
    attemptCount++;
    assignment = await getConceptAssignment(
      studentContext,
      selectedConcept,
      language,
      llmAdapter,
      solvedProblems,
      attemptCount,
    );

    // Check if generated problems are duplicates
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
      break;
    }
  } while (attemptCount < maxAttempts);

  if (attemptCount >= maxAttempts) {
    throw new Error(
      "Unable to generate unique problems for this concept. Please try again.",
    );
  }

  // Create problems directly in the database
  const createdProblems: Problem[] = [];

  for (const problemData of assignment.problems) {
    console.log(
      "🆕 Creating new problem:",
      problemData.problemText.substring(0, 100) + "...",
    );

    // Check if this exact problem already exists in the database AND if user has encountered it
    const existingProblem = await db.problem.findFirst({
      where: {
        problem: problemData.problemText,
        conceptId: selectedConcept.concept.id,
      } as any,
      include: {
        studentSolutions: {
          where: {
            userId: userId,
          } as any,
        },
      },
    });

    if (
      existingProblem &&
      (existingProblem as any).studentSolutions.length > 0
    ) {
      console.warn(
        "⚠️ Problem already exists AND user has encountered it, skipping",
      );
      console.warn("  Existing problem ID:", existingProblem.id);
      console.warn(
        "  User has",
        (existingProblem as any).studentSolutions.length,
        "solutions for this problem",
      );
      continue; // Skip this problem entirely
    }

    let problemToUse;
    if (existingProblem) {
      console.log("♻️ Problem exists but user hasn't encountered it, reusing");
      console.log("  Existing problem ID:", existingProblem.id);
      problemToUse = existingProblem;
    } else {
      problemToUse = await db.problem.create({
        data: {
          problem: problemData.problemText,
          problemNumber: problemData.problemNumber,
          referenceSolution: problemData.referenceSolution,
          conceptId: selectedConcept.concept.id,
        } as any,
      });
      console.log("✅ Created new problem with ID:", problemToUse.id);
    }

    // Create a student solution for this problem (we know user doesn't have one)
    await db.studentSolution.create({
      data: {
        problemId: problemToUse.id,
        userId: userId,
        canvas: { paths: [] },
        evaluation: Prisma.JsonNull,
        recommendedQuestions: [],
      } as any,
    });
    console.log("✅ Created StudentSolution for problem:", problemToUse.id);

    createdProblems.push(problemToUse);
  }

  if (createdProblems.length === 0) {
    throw new Error(
      "Failed to generate unique problems. All generated problems were too similar to solved ones.",
    );
  }

  return createdProblems;
}
