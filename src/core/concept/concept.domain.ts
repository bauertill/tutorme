import { Language, PrismaClient } from "@prisma/client";
import { LLMAdapter } from "../adapters/llmAdapter";
import { StudentContextRepository } from "../studentContext/studentContext.repository";
import { ConceptRepository } from "./concept.repository";
import { type StudentConcept } from "./concept.types";
import { getConceptsForStudentContext } from "./llm/getConceptsForStudentContext";

export async function getConceptsForStudent(
  userId: string,
  language: Language,
  llmAdapter: LLMAdapter,
  db: PrismaClient,
): Promise<StudentConcept[]> {
  const conceptRepository = new ConceptRepository(db);

  const existingConcepts = await conceptRepository.getStudentConcepts(userId);

  if (existingConcepts.length > 0) {
    return existingConcepts;
  }

  const studentContextRepository = new StudentContextRepository(db);
  const studentContext =
    await studentContextRepository.getStudentContext(userId);
  if (!studentContext) {
    throw new Error("Student context not found");
  }

  const conceptsGenerated = await getConceptsForStudentContext(
    studentContext,
    language,
    llmAdapter,
  );
  const concepts = conceptsGenerated.map((concept) => ({
    ...concept,
    parentConceptId: null,
    subConcepts: [],
  }));

  const createdConcepts = await conceptRepository.createConcepts(concepts);

  await conceptRepository.createStudentConcepts(
    createdConcepts.map((c) => c.id),
    userId,
    "unknown",
  );

  // Return the actual student concepts from the database
  return await conceptRepository.getStudentConcepts(userId);
}
