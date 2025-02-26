import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
} from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";
import { z } from "zod";
import { Question } from "../concept/types";
import { type Concept, type Goal } from "../goal/types";
import { EducationalVideo } from "../learning/types";
import {
  GENERATE_VIDEO_SEARCH_QUERY_HUMAN_TEMPLATE,
  GENERATE_VIDEO_SEARCH_QUERY_PROMPT,
} from "./prompts/generateVideoSearchQuery";
import { HUMAN_TEMPLATE, SYSTEM_PROMPT } from "./prompts/getConceptsForGoal";
import {
  EVALUATION_HUMAN_TEMPLATE,
  EVALUATION_SYSTEM_PROMPT,
} from "./prompts/initialKnowledgeQuiz";
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

  async createInitialKnowledgeQuiz(
    concept: Concept,
  ): Promise<
    Pick<
      Question,
      "question" | "options" | "correctAnswer" | "difficulty" | "explanation"
    >[]
  > {
    const evaluationPromptTemplate = ChatPromptTemplate.fromMessages([
      SystemMessagePromptTemplate.fromTemplate(EVALUATION_SYSTEM_PROMPT),
      HumanMessagePromptTemplate.fromTemplate(EVALUATION_HUMAN_TEMPLATE),
    ]);
    const schema = z.object({
      questions: z.array(
        Question.pick({
          question: true,
          options: true,
          correctAnswer: true,
          difficulty: true,
          explanation: true,
        }),
      ),
    });
    const evaluationChain = evaluationPromptTemplate
      .pipe(this.model.withStructuredOutput(schema))
      .withConfig({
        tags: ["concept-evaluation"],
        runName: "Generate Concept Quiz",
      });

    const response = await evaluationChain.invoke(
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

    return response.questions.map((question) => ({
      ...question,
      id: crypto.randomUUID(),
    }));
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

    return response.content.toString().trim();
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
}

export const llmAdapter = new LLMAdapter();
