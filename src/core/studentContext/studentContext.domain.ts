import { type LLMAdapter } from "@/core/adapters/llmAdapter";
import { type StudentAssignment } from "@/core/assignment/assignment.types";
import { getConceptsForStudent } from "@/core/concept/concept.domain";
import { type Language } from "@/i18n/types";
import { type PrismaClient } from "@prisma/client";
import { AssignmentRepository } from "../assignment/assignment.repository";
import { StudentRepository } from "../student/student.repository";
import { getConceptAssignment } from "./llm/getConceptAssignment";
import { StudentContextRepository } from "./studentContext.repository";

export async function getInitialStudentAssessment(
  userId: string,
  language: Language,
  llmAdapter: LLMAdapter,
  db: PrismaClient,
): Promise<StudentAssignment> {
  try {
    const studentRepository = new StudentRepository(db);
    const studentId =
      await studentRepository.getStudentIdByUserIdOrThrow(userId);

    const studentContextRepository = new StudentContextRepository(db);
    let studentContext =
      await studentContextRepository.getStudentContext(userId);

    // If no student context exists, create a default one
    if (!studentContext) {
      const defaultContext = {
        userId: userId,
        grade: "10" as const,
        country: "us" as const,
        textbook: "Standard Math Curriculum",
      };
      studentContext =
        await studentContextRepository.upsertStudentContext(defaultContext);
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

    // Use the first concept to create an assignment
    const firstConcept = concepts[0];
    if (!firstConcept) {
      throw new Error("First concept not found");
    }

    const assignment = await getConceptAssignment(
      studentContext,
      firstConcept,
      language,
      llmAdapter,
    );

    const assignmentRepository = new AssignmentRepository(db);

    const studentAssignment =
      await assignmentRepository.createStudentAssignmentWithProblems(
        assignment,
        studentId,
        userId,
      );
    return studentAssignment;
  } catch (error) {
    console.error("Error in getInitialStudentAssessment:", error);
    throw error;
  }
}
