import { Client } from "langsmith";
import { describe, logOutputs, test } from "langsmith/vitest";
import { expect } from "vitest";
import { type Language } from "../../../../../i18n/types";
import { evaluateSolution } from "../evaluateSolution";

describe("evaluateSolution tests", async () => {
  const client = new Client();
  const datasetId = "ab4b0f1e-8635-40e6-bae1-59d6e221e844";
  const dataset = await client.readDataset({ datasetId });

  test(
    "evaluates solutions correctly",
    {
      inputs: {
        problemId: "test-1",
        exerciseText: "Sample exercise",
        solutionImage: "base64...",
        referenceSolution: "Sample solution",
        language: "en" as Language,
      },
      referenceOutputs: {
        hasMistakes: false,
        isCorrect: true,
      },
    },
    async ({ inputs, referenceOutputs }) => {
      const result = await evaluateSolution(inputs);
      logOutputs({ result });

      // Type assertion since we know these values exist in our test case
      const expectedOutputs = referenceOutputs as {
        hasMistakes: boolean;
        isCorrect: boolean;
      };
      expect(result.hasMistakes).toBe(expectedOutputs.hasMistakes);
      expect(!result.hasMistakes && result.isComplete).toBe(
        expectedOutputs.isCorrect,
      );
    },
  );
});
