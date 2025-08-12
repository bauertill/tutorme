import type { Concept, StudentConcept } from "@/core/concept/concept.types";
import {
  ConceptSchema,
  StudentConceptSchema,
} from "@/core/concept/concept.types";
import { type PrismaClient } from "@prisma/client";

export class ConceptRepository {
  constructor(private db: PrismaClient) {}

  async createConcepts(
    concepts: Omit<Concept, "id" | "createdAt" | "updatedAt">[],
  ): Promise<Concept[]> {
    const conceptNames = concepts.map((concept) => concept.name);
    const existingConcepts = await this.db.concept.findMany({
      where: {
        name: {
          in: conceptNames,
        },
      },
    });

    const existingConceptNames = new Set(
      existingConcepts.map((concept) => concept.name),
    );

    const newConcepts = concepts.filter(
      (concept) => !existingConceptNames.has(concept.name),
    );

    if (newConcepts.length > 0) {
      // Remove relation fields as they are not database columns for creation
      const conceptsToCreate = newConcepts.map(
        ({
          subConcepts: _subConcepts,
          parentConcept: _parentConcept,
          ...concept
        }) => concept,
      );

      await this.db.concept.createMany({
        data: conceptsToCreate,
      });
    }

    const result = await this.db.concept.findMany({
      where: {
        name: {
          in: conceptNames,
        },
      },
      include: {
        subConcepts: true,
        parentConcept: true,
      },
    });

    return result.map((concept) => ConceptSchema.parse(concept));
  }
  async createStudentConcepts(
    conceptIds: string[],
    userId: string,
    skillLevel: string,
  ): Promise<void> {
    await this.db.studentConcept.createMany({
      data: conceptIds.map((conceptId) => ({
        conceptId,
        userId,
        skillLevel,
      })),
    });
  }

  async getStudentConcepts(userId: string): Promise<StudentConcept[]> {
    const studentConcepts = await this.db.studentConcept.findMany({
      where: { userId },
      include: {
        concept: true,
      },
    });
    return studentConcepts.map((studentConcept) =>
      StudentConceptSchema.parse(studentConcept),
    );
  }
}
