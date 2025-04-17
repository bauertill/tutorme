import { ImageRegion } from "@/core/assignment/types";
import { type Language, LanguageName } from "@/i18n/types";
import { HumanMessage } from "@langchain/core/messages";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
  SystemMessagePromptTemplate,
} from "@langchain/core/prompts";
import * as hub from "langchain/hub";
import { z } from "zod";
import { model } from "../model";

const systemPromptTemplate = SystemMessagePromptTemplate.fromTemplate(
  `You are an AI assistant that translates an image of math problems into a list of problems. 
Go through the image and extract all the problems. Problems might be nested, in this case you should flatten the data structure and reformulate the problems so they are standalone.
Also come up with a title for the assignment.

If a problem contains visual elements or requires the image to be understood (especially for geometric questions), you should:
1. Indicate this in your response with "requiresImage: true"
2. Specify the region of the image that contains the visual elements using coordinates (topLeft and bottomRight) where 0,0 is the top-left corner and 1,1 is the bottom-right corner

For example when given:
# EXERCISE 2 \n
'(a) Consider the numbers 24 and 504 .\n' +
'(1) Write both numbers as a product of primes.\n' +
'(2) Write \\( \\frac{24}{504} \\) in decimal form.\n' +

Your response should be:
[
    {{
        "problemText": "Consider the numbers 24 and 504. Write both numbers as a product of primes.",
        "problemNumber": "(a) (1)",
    }},
    {{  
        "problemText": "Consider the numbers 24 and 504. Write \\( \\frac{24}{504} \\) in decimal form.",
        "problemNumber": "(a) (2)",
    }}
]

For an image with geometric content like:
# EXERCISE 3 \n
'(a) Find the area of the shaded triangle in the figure below.\n' +
[IMAGE: A circle with radius 5 and a triangle inscribed in it] \n

Your response should be:
[
    {{
        "problemText": "Find the area of the shaded triangle in the figure.",
        "problemNumber": "(a)",
        "relevantImageSegment": {{  
            "topLeft": {{"x": 0.2, "y": 0.4}},
            "bottomRight": {{"x": 0.8, "y": 0.9}}
        }}
    }}
]

Write your response in {language} language only.
Here is the image of the problems:
`,
  {
    name: "extract_assignment_system_prompt",
  },
);

export const extractAssignmentPromptTemplate = ChatPromptTemplate.fromMessages([
  systemPromptTemplate,
  new MessagesPlaceholder("uploadedImage"),
]);

const RawProblem = z.object({
  problemText: z
    .string()
    .describe("The text of the problem, formatted as LaTeX"),
  problemNumber: z.string().describe("The number of the problem"),
  relevantImageSegment: ImageRegion.optional().describe(
    "Region of the image containing the visual elements",
  ),
});

type RawProblem = z.infer<typeof RawProblem>;
const RawAssignment = z.object({
  assignmentTitle: z.string().describe("The title of the assignment"),
  problems: z.array(RawProblem),
});
type RawAssignment = z.infer<typeof RawAssignment>;

export async function extractAssignmentFromImage(
  documentUrl: string,
  language: Language,
  userId?: string,
): Promise<RawAssignment> {
  const prompt = await hub.pull("extract_assignment");

  return await prompt.pipe(model.withStructuredOutput(RawAssignment)).invoke(
    {
      language: LanguageName[language],
      uploadedImage: new HumanMessage({
        content: [
          {
            type: "image_url",
            image_url: { url: documentUrl, detail: "high" },
          },
        ],
      }),
    },
    {
      metadata: {
        userId,
        documentUrl,
        functionName: "extractAssignmentFromImage",
      },
    },
  );
}
