import { Client, type Dataset } from "langsmith";

// Function to push all prompts to LangSmith
export async function createDatasetInLangSmith(
  name: string,
  stage: typeof process.env.NODE_ENV,
): Promise<Dataset> {
  const client = new Client();
  const datasetName = `${name}${stage !== "production" ? `-${stage}` : ""}`;
  for await (const dataset of client.listDatasets({ datasetName })) {
    return dataset;
  }
  return await client.createDataset(datasetName);
}

export async function addRunToDataset(datasetId: string, runId: string) {
  const client = new Client();
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
