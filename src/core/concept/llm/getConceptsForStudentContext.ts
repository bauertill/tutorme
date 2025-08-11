import { type LLMAdapter } from "@/core/adapters/llmAdapter";
import { type StudentContext } from "@/core/studentContext/studentContext.types";
import { type Language, LanguageName } from "@/i18n/types";
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
} from "@langchain/core/prompts";
import { z } from "zod";

// Define the system prompt template for generating year-end concepts
const systemPromptTemplate = SystemMessagePromptTemplate.fromTemplate(
  `You are an expert mathematics educator with deep knowledge of curricula across different countries and grade levels.
  
  Your goal is to generate a comprehensive list of mathematical concepts that a student needs to master by the end of their academic year.

  Requirements:
  - Generate all key mathematical concepts appropriate for the student's grade level
  - Align concepts with the educational standards and curriculum of the specified country
  - If a textbook is specified, prioritize concepts commonly covered in that textbook series
  - Each concept should include a clear, concise name and a brief description explaining what the concept entails
  - Make sure concepts do not overlap with each other

  Write your response in {language} language only.`,
  {
    name: "generate_concepts_system_prompt",
  },
);

// Define the human message template
const humanPromptTemplate = HumanMessagePromptTemplate.fromTemplate(
  `Generate the key mathematical concepts that need to be mastered by the end of the academic year for a student with the following context:
  
  Grade: {grade}
  Country: {country}
  Textbook: {textbook}
  
  Focus on concepts that are essential for their grade level and will prepare them for the next academic year.`,
  {
    name: "generate_concepts_human_prompt",
  },
);

// Combine the templates into a single prompt template
export const generateConceptsPromptTemplate = ChatPromptTemplate.fromMessages([
  systemPromptTemplate,
  humanPromptTemplate,
]);

// Define the output schema for a single concept
const ConceptGenerationSchema = z.object({
  name: z.string().describe("The concept name (e.g., 'Linear Equations')"),
  description: z
    .string()
    .describe(
      "A brief description of what the concept entails and why it's important",
    ),
});

// Define the output schema for the entire concept list
const ConceptsListSchema = z.object({
  concepts: z
    .array(ConceptGenerationSchema)
    .describe("All key concepts to master by end of year"),
});

export type ConceptGenerationSchema = z.infer<typeof ConceptGenerationSchema>;

export async function getConceptsForStudentContext(
  studentContext: StudentContext,
  language: Language,
  llmAdapter: LLMAdapter,
): Promise<ConceptGenerationSchema[]> {
  const { grade, country, textbook } = studentContext;

  // Use hub to pull the prompt (fallback to local prompt if not available)
  let prompt;
  try {
    prompt = await llmAdapter.hub.pull("generate_concepts_for_student_context");
  } catch {
    // Fallback to local prompt template
    console.log("No prompt found in hub, using local prompt");
    prompt = generateConceptsPromptTemplate;
  }

  // Generate the concepts using LLM
  const response = await prompt
    .pipe(llmAdapter.models.model.withStructuredOutput(ConceptsListSchema))
    .invoke(
      {
        grade,
        country,
        textbook,
        language: LanguageName[language],
      },
      {
        metadata: {
          functionName: "getConceptsForStudentContext",
          studentId: studentContext.userId,
        },
      },
    );

  return response.concepts;
}
