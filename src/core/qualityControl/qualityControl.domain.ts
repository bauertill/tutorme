import { LLMAdapter } from "../adapters/llmAdapter";

export async function addPositiveSampleToQualityControlDataset(
  llmAdapter: LLMAdapter,
  runId: string,
) {
  if (!runId) {
    throw new Error("Run ID is required to add to dataset");
  }

  const dataset = await llmAdapter.datasets.createDatasetInLangSmith(
    "student-solution-positive-samples",
    process.env.NODE_ENV,
  );
  await llmAdapter.datasets.addRunToDataset(dataset.id, runId);
}
