import { type LLMAdapter } from "../adapters/llmAdapter";

export async function addPositiveSampleToQualityControlDataset(
  llmAdapter: LLMAdapter,
  runId: string,
) {
  const dataset = await llmAdapter.datasets.getOrCreateDataset(
    "student-solution-positive-samples",
    process.env.NODE_ENV,
  );
  await llmAdapter.datasets.addRunToDataset(dataset.id, runId);
}

export async function addNegativeSampleToAnnotationQueue(
  llmAdapter: LLMAdapter,
  runId: string,
) {
  const queue = await llmAdapter.datasets.getOrCreateAnnotationQueue(
    "student-solution-negative-samples",
    process.env.NODE_ENV,
  );
  await llmAdapter.datasets.addRunToAnnotationQueue(runId, queue.id);
}
