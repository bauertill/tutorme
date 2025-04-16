import * as hub from "langchain/hub";
import { Client } from "langsmith";
import { evaluate, type EvaluatorT } from "langsmith/evaluation";
import { model } from "../../model";
import { EvaluateSolutionSchema } from "../evaluateSolution";

const hasMistakesEvaluator: EvaluatorT = async ({
  outputs,
  referenceOutputs,
}: {
  outputs: Record<string, unknown>;
  referenceOutputs?: Record<string, unknown>;
}) => {
  return {
    key: "hasMistakes",
    score: outputs.hasMistakes === referenceOutputs?.hasMistakes ? 1 : 0,
  };
};
const isCompleteEvaluator: EvaluatorT = async ({
  outputs,
  referenceOutputs,
}: {
  outputs: Record<string, unknown>;
  referenceOutputs?: Record<string, unknown>;
}) => {
  return {
    key: "isComplete",
    score: outputs.isComplete === referenceOutputs?.isComplete ? 1 : 0,
  };
};

async function evaluateEvaluateSolution() {
  const client = new Client();
  const prompt = await hub.pull("evaluate_solution");
  const chain = prompt.pipe(model.withStructuredOutput(EvaluateSolutionSchema));
  const datasetId = "ab4b0f1e-8635-40e6-bae1-59d6e221e844";
  const dataset = await client.readDataset({ datasetId });

  await evaluate(chain, {
    data: dataset.name,
    evaluators: [hasMistakesEvaluator, isCompleteEvaluator],
    experimentPrefix: "EvaluateSolution v0",
  });
}

evaluateEvaluateSolution()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
