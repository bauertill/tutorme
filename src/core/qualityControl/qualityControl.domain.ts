import { LLMAdapter } from "../adapters/llmAdapter";

export async function addPositiveSampleToQualityControlDataset(
  llmAdapter: LLMAdapter,
  runId: string,
) {
  const dataset = await llmAdapter.datasets.createDatasetInLangSmith(
    "student-solution-positive-samples",
    process.env.NODE_ENV,
  );
  await llmAdapter.datasets.addRunToDataset(dataset.id, runId);
}
