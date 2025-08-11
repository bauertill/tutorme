import { z } from "zod";

// To handle recursion, we must use an interface and z.lazy()
// The interface defines the shape of the data, including the recursive properties.
export interface Concept {
  id: string;
  name: string;
  description: string;
  parentConceptId: string | null;
  createdAt: Date;
  updatedAt: Date;
  parentConcept?: Concept | null;
  subConcepts?: Concept[] | null;
}

// The Zod schema is defined using z.lazy() to defer the evaluation of the recursive part.
// The z.ZodType<Concept> annotation tells TypeScript what the shape of the parsed object will be.
export const ConceptSchema: z.ZodType<Concept> = z.lazy(() =>
  z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    parentConceptId: z.string().nullable(),
    createdAt: z.date(),
    updatedAt: z.date(),
    parentConcept: ConceptSchema.optional().nullable(),
    subConcepts: z.array(ConceptSchema).optional().nullable(),
  }),
);

export const SkillLevelSchema = z.enum(["unknown", "1", "2", "3", "4", "5"]);

export const StudentConceptSchema = z.object({
  id: z.string(),
  conceptId: z.string(),
  concept: ConceptSchema,
  userId: z.string(),
  skillLevel: SkillLevelSchema,
  teacherReport: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type StudentConcept = z.infer<typeof StudentConceptSchema>;
