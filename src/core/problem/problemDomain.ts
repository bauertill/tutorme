import type { DBAdapter } from "../adapters/dbAdapter";
import { Draft, parseCsv } from "../utils";
import { Problem } from "./types";

const UPLOAD_BATCH_SIZE = 20;

export async function createProblems(
  problems: Draft<Problem>[],
  dbAdapter: DBAdapter,
) {
  const searchStringFn = (problem: Draft<Problem>) =>
    `Type: ${problem.type};

Problem: ${problem.problem};

Solution: ${problem.solution};
`;

  for (let i = 0; i < problems.length; i += UPLOAD_BATCH_SIZE) {
    console.log(`Uploading batch ${i / UPLOAD_BATCH_SIZE + 1}`);
    const batch = problems.slice(i, i + UPLOAD_BATCH_SIZE);
    await dbAdapter.createProblems(batch, searchStringFn);
  }
}

export async function createProblemsFromCsv(csv: string, dbAdapter: DBAdapter) {
  const problems = await parseCsv(csv, Draft(Problem.strip()));
  await createProblems(problems, dbAdapter);
}

export async function queryProblems(query: string, dbAdapter: DBAdapter) {
  return dbAdapter.queryProblems(query, 25);
}
