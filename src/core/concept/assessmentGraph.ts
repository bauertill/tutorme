import { env } from "@/env";
import { type BaseMessage } from "@langchain/core/messages";
import {
  Command,
  interrupt,
  MessagesAnnotation,
  START,
  StateGraph,
} from "@langchain/langgraph";
import { PostgresSaver } from "@langchain/langgraph-checkpoint-postgres";
import { z } from "zod";
import type { LLMAdapter } from "../adapters/llmAdapter";

export async function createAssessmentGraph(llmAdapter: LLMAdapter) {
  const checkpointer = PostgresSaver.fromConnString(env.DATABASE_URL);

  await checkpointer.setup(); // TODO: Only call this once? Or check if it's already setup?

  function callLlm(messages: BaseMessage[]) {
    const outputSchema = z.object({
      question: z.string().describe("A math question for the user to solve."),
    });
    return llmAdapter.model
      .withStructuredOutput(outputSchema, { name: "Response" })
      .invoke(messages);
  }

  async function evaluateAnswer(
    state: typeof MessagesAnnotation.State,
  ): Promise<Command> {
    const systemPrompt =
      "You evaluate the user's answer to the question and return a score.";
    // TODO: only pass the user's answer here, not the whole history
    const messages = [
      { role: "system", content: systemPrompt },
      ...state.messages,
    ] as BaseMessage[];
    const response = await callLlm(messages);
    const aiMsg = {
      role: "ai",
      content: response.question,
      name: "askQuestion",
    };
    // conditionally route to askQuestion or finishAssessment
    return new Command({ goto: "askQuestion", update: { messages: [aiMsg] } });
  }

  async function askQuestion(
    state: typeof MessagesAnnotation.State,
  ): Promise<Command> {
    const systemPrompt =
      "You ask the user a math question and wait for their response.";
    const messages = [
      { role: "system", content: systemPrompt },
      ...state.messages,
    ] as BaseMessage[];
    const response = await callLlm(messages);
    const aiMsg = {
      role: "ai",
      content: response.question,
      name: "askQuestion",
    };
    return new Command({ goto: "human", update: { messages: [aiMsg] } });
  }

  function humanNode(_state: typeof MessagesAnnotation.State): Command {
    const userInput: string = interrupt("Ready for user input.");
    return new Command({
      goto: "evaluateAnswer",
      update: {
        messages: [
          {
            role: "human",
            content: userInput,
          },
        ],
      },
    });
  }

  async function finishAssessment(
    state: typeof MessagesAnnotation.State,
  ): Promise<Command> {
    const systemPrompt = "You finish the assessment and return a score.";
    const messages = [
      { role: "system", content: systemPrompt },
      ...state.messages,
    ] as BaseMessage[];
    const response = await callLlm(messages);
    console.log("finishAssessment", response);
    return new Command({ goto: "end" });
  }

  const builder = new StateGraph(MessagesAnnotation)
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
      ends: ["end"],
    })
    .addEdge(START, "askQuestion");

  const graph = builder.compile({ checkpointer });

  return graph;
}
