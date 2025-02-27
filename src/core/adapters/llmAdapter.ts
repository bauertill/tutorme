import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
} from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";
import { z } from "zod";
import {
  QuestionParams,
  QuestionResponseWithQuestion,
} from "../concept/types";
import type { Concept, Goal } from "../goal/types";
import type { EducationalVideo } from "../learning/types";
import {
  EVALUATION_HUMAN_TEMPLATE,
  EVALUATION_SYSTEM_PROMPT,
} from "./prompts/createQuestionForConcept";
import {
  DECIDE_NEXT_ACTION_HUMAN_TEMPLATE,
  DECIDE_NEXT_ACTION_SYSTEM_PROMPT,
} from "./prompts/decideNextAction";
import {
  FOLLOW_UP_QUESTION_HUMAN_TEMPLATE,
  FOLLOW_UP_QUESTION_SYSTEM_PROMPT,
} from "./prompts/followUpQuestion";
import {
  TEACHER_REPORT_HUMAN_TEMPLATE,
  TEACHER_REPORT_SYSTEM_PROMPT,
} from "./prompts/generateTeacherReport";
import {
  GENERATE_VIDEO_SEARCH_QUERY_HUMAN_TEMPLATE,
  GENERATE_VIDEO_SEARCH_QUERY_PROMPT,
} from "./prompts/generateVideoSearchQuery";
import { HUMAN_TEMPLATE, SYSTEM_PROMPT } from "./prompts/getConceptsForGoal";
import {
  RANK_VIDEOS_HUMAN_TEMPLATE,
  RANK_VIDEOS_SYSTEM_PROMPT,
} from "./prompts/rankVideos";

export class LLMAdapter {
  private model: ChatOpenAI;

  constructor() {
    this.model = new ChatOpenAI({
      modelName: "gpt-4o",
      temperature: 0.7,
    });
  }

  async getConceptsForGoal(goal: Goal): Promise<Concept[]> {
    const promptTemplate = ChatPromptTemplate.fromMessages([
      SystemMessagePromptTemplate.fromTemplate(SYSTEM_PROMPT),
      HumanMessagePromptTemplate.fromTemplate(HUMAN_TEMPLATE),
    ]);

    const schema = z.object({
      concepts: z.array(
        z.object({
          name: z.string().describe("The name of the concept"),
          description: z.string().describe("A description of the concept"),
        }),
      ),
    });

    const chain = promptTemplate
      .pipe(this.model.withStructuredOutput(schema))
      .withConfig({
        tags: ["concept-extraction"],
        runName: "Extract Learning Concepts",
      });
    const response = await chain.invoke(
      {
        goal: goal.name,
      },
      {
        metadata: {
          goalId: goal.id,
          userId: goal.userId,
        },
      },
    );

    // Map the parsed concepts to our domain model
    const concepts: Concept[] = response.concepts.map((concept) => ({
      id: crypto.randomUUID(),
      name: concept.name,
      description: concept.description,
      goalId: goal.id,
      masteryLevel: "UNKNOWN",
    }));
    return concepts;
  }

  async createFirstQuestionForQuiz(concept: Concept): Promise<QuestionParams> {
    const evaluationPromptTemplate = ChatPromptTemplate.fromMessages([
      SystemMessagePromptTemplate.fromTemplate(EVALUATION_SYSTEM_PROMPT),
      HumanMessagePromptTemplate.fromTemplate(EVALUATION_HUMAN_TEMPLATE),
    ]);
    const evaluationChain = evaluationPromptTemplate
      .pipe(this.model.withStructuredOutput(QuestionParams))
      .withConfig({
        tags: ["concept-evaluation"],
        runName: "Generate Concept Quiz",
      });

    return retryUntilValid(() => evaluationChain.invoke(
      {
        conceptName: concept.name,
        conceptDescription: concept.description,
      },
      {
        metadata: {
          conceptId: concept.id,
        },
      },
    ));
  }

  async createFollowUpQuestion(
    concept: Concept,
    userResponses: QuestionResponseWithQuestion[],
  ): Promise<QuestionParams> {
    const promptTemplate = ChatPromptTemplate.fromMessages([
      SystemMessagePromptTemplate.fromTemplate(
        FOLLOW_UP_QUESTION_SYSTEM_PROMPT,
      ),
      HumanMessagePromptTemplate.fromTemplate(
        FOLLOW_UP_QUESTION_HUMAN_TEMPLATE,
      ),
    ]);

    const chain = promptTemplate
      .pipe(this.model.withStructuredOutput(QuestionParams))
      .withConfig({
        tags: ["concept-evaluation"],
        runName: "Generate Concept Quiz",
      });

    const previousQuestionsAndResponses = userResponses.map(
      (response) =>
        `question: ${response.question.question}\nresponse: ${response.answer}\n isCorrect: ${response.isCorrect}`,
    );
    return retryUntilValid(() => chain.invoke(
      {
        conceptName: concept.name,
        conceptDescription: concept.description,
        previousQuestionsAndResponses,
        currentMasteryLevel: concept.masteryLevel,
      },      {
        metadata: {
          conceptId: concept.id,
          userId: userResponses[0]?.userId,
        },
      },

    ));
  }

  /**
   * Decides whether to continue a quiz or finalize it based on user responses
   * @param concept The concept being tested
   * @param userResponses All user responses for this concept
   * @returns Promise with decision to continue or finalize quiz
   */
  async decideNextAction(
    concept: Concept,
    userResponses: QuestionResponseWithQuestion[],
  ): Promise<{ action: "continueQuiz" | "finalizeQuiz"; reason: string }> {
    const promptTemplate = ChatPromptTemplate.fromMessages([
      SystemMessagePromptTemplate.fromTemplate(
        DECIDE_NEXT_ACTION_SYSTEM_PROMPT,
      ),
      HumanMessagePromptTemplate.fromTemplate(
        DECIDE_NEXT_ACTION_HUMAN_TEMPLATE,
      ),
    ]);

    const schema = z.object({
      action: z.enum(["continueQuiz", "finalizeQuiz"]),
      reason: z.string().describe("Explanation of why this action was chosen"),
    });

    const chain = promptTemplate
      .pipe(this.model.withStructuredOutput(schema))
      .withConfig({
        tags: ["quiz-decision"],
        runName: "Decide Next Quiz Action",
      });

    const questionsAndResponses = userResponses.map(
      (response) =>
        `question: ${response.question.question}\ndifficulty: ${response.question.difficulty}\nresponse: ${response.answer}\nisCorrect: ${response.isCorrect}`,
    );

    return await chain.invoke(
      {
        conceptName: concept.name,
        conceptDescription: concept.description,
        questionsAndResponses,
        currentMasteryLevel: concept.masteryLevel,
        questionCount: userResponses.length,
      },
      {
        metadata: {
          conceptId: concept.id,
          userId: userResponses[0]?.userId,
        },
      },
    );
  }

  /**
   * Generate a good search query for finding educational videos about a concept
   * @param concept The concept to search for videos about
   * @returns Promise with recommended search query
   */
  async generateVideoSearchQuery(concept: Concept): Promise<string> {
    // @TODO include goal, skill level, user context

    const promptTemplate = ChatPromptTemplate.fromMessages([
      SystemMessagePromptTemplate.fromTemplate(
        GENERATE_VIDEO_SEARCH_QUERY_PROMPT,
      ),
      HumanMessagePromptTemplate.fromTemplate(
        GENERATE_VIDEO_SEARCH_QUERY_HUMAN_TEMPLATE,
      ),
    ]);

    const chain = promptTemplate.pipe(this.model);
    const response = await chain.invoke(
      {
        conceptName: concept.name,
        conceptDescription: concept.description,
      },
      {
        metadata: {
          conceptId: concept.id,
        },
      },
    );

    // Fix the string conversion issue by explicitly calling toString on the content
    return response.content instanceof Object
      ? JSON.stringify(response.content)
      : String(response.content).trim();
  }

  /**
   * Rank a list of educational videos based on their relevance to a concept
   * @param videos List of educational videos to rank
   * @param concept The concept to rank videos against
   * @returns Promise with the highest ranked video
   */
  async rankVideos(
    videos: EducationalVideo[],
    concept: Concept,
  ): Promise<EducationalVideo> {
    // If there's only one video or no videos, return the first one or throw an error
    if (videos.length === 0) {
      throw new Error("No videos to rank");
    }

    if (videos.length === 1 && videos[0]) return videos[0];

    const promptTemplate = ChatPromptTemplate.fromMessages([
      SystemMessagePromptTemplate.fromTemplate(RANK_VIDEOS_SYSTEM_PROMPT),
      HumanMessagePromptTemplate.fromTemplate(RANK_VIDEOS_HUMAN_TEMPLATE),
    ]);

    const schema = z.object({
      bestVideoId: z
        .string()
        .describe("The ID of the best video for learning this concept"),
    });

    const chain = promptTemplate
      .pipe(this.model.withStructuredOutput(schema))
      .withConfig({
        tags: ["video-ranking"],
        runName: "Rank Educational Videos",
      });

    const response = await chain.invoke(
      {
        conceptName: concept.name,
        conceptDescription: concept.description,
        masteryLevel: concept.masteryLevel,
        videosJson: JSON.stringify(videos, null, 2),
      },
      {
        metadata: {
          conceptId: concept.id,
        },
      },
    );

    // Find the best video by ID
    const bestVideoId = response.bestVideoId;
    const bestVideo = videos.find((video) => video.id === bestVideoId);
    if (bestVideo) {
      return bestVideo;
    }
    throw new Error("No best video found", { cause: response });
  }

  /**
   * Generate a comprehensive teacher report after a quiz is completed
   * @param concept The concept that was tested in the quiz
   * @param userResponses All user responses for this quiz
   * @returns Promise with a teacher report as a string
   */
  async generateTeacherReport(
    concept: Concept,
    userResponses: QuestionResponseWithQuestion[],
  ): Promise<string> {
    const promptTemplate = ChatPromptTemplate.fromMessages([
      SystemMessagePromptTemplate.fromTemplate(TEACHER_REPORT_SYSTEM_PROMPT),
      HumanMessagePromptTemplate.fromTemplate(TEACHER_REPORT_HUMAN_TEMPLATE),
    ]);

    const chain = promptTemplate.pipe(this.model);

    const questionsAndResponses = userResponses
      .map(
        (response) =>
          `question: ${response.question.question}\ndifficulty: ${response.question.difficulty}\nresponse: ${response.answer}\nisCorrect: ${response.isCorrect}\nexplanation: ${response.question.explanation}`,
      )
      .join("\n\n");

    const response = await chain.invoke(
      {
        conceptName: concept.name,
        conceptDescription: concept.description,
        questionsAndResponses,
      },
      {
        metadata: {
          conceptId: concept.id,
        },
      },
    );

    // Convert the response to a string
    return response.content instanceof Object
      ? JSON.stringify(response.content)
      : String(response.content).trim();
  }
}

export const llmAdapter = new LLMAdapter();


async function retryUntilValid(fn: () => Promise<QuestionParams>): Promise<QuestionParams> {
  for (let i = 0; i < 3; i++) { 
    const question = await fn();
    const isValidQuestion = question.options.includes(question.correctAnswer);
    if (isValidQuestion) 
      return question;
  }
  throw new Error("Failed to generate a valid question");
}