import { Client, type Dataset } from "langsmith";

// Function to push all prompts to LangSmith
export async function createDatasetInLangSmith(
  name: string,
  stage: typeof process.env.NODE_ENV,
): Promise<Dataset> {
  const client = new Client();
  const datasetName = `${name}${stage !== "production" ? `-${stage}` : ""}`;
  try {
    return await client.createDataset(datasetName);
  } catch (error) {
    console.error("Error creating dataset in LangSmith:", error);
    if (error instanceof Error && error.message.includes("already exists")) {
      console.log("Dataset already exists");
      for await (const dataset of client.listDatasets({ datasetName })) {
        return dataset;
      }
    } else {
      throw error;
    }
  }
  throw new Error("Dataset not found");
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
