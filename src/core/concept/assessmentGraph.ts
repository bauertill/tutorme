import { env } from "@/env";
import {
  AIMessage,
  HumanMessage,
  SystemMessage,
  type BaseMessage,
} from "@langchain/core/messages";
import {
  Annotation,
  Command,
  END,
  interrupt,
  START,
  StateGraph,
} from "@langchain/langgraph";
import { PostgresSaver } from "@langchain/langgraph-checkpoint-postgres";
import assert from "assert";
import { z } from "zod";
import type { LLMAdapter } from "../adapters/llmAdapter";
import type { Concept } from "../goal/types";
import { AssessmentQuestion, type AssessmentLogEntry } from "./types";

const StateAnnotation = Annotation.Root({
  question: Annotation<AssessmentQuestion>,
  userResponse: Annotation<string | undefined>,
  isCorrect: Annotation<boolean | undefined>,
  teacherSummary: Annotation<string | undefined>,
});

export async function createAssessmentGraph(
  concept: Concept,
  logEntries: AssessmentLogEntry[],
  llmAdapter: LLMAdapter,
) {
  const checkpointer = PostgresSaver.fromConnString(env.DATABASE_URL);

  await checkpointer.setup();

  function callLlm<T extends z.ZodSchema>(
    messages: BaseMessage[],
    schema: T,
  ): Promise<z.infer<T>> {
    return llmAdapter.model
      .withStructuredOutput(schema, { name: "Response" })
      .invoke(messages);
  }

  async function evaluateAnswer(
    state: typeof StateAnnotation.State,
  ): Promise<Command> {
    const systemPrompt =
      "You evaluate the user's answer to the question and return a score.";
    assert(state.question, "No question found");
    assert(state.userResponse, "No user response found");
    const messages = [
      new SystemMessage(systemPrompt),
      new AIMessage(state.question.question),
      new HumanMessage(state.userResponse),
    ];
    const outputSchema = z.object({
      isCorrect: z.boolean().describe("Whether the user's answer is correct."),
    });
    const response = await callLlm(messages, outputSchema);
    const update = { isCorrect: response.isCorrect };
    if (response.isCorrect) {
      console.log("Correct, finish assessment");
      return new Command({
        goto: "finishAssessment",
        update,
      });
    } else {
      console.log("Incorrect, ask another question");
      return new Command({
        goto: "askQuestion",
        update,
      });
    }
  }

  async function askQuestion(
    _state: typeof StateAnnotation.State,
  ): Promise<Command> {
    const systemPrompt = `You ask the user a question about ${concept.name} and wait for their response.`;
    const messages = [new SystemMessage(systemPrompt)];
    const outputSchema = AssessmentQuestion;
    const response = await callLlm(messages, outputSchema);
    return new Command({
      goto: "human",
      update: { question: response },
    });
  }

  function humanNode(_state: typeof StateAnnotation.State): Command {
    const userInput: string = interrupt("Ready for user input.");
    console.log("Human input", userInput);
    return new Command({
      goto: "evaluateAnswer",
      update: { userResponse: userInput },
    });
  }

  async function finishAssessment(
    _state: typeof StateAnnotation.State,
  ): Promise<Command> {
    const systemPrompt =
      "You finish the assessment and return a summary of the assessment.";
    const logString = logEntries
      .map(
        (logEntry) =>
          `${logEntry.question.question}\n${logEntry.userResponse}\n${logEntry.isCorrect ? "Correct!" : "Incorrect!"}`,
      )
      .join("\n");
    const messages = [
      new SystemMessage(systemPrompt),
      new HumanMessage(logString),
    ];
    const outputSchema = z.object({
      summary: z.string().describe("Teacher's summary of the assessment."),
    });
    const response = await callLlm(messages, outputSchema);
    console.log("Finishing assessment", response.summary);
    return new Command({
      goto: END,
      update: { teacherSummary: response.summary },
    });
  }

  const builder = new StateGraph(StateAnnotation)
    .addNode("evaluateAnswer", evaluateAnswer, {
      ends: ["askQuestion", "finishAssessment"],
    })
    .addNode("askQuestion", askQuestion, {
      ends: ["human"],
    })
    .addNode("human", humanNode, {
      ends: ["evaluateAnswer"],
    })
    .addNode("finishAssessment", finishAssessment, {
      ends: [END],
    })
    .addEdge(START, "askQuestion");

  const graph = builder.compile({ checkpointer });

  return graph;
}
