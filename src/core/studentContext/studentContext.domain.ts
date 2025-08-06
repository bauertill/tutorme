import { type LLMAdapter } from "@/core/adapters/llmAdapter";
import { type StudentAssignment } from "@/core/assignment/assignment.types";
import { type Language } from "@/i18n/types";
import { PrismaClient } from "@prisma/client";
import { AssignmentRepository } from "../assignment/assignment.repository";
import { StudentRepository } from "../student/student.repository";
import { getInitialAssessment } from "./llm/getInitialAssesment";
import { StudentContextRepository } from "./studentContext.repository";

export async function getInitialStudentAssessment(
  userId: string,
  language: Language,
  llmAdapter: LLMAdapter,
  db: PrismaClient,
): Promise<StudentAssignment> {
  const studentRepository = new StudentRepository(db);
  const studentId = await studentRepository.getStudentIdByUserIdOrThrow(userId);
  const studentContextRepository = new StudentContextRepository(db);
  const studentContext =
    await studentContextRepository.getStudentContext(studentId);
  if (!studentContext) {
    throw new Error("Student context not found");
  }

  const assignment = await getInitialAssessment(
    studentContext,
    language,
    llmAdapter,
  );
  const assignmentRepository = new AssignmentRepository(db);

  const studentAssignment =
    await assignmentRepository.createStudentAssignmentWithProblems(
      assignment,
      studentContext.studentId,
      userId,
    );
  return studentAssignment;
}
