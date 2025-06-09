import { i18n } from "@/i18n/server";
import { type Language } from "@/i18n/types";
import { type PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import { type LLMAdapter } from "../adapters/llmAdapter";
import { getExampleProblems } from "../problem/problem.repository";
import { type Problem } from "../problem/problem.types";
import { StudentRepository } from "../student/student.repository";
import { type Draft } from "../utils";
import { AssignmentRepository } from "./assignment.repository";
import { type StudentAssignment } from "./assignment.types";
import { extractAssignmentFromImage } from "./llm/extractAssignmentFromImage";

export async function createStudentAssignment(
  assignment: StudentAssignment,
  userId: string,
  db: PrismaClient,
) {
  const assignmentRepository = new AssignmentRepository(db);
  const studentRepository = new StudentRepository(db);
  const studentId = await studentRepository.getStudentIdByUserIdOrThrow(userId);
  await assignmentRepository.createStudentAssignmentWithProblems(
    assignment,
    studentId,
    userId,
  );
}

export async function adminCreateAssignment(
  {
    name,
    problemIds,
    studentGroupId,
  }: {
    name: string;
    problemIds: string[];
    studentGroupId: string;
  },
  userId: string,
  db: PrismaClient,
) {
  const assignmentRepository = new AssignmentRepository(db);
  const studentRepository = new StudentRepository(db);
  const assignmentId = `${userId}-${name}`;
  await assignmentRepository.createGroupAssignment(
    {
      id: assignmentId,
      name,
      problemIds,
      studentGroupId,
    },
    userId,
  );
  const students = await studentRepository.getStudentsByGroupId(studentGroupId);
  await Promise.all(
    students.map((student) =>
      assignmentRepository.createStudentAssignment(
        {
          id: `${assignmentId}-${student.id}`,
          name,
          problemIds,
          studentId: student.id,
        },
        userId,
      ),
    ),
  );
}

export async function deleteAllAssignmentsAndProblemsByUserId(
  userId: string,
  db: PrismaClient,
) {
  const assignmentRepository = new AssignmentRepository(db);
  await assignmentRepository.deleteAllProblemsAndAssignmentsByUserId(userId);
}

export async function createStudentAssignmentFromUpload(
  uploadPath: string,
  userId: string | undefined,
  studentId: string | undefined,
  db: PrismaClient,
  llmAdapter: LLMAdapter,
  language: Language,
): Promise<StudentAssignment> {
  const dbAdapter = new AssignmentRepository(db);
  const { problems: rawProblems } = await extractAssignmentFromImage(
    uploadPath,
    language,
    userId,
    llmAdapter,
  );
  const problems: Draft<Problem>[] = [];
  for (const problem of rawProblems) {
    problems.push({
      problem: problem.problemText,
      problemNumber: problem.problemNumber,
      referenceSolution: null,
    });
  }
  const assignment = {
    id: uuidv4(),
    name: `Upload @ ${new Date().toLocaleString()}`,
    problems,
  };
  if (userId && studentId) {
    const result = await dbAdapter.createStudentAssignmentWithProblems(
      assignment,
      studentId,
      userId,
    );
    return {
      ...result,
      problems: result.problems.map((problem) => ({
        ...problem,
        studentSolution: {
          id: crypto.randomUUID(),
          status: "INITIAL",
          canvas: { paths: [] },
          evaluation: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      })),
    };
  } else {
    return {
      ...assignment,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date(),
      problems: assignment.problems.map((problem) => ({
        ...problem,
        id: uuidv4(),
        createdAt: new Date(),
        updatedAt: new Date(),
        studentSolution: {
          id: crypto.randomUUID(),
          status: "INITIAL",
          canvas: { paths: [] },
          evaluation: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      })),
    };
  }
}

export async function getExampleAssignment(
  language: Language,
): Promise<StudentAssignment> {
  const t = i18n.getFixedT(language);
  const problems = getExampleProblems(language);
  const assignment: StudentAssignment = {
    id: uuidv4(),
    name: t("example_assignment"),
    problems: problems.map((problem, i) => ({
      id: uuidv4(),
      studentSolution: {
        id: crypto.randomUUID(),
        status: "INITIAL",
        canvas: { paths: [] },
        evaluation: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      problem: problem.problem,
      problemNumber: `${i + 1}`,
      referenceSolution: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  return assignment;
}
