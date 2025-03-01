import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
} from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";
import { z } from "zod";
import {
  QuestionParams,
  type Concept,
  type QuestionResponseWithQuestion,
} from "../concept/types";
import type { Goal } from "../goal/types";
import type {
  EducationalVideo,
  Lesson,
  LessonExerciseTurn,
  LessonExplanationTurn,
  LessonIteration,
  LessonTurn,
} from "../learning/types";
import {
  CREATE_LESSON_GOAL_HUMAN_TEMPLATE,
  CREATE_LESSON_GOAL_SYSTEM_PROMPT,
} from "./prompts/createLessonGoal";
import {
  CREATE_LESSON_ITERATION_HUMAN_TEMPLATE,
  CREATE_LESSON_ITERATION_SYSTEM_PROMPT,
} from "./prompts/createLessonIteration";
import {
  EVALUATION_HUMAN_TEMPLATE,
  EVALUATION_SYSTEM_PROMPT,
} from "./prompts/createQuestionForConcept";
import {
  DECIDE_NEXT_ACTION_HUMAN_TEMPLATE,
  DECIDE_NEXT_ACTION_SYSTEM_PROMPT,
} from "./prompts/decideNextAction";
import {
  EVALUATE_LESSON_RESPONSE_HUMAN_TEMPLATE,
  EVALUATE_LESSON_RESPONSE_SYSTEM_PROMPT,
} from "./prompts/evaluateLessonResponse";
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
      teacherReport: null,
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

    return retryUntilValid(() =>
      evaluationChain.invoke(
        {
          conceptName: concept.name,
          conceptDescription: concept.description,
        },
        {
          metadata: {
            conceptId: concept.id,
          },
        },
      ),
    );
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
    return retryUntilValid(() =>
      chain.invoke(
        {
          conceptName: concept.name,
          conceptDescription: concept.description,
          previousQuestionsAndResponses,
          currentMasteryLevel: concept.masteryLevel,
        },
        {
          metadata: {
            conceptId: concept.id,
            userId: userResponses[0]?.userId,
          },
        },
      ),
    );
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

  /**
   * Creates a focused lesson goal based on the concept and teacher's report
   * @param concept The concept to create a lesson goal for
   * @param userId The ID of the user
   * @returns A focused lesson goal as a string
   */
  async createLessonGoal(concept: Concept, userId: string): Promise<string> {
    const promptTemplate = ChatPromptTemplate.fromMessages([
      SystemMessagePromptTemplate.fromTemplate(
        CREATE_LESSON_GOAL_SYSTEM_PROMPT,
      ),
      HumanMessagePromptTemplate.fromTemplate(
        CREATE_LESSON_GOAL_HUMAN_TEMPLATE,
      ),
    ]);

    const chain = promptTemplate.pipe(this.model).withConfig({
      tags: ["lesson-goal-generation"],
      runName: "Generate Lesson Goal",
    });

    const response = await chain.invoke(
      {
        conceptName: concept.name,
        conceptDescription: concept.description,
        teacherReport:
          concept.teacherReport ?? "No previous assessments available.",
      },
      {
        metadata: {
          conceptId: concept.id,
          userId,
        },
      },
    );

    // Extract the lesson goal from the response
    const lessonGoal =
      response.content instanceof Object
        ? JSON.stringify(response.content)
        : String(response.content).trim();

    return lessonGoal;
  }

  /**
   * Creates the first iteration of a lesson
   * @param concept The concept to create a lesson for
   * @param userId The ID of the user
   * @returns The first lesson iteration with explanation and exercise
   */
  async createNextLessonIteration(
    concept: Concept,
    lessonGoal: string,
    lessonIterations: LessonIteration[],
    userId: string,
  ): Promise<{
    exercise: LessonExerciseTurn;
    explanation: LessonExplanationTurn;
  }> {
    const promptTemplate = ChatPromptTemplate.fromMessages([
      SystemMessagePromptTemplate.fromTemplate(
        CREATE_LESSON_ITERATION_SYSTEM_PROMPT,
      ),
      HumanMessagePromptTemplate.fromTemplate(
        CREATE_LESSON_ITERATION_HUMAN_TEMPLATE,
      ),
    ]);

    // Define schema for structured output
    const lessonSchema = z.object({
      explanation: z
        .string()
        .describe(
          "A clear, concise explanation of the concept targeted at the user's current understanding level. Should take no more than one minute to read.",
        ),
      exercise: z
        .string()
        .describe(
          "A practical exercise that helps the user apply the concept. Should be doable in 1-2 minutes.",
        ),
    });

    const chain = promptTemplate
      .pipe(this.model.withStructuredOutput(lessonSchema))
      .withConfig({
        tags: ["lesson-iteration-generation"],
        runName: "Generate Lesson Iteration",
      });

    // Extract previous iteration data to provide context
    const previousIterationsContext = lessonIterations.map(
      (iteration, index) => {
        const explanationTurn = iteration.turns.find(
          (turn) => turn.type === "explanation",
        );
        const exerciseTurn = iteration.turns.find(
          (turn) => turn.type === "exercise",
        );
        const userResponseTurn = iteration.turns.find(
          (turn) => turn.type === "user_input",
        );

        return {
          explanation: explanationTurn?.text || "No explanation provided",
          exercise: exerciseTurn?.text || "No exercise provided",
          userResponse: userResponseTurn?.text || "No user response provided",
        };
      },
    );

    const response = await chain.invoke(
      {
        conceptName: concept.name,
        conceptDescription: concept.description,
        lessonGoal,
        previousIterations: JSON.stringify(previousIterationsContext),
      },
      {
        metadata: {
          conceptId: concept.id,
          userId,
        },
      },
    );

    // Create and return the lesson turns
    return {
      explanation: {
        type: "explanation",
        text: response.explanation,
      },
      exercise: {
        type: "exercise",
        text: response.exercise,
      },
    };
  }

  /**
   * Evaluates a user's response to a lesson exercise and creates a new lesson iteration
   * @param lesson The current lesson
   * @param userInput The user's response to the exercise
   * @returns Evaluation result with feedback and completion status
   */
  async decideNextLessonIteration(
    lesson: Lesson,
    userInput: string,
  ): Promise<{ evaluation: string; isComplete: boolean }> {
    // Get the last iteration from the lesson
    if (lesson.lessonIterations.length === 0) {
      throw new Error("Lesson has no iterations");
    }

    const lastIteration =
      lesson.lessonIterations[lesson.lessonIterations.length - 1]!;

    // Find the explanation and exercise turns in the last iteration
    const explanationTurn = lastIteration.turns.find(
      (turn: LessonTurn) => turn.type === "explanation",
    )!;
    const exerciseTurn = lastIteration.turns.find(
      (turn: LessonTurn) => turn.type === "exercise",
    )!;

    if (!explanationTurn || !exerciseTurn) {
      throw new Error(
        "Last iteration does not contain both explanation and exercise turns",
      );
    }

    const promptTemplate = ChatPromptTemplate.fromMessages([
      SystemMessagePromptTemplate.fromTemplate(
        EVALUATE_LESSON_RESPONSE_SYSTEM_PROMPT,
      ),
      HumanMessagePromptTemplate.fromTemplate(
        EVALUATE_LESSON_RESPONSE_HUMAN_TEMPLATE,
      ),
    ]);

    // Define the schema for structured output
    const evaluationSchema = z.object({
      isComplete: z
        .boolean()
        .describe("Whether the student has achieved the lesson goal"),
      feedback: z
        .string()
        .describe("Detailed feedback on the student's response"),
    });

    const chain = promptTemplate
      .pipe(this.model.withStructuredOutput(evaluationSchema))
      .withConfig({
        tags: ["lesson-evaluation"],
        runName: "Evaluate Lesson Response",
      });

    const response = await chain.invoke(
      {
        lessonGoal: lesson.lessonGoal,
        explanation: explanationTurn.text,
        exercise: exerciseTurn.text,
        userInput,
      },
      {
        metadata: {
          lessonId: lesson.id,
          userId: lesson.userId,
        },
      },
    );
    console.log("REPSONSE FORM THE LLM", response);

    return {
      evaluation: response.feedback,
      isComplete: response.isComplete,
    };
  }
}

export const llmAdapter = new LLMAdapter();

async function retryUntilValid(
  fn: () => Promise<QuestionParams>,
): Promise<QuestionParams> {
  for (let i = 0; i < 3; i++) {
    const question = await fn();
    const isValidQuestion = question.options.includes(question.correctAnswer);
    if (isValidQuestion) return question;
  }
  throw new Error("Failed to generate a valid question");
}
