import { i18n } from "@/i18n/server";
import { type Language } from "@/i18n/types";
import { type PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import { type LLMAdapter } from "../adapters/llmAdapter";
import { ConceptRepository } from "../concept/concept.repository";
import { type Problem } from "../problem/problem.types";
import { StudentRepository } from "../student/student.repository";
import { getConceptAssignment } from "../studentContext/llm/getConceptAssignment";
import { StudentContextRepository } from "../studentContext/studentContext.repository";
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

export async function deleteAllStudentDataByUserId(
  userId: string,
  db: PrismaClient,
) {
  const assignmentRepository = new AssignmentRepository(db);
  await assignmentRepository.deleteAllStudentAssignmentsByUserId(userId);
}

export async function deleteAllAssignmentsAndProblemsByUserId(
  userId: string,
  db: PrismaClient,
) {
  const assignmentRepository = new AssignmentRepository(db);
  await assignmentRepository.deleteAllStudentAssignmentsByUserId(userId);
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

export async function createStudentExampleAssignment(
  language: Language,
  userId: string,
  db: PrismaClient,
): Promise<StudentAssignment> {
  // implementation omitted in this snippet
  const assignmentRepository = new AssignmentRepository(db);
  const studentRepository = new StudentRepository(db);
  const studentId = await studentRepository.getStudentIdByUserIdOrThrow(userId);
  return await assignmentRepository.createStudentAssignmentWithProblems(
    {
      id: uuidv4(),
      name: i18n.t("exampleAssignment.title"),
      problems: [],
    },
    studentId,
    userId,
  );
}

export async function addProblemsToStudentAssignment(
  assignmentId: string,
  count: number,
  userId: string,
  language: Language,
  llmAdapter: LLMAdapter,
  db: PrismaClient,
): Promise<{ problemIds: string[] }> {
  const assignmentRepository = new AssignmentRepository(db);
  const studentRepository = new StudentRepository(db);
  await studentRepository.getStudentIdByUserIdOrThrow(userId);

  const dbAssignment =
    await assignmentRepository.getStudentAssignmentById(assignmentId);
  if (!dbAssignment) throw new Error("Assignment not found");

  const studentContextRepository = new StudentContextRepository(db);
  const conceptRepository = new ConceptRepository(db);
  const studentContext =
    await studentContextRepository.getStudentContext(userId);
  if (!studentContext) throw new Error("Student context not found");

  let studentConcept = null as
    | Awaited<ReturnType<typeof conceptRepository.getStudentConcepts>>[number]
    | null;
  if (dbAssignment.studentConceptId) {
    const concepts = await conceptRepository.getStudentConcepts(userId);
    studentConcept =
      concepts.find((c) => c.id === dbAssignment.studentConceptId) ?? null;
  }
  if (!studentConcept) {
    const concepts = await conceptRepository.getStudentConcepts(userId);
    studentConcept = concepts[0] ?? null;
  }
  if (!studentConcept) throw new Error("No student concept available");

  const problems: Draft<Problem>[] = [];
  for (let i = 0; i < count; i++) {
    const one = await getConceptAssignment(
      studentContext,
      studentConcept,
      language,
      llmAdapter,
    );
    const p = one.problems[0];
    if (p) {
      problems.push({
        problem: p.problem,
        problemNumber: p.problemNumber,
        referenceSolution: p.referenceSolution ?? null,
      });
    }
  }

  const { createdProblemIds } =
    await assignmentRepository.addProblemsToStudentAssignment(
      assignmentId,
      problems,
      userId,
    );

  return { problemIds: createdProblemIds };
}
