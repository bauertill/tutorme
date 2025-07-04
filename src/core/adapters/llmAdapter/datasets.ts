import { Client, type Dataset } from "langsmith";

const client = new Client();

// Function to push all prompts to LangSmith
export async function getOrCreateDataset(
  name: string,
  stage: typeof process.env.NODE_ENV,
): Promise<Dataset> {
  const datasetName = `${name}${stage !== "production" ? `-${stage}` : ""}`;
  for await (const dataset of client.listDatasets({ datasetName })) {
    return dataset;
  }
  return await client.createDataset(datasetName);
}

export async function addRunToDataset(datasetId: string, runId: string) {
  const run = await client.readRun(runId, { loadChildRuns: true });
  if (run.inputs && run.outputs) {
    await client.createExample({
      inputs: run.inputs,
      outputs: run.outputs,
      dataset_id: datasetId,
    });
  } else {
    throw new Error("Run does not have required inputs and outputs");
  }
}

export async function addRunToAnnotationQueue(
  runId: string,
  annotationQueueId: string,
) {
  await client.addRunsToAnnotationQueue(annotationQueueId, [runId]);
}

export async function getOrCreateAnnotationQueue(
  name: string,
  stage: typeof process.env.NODE_ENV,
) {
  const annotationQueueName = `${name}${stage !== "production" ? `-${stage}` : ""}`;
  for await (const queue of client.listAnnotationQueues({
    name: annotationQueueName,
  })) {
    return queue;
  }
  return await client.createAnnotationQueue({
    name: annotationQueueName,
  });
}
