import { type LLMAdapter } from "@/core/adapters/llmAdapter";
import { type Language } from "@/i18n/types";
import { HumanMessage } from "@langchain/core/messages";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
  SystemMessagePromptTemplate,
} from "@langchain/core/prompts";
import { RunnableLambda, RunnableParallel } from "@langchain/core/runnables";
import { z } from "zod";

export const JudgeHandwritingSchema = z.object({
  latex_code: z.string().describe("The LaTeX code of the student's solution"),
  latex_code_alternative: z
    .string()
    .optional()
    .describe(
      "An alternative LaTeX code of the student's solution. If the handwriting is ambiguous, this should be provided. If the handwriting is unambiguous, this should be an empty string.",
    ),
});
export type JudgeHandwritingOutput = z.infer<typeof JudgeHandwritingSchema>;

export const ConsolidateHandwritingSchema = z.object({
  analysis: z
    .string()
    .describe(
      "A brief analysis and reasoning about the received interpretations.",
    ),
  agreement: z.boolean().describe("Whether the interpretations agree."),
  clarifying_request: z
    .string()
    .optional()
    .describe(
      "A request addressed to the student asking to write the specific ambiguous parts of the solution in a more legible way.",
    ),
});
export type ConsolidateHandwritingOutput = z.infer<
  typeof ConsolidateHandwritingSchema
>;

const handwritingSystemPromptTemplate =
  SystemMessagePromptTemplate.fromTemplate(
    `\
Convert a given image containing handwritten mathematical equations or expressions into corresponding LaTeX code.

# Steps

1. **Analyze Image Content**: Inspect the image carefully to identify all handwritten mathematical symbols, expressions, and any pertinent contextual information.
2. **Interpret Handwriting**: Translate each recognized mathematical symbol and expression from handwriting into standard text-based mathematical form.
3. **Convert to LaTeX Syntax**: Transcribe the interpreted text into LaTeX code. Ensure that all mathematical expressions follow proper LaTeX formatting rules.
4. **Review for Accuracy**: Double-check the LaTeX output to ensure it accurately reflects the content and structure of the handwritten math from the image.

Ensure all expressions are valid LaTeX and properly formatted for use in a LaTeX document.

The user's language is {language}.

Additional context:
"""
{context}
"""
`,
    {
      name: "judge_handwriting_system_prompt",
    },
  );

export const consolidateHandwritingPromptTemplate =
  ChatPromptTemplate.fromMessages([
    SystemMessagePromptTemplate.fromTemplate(
      `\
The student is working on a Math problem.
You will receive several interpretations of the student's handwriting.
If they all agree (apart from formatting differences), return the LaTeX code of the student's solution.

If they don't agree, apparently the handwriting wasn't legible enough and you need to ask the student to rewrite the specific ambiguous parts of the solution in a more legible way.

# Steps

1. **Evaluate Agreement:** Check if the interpretations agree on the student's solution.
2. **Identify Ambiguity:** If they don't agree, identify specific ambiguous parts that require rewriting.
3. **Formulate Request:** Construct a request for the student to rewrite specific unclear parts.
4. **Return Result:** If the interpretations agree, return null instead of a request.

# Output Format

- If the interpretations agree: agreement = true
- If the interpretations don't agree:
  - agreement = false
  - Call out the specific ambiguous parts and request for rewriting, formatted as a sentence.

# Notes

- Ignore any differences in comma vs. dot notation for decimal numbers.
- Include the specific parts of the solution that are ambiguous.
- Don't judge the mathematical correctness of the handwriting or reveal the correct answer.
- Keep responses in an informal tone, consistent with the language: '{language}'.
- Wrap any LaTeX code in delimiters like $ or $$ to make it clear that it's LaTeX code.
- Don't mention the fact that it was interpreted multiple times, just that it's not clear what's meant.
`,
    ),
    new MessagesPlaceholder("responses"),
  ]);

export const judgeHandwritingPromptTemplate = ChatPromptTemplate.fromMessages([
  handwritingSystemPromptTemplate,
  new MessagesPlaceholder("msgs"),
]);

export type JudgeHandwritingInput = {
  solutionImage: string;
  exerciseText: string;
  referenceSolution: string;
  language: Language;
};

export async function judgeHandwriting(
  input: JudgeHandwritingInput,
  llmAdapter: LLMAdapter,
): Promise<z.infer<typeof ConsolidateHandwritingSchema>> {
  const { language, solutionImage, exerciseText, referenceSolution } = input;
  const context = `${exerciseText}\n\n${referenceSolution}`;
  const prompt = await llmAdapter.hub.pull("judge_handwriting");
  const msgs: HumanMessage[] = [
    new HumanMessage({
      content: [
        {
          type: "image_url",
          image_url: {
            url: solutionImage,
            detail: "high",
          },
        },
      ],
    }),
  ];
  const dropContext = RunnableLambda.from(
    (input: { msgs: HumanMessage[]; language: Language; context: string }) => {
      return {
        msgs: input.msgs,
        language: input.language,
        context: "",
      } as const;
    },
  );
  const withContext = prompt.pipe(
    llmAdapter.models.model.withStructuredOutput(JudgeHandwritingSchema),
  );
  const withoutContext = dropContext
    .pipe(prompt)
    .pipe(
      llmAdapter.models.nondeterministicModel.withStructuredOutput(
        JudgeHandwritingSchema,
      ),
    );
  const mapChain = RunnableParallel.from({
    a: withoutContext,
    b: withoutContext,
    c: withoutContext,
    d: withContext,
  }).pipe(
    RunnableLambda.from((input) => {
      return {
        language,
        responses: [input.a, input.b, input.d, input.c].map(
          (r, i) =>
            new HumanMessage(`Interpretation ${i + 1}: ${r.latex_code}`),
        ),
      } as const;
    }),
  );

  const consolidatePrompt = await llmAdapter.hub.pull(
    "consolidate_handwriting",
  );

  const response = await mapChain
    .pipe(consolidatePrompt)
    .pipe(
      llmAdapter.models.model.withStructuredOutput(
        ConsolidateHandwritingSchema,
      ),
    )
    .invoke(
      { msgs, language, context },
      {
        metadata: {
          functionName: "judgeHandwriting",
        },
      },
    );

  return response;
}
