import { type LLMAdapter } from "@/core/adapters/llmAdapter";
// Removed StudentAssignment import as assignments no longer exist
import { type StudentConcept } from "@/core/concept/concept.types";
import { type Problem } from "@/core/problem/problem.types";
import { type Language, LanguageName } from "@/i18n/types";
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
} from "@langchain/core/prompts";
// import { v4 as uuidv4 } from "uuid"; // No longer needed
import { z } from "zod";
import { type StudentContext } from "../studentContext.types";

// Define the system prompt template for generating concept-based assignment
const systemPromptTemplate = SystemMessagePromptTemplate.fromTemplate(
  `You are an expert math teacher creating a focused lesson assignment for a specific mathematical concept.
  
  Your goal is to create 1 well-crafted math problem that introduces and tests the student's understanding of the given concept.

  Requirements:
  - Create exactly 1 problem focused on the specific concept
  - The problem should be appropriate for the student's grade level and skill level
  - The problem should be engaging and help the student learn the concept
  - Include clear problem statement that is self-contained
  - Provide a complete reference solution with step-by-step explanation
  - The problem should align with the educational standards of the specified country
  - If a textbook is specified, try to align with common approaches from that textbook
  - Consider the student's current skill level for the concept when designing the problem
  - DO NOT create multi-part questions with sub-parts like (a), (b), (c), etc.
  - Create ONE single, focused question that can be answered directly
  - Avoid complex analysis questions that require multiple steps or parts
  - Keep the problem straightforward and focused on one main task

  Write your response in {language} language only.`,
  {
    name: "generate_concept_assignment_system_prompt",
  },
);

// Define the human message template
const humanPromptTemplate = HumanMessagePromptTemplate.fromTemplate(
  `Create a lesson assignment for a student with the following context:
  
  Grade: {grade}
  Country: {country}
  Textbook: {textbook}
  
  Focus Concept: {conceptName}
  Concept Description: {conceptDescription}
  Student's Current Skill Level: {skillLevel}
  
  Generate 1 simple, single-question math problem that will help the student learn and practice this specific concept.
  
  {solvedProblems}

  Remember: Create only ONE question without sub-parts (a), (b), (c), etc. Make it a direct, straightforward problem.`,
  {
    name: "generate_concept_assignment_human_prompt",
  },
);

// Combine the templates into a single prompt template
export const generateConceptAssignmentPromptTemplate =
  ChatPromptTemplate.fromMessages([systemPromptTemplate, humanPromptTemplate]);

// Define the output schema for a single problem
const ConceptProblemSchema = z.object({
  problemText: z.string().describe("The problem statement"),
  problemNumber: z
    .string()
    .describe("The problem number (should be '1' for single problem)"),
  referenceSolution: z.string().describe("The complete solution with steps"),
  difficulty: z
    .enum(["Easy", "Medium", "Hard"])
    .describe("The difficulty level"),
  topic: z
    .string()
    .describe("The main mathematical topic matching the concept"),
});

// Define the output schema for the concept assignment
const ConceptAssignmentSchema = z.object({
  title: z
    .string()
    .describe("Title for the assignment focusing on the concept"),
  problems: z
    .array(ConceptProblemSchema)
    .length(1)
    .describe("Exactly 1 problem for the concept"),
});

export type ConceptAssignmentOutput = z.infer<typeof ConceptAssignmentSchema>;

export async function getConceptAssignment(
  studentContext: StudentContext,
  concept: StudentConcept,
  language: Language,
  llmAdapter: LLMAdapter,
  solvedProblems: Problem[],
  attemptCount = 1,
): Promise<ConceptAssignmentOutput> {
  const { grade, country, textbook } = studentContext;

  // Use hub to pull the prompt (fallback to local prompt if not available)
  let prompt;
  try {
    prompt = await llmAdapter.hub.pull("generate_concept_assignment");
  } catch {
    // Fallback to local prompt template
    console.log("No prompt found in hub, using local prompt");
    prompt = generateConceptAssignmentPromptTemplate;
  }

  const solvedProblemsText =
    solvedProblems.length > 0
      ? `IMPORTANT: The student has already solved these problems: ${solvedProblems
          .map((p) => `"${p.problem}"`)
          .join(", ")}. 
        
        You MUST generate a completely different problem that:
        1. Uses different numbers/values
        2. Has a different context/scenario  
        3. Tests the same concept but in a different way
        4. Is NOT similar to any of the solved problems above
        
        ${attemptCount > 1 ? `RETRY ATTEMPT ${attemptCount}: Your previous attempt was too similar. Be MORE creative and generate a COMPLETELY different problem!` : ""}
        
        IMPORTANT: This is a request for a NEW lesson. Generate a fresh, unique problem that the student has never seen before.
        
        Make sure the new problem is genuinely different!`
      : "";

  const response = await prompt
    .pipe(llmAdapter.models.model.withStructuredOutput(ConceptAssignmentSchema))
    .invoke(
      {
        grade,
        country,
        textbook,
        conceptName: concept.concept.name,
        conceptDescription: concept.concept.description,
        skillLevel: concept.skillLevel,
        language: LanguageName[language],
        solvedProblems: `${solvedProblemsText}
        
        [CACHE_BUSTER: ${Date.now()}-${Math.random()}-attempt-${attemptCount}]
        
        Generate a completely NEW and DIFFERENT problem for this lesson request.`,
      },
      {
        metadata: {
          functionName: "getConceptAssignment",
          userId: studentContext.userId,
          conceptId: concept.concept.id,
        },
      },
    );

  // Return the LLM response directly
  return response;
}
