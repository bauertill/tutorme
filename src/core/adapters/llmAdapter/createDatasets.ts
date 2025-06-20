import { Client } from "langsmith";
// Function to push all prompts to LangSmith
export async function createDatasetInLangSmith() {
  const client = new Client();
  const dataset = await client.createDataset(
    "student-solution-positive-samples",
    {
      description: "Dataset for sanity checks of student solutions",
    },
  );
}

createDatasetInLangSmith()
  .then(() => {
    console.log("Prompts pushed to LangSmith successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Error pushing prompts to LangSmith:", error);
    process.exit(1);
  });
